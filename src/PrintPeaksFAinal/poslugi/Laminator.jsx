import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import versantIcon from '../../components/newUIArtem/printers/p8_.png';
import {useNavigate} from "react-router-dom";
import LaminationSize from "./newnomodals/LaminationSize";

const Laminator = ({
                       thisOrder,
                       newThisOrder,
                       setNewThisOrder,
                       selectedThings2,
                       setShowLaminator,
                       setThisOrder,
                       setSelectedThings2,
                       showLaminator
                   }) => {
    let handleChange = (e) => {
        setCount(e)
    }
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowLaminator(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowLaminator(true);
    }, []);


    const [size, setSize] = useState({
        x: 210,
        y: 297
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
        size: "",
        typeUse: "А3",
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
    const [holesR, setHolesR] = useState("");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState([]);
    const [pricesThis, setPricesThis] = useState(null);

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: `Ламінація`,
                type: "Laminator",
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
                setShowLaminator(false)
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

    useEffect(() => {
        let dataToSend = {
            type: "Laminator",
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
                // console.log(response.data.prices);
                setPricesThis(response.data.prices)
                setError(null)
            })
            .catch(error => {
                setError(error)
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [material, color, lamination.materialId, big, cute, cuteLocal, holes, holesR, count]);

    useEffect(() => {
        if (showLaminator) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showLaminator]);

    return (
        <>
            {isVisible === true ? (
                <div>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 15, 15, 0.45)',
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        zIndex: 99,
                        opacity: isAnimating ? 1 : 0,
                        transition: 'opacity 200ms ease'
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
                            <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                                marginLeft: "1.7vw",
                                border: "transparent",
                                justifyContent: "left",
                                marginTop: "1vw"
                            }}> У кількості:
                                <input
                                    className="d-flex inputsArtemNumber inputsArtem "
                                    style={{
                                        marginLeft: "1vw",
                                        width: "5vw",
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
                            <MDBContainer fluid style={{width: '100%'}}>
                                <Row xs={1} md={6} className="">
                                    <div className="d-flex flex-column">
                                        <LaminationSize
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"BigOvshik"}
                                            buttonsArr={["односторонній", "двосторонній",]}
                                            color={color}
                                            setColor={setColor}
                                            count={count}
                                            setCount={setCount}
                                            defaultt={"А3 (297 х 420 мм)"}
                                        />
                                        {/*<NewNoModalMaterial*/}
                                        {/*<Materials2*/}
                                        {/*    material={material}*/}
                                        {/*    setMaterial={setMaterial}*/}
                                        {/*    count={count}*/}
                                        {/*    setCount={setCount}*/}
                                        {/*    prices={prices}*/}
                                        {/*    selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}*/}
                                        {/*    name={"Чорно-білий друк на монохромному принтері:"}*/}
                                        {/*    buttonsArr={["Тонкі",*/}
                                        {/*        "Середньої щільності",*/}
                                        {/*        "Цупкі", "Самоклеючі"]}*/}
                                        {/*    typeUse={null}*/}
                                        {/*/>*/}
                                        <div className="d-flex" style={{marginLeft: "-1.5vw"}}>
                                            <NewNoModalLamination
                                                lamination={lamination}
                                                setLamination={setLamination}
                                                prices={prices}
                                                size={size}
                                                type={"Lamination"}
                                                buttonsArr={["з глянцевим ламінуванням",
                                                  "з матовим ламінуванням",
                                                  "з ламінуванням SoftTouch",
                                                  "з холодним матовим ламінуванням",]}
                                                selectArr={["30", "70", "80", "100", "125", "250"]}
                                            />
                                        </div>

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
                                                height: '3vw',
                                            }}
                                        >
                                            <button className="adminButtonAdd" variant="danger"
                                                    onClick={addNewOrderUnit}
                                            >
                                                Додати до замовлення
                                            </button>
                                            {/*<div*/}
                                            {/*    className="btn btn-warning" style={{*/}
                                            {/*    borderRadius: '0.627vw',*/}
                                            {/*    border: '0.08vw solid gray',*/}
                                            {/*    padding: '0.2vw 0.7vw',*/}
                                            {/*}}*/}
                                            {/*    // onClick={handleThingClickAndHide}*/}
                                            {/*>*/}
                                            {/*    Додати до пресетів*/}
                                            {/*</div>*/}
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

                                            <div className="fontInfoForPricing">
                                                Ламінація: {pricesThis.priceForThisUnitOfLamination} грн
                                                * {pricesThis.skolko} шт
                                                = {pricesThis.priceForThisAllUnitsOfLamination} грн
                                            </div>
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Згинання {pricesThis.priceForThisUnitOfBig} грн * {count} шт*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfBig} грн*/}
                                            {/*</div>*/}
                                            {/*<div className=" fontInfoForPricing">*/}
                                            {/*    Свердління отворів: {pricesThis.priceForThisUnitOfCute} грн * {count} шт*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfCute} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Суруглення кутів: {pricesThis.priceForThisUnitOfHoles} грн * {count} шт*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfHoles} грн*/}

                                            {/*</div>*/}
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
                                            className="lamination-img-icon"
                                            alt="sssss"
                                            src={versantIcon}

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

export default Laminator;
