import React, {useEffect} from "react";
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
import NavShiftButton from "./NavShiftButton";
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

const ROLE_LABELS = {
  admin: 'Адміністратор',
  manager: 'Менеджер',
  operator: 'Оператор',
  user: 'Клієнт',
};

const Nav = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  useEffect(() => {
    const handler = () => dispatch(openDrawer());
    window.addEventListener("open-telegram", handler);
    return () => window.removeEventListener("open-telegram", handler);
  }, []);

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  const handleSearchChange = (e) => {
    dispatch(searchChange(e.target.value))
  };

  // Хто зараз залогінений — напівпрозорий підпис під навбаром
  const userDisplayName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ')
    || currentUser?.familyName
    || currentUser?.username
    || currentUser?.email
    || currentUser?.phoneNumber
    || '';
  const userRoleLabel = ROLE_LABELS[currentUser?.role] || currentUser?.role || '';

  if (location.pathname === '/login') return null;

  return (
    <>
    <BarcodeScannerListener />
    <div style={{marginTop: '0'}}>

      <div className="nav-bar-row"
           style={{borderRadius: '0vh', marginBottom: '0vh'}}>

        {/* ── Номер наряду + візитівка клієнта з діями. Компонент бере
               останній відкритий наряд зі знімка й працює на всіх сторінках. ── */}
        {currentUser && <NavOrderHead />}

        {/* ── Пошук: компактне поле праворуч, розкривається при фокусі ── */}
        <div className="nav-center-group nav-search-slot">
          {currentUser ? (
            <div className="nav-search-wrap">
              <Form.Control
                className="buttonSkewedSearch buttonSkewedSearchLupa"
                name="search"
                type="text"
                placeholder=""
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
            <div className="nav-user-corner">
              <NavShiftButton />
              {userDisplayName && (
                <span className="nav-user-badge-name" title={`Ви увійшли як ${userDisplayName}`}>
                  {userDisplayName}
                </span>
              )}
              {userRoleLabel && <span className="nav-user-badge-role">{userRoleLabel}</span>}
            </div>

            {currentUser.role !== 'user' && (
              <div className="nav-right-controls nav-notify-corner">
                <div className="nav-ctrl-btn-wrap">
                  <PopupLeftNotification/>
                </div>
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
