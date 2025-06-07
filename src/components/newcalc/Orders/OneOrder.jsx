import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import CrmHeader from "../../admin/crm/CrmHeader";
import {Table} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import Loader from "../../calc/Loader";
import Desktop from "../../admin/crm/Desktop/Desktop";
import SelectedProduct from "../../admin/crm/CrmCash/products/SelectedProduct";
import OneProductInOrders from "./OneProductInOrders";

const OneOrder = () => {
    const [data, setData] = useState(null);
    const [pageCount, setPageCount] = useState(null);
    const { id } = useParams();
    // console.log(id);

    useEffect(() => {
        let data = {
            name: "OneOrder",
            id:id
        }
        axios.post(`/api/order/get`, data)
            .then(response => {
                // console.log(response.data);
                setData(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    if (data) {
        return (
            <div className="d-flex flex-column">
                <div className="d-flex">
                    <div className="border-1 border-light border d-flex flex-column p-3" style={{width: "30%"}}>
                        <div className="text-center">
                            Дані:
                        </div>
                        <div className="m-1 p-1 btn btn-light">id: {data.id}</div>
                        <div className="m-1 p-1 btn btn-light">Хто робив: {data.executorId}</div>
                        <div className="m-1 p-1 btn btn-light">На якого юзера: {data.userid}</div>
                        <div className="m-1 p-1 btn btn-light">Ціна: {data.price}</div>
                        <div className="m-1 p-1 btn btn-light">createdAt: {data.createdAt}</div>
                        <div className="m-1 p-1 btn btn-light">updatedAt: {data.updatedAt}</div>
                    </div>
                    <div className="border-1 border-light " style={{width: "70%"}}>
                        <div className="text-center">
                            Складається з:
                        </div>
                        {data.orderunits.map((orderUnit, iter3) => (
                            <div className="btn btn-light d-flex " key={iter3}>
                                <div className="adminFontTable p-1 m-1 bg-light">id: {orderUnit.id}.</div>
                                <div className="adminFontTable p-1 m-1 bg-light">Назва: {orderUnit.name}.</div>
                                {orderUnit.orderunitunits &&
                                    <div>
                                        {orderUnit.orderunitunits.length !== 0 &&
                                            <div className="adminFontTable">
                                                <OneProductInOrders item={orderUnit}/>
                                            </div>
                                        }
                                    </div>
                                }
                                <div className="adminFontTable p-1 m-1 bg-light">Кількість {orderUnit.amount} шт.</div>
                                <div
                                    className="adminFontTable p-1 m-1 bg-warning">Коштує(1): {orderUnit.priceForOneThis}грн.
                                </div>
                                <div
                                    className="adminFontTable p-1 m-1 bg-warning">Коштує({orderUnit.amount}шт.): {orderUnit.priceForOneThis * orderUnit.amount}грн.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Link className="d-flex align-content-center align-items-center text-decoration-none m-1 p-1" to={`/Cash/${data.id}`}>
                    <div className="btn btn-lg btn-danger m-auto">
                        До касси =>
                    </div>
                </Link>
            </div>
        )
    }

    return (
        <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
        </h1>
    )
};

export default OneOrder;