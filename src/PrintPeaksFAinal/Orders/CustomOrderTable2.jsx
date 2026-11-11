import React, { useEffect, useMemo, useState } from 'react';
import './OrdersList.css';
import axios from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowUpRight, FiCheck, FiChevronDown, FiClock,
  FiCopy, FiPhone, FiPrinter, FiSearch, FiTrash2, FiX,
} from 'react-icons/fi';
import {
  Avatar, Pager,
  money, moneyShort, pad, fmtDate, fmtTime, fmtDateTime,
  personName, discountPct as pct, telegramUser, telHref,
} from '../tools/ListKit';
import { FaTelegramPlane } from 'react-icons/fa';
import ModalDeleteOrder from "./ModalDeleteOrder";
import ModalMergeOrders from "./ModalMergeOrders";
import OrderMarginPanel from "./OrderMarginPanel";
import BarcodeLabel from '../barcode/BarcodeLabel';
import { printLabel } from '../barcode/niimbotPrintService';
import DatePicker from "../tools/DatePicker";
import Loader from "../../components/calc/Loader";
import { searchChange } from "../../actions/searchAction";

/* ==========================================================================
   Список замовлень (/Orders), префікс orl-.
   Брендова база (ppBrand.css): плаский стиль, прямокутні плитки, кольори
   лише з токенів — бежева/світла/темна теми працюють самі.
   ========================================================================== */

/* ── Статуси замовлення ── */
const STATUSES = [
  { key: 'status0',         code: '0',  label: 'Скіко',     tone: 'grey' },
  { key: 'status1',         code: '1',  label: 'Друк',      tone: 'orange' },
  { key: 'status2',         code: '2',  label: 'Постпрес',  tone: 'blue' },
  { key: 'status3',         code: '3',  label: 'Готово',    tone: 'rose' },
  { key: 'status4',         code: '4',  label: 'Отримано',  tone: 'purple' },
  { key: 'statusCancelled', code: '-1', label: 'Скасоване', tone: 'red' },
  { key: 'status5',         code: '5',  label: 'Видалено',  tone: 'red' },
];
const STATUS_BY_CODE = Object.fromEntries(STATUSES.map(s => [s.code, s]));
const DEFAULT_STATUSES = {
  status0: true, status1: true, status2: true,
  status3: true, status4: true, status5: false, statusCancelled: false,
};

/* ── Фільтри оплати (ключі збігаються з бекендом: PAY_STATUS_MAP / PAY_METHOD_MAP) ── */
const PAY_STATUS_ITEMS = [
  ['payment0', 'Очікує',          'coral'],
  ['payment1', 'Оплачено',        'green'],
  ['payment2', 'Протерміновано',  'red'],
  ['payment3', 'Відміна',         'grey'],
];
const PAY_METHOD_ITEMS = [
  ['payment2', 'Готівка'],
  ['payment1', 'Картка'],
  ['payment0', 'Посилання'],
  ['payment3', 'Рахунок'],
];
const ALL_ON = { payment0: true, payment1: true, payment2: true, payment3: true };

const PAID_LABELS = {
  terminal: 'Карткою', link: 'Онлайн', cash: 'Готівкою',
  invoice: 'Рахунком', iban: 'На IBAN', cod: 'Накладений',
};
const WAIT_LABELS = {
  link: 'monobank', terminal: 'термінал', invoice: 'рахунок',
  iban: 'IBAN', cod: 'НП', cash: 'готівка',
};

/* ── Утиліти ── */
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clientName = personName;

const resolveDeadline = (order) => {
  if (order?.deadline) return order.deadline;
  if (typeof order?.finalManufacturingTime === 'string') return order.finalManufacturingTime;
  return null;
};

/* ── Чи можна взяти замовлення в обʼєднання ──
   Дзеркалить перевірку бекенду (routes/orderUnits.js → /merge-orders):
   обʼєднуємо лише неоплачені та ті, що чекають оплати. */
const mergeBlockReason = (order) => {
  const st = String(order.status);
  if (st === '-1') return 'Замовлення скасоване';
  if (st === '5')  return 'Замовлення видалене';
  const pay = order.Payment?.status;
  if (pay === 'PAID')     return 'Замовлення вже оплачене';
  if (pay === 'REFUNDED') return 'По замовленню було повернення';
  return null;
};

const downloadPdf = (url, filename, errLabel) => {
  axios.get(url, { responseType: 'blob' })
    .then(res => {
      const href = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(href);
    })
    .catch(err => alert(`${errLabel}: ${err.message}`));
};

/* ══════════════════════════ дрібні компоненти ══════════════════════════ */

const StatusPill = ({ status }) => {
  const s = STATUS_BY_CODE[String(status)] || STATUS_BY_CODE['0'];
  return <span className={`orl-pill orl-tone-${s.tone}`}>{s.label}</span>;
};

/* Оплата. Платіж, що чекає (CREATED/PROCESSING), сам перепитує статус у
   monobank і слухає вебхук через подію paymentStatusUpdate — як і
   ActivatorCheckPaymentStatus у старій таблиці. */
const PayPill = ({ order }) => {
  const [payment, setPayment] = useState(order.Payment);

  useEffect(() => { setPayment(order.Payment); }, [order.Payment]);

  useEffect(() => {
    if (order.Payment?.status !== 'CREATED' || !order.id) return undefined;
    let alive = true;
    axios.get('/api/payment/invoice-status-without-invoiceId', { params: { orderId: order.id } })
      .then(({ data }) => { if (alive && data?.status) setPayment(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [order.id]); // eslint-disable-line

  useEffect(() => {
    const onUpdate = (e) => {
      if (String(e.detail?.orderId) === String(order.id)) setPayment(e.detail.payment);
    };
    window.addEventListener('paymentStatusUpdate', onUpdate);
    return () => window.removeEventListener('paymentStatusUpdate', onUpdate);
  }, [order.id]);

  const p = payment;
  if (!p || !p.status) return <span className="orl-dash">—</span>;
  switch (p.status) {
    case 'PAID':
      return (
        <span className="orl-pill orl-pill--solid orl-tone-green">
          <FiCheck className="orl-pill-ico" />{PAID_LABELS[p.method] || 'Оплачено'}
        </span>
      );
    case 'CREATED':
    case 'PROCESSING':
      return <span className="orl-pill orl-tone-coral">Очікує · {WAIT_LABELS[p.method] || 'оплату'}</span>;
    case 'EXPIRED':   return <span className="orl-pill orl-tone-red">Протерміновано</span>;
    case 'FAILED':    return <span className="orl-pill orl-tone-red">Помилка</span>;
    case 'CANCELLED': return <span className="orl-pill orl-tone-grey">Відміна</span>;
    case 'REFUNDED':  return <span className="orl-pill orl-tone-purple">Повернення</span>;
    default:          return <span className="orl-dash">—</span>;
  }
};

const ClientAvatar = ({ client, size = 34 }) => (
  <Avatar photo={client?.photoLink} telegram={client?.telegram} name={personName(client)} id={client?.id} size={size} />
);

/* Дедлайн тікає щосекунди сам — раніше весь список перемальовувався
   щосекунди через спільний таймер у батьківському компоненті. */
const DeadlineCell = ({ order }) => {
  const st = String(order.status);
  const deadline = resolveDeadline(order);
  const live = deadline && !['3', '4', '5', '-1'].includes(st);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [live]);

  if (!deadline) return <span className="orl-dash">—</span>;
  const target = new Date(deadline).getTime();
  if (!Number.isFinite(target)) return <span className="orl-dash">—</span>;
  const exact = fmtDateTime(deadline);

  // Завершені замовлення: таймер уже не має сенсу — показуємо дату й
  // для «Готово» — чи встигли (момент готовності = updatedAt).
  if (!live) {
    if (st === '3') {
      const late = new Date(order.updatedAt).getTime() > target;
      return (
        <span className={`orl-due ${late ? 'orl-due--late' : 'orl-due--ok'}`} title={`Дедлайн: ${exact}`}>
          {late ? 'Із запізненням' : 'Вчасно'}
        </span>
      );
    }
    return <span className="orl-due orl-due--muted" title={`Дедлайн: ${exact}`}>{exact}</span>;
  }

  const diff = target - now;
  const abs = Math.floor(Math.abs(diff) / 1000);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const text = `${d > 0 ? `${d}д ` : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
  const cls = diff < 0 ? 'orl-due--late' : diff < 3 * 3600 * 1000 ? 'orl-due--soon' : 'orl-due--ok';

  return (
    <span className={`orl-due ${cls}`} title={`Дедлайн: ${exact}`}>
      <FiClock className="orl-due-ico" />
      <span className="orl-due-text">{diff < 0 ? `−${text}` : text}</span>
    </span>
  );
};

const UklonMark = ({ order, onOpen }) => {
  if (!order.uklonData || order.uklonData === 'null' || order.uklonData === '{}') return null;
  let st = '';
  try {
    const ud = typeof order.uklonData === 'string' ? JSON.parse(order.uklonData) : order.uklonData;
    st = (ud?.status || '').toLowerCase();
  } catch { return null; }
  if (['canceled', 'cancelled', 'failed'].includes(st)) return null;
  const label = st === 'delivered' ? 'Доставлено' : st === 'processing' ? 'В дорозі' : 'Uklon';
  const tone = st === 'delivered' ? 'green' : st === 'processing' ? 'orange' : 'grey';
  return (
    <button type="button" className={`orl-ship orl-ship--uklon orl-tone-${tone}`} title={`Uklon: ${st || 'створено'} — відкрити лог`} onClick={onOpen}>
      <svg width="14" height="14" viewBox="0 0 625 625" fill="none" aria-hidden="true">
        <path d="M502,0c62,2.5,118.5,56,123,118v390c-5.1,59.6-59.1,113.5-119,117H116c-63.8-6.1-113.5-63.6-118-126.7V127.4C2.6,61,57.4,3.2,123,0h379Z" fill="#000" />
        <path d="M369.8,148.3c31.6-1.7,82.1-4.2,94.2,32.2c14.1,42,.4,116.2-9.5,159.6c-7.1,31-32.9,125.8-57.6,143.4c-23.8,16.9-69.2-15.7-88.4-30.5c-27.5-21.2-56.3-48.4-81.1-72.9c-28.4-28.1-95.7-99-98.5-138.5c-1.4-19.5,16.9-29.8,32-38.1c53.4-29.1,148.2-51.9,208.8-55.2Z" fill="#fed800" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

/* ══════════════════════════ сторінка ══════════════════════════ */

const CustomOrderTable2 = () => {
  const [data, setData]       = useState(null);
  const dispatch              = useDispatch();
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]     = useState(50);
  const [printingId, setPrintingId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [sortColumn, setSortColumn]   = useState('id');
  const [sortReverse, setSortReverse] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [statuses, setStatuses]   = useState(DEFAULT_STATUSES);
  const [payments, setPayments]   = useState(ALL_ON);
  const [paymentsType, setPaymentsType] = useState(ALL_ON);

  const currentUser = useSelector((state) => state.auth.user);
  const search      = useSelector((state) => state.search.search);
  const navigate    = useNavigate();

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'operator';

  /* ── завантаження ── */
  useEffect(() => {
    if (!currentUser) return undefined;
    const abortCtrl = new AbortController();
    const url = isStaff ? '/orders/all' : '/orders/my';
    setLoading(true);
    axios.post(url, {
      inPageCount: limit, currentPage, search,
      columnName: { column: sortColumn, reverse: sortReverse },
      startDate, endDate, statuses, payments, paymentsType,
    }, { signal: abortCtrl.signal })
      .then(res => { setData(res.data); setError(null); setLoading(false); })
      .catch(err => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
    return () => abortCtrl.abort();
  }, [
    search, currentPage, limit, currentUser?.role, reloadKey,
    sortColumn, sortReverse, startDate, endDate,
    statuses, payments, paymentsType,
  ]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange("")); }, []); // eslint-disable-line

  // Зміна фільтра звужує вибірку: якщо лишитись на 12-й сторінці, вона
  // виявиться за межами нового результату і список буде порожній.
  useEffect(() => { setCurrentPage(1); }, [search, startDate, endDate, statuses, payments, paymentsType, limit]);

  // Вибір за межами видимих рядків тільки заплутує, бо в панелі показана
  // сума саме видимих замовлень.
  useEffect(() => { setSelectedIds([]); }, [currentPage, search, startDate, endDate, statuses, payments, paymentsType]);

  /* ── сортування ── */
  const handleSort = (col) => {
    if (sortColumn === col) setSortReverse(prev => !prev);
    else { setSortColumn(col); setSortReverse(true); }
    setCurrentPage(1);
  };
  const SortHead = ({ col, children, align, className = '' }) => (
    <button
      type="button"
      className={`orl-th orl-th--sort${sortColumn === col ? ' is-active' : ''}${align === 'right' ? ' orl-th--right' : ''} ${className}`}
      onClick={() => handleSort(col)}
    >
      <span>{children}</span>
      <span className="orl-sort">{sortColumn === col ? (sortReverse ? '↓' : '↑') : '↕'}</span>
    </button>
  );

  /* ── фільтри ── */
  const toggleStatus = (key, solo) => {
    if (solo) {
      setStatuses(Object.fromEntries(STATUSES.map(s => [s.key, s.key === key])));
      return;
    }
    setStatuses(prev => ({ ...prev, [key]: !prev[key] }));
  };
  /* Фільтри оплати — як у CRM: «усе ввімкнено» = фільтра немає, жодна
     кнопка не підсвічена. Перший клік лишає тільки вибране, далі кнопки
     додаються/знімаються; зняли останню — знову все. */
  const isAllOn = (obj) => Object.values(obj).every(Boolean);
  const pickIn = (setter) => (key) => setter(prev => {
    if (isAllOn(prev)) return Object.fromEntries(Object.keys(prev).map(k => [k, k === key]));
    const next = { ...prev, [key]: !prev[key] };
    return Object.values(next).some(Boolean) ? next : { ...ALL_ON };
  });

  const today = toISO(new Date());
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };
  const DATE_PRESETS = [
    ['Сьогодні', today, today],
    ['Вчора', daysAgo(1), daysAgo(1)],
    ['7 днів', daysAgo(6), today],
    ['30 днів', daysAgo(29), today],
    ['Весь час', '', ''],
  ];
  const setPeriod = (from, to) => { setStartDate(from); setEndDate(to); };

  const statusesChanged = STATUSES.some(s => !!statuses[s.key] !== !!DEFAULT_STATUSES[s.key]);
  const paysChanged = Object.values(payments).some(v => !v) || Object.values(paymentsType).some(v => !v);
  const filtersChanged = statusesChanged || paysChanged || startDate || endDate || search;
  const resetFilters = () => {
    setStatuses(DEFAULT_STATUSES);
    setPayments(ALL_ON);
    setPaymentsType(ALL_ON);
    setPeriod('', '');
    if (search) dispatch(searchChange(""));
  };

  /* ── зведення по статусах (бекенд: summary.byStatus) ── */
  const byStatus = data?.summary?.byStatus || null;
  const totals = useMemo(() => {
    if (!byStatus) return null;
    return STATUSES.reduce((acc, s) => {
      if (!statuses[s.key]) return acc;
      const v = byStatus[s.code] || {};
      acc.sum += v.sum || 0;
      acc.paid += v.paid || 0;
      return acc;
    }, { sum: 0, paid: 0 });
  }, [byStatus, statuses]);

  /* ── вибір для обʼєднання ── */
  const canMerge = !!currentUser;
  const rows = data?.rows || [];
  const selectedOrders = rows.filter(o => selectedIds.includes(o.id));
  // Нове замовлення отримає клієнта найстарішого з вибраних — так само,
  // як це робить бекенд. Показуємо це явно, бо клієнти можуть бути різні.
  const targetOrder = [...selectedOrders].sort((a, b) => a.id - b.id)[0];
  const selectionClientName = clientName(targetOrder?.client);
  const mixedClients = new Set(selectedOrders.map(o => o.clientId)).size > 1;
  const selectableOnPage = rows.filter(o => !mergeBlockReason(o));
  const allSelectedOnPage = selectableOnPage.length > 0 && selectableOnPage.every(o => selectedIds.includes(o.id));

  const toggleSelect = (order) => setSelectedIds(prev => (prev.includes(order.id)
    ? prev.filter(id => id !== order.id)
    : [...prev, order.id]));
  const toggleSelectAll = () => setSelectedIds(allSelectedOnPage ? [] : selectableOnPage.map(o => o.id));

  const handleMerged = (payload) => {
    setShowMergeModal(false);
    setSelectedIds([]);
    const warnings = payload?.warnings || [];
    if (warnings.length) alert(`Обʼєднано з зауваженнями:\n\n${warnings.join('\n')}`);
    const newId = payload?.order?.id;
    if (newId) navigate(`/Orders/${newId}`);
  };

  /* ── дії ── */
  const handleDuplicate = async (e, orderId) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`/api/orders/duplicate/${orderId}`);
      if (res.data?.id) navigate(`/Orders/${res.data.id}`);
    } catch (err) {
      console.error('Помилка дублювання замовлення:', err);
      alert('Помилка при дублюванні замовлення');
    }
  };

  const handlePrint = async (e, order) => {
    e.stopPropagation();
    if (printingId) return;
    setPrintingId(order.id);
    try {
      await printLabel('order', order);
    } catch (err) {
      alert('Помилка друку: ' + (err?.response?.data?.error || err.message));
    } finally {
      setPrintingId(null);
    }
  };

  const handleDelete = (order) => {
    setThisOrderForDelete(order);
    setShowDeleteOrderModal(true);
  };

  const stop = (e) => e.stopPropagation();

  if (!currentUser || (!data && !error)) {
    return <div className="orl"><div className="orl-loader"><Loader /></div></div>;
  }

  const total = data?.count || 0;

  return (
    <div className="orl">

      {/* ───────────── шапка ───────────── */}
      <header className="orl-head">
        <div className="orl-titlebox">
          <h1 className="orl-h1">Замовлення</h1>
          <div className="orl-subtitle">
            <span><b>{total.toLocaleString('uk-UA')}</b> у вибірці</span>
            {totals && (
              <>
                <span className="orl-sep" />
                <span>сума <b>{moneyShort(totals.sum)}&nbsp;₴</b></span>
                <span className="orl-sep" />
                <span>оплачено <b className="orl-ink-green">{moneyShort(totals.paid)}&nbsp;₴</b></span>
              </>
            )}
          </div>
        </div>

        <div className="orl-stats" role="group" aria-label="Статуси замовлень">
          {STATUSES.map(s => {
            const v = byStatus?.[s.code];
            const on = !!statuses[s.key];
            return (
              <button
                key={s.key}
                type="button"
                className={`orl-stat orl-tone-${s.tone}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                title={`${on ? 'Сховати' : 'Показати'} «${s.label}». Ctrl+клік — лише цей статус`}
                onClick={(e) => toggleStatus(s.key, e.ctrlKey || e.metaKey)}
              >
                <span className="orl-stat-top">
                  <span className="orl-stat-label">{s.label}</span>
                  <span className="orl-stat-check">{on && <FiCheck />}</span>
                </span>
                <span className="orl-stat-value">{v ? v.count.toLocaleString('uk-UA') : (byStatus ? '0' : '·')}</span>
                <span className="orl-stat-sum">{v ? `${moneyShort(v.sum)} ₴` : (byStatus ? '0 ₴' : ' ')}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ───────────── тулбар ───────────── */}
      <div className="orl-toolbar">
        <div className="orl-filter">
          <span className="orl-filter-label">Період</span>
          <div className="orl-filter-row">
            <div className="orl-seg">
              {DATE_PRESETS.map(([label, from, to]) => (
                <button
                  key={label}
                  type="button"
                  className="orl-seg-btn"
                  aria-pressed={startDate === from && endDate === to}
                  onClick={() => setPeriod(from, to)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="orl-dates">
              <DatePicker value={startDate} onChange={setStartDate} />
              <span className="orl-dates-arrow">→</span>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
        </div>

        {isStaff && (
          <>
            <div className="orl-filter">
              <span className="orl-filter-label">Стан оплати</span>
              <div className="orl-seg">
                {PAY_STATUS_ITEMS.map(([key, label, tone]) => (
                  <button
                    key={key}
                    type="button"
                    className={`orl-seg-btn orl-tone-${tone}`}
                    aria-pressed={!isAllOn(payments) && !!payments[key]}
                    onClick={() => pickIn(setPayments)(key)}
                  >
                    <span className="orl-seg-dot" />{label}
                  </button>
                ))}
              </div>
            </div>

            <div className="orl-filter">
              <span className="orl-filter-label">Спосіб оплати</span>
              <div className="orl-seg">
                {PAY_METHOD_ITEMS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="orl-seg-btn"
                    aria-pressed={!isAllOn(paymentsType) && !!paymentsType[key]}
                    onClick={() => pickIn(setPaymentsType)(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="orl-toolbar-end">
          {search && (
            <span className="orl-search-chip" title="Пошук — у нижньому полі біля сповіщень">
              <FiSearch />
              <span className="orl-search-text">«{search}»</span>
              <button type="button" className="orl-icon-btn" title="Очистити пошук" onClick={() => dispatch(searchChange(""))}>
                <FiX />
              </button>
            </span>
          )}
          {filtersChanged && (
            <button type="button" className="orl-text-btn" onClick={resetFilters}>
              <FiX /> Скинути фільтри
            </button>
          )}
        </div>
      </div>

      {/* ───────────── панель обʼєднання ───────────── */}
      {canMerge && selectedIds.length > 0 && (
        <div className="orl-merge">
          <span className="orl-merge-count">
            Вибрано <b>{selectedIds.length}</b>
            {selectionClientName && <> · {selectionClientName}</>}
          </span>
          <span className="orl-merge-sum">
            {money(selectedOrders.reduce((acc, o) => acc + (parseFloat(o.allPrice) || 0), 0))}&nbsp;₴
          </span>
          <span className="orl-merge-hint">
            {mixedClients
              ? `Клієнти різні — нове замовлення оформиться на ${selectionClientName}`
              : 'Однакові позиції зіллються, ціна перерахується за сумарним тиражем'}
          </span>
          <div className="orl-merge-actions">
            <button
              type="button"
              className="orl-btn orl-btn--primary"
              disabled={selectedIds.length < 2}
              title={selectedIds.length < 2 ? 'Виберіть щонайменше два замовлення' : 'Обʼєднати вибрані замовлення'}
              onClick={() => setShowMergeModal(true)}
            >
              Обʼєднати
            </button>
            <button type="button" className="orl-btn" onClick={() => setSelectedIds([])}>Зняти вибір</button>
          </div>
        </div>
      )}

      {error && (
        <div className="orl-alert">
          Не вдалося завантажити замовлення: {error}
          <button type="button" className="orl-text-btn" onClick={() => setReloadKey(k => k + 1)}>Повторити</button>
        </div>
      )}

      {/* ───────────── таблиця ───────────── */}
      <div className={`orl-table${loading ? ' is-loading' : ''}`}>
        <div className="orl-progress" aria-hidden={!loading} />

        <div className="orl-thead">
          <div className="orl-th orl-th--check">
            {canMerge && (
              <input
                type="checkbox"
                className="orl-check"
                checked={allSelectedOnPage}
                onChange={toggleSelectAll}
                title="Вибрати всі придатні замовлення на сторінці"
              />
            )}
          </div>
          <SortHead col="id">№ · Дата</SortHead>
          <SortHead col="status">Статус</SortHead>
          <div className="orl-th">Клієнт</div>
          <div className="orl-th orl-col-phone">Телефон</div>
          <div className="orl-th">Оплата</div>
          <SortHead col="allPrice" align="right">Сума</SortHead>
          <SortHead col="deadline" className="orl-col-due">Дедлайн</SortHead>
          <div className="orl-th orl-col-ship">
            <button type="button" className="orl-th-link" title="Лог Uklon Delivery" onClick={() => navigate('/uklon-log')}>Доставка</button>
          </div>
          <div className="orl-th orl-th--right">Дії</div>
        </div>

        {rows.length === 0 && !loading && (
          <div className="orl-empty">
            <div className="orl-empty-title">Нічого не знайдено</div>
            <div className="orl-empty-text">Спробуйте змінити період, статуси чи пошуковий запит.</div>
            {filtersChanged && (
              <button type="button" className="orl-btn" onClick={resetFilters}>Скинути фільтри</button>
            )}
          </div>
        )}

        {rows.map(order => {
          const isExpanded  = expandedOrderId === order.id;
          const isSelected  = selectedIds.includes(order.id);
          const blockReason = mergeBlockReason(order);
          const status      = STATUS_BY_CODE[String(order.status)] || STATUS_BY_CODE['0'];
          const client      = order.client;
          const company     = client?.Company?.companyName || client?.company || '';
          const price       = parseFloat(order.allPrice) || 0;
          const disc        = pct(client?.discount);
          const tgUser      = telegramUser(client?.telegram);
          const waybills    = order.Waybills || [];

          return (
            <div key={order.id} className={`orl-item${isExpanded ? ' is-open' : ''}`}>
              <div
                className={`orl-row orl-tone-${status.tone}${isSelected ? ' is-selected' : ''}${String(order.status) === '-1' || String(order.status) === '5' ? ' is-dim' : ''}`}
                onClick={() => setExpandedOrderId(prev => (prev === order.id ? null : order.id))}
                onDoubleClick={() => navigate(`/Orders/${order.id}`)}
                title="Клік — деталі, подвійний клік — відкрити замовлення"
              >
                <div className="orl-td orl-td--check" onClick={stop} onDoubleClick={stop}>
                  {canMerge && (
                    <input
                      type="checkbox"
                      className="orl-check"
                      checked={isSelected}
                      disabled={!!blockReason && !isSelected}
                      onChange={() => toggleSelect(order)}
                      title={blockReason || 'Вибрати для обʼєднання'}
                    />
                  )}
                </div>

                <div className="orl-td orl-td--id">
                  <Link to={`/Orders/${order.id}`} className="orl-id" onClick={stop}><span className="orl-id-sign">№</span>{order.id}</Link>
                  <span className="orl-meta">{fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}</span>
                </div>

                <div className="orl-td orl-td--status"><StatusPill status={order.status} /></div>

                <div className="orl-td orl-td--client">
                  <ClientAvatar client={client} />
                  <div className="orl-client">
                    <span className="orl-client-name">
                      <span className="orl-ellipsis">{clientName(client) || 'Без клієнта'}</span>
                      {tgUser && (
                        <a
                          className="orl-tg"
                          href={`https://t.me/${tgUser}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`@${tgUser}`}
                          onClick={stop}
                        >
                          <FaTelegramPlane />
                        </a>
                      )}
                    </span>
                    <span className="orl-meta orl-ellipsis">
                      {company || 'Приватна особа'}
                      {client?.id ? <span className="orl-cid"> · #{client.id}</span> : null}
                    </span>
                  </div>
                </div>

                <div className="orl-td orl-col-phone">
                  {client?.phoneNumber
                    ? <a className="orl-phone" href={telHref(client.phoneNumber)} onClick={stop}>{client.phoneNumber}</a>
                    : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--pay"><PayPill order={order} /></div>

                <div className="orl-td orl-td--sum">
                  <span className={`orl-sum${price ? '' : ' is-zero'}`}>{money(price)}&nbsp;₴</span>
                  {disc > 0 && <span className="orl-disc">−{disc}%</span>}
                </div>

                <div className="orl-td orl-td--due orl-col-due"><DeadlineCell order={order} /></div>

                <div className="orl-td orl-col-ship orl-td--ship" onClick={stop} onDoubleClick={stop}>
                  <UklonMark order={order} onOpen={() => navigate(`/uklon-log?orderId=${order.id}`)} />
                  {waybills.map(w => (
                    <span key={w.id} className="orl-ttn">
                      <button
                        type="button"
                        className="orl-ship"
                        title={`ТТН Нової Пошти · доставка ${w.estimatedDeliveryDate || '—'} · ${w.costOnSite || '—'} грн — завантажити PDF`}
                        onClick={() => downloadPdf(`/novaposhta/print/${w.ref}`, `TTN_${w.intDocNumber}.pdf`, 'Помилка завантаження ТТН')}
                      >
                        <span className="orl-np">НП</span>
                        <span className="orl-ttn-num">{w.intDocNumber}</span>
                      </button>
                      <button
                        type="button"
                        className="orl-icon-btn orl-icon-btn--sm"
                        title="Наліпка 100×100 мм"
                        onClick={() => downloadPdf(`/novaposhta/print-sticker/${w.ref}`, `Sticker_${w.intDocNumber}.pdf`, 'Помилка завантаження наліпки')}
                      >
                        <FiPrinter />
                      </button>
                    </span>
                  ))}
                  {!waybills.length && !(order.uklonData && order.uklonData !== 'null' && order.uklonData !== '{}') && (
                    <span className="orl-dash">—</span>
                  )}
                </div>

                <div className="orl-td orl-td--actions" onClick={stop} onDoubleClick={stop}>
                  <Link to={`/Orders/${order.id}`} className="orl-icon-btn" title="Відкрити замовлення">
                    <FiArrowUpRight />
                  </Link>
                  <button type="button" className="orl-icon-btn" title="Дублювати замовлення" onClick={e => handleDuplicate(e, order.id)}>
                    <FiCopy />
                  </button>
                  <button
                    type="button"
                    className={`orl-icon-btn${printingId === order.id ? ' is-busy' : ''}`}
                    title={`Друк наліпки зі штрих-кодом ORD${order.id}`}
                    onClick={e => handlePrint(e, order)}
                  >
                    <FiPrinter />
                  </button>
                  <button
                    type="button"
                    className={`orl-icon-btn orl-chevron${isExpanded ? ' is-open' : ''}`}
                    title={isExpanded ? 'Згорнути' : 'Деталі'}
                    onClick={() => setExpandedOrderId(prev => (prev === order.id ? null : order.id))}
                  >
                    <FiChevronDown />
                  </button>
                </div>
              </div>

              {/* ───────────── розгорнуті деталі ───────────── */}
              {isExpanded && (
                <div className={`orl-detail orl-tone-${status.tone}`} onClick={stop}>
                  <div className="orl-detail-grid">
                    <section className="orl-card">
                      <div className="orl-card-title">Хронологія</div>
                      <dl className="orl-fields">
                        <dt>Створено</dt><dd>{fmtDateTime(order.createdAt)}</dd>
                        <dt>Оновлено</dt><dd>{fmtDateTime(order.updatedAt)}</dd>
                        <dt>Початок виготовлення</dt><dd>{fmtDateTime(order.manufacturingStartTime)}</dd>
                        <dt>Час виготовлення</dt>
                        <dd>
                          {order.finalManufacturingTime && typeof order.finalManufacturingTime === 'object'
                            ? `${order.finalManufacturingTime.days}д ${order.finalManufacturingTime.hours}год ${order.finalManufacturingTime.minutes}хв`
                            : order.manufacturingStartTime ? 'В процесі' : '—'}
                        </dd>
                        <dt>Дедлайн</dt><dd>{fmtDateTime(resolveDeadline(order))}</dd>
                        <dt>Виконавець</dt><dd>{order.executor ? clientName(order.executor) : '—'}</dd>
                      </dl>
                    </section>

                    <section className="orl-card">
                      <div className="orl-card-title">Клієнт</div>
                      <div className="orl-detail-client">
                        <ClientAvatar client={client} size={44} />
                        <div className="orl-client">
                          <span className="orl-client-name">{clientName(client) || 'Без клієнта'}</span>
                          <span className="orl-meta">{company || 'Приватна особа'}</span>
                        </div>
                      </div>
                      <dl className="orl-fields">
                        <dt>Телефон</dt>
                        <dd>{client?.phoneNumber ? <a className="orl-phone" href={telHref(client.phoneNumber)}><FiPhone /> {client.phoneNumber}</a> : '—'}</dd>
                        <dt>Email</dt><dd>{client?.email || '—'}</dd>
                        <dt>Telegram</dt>
                        <dd>{tgUser ? <a className="orl-phone" href={`https://t.me/${tgUser}`} target="_blank" rel="noopener noreferrer"><FaTelegramPlane /> @{tgUser}</a> : '—'}</dd>
                        <dt>Знижка</dt><dd>{disc ? `${disc}%` : '—'}</dd>
                      </dl>
                    </section>

                    <section className="orl-card orl-card--units">
                      <div className="orl-card-title">
                        Позиції <span className="orl-card-count">{order.OrderUnits?.length || 0}</span>
                      </div>
                      {order.OrderUnits?.length ? (
                        <div className="orl-units">
                          {order.OrderUnits.map((unit, i) => (
                            <div key={unit.id || i} className="orl-unit">
                              <span className="orl-unit-name orl-ellipsis" title={unit.name}>{unit.name || 'Без назви'}</span>
                              <span className="orl-unit-meta">
                                {unit.newField5 ? `${unit.newField5} шт` : ''}
                                {unit.newField2 && unit.newField3 ? ` · ${unit.newField2}×${unit.newField3} мм` : ''}
                              </span>
                              <span className="orl-unit-price">{money(unit.priceForThis)}&nbsp;₴</span>
                            </div>
                          ))}
                          <div className="orl-unit orl-unit--total">
                            <span className="orl-unit-name">Разом</span>
                            <span className="orl-unit-meta" />
                            <span className="orl-unit-price">{money(price)}&nbsp;₴</span>
                          </div>
                        </div>
                      ) : (
                        <div className="orl-muted">У замовленні ще немає позицій</div>
                      )}
                    </section>
                  </div>

                  {currentUser?.role !== 'user' && (
                    <div className="orl-margin"><OrderMarginPanel orderId={order.id} /></div>
                  )}

                  <div className="orl-detail-foot">
                    <Link to={`/Orders/${order.id}`} className="orl-btn orl-btn--primary">
                      <FiArrowUpRight /> Відкрити замовлення
                    </Link>
                    <button type="button" className="orl-btn" onClick={e => handleDuplicate(e, order.id)}>
                      <FiCopy /> Дублювати
                    </button>
                    <div className="orl-detail-barcode" title="Клік — надрукувати наліпку">
                      <BarcodeLabel type="order" data={order} variant="compact" />
                      <span className="orl-meta">ORD{order.id}</span>
                    </div>
                    <button type="button" className="orl-btn orl-btn--danger" onClick={() => handleDelete(order)}>
                      <FiTrash2 /> Видалити
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ───────────── пагінація ───────────── */}
      <Pager total={total} page={currentPage} limit={limit} onPage={setCurrentPage} onLimit={setLimit} noun="замовлень" />

      <ModalMergeOrders
        show={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        orders={selectedOrders}
        onMerged={handleMerged}
      />

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url="/orders"
      />
    </div>
  );
};

export default CustomOrderTable2;
