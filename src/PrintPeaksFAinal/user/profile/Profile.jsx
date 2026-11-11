import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import ContrAgentsInUserProfile from '../profile/ContrAgentsInUserProfile';
import './ProfileNew.css';
import './ProfileSettings.css';
import PaysInOrderRestoredForAdmin from "../../userInNewUiArtem/pays/PaysInOrderRestoredForAdmin";
import UserPageDetailsSelf from "./UserPageDetailsSelf";
import Cash from "../../checkbox/CashCash/Cash";
import CodesOffline from "../../checkbox/codesOffline/CodesOffline";
import PrivatBankAccounts from "./PrivatBankAccounts";
import Graph2DForBD from "../../Graph2DForBD";
import Shifts from "../../checkbox/shifts/Shifts";
import DesignSettings from "./DesignSettings";
import InterfaceSettings from "./InterfaceSettings";
import NiimbotSettings from "./NiimbotSettings";
import NovaPoshtaSettings from "./NovaPoshtaSettings";
import UklonSettings from "./UklonSettings";
import FileSettings from "./FileSettings";
import "./NiimbotSettings.css";

/* Остання відкрита вкладка — щоб модалка відкривалась там, де її закрили */
const TAB_STORAGE_KEY = 'printpeaks_profile_settings_tab';

/* Лінійні іконки 24×24, колір — currentColor */
const ICONS = {
  design: <><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/><path d="M12 21a2.5 2.5 0 0 1 0-5h2a3 3 0 0 0 3-3"/></>,
  calc: <><rect x="5" y="3" width="14" height="18"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/></>,
  barcode: <><path d="M4 5v14M7 5v14M10 5v14M14 5v14M16 5v14M20 5v14"/></>,
  parcel: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></>,
  car: <><path d="M5 16h14v-4l-2-5H7l-2 5z"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><path d="M5 12h14"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></>,
  people: <><circle cx="9" cy="9" r="3.2"/><path d="M3 20c.7-3.2 3.2-5 6-5s5.3 1.8 6 5"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M18 15c1.6.6 2.7 2.2 3 5"/></>,
  bank: <><path d="M3 9l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></>,
  register: <><rect x="4" y="9" width="16" height="11"/><path d="M7 9V4h10v5M8 13h2M12 13h2M16 13h0M8 16h8"/></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  card: <><rect x="3" y="6" width="18" height="13"/><path d="M3 10h18M7 15h4"/></>,
  graph: <><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="7" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M8 7l8 .5M7 8l4 8M17 9l-4 7"/></>,
  folder: <><path d="M3 6h7l2 2h9v11H3z"/><path d="M3 10h18"/></>,
};

const Icon = ({name}) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

/* Розділи модалки. `frame`: card — вміст у рамці-картці (старі таблиці
   з власною версткою), bleed — на всю площу без відступів (граф бази),
   за замовчуванням вкладка сама складається з карток. */
const GROUPS = [
  {
    id: 'workspace',
    title: 'Робоче місце',
    items: [
      {id: 'design', label: 'Дизайн', icon: 'design',
        desc: 'Тема оформлення, кольори інтерфейсу, розміри шрифтів і відкриття папок файлів.',
        render: () => <DesignSettings/>},
      {id: 'interface', label: 'Калькулятори', icon: 'calc',
        desc: 'Порядок матеріалів у списках, бліди між виробами й поля друку — усе, що впливає на розкладку й ціну.',
        render: () => <InterfaceSettings/>},
    ],
  },
  {
    id: 'devices',
    title: 'Пристрої й доставка',
    items: [
      {id: 'niimbot', label: 'Штрих-код', icon: 'barcode',
        desc: 'Принтер етикеток у мережі та BLE-сканер штрих-кодів.',
        render: () => <NiimbotSettings/>},
      {id: 'novaposhta', label: 'Нова Пошта', icon: 'parcel',
        desc: 'Ключ API, збережені адреси відправника й одержувачів, принтер наліпок ТТН.',
        render: () => <NovaPoshtaSettings/>},
      {id: 'uklon', label: 'Уклон', icon: 'car',
        desc: 'API і webhook Uklon, адреса забору та параметри доставки за замовчуванням.',
        render: () => <UklonSettings/>},
    ],
  },
  {
    id: 'account',
    title: 'Акаунт',
    items: [
      {id: 'profile', label: 'Основна інформація', icon: 'user',
        desc: 'Ваші контакти, знижка й компанія, до якої привʼязаний акаунт.',
        render: (user) => <UserPageDetailsSelf thisUser={user}/>, frame: 'card'},
      {id: 'counterparties', label: 'Контрагенти', icon: 'people',
        desc: 'Контрагенти, привʼязані до вашого акаунта.',
        render: (user) => <ContrAgentsInUserProfile user={user}/>, frame: 'card'},
      {id: 'counterpartiesAdmin', label: 'Реквізити', icon: 'bank',
        desc: 'Власні юрособи й ФОП, з яких виставляються рахунки: система оподаткування, ПДВ.',
        render: (user) => <PaysInOrderRestoredForAdmin user={user}/>, frame: 'card'},
    ],
  },
  {
    id: 'checkbox',
    title: 'Checkbox · ПРРО',
    items: [
      {id: 'Cashs', label: 'Каси', icon: 'register',
        desc: 'Каси Checkbox, привʼязані до акаунта.',
        render: () => <Cash/>, frame: 'card'},
      {id: 'OfflineCodes', label: 'Офлайн фіск. коди', icon: 'receipt',
        desc: 'Запас фіскальних кодів для роботи каси без звʼязку з ДПС.',
        render: () => <CodesOffline/>, frame: 'card'},
      {id: 'зміни', label: 'Зміни', icon: 'clock', admin: true,
        desc: 'Касові зміни: відкриття, закриття і Z-звіти.',
        render: () => <Shifts/>, frame: 'card'},
    ],
  },
  {
    id: 'admin',
    title: 'Адміністрування',
    items: [
      {id: 'payments', label: 'Оплати', icon: 'card', admin: true,
        desc: 'Акаунти PrivatBank (Автоклієнт) для автоматичної звірки оплат.',
        render: () => <PrivatBankAccounts/>, frame: 'card'},
      {id: 'база', label: 'База', icon: 'graph', admin: true,
        desc: 'Граф звʼязків між таблицями бази, експорт та імпорт даних.',
        render: () => <Graph2DForBD/>, frame: 'bleed'},
      {id: 'files', label: 'Файли', icon: 'folder', admin: true,
        desc: 'Місця збереження файлів, файли витрат і локальний бекап.',
        render: () => <FileSettings/>},
    ],
  },
];

function readStoredTab() {
  try { return localStorage.getItem(TAB_STORAGE_KEY) || 'design'; } catch (e) { return 'design'; }
}

function ClientUserProfile() {
  const thisUser = useSelector(state => state.auth.user);
  const isAdmin = thisUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState(readStoredTab);

  // Групи з розділами, доступними цьому користувачу
  const groups = useMemo(() => GROUPS
    .map(g => ({...g, items: g.items.filter(it => !it.admin || isAdmin)}))
    .filter(g => g.items.length > 0), [isAdmin]);

  const allItems = useMemo(() => groups.flatMap(g => g.items.map(it => ({...it, group: g.title}))), [groups]);
  const current = allItems.find(it => it.id === activeTab) || allItems[0];

  const navRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(TAB_STORAGE_KEY, current.id); } catch (e) { /* приватний режим */ }
    // на вузькому екрані меню — горизонтальна стрічка: активний пункт тримаємо в полі зору
    const btn = navRef.current?.querySelector('.pps-nav-item.is-active');
    if (btn && typeof btn.scrollIntoView === 'function') btn.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }, [current.id]);

  if (!thisUser) return <div className="pp-loading">Користувач не знайдений</div>;

  const frame = current.frame || 'plain';

  return (
    <div className="pps">
      <nav className="pps-nav" aria-label="Розділи налаштувань" ref={navRef}>
        {groups.map(g => (
          <div className="pps-nav-group" key={g.id}>
            <div className="pps-nav-group-title">{g.title}</div>
            {g.items.map(it => (
              <button
                key={it.id}
                type="button"
                className={`pps-nav-item${it.id === current.id ? ' is-active' : ''}`}
                aria-current={it.id === current.id ? 'page' : undefined}
                onClick={() => setActiveTab(it.id)}
              >
                <span className="pps-nav-icon"><Icon name={it.icon}/></span>
                <span className="pps-nav-label">{it.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <main className={`pps-main pps-main--${frame}`}>
        <header className="pps-head">
          <div className="pps-head-eyebrow">{current.group}</div>
          <h2 className="pps-head-title">{current.label}</h2>
          <p className="pps-head-desc">{current.desc}</p>
        </header>

        <div className={`pps-body pps-body--${frame}`} key={current.id}>
          {frame === 'card'
            ? <div className="pps-card pps-card--legacy">{current.render(thisUser)}</div>
            : current.render(thisUser)}
        </div>
      </main>
    </div>
  );
}

export default ClientUserProfile;
