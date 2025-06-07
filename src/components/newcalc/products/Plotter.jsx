import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useCallback, useEffect, useState} from "react";
import ModalSize from "../modals/ModalSize";
import axios from "axios";
import Loader from "../../calc/Loader";
import Form from "react-bootstrap/Form";
import {useNavigate} from "react-router-dom";

const Plotter = ({thisOrder, newThisOrder, setNewThisOrder, selectedThings2, showPlotter, setShowPlotter, setThisOrder, setSelectedThings2}) => {
    const [load, setLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowPlotter(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowPlotter(true);
    }, []);


    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [material, setMaterial] = useState({
        type: "Плотерна порізка на аркуші",
        material: ""
    });
    const [color, setColor] = useState({
        sides: "без друку",
        one: "",
        two: "",
        allSidesColor: "CMYK",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "",
    });
    const [big, setBig] = useState("Не потрібно");
    const [montajka, setMontajka] = useState("");
    const [cute, setCute] = useState("Не потрібно");
    const [cuteLocal, setCuteLocal] = useState({
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);
    const [thisTypeMaterials, setThisTypeMaterials] = useState([]);

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: "Постпресс",
                type: "Plotter",
                size: size,
                material: {
                    ...material,
                    type: "Не потрібно",
                },
                color: {
                    ...color,
                    sides: "Не потрібно",
                },
                lamination: lamination,
                big: big,
                cute: cute,
                cuteLocal: cuteLocal,
                holes: holes,
                holesR: holesR,
                count: count,
            }
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setThisOrder(response.data);
                // setSelectedThings2(response.data.order.OrderUnits || []);
                setSelectedThings2(response.data.OrderUnits);
                setShowPlotter(false)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
                // setErr(error)
            });
    }

    const handleSelectDrukSides = e => {
        setColor({
            sides: e.target.value,
            one: "",
            two: "",
            allSidesColor: "CMYK",
        });
    }
    const handleSelectPlotterMontajka = e => {
        setMontajka(e.target.value);
    }
    const handleSelectPlotterType = e => {
        setMaterial({
            type: e.target.value,
            material: "",
        });
    }
    const handleSelectPlotterMaterial = e => {
        setMaterial({
            type: material.type,
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
                setError(null)
            })
            .catch(error => {
                console.log(error.message);
                setError(error)
            })
    }, []);

    useEffect(() => {
        if (prices) {  // Add this check to ensure prices has been loaded.
            let thisPrices = []
            for (let i = 0; i < prices.length; i++) {
                if(prices[i].name === material.type){
                    thisPrices = prices[i].variants
                }
            }
            setThisTypeMaterials(thisPrices)
        }
    }, [prices]);

    useEffect(() => {
        if (showPlotter) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showPlotter]);

    if(prices){
        return (
            <>
                {isVisible === true ? (
                    <div>
                        <div
                            style={{
                                width: "100vw",
                                zIndex: "99",
                                height: "100vh",
                                background: "rgba(0, 0, 0, 0.5)",
                                opacity: isAnimating ? 1 : 0, // для анимации прозрачности
                                transition: "opacity 0.3s ease-in-out", // плавная анимация
                                position: "fixed",
                                left: "0",
                                bottom: "0"
                            }}
                            onClick={handleClose}
                        ></div>
            <div className="d-flex flex-column" style={{
                zIndex: "100",
                position: "fixed",
                background: "#dcd9ce",
                top: "50%",
                left: "50%",
                transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                opacity: isAnimating ? 1 : 0, // анимация прозрачности
                transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                borderRadius: "1vw",
                width: "95vw",
                height: "95vh",
                // padding: "20px"
            }}>
                <div className="d-flex">
                    <div className="adminFont m-auto text-center fontProductName">
                        Стікера / Стікерпаки / Наліпки / Бірки
                    </div>
                    <div
                        className="btn btn-close btn-lg"
                        style={{
                            margin: "0.5vw",
                        }}
                        onClick={handleClose}
                    >
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <MDBContainer fluid style={{width: '95vw'}}>
                        <Row xs={1} md={6} className="">
                            <Col>
                                <ModalSize size={size} setSize={setSize} prices={prices} type={"Plotter"}/>
                            </Col>
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Вид послуги</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectPlotterType}
                                                className="adminFont"
                                                value={material.type}
                                            >
                                                {prices[10].variants.map((item, iter) => (
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
                                        <Card.Title className="adminFont2 m-auto text-center">Матеріал</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectPlotterMaterial}
                                                className="adminFont"
                                                value={material.material}
                                            >
                                                <option
                                                    className="adminFont"
                                                    value={""}
                                                    defaultValue
                                                >
                                                    {"Виберіть"}
                                                </option>
                                                {thisTypeMaterials.map((item, iter) => (
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
                                        <Card.Title className="adminFont2 m-auto text-center">Друк</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectDrukSides}
                                                className="adminFont"
                                                value={color.sides}
                                            >
                                                <option
                                                    className="adminFont"
                                                    value={"без друку"}
                                                >
                                                    {"без друку"}
                                                </option>
                                                <option
                                                    className="adminFont"
                                                    value={"односторонній"}
                                                >
                                                    {"односторонній"}
                                                </option>
                                                <option
                                                    className="adminFont"
                                                    value={"двосторонній"}
                                                >
                                                    {"двосторонній"}
                                                </option>
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Монтажна
                                            плівка</Card.Title>
                                        <Card.Text className="adminFont" style={{
                                            background: "#fff",
                                            borderRadius: "0.4vw",
                                            marginTop: '1vw'
                                        }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectPlotterMontajka}
                                                className="adminFont"
                                                value={montajka}
                                            >
                                                <option
                                                    className="adminFont"
                                                    value={""}
                                                >
                                                    {"Без"}
                                                </option>
                                                <option
                                                    className="adminFont"
                                                    value={"Так"}
                                                >
                                                    {"Так"}
                                                </option>
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
                        {error &&
                            <div>{error.message}</div>
                        }
                        {null === pricesThis ? (
                            <div style={{width: '50vw'}}>

                            </div>
                        ) : (
                            <div style={{width: '95vw'}} className="m-auto">
                                <div className="adminFont fontInfoForPricing">
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
                                    {pricesThis.priceForThisUnitOfPorizka}грн. * {pricesThis.skolko}шт.
                                    = {pricesThis.priceForThisUnitOfPorizka * pricesThis.skolko}грн. - Ціна за порізку
                                </div>
                                <div className="adminFont fontInfoForPricing">
                                    {pricesThis.priceForThisUnitOfMontajka}грн. * {pricesThis.skolko}шт.
                                    = {pricesThis.priceForThisUnitOfMontajka * pricesThis.skolko}грн. - Ціна за монтажну
                                    плівку
                                </div>
                                <div className="adminFont fontInfoForPricing">
                                    {pricesThis.priceForDrukThisUnit}грн. * {pricesThis.skolko}шт.
                                    = {pricesThis.priceForDrukThisUnit * pricesThis.skolko}грн. - Ціна за друк
                                </div>
                                <div className="adminFont fontInfoForPricing">
                                    {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}+
                                    {pricesThis.priceForDrukThisUnit * pricesThis.skolko}=
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
                    </MDBContainer>
                </div>
                {thisOrder && (
                    <div className="btn btn-light" onClick={addNewOrderUnit}>
                        ДОДАТИ ДО ЗАМОВЛЕННЯ
                    </div>
                )}
            </div>
    </div>
    ) : (
            <div
                style={{display: "none"}}
            ></div>
        )}
</>
        )
    }

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default Plotter;