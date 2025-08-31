import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import ModalSize from "../modals/ModalSize";
import axios from "axios";
import Loader from "../../calc/Loader";
import Form from "react-bootstrap/Form";

const SheetCut = ({thisOrder, newThisOrder, setNewThisOrder, selectedThings2, setShow}) => {
    // const [show, setShow] = useState(false);
    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [material, setMaterial] = useState({
        type: "",
        material: "Матовий папір 180 г/м2"
    });
    const [color, setColor] = useState({
        sides: "без друку",
        one: "",
        two: "",
        allSidesColor: "",
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
            name: "Широкоформатна продукція",
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
    const handleSelectWide = e => {
        setMaterial({
            type: "",
            material: e.target.value
        });
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
                // console.log(response.data);
                setPrices(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    useEffect(() => {
        let dataToSend = {
            type: "Wide",
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
                // console.log(response.data);
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
                    <div className="adminFont m-auto text-center fontProductName">Великі плакати / Креслення / Фотографії</div>
                </div>
                <div className="d-flex flex-column">
                    <MDBContainer fluid style={{width: '100%'}}>
                        <Row xs={1} md={6} className="">
                            <Col>
                                <ModalSize size={size} setSize={setSize} prices={prices} type={"Wide"}/>
                            </Col>
                            {/*<Col>*/}
                            {/*    <ModalMaterial material={material} setMaterial={setMaterial} prices={prices}/>*/}
                            {/*</Col>*/}
                            {/*<Col>*/}
                            {/*    <ModalColor color={color} setColor={setColor} prices={prices}/>*/}
                            {/*</Col>*/}
                            {/*<Col>*/}
                            {/*    <ModalLamination lamination={lamination} setLamination={setLamination} prices={prices}*/}
                            {/*                     size={size}/>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Матеріал</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectWide}
                                                className="adminFont"
                                                value={material.material}
                                            >
                                                {prices[8].variants.map((item, iter) => (
                                                    <option
                                                        key={item[0]}
                                                        className="adminFont"
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
                                        <Card.Title className="adminFont2 m-auto text-center">Кількість</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
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
                            <div style={{border: "0px black solid"}}>
                                1 вариант:
                                <div className="adminFont fontInfoForPricing">
                                    {size.x}мм
                                    * {pricesThis.operantForChangeMM2ToM2} = {pricesThis.sizeXM2}м
                                </div>
                                <div className="adminFont fontInfoForPricing">
                                    {size.y}мм
                                    * {pricesThis.operantForChangeMM2ToM2} = {pricesThis.sizeYM2}м
                                </div>
                                <div className="adminFont fontInfoForPricing">
                                    {pricesThis.sizeXM2}м
                                    * {pricesThis.sizeYM2}м = {pricesThis.totalSizeInM2One}м² - м²/1 шт.
                                </div>
                            </div>
                            {/*<div className="" style={{border: "1px black solid"}}>*/}
                            {/*    2 вариант:*/}
                            {/*    <div className="adminFont fontInfoForPricing">*/}
                            {/*        {size.x}мм * {size.y}мм = {pricesThis.totalSizeInMM2One}мм²*/}
                            {/*    </div>*/}
                            {/*    <div className="adminFont fontInfoForPricing">*/}
                            {/*        {pricesThis.totalSizeInMM2One}мм² * {pricesThis.operantForChangeMM2ToM2}м*/}
                            {/*        = {pricesThis.totalSizeInM2One}м² - м²/1 шт.*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.totalSizeInM2One}м² * {pricesThis.skolko}шт.
                                = {pricesThis.allTotalSizeInM2}м² - {pricesThis.skolko} шт.
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.oneWideDrukPrice}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.totalWideDrukPrice}грн. - Ціна за друк
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.oneWideMaterialPrice}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.totalWideMaterialPrice}грн. - Ціна за матеріал
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
