import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";

import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import versantIcon from '../../components/newUIArtem/printers/p6.svg';
import {useNavigate} from "react-router-dom";
import PerepletSize from "./newnomodals/PerepletSize";
import PerepletPereplet from "./newnomodals/PerepletPereplet";

const PerepletMet = ({
                         thisOrder,
                         newThisOrder,
                         setNewThisOrder,
                         selectedThings2,
                         setShowPerepletMet,
                         setThisOrder,
                         setSelectedThings2,
                         showPerepletMet,
                         editingOrderUnit,
                         setEditingOrderUnit,
}) => {
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const safeSetShowPerepletMet = useCallback((val) => {
        if (typeof setShowPerepletMet === "function") setShowPerepletMet(val);
    }, [setShowPerepletMet]);

    const safeSetEditingOrderUnit = useCallback((val) => {
        if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
    }, [setEditingOrderUnit]);

    const parseOptionsJson = useCallback((s) => {
        if (!s) return null;
        try {
            return typeof s === "string" ? JSON.parse(s) : s;
        } catch (e) {
            console.warn("PerepletMet: failed to parse optionsJson", e);
            return null;
        }
    }, []);

    const isEdit = Boolean(editingOrderUnit && (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey));

    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            safeSetShowPerepletMet(false);
            safeSetEditingOrderUnit(null);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowPerepletMet(true);
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
    const [pereplet, setPereplet] = useState({
        type: "",
        thickness: "Тонкі",
        material: "",
        materialId: "",
        size: "<120",
        typeUse: "Брошурування до 120 аркушів"
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

    const resetDefaults = useCallback(() => {
        setSize({ x: 210, y: 297 });
        setMaterial({
            type: "Не потрібно",
            thickness: "Тонкі",
            material: "",
            materialId: "",
            typeUse: null
        });
        setPereplet({
            type: "",
            thickness: "Тонкі",
            material: "",
            materialId: "",
            size: "<120",
            typeUse: "Брошурування до 120 аркушів"
        });
        setColor({
            sides: "Не потрібно",
            one: "",
            two: "",
            allSidesColor: "CMYK",
        });
        setLamination({
            type: "Не потрібно",
            material: "",
            materialId: "",
            size: ""
        });
        setBig("Не потрібно");
        setCute("Не потрібно");
        setCuteLocal({
            leftTop: false,
            rightTop: false,
            rightBottom: false,
            leftBottom: false,
            radius: "",
        });
        setHoles("Не потрібно");
        setHolesR("");
        setCount(1);
        setError(null);
    }, []);

    // Hydrate form on open (edit like Vishichka)
    useEffect(() => {
        if (!showPerepletMet) return;

        if (!isEdit) {
            resetDefaults();
            return;
        }

        const opt = parseOptionsJson(editingOrderUnit?.optionsJson) || {};
        if (opt.size) setSize(opt.size);
        if (opt.material) setMaterial(opt.material);
        if (opt.pereplet) setPereplet(opt.pereplet);
        if (opt.color) setColor(opt.color);
        if (opt.lamination) setLamination(opt.lamination);
        if (opt.big !== undefined) setBig(opt.big);
        if (opt.cute !== undefined) setCute(opt.cute);
        if (opt.cuteLocal) setCuteLocal(opt.cuteLocal);
        if (opt.holes !== undefined) setHoles(opt.holes);
        if (opt.holesR !== undefined) setHolesR(opt.holesR);

        const c =
            opt.count ??
            editingOrderUnit?.amount ??
            editingOrderUnit?.newField5 ??
            1;
        setCount(Number(c) || 1);

        setError(null);
    }, [showPerepletMet, isEdit, editingOrderUnit, parseOptionsJson, resetDefaults]);



    const saveOrderUnit = () => {
        const unitId = editingOrderUnit?.id || editingOrderUnit?.ID || editingOrderUnit?.idKey || null;
        const opt = parseOptionsJson(editingOrderUnit?.optionsJson) || {};
        const nameOrderUnit = opt?.nameOrderUnit || "Брошурування";

        const dataToSend = {
            orderId: thisOrder.id,
            ...(isEdit ? { orderUnitId: unitId, idKey: editingOrderUnit?.idKey } : {}),
            toCalc: {
                nameOrderUnit,
                type: "PerepletMet",
                size,
                material,
                color,
                lamination,
                big,
                cute,
                cuteLocal,
                holes,
                holesR,
                count,
                pereplet,
            }
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                setThisOrder(response.data);
                setSelectedThings2(response.data.OrderUnits);
                safeSetShowPerepletMet(false);
                safeSetEditingOrderUnit(null);
            })
            .catch(error => {
                if (error?.response?.status === 403) navigate('/login');
                console.log(error.message);
            });
    }


    let handleChange = (e) => {
        setCount(e)
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
        if (!showPerepletMet) return;
        let dataToSend = {
            type: "PerepletMet",
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
            pereplet: pereplet,
        }
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                // console.log(response.data);
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
    }, [showPerepletMet, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, pereplet]);

    useEffect(() => {
        if (showPerepletMet) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showPerepletMet]);

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
                                {/*Перепліт*/}
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
                        <div className="d-flex flex-column" style={{marginLeft: "1vw", marginTop: "1vw"}}>
                            <MDBContainer fluid style={{width: '100%'}}>
                                <Row xs={1} md={6} className="">
                                    <div className="d-flex flex-column">
                                        <PerepletSize
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
                                        <PerepletPereplet
                                            size={size}
                                            pereplet={pereplet}
                                            setPereplet={setPereplet}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів",]}
                                            defaultt={"А3 (297 х 420 мм)"}
                                        />


                                    </div>
                                </Row>
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between justify-content-between"
                                            style={{
                                                width: "90vw",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",
                                                height: '3vw',
                                            }}
                                        >
                                            <button className="adminButtonAdd" variant="danger"
                                                    onClick={saveOrderUnit}
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
                                         style={{height: '20vmin'}}>
                                        <div className="" style={{height: '19vmin'}}>

                                            <div className="fontInfoForPricing">
                                                Прошивка {pricesThis.priceForOneOfPereplet} грн * {count} шт
                                                = {pricesThis.price} грн
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
                                                width: "13vw",

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

export default PerepletMet;
