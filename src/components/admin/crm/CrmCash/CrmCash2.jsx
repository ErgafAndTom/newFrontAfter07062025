import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import './CrmCash.css';
import Form from "react-bootstrap/Form";
import NewChartMy2 from "../../../NewChartMy2";
import Loader from "../../../calc/Loader";
import CardProduct from "../Products/CardProduct";
import SelectedProduct from "./products/SelectedProduct";
import Button from "react-bootstrap/Button";
import OverlayGetResponseForAnswer from "../../../OverlayGetResponseForAnswer";
import {Link, useParams} from "react-router-dom";
import {Col, Modal, Row} from "react-bootstrap";
import ProductModalAdd from "../Products/ProductModalAdd";
import {MDBContainer} from "mdb-react-ui-kit";
import OneProductInOrders from "../../../newcalc/Orders/OneProductInOrders";
import CrmHeader from "../CrmHeader";

const CrmCash2 = () => {
    const [things, setThings] = useState([]);
    const [products, setProducts] = useState(null);
    const [selectedThings2, setSelectedThings2] = useState([]);
    const [summ, setSumm] = useState(0);
    const [isLoad, setIsLoad] = useState(false);
    const { id } = useParams(null);
    const [thisOrder, setThisOrder] = useState({
        id: id
    });
    const [newThisOrder, setNewThisOrder] = useState({id: id});
    const [typeSelect, setTypeSelect] = useState("");
    const [uniqueTypes, setUniqueTypes] = useState([]);

    const handleThingClick = (thing) => {
        let newThisOrderToSend = thisOrder
        if(thing.productunits){
            newThisOrderToSend.orderunits = [...selectedThings2, {...thing, amount: 1, orderunitunits: thing.productunits}]
        } else {
            newThisOrderToSend.orderunits = [...selectedThings2, {...thing, amount: 1, orderunitunits: []}]
        }
        setNewThisOrder(newThisOrderToSend)
    };

    const handleThingClickDelete2 = (thing) => {
        const updatedSelectedThings2 = [...selectedThings2];
        let newThisOrderToSend = thisOrder
        newThisOrderToSend.orderunits = updatedSelectedThings2.filter((t) => t !== thing)
        setNewThisOrder(newThisOrderToSend)
    };

    const handleAmountChange = (selectedThingIndex, fieldName, event) => {
        const updatedSelectedThings2 = [...selectedThings2];
        updatedSelectedThings2[selectedThingIndex][fieldName] = event.target.value;
        let newThisOrderToSend = thisOrder
        newThisOrderToSend.orderunits = updatedSelectedThings2
        setNewThisOrder(newThisOrderToSend)
    };

    useEffect(() => {
        if (thisOrder.orderunits) {
            let dataToSend = {
                thisOrder: newThisOrder,
                method: "calculate"
            };

            axios.post(`/api/order/save`, dataToSend)
                .then(response => {
                    console.log(response.data);
                    setThisOrder(response.data);
                    setSelectedThings2(response.data.orderunits);
                })
                .catch(error => {
                    console.log(error.message);
                });
        }
    }, [newThisOrder])

    const handleSaveOrder = (event, valueName) => {
        let dataToSend = {
            thisOrder: thisOrder
        }
        axios.post(`/api/order/save`, dataToSend)
            .then(response => {
                console.log(response.data);
                setThisOrder(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    };

    useEffect(() => {
        let data = {
            name: "Склад",
            inPageCount: 99999,
            currentPage: 1,
            search: typeSelect
        };
        axios.post(`/admin/gettable`, data)
            .then(response => {
                // console.log(response.data);

                let uniqueItems = {}
                response.data.rows.forEach(item => {
                    if (!uniqueItems[item.type]) {
                        uniqueItems[item.type] = {...item};
                    }
                })
                // console.log(uniqueItems);
                let uniqueTypess = Object.values(uniqueItems);
                setThings(response.data)
                if(uniqueTypes.length === 0){
                    setUniqueTypes(uniqueTypess)
                }
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [typeSelect]);
    // console.log(uniqueTypes);

    useEffect(() => {
        let dataToSend = {
            method: "getAll",
            search: typeSelect
        }
        axios.post(`/admin/api/products`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setProducts(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [typeSelect]);

    useEffect(() => {
        setIsLoad(true)
        let data = {
            name: "OneOrder",
            id: id
        }
        axios.post(`/api/order/get`, data)
            .then(response => {
                console.log(response.data);
                setThisOrder(response.data)
                setSelectedThings2(response.data.orderunits)
                setIsLoad(false)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    // console.log(selectedThings2);
    return (
        <div className="d-flex justify-content-space-between flex-column">
            <CrmHeader whoPick={"Касса"} data={[]} typeSelect={typeSelect} setTypeSelect={setTypeSelect}/>
            <div>
                <Link className="d-flex align-content-center align-items-center text-decoration-none m-1 p-1" to={`/CashFull/${thisOrder.id}`}>
                    <Button type="button"
                            className="adminFont btn btn-outline-danger">
                        Full
                    </Button>
                </Link>
            </div>
            <div className="d-flex flex-column">
                {/*<Form.Control*/}
                {/*    placeholder={"searchForm"}*/}
                {/*    aria-label={"searchForm"}*/}
                {/*    aria-describedby="searchForm"*/}
                {/*    type={"String"}*/}
                {/*    value={typeSelect}*/}
                {/*    className="adminFontTable"*/}
                {/*    onChange={(event) => setTypeSelect(event.target.value)}*/}
                {/*/>*/}
                {/*{orders && (*/}
                {/*    <div>*/}
                {/*        {orders.rows.map((metaItem, iter2) => (*/}
                {/*            <div>*/}
                {/*                {thisOrder && (*/}
                {/*                    <div key={metaItem + iter2}*/}
                {/*                         className={metaItem.id === thisOrder.id ? 'adminFontTable btn btn-outline-warning' : 'adminFontTable btn btn-light'}*/}
                {/*                         onClick={(event) => handleSelectOneOrder(event, metaItem.id)}>*/}
                {/*                        {metaItem.id}*/}
                {/*                    </div>*/}
                {/*                )}*/}
                {/*            </div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*)}*/}

            </div>
            <div className="d-flex justify-content-space-between">
                <div className="card">
                    <div style={{width: '50.5vw'}}>
                        {products === null ? (
                            <div style={{width: '47.5vw', height: '47vh', overflow: 'auto', border: '1px solid #ccc'}}
                                 className="m-3">
                                <div className="text-center">продукти</div>
                                <div style={{padding: '10px'}}>
                                    <Loader/>
                                </div>
                            </div>
                        ) : (
                            <div style={{width: '47.5vw', height: '47vh', overflow: 'auto', border: '1px solid #ccc'}}
                                 className="m-3">
                                <div className="text-center">продукти</div>
                                <MDBContainer fluid className="">
                                    <Row xs={1} md={4} className="g-4">
                                        {products.rows.map((thing, index) => (
                                            <Col key={index} onClick={() => handleThingClick(thing)}
                                                 className="thing adminFont btn btn-light">
                                                {thing.name}
                                            </Col>
                                        ))}
                                    </Row>
                                </MDBContainer>
                            </div>
                        )}
                        <div style={{width: '47.5vw', height: '20vh', overflow: 'auto', border: '1px solid #ccc'}}
                             className="m-3">
                            <div className="text-center">склад</div>
                            <div style={{padding: '10px'}}>
                                {things.length !== 0 ? (
                                    // <div>
                                    //     {things.rows.map((thing, index) => (
                                    //         <div key={index} onClick={() => handleThingClick(thing)} className="thing adminFont">
                                    //             {thing.name}
                                    //         </div>
                                    //     ))}
                                    // </div>
                                    <MDBContainer fluid className="">
                                        <Row xs={1} md={4} className="">
                                            {things.rows.map((thing, index) => (
                                                <Col key={index} onClick={() => handleThingClick(thing)} className="thing adminFont btn btn-light text-center">
                                                    {thing.name}
                                                </Col>
                                            ))}
                                        </Row>
                                    </MDBContainer>
                                ) : (
                                    <div>NETU</div>
                                )}
                            </div>
                        </div>
                        <div>
                            {uniqueTypes.map((thing, index) => (
                                <Button type="button" key={index} onClick={(event) => setTypeSelect(thing.type)}
                                        className="thing adminFont btn btn-light">
                                    {thing.type}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/*{things.map((thing, index) => (*/}
                    {/*    <li key={index} onClick={() => handleThingClick(thing)} className="thing">*/}
                    {/*        {thing.name}*/}
                    {/*    </li>*/}
                    {/*))}*/}
                </div>
                <div className="card d-flex flex-column" style={{width: '40.5vw'}}>
                    {selectedThings2.length !== 0 ? (
                        <div>
                            {selectedThings2.map((thing, index) => (
                                <div key={index} className="d-flex">
                                    {thing.orderunitunits.length !== 0 ? (
                                        <div className="d-flex flex-column" style={{width: '37.7vw'}}>
                                            {/*<SelectedProduct key={thing.id} name={"Продукти"} data={selectedThings}*/}
                                            {/*                 setData={setSelectedThings}*/}
                                            {/*                 item={thing} index={index} isLoad={isLoad}*/}
                                            {/*/>*/}
                                            <div className="d-flex">
                                                <div className="adminFontTable p-1 m-1 bg-light">id: {thing.id}.</div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-light">Назва: {thing.name}.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-light">Кількість {thing.amount} шт.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-warning">Коштує(за
                                                    одиницю): {thing.priceForThis}грн.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-warning">Коштує
                                                    ({thing.amount}шт): {thing.priceForThis*thing.amount}грн.
                                                </div>
                                            </div>
                                            <OneProductInOrders item={thing} cash={true}/>
                                            <Form.Control
                                                type="number"
                                                placeholder={1}
                                                min={1}
                                                value={thing.amount}
                                                className=""
                                                onChange={(event) => handleAmountChange(index, 'amount', event)}
                                            />
                                            <Button variant="danger" onClick={() => handleThingClickDelete2(thing)}
                                                    className="adminFont">Видалити</Button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column m-1 border-light p-1" style={{width: '37.7vw'}}>
                                            {/*<li className="adminFont">{thing.name}</li>*/}
                                            {/*<li className="adminFont">Ціна: {thing.priceForThis}</li>*/}
                                            {/*<li>*/}
                                            {/*    за одиницю цієї хні: {thing.priceForThis / thing.amount}*/}
                                            {/*</li>*/}
                                            {/*<OneProductInOrders item={thing} cash={true}/>*/}
                                            <div className="d-flex">
                                                <div className="adminFontTable p-1 m-1 bg-light">id: {thing.id}.</div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-light">Назва: {thing.name}.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-light">Кількість {thing.amount} шт.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-warning">Коштує(за
                                                    одиницю): {thing.priceForOneThis}грн.
                                                </div>
                                                <div
                                                    className="adminFontTable p-1 m-1 bg-warning">Коштує ({thing.amount}шт): {thing.priceForThis}грн.
                                                </div>
                                            </div>
                                            <Form.Control
                                                type="number"
                                                placeholder={1}
                                                min={1}
                                                value={thing.amount}
                                                className=""
                                                onChange={(event) => handleAmountChange(index, 'amount', event)}
                                            />
                                            <Button variant="danger" onClick={() => handleThingClickDelete2(thing)}
                                                    className="adminFont">Видалити</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h5 className="text-center text-black-50">Тут ще нічого..</h5>
                        </div>
                    )}
                    <div>
                        <Button variant="light" disabled className="adminFont">Сумма</Button>
                        <Button variant="light" disabled className="adminFont">{thisOrder.price}</Button>
                    </div>
                    <div style={{marginTop: 'auto'}}>
                        <div>
                            <div className="d-flex">
                                <div className="d-flex flex-column">
                                    <li className="adminFont">Предоплата</li>

                                    {thisOrder ? (
                                        <Form.Control type="number"
                                                      variant="outline-warning"
                                                      value={0}
                                                      className="adminFont btn btn-outline-warning"
                                                      onChange={handleSaveOrder}
                                            // onChange={handleSaveOrder}
                                        />
                                    ) : (
                                        <Form.Control variant="outline-warning" onChange={handleSaveOrder} value={0} className="adminFont btn btn-outline-warning"/>
                                    )}

                                    {/*<Form.Control variant="outline-warning" value={thisOrder.prepayment} className="adminFont btn btn-outline-warning"/>*/}
                                </div>
                                <div className="d-flex flex-column">
                                    <li className="adminFont">Знижка</li>
                                    <Button variant="outline-warning" disabled className="adminFont">0</Button>
                                </div>
                                <div className="d-flex flex-column">
                                    <li className="adminFont">Всього</li>
                                    <Button variant="outline-warning" disabled className="adminFont">0</Button>
                                </div>

                                <div className="d-flex flex-column">
                                    <li className="adminFont text-center">Оплата</li>
                                    <div className="d-flex">
                                        <Button variant="outline-primary" className="adminFont">Готівка</Button>
                                        <Button variant="outline-primary" className="adminFont">Безготівка</Button>
                                    </div>
                                </div>
                                {isLoad ? (
                                    <Button variant="light" disabled className="adminFont"><Loader/></Button>
                                ) : (
                                    <div>
                                        <Button variant="light" disabled className="adminFont">{summ}</Button>
                                    </div>
                                )}
                                {thisOrder ? (
                                    <div>
                                        {/*<Button variant="light" disabled className="adminFont">Ви успішно зберегли*/}
                                        {/*    замовлення та*/}
                                        {/*    отримали відповідь БД про унікальний номер йому було призначено.</Button>*/}
                                        <Button variant="light" disabled className="adminFont">Номер
                                            замовлення: {thisOrder.id}</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {/*<Button variant="light" disabled className="adminFont">Нажимаючи "Зберегти" ви*/}
                                        {/*    активуете*/}
                                        {/*    збереження заказу до БД та отримання відповіді БД який унікальний номер йому*/}
                                        {/*    було*/}
                                        {/*    призначено. Його буде видно після збереження.</Button>*/}
                                        <Button variant="light" className="adminFont"
                                                onClick={handleSaveOrder}>Зберегти</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmCash2;