import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import NewNoModalProkleka from "./newnomodals/NewNoModalProkleka";
import versantIcon from '../../components/newUIArtem/printers/binder.svg';
import {useNavigate} from "react-router-dom";
import LaminationSize from "./newnomodals/LaminationSize";
import SizeNoSize from "./newnomodals/SizeNoSize";

const BigOvshik = ({
                       thisOrder,
                       newThisOrder,
                       setNewThisOrder,
                       selectedThings2,
                       showBigOvshik,
                       setThisOrder,
                       setSelectedThings2,
                       setShowBigOvshik
                   }) => {
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowBigOvshik(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowBigOvshik(true);
    }, []);


    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [material, setMaterial] = useState({
        type: "Не потрібно",
        thickness: "Тонкі",
        material: "",
        materialId: "",
        typeUse: null
    });
    const [color, setColor] = useState({
        sides: "Не потрібно",
        one: "",
        two: "",
        allSidesColor: "CMYK",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "",
        materialId: "",
        size: ""
    });
    const [big, setBig] = useState("Не потрібно");
    // Використовуємо назву "prokleka" у коді, але в базі даних ціни зберігаються під назвою "Проклейка"
    const [prokleka, setProkleka] = useState("Не потрібно");
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
    const [prices, setPrices] = useState([]);
    const [pricesThis, setPricesThis] = useState(null);

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: "Післядрукарські роботи зі ",
                type: "BigOvshik",
                size: size,
                material: material,
                color: color,
                lamination: lamination,
                big: big,
                prokleka: prokleka,
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
                setShowBigOvshik(false)
            })
            .catch(error => {
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
    //             if(error.response.status === 403){
    //                 navigate('/login');
    //             }
    //             console.log(error.message);
    //         })
    // }, []);
    let handleChange = (e) => {
        setCount(e)
    }

    useEffect(() => {
        let dataToSend = {
            type: "BigOvshik",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            prokleka: prokleka,
            cute: cute,
            cuteLocal: cuteLocal,
            holes: holes,
            holesR: holesR,
            count: count,
        }
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                setPricesThis(response.data.prices)
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [size, material, color, lamination, big, prokleka, cute, cuteLocal, holes, holesR, count]);

    useEffect(() => {
        if (showBigOvshik) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showBigOvshik]);

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
                            <div className="m-auto text-center fontProductName">
                                {/*Биговщик / Постпресс*/}
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
                            <MDBContainer fluid style={{width: '100%'}}>
                                <Row xs={1} md={6} className="">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                                            marginLeft: "1.4vw",
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

                                        <NewNoModalCornerRounding
                                            big={big}
                                            setBig={setBig}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={[]}
                                            selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                                        />
                                        <NewNoModalProkleka
                                            prokleka={prokleka}
                                            setProkleka={setProkleka}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={[]}
                                            selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                                        />
                                        <NewNoModalCute
                                            cute={cute}
                                            setCute={setCute}
                                            cuteLocal={cuteLocal}
                                            setCuteLocal={setCuteLocal}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={[]}
                                            selectArr={["3", "6", "8", "10", "13"]}
                                        />
                                        <NewNoModalHoles
                                            holes={holes}
                                            setHoles={setHoles}
                                            holesR={holesR}
                                            setHolesR={setHolesR}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={[]}
                                            selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                        />
                                    </div>
                                </Row>
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between justify-content-between"
                                            style={{
                                                width: "90vw",
                                                marginLeft: "2.5vw",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",

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
                                    <div>{error.message}</div>
                                }
                                {null === pricesThis ? (
                                    <div style={{width: '50vw'}}>

                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between pricesBlockContainer"
                                         style={{height: "20vmin"}}>
                                        <div className="" style={{height: "19vmin"}}>

                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Друк: {pricesThis.priceForDrukThisUnit} грн * {pricesThis.skolko} шт*/}
                                            {/*    = {pricesThis.priceForDrukThisUnit * pricesThis.skolko} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Матеріали: {pricesThis.priceForThisUnitOfPapper}грн. * {pricesThis.skolko} шт*/}
                                            {/*    = {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}грн.*/}
                                            {/*</div>*/}

                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ламінація: {pricesThis.priceForThisUnitOfLamination} грн*/}
                                            {/*    * {pricesThis.skolko} шт*/}
                                            {/*    = {pricesThis.priceForThisAllUnitsOfLamination} грн*/}
                                            {/*</div>*/}
                                            <div className="fontInfoForPricing">
                                                Згинання {pricesThis.big.pricePerUnit} грн * {pricesThis.big.count} шт
                                                = {pricesThis.big.totalPrice} грн
                                            </div>
                                            {pricesThis.prokleka && pricesThis.prokleka !== "Не потрібно" && (
                                                <div className="fontInfoForPricing">
                                                    Проклейка {pricesThis.prokleka.pricePerUnit} грн
                                                    * {pricesThis.prokleka.count} шт
                                                    = {pricesThis.prokleka.totalPrice} грн
                                                </div>
                                            )}
                                            <div className="fontInfoForPricing">
                                                Свердління отворів: {pricesThis.cute.pricePerUnit} грн
                                                * {pricesThis.cute.count} шт
                                                = {pricesThis.cute.totalPrice} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Скруглення кутів: {pricesThis.holes.pricePerUnit} грн
                                                * {pricesThis.holes.count} шт
                                                = {pricesThis.holes.totalPrice} грн

                                            </div>
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}+*/}
                                            {/*    {pricesThis.priceForDrukThisUnit * pricesThis.skolko}+*/}
                                            {/*    {pricesThis.priceForThisAllUnitsOfLamination}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfBig}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfCute}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfHoles}=*/}
                                            {/*    {pricesThis.price}*/}
                                            {/*</div>*/}
                                            <div className="fontInfoForPricing1">
                                                Загалом: {pricesThis.price} грн
                                            </div>
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    - З одного аркуша A3 можливо*/}
                                            {/*    зробити {pricesThis.skolkoListovNaOdin} виробів*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    - Затрачено {pricesThis.skolko} аркушів (SR A3)*/}
                                            {/*</div>*/}
                                        </div>


                                        <img
                                            className="versant80-img-icon"
                                            alt="sssss"
                                            src={versantIcon}
                                            style={{
                                                height: "16vmin",
                                                marginLeft: "15vmin",
                                                marginRight: "2vmin",

                                            }}
                                        />
                                    </div>
                                )}
                            </MDBContainer>

                        </div>
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

export default BigOvshik;
