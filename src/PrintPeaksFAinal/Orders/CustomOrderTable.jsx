// CustomOrderTable.jsx
import React, {useEffect, useState} from 'react';
import './CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";
import {Link, Navigate, redirect, useNavigate} from "react-router-dom";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import Loader from "../../components/calc/Loader";
import AddNewOrder from "./AddNewOrder";
import ModalDeleteOrder from "./ModalDeleteOrder";

// Основний компонент CustomOrderTable
const CustomOrderTable = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
    const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [inPageCount, setInPageCount] = useState(500);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);
    const [typeSelect, setTypeSelect] = useState("");
    const [thisColumn, setThisColumn] = useState({
        column: "id",
        reverse: true
    });
    const [thisColumnR, setThisColumnR] = useState("ASC");
    const [expandedOrders, setExpandedOrders] = useState([]);

    const handleOrderClickDelete2 = (Order) => {
        setShowDeleteOrderModal(true)
        setThisOrderForDelete(Order)
    };

    useEffect(() => {
        let data = {
            // name: "Orders",
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: typeSelect,
            columnName: thisColumn
        }
        setLoading(true)
        axios.post(`/orders/all`, data)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                setError(null)
                setLoading(false)
                setPageCount(Math.ceil(response.data.count / inPageCount))
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message)
                console.log(error.message);
            })
    }, [typeSelect, thisColumn]);

    const toggleOrder = (orderId) => {
        if (expandedOrders.includes(orderId)) {
            setExpandedOrders(expandedOrders.filter(id => id !== orderId));
        } else {
            setExpandedOrders([...expandedOrders, orderId]);
        }
    };

    if (data) {
        return (
            <div className="CustomOrderTable-order-list">
                <AddNewOrder
                    namem={"Order"}
                    data={data}
                    setData={setData}
                    inPageCount={inPageCount}
                    setInPageCount={setInPageCount}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                    setPageCount={setPageCount}
                />
                <div className="CustomOrderTable-header">
                    <div className="CustomOrderTable-header-cell CustomOrderTable-left-rounded">№ замовлення</div>
                    <div className="CustomOrderTable-header-cell">Розгорнути</div>
                    <div className="CustomOrderTable-header-cell">Штрих-код</div>
                    <div className="CustomOrderTable-header-cell">Поточний статус</div>
                    <div className="CustomOrderTable-header-cell">Фото</div>
                    <div className="CustomOrderTable-header-cell">Клієнт</div>
                    <div className="CustomOrderTable-header-cell">Номер телефона</div>
                    <div className="CustomOrderTable-header-cell">Telegram</div>
                    <div className="CustomOrderTable-header-cell">Вартість</div>
                    <div className="CustomOrderTable-header-cell">Статус оплати</div>
                    <div className="CustomOrderTable-header-cell">Дата створення</div>
                    <div className="CustomOrderTable-header-cell">Дата завершення</div>
                    <div className="CustomOrderTable-header-cell">Відповідальний</div>
                    <div className="CustomOrderTable-header-cell">До каси</div>
                    <div className="CustomOrderTable-header-cell">Зробити рахунок</div>
                    <div className="CustomOrderTable-header-cell CustomOrderTable-right-rounded">Видалити</div>
                </div>
                <div className="CustomOrderTable-body">
                    {data.rows.map(order => {
                        const isExpanded = expandedOrders.includes(order.id);
                        return (
                            <div key={order.id}>
                                <div className="CustomOrderTable-row">
                                    <div className="CustomOrderTable-cell">{order.id}</div>
                                    <div className="CustomOrderTable-cell">
                                        <button
                                            className="CustomOrderTable-toggle-btn"
                                            onClick={() => toggleOrder(order.id)}
                                        >
                                            {isExpanded ? 'Згорнути' : 'Розгорнути'}
                                        </button>
                                    </div>
                                    <div className="CustomOrderTable-cell">{order.barcode || '—'}</div>
                                    <div className="CustomOrderTable-cell">
                                        <div className="" style={{background: "transparent"}}>
                                            <StatusBar item={order}/>
                                        </div>
                                    </div>
                                    <div className="CustomOrderTable-cell">
                                        {order.User.photoLink ? (
                                            <img
                                                src={order.User.photoLink}
                                                alt="Фото замовлення"
                                                className="CustomOrderTable-photo"
                                            />
                                        ) : (
                                            'Фото'
                                        )}
                                    </div>
                                    <div
                                        className="CustomOrderTable-cell">{`${order.User.firstName} ${order.User.lastName} ${order.User.familyName}`}</div>
                                    <div className="CustomOrderTable-cell">{order.User.phoneNumber}</div>
                                    <div className="CustomOrderTable-cell">
                                        {order.User.telegram ? (
                                            <a
                                                href={order.User.telegram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="CustomOrderTable-telegram-link"
                                            >
                                                @{order.User.username}
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </div>
                                    <div className="CustomOrderTable-cell">{order.price} грн</div>
                                    <div className="CustomOrderTable-cell">
                                        <div
                                            className={`CustomOrderTable-pay-btn ${
                                                order.payStatus === 'Оплачено'
                                                    ? 'CustomOrderTable-pay-paid'
                                                    : 'CustomOrderTable-pay-pending'
                                            }`}
                                        >
                                            {order.payStatus || 'Не оплачено'}
                                        </div>
                                    </div>
                                    <div className="CustomOrderTable-cell">
                                        {`${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}`}
                                    </div>
                                    <div className="CustomOrderTable-cell">
                                        {order.updatedAt
                                            ? `${new Date(order.updatedAt).toLocaleDateString()} ${new Date(order.updatedAt).toLocaleTimeString()}`
                                            : '—'}
                                    </div>
                                    <div
                                        className="CustomOrderTable-cell">{`${order.User.firstName} ${order.User.lastName}`}</div>
                                    <div className="CustomOrderTable-cell">
                                        <Link to={`/Orders/${order.id}`}>
                                            <button className="CustomOrderTable-kassa-btn">До каси</button>
                                        </Link>
                                    </div>
                                    <div className="CustomOrderTable-cell">
                                        <button className="CustomOrderTable-invoice-btn">
                                            +
                                        </button>
                                    </div>
                                    <div className="CustomOrderTable-cell">
                                        <button
                                            className="CustomOrderTable-delete-btn"
                                            onClick={(e) => handleOrderClickDelete2(order)}
                                        >-
                                        </button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="CustomOrderTable-order-details">
                                        <div className="CustomOrderTable-order-units">
                                            {order.OrderUnits.length > 0 ? (
                                                order.OrderUnits.map((orderUnit, index) => (
                                                    <OrderUnit key={index} orderUnit={orderUnit}/>
                                                ))
                                            ) : (
                                                <div className="CustomOrderTable-no-order-units">
                                                    Единиц заказа відсутні
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <ModalDeleteOrder
                    showDeleteOrderModal={showDeleteOrderModal}
                    setShowDeleteOrderModal={setShowDeleteOrderModal}
                    thisOrderForDelete={thisOrderForDelete}
                    setThisOrderForDelete={setThisOrderForDelete}
                    data={data}
                    setData={setData}
                />
                <PaginationMy
                    name={"Order"}
                    data={data}
                    setData={setData}
                    inPageCount={inPageCount}
                    setInPageCount={setInPageCount}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                    setPageCount={setPageCount}
                    typeSelect={typeSelect}
                    url={"/orders/all"}
                    thisColumn={thisColumn}
                />
            </div>
        );
    }
    if (error) {
        return (
            <h1 className="d-flex justify-content-center align-items-center">
                {error}
            </h1>
        )
    }
    return (
        <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
        </h1>
    )
};

// Компонент для отображения деталей OrderUnitUnit
const OrderUnitUnit = ({unit, index, orderUnit}) => {
    return (
        <div className="d-flex adminFontTable">
            <div className="adminFontTable d-flex shadow-sm " style={{
                borderBottom: "2 vh",
                margin: "0.3vw",
                borderRadius: "0.7vw"
            }}>
                <div className="adminFontTable p-1"
                     style={{
                         fontSize: "0.5vw",
                         alignItems: "center",
                         marginTop: "0.6vh"
                     }}>{index + 1}</div>
                <div className="adminFontTable">{unit.name}</div>
                <div className="adminFontTable">{unit.quantity}</div>
                <div className="adminFontTable" style={{marginTop: "0.5vw", fontSize: "0.5vw"}}> шт</div>
                <div className="adminFontTable">x</div>
                <div className="adminFontTable">{unit.priceForOneThis}</div>
                <div className="adminFontTable" style={{marginTop: "0.5vw", fontSize: "0.5vw"}}>грн</div>
                <div className="adminFontTable">=</div>
                <div
                    className="adminFontTable ">{unit.priceForThis} </div>
                <div className="adminFontTable " style={{marginTop: "0.5vw", fontSize: "0.5vw"}}>грн</div>
            </div>
        </div>
    );
};

// Компонент для відображення деталей OrderUnit
const OrderUnit = ({orderUnit}) => {
    const [expandedUnit, setExpandedUnit] = useState(false);

    const toggleUnit = () => {
        setExpandedUnit(!expandedUnit);
    };

    return (
        <div className="CustomOrderTable-order-unit">
            <div className="CustomOrderTable-order-unit-header" onClick={toggleUnit}>
                <div><strong>№ підзамовлення:</strong> {orderUnit.idKey || '—'}</div>
                <div><strong>Назва:</strong> {orderUnit.name}</div>
                <div><strong>Вартість:</strong> {orderUnit.priceForThis} грн</div>
                <div><strong>Розмір:</strong> {`${orderUnit.newField2} x ${orderUnit.newField3}`} мм</div>
                <div><strong>Кількість:</strong> {orderUnit.amount || orderUnit.quantity || '—'} шт</div>
                <button className="CustomOrderTable-toggle-unit-btn">
                    {expandedUnit ? 'Згорнути' : 'Розгорнути'}
                </button>
            </div>
            {expandedUnit && orderUnit.OrderUnitUnits.length > 0 && (
                <div className="CustomOrderTable-order-unit-units">
                    {orderUnit.OrderUnitUnits.map((unit, index) => (
                        <OrderUnitUnit key={index} unit={unit} index={index} orderUnit={orderUnit}/>
                    ))}
                    <div className="d-flex">
                        <div
                            className="d-flex justify-content-center adminFontTable align-items-last"
                            style={{marginLeft: "1.5vw"}}>На
                            аркуші міститься: {orderUnit.amountCanPushToOneList} виробів
                        </div>
                        <div
                            className="d-flex justify-content-self-end adminFontTable"
                            style={{marginLeft: "1.5vw", width: "15vw"}}>
                            > Використано: {orderUnit.amountListForOne} аркушів
                        </div>
                    </div>
                </div>
            )}
            {expandedUnit && orderUnit.OrderUnitUnits.length === 0 && (
                <div className="CustomOrderTable-no-unit-units">Додаткові деталі відсутні</div>
            )}
        </div>
    );
};

export default CustomOrderTable;

