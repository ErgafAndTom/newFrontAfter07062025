import React, {useEffect, useState} from 'react';
import './CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";
import {Link, useNavigate} from "react-router-dom";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import Loader from "../../components/calc/Loader";
import AddNewOrder from "./AddNewOrder";
import ModalDeleteOrder from "./ModalDeleteOrder";
import FiltrOrders from "./FiltrOrders";
import {Spinner} from "react-bootstrap";
import Barcode from 'react-barcode';
import {translateColumnName} from "../user/translations";
import NewSheetCutBw from "../poslugi/NewSheetCutBw";
import UserForm from "../user/UserForm";

// Основний компонент CustomOrderTable
const CustomOrderTable2 = () => {
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statuses, setStatuses] = useState({
        status0: true,
        status1: true,
        status2: true,
        status3: true,
        status4: true,
        status5: true,
    });
    const [expandedOrders, setExpandedOrders] = useState([]);

    const handleOrderClickDelete = (Order) => {
        setShowDeleteOrderModal(true);
        setThisOrderForDelete(Order);
    };

    const setCol = (e) => {
        if (thisColumn.column === e) {
            setThisColumn({
                column: e,
                reverse: !thisColumn.reverse
            })
        } else {
            setThisColumn({
                column: e,
                reverse: false
            })
        }
    }

    useEffect(() => {
        let data = {
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: typeSelect,
            columnName: thisColumn,
            startDate: startDate,
            endDate: endDate,
            statuses: statuses,
        };
        setLoading(true);
        axios.post(`/orders/all`, data)
            .then(response => {
                console.log("Orders data:", response.data);
                setData(response.data);
                setError(null);
                setLoading(false);
                setPageCount(Math.ceil(response.data.count / inPageCount));
            })
            .catch(error => {
                if (error.response?.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                setLoading(false);
            });
    }, [typeSelect, thisColumn, startDate, endDate, statuses,]);

    const toggleOrder = (orderId) => {
        if (expandedOrders.includes(orderId)) {
            setExpandedOrders(expandedOrders.filter(id => id !== orderId));
        } else {
            setExpandedOrders([...expandedOrders, orderId]);
        }
    };

    return (
        <div className="CustomOrderTable-order-list">
            {/*<AddNewOrder*/}
            {/*    namem={"Order"}*/}
            {/*    data={data}*/}
            {/*    setData={setData}*/}
            {/*    inPageCount={inPageCount}*/}
            {/*    setInPageCount={setInPageCount}*/}
            {/*    currentPage={currentPage}*/}
            {/*    setCurrentPage={setCurrentPage}*/}
            {/*    pageCount={pageCount}*/}
            {/*    setPageCount={setPageCount}*/}
            {/*/>*/}
            <div className="CustomOrderTable-preHeader">
                <FiltrOrders
                    typeSelect={typeSelect}
                    setTypeSelect={setTypeSelect}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    startDate={startDate}
                    endDate={endDate}
                    statuses={statuses}
                    setStatuses={setStatuses}
                />
            </div>
            <div className="CustomOrderTable-order-list">
                <div className="CustomOrderTable-header">
                    {/* Використання класів для відображення заголовків, як у HTML */}
                    <div className="CustomOrderTable2-header-cell CustomOrderTable-left-rounded" style={{width: '2vw'}}
                         onClick={(event) => setCol("id")}>
                        {"id" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"ID"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"ID"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '4vw'}}>Розгорнути
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '4vw'}}>Штрих-код
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("status")}>
                        {"status" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Статус"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Статус"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '4vw'}}>Фото
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '8vw'}}>Клієнт
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '8vw'}}>Номер телефона
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '5vw'}}>Telegram
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("allPrice")}>
                        {"allPrice" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Вартість"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Вартість"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("payStatus")}>
                        {"payStatus" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Статус оплати"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Статус оплати"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("createdAt")}>
                        {"createdAt" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Дата створення"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Дата створення"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("updatedAt")}>
                        {"updatedAt" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Дата оновлення"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Дата оновлення"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("manufacturingStartTime")}>
                        {"manufacturingStartTime" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Час початку"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Час початку"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell" style={{width: '5vw'}}
                         onClick={(event) => setCol("totalManufacturingTimeSeconds")}>
                        {"totalManufacturingTimeSeconds" === thisColumn.column ? (
                            <div style={{
                                display: 'flex',
                                height: '4vh',
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                cursor: "pointer",
                                borderRadius: "none",
                            }}>
                                <span style={{whiteSpace: "pre-line"}}>{"Час виготовлення"}</span>
                                <span style={{
                                    color: "#FAB416",
                                    fontSize: "1.2rem",
                                    position: 'relative',
                                    right: "-0.2rem",
                                    cursor: "pointer",
                                    whiteSpace: "pre-line"
                                }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                            </div>
                        ) : (
                            <span style={{whiteSpace: "pre-line"}}>{"Час виготовлення"}</span>
                        )}
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '5vw'}}>deadline
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '8vw'}}>Відповідальний
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '5vw'}}>До каси
                    </div>
                    <div className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell"
                         style={{width: '5vw'}}>Зробити рахунок
                    </div>
                    <div
                        className="CustomOrderTable2-header-cell disabled-CustomOrderTable2-header-cell CustomOrderTable-right-rounded"
                        style={{width: '5vw'}}>Видалити
                    </div>
                </div>
                <div className="CustomOrderTable-body">
                    {error && (
                        <div>{error}</div>
                    )}
                    {loading && (
                        <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}>
                            <Spinner animation="border" className="mainLoader" variant="dark"/></div>
                    )}
                    {data && (
                        <>
                            {data.rows.map(order => {
                                const isExpanded = expandedOrders.includes(order.id);
                                return (
                                    <div key={order.id}>
                                        <div className="CustomOrderTable-row">
                                            {/* Використання класів відповідно до HTML */}
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '2vw'}}>{order.id}</div>
                                            <div className="CustomOrderTable-cell" style={{width: '4vw'}}>
                                                <button
                                                    className="toggle-btn CustomOrderTable-toggle-btn"  // Використання існуючого класу з HTML
                                                    onClick={() => toggleOrder(order.id)}
                                                >
                                                    {isExpanded ? 'Згорнути' : 'Розгорнути'}
                                                </button>
                                            </div>
                                            <div
                                                className="CustomOrderTable-cell d-flex align-items-center justify-content-center"
                                                style={{width: '4vw'}}>
                                                {/*{order.barcode || '—'}*/}

                                                {order.barcode ? (
                                                    <Barcode
                                                        className="d-flex align-items-center justify-content-center"
                                                        value={order.barcode.toString()}
                                                        width={0.4}
                                                        margin={0}
                                                        padding={0}
                                                        format="CODE128"
                                                        fontSize={7}
                                                        lineColor="#000"
                                                        height={15}
                                                        displayValue={true}
                                                        background=""
                                                    />
                                                ) : (
                                                    '—'
                                                )}

                                            </div>
                                            <div className="CustomOrderTable-cell" style={{width: '5vw'}}>
                                                <div className="" style={{background: "transparent"}}>
                                                    <StatusBar item={order}/>
                                                </div>
                                            </div>
                                            <div className="CustomOrderTable-cell" style={{width: '4vw'}}>
                                                {order.client ? (
                                                    <>
                                                        {order.client.photoLink ? (
                                                            <img
                                                                src={order.client.photoLink}
                                                                alt="Фото замовлення"
                                                                className="CustomOrderTable-photo"
                                                            />
                                                        ) : (
                                                            'Фото'
                                                        )}
                                                    </>
                                                ) : (
                                                    <div>—</div>
                                                )}
                                            </div>
                                            {order.client ? (
                                                <div className="CustomOrderTable-cell"
                                                     style={{width: '8vw'}}>{`${order.client.firstName} ${order.client.lastName} ${order.client.familyName}`}</div>
                                            ) : (
                                                <div className="CustomOrderTable-cell" style={{width: '8vw'}}>—</div>
                                            )}
                                            {order.client ? (
                                                <div className="CustomOrderTable-cell"
                                                     style={{width: '8vw'}}>{order.client.phoneNumber}</div>
                                            ) : (
                                                <div className="CustomOrderTable-cell" style={{width: '8vw'}}>—</div>
                                            )}
                                            {order.client ? (
                                                <div className="CustomOrderTable-cell" style={{width: '5vw'}}>
                                                    {order.client.telegram ? (
                                                        <a
                                                            href={order.client.telegram}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="CustomOrderTable-telegram-link"
                                                        >
                                                            @{order.client.username}
                                                        </a>
                                                    ) : (
                                                        <div>—</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="CustomOrderTable-cell" style={{width: '5vw'}}>—</div>
                                            )}
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw'}}>{order.price} грн
                                            </div>
                                            <div className="CustomOrderTable-cell" style={{width: '5vw'}}>
                                                <div
                                                    className={`pay-btn d-flex align-content-center justify-content-center ${
                                                        order.payStatus === 'pay'
                                                            ? 'CustomOrderTable-pay-paid'
                                                            : 'CustomOrderTable-pay-pending'
                                                    }`}
                                                >
                                                    {order.payStatus || 'Не оплачено'}
                                                </div>
                                            </div>
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw', fontSize: '0.5rem'}}>
                                                {`${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}`}
                                            </div>
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw', fontSize: '0.5rem'}}>
                                                {order.updatedAt
                                                    ? `${new Date(order.updatedAt).toLocaleDateString()} ${new Date(order.updatedAt).toLocaleTimeString()}`
                                                    : '—'}
                                            </div>
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw', fontSize: '0.5rem'}}>
                                                {order.manufacturingStartTime
                                                    ? `${new Date(order.manufacturingStartTime).toLocaleDateString()} ${new Date(order.manufacturingStartTime).toLocaleTimeString()}`
                                                    : '—'}
                                            </div>
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw', fontSize: '0.5rem'}}>
                                                {order.finalManufacturingTime
                                                    ? `${order.finalManufacturingTime.days}д ${order.finalManufacturingTime.hours}год ${order.finalManufacturingTime.minutes}хв ${order.finalManufacturingTime.seconds}сек`
                                                    : order.manufacturingStartTime
                                                        ? 'В процесі'
                                                        : '—'}
                                            </div>
                                            <div className="CustomOrderTable-cell"
                                                 style={{width: '5vw', fontSize: '0.5rem'}}>
                                                {order.deadline
                                                    ? `${new Date(order.deadline).toLocaleDateString()} ${new Date(order.deadline).toLocaleTimeString()}`
                                                    : '—'}
                                            </div>
                                            {order.executor ? (
                                                <div className="CustomOrderTable-cell"
                                                     style={{width: '8vw'}}>{`${order.executor.firstName} ${order.executor.lastName} ${order.executor.familyName}`}</div>
                                            ) : (
                                                <div className="CustomOrderTable-cell" style={{width: '8vw'}}>—</div>
                                            )}
                                            <div className="CustomOrderTable-cell" style={{width: '5vw'}}>
                                                <Link to={`/Orders/${order.id}`}>
                                                    <button className="kassa-btn CustomOrderTable-toggle-btn">До каси
                                                    </button>
                                                    {/* Залишаємо клас "kassa-btn" */}
                                                </Link>
                                            </div>
                                            <div className="CustomOrderTable-cell" style={{width: '5vw'}}>
                                                <button className="CustomOrderTable-toggle-btn">Рахунок</button>
                                                {/* Залишаємо клас "invoice-btn" */}
                                            </div>
                                            <div className="CustomOrderTable-cell" style={{width: '4.6vw'}}>
                                                <button
                                                    className="CustomOrderTable-toggle-btn CustomOrderTable-delete-btn" // Використання існуючого класу з HTML
                                                    onClick={(e) => handleOrderClickDelete(order)}
                                                >Видалити
                                                </button>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="CustomOrderTable-order-details">
                                                <div
                                                    className="CustomOrderTable-order-units d-flex align-content-around justify-content-around">
                                                    {order.OrderUnits.length > 0 ? (
                                                        order.OrderUnits.map((orderUnit, index) => (
                                                            <div key={index} style={{}}
                                                                 className="sub-order d-flex flex-column align-content-between justify-content-between">
                                                                <p className="adminFont"><strong>№
                                                                    підзамовлення:</strong> {orderUnit.idKey || '—'}</p>
                                                                <p className="adminFont"><strong>Поточний
                                                                    статус:</strong> {orderUnit.status}</p>
                                                                <p className="adminFont"><strong>Тип
                                                                    продукції:</strong> {orderUnit.type} {orderUnit.typeUse}
                                                                </p>
                                                                <p className="adminFont">
                                                                    <strong>Назва:</strong> {orderUnit.name}</p>
                                                                <p className="adminFont">
                                                                    <strong>Кількість:</strong> {orderUnit.name}</p>
                                                                <p className="adminFont"><strong>Ціна за
                                                                    одиницю:</strong> {orderUnit.newField5}</p>
                                                                <p className="adminFont">
                                                                    <strong>Вартість:</strong> {orderUnit.priceForThis} грн
                                                                </p>
                                                                <p className="adminFont">
                                                                    <strong>Розмір:</strong> {`${orderUnit.newField2} x ${orderUnit.newField3}`} мм
                                                                </p>
                                                                <p className="adminFont">Використано
                                                                    аркушів: <strong>{orderUnit.newField5} шт</strong>
                                                                </p>
                                                                <p className="adminFont"><strong>Кількість виробів на
                                                                    аркуші:</strong> {orderUnit.newField4} шт</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="sub-order">Единиц заказа відсутні</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            <div className="controls-row">
                <div className="pagination-container">
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
            </div>
            <ModalDeleteOrder
                showDeleteOrderModal={showDeleteOrderModal}
                setShowDeleteOrderModal={setShowDeleteOrderModal}
                thisOrderForDelete={thisOrderForDelete}
                setThisOrderForDelete={setThisOrderForDelete}
                data={data}
                setData={setData}
                url={"/orders/OneOrder/"}
            />
        </div>
    );
    // if (error) {
    //     return (
    //         <h1 className="d-flex justify-content-center align-items-center">
    //             {error}
    //         </h1>
    //     );
    // }
    // return (
    //     <h1 className="d-flex justify-content-center align-items-center">
    //         <Loader />
    //     </h1>
    // );
};

export default CustomOrderTable2;
