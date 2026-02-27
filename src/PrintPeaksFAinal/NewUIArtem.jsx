import React, { useEffect, useState } from "react";

import './userInNewUiArtem/StyleArtem.css';
import './CPM.css';
import './adminStylesCrm.css';
import './Wide.css';
import './MainWindow.css';
import './NewUIArtem.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from '../api/axiosInstance';


import blackWhitePrintIcon from "../components/newUIArtem/printers/ComponentTMP_0-image5.png";
import colorPrintIcon from "../components/newUIArtem/printers/46.png";
import plotterCutIcon from "../components/newUIArtem/printers/ComponentTMP_0-image4.png";
import photoIcon from "../components/newUIArtem/printers/ComponentTMP_0-image3.png";
import wideIcon from "../components/newUIArtem/printers/ComponentTMP_0-image2.png";
import wideFactoryIcon from "../components/newUIArtem/printers/Без назви-4.png";
import laminationIcon from "../components/newUIArtem/printers/üÑº ¡áºó¿-1.png";
import bindingIcon from "../components/newUIArtem/printers/1996 (1).png";
import noteIcon from "../components/newUIArtem/printers/group-1468.svg";
import bookletIcon from "./evroscoba.png";
import deliveryIcon from "../components/newUIArtem/printers/delivery.png";


import MUG from "../components/newUIArtem/printers/mug.png";
import magnets from "./magnetsIcon.png";
import ClientChangerUIArtem from "../PrintPeaksFAinal/userInNewUiArtem/ClientChangerUIArtem";


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
import NewSheetCutBW from "./poslugi/NewSheetCutBw";
import QuantumErrorBoundary from "../QuantumErrorBoundary";

const NewUIArtem = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [uiLockError, setUiLockError] = useState(null);
  const { id } = useParams();
  const [editingOrderUnit, setEditingOrderUnit] = useState(null);
  const editingOrderUnitSafe = editingOrderUnit;
  const setEditingOrderUnitSafe = setEditingOrderUnit;

  const [newThisOrder, setNewThisOrder] = useState({
    id: id
  })
  const [thisOrder, setThisOrder] = useState({
    id: id
  })
  const [selectedThings2, setSelectedThings2] = useState([]);
  const productName = '';
  const [showDeleteOrderUnitModal, setShowDeleteOrderUnitModal] = useState(false);
  const [thisOrderUnit, setThisOrderUnit] = useState(null);
  const [orderDeadlineCountdown, setOrderDeadlineCountdown] = useState('');


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

    setEditingOrderUnitSafe(thingOrNull || null);
    editor.open();
  };

  const getEditorByThing = (thing) => {
    const t = getOrderUnitType(thing);
    return EDITORS.find((e) => e.value === t) || null;
  };

  const getPluralForm = (value, one, few, many) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return many;
    const n = Math.abs(Math.trunc(numeric));
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
  };

  const getEditorAccentClass = (thing) => {
    const raw = getOrderUnitType(thing);
    const type = TYPE_ALIASES[raw] || raw;

    const primary = new Set(['SheetCutBW', 'SheetCut', 'Photo', 'Wide']);
    const middle = new Set(['Vishichka', 'Magnets', 'Laminator', 'PerepletMet', 'BigOvshik', 'Postpress', 'Binding', 'Lamination']);

    if (primary.has(type)) return 'nui-editor-accent-orange';
    if (middle.has(type)) return 'nui-editor-accent-green';
    return 'nui-editor-accent-blue';
  };

  const formatThingName = (value) => {
    const source = String(value || '').trim();
    if (!source) return '';

    let text = source.toLowerCase();

    text = text.replace(/з\s+ламінуванням\s+([^,]+)/i, (_, laminationPart) => {
      let material = String(laminationPart || '').trim();
      material = material.replace(/softtouch/gi, 'SoftTouch');
      if (material) material = material.charAt(0).toUpperCase() + material.slice(1);
      return `з ламінуванням "${material}"`;
    });

    text = text.replace(/"([^"]+)"/g, (_, inner) => {
      const chunk = String(inner || '').trim();
      if (!chunk) return '""';
      return `"${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}"`;
    });

    text = text.replace(/магнітах/gi, 'магніт');

    // Видалення дублікатів слів, що йдуть підряд
    text = text.split(/\s+/).filter((word, i, arr) =>
      i === 0 || word.toLowerCase() !== arr[i-1].toLowerCase()
    ).join(' ');

    let result = text.charAt(0).toUpperCase() + text.slice(1);

    // normalize latin/cyrillic A in paper sizes
    result = result
      .replace(/s\s*r\s*[aа]\s*3\+?/gi, 'SR A3')
      .replace(/s\s*r\s*[aа]\s*4\+?/gi, 'SR A4')
      .replace(/s\s*r\s*[aа]\s*5\+?/gi, 'SR A5')
      .replace(/s\s*r\s*[aа]\s*6\+?/gi, 'SR A6')
      .replace(/s\s*r\s*[aа]\s*7\+?/gi, 'SR A7')
      .replace(/sr[aа]\s*3\+?/gi, 'SRA3')
      .replace(/[aа]\s*7\+?/gi, 'A7')
      .replace(/[aа]\s*6\+?/gi, 'A6')
      .replace(/[aа]\s*5\+?/gi, 'A5')
      .replace(/[aа]\s*4\+?/gi, 'A4')
      .replace(/[aа]\s*3\+?/gi, 'A3');

    return result;
  };
  // ✅ ВАЖЛИВО: функція має бути в scope компонента, а не всередині іншої функції
  const openEditorForOrderUnit = (thingOrNull, eOrType) => openEditor(thingOrNull, eOrType);


  const toggleExpandedThing = (index) => {
    setExpandedThingIndex(prev => (prev === index ? null : index));
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

  useEffect(() => {
    if (id) {
      let data = {
        id: id
      }
      axios.post(`/Orders/OneOrder`, data)
        .then(response => {
          setThisOrder(response.data)
          setSelectedThings2(response.data.OrderUnits)
        })
        .catch((error) => {
          console.log(error.message);
          if (error?.response?.status === 403) {
            navigate('/login');
          }
          setError(error.message)
        })
    }
  }, [id]);

  useEffect(() => {
    const deadlineAt = thisOrder?.deadline || thisOrder?.finalManufacturingTime || null;
    if (!deadlineAt) {
      setOrderDeadlineCountdown('');
      return undefined;
    }

    const formatDuration = (ms) => {
      const totalSeconds = Math.floor(Math.abs(ms) / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (days > 0) return `${days}Д ${String(hours).padStart(2, '0')}Г`;
      return `${String(hours).padStart(2, '0')}Г ${String(minutes).padStart(2, '0')}ХВ`;
    };

    const tick = () => {
      const diff = new Date(deadlineAt).getTime() - Date.now();
      if (!Number.isFinite(diff)) {
        setOrderDeadlineCountdown('—');
        return;
      }
      setOrderDeadlineCountdown(diff >= 0 ? formatDuration(diff) : `ПРОСТРОЧЕНО: ${formatDuration(diff)}`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [thisOrder?.deadline, thisOrder?.finalManufacturingTime]);

  const statusValue = Number.parseInt(thisOrder?.status, 10);
  const isCancelledOrder = thisOrder?.status === 'Відміна' || statusValue === -1;

  const orderListStatusTitle = (() => {
    const orderId = thisOrder?.id ?? '—';
    if (isCancelledOrder) return `Скасоване замовлення №${orderId}`;
    if (!Number.isFinite(statusValue)) return `Обробка замовлення №${orderId}`;

    switch (statusValue) {
      case 0:
        return `Обробка замовлення №${orderId}`;
      case 1:
        return `Замовлення №${orderId} друкується`;
      case 2:
        return `Замовлення №${orderId} у постпресі`;
      case 3:
        return `Готове замовлення №${orderId}`;
      default:
        return `Замовлення №${orderId} віддали`;
    }
  })();

  const orderToneClass = (() => {
    if (isCancelledOrder) return 'nui-order-tone-red';
    switch (statusValue) {
      case 1:
        return 'nui-order-tone-orange';
      case 2:
        return 'nui-order-tone-blue';
      case 3:
        return 'nui-order-tone-rose';
      case 4:
      case 5:
        return 'nui-order-tone-green';
      default:
        return 'nui-order-tone-grey';
    }
  })();

  const serviceToneClass = Number.isFinite(statusValue) && statusValue >= 1
    ? `nui-service-tone-${orderToneClass.replace('nui-order-tone-', '')}`
    : '';

  const isOrderLockedForEdit = Number.isFinite(statusValue) && [2, 3, 4, 5].includes(statusValue);
  const hasOrders = Array.isArray(selectedThings2) && selectedThings2.length > 0;

  const lockStatusLabel = (() => {
    switch (statusValue) {
      case 2:
        return 'постпресі';
      case 3:
        return 'статусі "готово"';
      case 4:
        return 'статусі "отримано"';
      case 5:
        return 'статусі "оплата"';
      default:
        return 'поточному статусі';
    }
  })();

  const showLockedActionError = (mode = 'редагувати') => {
    setUiLockError(`Замовлення неможливо ${mode} так як воно у ${lockStatusLabel}`);
  };

  const handleLockedZoneClickCapture = (e, mode = 'редагувати') => {
    if (!isOrderLockedForEdit) return;

    if (mode === 'редагувати') return;

    const interactiveTarget = e.target?.closest?.('button, p, .order-item, .nui-order-item, .buttonSkewedOrderClient, .battonClosed, .tileContent');
    if (!interactiveTarget) return;
    e.preventDefault();
    e.stopPropagation();
    showLockedActionError(mode);
  };

  useEffect(() => {
    if (!isOrderLockedForEdit) setUiLockError(null);
  }, [isOrderLockedForEdit]);

  if (thisOrder) {
    return (
      <div className="nui-sheetcut-theme sc-wrap">
        <QuantumErrorBoundary/>

        <div className={`d-flex  ${serviceToneClass}${hasOrders ? "" : " no-orders"}`}>
          <div className="containerForContNewUI">

            {/* === GRID OF SERVICE TILES === */}
            <div
              className={`CardPrintersPoslugi nui-services-grid nui-services-grid-primary nui-services-position-primary nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
              onClickCapture={(e) => handleLockedZoneClickCapture(e, 'додавати')}

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
                  <div className="verticalColumns nui-vertical-columns-tight">
                    <span className="verticalText">DIGITAL PRINT CUTING</span>
                  </div>
                  <img className="icon64 CardPrintersPoslugiImg" src={colorPrintIcon} alt="" />
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

            </div>

            <div
              className={`CardPrintersPoslugi nui-services-grid nui-services-grid-middle nui-services-position-middle nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
              onClickCapture={(e) => handleLockedZoneClickCapture(e, 'додавати')}
            >
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


              <p onClick={() => setShowNewMagnets(true)}>
                <div className="tileContent">
                  <span className="verticalText">MAGNETS</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={magnets} alt="" />
                </div>
              </p>

              <p onClick={() => openEditorForOrderUnit(null, 'Lamination')}>
                <div className="tileContent">
                  <span className="verticalText">LAMINATION</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={laminationIcon} alt="" />
                </div>
              </p>

              <p onClick={() => openEditorForOrderUnit(null, 'Binding')}>
                <div className="tileContent">
                  <span className="verticalText">BINDING</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={bindingIcon} alt="" />
                </div>
              </p>
            </div>

            {/* Третя група */}
            <div className={`CardPrintersPoslugi nui-services-grid nui-services-grid-secondary nui-services-position-secondary nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
                 onClickCapture={(e) => handleLockedZoneClickCapture(e, 'додавати')}
            >
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


              <p className="nui-pos-r3c1" onClick={() => setShowNewScans(true)}>
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


              <p className="nui-pos-r3c2" onClick={() => setShowDelivery(true)}>
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

              <p className="nui-pos-r3c3" onClick={() => openEditorForOrderUnit(null, 'WideFactory')}>
                <div className="tileContent">
                  <span className="verticalText">WIDE FACTORY</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={wideFactoryIcon} alt="" />
                </div>
              </p>

            </div>
          </div>

          <div className={`d-flex flex-column nui-orders-column${hasOrders ? "" : " nui-orders-column-empty"}`} style={!hasOrders ? { display: "none" } : undefined}>
            <div className={`nui-order-header-shell ${orderToneClass}`}>
              {orderListStatusTitle && (
                <div className="nui-order-delivered-title">{orderListStatusTitle}</div>
              )}
            </div>

            {hasOrders ? (
              <div
                className={`nui-order-list nui-order-list-shell ${orderToneClass} nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
              >
                {selectedThings2.map((thing, index) => {
                  const editor = getEditorByThing(thing);
                  const editorLabel = String(editor?.label || thing.newField6 || 'редагувати').toUpperCase();
                  const editorAccentClass = getEditorAccentClass(thing);
                  const formattedName = formatThingName(thing.name);
                  const isNameParagraph = formattedName.length > 115;
                  const hasDiscount = parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2);
                  const unitPrice = hasDiscount
                    ? parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(2)
                    : parseFloat(thing.priceForOneThis).toFixed(2);
                  const totalPrice = hasDiscount ? thing.priceForThisDiscount : thing.priceForAllThis;

                  return (
                    <div
                      key={index}
                      className={`nui-order-item${expandedThingIndex === index ? " is-expanded" : ""}`}
                      onClick={() => toggleExpandedThing(index)}
                    >
                      <div className="nui-item-header">
                        <div className={`nui-item-name${isNameParagraph ? ' is-paragraph' : ''}`} style={!isCancelledOrder ? { color: 'var(--admingrey)' } : undefined}>{formattedName}</div>
                        <div className="nui-item-actions">
                          <div className="nui-item-btn nui-item-del" onClick={(e) => handleThingClickDelete2(thing, e)}>✕</div>
                        </div>
                      </div>

                      <div >
                        <div >
                          <span className="" style={!isCancelledOrder ? { color: 'var(--admingrey)' } : undefined}>{thing.amount}<span className="nui-unit-sub">шт</span>{" х "}{unitPrice}<span className="nui-unit-sub">грн</span>{" = "}</span>
                          <span className="nui-price-total">{parseFloat(totalPrice)}<span className="nui-unit-sub">грн</span></span>
                          <button
                            type="button"
                            className={`nui-item-type-btn ${editorAccentClass}`}
                            onClick={(e) => { e.stopPropagation(); openEditor(thing, e); }}
                            title={editorLabel}
                          >
                            <span className="nui-type-icon">✎</span>
                            <span className="nui-type-label">{editorLabel}</span>
                          </button>
                        </div>
                      </div>

                      {expandedThingIndex === index && (
                        <div className="nui-item-details">
                          <OneProductInOrders
                            item={thing}
                            cash={true}
                            handleAmountChange={handleAmountChange}
                            index={index}
                            thisOrder={thisOrder}
                          />
                          <div className="nui-details-footer-row">
                                                      <span>Розміщено на аркуші: <span
                                                        className="nui-bold-blue" style={{ color: 'var(--adminblue, #3c60a6)' }}>{thing.newField4} {getPluralForm(thing.newField4, "виріб", "вiroби", "виробів")}</span></span>
                            <span className="nui-sep">|</span>
                            <span>Загалом використано: <span
                              className="nui-bold-blue" style={{ color: 'var(--adminblue, #3c60a6)' }}>{thing.newField5} {getPluralForm(thing.newField5, "аркуш", "аркуші", "аркушів")}</span></span>
                            <span className="nui-sep">|</span>
                            <div className="nui-summary-line">
                              <span>За 1 аркуш:</span><span className="nui-price">{parseFloat(parseFloat(totalPrice / (thing.newField5 || 1)).toFixed(2))}<span className="nui-unit-sub">грн</span></span>
                            </div>
                            <span className="nui-sep">|</span>
                            <div className="nui-summary-line">
                              <span>За 1 шт:</span><span className="nui-price">{parseFloat(unitPrice)}<span className="nui-unit-sub">грн</span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="nui-order-status-inline">
              <ProgressBar
                thisOrder={thisOrder}
                setThisOrder={setThisOrder}
                setSelectedThings2={setSelectedThings2}
                selectedThings2={selectedThings2}
                externalError={uiLockError}
                showActionRail={true}
                showFinance={false}
                showActionButton={false}
                showTrack={true}
              />
            </div>

          </div>
          <div className="d-flex flex-row nui-bottom-shell">
            <div className="nui-bottom-pane nui-bottom-pane--progress">
              <div className="nui-bottom-main-row">
                <div className="nui-bottom-finance-inline">
                  <ProgressBar
                    thisOrder={thisOrder}
                    setThisOrder={setThisOrder}
                    setSelectedThings2={setSelectedThings2}
                    selectedThings2={selectedThings2}
                    externalError={uiLockError}
                    showActionRail={false}
                    showFinance={true}
                    showError={false}
                  />
                </div>
                <div className="nui-bottom-client-inline">
                  <ClientChangerUIArtem
                    thisOrder={thisOrder}
                    setThisOrder={setThisOrder}
                    setSelectedThings2={setSelectedThings2}
                    hidePaymentPanel={true}
                    actionButtonSlot={(
                      <ProgressBar
                        thisOrder={thisOrder}
                        setThisOrder={setThisOrder}
                        setSelectedThings2={setSelectedThings2}
                        selectedThings2={selectedThings2}
                        externalError={uiLockError}
                        showActionRail={true}
                        showFinance={false}
                        showActionButton={true}
                        showTrack={false}
                        compactActionButton={true}
                        showError={false}
                      />
                    )}
                  />
                </div>
              </div>
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
            editingOrderUnit={editingOrderUnitSafe}
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
          <div></div>
        ) : (
          <div>
            <Loader />
            <div>Як так сталося що у вас Order без User?!?</div>
          </div>
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
      <Loader />
    </h1>
  )
};


export default NewUIArtem;
