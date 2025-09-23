import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import NewNoModalSize from "./newnomodals/NewNoModalSize";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import versantIcon from '../../components/newUIArtem/printers/p7.svg';
import Materials2 from "./newnomodals/Materials2";
import {useNavigate} from "react-router-dom";
import Loader from "../../components/calc/Loader";

const PerepletNeMet = ({
                         thisOrder,
                         newThisOrder,
                         setNewThisOrder,
                         selectedThings2,
                         setShowPerepletNeMet,
                         setThisOrder,
                         setSelectedThings2,
                         showPerepletNeMet
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
            setShowPerepletNeMet(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowPerepletNeMet(true);
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
                nameOrderUnit: "PerepletNeMet",
                type: "PerepletNeMet",
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
                setShowPerepletNeMet(false)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
                // setErr(error)
            });
    }

    useEffect(() => {
        axios.get(`/getpricesNew`)
            .then(response => {
                // console.log(response.data);
                setPrices(response.data)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, []);

    useEffect(() => {
        let dataToSend = {
            type: "PerepletNeMet",
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
                setPricesThis(response.data.prices)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

    useEffect(() => {
        if (showPerepletNeMet) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showPerepletNeMet]);

    if (prices) {
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
                                    НЕ мет
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
                                            <NewNoModalSize
                                                size={size}
                                                setSize={setSize}
                                                prices={prices}
                                                type={"SheetCut"}
                                                buttonsArr={["односторонній", "двосторонній",]}
                                                color={color}
                                                setColor={setColor}
                                                count={count}
                                                setCount={setCount}
                                                defaultt={"А3 (297 х 420 мм)"}
                                            />
                                            {/*<NewNoModalMaterial*/}
                                            <Materials2
                                                material={material}
                                                setMaterial={setMaterial}
                                                count={count}
                                                setCount={setCount}
                                                prices={prices}
                                                selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                                name={"Чорно-білий друк на монохромному принтері:"}
                                                buttonsArr={["Тонкі",
                                                    "Середньої щільності",
                                                    "Цупкі", "Самоклеючі"]}
                                                typeUse={null}
                                            />
                                            <NewNoModalLamination
                                                lamination={lamination}
                                                setLamination={setLamination}
                                                prices={prices}
                                                type={"SheetCut"}
                                                buttonsArr={["З глянцевим ламінуванням",
                                                    "З матовим ламінуванням",
                                                    "З ламінуванням Soft Touch",]}
                                                selectArr={["30", "80", "100", "125", "250"]}
                                            />
                                            <NewNoModalCornerRounding
                                                big={big}
                                                setBig={setBig}
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
                                </MDBContainer>
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between justify-content-between"
                                            style={{
                                                width: "90vw",
                                                marginLeft: "2.5vw",
                                                 ,


                                                fontWeight: "bold",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",
                                                height: '3vw',
                                            }}
                                        >
                                            <div
                                                className="btn btn-warning" style={{
                                                borderRadius: '0.627vw',
                                                // border: '0.08vw solid gray',
                                                padding: '0.2vw 0.7vw',
                                            }}
                                                onClick={addNewOrderUnit}
                                            >
                                                Додати до замовлення
                                            </div>
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
                                {null === pricesThis ? (
                                    <div style={{width: '50vw'}}>

                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between pricesBlockContainer">
                                        <div className="">

                                            <div className="fontInfoForPricing">
                                                Друк: {pricesThis.priceForDrukThisUnit} грн * {pricesThis.skolko} шт
                                                = {pricesThis.priceForDrukThisUnit * pricesThis.skolko} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Матеріали: {pricesThis.priceForThisUnitOfPapper}грн. * {pricesThis.skolko} шт
                                                = {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}грн.
                                            </div>

                                            <div className="fontInfoForPricing">
                                                Ламінація: {pricesThis.priceForThisUnitOfLamination} грн
                                                * {pricesThis.skolko} шт
                                                = {pricesThis.priceForThisAllUnitsOfLamination} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Згинання {pricesThis.priceForThisUnitOfBig} грн * {count} шт
                                                = {pricesThis.priceForAllUnitsOfBig} грн
                                            </div>
                                            <div className=" fontInfoForPricing">
                                                Свердління отворів: {pricesThis.priceForThisUnitOfCute} грн * {count} шт
                                                = {pricesThis.priceForAllUnitsOfCute} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Суруглення кутів: {pricesThis.priceForThisUnitOfHoles} грн * {count} шт
                                                = {pricesThis.priceForAllUnitsOfHoles} грн

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
                                            <div className="fontInfoForPricing">
                                                - З одного аркуша A3 можливо
                                                зробити {pricesThis.skolkoListovNaOdin} виробів
                                            </div>
                                            <div className="fontInfoForPricing">
                                                - Затрачено {pricesThis.skolko} аркушів (SR A3)
                                            </div>
                                        </div>


                                        <img
                                            className="versant80-img-icon"
                                            alt="sssss"
                                            src={versantIcon}
                                        />
                                    </div>
                                )}
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
    }

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default PerepletNeMet;
