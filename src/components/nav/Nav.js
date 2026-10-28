import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import "./Nav.css";
import {useDispatch} from "react-redux";
import {fetchUser} from "../../actions/authActions";
import {Form} from "react-bootstrap";
import './logo/Logo.css';
import {useNavigate} from "react-router-dom";
import PopupLeftNotification from "./PopupLeftNotification";
import {searchChange} from "../../actions/searchAction";
import {openDrawer} from "../../telegram/telegramSlice";
import BarcodeScannerListener from "../../PrintPeaksFAinal/barcode/BarcodeScannerListener";
import SearchOrderDropdown from "./SearchOrderDropdown";
import NavOrderHead from "./NavOrderHead";
import { DEFAULT_NAV_POSITION, isPanelPosition, readNavChoice, saveNavChoice } from "../dock/panelPositions";

/* ──────────────────────────────────────────────────────────────
   Навбар після переїзду керування в панель швидкого доступу
   (components/dock/PPDock.jsx). Тут лишились тільки:
     • пошук замовлень (у доку його немає);
     • правий кут — каса/зміна, ім'я користувача, роль;
     • дзвоник сповіщень, перенесений праворуч від правого кута.

   Навігація, теми, «Нове замовлення», Нова Пошта, Uklon, Telegram,
   налаштування й вихід тепер живуть у доку.
   ────────────────────────────────────────────────────────────── */

/* Бік навбару (рядка наряду) належить акаунту: за замовчуванням знизу,
   явний вибір їде на сервер разом із розкладкою дока і повертається
   звідти при вході з будь-якого браузера (див. dock/panelPositions.js). */
const loadNavPosition = (userId) => readNavChoice(userId) || DEFAULT_NAV_POSITION;

/* На широкому екрані дзвоник і перемикач «вгору/вниз» живуть у правому
   куті дока, поруч з іменем користувача (PPDock.jsx), — там зібране все
   «моє». На вузькому док стискається до іконок, і кут там тісний, тож
   дзвоник лишається в першому рядку навбару, як і було. Межа та сама,
   що й у PPDock.jsx (CORNER_BELL_MIN). */
const WIDE_NAV_QUERY = '(min-width: 1201px)';

const Nav = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const navigate = useNavigate();
  const onOrderPage = /^\/Orders\/[^/]+/.test(location.pathname);

  const handleClick = () => {
    navigate("/login");
  };

  /* ── Навбар зверху або знизу ──
     Знизу він стає fixed і стоїть над «Пуском», а body отримує відступ на
     його висоту (--pp-nav-h), щоб нічого не перекривати. Той самий клас
     на body читає вікно вибору клієнта — воно теж переїжджає вниз. */
  const userId = currentUser?.id;
  const [navPosition, setNavPosition] = useState(() => loadNavPosition(userId));
  const barRef = useRef(null);

  useEffect(() => { setNavPosition(loadNavPosition(userId)); }, [userId]);

  const navPositionRef = useRef(navPosition);
  navPositionRef.current = navPosition;

  /* Перемикання — явний вибір акаунта: кеш у браузері, а на сервер його
     несе PPDock.jsx (він володіє записом dock_layout, куди кладеться й
     бік навбару, — один запис замість двох, що затирали б один одного). */
  const toggleNavPosition = useCallback(() => {
    const next = navPositionRef.current === 'bottom' ? 'top' : 'bottom';
    saveNavChoice(userId, next);
    setNavPosition(next);
    window.dispatchEvent(new CustomEvent('pp-nav-position-chosen', { detail: { position: next, userId } }));
  }, [userId]);

  // вибір, збережений на сервері (інший браузер, новий вхід) — приносить PPDock
  useEffect(() => {
    const onSet = (e) => {
      const { position, userId: who } = e.detail || {};
      if (isPanelPosition(position) && who === userId) setNavPosition(position);
    };
    window.addEventListener('pp-set-nav-position', onSet);
    return () => window.removeEventListener('pp-set-nav-position', onSet);
  }, [userId]);

  // перемикач у меню користувача (кут дока) шле подію, а не тягне стан
  useEffect(() => {
    window.addEventListener('pp-toggle-nav-position', toggleNavPosition);
    return () => window.removeEventListener('pp-toggle-nav-position', toggleNavPosition);
  }, [toggleNavPosition]);

  const [wideNav, setWideNav] = useState(() => window.matchMedia(WIDE_NAV_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_NAV_QUERY);
    const onChange = () => setWideNav(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const h = barRef.current?.offsetHeight || 0;
      if (h) root.style.setProperty('--pp-nav-h', `${h}px`);
    };
    apply();
    document.body.classList.toggle('pp-nav-bottom', navPosition === 'bottom');
    // бічна панель «Пуску» рахує свою висоту з огляду на навбар — хай
    // перерахується одразу, а не аж після ресайзу вікна
    window.dispatchEvent(new CustomEvent('pp-nav-moved', { detail: { navPosition } }));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    if (ro && barRef.current) ro.observe(barRef.current);
    window.addEventListener('resize', apply);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', apply);
    };
    /* location.pathname у залежностях обов'язковий: на /login навбар
       повертає null, тож barRef порожній і ResizeObserver нема до чого
       чіпляти. Після входу перехід на наряд — це SPA-навігація, під час
       якої ані navPosition, ані currentUser уже не змінюються, і без
       цього ефект не перезапускався: --pp-nav-h лишався від сторінки
       логіну, а сторінка наряду рахує з нього свою висоту — звідси
       «поламаний до F5» вигляд. */
  }, [navPosition, currentUser, location.pathname]);

  useEffect(() => () => {
    document.body.classList.remove('pp-nav-bottom');
    document.documentElement.style.removeProperty('--pp-nav-h');
  }, []);

  useEffect(() => {
    const handler = () => dispatch(openDrawer());
    window.addEventListener("open-telegram", handler);
    return () => window.removeEventListener("open-telegram", handler);
  }, []);

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  const handleSearchChange = (e) => {
    // і на сторінці наряду це пошук замовлень (номери попередніх) — файли шукають у самій панелі файлів
    dispatch(searchChange(e.target.value));
  };

  if (location.pathname === '/login') return null;

  return (
    <>
    <BarcodeScannerListener />
    <div style={{marginTop: '0'}}>

      <div className="nav-bar-row"
           ref={barRef}
           style={{borderRadius: '0vh', marginBottom: '0vh'}}>

        {/* ── Номер наряду + візитівка клієнта з діями. Компонент бере
               останній відкритий наряд зі знімка й працює на всіх сторінках. ── */}
        {currentUser && <NavOrderHead />}

        {/* ── Пошук: компактне поле праворуч, розкривається при фокусі.
               На сторінці наряду його немає — пошук файлів переїхав у саму
               панель файлів (ClientFilesPanel), на місце колишнього
               підпису «Файли клієнта №N». ── */}
        <div className="nav-center-group nav-search-slot">
          {currentUser ? (
            <div className="nav-search-wrap">
              <Form.Control
                className="buttonSkewedSearch buttonSkewedSearchLupa"
                name="search"
                type="text"
                placeholder={onOrderPage ? "Пошук замовлень" : ""}
                value={search}
                style={{borderRadius: '0', height: "100%", zIndex: "0"}}
                onChange={(e) => { handleSearchChange(e) }}
              />
              <span className="nav-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 22L20 20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <SearchOrderDropdown />
            </div>
          ) : (
            <button
              onClick={handleClick}
              className="adminButtonAddNav buttonSkewedOrderClient"
              style={{
                background: 'var(--admingreen, #0e935b)',
                border: 'none',
                borderRadius: '0',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Логін
            </button>
          )}
        </div>

        {/* ── Правий кут: стан касової зміни + підпис, хто залогінений —
               три рядки (зміна / аккаунт / права) заввишки як кнопки
               навбару. Дзвоник сповіщень — одразу праворуч від них. ── */}
        {currentUser && (
          <>
            {/* Стан касової зміни й підпис «хто залогінений» переїхали в
                правий кут дока (PPDock.jsx), а на широкому екрані — і
                дзвоник зі стрілкою (див. WIDE_NAV_QUERY). */}
            {currentUser.role !== 'user' && !wideNav && (
              <div className="nav-right-controls nav-notify-corner">
                <div className="nav-ctrl-btn-wrap">
                  <PopupLeftNotification/>
                </div>
                {/* стрілка: перекинути навбар униз / повернути наверх */}
                <button
                  type="button"
                  className="nav-move-btn"
                  onClick={toggleNavPosition}
                  title={navPosition === 'bottom' ? 'Перемістити навбар наверх' : 'Перемістити навбар вниз'}
                  aria-label={navPosition === 'bottom' ? 'Перемістити навбар наверх' : 'Перемістити навбар вниз'}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {navPosition === 'bottom'
                      ? <path d="M12 19V5M6 11l6-6 6 6"/>
                      : <path d="M12 5v14M6 13l6 6 6-6"/>}
                  </svg>
                </button>
              </div>
            )}

            {/* Кут «моє» (дзвоник, каса, ім'я з меню) — його порталить сюди
                PPDock.jsx на широкому екрані: рядок наряду тоді читається
                як звична шапка — з чим працюю ліворуч, хто я праворуч, — а
                док лишається самою навігацією. На вузькому слот порожній. */}
            <div className="nav-corner-slot" id="pp-nav-corner-slot" />
          </>
        )}

      </div>

    </div>
    </>
  )

};

export default Nav;
