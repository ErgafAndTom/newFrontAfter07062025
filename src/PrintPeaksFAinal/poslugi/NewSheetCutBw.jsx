import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import NewNoModalSize from "./newnomodals/NewNoModalSize";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import versantIcon from "../public/BW_C@2x.png";
import Materials2 from "./newnomodals/Materials2";
import {useNavigate} from "react-router-dom";
import "../global.css"

const NewSheetCutBw = ({
                           thisOrder,
                           newThisOrder,
                           setNewThisOrder,
                           selectedThings2,
                           setShowNewSheetCutBw,
                           showNewSheetCutBw,
                           setThisOrder,
                           setSelectedThings2
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
            setShowNewSheetCutBw(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowNewSheetCutBw(true);
    }, []);


    const [size, setSize] = useState({
        x: 210,
        y: 297
    });
    const [material, setMaterial] = useState({
        type: "Папір",
        thickness: "Офісний",
        material: "",
        materialId: "",
        typeUse: "Офісний"
    });
    const [color, setColor] = useState({
        sides: "односторонній",
        one: "",
        two: "",
        allSidesColor: "Чорно-білий",
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
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);
    const [selectedService, setSelectedService] = useState("Документа");

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: `Друк ${selectedService ? selectedService + " " : ""}`,
                type: "SheetCutBW",
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
                setShowNewSheetCutBw(false)
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
            type: "SheetCutBW",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            cuteLocal: cuteLocal,
            holes: holes,
            count: count,
        }
        setLoad(true)
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
    }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

    useEffect(() => {
        if (showNewSheetCutBw) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showNewSheetCutBw]);

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
                            <div className="m-auto text-center fontProductName ">
                                <div className="d-flex flex-wrap justify-content-center">
                                    {["Документа", "Договору", "Дипломної роботи", "Курсової роботи", "Реферата", "Креслення", "Аналізів", "Квитка"].map((service, index) => (
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
                                    fontSize: "var(--font-size-base)",
                                    margin: "0.5vw",
                                }}
                                onClick={handleClose}
                            >
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <MDBContainer fluid style={{width: '100%'}}>
                                <Row xs={1} md={6} className="">
                                    {/*<Col>*/}
                                    {/*    <NewNoModalSize size={size} setSize={setSize} prices={prices} type={"SheetCut"}/>*/}
                                    {/*</Col>*/}
                                    {/*<Col>*/}
                                    {/*    <ModalMaterial material={material} setMaterial={setMaterial} prices={prices}/>*/}
                                    {/*</Col>*/}
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
                                        <NewNoModalSize
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"SheetCutBw"}
                                            buttonsArr={["односторонній", "двосторонній",]}
                                            color={color}
                                            setColor={setColor}
                                            count={count}
                                            setCount={setCount}
                                            defaultt={"A4 (210 x 297 мм)"}
                                        />
                                        <div className="d-flex" style={{marginLeft: "-0.8vw"}}>
                                            <Materials2
                                                material={material}
                                                setMaterial={setMaterial}
                                                count={count}
                                                setCount={setCount}
                                                prices={prices}
                                                size={size}
                                                selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                                name={"Чорно-білий друк на монохромному принтері:"}
                                                buttonsArr={["Офісний"]}
                                                typeUse={null}
                                            />
                                        </div>
                                        <div className="d-flex" style={{marginLeft: "-1vw"}}>
                                            <NewNoModalLamination
                                                lamination={lamination}
                                                setLamination={setLamination}
                                                prices={prices}
                                                type={"SheetCutBw"}
                                                buttonsArr={["З глянцевим ламінуванням",
                                                    "З матовим ламінуванням",
                                                    "З ламінуванням Soft Touch",]}
                                                defaultt={"З глянцевим ламінуванням"}
                                                selectArr={["30", "80", "100", "125", "250"]}

                                            />
                                        </div>

                                    </div>
                                </Row>
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between"
                                            style={{
                                                display: 'flex',
                                                // justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",
                                                // cursor: "pointer",

                                                marginLeft: "2vw",
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
                                    <div className="pricesBlockContainer">
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
                                            <div className="fontInfoForPricing">
                                                Вартість 1
                                                аркуша {pricesThis.listsFromBd}: {pricesThis.unitSheetPrice.toFixed(2)} грн
                                            </div>

                                            {/* Розрахунок ціни за виріб (зі всіма допами) */}
                                            <div className="fontInfoForPricing1">
                                                {/*Загалом: {(pricesThis.priceForItemWithExtras * count).toFixed(2)} грн*/}
                                                Ціна за виріб: {pricesThis.priceForItemWithExtras.toFixed(2)} грн
                                            </div>

                                            {/* Додатковий розрахунок ціни за лист */}
                                            <div className="fontInfoForPricing">
                                                Ціна за аркуш (зі всіма
                                                допами): {pricesThis.priceForSheetWithExtras.toFixed(2)} грн
                                            </div>
                                            <div className="fontInfoForPricing">
                                                Ціна за аркуш (лише матеріал та
                                                друк): {pricesThis.priceForSheetMaterialPrint.toFixed(2)} грн
                                            </div>

                                        </div>


                                        <img
                                            className="kyosera-img-icon"
                                            style={{
                                                marginRight: "1vmin ",
                                                marginLeft: "10vmin",
                                            }}


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

export default NewSheetCutBw;
