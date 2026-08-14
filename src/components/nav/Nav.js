import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
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

/* ──────────────────────────────────────────────────────────────
   Навбар після переїзду керування в панель швидкого доступу
   (components/dock/PPDock.jsx). Тут лишились тільки:
     • пошук замовлень (у доку його немає);
     • правий кут — каса/зміна, ім'я користувача, роль;
     • дзвоник сповіщень, перенесений праворуч від правого кута.

   Навігація, теми, «Нове замовлення», Нова Пошта, Uklon, Telegram,
   налаштування й вихід тепер живуть у доку.
   ────────────────────────────────────────────────────────────── */

/* Бік навбару — як і розкладка «Пуску», належить конкретному акаунту:
   за одним браузером працюють різні люди. */
const NAV_POSITION_KEY = 'printpeaks_nav_position';
const navPositionKeyFor = (userId) => (userId ? `${NAV_POSITION_KEY}:${userId}` : NAV_POSITION_KEY);

const loadNavPosition = (userId) => {
  try {
    return localStorage.getItem(navPositionKeyFor(userId)) === 'bottom' ? 'bottom' : 'top';
  } catch {
    return 'top';
  }
};

const Nav = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const navigate = useNavigate();
  const onOrderPage = /^\/Orders\/[^/]+/.test(location.pathname);
  const [fileSearch, setFileSearch] = useState("");

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

  const toggleNavPosition = () => {
    const next = navPosition === 'bottom' ? 'top' : 'bottom';
    try { localStorage.setItem(navPositionKeyFor(userId), next); } catch {}
    setNavPosition(next);
  };

  useLayoutEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const h = barRef.current?.offsetHeight || 0;
      root.style.setProperty('--pp-nav-h', `${h}px`);
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
  }, [navPosition, currentUser]);

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
    const next = e.target.value;
    if (onOrderPage) {
      setFileSearch(next);
      window.__ppFileSearchQuery = next;
      window.dispatchEvent(new CustomEvent("pp-file-search", { detail: { query: next } }));
      return;
    }
    dispatch(searchChange(next));
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
          {currentUser && onOrderPage ? null : currentUser ? (
            <div className="nav-search-wrap">
              <Form.Control
                className="buttonSkewedSearch buttonSkewedSearchLupa"
                name="search"
                type="text"
                data-barcode-ignore={onOrderPage ? "true" : undefined}
                placeholder={onOrderPage ? "\u041f\u043e\u0448\u0443\u043a \u0443 \u0444\u0430\u0439\u043b\u0430\u0445" : ""}
                value={onOrderPage ? fileSearch : search}
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
              {!onOrderPage && <SearchOrderDropdown />}
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
                правий кут дока (PPDock.jsx) — тут лишається порожньо. */}
            {currentUser.role !== 'user' && (
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
          </>
        )}

      </div>

    </div>
    </>
  )

};

export default Nav;
