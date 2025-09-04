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

            {/* Перша група */}
            <div className="card" >
              <p onClick={() => setShowNewSheetCutBw(true)}>
                <span ><img className="cardImg" src={imgg1} alt="Фото"/> BLACK</span>
              </p>
              <p onClick={() => setShowNewSheetCut(true)}>
                <span><img src={imgg2} className="cardImg" alt="Фото"/> COLOR PRODUCTS</span>
              </p>
              <p onClick={() => setShowNewWide(true)}>
                <span><img src={imgg3} className="cardImg" alt="Чашки"/> WIDE</span>
              </p>
              <p onClick={() => setShowNewPhoto(true)}>
                <span><img src={p800} className="cardImg" alt="Фото"/> PHOTO</span>
              </p>
              <p onClick={() => setShowBigOvshik(true)}>
                <span><img src={imgg10} className="cardImg" alt="Овшик"/> POSTPRESS</span>
              </p>
              <p onClick={() => setShowPerepletMet(true)}>
                <span><img src={imgg6} className="cardImg" alt="Переплет"/> BINDING</span>
              </p>
              <p onClick={() => setShowVishichka(true)}>
                <span><img src={imgg9} className="cardImg" alt="Вишичка"/> CUTTING</span>
              </p>
            </div>

            {/* Друга група */}
            <div className="card" >
              <p onClick={() => setShowWideFactory(true)}>
                <span><img src={Widefactory} className="cardImg" alt="Wide Factory"/> WIDE FACTORY</span>
              </p>
              <p onClick={() => setShowLaminator(true)}>
                <span><img src={p8svg} className="cardImg" alt="Ламінатор"/> LAMINATION</span>
              </p>
            </div>

            {/* Третя група */}
            <div className="card d-flex" style={{marginBottom: "17vh", background: "transparent"}}>
              <p onClick={() => setShowNewNote(true)}>
                <span><img src={versantIcon} className="cardImg" alt="Note"/> NOTE</span>
              </p>
              <p onClick={() => setShowNewBooklet(true)}>
                <span><img src={scoba} className="cardImg"  alt="Booklet"/> BOOKLET</span>
              </p>
              <p onClick={() => setShowNewCup(true)}>
                <span><img src={MUG} className="cardImg" alt="Mug"/> MUG</span>
              </p>
              <p onClick={() => setShowNewMagnets(true)}>
                <span><img src={magnets} className="cardImg" alt="Magnets"/> MAGNETS</span>
              </p>
              <p onClick={() => setShowNewScans(true)}>
                <span><img src={Scans} className="cardImg" alt="Scans"/> SCANS</span>
              </p>
              <p onClick={() => setShowDelivery(true)}>
                <span><img src={Deliverypng}className="cardImg"  alt="Delivery"/> DELIVERY</span>
              </p>
              <p onClick={() => setShowDelivery(true)}>
                <span><img src={Deliverypng} className="cardImg" alt="Delivery"/> DELIVERY</span>
              </p>
            </div>

          </div>



          <div className="d-flex flex-column" style={{width: "37.5vw"}}>
            <div className="order-panel" style={{width: "37.5vw", marginTop: "0.5vh"}}>
              {selectedThings2 && selectedThings2.length !== 0 ? (
                <div className="order-list" style={{overflow: "auto", height: "60vh"}}>
                  {selectedThings2.map((thing, index) => (
                    <div
                      key={index}
                      className="order-item card3d"
                      onClick={() => toggleExpandedThing(index)}
                      style={{ width: "36vw", marginBottom: "1vh", cursor: "pointer", padding: "1rem", marginLeft:"3px" }}
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
                                className="adminFontTable BasePriceWithQuantityBase d-flex flex-column"

                              >
                                <div className={"d-flex flex-row align-items-center" } style={{maxWidth:"33vw", background:"transparent"}}>
                                  <div>
                                    <div>{thing.name}</div>
                                    <div
                                      style={{
                                        marginTop: '0.5rem',
                                        height: '1px',
                                        background: 'transparent',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
                                      }}
                                    />
                                  </div>

                                  {/*  <div style={{ fontSize: "2vh", opacity: 0.6 }}>*/}
                                {/*  ({thing.newField2} мм × {thing.newField3} мм)*/}
                                {/*</div>*/}
                                </div>
                                {/* Основна ціна з кількістю */}
                                <div className="d-flex align-items-center justify-content-start BasePriceWithQuantity">
                                  <span className="">{thing.amount}<span className="BasePriceWithQuantitySmall"> шт</span></span>
                                  <span className="">× {parseFloat(thing.priceForThis/thing.amount).toFixed(2)}<span className="BasePriceWithQuantitySmall"> грн</span></span>

                                  <span>=</span>
                                  <span className="booooold" style={{color:"red" }}>{thing.priceForThis}<span className="BasePriceWithQuantitySmall" style={{ color:"red" }}> грн</span></span>

                                </div>
                                {/* Знижка, якщо є */}
                                {parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2) && (
                                  <div
                                    className="d-flex flex-row"
                                  >


                                      <div className="d-flex align-items-center justify-content-start BasePriceWithQuantity " >


                                        <span >{thing.amount}<span className="BasePriceWithQuantitySmall" > шт</span></span>

                                        <span className="">  ×   {parseFloat(thing.priceForThisDiscount/thing.amount).toFixed(2)}<span className="BasePriceWithQuantitySmall"> грн</span></span>
                                        {/*{parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(3)}*/}
                                        {/*<span style={{ fontSize: "1rem", opacity: 0.5 }}><div className="BasePriceWithQuantitySmall ">грн</div></span>*/}
                                        =
                                      <span className="booooold " style={{ color: "#008249" }}>
          {thing.priceForThisDiscount}<span className="BasePriceWithQuantitySmall" style={{color: "#008249"}}> грн</span>
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
                                    <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                      На аркуші можна розмістити
                                      <strong className="booooold" style={{color:"#3c60a6"}}>
                                        {thing.newField4}
                                      </strong> виробів
                                    </div>
                                    <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center">
                                      Використано на це замовлення
                                      <strong style={{color:"#3c60a6"}}>{thing.newField5}</strong> аркушів
                                    </div>
                                  </div>

                                  <div className="col ">
                                    <div className="adminFontTable BasePriceWithQuantityDetals pricesRow">
                                      <div>За 1 аркуш:</div>
                                      <span className="booooold money" style={{color:"#ee3c23"}}>
    {parseFloat(thing.priceForOneThis).toFixed(2)}
                                        <span className="BasePriceWithQuantitySmall">грн</span>
  </span>
                                      <span>/</span>
                                      <div>За 1 шт:</div>
                                      <span className="money booooold" style={{color:"#ee3c23"}}>
    {parseFloat(thing.priceForThis / thing.amount).toFixed(2)}
                                        <span className="BasePriceWithQuantitySmall">грн</span>
  </span>
                                    </div>

                                    {(+parseFloat(thing.priceForOneThis).toFixed(2)) !==
                                      (+parseFloat(thing.priceForOneThisDiscount||0).toFixed(2)) && (
                                        <div className="adminFontTable BasePriceWithQuantityDetals pricesRow">
                                          <div>За 1 аркуш:</div>
                                          <span className="money booooold" style={{color:"#008249"}}>
      {thing.priceForOneThisDiscount}
                                            <span className="BasePriceWithQuantitySmall">грн</span>
    </span>
                                          <span>/</span>
                                          <div>За 1 шт:</div>
                                          <span className="money booooold" style={{color:"#008249"}}>
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
