import React, {useEffect, useState} from 'react';
import '../Orders/CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import {Link, useNavigate} from "react-router-dom";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import Loader from "../../components/calc/Loader";
import OneItemInTable from "../Storage/OneUnitInTable";
import ModalStorageRed from "../Storage/ModalStorageRed";
import ModalDeleteInStorage from "../Storage/ModalDeleteInStorage";
import UserForm from "./UserForm";
import {useDispatch} from "react-redux";
import Button from "react-bootstrap/Button";
import {translateColumnName} from "./translations";
import OneUnitInTable from "./OneUnitInTable";
import {buttonStyles, formStyles} from "./profile/styles";
import SlideInModal from "../userInNewUiArtem/SlideInModal";

// Основний компонент таблиці користувачів
const UsersCustomTable = ({name}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [thisItemForModal, setThisItemForModal] = useState(null);
    const [thisMetaItemForModal, setThisMetaItemForModal] = useState(null);
    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
    const [event, setEvent] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [inPageCount, setInPageCount] = useState(500);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);
    const dispatch = useDispatch();
    const [typeSelect, setTypeSelect] = useState("");
    const [thisColumn, setThisColumn] = useState({
        column: "id",
        reverse: false
    });
    const [expandedOrders, setExpandedOrders] = useState([]);
    const [showRed, setShowRed] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [show, setShow] = useState(false);

    const handleCloseAddUser = () => {
        setModalVisible(false);
    }

    // Функція для сортування колонок
    const setCol = (e) => {
        if (thisColumn.column === e) {
            setThisColumn({
                column: e,
                reverse: !thisColumn.reverse
            });
        } else {
            setThisColumn({
                column: e,
                reverse: false
            });
        }
    };

    // Функція для обробки кліку редагування
    const handleItemClickRed = (item, event, metaItem) => {
        setShowRed(true);
        setEvent(event);
        setThisItemForModal(item);
        setThisMetaItemForModal(metaItem);
    };

    // Функція для обробки кліку видалення
    const handleItemClickDelete2 = (item, event) => {
        setShowDeleteItemModal(true);
        setEvent(event);
        setThisItemForModal(item);
    };

    // Завантаження даних користувачів
    useEffect(() => {
        let requestData = {
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: typeSelect,
            columnName: thisColumn
        };
        setLoading(true);
        axios.post(`/user/All`, requestData)
            .then(response => {
                console.log(response.data);
                setData(response.data);
                setError(null);
                setLoading(false);
                setPageCount(Math.ceil(response.data.count / inPageCount));
            })
            .catch(error => {
                if (error.response && error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                console.log(error.message);
                setLoading(false);
            });
    }, [typeSelect, thisColumn, inPageCount, currentPage, navigate, show, showRed, modalVisible]);

    const toggleOrder = (orderId) => {
        if (expandedOrders.includes(orderId)) {
            setExpandedOrders(expandedOrders.filter(id => id !== orderId));
        } else {
            setExpandedOrders([...expandedOrders, orderId]);
        }
    };

    // Функція для визначення ширини колонок - ОБОВ'ЯЗКОВО повинна бути така сама, як у OneUnitInTable.jsx
    const getColumnWidth = (columnName) => {
        switch (columnName) {
            // Спільні колонки
            case 'id':
                return '2vw';
            case 'createdAt':
                return '7vw';
            case 'updatedAt':
                return '7vw';

            // Колонки користувачів
            case 'username':
                return '6vw';
            case 'firstName':
                return '6vw';
            case 'lastName':
                return '6vw';
            case 'familyName':
                return '6vw';
            case 'email':
                return '8vw';
            case 'phoneNumber':
                return '8vw';
            case 'role':
                return '4vw';
            case 'password':
                return '5vw';
            case 'lastLoginAt':
                return '2.8vw';
            case 'discount':
                return '3.2vw';
                case 'address':
                    return '10vw';

            // За замовчуванням
            default:
                return '3.955vw';
        }
    };

    if (data) {
        return (
            <div className="CustomOrderTable-order-list">
                <div className="CustomOrderTable-header">
                    {data.metadata.map((item, iter) => (
                        <div
                            style={{
                                background: "#F2F0E7",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.6rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "auto",
                                minHeight: "1vh",
                                boxSizing: "border-box",
                                textAlign: "center",
                                width: getColumnWidth(item),
                                maxWidth: getColumnWidth(item),
                                minWidth: getColumnWidth(item),
                                overflow: "hidden",
                                whiteSpace: "pre-line", // Додано для підтримки переносів
                                lineHeight: "1.7", // Збільшено для кращої читабельності
                                borderRadius: "0rem",
                            }}
                            className="CustomOrderTable-header-cell"
                            key={item + iter}
                            onClick={(event) => setCol(item)}
                        >
                            {item === thisColumn.column ? (
                                <div style={{
                                    display: 'flex',
                                    height: '4vh',
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    cursor: "pointer",
                                    borderRadius: "none",
                                }}>
                                    <span style={{whiteSpace: "pre-line",}}>{translateColumnName(item)}</span>
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
                                <span style={{whiteSpace: "pre-line",}}>{translateColumnName(item)}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="CustomOrderTable-body"
                     style={{
                         maxWidth: '99vw',
                         overflow: 'auto',
                         height: "82vh",
                         background: "transparent",
                         borderRadius: "0.5rem",
                         display: "flex",
                         flexDirection: "column",
                         width: "100%",


                     }}>
                    {data.rows.map((item, iter) => (
                        <div key={item.id} className="table-row-container">
                            <div className="CustomOrderTable-row" style={{}}>
                                {data.metadata.map((metaItem, iter2) => (
                                    <>
                                        {metaItem === "lastLoginAt" ? (
                                            <Link className="CustomOrderTable-cell statusEnabled"
                                                  style={{
                                                      textDecoration: 'none',
                                                      width: getColumnWidth(metaItem),
                                                      minWidth: getColumnWidth(metaItem),
                                                      maxWidth: getColumnWidth(metaItem),
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                      height: "auto",
                                                      minHeight: "2vh",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      fontSize: "1rem",
                                                      boxSizing: "border-box",
                                                      textAlign: "center",
                                                      // background: "#FBFAF6",
                                                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                                  }}
                                                  to={`/client/${item.id}`}
                                            >
                                                <div className="" style={{
                                                    background: "transparent",
                                                    color: "#c1a537",
                                                }}>
                                                    ⋮
                                                </div>
                                            </Link>
                                        ) : (
                                            <OneUnitInTable
                                                key={`${item.id}${iter}${iter2}`}
                                                item={item}
                                                metaItem={metaItem}
                                                itemData={item[metaItem]}
                                                tablPosition={metaItem}
                                                handleItemClickRed={handleItemClickRed}
                                            />
                                        )}
                                    </>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="controls-row">
                    <div className="pagination-container">
                        <PaginationMy
                            name={"User"}
                            data={data}
                            setData={setData}
                            inPageCount={inPageCount}
                            setInPageCount={setInPageCount}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pageCount={pageCount}
                            setPageCount={setPageCount}
                            typeSelect={typeSelect}
                            url={"/user/All"}
                            thisColumn={thisColumn}
                        />
                    </div>
                    <div className="right-group" style={{display: "flex", alignItems: "center"}}>
                        {/*<UserForm*/}
                        {/*    data={data}*/}
                        {/*    setData={setData}*/}
                        {/*    selectedUser={selectedUser}*/}
                        {/*    setSelectedUser={setSelectedUser}*/}
                        {/*    show={show}*/}
                        {/*    setShow={setShow}*/}
                        {/*/>*/}
                        <SlideInModal
                            show={modalVisible}
                            handleCloseAddUser={handleCloseAddUser}
                            title="Додавання клієнта"
                        />

                        <Button className="adminButtonAdd" variant="danger" onClick={() => setModalVisible(true)}>
                            {selectedUser ? "Редагувати користувача" : "Додати користувача"}
                        </Button>


                    </div>
                </div>

                {showRed && (
                    <ModalStorageRed
                        dataTypeInTable={"string"}
                        setShowRed={setShowRed}
                        showRed={showRed}
                        event={event}
                        setEvent={setEvent}
                        setShowDeleteItemModal={setShowDeleteItemModal}
                        showDeleteItemModal={showDeleteItemModal}
                        thisItemForModal={thisItemForModal}
                        setThisItemForModal={setThisItemForModal}
                        tableName={name}
                        typeSelect={typeSelect}
                        thisColumn={thisColumn}
                        data={data}
                        thisMetaItemForModal={thisMetaItemForModal}
                        setData={setData}
                        inPageCount={inPageCount}
                        setInPageCount={setInPageCount}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageCount={pageCount}
                        setPageCount={setPageCount}
                        url={`/user/OnlyOneField`}
                    />
                )}

                {showDeleteItemModal && (
                    <ModalDeleteInStorage
                        showDeleteItemModal={showDeleteItemModal}
                        setShowDeleteItemModal={setShowDeleteItemModal}
                        thisItemForModal={thisItemForModal}
                        setThisItemForModal={setThisItemForModal}
                        data={data}
                        setData={setData}
                        url={"/user/All"}
                    />
                )}
            </div>
        );
    }

    if (error) {
        return (
            <h1 className="d-flex justify-content-center align-items-center">
                {error}
            </h1>
        );
    }

    return (
        <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
        </h1>
    );
};

export default UsersCustomTable;