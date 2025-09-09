import React, {useEffect, useState} from "react";
import './userInNewUiArtem/StyleArtem.css';
import './CPM.css';
import './global.css';
import './adminStylesCrm.css';
import './Wide.css';
import './MainWindow.css';
import {useNavigate, useParams} from "react-router-dom";
import axios from '../api/axiosInstance';

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
import NewSheetCutBw from "./poslugi/NewSheetCutBw";
import NewPhoto from "./poslugi/NewPhoto";
import NewNote from "./poslugi/NewNote";
import ModalDeleteOrderUnit from "./ModalDeleteOrderUnit";
import Loader from "../components/calc/Loader";
import Laminator from "./poslugi/Laminator";
import Vishichka from "./poslugi/Vishichka";
import PerepletMet from "./poslugi/PerepletMet";
import BigOvshik from "./poslugi/BigOvshik";
import ProgressBar from "../ProgressBar";
// import {ExampleLoaderComponent} from "../dev/palette";
import NewCup from "./poslugi/NewCup";

import NewBooklet from "./poslugi/NewBooklet";
import NewMagnets from "./poslugi/NewMagnets";
import NewScans from "./poslugi/NewScans";
import WideFactory from "./poslugi/WideFactory";
import NewSheetSheet from "./poslugi/NewSheetSheet";
import Delivery from "./poslugi/DeliveryPage";
import OrderFilesPanel from "./commentsInOrders/OrderFilesPanel";
import Knopka1 from "./knopki/Knopka1.jsx";
// import RadicalMenuGrid from "./tools/RadicalMenuGrid";
const NewUIArtem = () => {
  const navigate = useNavigate();
  const [things, setThings] = useState([]);
  const [products, setProducts] = useState(null);
  const [selectedThings2, setSelectedThings2] = useState([]);
  const [summ, setSumm] = useState(0);
  const [isLoad, setIsLoad] = useState(false);
  const [error, setError] = useState(null);
  const {id} = useParams();
  const [thisOrder, setThisOrder] = useState({


    // id: id
  });
  const [newThisOrder, setNewThisOrder] = useState({
    id: id
  });
  const [typeSelect, setTypeSelect] = useState("");
  const [productName, setProductName] = useState('');
  const [showDeleteOrderUnitModal, setShowDeleteOrderUnitModal] = useState(false);
  const [thisOrderUnit, setThisOrderUnit] = useState(null);

  const [showWide, setShowWide] = useState(false);


  const [showNewSheetCutBw, setShowNewSheetCutBw] = useState(false);
  const [showNewSheetCut, setShowNewSheetCut] = useState(false);
  const [showNewSheetSheet, setShowNewSheetSheet] = useState(false);
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

  const handleThingClickDelete2 = (OrderUnit) => {
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

  const handleSaveOrder = (event, valueName) => {
    let dataToSend = {
      data: [],
      id: false,
      tablePosition: valueName,
      value: event.target.value
    }
    axios.post(`/orders/new`, dataToSend)
      .then(response => {
        // console.log(response.data);
        navigate(`/Orders/${response.data.id}`);
      })
      .catch(error => {
        if (error.response.status === 403) {
          navigate('/login');
        }
        console.log(error.message);
      })
  };

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
          if (error.response.status === 403) {
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
            {/* Перша група */}
            {/* === GRID OF SERVICE TILES === */}
            <div className="CardPrintersPoslugi">

              {/* 1) BLACK */}
              <p onClick={() => setShowNewSheetCutBw(true)}>
                <div className="tileContent">
                  <span className="verticalText">BLACK & WHITE</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none" stroke="#2f2f2f"
                       strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="draw" pathLength="1" x="10" y="18" width="44" height="10" rx="2"/>
                    <rect className="draw" pathLength="1" x="14" y="28" width="36" height="22" rx="3"/>
                    <rect className="draw" pathLength="1" x="20" y="10" width="24" height="8" rx="1"/>
                    <rect className="draw" pathLength="1" x="22" y="42" width="20" height="8"/>
                    <line className="draw" pathLength="1" x1="18" y1="34" x2="46" y2="34"/>
                  </svg>
                </div>
              </p>

              {/* 2) COLOR PRODUCTS */}
              <p onClick={() => setShowNewSheetCut(true)}>
                <div className="tileContent">
                  <div className="verticalColumns">
                    <span className="verticalText">DIGITAL PRINT</span>
                    <span className="verticalText">CUTING</span>
                  </div>
                  <svg
                    className="icon64 CardPrintersPoslugiImg"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="#2f2f2f"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <rect className="sheetTop" x="16" y="12" width="32" height="20" rx="2"/>

                    <rect className="sheetBottom" x="16" y="32" width="32" height="20" rx="2"/>
                  </svg>


                </div>
              </p>
              {/* 7) CUTTING */}
              <p onClick={() => setShowVishichka(true)}>

                <div className="tileContent">
                  <span className="verticalText">PLOTTER CUT</span>
                  <svg className="icon64 thin CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="12" y="12" width="40" height="40" rx="2"/>
                    <circle className="cutPath" cx="32" cy="32" r="10"/>
                    <line x1="16" y1="18" x2="48" y2="18"/>
                    <g className="head">
                      <rect x="18" y="14" width="6" height="6" rx="1"/>
                      <line x1="21" y1="14" x2="21" y2="10"/>
                    </g>
                  </svg>
                </div>
              </p>
              {/* 4) PHOTO */}
              <p onClick={() => setShowNewPhoto?.(true)}>
                <div className="tileContent">
                  <span className="verticalText">PHOTO</span>
                  <svg
                    className="icon64 CardPrintersPoslugiImg"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="#2f2f2f"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* рамка полароїда з великим нижнім полем */}
                    <rect className="draw" pathLength="1" x="16" y="11" width="33" height="40" rx="1"/>
                    {/* вікно фото всередині */}
                    <rect className="draw" pathLength="1" x="20" y="14" width="24" height="22" rx="2"/>
                    {/* пейзаж: гора + сонце */}
                    <path className="draw" pathLength="1" d="M22 34l8-8 6 5 8-7"/>
                    <circle className="draw" pathLength="1" cx="38" cy="20" r="3"/>
                    {/* підпис під фото */}
                    <line className="draw" pathLength="1" x1="24" y1="42" x2="40" y2="42"/>
                  </svg>
                </div>
              </p>
              {/* 3) WIDE */}
              <p onClick={() => setShowNewWide(true)}>

                <div className="tileContent">
                  <span className="verticalText">WIDE PHOTO</span>
                  <svg className="icon64 wide CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none" stroke="#2f2f2f"
                       strokeWidth="1"
                       strokeLinecap="round" strokeLinejoin="round">
                    <rect x="10" y="12" width="44" height="10" rx="1"/>
                    <g className="moveHead">
                      <rect x="12" y="12" width="12" height="10" rx="1"/>
                    </g>
                    <rect x="14" y="26" width="36" height="22" rx="1"/>
                    <rect className="trace" x="16" y="50" width="4" height="4" rx="0.5"/>
                    <rect className="trace" x="22" y="50" width="4" height="4" rx="0.5"/>
                    <rect className="trace" x="28" y="50" width="4" height="4" rx="0.5"/>
                    <rect className="trace" x="34" y="50" width="4" height="4" rx="0.5"/>
                  </svg>
                </div>
              </p>

              {/* 8) WIDE FACTORY */}
              <p onClick={() => setShowWideFactory?.(true)}>
                <div className="tileContent">
                  <div className="verticalColumns">
                    <span className="verticalText">WIDE</span>
                    <span className="verticalText">FACTORY</span>
                  </div>
                  <svg className="icon64 ind CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none" stroke="#2f2f2f"
                       strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="12" width="48" height="8" rx="2"/>
                    <g className="gantry">
                      <rect x="26" y="12" width="12" height="8" rx="1"/>
                    </g>
                    <rect className="dry" x="12" y="24" width="40" height="16" rx="2"/>
                    <path className="trace" d="M16 36l10-6 8 5 8-5"/>
                  </svg>


                </div>
              </p>


              {/* 5) POSTPRESS */}
              <p onClick={() => setShowBigOvshik(true)}>

                <div className="tileContent">
                  <span className="verticalText">POSTPRESS</span>
                  <svg className="icon64 post CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="14" y="16" width="36" height="32" rx="2"/>
                    <rect className="move armsL" x="14" y="16" width="12" height="32"/>
                    <rect className="move armsR" x="38" y="16" width="12" height="32"/>
                    <line className="trace" x1="26" y1="16" x2="26" y2="48"/>
                    <line className="trace" x1="38" y1="16" x2="38" y2="48"/>
                  </svg>


                </div>
              </p>

              {/* 6) BINDING */}
              <p onClick={() => setShowPerepletMet(true)}>

                <div className="tileContent">
                  <span className="verticalText">BINDING</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none" stroke="#2f2f2f"
                       strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="draw" pathLength="1" x="14" y="14" width="36" height="36" rx="2"/>
                    <line className="draw" pathLength="1" x1="22" y1="14" x2="22" y2="50"/>
                    <path className="draw" pathLength="1" d="M18 18h6M18 24h6M18 30h6M18 36h6M18 42h6"/>
                  </svg>
                </div>
              </p>


              {/* 9) LAMINATION */}
              <p onClick={() => setShowLaminator(true)}>
                <div className="tileContent">
                  <span className="verticalText">LAMINATION</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none" stroke="#2f2f2f"
                       strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="draw" pathLength="1" x="10" y="18" width="44" height="10" rx="5"/>
                    <rect className="draw" pathLength="1" x="10" y="32" width="44" height="10" rx="5"/>
                    <rect className="draw" pathLength="1" x="18" y="26" width="28" height="8" rx="2"/>
                  </svg>
                </div>
              </p>

            </div>

          </div>
          {/* Третя група */}
          <div className="d-flex justify-content-end align-items-end" style={{bottom: "19vh", position: "absolute"}}>
            <div className="CardPrintersPoslugi">
              <p onClick={() => setShowNewNote(true)}>
                <div className="tileContent">
                  <span className="verticalText">NOTE</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="18" y="12" width="28" height="40" rx="2"/>
                    <line className="draw" pathLength="1" x1="22" y1="16" x2="22" y2="48"/>
                    <circle className="draw" pathLength="1" cx="22" cy="20" r="1"/>
                    <circle className="draw" pathLength="1" cx="22" cy="26" r="1"/>
                    <circle className="draw" pathLength="1" cx="22" cy="32" r="1"/>
                  </svg>
                </div>
              </p>


              <p onClick={() => setShowNewBooklet(true)}>
                <div className="tileContent">
                  <span className="verticalText">BOOKLET</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="16" y="14" width="32" height="36" rx="2"/>
                    <line className="draw" pathLength="1" x1="32" y1="14" x2="32" y2="50"/>
                  </svg>
                </div>
              </p>


              <p onClick={() => setShowNewCup(true)}>
                <div className="tileContent">
                  <span className="verticalText">MUG</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64"
                       fill="none" stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="draw" pathLength="1" x="20" y="24" width="20" height="16" rx="2"/>
                    <circle className="draw" pathLength="1" cx="42" cy="28" r="5"/>
                    <path className="draw" pathLength="1" d="M26 20c0-4 4-4 4-8"/>
                    <path className="draw" pathLength="1" d="M34 20c0-4 4-4 4-8"/>
                  </svg>


                </div>
              </p>


              <p onClick={() => setShowNewMagnets(true)}>
                <div className="tileContent">
                  <span className="verticalText">MAGNETS</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path className="draw" pathLength="1" d="M20 20h8v12h-8a12 12 0 0 0 24 0h-8V20h8"/>
                  </svg>
                </div>
              </p>


              <p onClick={() => setShowNewScans(true)}>
                <div className="tileContent">
                  <span className="verticalText">SCANS</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="14" y="28" width="36" height="12" rx="2"/>
                    <rect x="20" y="18" width="24" height="8" rx="1"/>
                    <line className="draw" pathLength="1" x1="14" y1="40" x2="50" y2="40"/>
                  </svg>
                </div>
              </p>


              <p onClick={() => setShowDelivery(true)}>
                <div className="tileContent">
                  <span className="verticalText">DELIVERY</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="12" y="28" width="40" height="12" rx="2"/>
                    <path className="draw" pathLength="1" d="M12 28l8-8h24l8 8"/>
                    <circle cx="20" cy="44" r="4"/>
                    <circle cx="44" cy="44" r="4"/>
                  </svg>
                </div>
              </p>

            </div>
          </div>


          <div className="d-flex flex-column " style={{width: "37.5vw",}}>
            <div className="order-panel d-flex " style={{width: "37.5vw", marginTop: "0.5vh"}}>
              {selectedThings2 && selectedThings2.length !== 0 ? (
                <div className="order-list" style={{overflowX: "hidden", height: "78vh"}}>
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
                        marginLeft: "3px"
                      }}
                    >
                      <div
                        onClick={(e) => handleThingClickDelete2(thing)}
                        className="battonClosed">
                        ✕
                      </div>
                      {/*<span className="battonClosed" style={{*/}
                      {/*    // float: "right",*/}
                      {/*    // // color: "#EE3C23",*/}
                      {/*    // fontSize: "2vh",*/}
                      {/*    // marginRight: "1vw",*/}
                      {/*    // marginTop: "0.5vh",*/}
                      {/*    // marginBottom: "0.5vh",*/}
                      {/*    zIndex: "1000",*/}
                      {/*}}*/}
                      {/*      onClick={(e) => handleThingClickDelete2(thing)}>✕</span>*/}
                      <div className="containerOrderUnits" style={{
                        // width: "30vw",
                        // overflow: "hidden"
                      }}>
                        <div className="d-flex">
                          <div
                            className="d-flex flex-column justify-content-start">
                            <div
                              className="d-flex justify-content-between align-items-start"
                              style={{
                                background: "transparent",
                                padding: "0",
                                borderRadius: "12px",
                                border: "0",
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
                                     style={{maxWidth: "33vw", background: "transparent"}}>
                                  <div>
                                    <div className="adminTextBig"
                                         style={{fontSize: "1vw", maxWidth: "33vw"}}>{thing.name}</div>
                                    <div
                                      style={{
                                        marginTop: '0.5rem',
                                        height: '1px',
                                        background: 'transparent',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                      }}
                                    />
                                  </div>

                                  {/*  <div style={{ fontSize: "2vh", opacity: 0.6 }}>*/}
                                  {/*  ({thing.newField2} мм × {thing.newField3} мм)*/}
                                  {/*</div>*/}
                                </div>
                                {/* Основна ціна з кількістю */}
                                <div
                                  className="d-flex adminTextBig align-items-center justify-content-start BasePriceWithQuantity">
                                  <span className="" style={{color: "rgba(0, 0, 0, 0.6)"}}>{thing.amount}<span
                                    className="BasePriceWithQuantitySmall "> шт</span></span>
                                  <span className=""
                                        style={{color: "rgba(0, 0, 0, 0.6)"}}>× {parseFloat(thing.priceForThis / thing.amount).toFixed(2)}<span
                                    className="BasePriceWithQuantitySmall"> грн</span></span>

                                  <span style={{color: "rgba(0, 0, 0, 0.6)"}}>=</span>
                                  <span className="booooold" style={{color: "red"}}>{thing.priceForThis}<span
                                    className="BasePriceWithQuantitySmall" style={{color: "red"}}> грн</span></span>

                                </div>
                                {/* Знижка, якщо є */}
                                {parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2) && (
                                  <div
                                    className="d-flex flex-row"
                                  >


                                    <div
                                      className="d-flex align-items-center justify-content-start BasePriceWithQuantity ">


                                      <span>{thing.amount}<span className="BasePriceWithQuantitySmall"> шт</span></span>

                                      <span
                                        className="">  × {parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(2)}<span
                                        className="BasePriceWithQuantitySmall"> грн</span></span>
                                      {/*{parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(3)}*/}
                                      {/*<span style={{ fontSize: "1rem", opacity: 0.5 }}><div className="BasePriceWithQuantitySmall ">грн</div></span>*/}
                                      =
                                      <span className="booooold " style={{color: "#008249"}}>
          {thing.priceForThisDiscount}<span className="BasePriceWithQuantitySmall"
                                            style={{color: "#008249"}}> грн</span>
        </span>
                                    </div>

                                    <div className="BasePriceWithQuantityDiscountword">
                                      Знижка {thisOrder.prepayment}
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
                                      <strong className="booooold" style={{color: "#3c60a6"}}>
                                        {thing.newField4}
                                      </strong> виробів
                                    </div>
                                    <div
                                      className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                      Використано на це замовлення
                                      <strong style={{color: "#3c60a6"}}>{thing.newField5}</strong> аркушів
                                    </div>
                                  </div>

                                  <div className="col ">
                                    <div className="adminFontTable BasePriceWithQuantityDetals pricesRow">
                                      <div>За 1 аркуш:</div>
                                      <span className="booooold money" style={{color: "#ee3c23"}}>
    {parseFloat(thing.priceForOneThis).toFixed(2)}
                                        <span className="BasePriceWithQuantitySmall">грн</span>
  </span>
                                      <span>/</span>
                                      <div>За 1 шт:</div>
                                      <span className="money booooold" style={{color: "#ee3c23"}}>
    {parseFloat(thing.priceForThis / thing.amount).toFixed(2)}
                                        <span className="BasePriceWithQuantitySmall">грн</span>
  </span>
                                    </div>

                                    {(+parseFloat(thing.priceForOneThis).toFixed(2)) !==
                                      (+parseFloat(thing.priceForOneThisDiscount || 0).toFixed(2)) && (
                                        <div className="adminFontTable BasePriceWithQuantityDetals pricesRow">
                                          <div>За 1 аркуш:</div>
                                          <span className="money booooold" style={{color: "#008249"}}>
      {thing.priceForOneThisDiscount}
                                            <span className="BasePriceWithQuantitySmall">грн</span>
    </span>
                                          <span>/</span>
                                          <div>За 1 шт:</div>
                                          <span className="money booooold" style={{color: "#008249"}}>
      {(thing.priceForThisDiscount / thing.amount).toFixed(2)}
                                            <span className="BasePriceWithQuantitySmall">грн</span>
    </span>
                                        </div>
                                      )}

                                  </div>
                                </div>
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


        {showNewSheetCutBw &&
          <NewSheetCutBw
            productName={productName}
            thisOrder={thisOrder} newThisOrder={newThisOrder}
            selectedThings2={selectedThings2}
            setNewThisOrder={setNewThisOrder}
            setShowNewSheetCutBw={setShowNewSheetCutBw}
            showNewSheetCutBw={showNewSheetCutBw}
            setThisOrder={setThisOrder}
            setSelectedThings2={setSelectedThings2}
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
          />
        }

        {thisOrder ? (

          <div className="ClientsMenuAll" style={{
            width: "36.5vw", position: "fixed", bottom: "0vh", height: "15vh", right: "0"
          }}>

            <ProgressBar thisOrder={thisOrder} setThisOrder={setThisOrder}
                         setNewThisOrder={setNewThisOrder}
                         handleThisOrderChange={handleThisOrderChange}
                         setSelectedThings2={setSelectedThings2}
                         selectedThings2={selectedThings2}/>
          </div>
        ) : (
          <div>
            <Loader/>
            <div>Як так сталося що у вас Order без User?!?</div>
          </div>
          // <ClientChangerUIArtem client={thisOrder.User} thisOrder={thisOrder}
          //                       setNewThisOrder={setNewThisOrder}
          //                       handleThisOrderChange={handleThisOrderChange}/>
          // <ClientChangerUIArtem client={{email: "null", id: 0, phone: "+00000000",}}/>
        )}
        <div className="d-flex flex-row" style={{position: "absolute", bottom: "0",}}>
          <div className="containerNewUI"
               style={{height: "15vh", width: "30vw", position: "relative", padding: '0.3rem'}}>
            <OrderFilesPanel thisOrder={thisOrder}/>
          </div>
          <div className="containerNewUI" style={{height: "15vh", width: "30vw", position: "relative",}}>
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
      <Loader/>
    </h1>
  )
};


export default NewUIArtem;
