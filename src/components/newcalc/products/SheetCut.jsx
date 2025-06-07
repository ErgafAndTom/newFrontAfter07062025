import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import ModalSize from "../modals/ModalSize";
import ModalMaterial from "../modals/ModalMaterial";
import ModalColor from "../modals/ModalColor";
import ModalLamination from "../modals/ModalLamination";
import axios from "axios";
import Loader from "../../calc/Loader";
import Form from "react-bootstrap/Form";
import KnopkaI from "../../../PrintPeaksFAinal/KnopkaI";
import ButtonS from "../../../PrintPeaksFAinal/poslugi/newnomodals/ButtonImgArtem1";
import ButtonE from "../../../PrintPeaksFAinal/lineOfPosluga/ButtonE";

const SheetCut = ({thisOrder, newThisOrder, setNewThisOrder, selectedThings2, setShow}) => {
    // const [show, setShow] = useState(false);
    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [material, setMaterial] = useState({
        type: "",
        material: "Офісний папір А3 80-90 г/м2"
    });
    const [color, setColor] = useState({
        sides: "односторонній",
        one: "",
        two: "",
        allSidesColor: "CMYK",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "",
    });
    const [big, setBig] = useState("Не потрібно");
    const [cute, setCute] = useState("Не потрібно");
    const [holes, setHoles] = useState("Не потрібно");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);

    const handleThingClickAndHide = e => {
        let newThisOrderToSend = thisOrder
        let thing = {
            name: "Листова продукція",
            amount: count,
            newField2: size.x,
            newField3: size.y,
            priceForThis: pricesThis.price,
            priceForOneThis: pricesThis.price / count
        }
        newThisOrderToSend.orderunits = [...selectedThings2, {...thing, orderunitunits: []}]
        setNewThisOrder(newThisOrderToSend)
        setShow(false)
    }

    const handleSelectBig = e => {
        setBig(e.target.value);
    }
    const handleSelectCute = e => {
        setCute(e.target.value);
    }
    const handleSelectHoles = e => {
        setHoles(e.target.value);
    }
    const handleSelectMaterial = e => {
        setMaterial({
            type: material.type,
            material: e.target.value
        })
    }
    const handleSelectColorSides = (e) => {
        setColor({
            sides: e.target.value,
            one: color.one,
            two: color.two,
            allSidesColor: color.allSidesColor,
        })
    }
    const handleSelectColorColor = (e) => {
        setColor({
            sides: color.sides,
            one: color.one,
            two: color.two,
            allSidesColor: e.target.value,
        })
    }
    const handleSelectLamination = (e) => {
        setLamination({
            type: e.target.value,
            material: lamination.material,
        })
    }



    const handleCount = e => {
        if(parseInt(e.target.value) < 1){
            setCount(1);
        } else {
            setCount(parseInt(e.target.value));
        }
    }

    useEffect(() => {
        axios.get(`/getpricesNew`)
            .then(response => {
                console.log(response.data);
                setPrices(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    useEffect(() => {
        let dataToSend = {
            type: "SheetCut",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            holes: holes,
            count: count,
        }
        axios.post(`/api/pricing`, dataToSend)
            .then(response => {
                console.log(response.data);
                setPricesThis(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [size, material, color, lamination, big, cute, holes, count]);

    if(prices){
        return (
            <div className="d-flex flex-column">
                <div>
                    <div className="adminFont m-auto text-center fontProductName">
                        Візитки / Листівки /
                        Флаєри / Плакати
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <MDBContainer fluid style={{width: '100%'}}>
                        <Row xs={1} md={6} className="">
                            <Col>
                                <ModalSize size={size} setSize={setSize} prices={prices} type={"SheetCut"}/>
                            </Col>
                            {/*<Col>*/}
                            {/*    <ModalMaterial material={material} setMaterial={setMaterial} prices={prices}/>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Матеріал</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectMaterial}
                                                className="adminFont"
                                                value={material.material}
                                            >
                                                {/*<option value={""} disabled selected>Оберіть значення</option>*/}
                                                {prices[1].variants.map((item, iter) => (
                                                    <option
                                                        key={item[0]}
                                                        className={"adminFont"}
                                                        value={item[0]}
                                                    >
                                                        {item[0]}
                                                    </option>
                                                ))}

                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            {/*<Col>*/}
                            {/*    <ModalColor color={color} setColor={setColor} prices={prices}/>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Друк</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                onChange={handleSelectColorSides}
                                                className="adminFont"
                                                value={color.sides}
                                            >
                                                <option
                                                    className={"adminFont"}
                                                    value={"без друку"}
                                                >
                                                    {"без друку"}
                                                </option>
                                                <option
                                                    className={"adminFont"}
                                                    value={"односторонній"}
                                                >
                                                    {"односторонній"}
                                                </option>
                                                <option
                                                    className={"adminFont"}
                                                    value={"двосторонній"}
                                                >
                                                    {"двосторонній"}
                                                </option>
                                            </Form.Select>
                                            {color.sides !== "без друку" &&
                                                <Form.Select
                                                    onChange={handleSelectColorColor}
                                                    className="adminFont"
                                                    value={color.allSidesColor}
                                                >
                                                    <option
                                                        className={"adminFont"}
                                                        value={"Не потрібно"}
                                                        disabled
                                                    >
                                                        {"Не потрібно"}
                                                    </option>
                                                    <option
                                                        className={"adminFont"}
                                                        value={"Чорно-білий"}
                                                    >
                                                        {"Чорно-білий"}
                                                    </option>
                                                    <option
                                                        className={"adminFont"}
                                                        value={"CMYK"}
                                                    >
                                                        {"Кольоровий"}
                                                    </option>
                                                </Form.Select>
                                            }
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/*<Col>*/}
                            {/*    <ModalLamination lamination={lamination} setLamination={setLamination} prices={prices}*/}
                            {/*                     size={size}/>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Ламінація</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                onChange={handleSelectLamination}
                                                className="adminFont"
                                                value={lamination.type}
                                            >
                                                <option
                                                    className={"adminFont"}
                                                    value={"Не потрібно"}
                                                >
                                                    {"Не потрібно"}
                                                </option>
                                                {prices[3].variants.map((item, iter) => (
                                                    <option
                                                        key={item[0]}
                                                        className={"adminFont"}
                                                        value={item[0]}
                                                    >
                                                        {item[0]}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Біг</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectBig}
                                                className="adminFont"
                                                value={big}
                                            >
                                                {/*<option value={""} disabled selected>Оберіть значення</option>*/}
                                                <option className="adminFont" value={"Не потрібно"}>Не потрібно</option>
                                                <option className="adminFont" value={"1"}>1</option>
                                                <option className="adminFont" value={"2"}>2</option>
                                                <option className="adminFont" value={"3"}>3</option>
                                                <option className="adminFont" value={"4"}>4</option>
                                                <option className="adminFont" value={"5"}>5</option>
                                                <option className="adminFont" value={"6"}>6</option>
                                                <option className="adminFont" value={"7"}>7</option>
                                                <option className="adminFont" value={"8"}>8</option>
                                                <option className="adminFont" value={"9"}>9</option>
                                                <option className="adminFont" value={"10"}>10</option>
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Кути</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectCute}
                                                className="adminFont"
                                                value={cute}
                                            >
                                                {/*<option value={""} disabled selected>Оберіть значення</option>*/}
                                                <option className="adminFont" value={"Не потрібно"}>Не потрібно</option>
                                                <option className="adminFont" value={"1"}>1</option>
                                                <option className="adminFont" value={"2"}>2</option>
                                                <option className="adminFont" value={"3"}>3</option>
                                                <option className="adminFont" value={"4"}>4</option>
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Дири</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectHoles}
                                                className="adminFont"
                                                value={holes}
                                            >
                                                {/*<option value={""} disabled selected>Оберіть значення</option>*/}
                                                <option className="adminFont" value={"Не потрібно"}>Не потрібно</option>
                                                <option className="adminFont" value={"1"}>1</option>
                                                <option className="adminFont" value={"2"}>2</option>
                                                <option className="adminFont" value={"3"}>3</option>
                                                <option className="adminFont" value={"4"}>4</option>
                                                <option className="adminFont" value={"5"}>5</option>
                                                <option className="adminFont" value={"6"}>6</option>
                                                <option className="adminFont" value={"7"}>7</option>
                                                <option className="adminFont" value={"8"}>8</option>
                                                <option className="adminFont" value={"9"}>9</option>
                                                <option className="adminFont" value={"10"}>10</option>
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>


                            {/*<Col>*/}
                            {/*    <Card>*/}
                            {/*        <Card.Body>*/}
                            {/*            <Card.Title className="adminFont">Інші послуги</Card.Title>*/}
                            {/*            <Card.Text className="adminFont">*/}

                            {/*            </Card.Text>*/}
                            {/*        </Card.Body>*/}
                            {/*    </Card>*/}
                            {/*</Col>*/}
                            {/*<Col>*/}
                            {/*    <Card className="colorCards">*/}
                            {/*        <Card.Body>*/}
                            {/*            <Card.Title className="adminFont">Макет</Card.Title>*/}
                            {/*            <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>*/}

                            {/*            </Card.Text>*/}
                            {/*        </Card.Body>*/}
                            {/*    </Card>*/}
                            {/*</Col>*/}
                            {/*<Col>*/}
                            {/*    <Card>*/}
                            {/*        <Card.Body>*/}
                            {/*            <Card.Title className="adminFont">ТЕМА ДОЛЖЕН ПОЯСНИТь</Card.Title>*/}
                            {/*            <Card.Text className="adminFont">*/}
                            {/*                Тема сядет и создаст каждій продукт где уникально расставит уже готовіе модули)*/}
                            {/*            </Card.Text>*/}
                            {/*        </Card.Body>*/}
                            {/*    </Card>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Кількість</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <div className="adminFont">

                                            </div>
                                            <Form.Control
                                                aria-describedby="modRed"
                                                type="number"
                                                value={count}
                                                min={1}
                                                // onChange={(event) => setCount(event.target.value)}
                                                onChange={handleCount}
                                            />
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {/*{data.rows.map((item) => (*/}
                        {/*"proxy": "http://127.0.0.1:3000",*/}
                        {/*    <CardProduct key={item.id} name={name} data={data} setData={setData} item={item}/>*/}
                        {/*))}*/}
                    </MDBContainer>
                    {null === pricesThis ? (
                        <div style={{width: '50vw'}}>

                        </div>
                    ) : (
                        <div style={{width: '95vw'}} className="m-auto">
                            <div className="adminFont fontInfoForPricing1">
                                {pricesThis.skolkoListovNaOdin}шт. - Виробів з 1 листа A3(можливо зробити)
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.skolko}шт. - Затрачено листів (A3)
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfPapper}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}грн. - Ціна за листи
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForDrukThisUnit}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.priceForDrukThisUnit * pricesThis.skolko}грн. - Ціна за друк
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfLamination}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.priceForThisAllUnitsOfLamination}грн. - Ціна за ламінацію
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfBig}грн. * {count}шт. = {pricesThis.priceForAllUnitsOfBig}грн.
                                - Ціна за бігування
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfCute}грн. * {count}шт. = {pricesThis.priceForAllUnitsOfCute}грн.
                                - Ціна за скруглення кутів
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfHoles}грн. * {count}шт. = {pricesThis.priceForAllUnitsOfHoles}грн.
                                - Ціна за дірки
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}+
                                {pricesThis.priceForDrukThisUnit * pricesThis.skolko}+
                                {pricesThis.priceForThisAllUnitsOfLamination}+
                                {pricesThis.priceForAllUnitsOfBig}+
                                {pricesThis.priceForAllUnitsOfCute}+
                                {pricesThis.priceForAllUnitsOfHoles}=
                                {pricesThis.price}
                            </div>
                            <div className="adminFont fontInfoForPricing1">
                                Ціна за все {pricesThis.price}грн.
                            </div>


                            {/*<ChartComponent aapl={pricesThis}/>*/}
                            {/*<NewChartMy data={pricesThis}/>*/}
                            {/*<NewChartMy2 data={pricesThis}/>*/}
                            {/*<Gravity data={pricesThis}/>*/}
                        </div>
                    )}
                </div>
                {thisOrder && (
                    <div className="btn btn-light" onClick={handleThingClickAndHide}>
                        ДОДАТИ ДО ЗАМОВЛЕННЯ
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default SheetCut;