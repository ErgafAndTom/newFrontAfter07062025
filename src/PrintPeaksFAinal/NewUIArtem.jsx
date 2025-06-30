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

import versantIcon from "../components/newUIArtem/printers/group-1468.svg";

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
import {ExampleLoaderComponent} from "../dev/palette";
import NewCup from "./poslugi/NewCup";
import NovaPoshtaButton from "./userInNewUiArtem/novaPoshta/NovaPoshtaButton";
import FilesInOrder from "./filesInOrder/FilesInOrder";
import CommentsInOrder from "./commentsInOrders/CommentsInOrder";
import NewBooklet from "./poslugi/NewBooklet";
import NewMagnets from "./poslugi/NewMagnets";
import NewScans from "./poslugi/NewScans";

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
    const [showNewWide, setShowNewWide] = useState(false);
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
            console.log(1);
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
                    console.log(response.data);
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
                                <div className="buttonLabel">COLOR</div>
                            </div>

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
                            <div
                                onClick={() => setShowLaminator(true)}
                                className="colorButton bg-peach skewed cursorPointer "
                            >
                                <img src={p8svg} className="card-img-top noanim"/>
                                <img src={img8} className="card-img-top anim" alt="Ламінатор"/>
                                <div className="buttonLabel">LAMINATION</div>
                            </div>

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
                        </div>
                        <div className="containerNewUI" style={{height: "15vh"}}>
                            <CommentsInOrder thisOrder={thisOrder}/>
                        </div>


                    </div>
                    {/*<div className="containerOrderUnits">*/}
                    {/*    {selectedThings2 && selectedThings2.length !== 0 ? (*/}
                    {/*        selectedThings2.map((thing, index) => (*/}
                    {/*            <div key={index} className="orderItem">*/}
                    {/*                <div className="orderHeader">*/}
                    {/*                    <span>{thing.name}</span>*/}
                    {/*                    <span className="deleteButton"*/}
                    {/*                          onClick={() => handleThingClickDelete2(thing)}>✕</span>*/}
                    {/*                </div>*/}

                    {/*                <div className="orderDetails">*/}
                    {/*                    <div className="detailBlock">*/}
                    {/*<span>*/}
                    {/*  {thing.newField2} <span className="unitLabel">мм</span> x {thing.newField3} <span*/}
                    {/*    className="unitLabel">мм</span>*/}
                    {/*</span>*/}
                    {/*                    </div>*/}
                    {/*                    <div className="detailBlock">*/}
                    {/*<span>*/}
                    {/*  {thing.amount} <span className="unitLabel">шт</span>*/}
                    {/*</span>*/}
                    {/*                    </div>*/}
                    {/*                    <div className="detailBlock price">*/}
                    {/*<span>*/}
                    {/*  = {thing.priceForThis} <span className="unitLabel">грн</span>*/}
                    {/*</span>*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}

                    {/*                {!['0', '0%', '', '%'].includes(thisOrder.prepayment) && (*/}
                    {/*                    <div className="orderDetails">*/}
                    {/*                        <div className="detailBlock">*/}
                    {/*                            <span>Зі знижкою ({thisOrder.prepayment}) = </span>*/}
                    {/*                        </div>*/}
                    {/*                        <div className="detailBlock">*/}
                    {/*  <span>*/}
                    {/*    {thing.amount} <span className="unitLabel">шт</span>*/}
                    {/*  </span>*/}
                    {/*                        </div>*/}
                    {/*                        <div className="detailBlock">*/}
                    {/*  <span>*/}
                    {/*    x {thing.priceForOneThisDiscount} <span className="unitLabel">грн</span>*/}
                    {/*  </span>*/}
                    {/*                        </div>*/}
                    {/*                        <div className="detailBlock discountPrice">*/}
                    {/*  <span>*/}
                    {/*    = {thing.priceForThisDiscount} <span className="unitLabel">грн</span>*/}
                    {/*  </span>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}
                    {/*                )}*/}

                    {/*                <div className="additionalInfo">*/}
                    {/*                    <div>*/}
                    {/*                        На аркуші: <strong>{thing.newField4} <span*/}
                    {/*                        className="unitLabel">шт</span></strong>*/}
                    {/*                    </div>*/}
                    {/*                    <div>*/}
                    {/*                        Використано: <strong>{thing.newField5} <span*/}
                    {/*                        className="unitLabel">аркушів</span></strong>*/}
                    {/*                    </div>*/}
                    {/*                    <div>*/}
                    {/*                        За 1 шт: <strong>{parseFloat(thing.priceForOneThis).toFixed(2)} <span*/}
                    {/*                        className="unitLabel">грн</span></strong>*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        ))*/}
                    {/*    ) : (*/}
                    {/*        <div className="text-center text-black-50">Замовлення порожнє</div>*/}
                    {/*    )}*/}
                    {/*</div>*/}


                    <div className="d-flex flex-column" style={{width: "37.5vw"}}>
                        <div className="order-panel" style={{width: "37.5vw", marginTop: "0.5vh"}}>
                            {selectedThings2 && selectedThings2.length !== 0 ? (
                                <div className="order-list" style={{overflow: "auto", height: "60vh"}}>
                                    {selectedThings2.map((thing, index) => (
                                        <div key={index} className="order-item"
                                             style={{
                                                 position: "relative",
                                                 // border: "0.2vw solid #0000001a",
                                                 border: "0.1vw solid #ffffff",
                                                 padding: "0.5vw",
                                                 marginLeft: "0vw",
                                                 marginBottom: "1vh",
                                                 borderRadius: "0.5vw",
                                                 width: "36vw",
                                                 overflow: "hidden",

                                                 // backgroundColor: "#ffffff"
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
                                                            className=""
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "right",
                                                                justifyContent: "flex-end",
                                                                marginRight: "1.3vw",
                                                                marginTop: "-1.5vh",
                                                                marginBottom: "-1vh",
                                                                padding: "0.3vw"
                                                            }}
                                                        >
                                                            <div className="adminFontTable booooold"
                                                                 style={{
                                                                     // marginLeft: "0.5vw",
                                                                     fontSize: "2vh",
                                                                 }}
                                                            >
                                                                {thing.amount}
                                                            </div>
                                                            <div
                                                                className="adminFontTable booooold">
                                                                шт
                                                            </div>
                                                            <div className="adminFontTable"
                                                                 style={{fontSize: "2vh"}}>
                                                                =
                                                            </div>
                                                            <div
                                                                className="adminFontTable booooold "
                                                                style={{
                                                                    color: "#EE3C23",
                                                                    fontSize: "2vh",
                                                                }}>
                                                                {thing.priceForThis}
                                                            </div>
                                                            <div className="adminFontTable booooold "
                                                                 style={{
                                                                     color: "#EE3C23",
                                                                     fontSize: "2vh",
                                                                 }}>грн
                                                            </div>
                                                        </div>
                                                        <div className="d-flex" style={{
                                                            // width: "27vw",
                                                            // overflow: "hidden"
                                                        }}>
                                                            <div
                                                                className="d-flex align-items-start priceord"
                                                            >
                                                                <div
                                                                    className="adminFontTable d-flex justify-content-center align-items-start"
                                                                    style={{
                                                                        fontSize: "1.8vh",
                                                                        width: "31vw",
                                                                        overflow: "hidden",
                                                                        wordBreak: "break-word", whiteSpace: "pre-line"
                                                                    }}
                                                                >
                                                                    {thing.name}
                                                                    <div
                                                                        className="d-flex justify-content-center align-items-start fontSize1VH"
                                                                        style={{
                                                                            wordBreak: "normal", whiteSpace: "balance"
                                                                        }}>
                                                                        <div className="adminFontTable"
                                                                             style={{
                                                                                 // fontSize: "1.5vh",
                                                                                 opacity: "0.6",
                                                                                 marginLeft: "0.5vw",
                                                                             }}>
                                                                            {thing.newField2}
                                                                        </div>
                                                                        <div
                                                                            className="adminFontTable"
                                                                            style={{opacity: "0.6",}}>
                                                                            мм
                                                                        </div>
                                                                    </div>

                                                                    <div className="adminFontTable"
                                                                         style={{opacity: "0.6",}}>x
                                                                    </div>
                                                                    <div
                                                                        className="d-flex align-items-start" style={{
                                                                        wordBreak: "normal",
                                                                        whiteSpace: "balance"
                                                                    }}>
                                                                        <div className="adminFontTable"
                                                                             style={{
                                                                                 // fontSize: "1.5vh",
                                                                                 opacity: "0.6",
                                                                             }}>
                                                                            {thing.newField3}
                                                                        </div>
                                                                        <div
                                                                            className="adminFontTable"
                                                                            style={{opacity: "0.6",}}>
                                                                            мм
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {parseFloat(thing.priceForOneThis) !== parseFloat(thing.priceForOneThisDiscount) && (
                                                            <div className="discount-container"
                                                                 style={{
                                                                     paddingLeft: "0.5vw",
                                                                     paddingBottom: "0.6vh"
                                                                 }}>

                                                                <div
                                                                    className="d-flex justify-content-flex-end align-items-end"
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "flex-end",
                                                                        position: "relative",
                                                                        right: "0.5vw"
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="label booooold"
                                                                        style={{
                                                                            color: "#008249",
                                                                            marginRight: "1vw",
                                                                            marginLeft: "0.2vw",
                                                                        }}>Зі знижкою {thisOrder.prepayment}
                                                                    </div>
                                                                    <div className="">
                                                                        <div className="value">
                                                                            {thing.amount}<small> шт</small> × {thing.priceForOneThisDiscount}<small> грн</small> =&nbsp;
                                                                        </div>
                                                                        <div
                                                                            className="price booooold"
                                                                            style={{color: "#008249"}}> {thing.priceForThisDiscount}<small> грн</small>
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                            </div>
                                                        )}
                                                        <OneProductInOrders item={thing} cash={true}
                                                                            handleAmountChange={handleAmountChange}
                                                                            index={index}
                                                                            thisOrder={thisOrder}/>
                                                        <div
                                                            className="d-flex" style={{gap: "0.5vw"}}>
                                                            <div className="d-flex adminFontTable"
                                                            >
                                                                На аркуші:&nbsp;
                                                                <strong
                                                                    style={{fontSize: "1.5vmin"}}> {thing.newField4} </strong>
                                                                &nbsp;шт
                                                            </div>
                                                            <div className="d-flex adminFontTable">
                                                                Використано:&nbsp;
                                                                <strong
                                                                    style={{fontSize: "1.5vmin"}}> {thing.newField5} </strong>
                                                                &nbsp;аркушів
                                                            </div>
                                                            <div className="d-flex adminFontTable">
                                                                За 1 шт:&nbsp;
                                                                <strong
                                                                    style={{
                                                                        fontSize: "1.5vmin",
                                                                        color: "#ee3c23"
                                                                    }}> {parseFloat(thing.priceForOneThis).toFixed(2)} </strong>
                                                                &nbsp;грн
                                                            </div>
                                                            {parseFloat(thing.priceForOneThis) !== parseFloat(thing.priceForOneThisDiscount) && (
                                                                <div className="d-flex adminFontTable">
                                                                    За 1 шт зі знижкою:&nbsp;
                                                                    <strong
                                                                        style={{
                                                                            fontSize: "1.5vmin",
                                                                            color: "#008249"
                                                                        }}>  {parseFloat(thing.priceForOneThisDiscount).toFixed(2)} </strong>
                                                                    &nbsp;грн
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Modal.Footer>

                                                            {/*<div*/}
                                                            {/*    className="d-flex adminFontTable"*/}
                                                            {/*    style={{marginLeft: "1.5vw"}}*/}
                                                            {/*> За 1 виріб (2 спосіб): {thing.priceForOneThis} грн*/}
                                                            {/*</div>*/}
                                                            {/*<div*/}
                                                            {/*    className="d-flex adminFontTable"*/}
                                                            {/*    style={{marginLeft: "1.5vw"}}*/}
                                                            {/*> За ВСЕ (2 спосіб*шт): {thing.priceForOneThis*thing.amount} грн*/}
                                                            {/*</div>*/}
                                                        </Modal.Footer>
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

                        <div className="d-flex flex-column"

                        >
                            {/*<ProgressBar/>*/}
                            {/*<div className="containerNewUI containerDetailsThisOrder " style={{border: "0vw"}}>*/}

                            {/*</div>*/}
                            {/*<NovaPoshtaButton/>*/}
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
                        width: "36.5vw",
                    }}>
                        <ProgressBar thisOrder={thisOrder} setThisOrder={setThisOrder}
                                     setNewThisOrder={setNewThisOrder}
                                     handleThisOrderChange={handleThisOrderChange}
                                     setSelectedThings2={setSelectedThings2}
                                     selectedThings2={selectedThings2}/>
                        {/*<ClientChangerUIArtem*/}
                        {/*    client={thisOrder.User}*/}
                        {/*    thisOrder={thisOrder}*/}
                        {/*    setThisOrder={setThisOrder}*/}
                        {/*    setNewThisOrder={setNewThisOrder}*/}
                        {/*    handleThisOrderChange={handleThisOrderChange}*/}
                        {/*/>*/}
                        {/*<ClientsMenu client={thisOrder.User} />*/}
                        {/*<ProgressBar thisOrder={thisOrder} setThisOrder={setThisOrder}/>*/}
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
