import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import './CrmCash.css';
import Form from "react-bootstrap/Form";
import Loader from "../../../calc/Loader";
import Button from "react-bootstrap/Button";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Col, Modal, Row} from "react-bootstrap";
import {MDBContainer} from "mdb-react-ui-kit";
import OneProductInOrders from "../../../newcalc/Orders/OneProductInOrders";
import CrmHeader from "../CrmHeader";
import ClientChanger from "./ClientChanger";
import CashButtonsForPickOrders from "./CashButtonsForPickOrders";
import StatusChanger from "./StatusChanger";
import BodymovinAnimation from "../../../calc/main/BodymovinAnimation";
import colorA from "../../../calc/main/colorprint/color_print.json";
import color from "../../../calc/main/colorprint/color_print_1.svg";
import Card from "react-bootstrap/Card";
import bigA from "../../../calc/main/BIGprint/big_print.json";
import big from "../../../calc/main/BIGprint/BIG_print_1.svg";
import photoA from "../../../calc/main/photoprint/photo_print.json";
import photo from "../../../calc/main/photoprint/photo_print_1.svg";
import post2 from "../../../newcalc/R.png";
import cup2 from "../../../newcalc/product-photo-1611880011919.png";
// import GPTAneki from "../../GPTAneki";

const CrmCash3Full = ({setErr}) => {
    const navigate = useNavigate();
    const [things, setThings] = useState([]);
    const [products, setProducts] = useState(null);
    const [selectedThings2, setSelectedThings2] = useState([]);
    const [summ, setSumm] = useState(0);
    const [isLoad, setIsLoad] = useState(false);
    const { id } = useParams(null);
    const [thisOrder, setThisOrder] = useState({
        id: id
    });
    const [newThisOrder, setNewThisOrder] = useState({
        id: id
    });
    const [typeSelect, setTypeSelect] = useState("");
    const [uniqueTypesStorage, setUniqueTypesStorage] = useState([]);
    const [uniqueTypesProduct, setUniqueTypesProduct] = useState([]);
    const [orders, setOrders] = useState(null);

    const setTypeSelect2 = (thing) => {
        if(thing !== null){
            setTypeSelect(thing)
        } else {
            setTypeSelect("")
        }
    };

    const handleThingClick = (thing, typeThing) => {
        let newThisOrderToSend = thisOrder
        // console.log(thing);
        if(thing.productunits){
            newThisOrderToSend.orderunits = [...selectedThings2, {...thing, amount: 1, newField2: 45, newField3: 45, orderunitunits: thing.productunits}]
        } else {
            newThisOrderToSend.orderunits = [...selectedThings2, {...thing, amount: 1, newField2: 45, newField3: 45, orderunitunits: [], x:thing.x, y:thing.y, idInStorageUnit:thing.id}]
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

    const handleThisOrderChange = (fieldName, event) => {
        const updatedThisOrder = thisOrder;
        updatedThisOrder[fieldName] = event.target.value;
        setNewThisOrder(updatedThisOrder)
    };

    useEffect(() => {
        if (thisOrder.orderunits) {
            let dataToSend = {
                thisOrder: newThisOrder,
                method: "calculate"
            };

            axios.post(`/api/order/save`, dataToSend)
                .then(response => {
                    // console.log(response.data);
                    setThisOrder(response.data);
                    setSelectedThings2(response.data.orderunits);
                })
                .catch(error => {
                    console.log(error.message);
                    // setErr(error)
                });
        }
    }, [newThisOrder])

    const handleSaveOrder = (event, valueName) => {
        let dataToSend = {
            data: [],
            id: false,
            tablePosition: valueName,
            value: event.target.value
        }
        axios.post(`/api/order/create`, dataToSend)
            .then(response => {
                // console.log(response.data);
                navigate(`/CashFull/${response.data.id}`);
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
                if(uniqueTypesStorage.length === 0){
                    setUniqueTypesStorage(uniqueTypess)
                }
            })
            .catch(error => {
                console.log(error.message);
                // setErr(error)
            })
    }, [typeSelect]);
    // console.log(uniqueTypesStorage);

    useEffect(() => {
        let dataToSend = {
            method: "getAll",
            search: typeSelect
        }
        axios.post(`/admin/api/products`, dataToSend)
            .then(response => {
                // console.log(response.data);
                let uniqueItems = {}
                response.data.rows.forEach(item => {
                    if (!uniqueItems[item.type]) {
                        uniqueItems[item.type] = {...item};
                    }
                })
                let uniqueTypess = Object.values(uniqueItems);
                setProducts(response.data)
                setUniqueTypesProduct(uniqueTypess)
                // if(setUniqueTypesProduct.length === 0){
                //     console.log(uniqueTypess);
                //     setUniqueTypesProduct(uniqueTypess)
                // }
            })
            .catch(error => {
                console.log(error.message);
                // setErr(error)
            })
    }, [typeSelect]);

    useEffect(() => {
        if(id){
            setIsLoad(true)
            let data = {
                name: "OneOrder",
                id: id
            }
            // console.log(data);
            axios.post(`/api/order/get`, data)
                .then(response => {
                    // console.log(response.data);
                    setThisOrder(response.data)
                    setSelectedThings2(response.data.orderunits)
                    setIsLoad(false)
                })
                .catch(error => {
                    console.log(error.message);
                    // setErr(error)
                })
        }
    }, [id]);

    useEffect(() => {
        let data = {
            name: "Orders",
            inPageCount: 999999,
            currentPage: 1,
            search: "створено"
        }
        axios.post(`/api/order/get`, data)
            .then(response => {
                // console.log(response.data);
                setOrders(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [thisOrder]);

    // console.log(setNewThisOrder);
    return (
        <div className="d-flex justify-content-space-between flex-column">
            <CrmHeader whoPick={`Каса beta 3.1 >_< (Order ${thisOrder.id})`} data={[]} typeSelect={typeSelect} setTypeSelect={setTypeSelect}/>
            <div className="d-flex justify-content-space-between">
                <div className="d-flex flex-column">
                    <Link
                        className="d-flex align-content-center align-items-center text-decoration-none"
                        to={`/Orders`}
                        style={{border: "solid 1px #cccabf"}}
                    >
                        <div
                            className={'adminFont btnHoverIfTransparent w-100 btn btn-light m-1'}
                        >
                            {"<"}
                        </div>
                    </Link>
                    <div
                        className="d-flex align-content-center align-items-center text-decoration-none"
                        style={{border: "solid 1px #cccabf"}}
                    >
                        <div
                            className={'adminFont btnHoverIfTransparent btn w-100 btn-light m-1'}
                            onClick={handleSaveOrder}
                        >
                            +
                        </div>
                    </div>
                    {orders && (
                        <div style={{overflow: 'auto', maxHeight: '82vh', border: "solid 1px #cccabf"}}>
                            {orders.rows.map((item, iter2) => (
                                <Link
                                    key={item+iter2}
                                    className="d-flex align-content-center align-items-center text-decoration-none"
                                    to={`/CashFull/${item.id}`}>
                                    {thisOrder && (
                                        <CashButtonsForPickOrders item={item} thisOrder={thisOrder}/>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className="m-1 p-1">
                    {/*<div className="d-flex">*/}
                    {/*    <div className="btn adminFont">*/}
                    {/*        Order: {thisOrder.id}*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="" style={{width: '53.5vw'}}>
                        <div className="" style={{border: "solid 1px #cccabf",}}>
                            <div className="text-center">продукти</div>
                            <div style={{
                                width: '53.5vw',
                                height: '43vh',
                                overflow: 'auto',
                                // border: '1px solid #ccc'
                            }}
                                 className="m-1">
                                {setNewThisOrder !== undefined && (
                                    <GPTAneki thisOrder={thisOrder} newThisOrder={newThisOrder} setNewThisOrder={setNewThisOrder} selectedThings2={selectedThings2}/>
                                )}
                                {/*<GPTAneki thisOrder={thisOrder} newThisOrder={newThisOrder}*/}
                                {/*          setNewThisOrder={setNewThisOrder} selectedThings2={selectedThings2}*/}
                                {/*/>*/}
                            </div>
                            <div>

                            </div>
                        </div>


                        {/*{products === null ? (*/}
                        {/*    <div className="" style={{border: "solid 1px #cccabf",}}>*/}
                        {/*        <div className="text-center">продукти</div>*/}
                        {/*        <div style={{*/}
                        {/*            width: '53.5vw',*/}
                        {/*            height: '43vh',*/}
                        {/*            overflow: 'auto',*/}
                        {/*            // border: '1px solid #ccc'*/}
                        {/*        }}*/}
                        {/*             className="m-1">*/}
                        {/*            <div style={{padding: '10px'}}>*/}
                        {/*                <Loader/>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*        <div>*/}
                        {/*            {uniqueTypesProduct.map((thing, index) => (*/}
                        {/*                <Button type="button" key={index} onClick={(event) => setTypeSelect(thing.type)}*/}
                        {/*                        className="thing adminFont btn btnHoverIfTransparent btn-light btnm borderR0">*/}
                        {/*                    {thing.type}*/}
                        {/*                </Button>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*) : (*/}
                        {/*    <div className="" style={{border: "solid 1px #cccabf",}}>*/}
                        {/*        <div className="text-center">*/}
                        {/*            <div className="text-center">*/}
                        {/*                Продукти*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*        <div style={{*/}
                        {/*            width: '53.5vw',*/}
                        {/*            height: '43vh',*/}
                        {/*            overflow: 'auto',*/}
                        {/*            border: "solid 1px #cccabf"*/}
                        {/*        }}*/}
                        {/*             className="">*/}
                        {/*            <MDBContainer fluid className="">*/}
                        {/*                <Row xs={1} md={5} className="">*/}
                        {/*                    {products.rows.map((thing, index) => (*/}
                        {/*                        <Col key={index} onClick={() => handleThingClick(thing, "prodU")}*/}
                        {/*                             className="adminFont btn text-center hoverBlack"*/}
                        {/*                             style={{*/}
                        {/*                                 overflow: 'hidden',*/}
                        {/*                                 whiteSpace: "nowrap",*/}
                        {/*                                 textOverflow: "ellipsis",*/}
                        {/*                                 border: "solid 2px #cccabf"*/}
                        {/*                             }}*/}
                        {/*                        >*/}
                        {/*                            {thing.name}*/}
                        {/*                        </Col>*/}
                        {/*                    ))}*/}
                        {/*                </Row>*/}
                        {/*            </MDBContainer>*/}
                        {/*        </div>*/}
                        {/*        <div className="d-flex align-items-center align-content-center m-1 p-1"*/}
                        {/*             style={{overflow: 'auto', border: "solid 1px #cccabf", width: "99%"}}>*/}
                        {/*            {uniqueTypesProduct.map((thing, index) => (*/}
                        {/*                <div key={index} onClick={(event) => setTypeSelect2(thing.type)}*/}
                        {/*                     className="adminFont btn text-center hoverBlack"*/}
                        {/*                     style={{*/}
                        {/*                         whiteSpace: "nowrap",*/}
                        {/*                         textOverflow: "ellipsis",*/}
                        {/*                         border: "solid 1px #cccabf"*/}
                        {/*                     }}*/}
                        {/*                >*/}
                        {/*                    {thing.type}*/}
                        {/*                </div>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                        <div style={{border: "solid 1px #cccabf",}}>
                            <div className="text-center">
                                <div className="text-center">
                                    Склад
                                </div>
                            </div>
                            <div style={{
                                width: '53.5vw', height: '29vh', overflow: 'auto',
                                border: "solid 1px #cccabf"
                            }}
                                 className="">
                                <div>
                                    {things.length !== 0 ? (
                                        // <div>
                                        //     {things.rows.map((thing, index) => (
                                        //         <div key={index} onClick={() => handleThingClick(thing)} className="thing adminFont">
                                        //             {thing.name}
                                        //         </div>
                                        //     ))}
                                        // </div>
                                        <MDBContainer fluid className="">
                                            <Row xs={1} md={5} className="">
                                                {things.rows.map((thing, index) => (
                                                    <Col key={index} onClick={() => handleThingClick(thing, "storU")}
                                                         className=" adminFont btn text-center hoverBlack"
                                                         style={{
                                                             overflow: 'hidden',
                                                             whiteSpace: "nowrap",
                                                             textOverflow: "ellipsis",
                                                             border: "solid 2px #cccabf"
                                                         }}
                                                    >
                                                        {thing.name}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </MDBContainer>
                                    ) : (
                                        <div>Void...</div>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex align-items-center align-content-center m-1 p-1"
                                 style={{overflow: 'auto', border: "solid 1px #cccabf", width: "99%"}}>
                                {uniqueTypesStorage.map((thing, index) => (
                                    <div key={index} onClick={(event) => setTypeSelect2(thing.type)}
                                         className="adminFont btn text-center hoverBlack"
                                         style={{
                                             whiteSpace: "nowrap",
                                             textOverflow: "ellipsis",
                                             border: "solid 1px #cccabf",
                                         }}
                                    >
                                        {thing.type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/*{things.map((thing, index) => (*/}
                    {/*    <li key={index} onClick={() => handleThingClick(thing)} className="thing">*/}
                    {/*        {thing.name}*/}
                    {/*    </li>*/}
                    {/*))}*/}
                </div>
                <div className="">
                    <div style={{
                        width: '40.5vw', height: "76.5vh", overflow: 'auto',
                        border: "solid 1px #cccabf",
                    }} className="d-flex flex-column">
                        {selectedThings2.length !== 0 ? (
                            <div>
                                {selectedThings2.map((thing, index) => (
                                    <div key={index} className="d-flex">
                                        {thing.orderunitunits.length !== 0 ? (
                                            <div className="d-flex flex-column m-1 p-1 btnHoverIfTransparent"
                                                 style={{width: '40.7vw'}}>
                                                {/*<SelectedProduct key={thing.id} name={"Продукти"} data={selectedThings}*/}
                                                {/*                 setData={setSelectedThings}*/}
                                                {/*                 item={thing} index={index} isLoad={isLoad}*/}
                                                {/*/>*/}
                                                <Modal.Header className="d-flex w-100">
                                                    {/*<div className="adminFontTable p-1 m-1 bg-light">id: {thing.id}.</div>*/}
                                                    <div
                                                        className="adminFontTable booooold p-1 m-1">{thing.name}
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">{thing.amount} шт
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1 text-black-50">x
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">{thing.priceForThis}
                                                    </div>
                                                    <div className="adminFontTable p-1 m-1 text-black-50">
                                                        грн
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1 text-black-50">=
                                                    </div>
                                                    <div
                                                        className="adminFontTable booooold p-1 m-1">
                                                        {thing.priceForThis * thing.amount}
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1 text-black-50">
                                                        грн
                                                    </div>
                                                    <div onClick={() => handleThingClickDelete2(thing)}
                                                         className="btn btn-close p-2 m-2"></div>
                                                </Modal.Header>
                                                <OneProductInOrders item={thing} cash={true} handleAmountChange={handleAmountChange} index={index}/>
                                                <Form.Group className="d-flex">
                                                    <div className="btn btn-sm">Кількість:</div>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder={1}
                                                        min={1}
                                                        value={thing.amount}
                                                        className="adminFontTable btn btn-outline-secondary shadow-lg w-25"
                                                        onChange={(event) => handleAmountChange(index, 'amount', event)}
                                                    />
                                                    <div className="d-flex" style={{marginLeft: 'auto'}}>
                                                        <div className="btn">на листі: {thing.amountCanPushToOneList}</div>
                                                        <div className="btn">Листів: {thing.amountListForOne}</div>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        ) : (
                                            <div
                                                className="d-flex flex-column m-1 border-light p-1 btnHoverIfTransparent"
                                                style={{width: '40.7vw'}}>
                                                {/*<li className="adminFont">{thing.name}</li>*/}
                                                {/*<li className="adminFont">Ціна: {thing.priceForThis}</li>*/}
                                                {/*<li>*/}
                                                {/*    за одиницю цієї хні: {thing.priceForThis / thing.amount}*/}
                                                {/*</li>*/}
                                                {/*<OneProductInOrders item={thing} cash={true}/>*/}
                                                <Modal.Header className="d-flex">
                                                    {/*<div className="adminFontTable p-1 m-1 bg-light">id: {thing.id}.</div>*/}
                                                    <div
                                                        className="adminFontTable booooold p-1 m-1">{thing.name}
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">{thing.amount} шт
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">x
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">{thing.priceForOneThis} грн
                                                    </div>
                                                    <div
                                                        className="adminFontTable p-1 m-1">=
                                                    </div>
                                                    <div
                                                        className="adminFontTable booooold p-1 m-1">{thing.priceForThis} грн
                                                    </div>
                                                    <div onClick={() => handleThingClickDelete2(thing)}
                                                         className="btn btn-close p-2 m-2"></div>
                                                </Modal.Header>
                                                <div className="d-flex m-auto">
                                                    <div className="d-flex flex-row-reverse">
                                                        <div className="adminFontTable p-1 m-1">мм</div>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="null"
                                                            value={thing.newField2}
                                                            className="btn btn-outline-secondary adminFontTable shadow-lg w-50"
                                                            onChange={(event) => handleAmountChange(index, 'newField2', event)}
                                                        />
                                                        {/*<div className="adminFontTable p-1 m-1">мм</div>*/}
                                                    </div>
                                                    <div className="d-flex">
                                                        <div className="adminFontTable p-1 m-1">x</div>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="null"
                                                            value={thing.newField3}
                                                            className="btn btn-outline-secondary adminFontTable shadow-lg w-50"
                                                            onChange={(event) => handleAmountChange(index, 'newField3', event)}
                                                        />
                                                        <div className="adminFontTable p-1 m-1">мм</div>
                                                    </div>
                                                </div>
                                                <Form.Group className="d-flex">
                                                    <div className="btn btn-sm">Кількість:</div>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder={1}
                                                        min={1}
                                                        value={thing.amount}
                                                        className="btn btn-outline-secondary adminFontTable shadow-lg w-25"
                                                        onChange={(event) => handleAmountChange(index, 'amount', event)}
                                                    />
                                                    <div className="d-flex" style={{marginLeft: 'auto'}}>
                                                        <div className="btn">на
                                                            листі: {thing.amountCanPushToOneList}</div>
                                                        <div className="btn">Листів: {thing.amountListForOne}</div>
                                                    </div>
                                                </Form.Group>
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
                    </div>
                    <div style={{
                        // marginTop: 'auto',
                        // position: "fixed",
                        // top: "92vh",
                        width: "40.5vw",
                        // background: "#dcd9ce",
                    }} className="shadow-lg">
                        <div>
                            <div className="d-flex flex-column">
                                <ClientChanger thisOrder={thisOrder} setNewThisOrder={setNewThisOrder}
                                               handleThisOrderChange={handleThisOrderChange}/>
                                <div className="d-flex flex-row">
                                    <div>
                                        <Button variant="light" disabled className="adminFontTable">Сумма</Button>
                                        <Button variant="light" disabled
                                                className="adminFontTable">{thisOrder.price}</Button>
                                    </div>
                                    <div className="d-flex flex-row">
                                        <div className="adminFontTable btn text-black">Предоплата:</div>

                                        {thisOrder ? (
                                            <Form.Control type="number"
                                                          variant="outline-warning"
                                                          value={thisOrder.prepayment}
                                                          className="adminFontTable btn btn-outline-secondary text-black w-50"
                                                          onChange={(event) => handleThisOrderChange('prepayment', event)}
                                            />
                                        ) : (
                                            <Form.Control variant="outline-warning" value={0}
                                                          className="adminFontTable btn btn-outline-warning"/>
                                        )}

                                        {/*<Form.Control variant="outline-warning" value={thisOrder.prepayment} className="adminFont btn btn-outline-warning"/>*/}
                                    </div>
                                    <div className="d-flex flex-row" style={{marginLeft: "auto"}}>
                                        <div className="adminFontTable btn text-black">Знижка:</div>
                                        {thisOrder ? (
                                            <Form.Control type="number"
                                                          variant="outline-warning"
                                                          value={thisOrder.newField1}
                                                          className="adminFontTable btn btn-outline-secondary text-black w-50"
                                                          onChange={(event) => handleThisOrderChange('newField1', event)}
                                            />
                                        ) : (
                                            <Button variant="outline-warning" disabled className="adminFontTable">0</Button>
                                        )}
                                    </div>
                                </div>


                                <div className="d-flex flex-row">
                                    {isLoad ? (
                                        <div className="adminFontTable m-auto"><Loader/></div>
                                    ) : (
                                        <>
                                            <div className="adminFontTable text-center btn text-black borderR0">К
                                                Оплаті:
                                            </div>
                                            <div className="d-flex flex-row">
                                                {thisOrder ? (
                                                    <Button variant="outline-secondary" disabled
                                                            className="adminFontTable text-black">{thisOrder.allPrice}грн</Button>
                                                ) : (
                                                    <Button variant="outline-secondary" disabled
                                                            className="adminFontTable text-black">0грн</Button>
                                                )}
                                            </div>
                                            <div className="d-flex" style={{marginLeft: "auto"}}>
                                                <StatusChanger thisOrder={thisOrder} setNewThisOrder={setNewThisOrder}
                                                               handleThisOrderChange={handleThisOrderChange}/>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="d-flex" style={{margin: "auto"}}>
                                    <div className="adminFontTable btn">Оплата:</div>
                                    <div className="adminFontTable btn btn-primary opacity-75 hoverBlack">Готівка</div>
                                    <div className="adminFontTable btn btn-danger opacity-75 hoverBlack">Безготівка</div>
                                </div>
                                {/*{thisOrder ? (*/}
                                {/*    <div>*/}
                                {/*        /!*<Button variant="light" disabled className="adminFont">Ви успішно зберегли*!/*/}
                                {/*        /!*    замовлення та*!/*/}
                                {/*        /!*    отримали відповідь БД про унікальний номер йому було призначено.</Button>*!/*/}
                                {/*        <Button variant="light" disabled className="adminFont">Номер*/}
                                {/*            замовлення: {thisOrder.id}</Button>*/}
                                {/*    </div>*/}
                                {/*) : (*/}
                                {/*    <div>*/}
                                {/*        /!*<Button variant="light" disabled className="adminFont">Нажимаючи "Зберегти" ви*!/*/}
                                {/*        /!*    активуете*!/*/}
                                {/*        /!*    збереження заказу до БД та отримання відповіді БД який унікальний номер йому*!/*/}
                                {/*        /!*    було*!/*/}
                                {/*        /!*    призначено. Його буде видно після збереження.</Button>*!/*/}
                                {/*        <Button variant="light" className="adminFont"*/}
                                {/*                onClick={handleSaveOrder}>Зберегти</Button>*/}
                                {/*    </div>*/}
                                {/*)}*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmCash3Full
