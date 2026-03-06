import React, {useEffect, useState, useRef} from "react";
import {NavLink} from "react-router-dom";
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
import {useNavigate} from "react-router-dom";
import PopupLeftNotification from "./PopupLeftNotification";
import {searchChange} from "../../actions/searchAction";
import TermActiveWidget from "./TermActiveVidget";
import TelegramDrawer from "..//Telegram/TelegramDrawer";
import {openDrawer} from "../../telegram/telegramSlice";


const Nav = () => {
  const dispatch = useDispatch();
  const totalUnread = useSelector((s) => s.telegram.totalUnread);
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const [basicActive, setBasicActive] = useState('/');
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

  return (
    <div style={{marginTop: '0'}}>


      <div className="nav-bar-row"
           style={{borderRadius: '0vh', marginBottom: '0vh'}}>

        {/* ── Конверт 1: ЗЛІВА — Нове замовлення + Створити клієнта ── */}
        {currentUser && (
          <div className="nav-actions-group">
            <AddNewOrder/>
            {(currentUser.role === "admin" || currentUser.role === "operator") && (
              <AddUserButton fetchUsers={() => dispatch(fetchUser())}/>
            )}
          </div>
        )}

        {/* ── Конверт 2: ПО ЦЕНТРУ — Пошук + Юзер + Сповіщення + Вихід ── */}
        <div className="nav-center-group">
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
          </div>
          {currentUser ? (
            <>
              <div className="nav-right-controls">
                <Link to="/currentUser" style={{textDecoration: 'none', display: 'flex'}}>
                  <button className="adminButtonAddNav">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82a2 2 0 1 1-2.83 2.83a1.65 1.65 0 0 0-1.82.33a1.65 1.65 0 0 0-.5 1.47a2 2 0 1 1-3.9 0a1.65 1.65 0 0 0-1.47-.5a1.65 1.65 0 0 0-1.82-.33a2 2 0 1 1-2.83-2.83a1.65 1.65 0 0 0-.33-1.82a1.65 1.65 0 0 0-1.47-.5a2 2 0 1 1 0-3.9a1.65 1.65 0 0 0 1.47-.5a1.65 1.65 0 0 0 .33-1.82a2 2 0 1 1 2.83-2.83a1.65 1.65 0 0 0 1.82-.33a1.65 1.65 0 0 0 .5-1.47a2 2 0 1 1 3.9 0a1.65 1.65 0 0 0 1.47.5a1.65 1.65 0 0 0 1.82.33a2 2 0 1 1 2.83 2.83a1.65 1.65 0 0 0 .33 1.82a1.65 1.65 0 0 0 1.47.5a2 2 0 1 1 0 3.9a1.65 1.65 0 0 0-1.47.5z"></path>
                    </svg>
                    <span>{currentUser?.username} ({currentUser?.role})</span>
                  </button>
                </Link>

                <PopupLeftNotification/>

                <button onClick={logoutt} className="adminButtonAddNavExit">
                  <FiLogOut/>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleClick}
              className="adminButtonAddNav buttonSkewedOrderClient"
              style={{background: '#008249', borderRadius: '0', height: '3.5vh', cursor: 'pointer'}}
            >
              Логін
            </button>
          )}
        </div>

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

                <NavLink to="/dbGraph2" className="btn">
                  <span className="flip-front">База</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <ellipse cx="12" cy="5" rx="7" ry="3"/>
                      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/>
                      <path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3"/>
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

                <NavLink to="/Shifts" className="btn">
                  <span className="flip-front">Зміни</span>
                  <span className="flip-back">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="3" stroke="rgba(0,0,0,0.6)" width="12" height="18" rx="2"/>
                      <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(0,0,0,0.6)"/>
                    </svg>
                  </span>
                </NavLink>
              </nav>
            </div>
          )}
        </>

      </div>

    </div>

  )

};

export default Nav;
