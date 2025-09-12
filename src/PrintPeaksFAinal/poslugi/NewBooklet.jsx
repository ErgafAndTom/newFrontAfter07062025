import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import versantIcon from "../../components/newUIArtem/printers/group-1468.svg";
import {useNavigate} from "react-router-dom";
import NewNoModalSizeNote from "./newnomodals/note/NewNoModalSizeNote";
import Materials2NoteFront from "./newnomodals/note/Materials2NoteFront";
import Materials2NoteBack from "./newnomodals/note/Material2NoteBack";
import PerepletPerepletBooklet from "./newnomodals/PerepletPerepletBooklet";
import BigInBooklet from "./newnomodals/BigInBooklet";
import evroskoba from "../evroscoba.png";

const NewBooklet = ({
                        thisOrder,
                        newThisOrder,
                        setNewThisOrder,
                        selectedThings2,
                        setShowNewBooklet,
                        setThisOrder,
                        setSelectedThings2,
                        showNewBooklet
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
            setShowNewBooklet(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowNewBooklet(true);
    }, []);


    const [size, setSize] = useState({
        x: 148,
        y: 210
    });

    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState([]);
    const [pricesThis, setPricesThis] = useState(null);
    const [selectedService, setSelectedService] = useState("Буклет");

    const [material, setMaterial] = useState({
        type: "Не потрібно",
        thickness: "",
        material: "",
        materialId: "",
        typeUse: ""
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

    const [cute, setCute] = useState("Не потрібно");
    const [porizka, setPorizka] = useState({type: "Не потрібно"});
    const [big, setBig] = useState("Не потрібно");
    const [cuteLocal, setCuteLocal] = useState({
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("");

    const [materialAndDrukBody, setMaterialAndDrukBody] = useState({
        materialType: "Папір",
        materialTypeUse: "Офісний",
        drukColor: "Не потрібно",
        drukSides: "односторонній",
        drukId: "Не потрібно",
        thickness: "",
        material: "",
        materialId: "",
        laminationType: "Не потрібно",
        laminationTypeUse: "",
        laminationmaterial: "",
        laminationmaterialId: "",
        typeUse: ""
    });
    const [materialAndDrukInBody, setMaterialAndDrukInBody] = useState({
        ColorDrukMaterialType: "Не потрібно",
        BwDrukMaterialType: "Не потрібно",
        NonDrukMaterialType: "Не потрібно",

        ColorDrukMaterialTypeUse: "Офісний",
        BwDrukMaterialTypeUse: "Офісний",
        NonDrukMaterialTypeUse: "Офісний",

        ColorDrukLaminationType: "Не потрібно",
        BwDrukLaminationType: "Не потрібно",
        NonDrukLaminationType: "Не потрібно",

        ColorDrukLaminationTypeUse: "З глянцевим ламінуванням",
        BwDrukLaminationTypeUse: "З глянцевим ламінуванням",
        NonDrukLaminationTypeUse: "З глянцевим ламінуванням",

        ColorDrukLaminationMaterial: "Не потрібно",
        BwDrukLaminationMaterial: "Не потрібно",
        NonDrukLaminationMaterial: "Не потрібно",

        ColorDrukLaminationMaterialId: "",
        BwDrukLaminationMaterialId: "",
        NonDrukLaminationMaterialId: "",

        ColorDrukMaterial: "",
        BwDrukMaterial: "",
        NonDrukMaterial: "",

        ColorDrukMaterialId: "",
        BwDrukMaterialId: "",
        NonDrukMaterialId: "",
        typeUse: "",
        // Додаємо окремі кількості для кожної гілки
        colorCount: 1,
        bwCount: 1,
        nonCount: 1
    });

    const [materialAndDrukFront, setMaterialAndDrukFront] = useState({
        materialType: "Папір",
        materialTypeUse: "Цупкий",
        drukColor: "Кольоровий",
        drukSides: "односторонній",
        drukId: "Не потрібно",
        thickness: "",
        material: "",
        materialId: "",
        laminationType: "Не потрібно",
        laminationTypeUse: "З глянцевим ламінуванням",
        laminationmaterial: "",
        laminationmaterialId: "",
        typeUse: "",
        big: "Не потрібно"
    });
    const [materialAndDrukBack, setMaterialAndDrukBack] = useState({
        materialType: "Папір",
        materialTypeUse: "Офісний",
        drukColor: "Чорнобілий",
        drukSides: "двосторонній",
        drukId: "Не потрібно",
        thickness: "",
        material: "",
        materialId: "",
        laminationType: "Не потрібно",
        laminationTypeUse: "З глянцевим ламінуванням",
        laminationmaterial: "",
        laminationmaterialId: "",
        typeUse: "",
        count: 12
    });

    const [pereplet, setPereplet] = useState({
        type: "",
        material: "",
        materialId: "",
        size: ">120",
        typeUse: "Брошурування до 120 аркушів"
    });

    useEffect(() => {
        let dataToSend = {
            type: "Note",
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
            materialAndDrukFront: materialAndDrukFront,
            materialAndDrukInBody: materialAndDrukInBody,
            materialAndDrukBack: materialAndDrukBack,
        }

        // Додаємо порізку тільки якщо вона вказана (тип не "Не потрібно")
        if (porizka.type !== "Не потрібно") {
            dataToSend.porizka = porizka;
        }
        // console.log(dataToSend);
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                setPricesThis(response.data.prices)
                setError(null)
            })
            .catch(error => {
                setError(error)
                // if (error.response.status === 403) {
                //     navigate('/login');
                // }
                console.log(error.message);
            })
    }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, porizka, materialAndDrukFront, materialAndDrukBack, pereplet]);

    useEffect(() => {
        if (showNewBooklet) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showNewBooklet]);

    useEffect(() => {
        let color = 0;
        let bw = 0;
        let nonDruk = 0;
        if (materialAndDrukInBody.ColorDrukMaterialType !== "Не потрібно") {
            color = materialAndDrukInBody.colorCount
        }
        if (materialAndDrukInBody.BwDrukMaterialType !== "Не потрібно") {
            bw = materialAndDrukInBody.bwCount
        }
        if (materialAndDrukInBody.NonDrukMaterialType !== "Не потрібно") {
            nonDruk = materialAndDrukInBody.nonCount
        }
        let allPapers = 2 + materialAndDrukBack.count;
        if (allPapers <= 120) {
            setPereplet({
                ...pereplet,
                size: "<120",
                typeUse: "Брошурування до 120 аркушів"
            })
        } else if (allPapers > 120 && allPapers <= 280) {
            setPereplet({
                ...pereplet,
                size: ">120",
                typeUse: "Брошурування від 120 до 280 аркушів"
            })
        } else {
            setPereplet({
                ...pereplet,
                size: "",
                typeUse: ""
            })
        }
    }, [materialAndDrukBack.count]);

    const addNewOrderUnit = e => {
        let toCalcData = {
            nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
            type: "Note",
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
            materialAndDrukFront: materialAndDrukFront,
            materialAndDrukInBody: materialAndDrukInBody,
            materialAndDrukBack: materialAndDrukBack,
        };

        // Додаємо порізку тільки якщо вона вказана (тип не "Не потрібно")
        if (porizka.type !== "Не потрібно") {
            toCalcData.porizka = porizka;
        }

        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: toCalcData
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setThisOrder(response.data);
                // setSelectedThings2(response.data.order.OrderUnits || []);
                setSelectedThings2(response.data.OrderUnits);
                setShowNewBooklet(false)
            })
            .catch(error => {
                // if (error.response.status === 403) {
                //     navigate('/login');
                // }
                console.log(error.message);
                // setErr(error)
            });
    }

    // Додаємо useEffect для відстеження змін у згинанні
    useEffect(() => {
        if (materialAndDrukFront.big && materialAndDrukFront.big !== "Не потрібно") {
            // console.log('Згинання активовано:', materialAndDrukFront.big);
        }
    }, [materialAndDrukFront.big]);

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
                                {/*<div className="d-flex flex-wrap justify-content-center">*/}
                                {/*    {["Буклета", "Автореферата", "Конспекта", "Звіта", "Журнала", "Зіна", "Брошури", "Методички"].map((service, index) => (*/}
                                {/*        <button*/}
                                {/*            key={index}*/}
                                {/*            className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}*/}
                                {/*            style={{minWidth: "5vw"}}*/}
                                {/*            onClick={() => setSelectedService(service)}*/}
                                {/*        >*/}
                                {/*            {service}*/}
                                {/*        </button>*/}
                                {/*    ))}*/}
                                {/*</div>*/}
                              <div className="d-flex flex-wrap justify-content-center">
                                    {["Буклет", "Автореферат", "Конспект", "Звіт", "Журнал", "Зін", "Брошура", "Методичка"].map((service, index) => (
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
                                    marginTop: "0.5vw",
                                    marginRight: "0.5vw"

                                }}
                                onClick={handleClose}
                            >
                            </div>
                        </div>

                        <div className="d-flex flex-column" style={{}}>
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
                                <NewNoModalSizeNote
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
                                <div className="d-flex">
                                    <Materials2NoteFront
                                        materialAndDrukFront={materialAndDrukFront}
                                        setMaterialAndDrukFront={setMaterialAndDrukFront}
                                        count={count}
                                        setCount={setCount}
                                        prices={prices}
                                        size={size}
                                        selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                        name={"Обкладинки:"}
                                        buttonsArr={["Офісний", "Тонкий",
                                            "Середній",
                                            "Цупкий"]}
                                        buttonsArrDruk={["односторонній", "двосторонній",]}
                                        buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
                                        buttonsArrLamination={["З глянцевим ламінуванням",
                                            "З матовим ламінуванням",
                                            "З ламінуванням Soft Touch",]}
                                        typeUse={null}
                                    />

                                    <Materials2NoteBack
                                        materialAndDrukBack={materialAndDrukBack}
                                        setMaterialAndDrukBack={setMaterialAndDrukBack}
                                        count={count}
                                        setCount={setCount}
                                        prices={prices}
                                        size={size}
                                        selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                        name={"Чорно-білий друк на монохромному принтері:"}
                                        buttonsArr={["Офісний", "Тонкий",
                                            "Середній",
                                            "Цупкий"]}
                                        buttonsArrDruk={["односторонній", "двосторонній",]}
                                        buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
                                        buttonsArrLamination={["З глянцевим ламінуванням",
                                            "З матовим ламінуванням",
                                            "З ламінуванням Soft Touch",]}
                                        typeUse={null}
                                    />
                                </div>


                                <PerepletPerepletBooklet
                                    size={size}
                                    pereplet={pereplet}
                                    setPereplet={setPereplet}
                                    prices={prices}
                                    type={"SheetCut"}
                                    buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів",]}
                                    defaultt={"А3 (297 х 420 мм)"}
                                />

                            </div>
                            {/*<NoteVisual pages={materialAndDrukBack.count}*/}
                            {/*          initialWidth={size.x}*/}
                            {/*          initialHeight={size.y}/>*/}
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
                                            height: '3vw',
                                        }}
                                    >
                                        <button className="adminButtonAdd" variant="danger" onClick={addNewOrderUnit}
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
                                <div className="d-flex justify-content-between pricesBlockContainer">
                                    <div className="">

                                        <div className="d-flex " style={{}}>
                                            <div className="d-flex flex-column">
                                                <div className="fontInfoForPricing">
                                                    <strong>Обкладинки:</strong>
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Друк: {pricesThis.priceDrukFront} грн * {pricesThis.sheetCount} шт
                                                    = {(pricesThis.priceDrukFront * pricesThis.sheetCount).toFixed(2)} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Матеріали: {pricesThis.priceMaterialFront} грн
                                                    * {pricesThis.sheetCount} шт
                                                    = {(pricesThis.priceMaterialFront * pricesThis.sheetCount).toFixed(2)} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Ламінація: {pricesThis.priceLaminationFront} грн
                                                    * {pricesThis.sheetCount} шт
                                                    = {(pricesThis.priceLaminationFront * pricesThis.sheetCount).toFixed(2)} грн
                                                </div>
                                                {materialAndDrukFront.big !== "Не потрібно" && (
                                                    <div className="fontInfoForPricing">
                                                        Згинання: {pricesThis?.big?.pricePerUnit || 0} грн
                                                        * {pricesThis?.big?.count || 0} шт
                                                        = {pricesThis?.big?.totalPrice || 0} грн
                                                    </div>
                                                )}
                                                <div className="fontInfoForPricing">
                                                    <strong> Загалом: {pricesThis.totalSheetPriceFront} грн</strong>
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Використано {pricesThis.sheetCount} шт A3+
                                                </div>

                                            </div>
                                            <div className="d-flex flex-column" style={{marginLeft: '2vw'}}>
                                                <div className="fontInfoForPricing">
                                                    <strong>Блок:</strong>
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Друк: {pricesThis.priceDrukBack} грн
                                                    * {pricesThis.sheetCountBack} шт
                                                    = {(pricesThis.priceDrukBack * pricesThis.sheetCountBack).toFixed(2)} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Материали: {pricesThis.priceMaterialBack} грн
                                                    * {pricesThis.sheetCountBack} шт
                                                    = {(pricesThis.priceMaterialBack * pricesThis.sheetCountBack).toFixed(2)} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Ламінація: {pricesThis.priceLaminationBack} грн
                                                    * {pricesThis.sheetCountBack} шт
                                                    = {(pricesThis.priceLaminationBack * pricesThis.sheetCountBack).toFixed(2)} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    <strong> Загалом: {pricesThis.totalSheetPriceBack} грн</strong>
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Використано {pricesThis.sheetCountBack} шт A3+
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column" style={{marginLeft: '2vw'}}>
                                                <div className="fontInfoForPricing">
                                                    <strong>Брошурування:</strong>
                                                </div>

                                                <div className="fontInfoForPricing">
                                                  {pereplet.material}: {pricesThis.pricePerepletUnit} грн * {count} шт
                                                    = {pricesThis.totalPerepletPrice} грн
                                                </div>
                                              <div className="fontInfoForPricing">
                                                <strong> Загалом: {pricesThis.totalPerepletPrice} грн</strong>
                                              </div>
                                            </div>
                                        </div>


                                        {/* Итоговые данные */}
                                        <div className="fontInfoForPricing1" style={{marginTop: '0.5vw', color: '#ee3c23'}}>
                                            Загальна сума: {pricesThis.price} грн
                                        </div>
                                        <div className="fontInfoForPricing">
                                          Тиражування відбувається кратно {pricesThis.sheetsPerUnit/2} шт
                                        </div>

                                        <div className="fontInfoForPricing">
                                            Ціна за 1 шт: {pricesThis.priceForItemWithExtras} грн
                                        </div>
                                    </div>


                                    <img
                                        className="versant80-img-icon"
                                        alt="sssss"
                                        src={evroskoba}
                                        style={{
                                            width: "7vw",
                                            height: "18vh",
                                          marginRight:"1vw",
                                            justifyContent: "center",
                                        }}
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

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default NewBooklet;
