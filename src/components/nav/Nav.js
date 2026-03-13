import React, {useEffect, useState, useRef} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import "./Nav.css";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import {FiSettings, FiLogOut} from "react-icons/fi";
import {fetchUser, logout} from "../../actions/authActions";
import {Form} from "react-bootstrap";
import './logo/Logo.css';
import AddNewOrder from "../../PrintPeaksFAinal/Orders/AddNewOrder";
import AddUserButton from "../../PrintPeaksFAinal/user/AddUserButton.jsx";
import AddCompanyButton from "../../PrintPeaksFAinal/company/AddCompanyButton.jsx";
import {useNavigate} from "react-router-dom";
import PopupLeftNotification from "./PopupLeftNotification";
import {searchChange} from "../../actions/searchAction";
import TermActiveWidget from "./TermActiveVidget";
import TelegramDrawer from "..//Telegram/TelegramDrawer";
import {openDrawer} from "../../telegram/telegramSlice";
import UserSettingsModal from "./UserSettingsModal";
import TelegramBotAkkAndMedias from "../../PrintPeaksFAinal/telegram/TelegramBotAkkAndMedias";
import NovaPoshtaCalculator from "../../PrintPeaksFAinal/novaPoshta/NovaPoshtaCalculator";
import BarcodeScannerListener from "../../PrintPeaksFAinal/barcode/BarcodeScannerListener";
import { NiimbotConnectButton, BarcodeScannerButton } from "../../PrintPeaksFAinal/barcode/BarcodeLabel";


const Nav = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const totalUnread = useSelector((s) => s.telegram.totalUnread);
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const [basicActive, setBasicActive] = useState('/');
  const [showSettings, setShowSettings] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showNPCalc, setShowNPCalc] = useState(false);
  const newOrderButtonRef = useRef(null);
  const navigate = useNavigate();
  const openTelegramDrawer = (e) => {
    e.preventDefault();
    dispatch(openDrawer());
  };

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

  useEffect(() => {
  }, [currentUser])

  useEffect(() => {
    setBasicActive(document.location.pathname);
  }, [document.location.pathname])

  const handleSearch = (searchValue) => {
    dispatch(fetchUser(searchValue))
  };

  const handleSearchChange = (e) => {
    dispatch(searchChange(e.target.value))
  };

  const handleBasicClick = (value) => {
    if (value === basicActive) {
      return;
    }
    setBasicActive(value);
  };

  let logoutt = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (location.pathname === '/login') return null;

  return (
    <>
    <BarcodeScannerListener />
    <div style={{marginTop: '0'}}>


      <div className="nav-bar-row"
           style={{borderRadius: '0vh', marginBottom: '0vh'}}>

        {/* ── Конверт 1: ЗЛІВА — Нове замовлення + Створити клієнта / компанію ── */}
        {currentUser && (
          <div className="nav-actions-group">
            <AddNewOrder/>
            {(currentUser.role === "admin" || currentUser.role === "operator") && (
              location.pathname.startsWith('/Companys')
                ? <AddCompanyButton />
                : <AddUserButton fetchUsers={() => dispatch(fetchUser())} />
            )}
          </div>
        )}

        {/* ── Конверт 2: ПО ЦЕНТРУ — Пошук + Юзер + Сповіщення + Вихід ── */}
        <div className="nav-center-group">
          {currentUser && <div className="nav-search-wrap">
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
          </div>}
          {currentUser ? (
            <>
              <div className="nav-right-controls">
                <div className="nav-ctrl-btn-wrap">
                  <button
                    className={`adminButtonAddNav nav-np-btn${showNPCalc ? ' active' : ''}`}
                    title="Нова Пошта"
                    onClick={() => setShowNPCalc(v => !v)}
                  >
                    <svg width="22" height="22" viewBox="0 0 737 729" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <path d="M375,8c2.23,2.4,5.34,2.53,8.04,4.46,13.75,9.83,35.08,35.47,48.43,48.57,28.12,27.58,56.54,55.47,84.96,83.04,3.42,4.63,5.89,11.63-1.99,12.87-17.18,2.7-40.87-1.73-58.93.07-9.58.96-16.63,6.64-17.55,16.45-3.04,32.28,2.42,69.18-.05,101.95-1.74,9.41-9.29,13.95-18.37,14.63-33.07,2.49-70.05-1.39-103.37-.72-7.52-2.95-11.36-8.88-12.16-16.84-3.13-31.22,2.8-67.6.03-99.03-.84-9.48-7.41-15.23-16.65-16.35-19.45-2.36-43.86,2.42-62.94-.06-4.88-.63-6.55-4.61-5-9.11,24.09-25.36,49.02-50.37,74.02-74.97,1.54-1.51,3.51-2.43,5.05-3.95,16.23-15.94,38.49-42.73,55.45-55.55,3.47-2.62,6.78-3.03,10.02-5.48h11Z" fill="#ee3c23"/>
                      <path d="M7,362c2-8.92,7.95-12.32,13.53-17.97,41.4-41.95,83.98-82.67,125.45-124.55,6.72-5.05,11.51-3.98,12.08,4.97v280.11c-.28,8.37-8.24,7.58-13.08,2.96L10.48,373.02l-3.48-7.02v-4Z" fill="#ee3c23"/>
                      <path d="M319.74,434.24c31.69,1.45,66.46-2.75,97.8-.28,10.73.85,19.14,4.77,20.47,16.53,3.7,32.89-2.92,72.53-.04,106.04.82,9.52,5.64,17.02,15.62,18.38,17.02,2.32,38.52-1.73,55.91.09,6.57.69,9.99,4.21,4.52,9.52l-133,133c-8.4,6.42-17.21,5.91-25.03-1.01-39.85-40.46-81-79.8-119.96-121.04-2.91-3.08-13.88-12.12-14.04-15.07-.2-3.65,3.43-5.08,6.49-5.43,18.45-2.13,41.69,2.42,59.94-.06,8.09-1.1,14.17-7.44,15.61-15.39,2.88-34.32-3.99-75.39.09-108.91,1.16-9.52,6.43-14.48,15.63-16.37Z" fill="#ee3c23"/>
                      <path d="M586.67,220.13c3.05-.99,5.13.7,7.34,2.35,14.39,10.71,33.61,34.05,47.45,47.55,26.41,25.75,54,50.76,80.05,76.95,6.4,6.43,12.32,13.44,7.98,23.03-40.14,41.27-81.6,81.92-123.03,121.97-3.87,3.74-12.93,16.54-17.94,16.05-3.74-.77-4.38-5.25-4.58-8.49l.78-277.3c.42-.9.92-1.78,1.94-2.11Z" fill="#ee3c23"/>
                    </svg>
                  </button>
                </div>

                <PopupLeftNotification/>

                <div className="nav-ctrl-btn-wrap">
                  <button
                    className={`buttonSkewedOrder nav-telegram-btn${showTelegram ? ' active' : ''}`}
                    title="Telegram"
                    onClick={() => setShowTelegram(v => !v)}
                  >
                    <span>
                      <svg width="22" height="22" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="tg-grad" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#37AEE2"/>
                            <stop offset="1" stopColor="#1E96C8"/>
                          </linearGradient>
                        </defs>
                        <circle cx="120" cy="120" r="120" fill="url(#tg-grad)"/>
                        <path d="M98 175c-3.888 0-3.227-1.468-4.568-5.17L82 132.207 170 80" fill="#C8DAEA"/>
                        <path d="M98 175c3 0 4.325-1.372 6-3l16-15.558-19.958-12.035" fill="#A9C9DD"/>
                        <path d="M100.04 144.41l48.36 35.729c5.519 3.045 9.501 1.468 10.876-5.123l19.685-92.763c2.015-8.08-3.08-11.746-8.36-9.349l-115.59 44.571c-7.89 3.165-7.844 7.567-1.438 9.528l29.663 9.259 68.673-43.325c3.242-1.966 6.218-.91 3.776 1.258" fill="#FFF"/>
                      </svg>
                    </span>
                  </button>
                </div>

                <div className="nav-ctrl-btn-wrap">
                  <NiimbotConnectButton className="adminButtonAddNav" />
                </div>

                {/* <div className="nav-ctrl-btn-wrap">
                  <BarcodeScannerButton className="adminButtonAddNav" />
                </div> */}
              </div>
            </>
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

        {/* Telegram кнопка тепер всередині nav-right-controls */}

        {/* ── Конверт 3: СПРАВА — Навігаційні посилання (Головна → Зміни) ── */}
        <>
          {currentUser?.role === "user" && (
            <div className="btnBlock flipNav navTheme-amber d-flex align-items-center">
              <nav className="btnRow">
                <NavLink to="/Desktop" className="btn">
                  <span className="flip-front">Головна</span>
                </NavLink>

                <NavLink to="/Orders" className="btn">
                  <span className="flip-front">Замовлення</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="7" y="4" width="10" height="16" rx="2"/>
                      <path d="M9 4V2h6v2"/>
                      <path d="M9 9h6M9 13h6M9 17h6"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Vimogi" className="btn">
                  <span className="flip-front">Вимоги</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="3" stroke="rgba(0,0,0,0.6)" width="12" height="18" rx="2"/>
                      <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(0,0,0,0.6)"/>
                    </svg>
                  </span>
                </NavLink>

                <button className="btn nav-settings-btn" onClick={() => setShowSettings(true)} title="Налаштування профілю">
                  <span className="flip-front">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82a2 2 0 1 1-2.83 2.83a1.65 1.65 0 0 0-1.82.33a1.65 1.65 0 0 0-.5 1.47a2 2 0 1 1-3.9 0a1.65 1.65 0 0 0-1.47-.5a1.65 1.65 0 0 0-1.82-.33a2 2 0 1 1-2.83-2.83a1.65 1.65 0 0 0-.33-1.82a1.65 1.65 0 0 0-1.47-.5a2 2 0 1 1 0-3.9a1.65 1.65 0 0 0 1.47-.5a1.65 1.65 0 0 0 .33-1.82a2 2 0 1 1 2.83-2.83a1.65 1.65 0 0 0 1.82-.33a1.65 1.65 0 0 0 .5-1.47a2 2 0 1 1 3.9 0a1.65 1.65 0 0 0 1.47.5a1.65 1.65 0 0 0 1.82.33a2 2 0 1 1 2.83 2.83a1.65 1.65 0 0 0 .33 1.82a1.65 1.65 0 0 0 1.47.5a2 2 0 1 1 0 3.9a1.65 1.65 0 0 0-1.47.5z"></path>
                    </svg>
                  </span>
                </button>

                <button onClick={logoutt} className="btn nav-logout-btn">
                  <span className="flip-front"><FiLogOut/></span>
                </button>
              </nav>
            </div>
          )}

          {currentUser?.role === "operator" && (
            <div className="btnBlock flipNav navTheme-amber d-flex align-items-center">
              <nav className="btnRow">
                <NavLink to="/Desktop" className="btn">
                  <span className="flip-front">Головна</span>
                </NavLink>

                <NavLink to="/Users" className="btn">
                  <span className="flip-front">Клієнти</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="7" r="3"/>
                      <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Companys" className="btn">
                  <span className="flip-front">Компанії</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 8V4h6v4"/>
                      <rect x="6" y="8" width="12" height="12" rx="1"/>
                      <path d="M9 12h2m2 0h2m-6 3h2m2 0h2"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Orders" className="btn">
                  <span className="flip-front">Замовлення</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="7" y="4" width="10" height="16" rx="2"/>
                      <path d="M9 4V2h6v2"/>
                      <path d="M9 9h6M9 13h6M9 17h6"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Storage" className="btn">
                  <span className="flip-front">Склад</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7l8 4 8-4"/>
                      <path d="M4 7v10l8 4 8-4V7"/>
                      <path d="M12 11v10"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Trello" className="btn">
                  <span className="flip-front">Завдання</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <rect x="6" y="7" width="4" height="10" rx="1"/>
                      <rect x="14" y="7" width="4" height="6" rx="1"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Vimogi" className="btn">
                  <span className="flip-front">Вимоги</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="3" stroke="rgba(0,0,0,0.6)" width="12" height="18" rx="2"/>
                      <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(0,0,0,0.6)"/>
                    </svg>
                  </span>
                </NavLink>

                <button onClick={logoutt} className="btn nav-logout-btn">
                  <span className="flip-front"><FiLogOut/></span>
                </button>
              </nav>
            </div>
          )}

          {currentUser?.role === "admin" && (
            <div className="btnBlock flipNav navTheme-amber d-flex align-items-center">
              <nav className="btnRow">
                <NavLink to="/Desktop" className="btn">
                  <span className="flip-front">Головна</span>
                </NavLink>

                <NavLink to="/Users" className="btn">
                  <span className="flip-front">Клієнти</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="7" r="3"/>
                      <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Companys" className="btn">
                  <span className="flip-front">Компанії</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 8V4h6v4"/>
                      <rect x="6" y="8" width="12" height="12" rx="1"/>
                      <path d="M9 12h2m2 0h2m-6 3h2m2 0h2"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Orders" className="btn">
                  <span className="flip-front">Замовлення</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="7" y="4" width="10" height="16" rx="2"/>
                      <path d="M9 4V2h6v2"/>
                      <path d="M9 9h6M9 13h6M9 17h6"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Storage" className="btn">
                  <span className="flip-front">Склад</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7l8 4 8-4"/>
                      <path d="M4 7v10l8 4 8-4V7"/>
                      <path d="M12 11v10"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Trello" className="btn">
                  <span className="flip-front">Завдання</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <rect x="6" y="7" width="4" height="10" rx="1"/>
                      <rect x="14" y="7" width="4" height="6" rx="1"/>
                    </svg>
                  </span>
                </NavLink>

                <NavLink to="/Vimogi" className="btn">
                  <span className="flip-front">Вимоги</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="3" stroke="rgba(0,0,0,0.6)" width="12" height="18" rx="2"/>
                      <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(0,0,0,0.6)"/>
                    </svg>
                  </span>
                </NavLink>

                <button className="btn nav-settings-btn" onClick={() => setShowSettings(true)} title="Налаштування профілю">
                  <span className="flip-front">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82a2 2 0 1 1-2.83 2.83a1.65 1.65 0 0 0-1.82.33a1.65 1.65 0 0 0-.5 1.47a2 2 0 1 1-3.9 0a1.65 1.65 0 0 0-1.47-.5a1.65 1.65 0 0 0-1.82-.33a2 2 0 1 1-2.83-2.83a1.65 1.65 0 0 0-.33-1.82a1.65 1.65 0 0 0-1.47-.5a2 2 0 1 1 0-3.9a1.65 1.65 0 0 0 1.47-.5a1.65 1.65 0 0 0 .33-1.82a2 2 0 1 1 2.83-2.83a1.65 1.65 0 0 0 1.82-.33a1.65 1.65 0 0 0 .5-1.47a2 2 0 1 1 3.9 0a1.65 1.65 0 0 0 1.47.5a1.65 1.65 0 0 0 1.82.33a2 2 0 1 1 2.83 2.83a1.65 1.65 0 0 0 .33 1.82a1.65 1.65 0 0 0 1.47.5a2 2 0 1 1 0 3.9a1.65 1.65 0 0 0-1.47.5z"></path>
                    </svg>
                  </span>
                </button>

                <button onClick={logoutt} className="btn nav-logout-btn">
                  <span className="flip-front"><FiLogOut/></span>
                </button>
              </nav>
            </div>
          )}
        </>

      </div>

    </div>

    {showSettings && <UserSettingsModal onClose={() => setShowSettings(false)} />}

    {showTelegram && (
      <div className="tg-modal-overlay" onClick={() => setShowTelegram(false)}>
        <div className="tg-modal-content" onClick={e => e.stopPropagation()}>
          <TelegramBotAkkAndMedias />
        </div>
      </div>
    )}

    {showNPCalc && <NovaPoshtaCalculator onClose={() => setShowNPCalc(false)} />}
    </>
  )

};

export default Nav;
