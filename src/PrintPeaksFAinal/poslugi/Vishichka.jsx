import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import versantIcon from '../../components/newUIArtem/printers/p9.svg';
import Materials2 from "./newnomodals/Materials2";
import {useNavigate} from "react-router-dom";
import Loader from "../../components/calc/Loader";
import PerepletPereplet from "./newnomodals/PerepletPereplet";
import VishichkaVibor from "./newnomodals/vishichka/VishichkaVibor";
import PlivkaMontajna from "./newnomodals/plivka/PlivkaMontajna";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";

const Vishichka = ({
                       thisOrder,
                       newThisOrder,
                       setNewThisOrder,
                       selectedThings2,
                       setShowVishichka,
                       setThisOrder,
                       setSelectedThings2,
                       showVishichka
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
            setShowVishichka(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        setShowVishichka(true);
    }, []);


    const [size, setSize] = useState({
        x: 310,
        y: 440
    });
    const [material, setMaterial] = useState({
        type: "Плівка",
        thickness: "Самоклеючі",
        material: "",
        materialId: "",
        typeUse: "Самоклеючі"
    });
    const [color, setColor] = useState({
        sides: "односторонній",
        one: "",
        two: "",
        allSidesColor: "CMYK",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "З глянцевим ламінуванням",
        materialId: "",
        size: "",
        typeUse: "А3"
    });
    const [vishichka, setVishichka] = useState({
        type: "vishichka",
        thickness: "Тонкі",
        material: "",
        materialId: "",
        typeUse: null
    });
  const [plivkaMontajna, setPlivkaMontajna] = useState({
    type: "plivka",
    thickness: "Тонкі",
    material: "Немає Монтажної плівки",
    materialId: "0",
    typeUse: null
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
    const [selectedService, setSelectedService] = useState("Наліпки");

    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            toCalc: {
                nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
                type: "Vishichka",
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
                vishichka: vishichka,
                plivkaMontajna: plivkaMontajna
            }
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setThisOrder(response.data);
                // setSelectedThings2(response.data.order.OrderUnits || []);
                setSelectedThings2(response.data.OrderUnits);
                setShowVishichka(false)
                setError(null)
            })
            .catch(error => {
                setError(error)
                if (error.response.status === 403) {
                    if (error) {
                        if (error.response) {
                            if (typeof error.response.status === 'undefined') {
                                // Handle the scenario where status is undefined
                                console.log('Error response status is undefined');
                            } else {
                                // Handle other cases where status is defined
                                console.log('Error response status is:', error.response.status);
                            }
                        } else {
                            // Handle cases where there is no error response
                            console.log('Error response is undefined');
                        }
                    } else {
                        // Handle cases where error is not present
                        console.log('No error occurred');
                    }
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
            type: "Vishichka",
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
            vishichka: vishichka,
            plivkaMontajna: plivkaMontajna
        }
        // console.log(dataToSend);
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                // console.log(response.data.prices);
                setPricesThis(response.data.prices)
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [size, material, color, lamination.materialId, big, cute, cuteLocal, holes, holesR, count, vishichka, plivkaMontajna]);

    useEffect(() => {
        if (showVishichka) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showVishichka]);

    if (pricesThis) {
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
                                    {/*    {["Наліпки", "Стікерів", "Стікерпака", "Стікерсета", "Бірки", "Листівки", "Коробочки", "Фішки", "Цінника", "Меню"].map((service, index) => (*/}
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
                                        {["Наліпки", "Стікери", "Стікерпак", "Стікерсет", "Бірки", "Листівки", "Коробочки", "Фішки", "Цінник", "Меню"].map((service, index) => (
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
                                <MDBContainer fluid style={{width: '100%', marginLeft: "-2vh", marginTop: "2vh"}}>
                                    <Row xs={1} md={0} className="">
                                        <div className="d-flex flex-column">
                                            <NewNoModalSize
                                                size={size}
                                                setSize={setSize}
                                                prices={prices}
                                                type={"Vishichka"}
                                                buttonsArr={["односторонній", "двосторонній",]}
                                                color={color}
                                                setColor={setColor}
                                                count={count}
                                                setCount={setCount}
                                                defaultt={"А3 (297 х 420 мм)"}
                                            />
                                            {/*<NewNoModalMaterial*/}
                                            <div className="d-flex flex-column" style={{marginLeft: "-2vh"}}>
                                                <Materials2
                                                    material={material}
                                                    setMaterial={setMaterial}
                                                    count={count}
                                                    setCount={setCount}
                                                    prices={prices}
                                                    size={size}
                                                    selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                                    name={"Чорно-білий друк на монохромному принтері:"}
                                                    buttonsArr={["Тонкий",
                                                        "Середній",
                                                        "Цупкий", "Самоклеючі"]}
                                                    typeUse={null}
                                                />
                                            </div>

                                            <VishichkaVibor
                                                size={size}
                                                vishichka={vishichka}
                                                setVishichka={setVishichka}
                                                prices={prices}
                                                type={"SheetCut"}
                                                buttonsArr={["з плотерною порізкою на надрукованих аркушах", "з плотерною порізкою стікерпаків", "з плотерною порізкою окремими виробами",]}
                                                defaultt={"А3 (297 х 420 мм)"}
                                            />
                                          <NewNoModalLamination
                                            lamination={lamination}
                                            setLamination={setLamination}
                                            prices={prices}
                                            size={size}
                                            type={"SheetCut"}
                                            isVishichka={true}
                                            buttonsArr={["з глянцевим ламінуванням",
                                              "з матовим ламінуванням",
                                              "з ламінуванням Soft Touch",]}
                                            selectArr={["30", "80", "100", "125"]}
                                          />
                                          <PlivkaMontajna
                                            size={size}
                                            plivkaMontajna={plivkaMontajna}
                                            setPlivkaMontajna={setPlivkaMontajna}
                                            vishichka={vishichka}
                                            setVishichka={setVishichka}
                                            prices={prices}
                                            type={"SheetCut"}
                                            buttonsArr={["з плотерною порізкою на надрукованих аркушах", "з плотерною порізкою стікерпаків", "з плотерною порізкою окремими виробами",]}
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
                                             style={{height: "12vw"}}>
                                            <div className="" style={{padding: "1vh"}}>
                                                <div className="fontInfoForPricing">
                                                    Друк: {pricesThis.priceDrukPerSheet} грн
                                                    * {pricesThis.sheetCount} шт
                                                    = {pricesThis.priceDrukPerSheet * pricesThis.sheetCount} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    Матеріали: {pricesThis.pricePaperPerSheet} грн
                                                    * {pricesThis.sheetCount} шт
                                                    = {pricesThis.pricePaperPerSheet * pricesThis.sheetCount} грн
                                                </div>
                                                {/*<div className="fontInfoForPricing">
        Ламінація: {pricesThis.priceForThisUnitOfLamination} грн * {pricesThis.sheetCount} шт = {pricesThis.priceForThisAllUnitsOfLamination} грн
    </div>*/}
                                                <div className="fontInfoForPricing">
                                                    Висічка: {pricesThis.priceVishichkaPerSheet} грн
                                                    * {pricesThis.sheetCount} шт = {pricesThis.totalVishichkaPrice} грн
                                                </div>

                                              <div className="fontInfoForPricing">
                                                Монтажка + вибірка: {pricesThis.pricePlivkaPerSheet} грн
                                                * {pricesThis.sheetCount} шт = {pricesThis.totalPlivkaPrice} грн
                                              </div>
                                              <div className="fontInfoForPricing">
                                                Ламінація: {pricesThis.priceLaminationPerSheet} грн * {pricesThis.sheetCount} шт =
                                                {pricesThis.priceLaminationPerSheet * pricesThis.sheetCount} грн
                                              </div>
                                                {/*<div className="fontInfoForPricing">
        Свердління отворів: {pricesThis.priceForThisUnitOfCute} грн * {pricesThis.sheetCount} шт = {pricesThis.priceForAllUnitsOfCute} грн
    </div>*/}
                                                <div className="fontInfoForPricing1"  style={{marginTop: '0.5vw', color: '#ee3c23'}}>
                                                    Загалом: {pricesThis.price} грн
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    - З одного аркуша можна виробити: {pricesThis.sheetsPerUnit} шт
                                                </div>
                                                <div className="fontInfoForPricing">
                                                    - Використано аркушів(А3/SrA3/SrA3+): {pricesThis.sheetCount}  шт
                                                </div>

                                              <div className="fontInfoForPricing1">
                                                За 1 аркуш: {pricesThis.priceForItemWithExtras} грн
                                              </div>
                                            </div>


                                            <img
                                                className="versant80-img-icon"
                                                alt="sssss"
                                                src={versantIcon}
                                                style={{height: "16vmin"}}
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
    } else {
    }

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default Vishichka;
