import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import ModalSize from "../modals/ModalSize";
import axios from "axios";
import Loader from "../../calc/Loader";
import Form from "react-bootstrap/Form";
import TopCover from "./noteOptions/TopCover";
import BackCover from "./noteOptions/BackCover";
import IndoorUnit from "./noteOptions/IndoorUnit";
import Fastening from "./noteOptions/Fastening";

const Note = ({thisOrder, newThisOrder, setNewThisOrder, selectedThings2, setShow}) => {
    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [topCover, setTopCover] = useState({
        type: "2 стр (1 аркуш)",
        material: "Крейдований папір А3 220-350 г/м2",
        color: "CMYK",
        lamination: "Не потрібно",
        sides: "Альбомно",
    });
    const [backCover, setBackCover] = useState({
        type: "2 стр (1 аркуш)",
        material: "Крейдований папір А3 220-350 г/м2",
        color: "CMYK",
        lamination: "Не потрібно",
        sides: "Альбомно",
    });
    const [indoorUnit, setIndoorUnit] = useState({
        type: 50,
        material: "Офісний папір А3 80-90 г/м2",
        color: "Без друку",
        lamination: "Не потрібно",
        sides: "Альбомно",
    });
    const [fastening, setFastening] = useState({
        type: "Пружина",
        material: "",
        side: "Альбомно",
    });
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);

    const handleThingClickAndHide = e => {
        let newThisOrderToSend = thisOrder
        let thing = {
            name: "Багатосторінкова продукція",
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
            type: "Note",
            size: size,
            topCover: topCover,
            backCover: backCover,
            indoorUnit: indoorUnit,
            fastening: fastening,
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
    }, [size, topCover, backCover, indoorUnit, fastening, count]);

    if(prices){
        return (
            <div className="d-flex flex-column">
                <div>
                    <div className="adminFont m-auto text-center fontProductName">Блокноти / Буклети /
                        Каталоги / Презентації / Комікси / Зіни
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <MDBContainer fluid style={{width: '100%'}}>
                        <Row xs={1} md={6} className="">
                            <Col>
                                <ModalSize size={size} setSize={setSize} prices={prices} type={"Note"}/>
                            </Col>
                            <Col>
                                <TopCover topCover={topCover} setTopCover={setTopCover} prices={prices}/>
                            </Col>
                            <Col>
                                <IndoorUnit indoorUnit={indoorUnit} setIndoorUnit={setIndoorUnit} prices={prices}/>
                            </Col>
                            <Col>
                                <BackCover backCover={backCover} setBackCover={setBackCover} prices={prices}/>
                            </Col>
                            <Col>
                                <Fastening fastening={fastening} setFastening={setFastening} prices={prices}/>
                            </Col>


                            {/*<Col>*/}
                            {/*    <Card>*/}
                            {/*        <Card.Body>*/}
                            {/*            <Card.Title className="adminFont">Макет</Card.Title>*/}
                            {/*            <Card.Text className="adminFont">*/}

                            {/*            </Card.Text>*/}
                            {/*        </Card.Body>*/}
                            {/*    </Card>*/}
                            {/*</Col>*/}
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Кількість</Card.Title>
                                        <Card.Text className="adminFont p-2" style={{
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
                            <div className="adminFont fontInfoForPricing1">
                                {pricesThis.skolkoListovNaOdin}шт. - Виробів з 1 листа A3(можливо зробити)
                            </div>
                            {/*<div className="adminFont">*/}
                            {/*    {pricesThis.skolko}шт. - Затрачено листів (A3)*/}
                            {/*</div>*/}
                            <div className="adminFont fontInfoForPricing">
                                - Ціна за обкладинку: (Папір: {pricesThis.priceForTopCoverPapper}грн
                                * {pricesThis.skolko}шт) +
                                (Друк: {pricesThis.priceForTopCoverDruk}грн * {pricesThis.skolko}шт) +
                                (Ламінація: {pricesThis.priceForTopCoverLamination}грн. * {pricesThis.skolko}шт)
                                = {pricesThis.topCoverPriceAll}грн
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                - Ціна за блок: (Папір: {pricesThis.priceForIndoorUnitPapper}грн
                                * {pricesThis.skolkoIndoorUnit}шт) +
                                (Друк: {pricesThis.priceForIndoorUnitDruk}грн * {pricesThis.skolkoIndoorUnit}шт) +
                                (Ламінація: {pricesThis.priceForIndoorUnitLamination}грн * {pricesThis.skolkoIndoorUnit}шт)
                                = {pricesThis.indoorUnitPriceAll}грн
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                - Ціна за підкладку: (Папір: {pricesThis.priceForBackCoverPapper}грн
                                * {pricesThis.skolko}шт) +
                                (Друк: {pricesThis.priceForBackCoverDruk}грн * {pricesThis.skolko}шт) +
                                (Ламінація: {pricesThis.priceForBackCoverLamination}грн * {pricesThis.skolko}шт)
                                = {pricesThis.BackCoverPriceAll}грн
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                - Ціна за Скріплення: {pricesThis.FasteningPrice}грн
                            </div>
                            <div className="adminFont fontInfoForPricing">
                                Загалом: {pricesThis.topCoverPriceAll}грн +
                                {pricesThis.indoorUnitPriceAll}грн +
                                {pricesThis.BackCoverPriceAll}грн +
                                {pricesThis.FasteningPrice} грн =
                                {pricesThis.price} грн
                            </div>
                            <div className="adminFont fontInfoForPricing1">
                                Ціна за все {pricesThis.price} грн
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

export default Note;