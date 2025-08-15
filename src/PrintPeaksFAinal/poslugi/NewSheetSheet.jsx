import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import versantIcon from "../public/versant80@2x.png";
import Materials2 from "./newnomodals/Materials2";
import {useNavigate} from "react-router-dom";
import PhotoPosluga from "./newnomodals/photo/PhotoPosluga";
import Porizka from "./newnomodals/Porizka";
import "../global.css"
import PerepletPereplet from "./newnomodals/PerepletPereplet";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

const NewSheetSheet = ({
                         thisOrder,
                         newThisOrder,
                         setNewThisOrder,
                         selectedThings2,
                         setShowNewSheetSheet,
                         setThisOrder,
                         setSelectedThings2,
                         showNewSheetSheet
                     }) => {

    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    let handleChange = (e) => {
        setCount(e)
    }
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowNewSheetSheet(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowNewSheetSheet(true);
    }, []);


    const [size, setSize] = useState({
        x: 310,
        y: 440
    });
    const [material, setMaterial] = useState({
        type: "Папір",
        thickness: "Цупкий",
        material: "Крейдований",
        materialId: "",
        typeUse: "Цупкий"
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
        materialId: "",
        size: ""
    });
    const [pereplet, setPereplet] = useState({
        type: "",
        thickness: "Тонкі",
        material: "",
        materialId: "",
        size: "<120",
        typeUse: "Брошурування до 120 аркушів"
    });
    const [big, setBig] = useState("Не потрібно");
    const [cute, setCute] = useState("Не потрібно");
    const [porizka, setPorizka] = useState({type: "Не потрібно"});
    const [cuteLocal, setCuteLocal] = useState({
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [Prokleyka, setProkleyka] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState([]);
    const [pricesThis, setPricesThis] = useState(null);
    const [selectedService, setSelectedService] = useState("");

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: `Друк ${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
                type: "SheetCut",
                size: size,
                material: material,
                color: color,
                lamination: lamination,
                big: big,
                cute: cute,
                cuteLocal: cuteLocal,
                Prokleyka: Prokleyka,
                holes: holes,
                holesR: holesR,
                count: count,
                porizka: porizka,
            }
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setThisOrder(response.data);
                // setSelectedThings2(response.data.order.OrderUnits || []);
                setSelectedThings2(response.data.OrderUnits);
                setShowNewSheetSheet(false)
            })
            .catch(error => {
                setError(error)
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.response);
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
      console.log(material);
      let dataToSend = {
            type: "SheetCut",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            Prokleyka: Prokleyka,
            cuteLocal: cuteLocal,
            holes: holes,
            holesR: holesR,
            count: count,
            porizka: porizka,
        }
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                setPricesThis(response.data.prices)
                setError(null)
            })
            .catch(error => {
                setError(error)
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.response);
            })
    }, [size, material, color, lamination.materialId, big, cute, cuteLocal, holes, holesR, count, porizka, Prokleyka]);

    useEffect(() => {
        if (showNewSheetSheet) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showNewSheetSheet]);

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
                                <div className="d-flex flex-wrap justify-content-center  ">
                                    {["Листівки", "Візитки", "Флаєра", "Буклета", "Картки", "Диплома", "Диплома", "Подяки", "Зіна", "Презентації", "Бланка", "Афіши", "Календаря", "Плаката", "Візуалізації", "Меню", "Документа"].map((service, index) => (
                                        <button
                                            key={index}
                                            className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}
                                            style={{minWidth: "4vw"}}
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
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                                marginLeft: "1.4vw",
                                border: "transparent",
                                justifyContent: "left",
                                marginTop: "1vw"
                            }}> У кількості:
                                <input
                                    className="d-flex inputsArtemNumber inputsArtem"
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
                            <MDBContainer fluid style={{width: '100%', marginLeft: '-1vw', marginTop: "2vh"}}>
                                <Row xs={1} md={6} className="">
                                    <div className="d-flex flex-column">
                                        <NewNoModalSize
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"SheetSheet"}
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
                                            size={size}
                                            selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                            name={"Чорно-білий друк на монохромному принтері:"}
                                            buttonsArr={["Офісний", "Тонкий",
                                                "Середній",
                                                "Цупкий", "Самоклеючі"]}
                                            typeUse={null}
                                        />
                                        <NewNoModalLamination
                                            lamination={lamination}
                                            setLamination={setLamination}
                                            prices={prices}
                                            size={size}
                                            type={"SheetCut"}
                                            buttonsArr={["з глянцевим ламінуванням",
                                                "з матовим ламінуванням",
                                                "з ламінуванням Soft Touch",]}
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
                                        {/*<NewNoModalCute*/}
                                        {/*    cute={cute}*/}
                                        {/*    setCute={setCute}*/}
                                        {/*    cuteLocal={cuteLocal}*/}
                                        {/*    setCuteLocal={setCuteLocal}*/}
                                        {/*    prices={prices}*/}
                                        {/*    type={"SheetCut"}*/}
                                        {/*    buttonsArr={[]}*/}
                                        {/*    selectArr={["3", "6", "8", "10", "13"]}*/}
                                        {/*/>*/}
                                        {/*<NewNoModalHoles*/}
                                        {/*    holes={holes}*/}
                                        {/*    setHoles={setHoles}*/}
                                        {/*    holesR={holesR}*/}
                                        {/*    setHolesR={setHolesR}*/}
                                        {/*    prices={prices}*/}
                                        {/*    type={"SheetCut"}*/}
                                        {/*    buttonsArr={[]}*/}
                                        {/*    selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}*/}
                                        {/*/>*/}

                                        {/*<NewNoModalProkleyka*/}
                                        {/*    Prokleyka={Prokleyka}*/}
                                        {/*    setProkleyka={setProkleyka}*/}
                                        {/*    prices={prices}*/}
                                        {/*    type={"SheetCut"}*/}
                                        {/*    buttonsArr={[]}*/}
                                        {/*    selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}*/}
                                        {/*/>*/}

                                        <Porizka
                                            porizka={porizka}
                                            setPorizka={setPorizka}
                                            prices={prices}
                                            type={"SheetCut"}
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
                                                fontFamily: "inter",
                                                fontWeight: "bold",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                // transition: "all 0.3s ease",
                                                height: '3vw',
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
                                         style={{height: "39vmin"}}>

                                        <div className="">
                                            {/* Друк (рахується за sheetCount) */}
                                            <div className="fontInfoForPricing">
                                                Друк: {pricesThis.priceDrukPerSheet.toFixed(2)} грн
                                                * {pricesThis.sheetCount} шт
                                                = {(pricesThis.priceDrukPerSheet * pricesThis.sheetCount).toFixed(2)} грн
                                            </div>

                                            {/* Матеріали (папір, рахуються за sheetCount) */}
                                            <div className="fontInfoForPricing">
                                                Матеріали: {pricesThis.pricePaperPerSheet.toFixed(2)} грн
                                                * {pricesThis.sheetCount} шт
                                                = {(pricesThis.pricePaperPerSheet * pricesThis.sheetCount).toFixed(2)} грн
                                            </div>

                                            {/* Ламінація (рахується за sheetCount) */}
                                            <div className="fontInfoForPricing">
                                                Ламінація: {pricesThis.priceLaminationPerSheet.toFixed(2)} грн
                                                * {pricesThis.sheetCount} шт
                                                = {(pricesThis.priceLaminationPerSheet * pricesThis.sheetCount).toFixed(2)} грн
                                            </div>

                                            {/* Постпресові операції (рахуються за body.count) */}
                                            <div className="fontInfoForPricing">
                                                Згинання: {pricesThis.big.pricePerUnit} грн
                                                * {pricesThis.big.count} шт = {pricesThis.big.totalPrice} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Скруглення кутів: {pricesThis.cute.pricePerUnit} грн
                                                * {pricesThis.cute.count} шт
                                                = {pricesThis.cute.totalPrice} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Свердління отворів: {pricesThis.holes.pricePerUnit} грн
                                                * {pricesThis.holes.count} шт
                                                = {pricesThis.holes.totalPrice} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Проклейка: {pricesThis.prokleyka.pricePerUnit} грн
                                                * {pricesThis.prokleyka.count} шт
                                                = {pricesThis.prokleyka.totalPrice} грн
                                            </div>

                                            {/* Додаткова послуга "Порізка" */}
                                            {pricesThis.porizka !== 0 && (
                                                <div className="fontInfoForPricing">
                                                    Порізка: {pricesThis.porizka} грн
                                                </div>
                                            )}

                                            {/* Підсумкова вартість замовлення */}
                                            <div className="fontInfoForPricing1">
                                                Загалом: {pricesThis.price} грн
                                            </div>

                                            {/* Інформація про кількість аркушів */}
                                            <div className="fontInfoForPricing">
                                                - З одного аркуша {pricesThis.listsFromBd} можливо
                                                зробити {pricesThis.sheetsPerUnit} виробів
                                            </div>
                                            <div className="fontInfoForPricing">
                                                - Затрачено {pricesThis.sheetCount} аркушів {pricesThis.listsFromBd}
                                            </div>
                                            {/*<div className="fontInfoForPricing1">*/}
                                            {/*    Вартість 1 аркуша: {pricesThis.unitSheetPrice.toFixed(2)} грн*/}
                                            {/*</div>*/}

                                            {/* Розрахунок ціни за виріб (зі всіма допами) */}
                                            <div className="fontInfoForPricing1">
                                                {/*Загалом: {(pricesThis.priceForItemWithExtras * count).toFixed(2)} грн*/}
                                                Ціна за виріб: {pricesThis.priceForItemWithExtras.toFixed(2)} грн
                                            </div>

                                            {/* Додатковий розрахунок ціни за лист */}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за аркуш {pricesThis.listsFromBd} (зі всіма*/}
                                            {/*    допами): {pricesThis.priceForSheetWithExtras.toFixed(2)} грн*/}
                                            {/*</div>*/}
                                            <div className="fontInfoForPricing">
                                                Ціна за аркуш {pricesThis.listsFromBd} (лише матеріал та
                                                друк): {pricesThis.priceForSheetMaterialPrint.toFixed(2)} грн
                                            </div>
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за all(2спосіб) {pricesThis.totalSheetPrice} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за 1 виріб {pricesThis.totalPriceForOne} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    Ціна за all(2спосіб) {pricesThis.totalPriceForAllInPriceForOne} грн*/}
                                            {/*</div>*/}
                                            {/*<div className="fontInfoForPricing">*/}
                                            {/*    priceForSheetWithExtras {pricesThis.priceForSheetWithExtras} грн*/}
                                            {/*</div>*/}
                                        </div>


                                        <img
                                            className="versant80-img-icon"
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

export default NewSheetSheet;
