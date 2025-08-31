import React, {useEffect, useState} from "react";
import './userInNewUiArtem/StyleArtem.css';
import './CPM.css';
import './global.css';
import './adminStylesCrm.css';
import './Wide.css';
import './MainWindow.css';
import {useNavigate, useParams} from "react-router-dom";
import axios from '../api/axiosInstance';
import {Modal} from "react-bootstrap";
import p8svg from "../components/newUIArtem/printers/p8.png";
import p800 from "../components/newUIArtem/printers/p800.png";
import creo from "../components/newUIArtem/printers/creo.png";
import MUG from "../components/newUIArtem/printers/mug.png";
import magnets from "./magnetsIcon.png";
import Scans from "./scan.png";
import Deliverypng from "../components/newUIArtem/printers/delivery.png";
import ClientChangerUIArtem from "../PrintPeaksFAinal/userInNewUiArtem/ClientChangerUIArtem";
// Usage of ClientsMenu
import img1 from '../components/newUIArtem/printers/46.png';
import img2 from '../components/newUIArtem/printers/ComponentTMP_0-image2.png';
import img3 from '../components/newUIArtem/printers/ComponentTMP_0-image3.png';
import img4 from '../components/newUIArtem/printers/ComponentTMP_0-image4.png';
import img5 from '../components/newUIArtem/printers/ComponentTMP_0-image5.png';
import img6 from '../components/newUIArtem/printers/ComponentTMP_0-image6.png';
import img7 from '../components/newUIArtem/printers/ComponentTMP_0-image7.png';
import img8 from "../components/newUIArtem/printers/Без назви-1.png";
import img9 from "../components/newUIArtem/printers/1996 (1).png";
import imgg10 from '../components/newUIArtem/printers/binder.svg';

import imgg1 from "../components/newUIArtem/printers/p1.svg";
import imgg2 from "../components/newUIArtem/printers/p2.svg";
import imgg3 from "../components/newUIArtem/printers/p3.svg";
import imgg4 from "../components/newUIArtem/printers/p4.svg";
import imgg5 from "../components/newUIArtem/printers/p5.svg";
import imgg6 from "../components/newUIArtem/printers/p6.svg";
import imgg7 from "../components/newUIArtem/printers/p7.svg";
import imgg8 from "../components/newUIArtem/printers/p8.svg";
import imgg9 from "../components/newUIArtem/printers/p9.svg";
import imgg101 from "./evroscoba.png";
import scoba from "./poslugi/newnomodals/skoba.svg";
import Widefactory from "../components/newUIArtem/printers/Widefactory.png";
import Widefactoryw from "../components/newUIArtem/printers/Widefactoryw.png";

import versantIcon from "../components/newUIArtem/printers/group-1468.svg";
import PaidButtomProgressBar from "../PrintPeaksFAinal/tools/PaidButtomProgressBar";
import OneProductInOrders from "../components/newcalc/Orders/OneProductInOrders";
import Plotter from "../components/newcalc/products/Plotter";
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
import NovaPoshtaButton from "./userInNewUiArtem/novaPoshta/NovaPoshtaButton";
import FilesInOrder from "./filesInOrder/FilesInOrder";
import CommentsInOrder from "./commentsInOrders/OrderFilesPanel";
import NewBooklet from "./poslugi/NewBooklet";
import NewMagnets from "./poslugi/NewMagnets";
import NewScans from "./poslugi/NewScans";
import WideFactory from "./poslugi/WideFactory";
import NewSheetSheet from "./poslugi/NewSheetSheet";
import Delivery from "./poslugi/DeliveryPage";
import OrderFilesPanel from "./commentsInOrders/OrderFilesPanel";
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


  const [showNewSheetCutBw, setShowNewSheetCutBw] = useState(false);
  const [showNewSheetCut, setShowNewSheetCut] = useState(false);
  const [showNewSheetSheet, setShowNewSheetSheet] = useState(false);
  const [showNewWide, setShowNewWide] = useState(false);
  const [showWideFactory, setShowWideFactory] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewBooklet, setShowNewBooklet] = useState(false);
  const [showNewPhoto, setShowNewPhoto] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
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
            <div className="buttonsRow" style={{width: "62vw"}}>
              {/* 1 */}
              <div
                onClick={() => setShowNewSheetCutBw(true)}
                className="colorButton bg-pink cursorPointer "
              >
                <img src={imgg1} className="card-img-top noanim" alt="Фото"/>
                <img src={img5} className="card-img-top anim" alt="Фото"/>
                <div className="buttonLabel">BLACK</div>

              </div>

              {/* 2 */}
              <div
                onClick={() => setShowNewSheetCut(true)}
                className="colorButton bg-yellow  cursorPointer "
              >
                <img src={imgg2} className="noanimcgcolor noanim"></img>
                <img src={img1} className="anim noanimcgcolor"></img>
                <div className="buttonLabel">COLOR PRODUCTS</div>
              </div>
              {/*<div*/}
              {/*  onClick={() => setShowNewSheetSheet(true)}*/}
              {/*  className="colorButton bg-lavender cursorPointer "*/}
              {/*>*/}
              {/*  <img src={imgg2} className="noanimcgcolor noanim"></img>*/}
              {/*  <img src={img1} className="anim noanimcgcolor"></img>*/}
              {/*  <div className="buttonLabel">COLOR SHEETS</div>*/}
              {/*</div>*/}
              {/* 3 */}
              <div
                onClick={() => setShowNewWide(true)}
                className="colorButton bg-green skewed cursorPointer "
              >
                <img src={imgg3} className="card-img-top noanim" alt="Чашки"/>
                <img src={img2} className="card-img-top anim" alt="Чашки"/>
                <div className="buttonLabel">WIDE</div>
              </div>

              {/* 4 */}
              <div
                onClick={() => setShowNewPhoto(true)}
                className="colorButton bg-light-cyan skewed cursorPointer "
              >
                <img src={p800} className="card-img-top noanim" alt="Фото"/>
                <img src={img3} className="card-img-top anim" alt="Фото"/>
                <div className="buttonLabel">PHOTO</div>
              </div>

              {/* 5 */}
              <div
                onClick={() => setShowBigOvshik(true)}
                className="colorButton bg-blue skewed cursorPointer "
              >
                <img src={imgg10} className="card-img-top noanim" alt="Овшик"/>
                <img src={creo} className="card-img-top anim" alt="Овшик"/>
                <div className="buttonLabel">POSTPRESS</div>
              </div>

              {/* 6 */}
              <div
                onClick={() => setShowPerepletMet(true)}
                className="colorButton bg-lavender skewed cursorPointer"
              >
                <img src={imgg6} className="card-img-top noanim" alt="Переплет"/>
                <img src={img9} className="card-img-top anim" alt="Переплет"/>
                <div className="buttonLabel">BINDING</div>
              </div>

              {/* 7 */}


              {/* 8 */}
              <div
                onClick={() => setShowVishichka(true)}
                className="colorButton bg-green skewed cursorPointer "
              >
                <img src={imgg9} className="card-img-top noanim" alt="Вишичка"/>
                <img src={img4} className="card-img-top anim" alt="Вишичка"/>
                <div className="buttonLabel">CUTTING</div>
              </div>

              {/* 9 */}

            </div>

            <div className="buttonsRow" style={{width: "62vw", marginTop: "1vh"}}>
              <div
                onClick={() => setShowWideFactory(true)}
                className="colorButton bg-factory cursorPointer "
              >
                <img src={Widefactory} className="card-img-top noanim" alt="Вишичка"/>
                <img src={Widefactoryw} className="card-img-top anim" alt="Вишичка"/>
                <div className="buttonLabel">WIDE FACTORY</div>
              </div>
              <div
                onClick={() => setShowLaminator(true)}
                className="colorButton bg-peach skewed cursorPointer "
              >
                <img src={p8svg} className="card-img-top noanim"/>
                <img src={img8} className="card-img-top anim" alt="Ламінатор"/>
                <div className="buttonLabel">LAMINATION</div>
              </div>
            </div>

            <div className="containerNewUI d-flex "
                 style={{marginBottom: "17vh", background: "transparent"}}>
              <div
                onClick={() => setShowNewNote(true)}
                className="colorButtonNote colorButton bg-brown  cursorPointer">
                <img src={versantIcon} className="card-img-top noanim" alt="Продукти"/>
                <img src={versantIcon} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">NOTE</div>
              </div>
              <div
                onClick={() => setShowNewBooklet(true)}
                className="colorButtonNote colorButton bg-peach  cursorPointer">
                <img src={scoba} className="card-img-top noanim" alt="Продукти"/>
                <img src={imgg101} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">BOOKLET</div>
              </div>
              <div
                onClick={() => setShowNewCup(true)}
                className="colorButtonNote colorButton bg-green  cursorPointer">
                <img src={MUG} className="card-img-top noanim" alt="Продукти"/>
                <img src={MUG} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">MUG</div>
              </div>
              <div
                onClick={() => setShowNewMagnets(true)}
                className="colorButtonNote colorButton bg-pink  cursorPointer">
                <img src={magnets} className="card-img-top noanim" alt="Продукти"/>
                <img src={magnets} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">MAGNETS</div>
              </div>
              <div
                onClick={() => setShowNewScans(true)}
                className="colorButtonNote colorButton bg-light-cyan  cursorPointer">
                <img src={Scans} className="card-img-top noanim" alt="Продукти"/>
                <img src={Scans} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">SCANS</div>
              </div>
              <div
                onClick={() => setShowDelivery(true)}
                className="colorButtonNote colorButton bg-yellow  cursorPointer">
                <img src={Deliverypng} className="card-img-top noanim" alt="Продукти"/>
                <img src={Deliverypng} className="card-img-top anim" alt="Продукти"/>
                <div className="buttonLabel">DELIVERY</div>
              </div>
            </div>

          </div>


          <div className="d-flex flex-column" style={{width: "37.5vw"}}>
            <div className="order-panel" style={{width: "37.5vw", marginTop: "0.5vh"}}>
              {selectedThings2 && selectedThings2.length !== 0 ? (
                <div className="order-list" style={{overflow: "auto", height: "60vh"}}>
                  {selectedThings2.map((thing, index) => (
                    <div
                      key={index}
                      className="order-item"
                      onClick={() => toggleExpandedThing(index)}
                      style={{
                        position: "relative",
                        border: "0.1vw solid #ffffff",
                        padding: "0.5vw",
                        marginLeft: "0vw",
                        marginBottom: "1vh",
                        borderRadius: "0.5vw",
                        width: "36vw",
                        overflow: "hidden",
                        cursor: "pointer"
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
                                borderRadius: "1vh",
                                border: "0",
                                width: "100%",
                                flexWrap: "wrap"
                              }}
                            >
                              {/* Ціна за штуку без знижки */}


                              {/* Назва + розміри */}
                              <div
                                className="adminFontTable d-flex flex-column"
                                style={{
                                  fontSize: "1.7vh",
                                  // textTransform: "uppercase",
                                  maxWidth: "33vw",
                                  textAlign: "justify",
                                  textJustify: "inter-word",
                                  lineHeight: "1.4",
                                  wordBreak: "break-word"
                                }}
                              >
                                <div className={"d-flex flex-row align-items-center"}>
                                  <div>
                                {thing.name}
                                  </div>
                                {/*  <div style={{ fontSize: "2vh", opacity: 0.6 }}>*/}
                                {/*  ({thing.newField2} мм × {thing.newField3} мм)*/}
                                {/*</div>*/}
                                </div>
                                {/* Основна ціна з кількістю */}
                                <div
                                  className="d-flex align-items-center justify-content-start"
                                  style={{ fontSize: "2vh", color: "#EE3C23", gap: "0.5vw", minWidth: "12vw", letterSpacing: "0.0vw" }}
                                >
                                  <span className="">{thing.amount}<span style={{ fontSize: "1.4vh", opacity: 0.7 }}> шт</span></span>
                                  <span className=""> &nbsp; × &nbsp;  {parseFloat(thing.priceForThis/thing.amount).toFixed(2)}<span style={{ fontSize: "1.4vh", opacity: 0.7 }}> грн</span></span>

                                  <span>=</span>
                                  <span className="booooold">{thing.priceForThis}<span style={{ fontSize: "1.4vh", opacity: 0.7 }}> грн</span></span>

                                </div>
                                {/* Знижка, якщо є */}
                                {parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2) && (
                                  <div
                                    className="d-flex"
                                    style={{ width: "100%", gap: "0.5vw", fontSize: "2vh", textAlign: "justify" }}
                                  >

                                    <div style={{ fontSize: "2vh", color:"#008249" }}>
                                      <span className="adminFontTable " style={{ fontSize: "2vh"}} >
                                      {thing.amount}
                                        <span style={{ fontSize: "1.4vh", opacity: 0.7 , color:"#008249"}}> шт</span>
                                        &nbsp; × &nbsp;
                                        {thing.priceForThisDiscount / thing.amount}
                                        <span style={{ fontSize: "1.4vh", opacity: 0.7 }}> грн</span>
                                        &nbsp;=
                                      </span>{" "}
                                      <span className="booooold " style={{ color: "#008249" }}>
          {thing.priceForThisDiscount}<span style={{ fontSize: "1.4vh", opacity: 0.7 }}> грн</span>
        </span>
                                    </div>
                                    <div
                                      className="label "
                                      style={{ color: "#008249", fontSize: "1.7vh", alignSelf: "center" }}
                                    >
                                     (Зі знижкою {thisOrder.prepayment})
                                    </div>
                                  </div>
                                )}
                              </div>




                            </div>

                            {expandedThingIndex === index && (
                              <><OneProductInOrders
                                item={thing}
                                cash={true}
                                handleAmountChange={handleAmountChange}
                                index={index}
                                thisOrder={thisOrder}
                              />

                                <div
                                  className="d-flex flex-wrap align-items-center justify-content-center align-items-center"
                                  style={{
                                    gap: "1vw",
                                    paddingTop: "0.5vh",
                                    paddingLeft: "0.5vw",
                                    fontSize: "1.55vmin",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  <div className="adminFontTable d-flex align-items-center">
                                    На аркуші:&nbsp;
                                    <strong style={{ fontSize: "1.55vmin" }}>{thing.newField4}</strong>&nbsp;шт
                                  </div>

                                  <div className="adminFontTable d-flex align-items-center">
                                    Задіяно:&nbsp;
                                    <strong style={{ fontSize: "1.55vmin" }}>{thing.newField5}</strong>&nbsp;аркушів
                                  </div>

                                  <div className="adminFontTable d-flex align-items-center">
                                    За 1 аркуш:&nbsp;
                                    <strong style={{ fontSize: "1.55vmin", color: "#ee3c23" }}>
                                      {parseFloat(thing.priceForOneThis).toFixed(2)}
                                    </strong>&nbsp;грн
                                  </div>

                                  <div className="adminFontTable d-flex align-items-center justify-content-center" >
                                    За 1 шт:&nbsp;
                                    <strong style={{ fontSize: "1.55vmin", color: "#ee3c23" }}>
                                      ~{parseFloat(thing.priceForThis / thing.amount).toFixed(2)}
                                    </strong>&nbsp;грн
                                  </div>

                                  {parseFloat(thing.priceForOneThis).toFixed(2) !== thing.priceForOneThisDiscount && (
                                    <div className="adminFontTable d-flex align-items-center">
                                      За 1 аркуш зі знижкою:&nbsp;
                                      <strong style={{ fontSize: "1.55vmin", color: "#008249" }}>
                                        {thing.priceForOneThisDiscount}
                                      </strong>&nbsp;грн
                                    </div>
                                  )}
                                  {parseFloat(thing.priceForOneThis).toFixed(2) !== thing.priceForOneThisDiscount && (
                                    <div className="adminFontTable d-flex align-items-center">
                                      За 1 шт зі знижкою:&nbsp;
                                      <strong style={{ fontSize: "1.55vmin", color: "#008249" }}>
                                        {thing.priceForThisDiscount / thing.amount}
                                      </strong>&nbsp;грн
                                    </div>
                                  )}
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
                <div className="empty">Немає елементів</div>
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
            width: "36.5vw",position: "fixed", bottom: "0vh", height: "15vh",
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
        <div className="d-flex flex-row" style={{position:"absolute", bottom:"0", }} >
          <div className="containerNewUI" style={{height: "15vh", width: "30vw", position: "relative",padding:'0.3rem'}}>
            <OrderFilesPanel thisOrder={thisOrder}/>
          </div>
          <div className="containerNewUI" style={{height: "15vh", width: "30vw", position: "relative", }}>
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
