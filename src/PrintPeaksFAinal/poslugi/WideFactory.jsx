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
import imgg3 from "../../components/newUIArtem/printers/p3.svg";
import img2 from "../../components/newUIArtem/printers/ComponentTMP_0-image2.png";
import Laminator from "./Laminator";
import Luvarsi from "./newnomodals/wideFactory/Luvarsi";
import PlotterCutting from "./newnomodals/wideFactory/PlotterCutting";
import MontajnaPlivkaWideFactory from "./newnomodals/wideFactory/MontajnaPlivkaWideFactory";
import LaminationWideFactory from "./newnomodals/wideFactory/LaminationWideFactory";
import NewSheetCut from "./NewSheetCut";
import {
  Sticker,      // lucide-react
  Image,
  FileText,
  Layers
} from "lucide-react";
import bannerb from "../../components/newUIArtem/printers/banerb.png";
import bannerw from "../../components/newUIArtem/printers/banerw.png";
import citylightb from "../../components/newUIArtem/printers/citylightb.png";
import citylightw from "../../components/newUIArtem/printers/citylightw.png";
import label from "../../components/newUIArtem/printers/label.png";
import Labelw from "../../components/newUIArtem/printers/Labelw.png";
import PVCb from "../../components/newUIArtem/printers/PVCb.png";
import PVCw from "../../components/newUIArtem/printers/PVCw.png";

const WideFactory = ({
                   thisOrder,
                   newThisOrder,
                   setNewThisOrder,
                   selectedThings2,
                       setShowWideFactory,
                       showWideFactory,
                   setThisOrder,
                   setSelectedThings2,
                   editingOrderUnit,
                   setEditingOrderUnit
                 }) => {
  // const [show, setShow] = useState(false);
  let handleChange = (e) => {
    setCount(e)
  }
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectWideFactory, setSelectWideFactory] = useState("Баннер FactoryWide");
  const [arrOfTops, setArrOfTops] = useState(["Баннер"]);
  const [arrOfDruk, setArrOfDruk] = useState(["Екосольвентний друк", "УФ друк"]);
  const [error, setError] = useState(null);
  const editId = editingOrderUnit?.id ?? editingOrderUnit?.ID ?? editingOrderUnit?.idKey ?? null;
  const isEdit = Boolean(editId);
  const handleClose = () => {
    setIsAnimating(false); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false)
            setShowWideFactory(false);
      if (typeof setEditingOrderUnit === 'function') setEditingOrderUnit(null);
    }, 300); // После завершения анимации скрываем модальное окно
  }
  const handleShow = useCallback((event) => {
    setShowWideFactory(true);
  }, []);


  const [size, setSize] = useState({
    x: 420,
    y: 594
  });
  const [material, setMaterial] = useState({
    type: "Баннер FactoryWide",
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
    materialId: "",
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
  const [luversi, setLuversi] = useState({
    type: "Не потрібно",
    thickness: "",
    material: "",
    materialId: "",
    size: 100
  });
  const [plotterCutting, setPlotterCutting] = useState({
    type: "Не потрібно",
    thickness: "",
    material: "",
    materialId: "",
    size: 100
  });
  const [montajnaPlivka, setMontajnaPlivka] = useState({
    type: "Не потрібно",
    thickness: "",
    material: "",
    materialId: "",
    size: 100
  });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("Не потрібно");
  const [count, setCount] = useState(1);
  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);
  const [selectedService, setSelectedService] = useState("Баннер");
  const [selectedDruk, setSelectedDruk] = useState("Екосольвентний друк");

  let handleClickWideFactory = (e) => {
    setMaterial({
      ...material,
      type: e,
    })
    setSelectWideFactory(e)
    if(e === "Баннер FactoryWide"){
      setArrOfTops(["Баннер"])
    } else if(e === "Плівка FactoryWide"){
      setArrOfTops([ "Наліпки", "Стікера", "Графік роботи",  ])
    } else if(e === "Папір FactoryWide"){
      setArrOfTops(["Афіша", "Плакат", "Реклама", ])
    } else if(e === "ПВХ FactoryWide"){
      setArrOfTops(["Таблички"])
    }
  }

  useEffect(() => {
    if (!arrOfTops || arrOfTops.length === 0) return;
    setSelectedService(prev => (prev && arrOfTops.includes(prev)) ? prev : arrOfTops[0]);
  }, [arrOfTops]);


  const safeParseOptions = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch (e) { return null; }
  };

  const applyTopOptionsByFactoryType = (factoryType) => {
    if (factoryType === "Баннер FactoryWide") return ["Баннер"];
    if (factoryType === "Плівка FactoryWide") return ["Наліпки", "Стікера", "Графік роботи"];
    if (factoryType === "Папір FactoryWide") return ["Афіша", "Плакат", "Реклама"];
    if (factoryType === "ПВХ FactoryWide") return ["Таблички"];
    return ["Баннер"];
  };

  const resetForm = () => {
    setSelectWideFactory("Баннер FactoryWide");
    setArrOfTops(["Баннер"]);
    setSize({ x: 420, y: 594 });
    setMaterial({ type: "Баннер FactoryWide", thickness: "", material: "", materialId: "" });
    setColor({ sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" });
    setLamination({ type: "Не потрібно", material: "", materialId: "" });
    setBig("Не потрібно");
    setCute("Не потрібно");
    setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
    setLuversi({ type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 });
    setPlotterCutting({ type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 });
    setMontajnaPlivka({ type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 });
    setHoles("Не потрібно");
    setHolesR("Не потрібно");
    setCount(1);
    setSelectedDruk("Екосольвентний друк");
    setSelectedService("Баннер");
  };

  useEffect(() => {
    if (!showWideFactory) return;

    if (!isEdit) {
      resetForm();
      return;
    }

    const opts = safeParseOptions(editingOrderUnit?.optionsJson) || {};
    const factoryType = opts?.material?.type || editingOrderUnit?.type || "Баннер FactoryWide";
    const tops = applyTopOptionsByFactoryType(factoryType);

    setSelectWideFactory(factoryType);
    setArrOfTops(tops);

    // Hydrate main fields
    if (opts.size?.x && opts.size?.y) setSize(opts.size);
    else if (editingOrderUnit?.newField2 && editingOrderUnit?.newField3) {
      setSize({ x: Number(editingOrderUnit.newField2), y: Number(editingOrderUnit.newField3) });
    }

    if (opts.material) setMaterial(opts.material);
    if (opts.color) setColor(opts.color);
    if (opts.lamination) setLamination(opts.lamination);
    if (opts.big) setBig(opts.big);
    if (opts.cute) setCute(opts.cute);
    if (opts.cuteLocal) setCuteLocal(opts.cuteLocal);
    if (opts.holes) setHoles(opts.holes);
    if (opts.holesR) setHolesR(opts.holesR);

    if (typeof opts.count !== "undefined") setCount(Number(opts.count) || 1);
    else if (editingOrderUnit?.amount) setCount(Number(editingOrderUnit.amount) || 1);
    else if (editingOrderUnit?.newField5) setCount(Number(editingOrderUnit.newField5) || 1);

    if (opts.selectedDruk) setSelectedDruk(opts.selectedDruk);

    if (opts.luversi) setLuversi(opts.luversi);
    if (opts.plotterCutting) setPlotterCutting(opts.plotterCutting);
    if (opts.montajnaPlivka) setMontajnaPlivka(opts.montajnaPlivka);

    const svc = opts.selectedService || opts.newField1 || editingOrderUnit?.newField1 || tops[0];
    setSelectedService(svc);
  }, [showWideFactory, isEdit, editId]);

  const addNewOrderUnit = e => {
    let dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: editId, idKey: editId } : {}),
      toCalc: {
        nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
        type: "WideFactory",
        newField6: "WideFactory",
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
        selectedService: selectedService,
        newField1: selectedService,
        selectedDruk: selectedDruk,
        luversi: luversi,
        plotterCutting: plotterCutting,
        montajnaPlivka: montajnaPlivka,
      }
    };

    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then(response => {
        // console.log(response.data);
        setThisOrder(response.data);
        // setSelectedThings2(response.data.order.OrderUnits || []);
        setSelectedThings2(response.data.OrderUnits);
        setShowWideFactory(false)
        if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(null)
      })
      .catch(error => {
        setError(error);
        if (error?.response?.status === 403) {
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
    if (!showWideFactory) return;
    let dataToSend = {
      type: "WideFactory",
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
      selectedDruk: selectedDruk,
      luversi: luversi,
      plotterCutting: plotterCutting,
      montajnaPlivka: montajnaPlivka,
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
  }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, selectedDruk, luversi, plotterCutting, montajnaPlivka]);

  useEffect(() => {
    if (showWideFactory) {
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showWideFactory]);

  return (
    <>
      {isVisible ? (
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
                <div className="d-flex flex-wrap justify-content-center">
                  {arrOfTops.map((service, index) => (
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

            {/* категорії */}
            <div className="wf-cards">
              {[
                ["Плівка FactoryWide",  Sticker],     // стікер, самоклейка
                ["Баннер FactoryWide",  Image],   // білборд / банер
                ["Папір FactoryWide",   FileText],    // афіша, плакат
                ["ПВХ FactoryWide",     Layers],      // багатошаровий пластик
              ].map(([val, Icon]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleClickWideFactory(val)}
                  className={`wf-card ${selectWideFactory === val ? "is-active" : ""}`}
                >
                  <Icon className="wf-icon"/>
                  <span className="wf-caption">{val.split(" ")[0]}</span>
                </button>
              ))}
            </div>


            <div className="d-flex flex-wrap"
            style={{marginTop: "1vw", marginLeft: "1.5vw", gap:"1vw"}}>
              {arrOfDruk.map((service, index) => (
                <button
                  key={index}
                  className={`btn ${selectedDruk === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'}`}
                  style={{width: "17vw"}}
                  onClick={() => setSelectedDruk(service)}
                >
                  {service}
                </button>
              ))}
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
                <Row xs={3} md={6} className="">
                  <div className="d-flex flex-row align-items-center justify-content-left">
                    <NewNoModalSize
                      size={size}
                      setSize={setSize}
                      prices={prices}
                      type={"WideFactory"}
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
                  <SliderComponent type="WideFactory" size={size} setSize={setSize} />


                    {selectWideFactory === "Баннер FactoryWide" &&
                      <Luvarsi
                        luversi={luversi}
                        setLuversi={setLuversi}
                        selectArr={[100, 200, 300, 400, 500]}
                        type={"Luversi"}
                        buttonsArr={['По кутам (на "павук")', "По периметру"]}
                      />
                    }

                    {selectWideFactory === "Плівка FactoryWide" &&
                      <div className={"d-flex flex-column "}>
                        {selectedDruk === "Екосольвентний друк" &&
                          <>
                            <LaminationWideFactory
                              lamination={lamination}
                              setLamination={setLamination}
                              selectArr={[100, 200, 300, 400, 500]}
                              type={"LaminationWideFactory"}
                              buttonsArr={["з глянцевим ламінуванням",
                                "з матовим ламінуванням"
                                ]}
                            />
                          </>
                        }
                        <PlotterCutting
                          plotterCutting={plotterCutting}
                          setPlotterCutting={setPlotterCutting}
                          plivkaOrPVH={"Плотер плівка FactoryWide"}
                          selectArr={[100, 200, 300, 400, 500]}
                          type={"PlotterCuttingWideFactory"}
                          buttonsArr={['Простая', "Середня", "Складна"]}
                        />
                        <MontajnaPlivkaWideFactory
                          montajnaPlivka={montajnaPlivka}
                          plotterCutting={plotterCutting}
                          setMontajnaPlivka={setMontajnaPlivka}
                          selectArr={[100, 200, 300, 400, 500]}
                          type={"MontajnaPlivkaWideFactory"}
                          buttonsArr={[]}
                        />
                      </div>
                    }

                    {selectWideFactory === "Папір FactoryWide" &&
                      <>
                        {selectedDruk === "Екосольвентний друк" &&
                          <>
                            <LaminationWideFactory
                              lamination={lamination}
                              setLamination={setLamination}
                              selectArr={[100, 200, 300, 400, 500]}
                              type={"LaminationWideFactory"}
                              buttonsArr={['Глянцева', "Матова"]}
                            />
                          </>
                        }
                      </>
                    }

                    {selectWideFactory === "ПВХ FactoryWide" &&
                      <>
                        <PlotterCutting
                          plotterCutting={plotterCutting}
                          setPlotterCutting={setPlotterCutting}
                          plivkaOrPVH={"Плотер ПВХ FactoryWide"}
                          selectArr={[100, 200, 300, 400, 500]}
                          type={"PlotterCuttingWideFactory"}
                          buttonsArr={['Простая', "Середня", "Складна"]}
                        />
                      </>
                    }


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
                        Друк: ({parseFloat(pricesThis.priceDrukPerSheet).toFixed(2)}грн
                        * {pricesThis.totalSizeInM2One}м2
                        = {(parseFloat(pricesThis.oneItemWideDrukPrice)).toFixed(2)}грн) * {count} = {(parseFloat(pricesThis.priceDrukPerSheet)).toFixed(2)}грн
                      </div>

                      {/* Матеріали (папір, рахуються за sheetCount) */}
                      <div className="fontInfoForPricing">
                        Матеріали: ({parseFloat(pricesThis.pricePaperPerSheet).toFixed(2)} грн
                        * {pricesThis.totalSizeInM2One} м2
                        = {(parseFloat(pricesThis.oneItemWideMaterialPrice)).toFixed(2)}грн) * {count} = {(parseFloat(pricesThis.totalWideMaterialPrice)).toFixed(2)}грн
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

                      {lamination.type !== "Не потрібно" &&
                        <div className="fontInfoForPricing">
                          Ламінація: {parseFloat(pricesThis.totalWideLaminationPrice).toFixed(2)} грн
                        </div>
                      }
                      {plotterCutting.type !== "Не потрібно" &&
                        <div className="fontInfoForPricing">
                          Плоттерна порізка: {parseFloat(pricesThis.totalWidePlotterCuttingPrice).toFixed(2)} грн
                        </div>
                      }
                      {montajnaPlivka.type !== "Не потрібно" &&
                        <div className="fontInfoForPricing">
                          Монтажна плівка: {parseFloat(pricesThis.totalWideMontajnaPlivkaPrice).toFixed(2)} грн
                        </div>
                      }
                      {luversi.type !== "Не потрібно" &&
                        <div className="fontInfoForPricing">
                          Люверси: {parseFloat(pricesThis.oneWideLuversiPrice).toFixed(2)} грн
                          * {pricesThis.luversiOneItem} шт
                          = {(parseFloat(pricesThis.totalOneItemWideLuversiPrice)).toFixed(2)} грн
                        </div>
                      }

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

export default WideFactory;

/* Додайте ці стилі до вашого CSS файлу */
