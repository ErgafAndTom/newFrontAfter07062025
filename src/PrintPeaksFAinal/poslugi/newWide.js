import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import './newnomodals/ArtemStyles.css';
import versantIcon from "../public/wided@2x.png";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import {useNavigate} from "react-router-dom";
import Loader from "../../components/calc/Loader";

const NewWide = ({
                     thisOrder,
                     newThisOrder,
                     setNewThisOrder,
                     selectedThings2,
                     setShowNewWide,
                     showNewWide,
                     setThisOrder,
                     setSelectedThings2
                 }) => {
    // const [show, setShow] = useState(false);
    let handleChange = (e) => {
        setCount(e)
    }
    const navigate = useNavigate();
    const [load, setLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowNewWide(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowNewWide(true);
    }, []);


    const [size, setSize] = useState({
        x: 420,
        y: 594
    });
    const [material, setMaterial] = useState({
        type: "Папір Широкоформат",
        thickness: "",
        material: "",
        materialId: ""
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
    const [cuteLocal, setCuteLocal] = useState({
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("Не потрібно");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);
    const [selectedService, setSelectedService] = useState("Плаката");

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: `Друк ${selectedService ? selectedService + " " : ""}`,
                type: "Wide",
                size: size,
                material: material,
                color: color,
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
                setShowNewWide(false)
            })
            .catch(error => {
              setError(error);
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
                // setErr(error)
            });
    }

    // useEffect(() => {
    //     axios.get(`/getpricesNew`)
    //         .then(response => {
    //             // console.log(response.data);
    //             setPrices(response.data)
    //         })
    //         .catch(error => {
    //             console.log(error.message);
    //         })
    // }, []);

    useEffect(() => {
        let dataToSend = {
            type: "Wide",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            cuteLocal: cuteLocal,
            holes: holes,
            holesR: holesR,
            count: count,
        }
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setPricesThis(response.data.prices)
                setError(null)
            })
            .catch(error => {
                console.log(error.message);
                setError(error)
            })
    }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

    useEffect(() => {
        if (showNewWide) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showNewWide]);

    return (
        <>
            {isVisible ? (
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
                            <div className="m-auto text-center fontProductName">
                                <div className="d-flex flex-wrap justify-content-center">
                                    {["Плаката", "Креслення", "Фотографії", "Афіши", "Лекала", "Холста"].map((service, index) => (
                                        <button
                                            key={index}
                                            className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}
                                            style={{minWidth: "5vw"}}
                                            onClick={() => setSelectedService(service)}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
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
                        <div className="d-flex flex-column  " style={{marginLeft: '-1vw'}}>
                            <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                                marginLeft: "2.5vw",
                                border: "transparent",
                                justifyContent: "left",
                                marginTop: "1vw"
                            }}> У кількості:
                                <input
                                    className="d-flex inputsArtemNumber inputsArtem "
                                    style={{
                                        marginLeft: "1vw",

                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingLeft: "0.5vw",

                                    }}
                                    type="number"
                                    value={count}
                                    min={1}
                                    // disabled
                                    onChange={(event) => handleChange(event.target.value)}
                                />
                                <div className="inputsArtemx allArtemElem"
                                     style={{border: "transparent", marginTop: "-2vh"}}> шт
                                </div>
                            </div>
                            <MDBContainer

                                fluid
                                style={{width: '100%', marginTop: '1vw'}}
                            >
                                <Row xs={1} md={6} className="d-flex">
                                    <div className="d-flex flex-column">
                                        <NewNoModalSize
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"Wide"}
                                            buttonsArr={["односторонній"]}
                                            color={color}
                                            setColor={setColor}
                                            count={count}
                                            setCount={setCount}

                                        />
                                        <SliderComponent
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"Wide"}
                                            buttonsArr={["односторонній"]}
                                            color={color}
                                            setColor={setColor}
                                            count={count}
                                            setCount={setCount}

                                        />
                                        <Materials2
                                            material={material}
                                            setMaterial={setMaterial}
                                            count={count}
                                            setCount={setCount}
                                            prices={prices}
                                            size={size}
                                            selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                            name={"Широкоформатний фотодрук:"}
                                            buttonsArr={[]}
                                        />
                                    </div>
                                    {/*<NewSizesButtons*/}
                                    {/*    size={size}*/}
                                    {/*    setSize={setSize}*/}
                                    {/*/>*/}
                                </Row>
                                {/*{data.rows.map((item) => (*/}
                                {/*"proxy": "http://127.0.0.1:3000",*/}
                                {/*    <CardProduct key={item.id} name={name} data={data} setData={setData} item={item}/>*/}
                                {/*))}*/}
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between justify-content-between"
                                            style={{
                                                width: "90vw",
                                                marginLeft: "2.5vw",
                                                fontFamily: "inter",
                                                fontWeight: "bold",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",
                                                // cursor: "pointer",
                                                height: '5vw',
                                            }}
                                        >
                                            <button className="adminButtonAdd" variant="danger"
                                                    onClick={addNewOrderUnit}
                                            >
                                                Додати до замовлення
                                            </button>
                                        </div>
                                    )}
                                </div>
                              {error &&
                                <div style={{
                                  transition: "all 0.3s ease",
                                  color: "red",
                                  width: "20vw",
                                  marginLeft: "2.5vw",
                                  fontFamily: "inter",
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  height: '3vw',
                                  marginTop: "1vh",
                                  marginBottom: "1vh",
                                  border: "1px solid red",
                                  borderRadius: "10px",
                                  padding: "10px",
                                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                                  fontSize: "1.5vw",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  cursor: "pointer",

                                }}>{error.response.data.error}</div>
                              }
                                {null === pricesThis ? (
                                    <div style={{width: '50vw'}}>

                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between pricesBlockContainer"
                                         style={{height: '20vmin'}}>
                                        <div className="" style={{height: '19vmin'}}>
                                            {/* Друк (рахується за sheetCount) */}
                                            <div className="fontInfoForPricing">
                                                Друк: {parseFloat(pricesThis.priceDrukPerSheet).toFixed(2)} грн
                                                * {pricesThis.sheetCount} м2
                                                = {(parseFloat(pricesThis.priceDrukPerSheet) * pricesThis.sheetCount).toFixed(2)} грн
                                            </div>

                                            {/* Матеріали (папір, рахуються за sheetCount) */}
                                            <div className="fontInfoForPricing">
                                                Матеріали: {parseFloat(pricesThis.pricePaperPerSheet).toFixed(2)} грн
                                                * {pricesThis.sheetCount} м2
                                                = {(parseFloat(pricesThis.pricePaperPerSheet) * pricesThis.sheetCount).toFixed(2)} грн
                                            </div>

                                            {/* Ламінація (рахується за sheetCount) */}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ламінація: {parseFloat(pricesThis.priceLaminationPerSheet).toFixed(2)} грн * {pricesThis.sheetCount} м2 = {(parseFloat(pricesThis.priceLaminationPerSheet) * pricesThis.sheetCount).toFixed(2)} грн*/}
                                            {/*</div>*/}

                                            {/* Додаткова послуга "Порізка" */}
                                            {pricesThis.porizka !== 0 && (
                                                <div className="fontInfoForPricing">
                                                    Порізка: {parseFloat(pricesThis.porizka).toFixed(2)} грн
                                                    * {pricesThis.sheetCount} шт
                                                    = {(parseFloat(pricesThis.porizka) * pricesThis.sheetCount).toFixed(2)} грн
                                                </div>
                                            )}

                                            {/* Підсумкова вартість замовлення */}
                                            <div className="fontInfoForPricing1">
                                                Загалом: {parseFloat(pricesThis.price).toFixed(2)} грн
                                            </div>

                                            {/* Інформація про кількість аркушів */}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    - З одного аркуша {pricesThis.listsFromBd} можливо зробити {pricesThis.sheetsPerUnit} виробів*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    - Затрачено {pricesThis.sheetCount} аркушів {pricesThis.listsFromBd}*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Вартість 1 аркуша {pricesThis.listsFromBd}: {parseFloat(pricesThis.unitSheetPrice).toFixed(2)} грн*/}
                                            {/*</div>*/}

                                            {/* Розрахунок ціни за виріб (зі всіма допами) */}
                                            <div className="fontInfoForPricing1">
                                                Ціна за
                                                виріб: {parseFloat(pricesThis.priceForItemWithExtras).toFixed(2)} грн
                                            </div>

                                            {/* Додатковий розрахунок ціни за лист */}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за аркуш (зі всіма допами): {parseFloat(pricesThis.priceForSheetWithExtras).toFixed(2)} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за аркуш (лише матеріал та друк): {parseFloat(pricesThis.priceForSheetMaterialPrint).toFixed(2)} грн*/}
                                            {/*</div>*/}
                                        </div>

                                        <img
                                            className="versant80-img-icon"
                                            alt="sssss"
                                            src={versantIcon}
                                            style={{
                                                height: "17vmin",
                                                marginRight: "2vmin",

                                            }}
                                        />
                                    </div>
                                )}
                            </MDBContainer>
                        </div>
                        {/*{thisOrder && (*/}
                        {/*    <div className="btn btn-light" onClick={handleThingClickAndHide}>*/}
                        {/*        ДОДАТИ ДО ЗАМОВЛЕННЯ*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            ) : (
                <div
                    style={{display: "none"}}
                ></div>
            )}
        </>
    )

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default NewWide;
