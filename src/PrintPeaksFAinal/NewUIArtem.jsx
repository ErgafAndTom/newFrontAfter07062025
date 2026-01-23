import React, { useEffect, useState } from "react";

import './userInNewUiArtem/StyleArtem.css';
import './CPM.css';
import './adminStylesCrm.css';
import './Wide.css';
import './MainWindow.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from '../api/axiosInstance';


import blackWhitePrintIcon from "../components/newUIArtem/printers/ComponentTMP_0-image5.png";
import colorPrintIcon from "../components/newUIArtem/printers/46.png";
import plotterCutIcon from "../components/newUIArtem/printers/ComponentTMP_0-image4.png";
import photoIcon from "../components/newUIArtem/printers/ComponentTMP_0-image3.png";
import wideIcon from "../components/newUIArtem/printers/ComponentTMP_0-image2.png";
import wideFactoryIcon from "../components/newUIArtem/printers/Без назви-4.png";
import postpressIcon from "../components/newUIArtem/printers/creo.png";
import laminationIcon from "../components/newUIArtem/printers/üÑº ¡áºó¿-1.png";
import bindingIcon from "../components/newUIArtem/printers/1996 (1).png";
import noteIcon from "../components/newUIArtem/printers/group-1468.svg";
import bookletIcon from "./evroscoba.png";
import scansIcon from "../components/newUIArtem/printers/group-1468.svg";
import deliveryIcon from "../components/newUIArtem/printers/delivery.png";


import MUG from "../components/newUIArtem/printers/mug.png";
import magnets from "./magnetsIcon.png";
import Scans from "./scan.png";
import Deliverypng from "../components/newUIArtem/printers/delivery.png";
import ClientChangerUIArtem from "../PrintPeaksFAinal/userInNewUiArtem/ClientChangerUIArtem";
import knopka1 from "./knopki/Knopka1.jsx";

import scoba from "./poslugi/newnomodals/skoba.svg";

import versantIcon from "../components/newUIArtem/printers/group-1468.svg";

import OneProductInOrders from "../components/newcalc/Orders/OneProductInOrders";

import NewWide from "./poslugi/newWide";
import NewSheetCut from "./poslugi/NewSheetCut";
// import NewSheetCutBW from "./poslugi/NewSheetCutBW"
// import NewSheetCutBW from "./poslugi/NewSheetCutBW"
// import NewSheetCutBW from "./poslugi/NewSheetCutBW";
import NewPhoto from "./poslugi/NewPhoto";
import NewNote from "./poslugi/NewNote";
import ModalDeleteOrderUnit from "./ModalDeleteOrderUnit";
import Loader from "../components/calc/Loader";
import Laminator from "./poslugi/Laminator";
import Vishichka from "./poslugi/Vishichka";
import PerepletMet from "./poslugi/PerepletMet";
import BigOvshik from "./poslugi/BigOvshik";
import ProgressBar from "../ProgressBar";
import NewCup from "./poslugi/NewCup";

import NewBooklet from "./poslugi/NewBooklet";
import NewMagnets from "./poslugi/NewMagnets";
import NewScans from "./poslugi/NewScans";
import WideFactory from "./poslugi/WideFactory";
import Delivery from "./poslugi/DeliveryPage";
import OrderFilesPanel from "./commentsInOrders/OrderFilesPanel";
import NewSheetCutBW from "./poslugi/NewSheetCutBw";

const NewUIArtem = ({


                         // setSelectedThings2,

                         setOpenEditor,
                    }) => {
  // const isEdit = Boolean(editingOrderUnitSafe?.id);
  const navigate = useNavigate();
  const [things, setThings] = useState([]);
  const [products, setProducts] = useState(null);
  const [summ, setSumm] = useState(0);
  const [isLoad, setIsLoad] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [editingOrderUnit, setEditingOrderUnit] = useState(null);
  // Fallback: якщо сеттер не передали з батька — тримаємо локально, щоб не падало.
  const [editingOrderUnitLocal, setEditingOrderUnitLocal] = useState(null);
  const isEditingControlled = typeof setEditingOrderUnit === "function";
  const editingOrderUnitSafe = isEditingControlled ? editingOrderUnit : editingOrderUnitLocal;
  const setEditingOrderUnitSafe = isEditingControlled ? setEditingOrderUnit : setEditingOrderUnitLocal;

  const [newThisOrder, setNewThisOrder] = useState({
    id: id
  })
  const [thisOrder, setThisOrder] = useState({
    id: id
  })
  const [selectedThings2, setSelectedThings2] = useState();
  const [typeSelect, setTypeSelect] = useState("");
  const [productName, setProductName] = useState('');
  const [showDeleteOrderUnitModal, setShowDeleteOrderUnitModal] = useState(false);
  const [thisOrderUnit, setThisOrderUnit] = useState(null);
  const [showWide, setShowWide] = useState(false);


  const [showNewSheetCut, setShowNewSheetCut] = useState(false);
  const [showNewSheetCutBW, setShowNewSheetCutBW] = useState(false);
  const [showNewWide, setShowNewWide] = useState(false);
  const [showWideFactory, setShowWideFactory] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewBooklet, setShowNewBooklet] = useState(false);
  const [showNewPhoto, setShowNewPhoto] = useState(false);


  const [showBigOvshik, setShowBigOvshik] = useState(false);
  const [showPerepletMet, setShowPerepletMet] = useState(false);
  const [showNewCup, setShowNewCup] = useState(false);
  const [showNewMagnets, setShowNewMagnets] = useState(false);
  const [showNewScans, setShowNewScans] = useState(false);
  const [showLaminator, setShowLaminator] = useState(false);
  const [showVishichka, setShowVishichka] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [expandedThingIndex, setExpandedThingIndex] = useState(null);
  // ✅ Єдина мапа типів -> модалка (УЗГОДЖЕНО з беком: newField6 = toCalc.type)
  const EDITORS = [
    { value: "SheetCutBW", label: "BLACK & WHITE", open: () => setShowNewSheetCutBW(true) },
    { value: "SheetCut", label: "DIGITAL PRINT CUTING", open: () => setShowNewSheetCut(true) },

    { value: "Vishichka", label: "PLOTTER CUT", open: () => setShowVishichka(true) },
    { value: "Photo", label: "PHOTO", open: () => setShowNewPhoto(true) },

    { value: "Wide", label: "WIDE PHOTO", open: () => setShowNewWide(true) },
    { value: "WideFactory", label: "WIDE FACTORY", open: () => setShowWideFactory(true) },

    { value: "BigOvshik", label: "POSTPRESS", open: () => setShowBigOvshik(true) },
    { value: "PerepletMet", label: "BINDING", open: () => setShowPerepletMet(true) },

    { value: "Laminator", label: "LAMINATION", open: () => setShowLaminator(true) },
    { value: "Note", label: "NOTE", open: () => setShowNewNote(true) },
    { value: "BOOKLET", label: "BOOKLET", open: () => setShowNewBooklet(true) },

    { value: "Cup", label: "MUG", open: () => setShowNewCup(true) },
    { value: "Magnets", label: "MAGNETS", open: () => setShowNewMagnets(true) },
    { value: "Scans", label: "SCANS", open: () => setShowNewScans(true) },
    { value: "Delivery", label: "DELIVERY", open: () => setShowDelivery(true) },
  ];
  const TYPE_ALIASES = {
    Postpress: "BigOvshik",
    Binding: "PerepletMet",
    Lamination: "Laminator",
  };
  // ✅ витягуємо тип позиції максимально надійно
  const getOrderUnitType = (thing) => {
    if (!thing) return null;

    // 1) правильне поле з бекенда
    if (thing.newField6) return thing.newField6;

    // 2) інколи у старих записах може бути thing.type
    if (thing.type) return thing.type;

    // 3) якщо збережено optionsJson — беремо type з нього
    if (thing.optionsJson) {
      try {
        const parsed = JSON.parse(thing.optionsJson);
        if (parsed?.newField6) return parsed.newField6;
      } catch (e) { }
    }

    return null;
  };
  const openEditor = (thingOrNull, eOrType) => {
    if (eOrType?.stopPropagation) eOrType.stopPropagation();

    const rawType =
      typeof eOrType === "string"
        ? eOrType
        : getOrderUnitType(thingOrNull);

    const type = TYPE_ALIASES[rawType] || rawType;

    const editor = EDITORS.find((x) => x.value === type);
    if (!editor) return console.warn("No editor for type:", type, thingOrNull);

    setEditingOrderUnit(thingOrNull || null);
    editor.open();
  };

  const getEditorByThing = (thing) => {
    const t = getOrderUnitType(thing);
    return EDITORS.find((e) => e.value === t) || null;
  };
  // ✅ ВАЖЛИВО: функція має бути в scope компонента, а не всередині іншої функції
  const openEditorForOrderUnit = (thingOrNull, eOrType) => openEditor(thingOrNull, eOrType);



  const toggleExpandedThing = (index) => {
    setExpandedThingIndex(prev => (prev === index ? null : index));
  };


  const setTypeSelect2 = (thing) => {
    if (thing !== null) {
      setTypeSelect(thing)
    } else {
      setTypeSelect("")
    }
  };
  const handleThingClick = (thing, typeThing) => {
    let newThisOrderToSend = thisOrder
    // console.log(thing);
    if (thing.productunits) {
      newThisOrderToSend.OrderUnits = [...selectedThings2, {
        ...thing,
        amount: 1,
        newField2: 45,
        newField3: 45,
        OrderUnitUnits: thing.productunits
      }]
    } else {
      newThisOrderToSend.OrderUnits = [...selectedThings2, {
        ...thing,
        amount: 1,
        newField2: 45,
        newField3: 45,
        OrderUnitUnits: [],
        x: thing.x,
        y: thing.y,
        idInStorageUnit: thing.id
      }]
    }
    setNewThisOrder(newThisOrderToSend)
  };

  const handleThingClickDelete2 = (OrderUnit, e) => {
    e.stopPropagation()
    setShowDeleteOrderUnitModal(true)
    setThisOrderUnit(OrderUnit)
  };

  const handleAmountChange = (selectedThingIndex, fieldName, event) => {
    const updatedSelectedThings2 = [...selectedThings2];
    updatedSelectedThings2[selectedThingIndex][fieldName] = event.target.value;
    let newThisOrderToSend = thisOrder
    newThisOrderToSend.OrderUnits = updatedSelectedThings2
    setNewThisOrder(newThisOrderToSend)
  };


  const handleThisOrderChange = (fieldName, event) => {
    const updatedThisOrder = thisOrder;
    updatedThisOrder[fieldName] = event.target.value;
    setNewThisOrder(updatedThisOrder)
  };


  // const getActiveButton = (thing) => {
  //   const fieldValue = thing?.newField6;
  //
  //
  //
  //
  //
  //
  //
  //   const activeButton = buttons.find(btn => btn.value === fieldValue);
  //   if (!activeButton) return null;
  //
  //   return (
  //     <button
  //       type="button"
  //       className="orderEditTabBtn"
  //       onClick={(e) => {
  //         e.stopPropagation();           // щоб не розгортало карточку
  //         setEditingOrderUnitSafe(thing);    // передаємо редаговану позицію
  //         activeButton.setState(true);   // відкриваємо відповідне модальне
  //       }}
  //       title={activeButton.label}
  //     >
  //       {activeButton.label}
  //     </button>
  //   );
  // };


  // const handleSaveOrder = (event, valueName) => {
  //   let dataToSend = {
  //     data: [],
  //     id: false,
  //     tablePosition: valueName,
  //     value: event.target.value
  //   }
  //   axios.post(`/orders/new`, dataToSend)
  //     .then(response => {
  //       // console.log(response.data);
  //       navigate(`/Orders/${response.data.id}`);
  //     })
  //     .catch(error => {
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       console.log(error.message);
  //     })
  // };

  useEffect(() => {
    (() => {
      // console.log(1);
    })();
    if (id) {
      setIsLoad(true)
      let data = {
        id: id
      }
      // console.log(data);
      axios.post(`/Orders/OneOrder`, data)
        .then(response => {
          // console.log(axios);
          // console.log(response.data);
          setThisOrder(response.data)
          setSelectedThings2(response.data.OrderUnits)
          setIsLoad(false)
        })
        .catch((error, response) => {
          console.log(error.message);
          if (error?.response?.status === 403) {
            navigate('/login');
          }
          setIsLoad(false)
          setError(error.message)
        })
    }
  }, [id]);

  useEffect(() => {

  }, [selectedThings2]);

  if (thisOrder) {
    return (
      <div>
        <div className="d-flex">
          <div className="containerForContNewUI">

            {/* === GRID OF SERVICE TILES === */}
            <div
              className="CardPrintersPoslugi"
              style={{ position: 'absolute', top: "5%", left: "0%", width: "36.5%" }}

            >

              {/* 1) BLACK & WHITE */}
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOrderUnitSafe(null);
                  setShowNewSheetCutBW(true);
                }}
              >



              <div className="tileContent">
                  <span className="verticalText">BLACK & WHITE</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={blackWhitePrintIcon} alt="" />
                </div>
              </p>

              {/* 2) DIGITAL PRINT CUTTING */}
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOrderUnitSafe(null);      // ✅ важливо
                  setShowNewSheetCut(true);
                }}
              >
                <div className="tileContent">
                  <div className="verticalColumns" style={{ marginTop: "-0.2vh" }}>
                    <span className="verticalText">DIGITAL PRINT CUTING</span>
                  </div>
                  <img className="icon64 CardPrintersPoslugiImg" src={colorPrintIcon} alt="" />
                </div>
              </p>

              {/* 3) PLOTTER CUT */}
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOrderUnitSafe(null);
                  setShowVishichka(true);
                }}
              >
                <div className="tileContent">
                  <span className="verticalText">PLOTTER CUT</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={plotterCutIcon} alt="" />
                </div>
              </p>

              {/* 4) PHOTO */}
              <p onClick={() => openEditorForOrderUnit(null, 'Photo')}>
                <div className="tileContent">
                  <span className="verticalText">PHOTO</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={photoIcon} alt="" />
                </div>
              </p>

              {/* 5) WIDE PHOTO */}
              <p onClick={() => openEditorForOrderUnit(null, 'Wide')}>
                <div className="tileContent">
                  <span className="verticalText">WIDE PHOTO</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={wideIcon} alt="" />
                </div>
              </p>

              {/* 6) WIDE FACTORY */}
              <p onClick={() => openEditorForOrderUnit(null, 'WideFactory')}>
                <div className="tileContent">
                  <div className="verticalColumns">
                    <span className="verticalText">WIDE FACTORY</span>
                    <span className="verticalText"></span>
                  </div>
                  <img className="icon64 CardPrintersPoslugiImg" src={wideFactoryIcon} alt="" />
                </div>
              </p>

              {/* 7) POSTPRESS */}
              <p onClick={() => openEditorForOrderUnit(null, 'Postpress')}>
                <div className="tileContent">
                  <span className="verticalText">POSTPRESS</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={postpressIcon} alt="" />
                </div>
              </p>

              {/* 8) BINDING */}
              <p onClick={() => openEditorForOrderUnit(null, 'Binding')}>
                <div className="tileContent">
                  <span className="verticalText">BINDING</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={bindingIcon} alt="" />
                </div>
              </p>

              {/* 9) LAMINATION */}
              <p onClick={() => openEditorForOrderUnit(null, 'Lamination')}>
                <div className="tileContent">
                  <span className="verticalText">LAMINATION</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={laminationIcon} alt="" />
                </div>
              </p>

            </div>


          </div>
          {/* Третя група */}
          <div className="d-flex justify-content-end align-items-end">
            <div className="CardPrintersPoslugi"
              style={{ position: "absolute", bottom: "16%", right: "35%", width: "30%" }}>
              <p onClick={() => setShowNewNote(true)}>
                <div className="tileContent">
                  <span className="verticalText">NOTE</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={noteIcon} alt="" />
                  {/*<svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"*/}
                  {/*     stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">*/}
                  {/*  <rect x="18" y="12" width="28" height="40" rx="2"/>*/}
                  {/*  <line className="draw" pathLength="1" x1="22" y1="16" x2="22" y2="48"/>*/}
                  {/*  <circle className="draw" pathLength="1" cx="22" cy="20" r="1"/>*/}
                  {/*  <circle className="draw" pathLength="1" cx="22" cy="26" r="1"/>*/}
                  {/*  <circle className="draw" pathLength="1" cx="22" cy="32" r="1"/>*/}
                  {/*</svg>*/}
                </div>
              </p>


              <p onClick={() => setShowNewBooklet(true)}>
                <div className="tileContent">
                  <span className="verticalText">BOOKLET</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={bookletIcon} alt="" />
                  {/*<svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"*/}
                  {/*     stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">*/}
                  {/*  <rect x="16" y="14" width="32" height="36" rx="2"/>*/}
                  {/*  <line className="draw" pathLength="1" x1="32" y1="14" x2="32" y2="50"/>*/}
                  {/*</svg>*/}
                </div>
              </p>


              <p onClick={() => setShowNewCup(true)}>
                <div className="tileContent">
                  <span className="verticalText">MUG</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={MUG} alt="" />
                  {/*<svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64"*/}
                  {/*     fill="none" stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">*/}
                  {/*  <rect className="draw" pathLength="1" x="20" y="24" width="20" height="16" rx="2"/>*/}
                  {/*  <circle className="draw" pathLength="1" cx="42" cy="28" r="5"/>*/}
                  {/*  <path className="draw" pathLength="1" d="M26 20c0-4 4-4 4-8"/>*/}
                  {/*  <path className="draw" pathLength="1" d="M34 20c0-4 4-4 4-8"/>*/}
                  {/*</svg>*/}


                </div>
              </p>


              <p onClick={() => setShowNewMagnets(true)}>
                <div className="tileContent">
                  <span className="verticalText">MAGNETS</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={magnets} alt="" />
                  {/*<svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"*/}
                  {/*     stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">*/}
                  {/*  <path className="draw" pathLength="1" d="M20 20h8v12h-8a12 12 0 0 0 24 0h-8V20h8"/>*/}
                  {/*</svg>*/}
                </div>
              </p>


              <p onClick={() => setShowNewScans(true)}>
                <div className="tileContent">
                  <span className="verticalText">SCANS</span>
                  {/*<img className="icon64 CardPrintersPoslugiImg" src={scansIcon} alt=""/>*/}
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                    stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="14" y="28" width="36" height="12" rx="2" />
                    <rect x="20" y="18" width="24" height="8" rx="1" />
                    <line className="draw" pathLength="1" x1="14" y1="40" x2="50" y2="40" />
                  </svg>
                </div>
              </p>


              <p onClick={() => setShowDelivery(true)}>
                <div className="tileContent">
                  <span className="verticalText">DELIVERY</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={deliveryIcon} alt="" />
                  {/*<svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"*/}
                  {/*     stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">*/}
                  {/*  <rect x="12" y="28" width="40" height="12" rx="2"/>*/}
                  {/*  <path className="draw" pathLength="1" d="M12 28l8-8h24l8 8"/>*/}
                  {/*  <circle cx="20" cy="44" r="4"/>*/}
                  {/*  <circle cx="44" cy="44" r="4"/>*/}
                  {/*</svg>*/}
                </div>
              </p>

            </div>
          </div>


          <div className="d-flex flex-column " style={{ width: "37.5vw", }}>
            <div className="order-panel d-flex " style={{ width: "37.5vw", marginTop: "0.5vh", height: "65vh" }}>
              {selectedThings2 && selectedThings2.length !== 0 ? (
                <div className="order-list" style={{ overflowX: "hidden", height: "78vh", }}>
                  {selectedThings2.map((thing, index) => (
                    <div
                      key={index}
                      className="order-item card3d"
                      onClick={() => toggleExpandedThing(index)}
                      style={{
                        width: "36vw",
                        marginBottom: "1vh",
                        cursor: "pointer",
                        padding: "1rem",
                        marginLeft: "3px",


                        position: "relative",

                      }}
                    >
                      <div
                        onClick={(e) => handleThingClickDelete2(thing, e)}
                        className="battonClosed">
                        ✕
                      </div>


                      {(() => {
                        const editor = getEditorByThing(thing);
                        console.log("▒");
                        console.log("▒");
                        console.log("▒");
                        console.log("▒");
                        console.log("▒");
                        console.log("▒");
                        console.log("▒");
                        console.log(thing);
                        return (
                          <button
                            className="buttonSkewedOrderClient adminButtonAdd"
                            type="button"
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              borderRadius: "0 0 1vh 0",
                              minWidth: "9vw",
                              zIndex: 50
                            }}
                            onClick={(e) => openEditor(thing, e)}
                            title={editor?.label || "Редагувати"}
                          >
                            <span className="icon">✎</span>
                            <span className="label" style={{ fontWeight: 450, fontSize:"1.1vh" }}>
                              ✏️ {editor?.label || thing.newField6}
                            </span>
                          </button>
                        );
                      })()}


                      {/* === ДАЛІ ТВОЯ ІСНУЮЧА РОЗМІТКА === */}
                      <div className="containerOrderUnits">



                        <div className="d-flex">
                          <div
                            className="d-flex flex-column justify-content-start">
                            <div
                              className="d-flex justify-content-between align-items-start"
                              style={{
                                background: "transparent",
                                padding: "0",
                                borderRadius: "1vh",
                                border: "none",
                                width: "100%",
                                flexWrap: "wrap"
                              }}
                            >
                              {/* Ціна за штуку без знижки */}


                              {/* Назва + розміри */}
                              <div
                                className="adminFontTable  BasePriceWithQuantityBase d-flex flex-column"

                              >
                                <div className={"d-flex flex-row align-items-center"}
                                  style={{
                                    maxWidth: "33vw",
                                    background: "transparent",
                                    // textTransform:"uppercase"
                                  }}>
                                  <div>
                                    <div className="adminTextBig"
                                      style={{ maxWidth: "33vw" }}>{thing.name}</div>
                                    <div
                                      style={{
                                        marginTop: '0.5rem',
                                        height: '1px',
                                        background: 'transparent',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                      }}
                                    />
                                  </div>

                                  {/*  <div style={{ fontSize: "2vh", opacity: 0.6 }}>*/}
                                  {/*  ({thing.newField2} мм × {thing.newField3} мм)*/}
                                  {/*</div>*/}
                                </div>
                                {/* Основна ціна з кількістю */}

                                <div
                                  className="d-flex align-items-center justify-content-start BasePriceWithQuantity">
                                  <span className="" style={{ color: "rgba(0, 0, 0, 0.6)" }}>{thing.amount}<span
                                    className="BasePriceWithQuantitySmall "> шт</span></span>
                                  <span className=""
                                    style={{ color: "rgba(0, 0, 0, 0.6)" }}>× {parseFloat(thing.priceForOneThis).toFixed(2)}<span
                                      className="BasePriceWithQuantitySmall"> грн</span></span>

                                  <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>=</span>
                                  <span className="" style={{ color: "red", fontWeight: "400" }}>{thing.priceForThisDiscount}<span
                                    className="BasePriceWithQuantitySmall" style={{ color: "red" }}> грн </span></span>
                                  {/*{getActiveButton(thing.newField6)}*/}
                                </div>
                                {/* Знижка, якщо є */}
                                {parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2) && (
                                  <div
                                    className="d-flex flex-row" style={{ color: "#008249" }}
                                  >


                                    <div
                                      className="d-flex align-items-center justify-content-start BasePriceWithQuantity"
                                      style={{ color: "#008249" }}>


                                      <span style={{ color: "#008249" }}>{thing.amount}<span
                                        className="BasePriceWithQuantitySmall"
                                        style={{ color: "#008249" }}> шт</span></span>

                                      <span
                                        className=""
                                        style={{ color: "#008249" }}>  × {parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(2)}<span
                                          className="BasePriceWithQuantitySmall"
                                          style={{ color: "#008249" }}> грн</span></span>
                                      {/*{parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(3)}*/}
                                      {/*<span style={{ fontSize: "1rem", opacity: 0.5 }}><div className="BasePriceWithQuantitySmall ">грн</div></span>*/}
                                      =
                                      <span className=" " style={{ color: "#008249" }}>

                                        {thing.priceForThisDiscount}
                                        <span className="BasePriceWithQuantitySmall"
                                          style={{ color: "#008249" }}> грн</span>
                                      </span>
                                    </div>

                                    <div className="BasePriceWithQuantityDiscountword">
                                      {/*Знижка {thisOrder.prepayment}*/}
                                    </div>
                                  </div>
                                )}
                              </div>


                            </div>

                            {expandedThingIndex === index && (
                              <>
                                <OneProductInOrders
                                  item={thing}
                                  cash={true}
                                  handleAmountChange={handleAmountChange}
                                  index={index}
                                  thisOrder={thisOrder}
                                />

                                <div className="bottomMeta">
                                  <div className="col">
                                    <div
                                      className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                      На аркуші можна розмістити
                                      <span className="booooold money" style={{ color: "#3c60a6" }}>
                                        {thing.newField4}
                                      </span> виробів
                                    </div>
                                    <div
                                      className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                      Використано на це замовлення
                                      <strong style={{ color: "#3c60a6" }}>{thing.newField5}</strong> аркушів
                                    </div>
                                  </div>

                                  <div className="col d-flex flex-column" style={{ paddingLeft: '4vw' }}>
                                    <div className="d-flex flex-column align-items-end">
                                      <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                        <div className="BasePriceWithQuantityBig">
                                          За 1 аркуш:
                                        </div>
                                        <span className="booooold money" style={{ color: "#ee3c23" }}>
                                          {parseFloat(thing.priceForThis / thing.newField5).toFixed(2)}
                                          <span className="BasePriceWithQuantitySmall" style={{ color: "#ee3c23" }}>
                                            грн
                                          </span>
                                        </span>
                                      </div>
                                      <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                        <div className="BasePriceWithQuantityBig">
                                          За 1 шт:
                                        </div>
                                        <span className="booooold money" style={{ color: "#ee3c23" }}>
                                          {parseFloat(thing.priceForThis / thing.amount).toFixed(2)}
                                          <span className="BasePriceWithQuantitySmall" style={{ color: "#ee3c23" }}>
                                            грн
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {(+parseFloat(thing.priceForOneThis).toFixed(2)) !==
                                  (+parseFloat(thing.priceForOneThisDiscount || 0).toFixed(2)) && (
                                    <div className="d-flex flex-column align-items-center" style={{ fontSize: "0.7vw" }}>
                                      <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                        <div className="BasePriceWithQuantityBig">
                                          За 1 аркуш:
                                        </div>
                                        <span className="booooold money" style={{ color: "#008249" }}>
                                          {parseFloat(thing.priceForThisDiscount / thing.newField5).toFixed(2)}
                                          <span className="BasePriceWithQuantitySmall" style={{ color: "#008249" }}>
                                            грн
                                          </span>
                                        </span>
                                      </div>
                                      <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                        <div className="BasePriceWithQuantityBig">
                                          За 1 шт:
                                        </div>
                                        <span className="booooold money" style={{ color: "#008249" }}>
                                          {parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(2)}
                                          <span className="BasePriceWithQuantitySmall" style={{ color: "#008249" }}>
                                            грн
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </>
                            )}


                          </div>
                        </div>


                      </div>


                      {/* …весь внутрішній JSX залишається, лише прибери зайві d-flex */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty"></div>
              )}
            </div>


          </div>
        </div>


        <ModalDeleteOrderUnit
          showDeleteOrderUnitModal={showDeleteOrderUnitModal}
          setShowDeleteOrderUnitModal={setShowDeleteOrderUnitModal}
          OrderUnit={thisOrderUnit}
          setThisOrderUnit={setThisOrderUnit}
          setThisOrder={setThisOrder}
          setSelectedThings2={setSelectedThings2}
        />


        {showNewSheetCutBW &&
          <NewSheetCutBW
            productName={productName}
           thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewSheetCutBW={showNewSheetCutBW}
            setShowNewSheetCutBW={setShowNewSheetCutBW}
            editingOrderUnit={editingOrderUnit}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewSheetCut &&
          <NewSheetCut
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewSheetCut={setShowNewSheetCut}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewSheetCut={showNewSheetCut}
            editingOrderUnit={editingOrderUnitSafe}    // ← нове

          />
        }
        {/*{showNewSheetSheet &&*/}
        {/*  <NewSheetSheet*/}
        {/*    productName={productName}*/}
        {/*    thisOrder={thisOrder}*/}
        {/*    newThisOrder={newThisOrder}*/}
        {/*    selectedThings2={selectedThings2}*/}
        {/*    setNewThisOrder={setNewThisOrder}*/}
        {/*    setShowNewSheetSheet={setShowNewSheetSheet}*/}
        {/*    setThisOrder={setThisOrder}*/}
        {/*    setSelectedThings2={setSelectedThings2}*/}
        {/*    showNewSheetSheet={showNewSheetSheet}*/}
        {/*  />*/}
        {/*}*/}
        {showNewWide &&
          <NewWide
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewWide={setShowNewWide}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewWide={showNewWide}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showWideFactory &&
          <WideFactory
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showWideFactory={showWideFactory}
            setShowWideFactory={setShowWideFactory}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewCup &&
          <NewCup
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewCup={setShowNewCup}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewCup={showNewCup}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewScans &&
          <NewScans
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewScans={setShowNewScans}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewScans={showNewScans}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showDelivery &&
          <Delivery
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowDelivery={setShowDelivery}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showDelivery={showDelivery}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewMagnets &&
          <NewMagnets
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewMagnets={setShowNewMagnets}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            showNewMagnets={showNewMagnets}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewPhoto &&
          <NewPhoto
            productName={productName}
            thisOrder={thisOrder}
            newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewPhoto={setShowNewPhoto}
            showNewPhoto={showNewPhoto}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {/*{showPlotter &&*/}
        {/*    <Plotter*/}
        {/*        productName={productName}*/}
        {/*        thisOrder={thisOrder} newThisOrder={newThisOrder}*/}
        {/*        selectedThings2={selectedThings2}*/}
        {/*        setNewThisOrder={setNewThisOrder}*/}
        {/*        setShowPlotter={setShowPlotter}*/}
        {/*        showPlotter={showPlotter}*/}
        {/*        setThisOrder={setThisOrder}*/}
        {/*        setSelectedThings2={setSelectedThings2}*/}
        {/*    />*/}
        {/*}*/}
        {showNewNote &&
          <NewNote
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewNote={setShowNewNote}
            showNewNote={showNewNote}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showNewBooklet &&
          <NewBooklet
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewBooklet={setShowNewBooklet}
            showNewBooklet={showNewBooklet}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }

        {showBigOvshik &&
          <BigOvshik
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowBigOvshik={setShowBigOvshik}
            showBigOvshik={showBigOvshik}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showPerepletMet &&
          <PerepletMet
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowPerepletMet={setShowPerepletMet}
            showPerepletMet={showPerepletMet}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {/*{showPerepletNeMet &&*/}
        {/*    <PerepletNeMet*/}
        {/*        productName={productName}*/}
        {/*        thisOrder={thisOrder} newThisOrder={newThisOrder}*/}
        {/*        selectedThings2={selectedThings2}*/}
        {/*        setNewThisOrder={setNewThisOrder}*/}
        {/*        setShowPerepletNeMet={setShowPerepletNeMet}*/}
        {/*        showPerepletNeMet={showPerepletNeMet}*/}
        {/*        setThisOrder={setThisOrder}*/}
        {/*        setSelectedThings2={setSelectedThings2}*/}
        {/*    />*/}
        {/*}*/}
        {showLaminator &&
          <Laminator
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowLaminator={setShowLaminator}
            showLaminator={showLaminator}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {showVishichka &&
          <Vishichka
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowVishichka={setShowVishichka}
            showVishichka={showVishichka}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
            editingOrderUnit={editingOrderUnitSafe}
            setEditingOrderUnit={setEditingOrderUnitSafe}
          />
        }
        {thisOrder ? (

          <div className="ClientsMenuAll" style={{
            width: "36.5vw", position: "fixed", bottom: "0vh", height: "15vh", right: "0"
          }}>
            <ProgressBar thisOrder={thisOrder} setThisOrder={setThisOrder}
              newThisOrder={newThisOrder}
              setNewThisOrder={setNewThisOrder}
              handleThisOrderChange={handleThisOrderChange}
              setSelectedThings2={setSelectedThings2}
              selectedThings2={selectedThings2} />
          </div>
        ) : (
          <div>
            <Loader />
            <div>Як так сталося що у вас Order без User?!?</div>
          </div>
          // <ClientChangerUIArtem client={thisOrder.User} thisOrder={thisOrder}
          //                       setNewThisOrder={setNewThisOrder}
          //                       handleThisOrderChange={handleThisOrderChange}/>
          // <ClientChangerUIArtem client={{email: "null", id: 0, phone: "+00000000",}}/>
        )}
        <div className="d-flex flex-row" style={{ position: "fixed", bottom: "-0.7vh", }}>
          <div className="containerNewUI"
            style={{
              height: "17vh",
              width: "30vw",
              position: "relative",
              padding: '1rem',
              boxShadow: "0 5px 5px 3px rgba(0, 0, 0, 0.15)"
            }}>
            <OrderFilesPanel thisOrder={thisOrder} />
          </div>
          <div className="containerNewUI" style={{
            height: "17vh", width: "30vw", position: "relative", boxShadow: "0 5px 5px 3px rgba(0, 0, 0, 0.15)",


          }}>
            <ClientChangerUIArtem
              thisOrder={thisOrder}
              setThisOrder={setThisOrder}
              setNewThisOrder={setNewThisOrder}
              setSelectedThings2={setSelectedThings2}
              handleThisOrderChange={handleThisOrderChange}
            />
          </div>

        </div>
      </div>

    );
  }

  if (error) {
    return (
      <h1 className="d-flex justify-content-center align-items-center">
        {error}
      </h1>
    )
  }
  return (
    <h1 className="d-flex justify-content-center align-items-center">
      <Loader />
    </h1>
  )
};


export default NewUIArtem;
