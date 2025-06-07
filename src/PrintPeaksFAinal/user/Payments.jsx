import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import '../Orders/CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "../Orders/StatusBar";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";
import FiltrOrders from "../Orders/FiltrOrders";
import {Spinner} from "react-bootstrap";
import Barcode from 'react-barcode';

// Основний компонент CustomOrderTable
const Payments = () => {
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
        };
        setLoading(true);
        axios.post(`/user/getMyPayments`, data)
            .then(response => {
                // console.log(response.data);
                setData(response.data);
                setError(null);
                setLoading(false);
                setPageCount(Math.ceil(response.data.count / inPageCount));
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                setLoading(false);
            });
    }, [typeSelect, thisColumn, startDate, endDate]);

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
            <div className="CustomOrderTable-containerOfTable">
                <div className="CustomOrderTable-header">
                    {/* Використання класів для відображення заголовків, як у HTML */}
                    <div className="CustomOrderTable-header-cell CustomOrderTable-left-rounded"
                         onClick={(event) => setCol("id")}>
                        {"id" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"№ замовлення"}
                                    </>
                                ) : (
                                    <>
                                        !^{"№ замовлення"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"№ замовлення"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("userId")}>
                        {"userId" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"userId"}
                                    </>
                                ) : (
                                    <>
                                        !^{"userId"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"userId"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("type")}>
                        {"type" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"Тип"}
                                    </>
                                ) : (
                                    <>
                                        !^{"Тип"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"Тип"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("value")}>
                        {"value" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"номер"}
                                    </>
                                ) : (
                                    <>
                                        !^{"номер"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"номер"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("currency")}>
                        {"currency" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"Валюта"}
                                    </>
                                ) : (
                                    <>
                                        !^{"Валюта"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"Валюта"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("status")}>
                        {"status" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"status"}
                                    </>
                                ) : (
                                    <>
                                        !^{"status"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"status"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("cardHolderName")}>
                        {"cardHolderName" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"cardHolderName"}
                                    </>
                                ) : (
                                    <>
                                        !^{"cardHolderName"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"cardHolderName"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("cardExpiry")}>
                        {"cardExpiry" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"cardExpiry"}
                                    </>
                                ) : (
                                    <>
                                        !^{"cardExpiry"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"cardExpiry"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("bankName")}>
                        {"bankName" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"bankName"}
                                    </>
                                ) : (
                                    <>
                                        !^{"bankName"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"bankName"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("bankAccountNumber")}>
                        {"bankAccountNumber" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"bankAccountNumber"}
                                    </>
                                ) : (
                                    <>
                                        !^{"bankAccountNumber"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"bankAccountNumber"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("bankMFO")}>
                        {"bankMFO" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"bankMFO"}
                                    </>
                                ) : (
                                    <>
                                        !^{"bankMFO"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"bankMFO"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("fopName")}>
                        {"fopName" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"fopName"}
                                    </>
                                ) : (
                                    <>
                                        !^{"fopName"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"fopName"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("fopNumber")}>
                        {"fopNumber" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"fopNumber"}
                                    </>
                                ) : (
                                    <>
                                        !^{"fopNumber"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"fopNumber"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("edrpouCode")}>
                        {"edrpouCode" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"edrpouCode"}
                                    </>
                                ) : (
                                    <>
                                        !^{"edrpouCode"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"edrpouCode"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("legalEntityId")}>
                        {"legalEntityId" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"legalEntityId"}
                                    </>
                                ) : (
                                    <>
                                        !^{"legalEntityId"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"legalEntityId"}
                            </>
                        )}
                    </div>


                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("createdAt")}>
                        {"createdAt" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"Дата створення"}
                                    </>
                                ) : (
                                    <>
                                        !^{"Дата створення"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"Дата створення"}
                            </>
                        )}
                    </div>
                    <div className="CustomOrderTable-header-cell" onClick={(event) => setCol("updatedAt")}>
                        {"updatedAt" === thisColumn.column ? (
                            <>
                                {!thisColumn.reverse ? (
                                    <>
                                        ^{"Дата оновлення"}
                                    </>
                                ) : (
                                    <>
                                        !^{"Дата оновлення"}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {"Дата оновлення"}
                            </>
                        )}
                    </div>
                </div>
                <div className="CustomOrderTable-body">
                    {error && (
                        <div>{error}</div>
                    )}
                    {loading && (
                        <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}><Spinner animation="border" className="mainLoader" variant="dark" /></div>
                    )}
                    {data && (
                        <>
                            {data.rows.map(order => {
                                return (
                                    <div key={order.id}>
                                        <div className="CustomOrderTable-row">
                                            {/* Використання класів відповідно до HTML */}
                                            <div className="CustomOrderTable-cell">{order.id}</div>
                                            <div className="CustomOrderTable-cell">{order.userId}</div>
                                            <div className="CustomOrderTable-cell">{order.type}</div>
                                            <div className="CustomOrderTable-cell">{order.value}</div>
                                            <div className="CustomOrderTable-cell">{order.currency}</div>
                                            <div className="CustomOrderTable-cell">{order.status}</div>
                                            <div className="CustomOrderTable-cell">{order.cardHolderName}</div>
                                            <div className="CustomOrderTable-cell">{order.cardExpiry}</div>
                                            <div className="CustomOrderTable-cell">{order.bankName}</div>
                                            <div className="CustomOrderTable-cell">{order.bankAccountNumber}</div>
                                            <div className="CustomOrderTable-cell">{order.bankMFO}</div>
                                            <div className="CustomOrderTable-cell">{order.fopName}</div>
                                            <div className="CustomOrderTable-cell">{order.fopNumber}</div>
                                            <div className="CustomOrderTable-cell">{order.edrpouCode}</div>
                                            <div className="CustomOrderTable-cell">{order.legalEntityId}</div>
                                            <div className="CustomOrderTable-cell">
                                                {`${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}`}
                                            </div>
                                            <div className="CustomOrderTable-cell">
                                                {order.updatedAt ? `${new Date(order.updatedAt).toLocaleDateString()} ${new Date(order.updatedAt).toLocaleTimeString()}` : '—'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
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
                url={"/user/getPayments"}
                thisColumn={thisColumn}
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

export default Payments;
