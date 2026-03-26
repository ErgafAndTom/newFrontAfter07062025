import React, { useEffect, useState, useRef } from "react";
// import './CPM.css';
import './adminStylesCrm.css';
import './NewUIArtem.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from '../api/axiosInstance';


import BarcodeLabel from './barcode/BarcodeLabel';
import NovaPoshtaThermalButton from './novaPoshta/NovaPoshtaThermalButton';
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
import MugMockupModal from "./mockup/MugMockupModal";

import NewBooklet from "./poslugi/NewBooklet";
import NewMagnets from "./poslugi/NewMagnets";
import NewScans from "./poslugi/NewScans";
import WideFactory from "./poslugi/WideFactory";
import Delivery from "./poslugi/DeliveryPage";
import UklonDelivery from "./userInNewUiArtem/UklonDelivery";
import UklonMap from "./userInNewUiArtem/UklonMap";
import NewSheetCutBW from "./poslugi/NewSheetCutBw";
import QuantumErrorBoundary from "../QuantumErrorBoundary";

const NewUIArtem = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [uiLockError, setUiLockError] = useState(null);
  const [showEnvelopeBarcode, setShowEnvelopeBarcode] = useState(false);
  const { id } = useParams();
  const [editingOrderUnit, setEditingOrderUnit] = useState(null);
  const editingOrderUnitSafe = editingOrderUnit;
  const setEditingOrderUnitSafe = setEditingOrderUnit;

  const [newThisOrder, setNewThisOrder] = useState({
    id: id
  })
  const [thisOrder, setThisOrder] = useState(null)
  const [selectedThings2, setSelectedThings2] = useState([]);
  const productName = '';
  const [showDeleteOrderUnitModal, setShowDeleteOrderUnitModal] = useState(false);
  const [thisOrderUnit, setThisOrderUnit] = useState(null);
  const [orderDeadlineCountdown, setOrderDeadlineCountdown] = useState('');
  const [isDeadlineOverdue, setIsDeadlineOverdue] = useState(false);



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
  const [showMugMockup, setShowMugMockup] = useState(false);
  const [showNewMagnets, setShowNewMagnets] = useState(false);
  const [showNewScans, setShowNewScans] = useState(false);
  const [showLaminator, setShowLaminator] = useState(false);
  const [showVishichka, setShowVishichka] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showUklon, setShowUklon] = useState(false);
  const [uklonMapData, setUklonMapData] = useState(null);
  const [uklonSimulating, setUklonSimulating] = useState(false);
  const uklonSimRef = useRef(false);
  useEffect(() => { uklonSimRef.current = uklonSimulating; }, [uklonSimulating]);

  // Слухаємо toggle-uklon від Nav кнопки
  useEffect(() => {
    const handler = () => setShowUklon(v => !v);
    window.addEventListener('toggle-uklon', handler);
    return () => window.removeEventListener('toggle-uklon', handler);
  }, []);

  // Відновлення карти Uklon з даних замовлення
  const uklonRestoreRef = useRef(false); // Блокує повторне відновлення після симуляції
  useEffect(() => {
    // Не перезаписувати під час симуляції
    if (uklonSimulating) {
      uklonRestoreRef.current = true; // Запам'ятати що була симуляція
      return;
    }
    // Після завершення симуляції — не скидати на стару uklonData з БД
    if (uklonRestoreRef.current) {
      uklonRestoreRef.current = false;
      return;
    }
    if (!thisOrder?.uklonData || thisOrder.uklonData === 'null' || thisOrder.uklonData === '{}' || thisOrder.uklonData === '') {
      console.log('[Uklon restore] No uklonData, setting null');
      setUklonMapData(null);
      return;
    }
    try {
      const data = typeof thisOrder.uklonData === 'string'
        ? JSON.parse(thisOrder.uklonData)
        : thisOrder.uklonData;
      if (data?.deliveryId && data?.pickup?.lat) {
        const cancelledStatuses = ['cancelled', 'canceled', 'failed'];
        const st = (data.status || '').toLowerCase();
        // Не показувати карту для скасованих доставок
        if (cancelledStatuses.includes(st)) {
          setUklonMapData(null);
          return;
        }
        const doneStatuses = ['delivered', 'completed'];
        setUklonMapData({
          pickup: data.pickup,
          dropoffs: data.dropoffs || [],
          tracking: {
            id: data.deliveryId,
            status: data.status || 'created',
            courier: data.courier || null,
          },
          result: { uid: data.deliveryId },
          estimate: data.estimate || null,
          createdAt: data.createdAt,
          isDone: doneStatuses.includes(st),
        });
      } else {
        setUklonMapData(null);
      }
    } catch {
      setUklonMapData(null);
    }
  }, [thisOrder?.id, thisOrder?.uklonData, uklonSimulating]);

  // Трекер — чи WebSocket (webhook) працює
  const uklonWsActiveRef = useRef(false);

  // WebSocket listener для Uklon webhook оновлень
  useEffect(() => {
    const handler = (e) => {
      if (uklonSimulating) return; // Ігноруємо WS під час симуляції
      uklonWsActiveRef.current = true; // Webhook працює!
      const { orderId, status, driver, deliveryId } = e.detail || {};
      if (!orderId || orderId !== thisOrder?.id) return;
      console.log('[Uklon WS] Status update:', status);

      const cancelStatuses = ['cancelled', 'canceled', 'failed'];
      const st = (status || '').toLowerCase();

      // Скасовані — прибрати карту
      if (cancelStatuses.includes(st)) {
        setUklonMapData(null);
        return;
      }

      setUklonMapData(prev => {
        if (!prev) return prev;
        const doneStatuses = ['delivered', 'completed'];
        return {
          ...prev,
          tracking: {
            ...prev.tracking,
            id: deliveryId || prev.tracking?.id,
            status: status || prev.tracking?.status,
            courier: driver || prev.tracking?.courier,
          },
          isDone: doneStatuses.includes(st),
        };
      });
    };
    window.addEventListener('uklonStatusUpdate', handler);
    return () => window.removeEventListener('uklonStatusUpdate', handler);
  }, [thisOrder?.id, uklonSimulating]);

  // Polling статусу замовлення Uklon кожні 10с (fallback коли webhook не працює)
  useEffect(() => {
    if (!uklonMapData?.tracking?.id) return;
    if (uklonSimulating) return; // Не polling під час симуляції
    const doneStatuses = ['delivered', 'cancelled', 'canceled', 'completed', 'failed'];
    if (doneStatuses.includes((uklonMapData.tracking?.status || '').toLowerCase())) return;

    const deliveryId = uklonMapData.tracking.id;
    let active = true;

    const poll = async () => {
      if (!active) return;
      // Якщо webhook працює — пропускаємо polling
      if (uklonWsActiveRef.current) return;
      try {
        const { data } = await axios.get(`/api/uklon/order/${deliveryId}`);
        if (!active || !data) return;

        const newStatus = (data.status || '').toLowerCase();
        const prevStatus = (uklonMapData.tracking?.status || '').toLowerCase();
        if (newStatus === prevStatus) return;

        const cancellationReason = data.cancellation?.reason;
        const cancelReasonMap = {
          driver_search_timeout: 'Водія не знайдено (таймаут)',
          client_cancel: 'Скасовано клієнтом',
          driver_cancel: 'Водій скасував',
          package_not_fit: 'Посилка не підходить',
        };

        setUklonMapData(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            tracking: {
              ...prev.tracking,
              status: newStatus,
              cancellationReason: cancelReasonMap[cancellationReason] || cancellationReason || null,
              // Оновити дані водія якщо є
              courier: data.driver ? {
                name: data.driver.name || data.driver.first_name,
                phone: data.driver.phone,
                photo: data.driver.photo,
                car: data.driver.car || data.driver.vehicle,
                ...prev.tracking?.courier,
              } : prev.tracking?.courier,
              // Оновити часи
              statusTimes: {
                ...prev.tracking?.statusTimes,
                [newStatus]: new Date().toISOString(),
              },
            },
            isDone: doneStatuses.includes(newStatus),
          };

          // Зберігаємо в БД
          if (thisOrder?.id) {
            const uklonDb = {
              deliveryId: prev.tracking?.id || prev.result?.uid,
              status: newStatus,
              pickup: prev.pickup,
              dropoffs: prev.dropoffs,
              estimate: prev.estimate,
              courier: updated.tracking.courier,
              statusTimes: updated.tracking.statusTimes,
              cancellationReason: updated.tracking.cancellationReason,
              createdAt: prev.createdAt,
            };
            axios.put(`/orders/one/${thisOrder.id}`, { uklonData: JSON.stringify(uklonDb) }).catch(() => {});
          }

          return updated;
        });
      } catch {
        // 404 — замовлення не знайдено в Uklon, ігноруємо
      }
    };

    poll(); // Одразу перевірити
    const interval = setInterval(poll, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [uklonMapData?.tracking?.id, uklonMapData?.tracking?.status, thisOrder?.id, uklonSimulating]);

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

    const orange = new Set(['SheetCutBW', 'SheetCut', 'Photo', 'Wide']);
    const blue   = new Set(['Vishichka', 'Magnets', 'Laminator', 'PerepletMet', 'BigOvshik', 'Postpress', 'Binding', 'Lamination']);
    const coral  = new Set(['Note', 'BOOKLET', 'Cup']);
    const purple = new Set(['Scans', 'Delivery', 'WideFactory']);

    if (orange.has(type)) return 'nui-editor-accent-orange';
    if (blue.has(type))   return 'nui-editor-accent-blue';
    if (coral.has(type))  return 'nui-editor-accent-coral';
    if (purple.has(type)) return 'nui-editor-accent-purple';
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

    // прибрати "на матеріалі" і лапки навколо назви матеріалу
    result = result.replace(/,?\s*на матеріалі\s+["«"„""'']?([^"»""'']+)["»""'']?/gi, ', $1');

    // замінити gsm на г/м²
    result = result.replace(/\bgsm\b/gi, 'г/м²');

    // прибрати кому в кінці
    result = result.replace(/,\s*$/, '');

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

  // Слухаємо подію прив'язки клієнта з Telegram-панелі (без перезавантаження)
  useEffect(() => {
    const handleUserAssigned = (e) => {
      // Перевіряємо що це саме наше замовлення
      if (e.detail && String(e.detail.id) === String(id)) {
        setThisOrder(e.detail);
        if (e.detail.OrderUnits) {
          setSelectedThings2(e.detail.OrderUnits);
        }
      }
    };
    window.addEventListener('orderUserAssigned', handleUserAssigned);
    return () => window.removeEventListener('orderUserAssigned', handleUserAssigned);
  }, [id]);

  useEffect(() => {
    const deadlineAt = thisOrder?.deadline || (typeof thisOrder?.finalManufacturingTime === 'string' ? thisOrder.finalManufacturingTime : null);
    if (!deadlineAt) {
      setOrderDeadlineCountdown('');
      return undefined;
    }

    const formatDuration = (ms) => {
      const totalSeconds = Math.floor(Math.abs(ms) / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (days > 0) return `${days}Д ${String(hours).padStart(2, '0')}Г ${String(minutes).padStart(2, '0')}ХВ`;
      return `${String(hours).padStart(2, '0')}Г ${String(minutes).padStart(2, '0')}ХВ`;
    };

    const tick = () => {
      const diff = new Date(deadlineAt).getTime() - Date.now();
      if (!Number.isFinite(diff)) {
        setOrderDeadlineCountdown('—');
        return;
      }
      setIsDeadlineOverdue(diff < 0);
      setOrderDeadlineCountdown(formatDuration(diff));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [thisOrder?.id, thisOrder?.deadline, thisOrder?.finalManufacturingTime]);

  const statusValue = Number.parseInt(thisOrder?.status, 10);
  const isCancelledOrder = statusValue === -1;

  const orderListStatusTitle = (() => {
    const orderId = thisOrder?.id ?? '—';
    if (isCancelledOrder) return { text: 'Скасоване замовлення ', id: orderId };
    if (!Number.isFinite(statusValue)) return { text: 'Обробка замовлення ', id: orderId };
    switch (statusValue) {
      case 0:  return { text: 'Обробка замовлення ', id: orderId };
      case 1:  return { text: 'Замовлення ', id: orderId, suffix: ' друкується' };
      case 2:  return { text: 'Замовлення ', id: orderId, suffix: ' у постпресі' };
      case 3:  return { text: 'Готове замовлення ', id: orderId };
      case 4:  return { text: 'Замовлення ', id: orderId, suffix: ' отримано' };
      case 5:  return { text: 'Видалене замовлення ', id: orderId };
      default: return { text: 'Замовлення ', id: orderId };
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
        return 'nui-order-tone-green';
      case 5:
        return 'nui-order-tone-red';
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
        return 'статусі "видалено"';
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
      <div className="nui-sheetcut-theme">
        <QuantumErrorBoundary>

        <div className={`d-flex  ${serviceToneClass}${hasOrders ? "" : " no-orders"}`} style={{ background: 'transparent' }}>
          <div className="nui-services-column">

            {/* === GRID OF SERVICE TILES === */}
            <div
              className={`CardPrintersPoslugi nui-services-grid nui-services-grid-primary`}
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
                  <span className="verticalText">DIGITAL PRINT CUTING</span>
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

              <p onClick={() => { setEditingOrderUnitSafe(null); setShowBigOvshik(true); }}>
                <div className="tileContent">
                  <span className="verticalText">POSTPRESS</span>
                  <svg className="icon64 CardPrintersPoslugiImg" viewBox="0 0 64 64" fill="none"
                       stroke="#2f2f2f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="10" y="14" width="44" height="8" rx="2" />
                    <rect x="10" y="26" width="44" height="8" rx="2" />
                    <rect x="10" y="38" width="44" height="8" rx="2" />
                    <line x1="18" y1="46" x2="18" y2="54" />
                    <line x1="46" y1="46" x2="46" y2="54" />
                    <line x1="14" y1="54" x2="50" y2="54" />
                  </svg>
                </div>
              </p>
            </div>

            {/* Третя група — NOTE, BOOKLET, MUG (purple) */}
            <div className={`CardPrintersPoslugi nui-services-grid nui-services-grid-tertiary nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
                 onClickCapture={(e) => handleLockedZoneClickCapture(e, 'додавати')}
            >
              <p onClick={() => setShowNewNote(true)}>
                <div className="tileContent">
                  <span className="verticalText">NOTE</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={noteIcon} alt="" />
                </div>
              </p>

              <p onClick={() => setShowNewBooklet(true)}>
                <div className="tileContent">
                  <span className="verticalText">BOOKLET</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={bookletIcon} alt="" />
                </div>
              </p>

              <p onClick={() => setShowNewCup(true)}>
                <div className="tileContent">
                  <span className="verticalText">MUG</span>
                  <img className="icon64 CardPrintersPoslugiImg" src={MUG} alt="" />
                </div>
              </p>

            </div>

            {/* Четверта група — SCANS, DELIVERY, WIDE FACTORY (rose) */}
            <div className={`CardPrintersPoslugi nui-services-grid nui-services-grid-secondary nui-readonly-zone${isOrderLockedForEdit ? ' is-locked' : ''}`}
                 onClickCapture={(e) => handleLockedZoneClickCapture(e, 'додавати')}
            >
              <p onClick={() => setShowNewScans(true)}>
                <div className="tileContent">
                  <span className="verticalText">SCANS</span>
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
                </div>
              </p>


              <p onClick={() => openEditorForOrderUnit(null, 'WideFactory')}>
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
                <div className="nui-order-delivered-title">
                  {orderListStatusTitle.text}<span className="nui-order-delivered-id">№{orderListStatusTitle.id}</span>{thisOrder?.createdAt && <span style={{ color: 'var(--admingrey, #666666)' }}> від {new Date(thisOrder.createdAt).toLocaleDateString('uk-UA')}</span>}{orderListStatusTitle.suffix && <span className="nui-order-delivered-suffix">{orderListStatusTitle.suffix}</span>}
                </div>
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
                  const isNameParagraph = String(formattedName).length > 55;
                  const hasDiscount = parseFloat(thing.priceForOneThis).toFixed(2) !== parseFloat(thing.priceForOneThisDiscount).toFixed(2);
                  const unitPrice = hasDiscount
                    ? parseFloat(parseFloat(thing.priceForThisDiscount / thing.amount).toFixed(2))
                    : parseFloat(parseFloat(thing.priceForOneThis).toFixed(2));
                  const _rawTotal = hasDiscount ? thing.priceForThisDiscount : thing.priceForAllThis;
                  const totalPrice = parseFloat(_rawTotal) || (unitPrice * (thing.amount || 1));

                  return (
                    <div
                      key={index}
                      className={`nui-order-item ${orderToneClass} ${editorAccentClass}${expandedThingIndex === index ? " is-expanded" : ""}`}
                      onClick={() => toggleExpandedThing(index)}
                    >
                      <div className="nui-item-header">
                        <div className={`nui-item-name${isNameParagraph ? ' is-paragraph' : ''}`} style={!isCancelledOrder ? { color: 'var(--admingrey)' } : undefined}>
                          {String(formattedName).split(/(²)/).map((part, i) =>
                            part === '²' ? <sup key={i} style={{color: 'var(--admingrey)'}}>2</sup> : part
                          )}
                        </div>
                        <div className="nui-item-actions">
                          <div className="nui-item-btn nui-item-del" onClick={(e) => handleThingClickDelete2(thing, e)}>✕</div>
                        </div>
                      </div>

                      <div className="nui-price-row">
                        <span className="nui-price-left">{thing.amount}<span className="nui-unit-sub">шт</span>{" х "}{unitPrice}<span className="nui-unit-sub">грн</span>{" = "}</span>
                        <span className={`nui-price-total${hasDiscount ? ' nui-price-total--discount' : ''}`}>{parseFloat(totalPrice)}<span className="nui-price-total-unit">грн</span></span>
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
                            <span>Розміщено на аркуші: <span className="nui-footer-accent">{thing.newField4} {getPluralForm(thing.newField4, "виріб", "вiroби", "виробів")}</span></span>
                            <span className="nui-sep">|</span>
                            <span>Загалом надруковано: <span className="nui-footer-accent">{thing.newField5} {getPluralForm(thing.newField5, "аркуш", "аркуші", "аркушів")}</span></span>
                            <span className="nui-sep">|</span>
                            <div className="nui-summary-line">
                              <span>За 1 аркуш:</span>{' '}<span className="nui-footer-price">{parseFloat(parseFloat(totalPrice / (thing.newField5 || 1)).toFixed(2))}<span className="nui-footer-price-unit">грн</span></span>
                            </div>
                            <span className="nui-sep">|</span>
                            <div className="nui-summary-line">
                              <span>За 1 шт:</span>{' '}<span className="nui-footer-price">{parseFloat(unitPrice)}<span className="nui-footer-price-unit">грн</span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {uiLockError && (
              <div className="nui-error-bar">
                {uiLockError}
              </div>
            )}
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
                showError={false}
              />
            </div>

          </div>

          {/* ── Uklon Map + Tracking (правіше від списку замовлень) ── */}
          {uklonMapData && (() => {
            const t = uklonMapData.tracking;
            const s = (t?.status || 'created').toLowerCase();
            const statusMap = { created:'⏳ Створено', processing:'⏳ Обробка', driver_found:'🚗 Водій знайдений', driver_on_way:'🚗 Водій їде до вас', driver_arrived:'📍 Водій прибув', parcel_picked_up:'📦 Посилку забрано', delivering:'🚚 Доставляється', delivered:'✅ Доставлено', cancelled:'❌ Скасовано', completed:'✅ Завершено', returning:'🔄 Повернення', returned:'↩️ Повернено' };
            const isCanceled = ['cancelled', 'canceled'].includes(s);
            const isReturning = ['returning', 'returned'].includes(s);
            const isDone = ['delivered','cancelled','canceled','completed','failed','returned'].includes(s);
            const currentStatus = s;
            const steps = ['processing','driver_on_way','parcel_picked_up','delivering','delivered'];
            const stepMapping = s === 'created' ? 'processing' : s === 'driver_found' ? 'processing' : s === 'driver_arrived' ? 'driver_on_way' : isCanceled || isReturning ? 'processing' : s;
            const currentStep = steps.indexOf(stepMapping);
            const courier = t?.courier;
            const est = uklonMapData.estimate;
            const statusTimes = t?.statusTimes || {};

            return (
              <div className="nui-uklon-map-zone">
                {/* ── Прогрес-бар статусів + ціна ── */}
                <div className="nui-uklon-progress" style={{ display: 'flex', alignItems: 'center' }}>
                  {steps.map((step, i) => {
                    const labels = { processing:'Пошук водія', driver_on_way:'Водій їде', parcel_picked_up:'Забрано', delivering:'Доставка', delivered:'Готово' };
                    const active = i <= currentStep && currentStep >= 0;
                    const isCurrent = i === currentStep;
                    const isSearching = step === 'processing' && isCurrent && ['created','processing','driver_found'].includes(s);
                    const time = statusTimes[step] ? new Date(statusTimes[step]).toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' }) : null;
                    return (
                      <div key={step} className={`nui-uklon-step ${active ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isSearching ? 'searching' : ''}`}>
                        <div className={`nui-uklon-step-dot ${isSearching ? 'pulse' : ''}`} />
                        <span className="nui-uklon-step-label">
                          {labels[step]}{isSearching ? '...' : ''}{active && time && !isSearching ? ` (${time})` : ''}
                        </span>
                        {i < steps.length - 1 && <div className={`nui-uklon-step-line ${active ? 'active' : ''}`} />}
                      </div>
                    );
                  })}

                  {/* Ціна доставки — в рядку з прогрес-баром */}
                  {!isCanceled && est?.cost && (
                    <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.85rem', color: 'var(--admingreen)', whiteSpace: 'nowrap', paddingLeft: 8 }}>
                      {est.cost} грн
                    </span>
                  )}
                </div>

                {/* ── Інфо ── */}
                <div className="nui-uklon-tracking-info">

                  {/* Скасовано */}
                  {isCanceled && (
                    <div style={{ background: 'var(--adminlightred, #fde8e8)', padding: '6px 10px', borderRadius: 6, marginBottom: 4 }}>
                      <span style={{ color: 'var(--adminred)', fontWeight: 600, fontSize: '0.85rem' }}>
                        ❌ Скасовано{t?.cancellationReason ? `: ${t.cancellationReason}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Відстань + час */}
                  {!isCanceled && (est?.distance || est?.time) && (
                    <div className="nui-uklon-estimate-row">
                      {est.distance && <span className="nui-uklon-tag">{est.distance}</span>}
                      {est.time && <span className="nui-uklon-tag">{est.time}</span>}
                    </div>
                  )}

                  {/* Інфо водія — з'являється після driver_found */}
                  {courier && !isCanceled && ['driver_found','driver_on_way','driver_arrived','on_place','parcel_picked_up','picked_up','delivering','delivered','completed'].includes(s) && (() => {
                    const driverName = courier.name || courier.first_name || 'Водій';
                    const carInfo = courier.car ? `${courier.car.brand || ''} ${courier.car.model || ''}`.trim() : '';
                    const carNumber = courier.car?.number || courier.car?.license_plate || '';
                    const carColor = courier.car?.color || '';
                    const phone = courier.phone || '';
                    const copyText = [driverName, carInfo, carColor, carNumber, phone].filter(Boolean).join(' • ');

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginBottom: '-2px' }}>
                        {/* Фото водія */}
                        {courier.photo ? (
                          <img
                            src={courier.photo}
                            alt={driverName}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--admingrey)' }}
                          />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#333', flexShrink: 0 }}>
                            {driverName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Текст */}
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.78rem', color: 'var(--admingrey)', lineHeight: 1.3 }}>
                          <span>
                            <b style={{ color: '#333' }}>{driverName}</b>
                            {carInfo && ` • ${carInfo}`}
                            {carColor && ` (${carColor})`}
                            {carNumber && ` • ${carNumber}`}
                          </span>
                          {phone && (
                            <a href={`tel:${phone}`} style={{ color: 'var(--admingrey)', textDecoration: 'none', fontSize: '0.75rem' }}>
                              {phone}
                            </a>
                          )}
                        </div>

                        {/* Tracking link */}
                        <button
                          onClick={() => {
                            const trackId = t?.id || uklonMapData.result?.uid;
                            const trackUrl = `${window.location.origin}/track/uklon/${trackId}`;
                            navigator.clipboard.writeText(trackUrl);
                            const btn = document.activeElement;
                            if (btn) { btn.title = 'Скопійовано!'; setTimeout(() => { btn.title = 'Tracking link'; }, 1500); }
                          }}
                          title="Tracking link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--admingrey)', display: 'flex', marginLeft: 'auto', flexShrink: 0 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                          </svg>
                        </button>

                        {/* Копіювати */}
                        <button
                          onClick={() => { navigator.clipboard.writeText(copyText); }}
                          title="Копіювати"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--admingrey)', display: 'flex', flexShrink: 0 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })()}

                </div>

                {/* ── Карта (Leaflet) ── */}
                {uklonMapData.pickup?.lat && uklonMapData.dropoffs?.[0]?.lat && (
                  <div style={{ height: 930, borderRadius: 6, overflow: 'hidden' }}>
                    <UklonMap
                      pickup={uklonMapData.pickup}
                      dropoffs={uklonMapData.dropoffs}
                      deliveryId={t?.id || uklonMapData.result?.uid}
                      status={t?.status}
                      onCourierUpdate={(courierData) => {
                        setUklonMapData(prev => prev ? {
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            courier: {
                              ...prev.tracking?.courier,
                              location: { latitude: courierData.latitude, longitude: courierData.longitude },
                            },
                          },
                        } : prev);
                      }}
                      onSimulationChange={setUklonSimulating}
                      onStatusChange={(newStatus, extra) => {
                        console.log('[Uklon SIM] onStatusChange:', newStatus);
                        setUklonMapData(prev => {
                          if (!prev) return prev;
                          const doneStatuses = ['delivered', 'cancelled', 'completed', 'failed'];
                          const updated = {
                            ...prev,
                            tracking: {
                              ...prev.tracking,
                              status: newStatus,
                              statusTimes: {
                                ...prev.tracking?.statusTimes,
                                ...extra?.statusTimes,
                              },
                              courier: {
                                ...prev.tracking?.courier,
                                name: prev.tracking?.courier?.name || 'Олексій Мельник',
                                phone: prev.tracking?.courier?.phone || '+380991234567',
                                photo: prev.tracking?.courier?.photo || null,
                                car: prev.tracking?.courier?.car || {
                                  brand: 'Toyota',
                                  model: 'Camry',
                                  color: 'білий',
                                  number: 'AA 1234 BB',
                                },
                              },
                            },
                            isDone: doneStatuses.includes(newStatus),
                          };

                          // Зберігаємо в БД
                          if (thisOrder?.id) {
                            const uklonDb = {
                              deliveryId: prev.tracking?.id || prev.result?.uid,
                              status: newStatus,
                              pickup: prev.pickup,
                              dropoffs: prev.dropoffs,
                              estimate: prev.estimate,
                              courier: updated.tracking.courier,
                              statusTimes: updated.tracking.statusTimes,
                              createdAt: prev.createdAt,
                            };
                            // Не зберігати в БД під час симуляції
                            if (!uklonSimRef.current) {
                              axios.put(`/orders/one/${thisOrder.id}`, { uklonData: JSON.stringify(uklonDb) }).catch(() => {});
                            }
                          }

                          return updated;
                        });
                      }}
                    />
                  </div>
                )}

                {/* ── Кнопки скасувати / повернути (знизу карти) ── */}
                {!isDone && (
                  <div className="nui-uklon-cancel-wrap" style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Кнопка ПОВЕРНУТИ — видна тільки коли посилку вже забрали */}
                    {['picked_up', 'delivering', 'driver_on_way', 'on_place'].includes(currentStatus) && (
                      <button
                        className="nui-uklon-cancel-btn"
                        style={{ borderColor: 'var(--adminorange)', color: 'var(--adminorange)' }}
                        onClick={async () => {
                          const id = t?.id || uklonMapData.result?.uid || uklonMapData.result?.id;
                          if (!id) { alert('Немає ID'); return; }
                          if (!window.confirm('Повернути посилку відправнику?')) return;
                          try {
                            // 1. Estimate повернення
                            const estResp = await axios.post(`/api/uklon/order/${id}/return/estimate`, {});
                            const fareId = estResp.data?.id || estResp.data?.fare_id;
                            if (!fareId) { alert('Не вдалось отримати fare_id для повернення'); return; }
                            // 2. Запит на повернення
                            await axios.put(`/api/uklon/order/${id}/return`, { fare_id: fareId });
                            alert('Повернення оформлено!');
                            // Оновити статус
                            try {
                              const returnData = JSON.stringify({ ...JSON.parse(thisOrder?.uklonData || '{}'), status: 'returning', returnRequestedAt: new Date().toISOString() });
                              await axios.put(`/orders/one/${thisOrder.id}`, { uklonData: returnData });
                              setThisOrder(prev => prev ? { ...prev, uklonData: returnData } : prev);
                            } catch (_) {}
                          } catch (err) {
                            const msg = err?.response?.data?.error || err.message;
                            if (err?.response?.status === 400) {
                              alert('Повернення неможливе: замовлення вже скасоване або ще не забране водієм');
                            } else {
                              alert('Помилка повернення: ' + msg);
                            }
                          }
                        }}
                      >
                        <span>ПОВЕРНУТИ</span>
                      </button>
                    )}
                    <button
                      className="nui-uklon-cancel-btn"
                      onClick={() => {
                        const id = t?.id || uklonMapData.result?.uid || uklonMapData.result?.id;
                        console.log('[Uklon] Cancel order id:', id);
                        if (!id) { alert('Немає ID для скасування'); return; }
                        axios.put(`/api/uklon/order/${id}/cancel`, { reason: 1 })
                          .then(async () => {
                            // Видалити позицію "Доставка Uklon" зі списку замовлень
                            try {
                              const units = thisOrder?.OrderUnits || thisOrder?.orderUnits || selectedThings2 || [];
                              const deliveryUnit = units.find(u =>
                                u.name === 'Доставка Uklon' || u.nameOrderUnit === 'Доставка Uklon'
                                || u.typeUse === 'Uklon' || (u.name && u.name.includes('Доставка Uklon'))
                              );
                              if (deliveryUnit) {
                                const unitId = deliveryUnit.id || deliveryUnit.idKey;
                                console.log('[Uklon] Removing delivery unit:', unitId, deliveryUnit.name);
                                await axios.delete(`/orderUnits/OneOrder/OneOrderUnitInOrder/${unitId}`);
                                // Оновити замовлення — видалити з поточного стейту одразу
                                const newUnits = units.filter(u => (u.id || u.idKey) !== unitId);
                                setSelectedThings2(newUnits);
                                // Також оновити з сервера
                                try {
                                  const { data: updatedOrder } = await axios.get(`/orders/one/${thisOrder.id}`);
                                  setThisOrder(updatedOrder);
                                  setSelectedThings2(updatedOrder.OrderUnits || []);
                                } catch (_) {}
                              } else {
                                console.log('[Uklon] Delivery unit not found in', units.map(u => u.name));
                              }
                            } catch (delErr) {
                              console.error('[Uklon] Failed to remove delivery unit:', delErr.message);
                            }
                            // Позначити uklonData як скасований
                            try {
                              const cancelData = JSON.stringify({ status: 'canceled' });
                              await axios.put(`/orders/one/${thisOrder.id}`, { uklonData: cancelData });
                              setThisOrder(prev => prev ? { ...prev, uklonData: cancelData } : prev);
                            } catch (_) {}
                            setUklonMapData(null);
                          })
                          .catch(err => {
                            const msg = err?.response?.data?.error || err.message;
                            console.error('[Uklon] Cancel error:', msg);
                            alert('Помилка скасування: ' + msg);
                          });
                      }}
                    >
                      <span>СКАСУВАТИ</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="d-flex flex-row nui-bottom-shell">
            <div className="nui-bottom-pane nui-bottom-pane--progress">
              <div className="nui-bottom-main-row">
                <div className="nui-bottom-finance-inline">
                  <div className="nui-finance-pb-wrap">
                  <ProgressBar
                    thisOrder={thisOrder}
                    setThisOrder={setThisOrder}
                    setSelectedThings2={setSelectedThings2}
                    selectedThings2={selectedThings2}
                    externalError={uiLockError}
                    showActionRail={false}
                    showFinance={true}
                    showError={false}
                    onDiscountError={setUiLockError}
                  />
                  </div>
                  <div className={`nui-deadline-envelope${isDeadlineOverdue ? ' nui-deadline--overdue' : ''}`}>
                    {orderDeadlineCountdown && (
                      <button
                        className="nui-envelope-toggle-btn"
                        onClick={() => setShowEnvelopeBarcode(prev => !prev)}
                        title={showEnvelopeBarcode ? 'Показати дедлайн' : 'Показати штрих-код'}
                      >
                        {showEnvelopeBarcode ? '⏱' : '|||'}
                      </button>
                    )}
                    {!orderDeadlineCountdown || showEnvelopeBarcode ? (
                      <div className="nui-barcode-with-ttn">
                        {thisOrder?.Waybills?.length > 0 && (
                          <div className="nui-ttn-block">
                            <span className="nui-ttn-number">{thisOrder.Waybills[0].intDocNumber}</span>
                            <div className="nui-ttn-buttons">
                              <button
                                className="nui-client-rect-btn nui-ttn-rect-btn"
                                title="Завантажити ТТН (PDF)"
                                onClick={() => {
                                  axios.get(`/novaposhta/print/${thisOrder.Waybills[0].ref}`, { responseType: 'blob' })
                                    .then(res => {
                                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `TTN_${thisOrder.Waybills[0].intDocNumber}.pdf`;
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    })
                                    .catch(err => console.error('[NP] TTN download error:', err));
                                }}
                              ><span className="nui-client-rect-btn-text">ТТН</span></button>
                              <button
                                className="nui-client-rect-btn nui-ttn-rect-btn"
                                title="Завантажити наліпку (PDF)"
                                onClick={() => {
                                  axios.get(`/novaposhta/print-sticker/${thisOrder.Waybills[0].ref}`, { responseType: 'blob' })
                                    .then(res => {
                                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `Sticker_${thisOrder.Waybills[0].intDocNumber}.pdf`;
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    })
                                    .catch(err => console.error('[NP] Sticker download error:', err));
                                }}
                              ><span className="nui-client-rect-btn-text">НАЛІПКА</span></button>
                              <NovaPoshtaThermalButton
                                waybillRef={thisOrder.Waybills[0].ref}
                                intDocNumber={thisOrder.Waybills[0].intDocNumber}
                                className="nui-client-rect-btn nui-ttn-rect-btn"
                              />
                            </div>
                          </div>
                        )}
                        <BarcodeLabel type="order" data={thisOrder} variant="full" onAfterPrint={() => {
                          if (thisOrder?.id) {
                            axios.put('/orders/OneOrder/statusUpdate', { newStatus: 3, thisOrderId: thisOrder.id })
                              .then(res => {
                                const nextOrder = res?.data?.order ?? res?.data;
                                if (nextOrder && typeof nextOrder === 'object') {
                                  setThisOrder(nextOrder);
                                  if (Array.isArray(nextOrder.OrderUnits)) setSelectedThings2(nextOrder.OrderUnits);
                                }
                              })
                              .catch(err => console.error('Status update error:', err));
                          }
                        }} />
                      </div>
                    ) : (
                      <>
                        <span className="nui-deadline-envelope__prefix">
                          {isDeadlineOverdue ? 'Замовлення необхідно було віддати:' : 'Замовлення необхідно віддати через:'}
                        </span>
                        <span className="nui-deadline-envelope__counter">
                          {orderDeadlineCountdown.split(' ').map((token, i) => {
                            const m = token.match(/^(\d+)(Д|Г|ХВ)$/i);
                            if (!m) return <span key={i}>{token} </span>;
                            return (
                              <span key={i} className="nui-deadline-token">
                                {m[1]}<span className="nui-deadline-unit">{m[2]}</span>{' '}
                              </span>
                            );
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="nui-bottom-client-inline">
                  <ClientChangerUIArtem
                    thisOrder={thisOrder}
                    setThisOrder={setThisOrder}
                    setSelectedThings2={setSelectedThings2}
                    hidePaymentPanel={true}
                    onClientError={setUiLockError}
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
            onOpenMockup={() => setShowMugMockup(true)}
          />
        }
        {showMugMockup && thisOrder &&
          <MugMockupModal orderId={thisOrder.id} onClose={() => setShowMugMockup(false)} />
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
        <UklonDelivery
          showUklon={showUklon}
          setShowUklon={setShowUklon}
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          setSelectedThings2={setSelectedThings2}
          onMapData={setUklonMapData}
        />
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
        </QuantumErrorBoundary>
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
