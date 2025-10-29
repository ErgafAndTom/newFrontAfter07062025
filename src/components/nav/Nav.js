import React, {useEffect, useState, useRef} from "react";
import "./Nav.css";
import { NavLink } from "react-router-dom";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { FiSettings, FiLogOut } from "react-icons/fi";
// import find from "../find.svg";
import {fetchUser, logout} from "../../actions/authActions";
import {Form} from "react-bootstrap";
import './logo/Logo.css';
import AddNewOrder from "../../PrintPeaksFAinal/Orders/AddNewOrder";
import AddUserButton from "../../PrintPeaksFAinal/user/AddUserButton.jsx";
import { useNavigate } from "react-router-dom";
import PopupLeftNotification from "./PopupLeftNotification";
import {searchChange} from "../../actions/searchAction";

const Nav = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);
    const search = useSelector((state) => state.search.search);
    // const [search, setSearch] = useState({search: ""});
    const [basicActive, setBasicActive] = useState('/');
    const newOrderButtonRef = useRef(null);

  // useEffect(() => {
  //   dispatch(fetchTrelloData());
  // }, [dispatch]);


    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    // Ефект для відслідковування зміни currentUser
    useEffect(() => {
        // Якщо користувач вийшов (currentUser став null), перезавантажуємо компонент
        // if (currentUser === null) {
        //     console.log('Користувач вийшов')
        // }
    }, [currentUser])

    useEffect(() => {
        // console.log(document.location.pathname);
        setBasicActive(document.location.pathname);
    }, [document.location.pathname])

    const handleSearch = (searchValue) => {
        // console.log(searchValue);
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
        // Перенаправлення на сторінку логіну
        navigate('/login')
    }

    return (
<div>

  <div className="d-flex justify-content-between align-items-start " style={{borderRadius:'0vh',marginBottom:'1vh'}}>
    {/* Ліва панель з кнопками */}
    <>
      {currentUser?.role === "user" && (
        <div className="btnBlock flipNav navTheme-amber d-flex align-items-center" style={{paddingLeft:"5px"}}>
          <nav className="btnRow" >
            {/*    <NavLink to="/Desktop" className="btn">*/}
            {/*      <span className="flip-front" >Головна</span>*/}
            {/*      <span className="flip-back"  >*/}
            {/*  /!* home *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <path d="M3 10.5L12 3l9 7.5" />*/}
            {/*    <path d="M5 10.5V21h14V10.5" />*/}
            {/*    <path d="M9 21v-6h6v6" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

        {/*    <NavLink to="/Users" className="btn">*/}
        {/*      <span className="flip-front">Клієнти</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* users *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <circle cx="12" cy="7" r="3" />*/}
        {/*    <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

        {/*    <NavLink to="/Companys" className="btn">*/}
        {/*      <span className="flip-front">Компанії</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* building *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <path d="M6 8V4h6v4" />*/}
        {/*    <rect x="6" y="8" width="12" height="12" rx="1" />*/}
        {/*    <path d="M9 12h2m2 0h2m-6 3h2m2 0h2" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            <NavLink to="/Orders" className="btn">
              <span className="flip-front">Замовлення</span>
              <span className="flip-back">
          {/* clipboard */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="4" width="10" height="16" rx="2" />
            <path d="M9 4V2h6v2" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
        </span>
            </NavLink>

        {/*    <NavLink to="/Storage" className="btn">*/}
        {/*      <span className="flip-front">Склад</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* box *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <path d="M4 7l8 4 8-4" />*/}
        {/*    <path d="M4 7v10l8 4 8-4V7" />*/}
        {/*    <path d="M12 11v10" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            {/*    <NavLink to="/dbGraph2" className="btn">*/}
            {/*      <span className="flip-front">База</span>*/}
            {/*      <span className="flip-back">*/}
            {/*  /!* database *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <ellipse cx="12" cy="5" rx="7" ry="3" />*/}
            {/*    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />*/}
            {/*    <path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

            {/*    <NavLink to="/dbGraph" className="btn">*/}
            {/*      <span className="flip-front">База Graph</span>*/}
            {/*      <span className="flip-back">*/}
            {/*  /!* graph *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <circle cx="5" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="5" r="2" />*/}
            {/*    <circle cx="19" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="19" r="2" />*/}
            {/*    <path d="M7 12h10M12 7v10" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

            {/*    <NavLink to="/dbGraph2" className="btn">*/}
            {/*      <span className="flip-front">База2D</span>*/}
            {/*      <span className="flip-back">*/}
            {/*  /!* graph *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <circle cx="5" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="5" r="2" />*/}
            {/*    <circle cx="19" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="19" r="2" />*/}
            {/*    <path d="M7 12h10M12 7v10" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

        {/*    <NavLink to="/Trello" className="btn">*/}
        {/*      <span className="flip-front">Завдання</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* kanban *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" >*/}
        {/*    <rect x="3" y="4" width="18" height="16" rx="2" />*/}
        {/*    <rect x="6" y="7" width="4" height="10" rx="1" />*/}
        {/*    <rect x="14" y="7" width="4" height="6" rx="1"  />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            <NavLink to="/Vimogi" className="btn">
              <span className="flip-front" >Вимоги</span>
              <span className="flip-back"  >
          {/* checklist */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"
                  width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"
            />
          </svg>
        </span>
            </NavLink>

            {/*    <NavLink to="/Shifts" className="btn">*/}
            {/*      <span className="flip-front" >Зміни</span>*/}
            {/*      <span className="flip-back"  >*/}
            {/*  /!* checklist *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"*/}
            {/*          width="12" height="18" rx="2" />*/}
            {/*    <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"*/}
            {/*    />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

            {/*    <NavLink to="/Cashs" className="btn">*/}
            {/*      <span className="flip-front" >Каси</span>*/}
            {/*      <span className="flip-back"  >*/}
            {/*  /!* checklist *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"*/}
            {/*          width="12" height="18" rx="2" />*/}
            {/*    <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"*/}
            {/*    />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}
          </nav>
        </div>
      )}
      {currentUser?.role === "operator" && (
        <div className="btnBlock flipNav navTheme-amber d-flex align-items-center" style={{paddingLeft:"5px"}}>
          <nav className="btnRow" >
        {/*    <NavLink to="/Desktop" className="btn">*/}
        {/*      <span className="flip-front" >Головна</span>*/}
        {/*      <span className="flip-back"  >*/}
        {/*  /!* home *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <path d="M3 10.5L12 3l9 7.5" />*/}
        {/*    <path d="M5 10.5V21h14V10.5" />*/}
        {/*    <path d="M9 21v-6h6v6" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            <NavLink to="/Users" className="btn">
              <span className="flip-front">Клієнти</span>
              <span className="flip-back">
          {/* users */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7" r="3" />
            <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Companys" className="btn">
              <span className="flip-front">Компанії</span>
              <span className="flip-back">
          {/* building */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 8V4h6v4" />
            <rect x="6" y="8" width="12" height="12" rx="1" />
            <path d="M9 12h2m2 0h2m-6 3h2m2 0h2" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Orders" className="btn">
              <span className="flip-front">Замовлення</span>
              <span className="flip-back">
          {/* clipboard */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="4" width="10" height="16" rx="2" />
            <path d="M9 4V2h6v2" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Storage" className="btn">
              <span className="flip-front">Склад</span>
              <span className="flip-back">
          {/* box */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7l8 4 8-4" />
            <path d="M4 7v10l8 4 8-4V7" />
            <path d="M12 11v10" />
          </svg>
        </span>
            </NavLink>

        {/*    <NavLink to="/dbGraph2" className="btn">*/}
        {/*      <span className="flip-front">База</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* database *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <ellipse cx="12" cy="5" rx="7" ry="3" />*/}
        {/*    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />*/}
        {/*    <path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            {/*    <NavLink to="/dbGraph" className="btn">*/}
            {/*      <span className="flip-front">База Graph</span>*/}
            {/*      <span className="flip-back">*/}
            {/*  /!* graph *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <circle cx="5" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="5" r="2" />*/}
            {/*    <circle cx="19" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="19" r="2" />*/}
            {/*    <path d="M7 12h10M12 7v10" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

            {/*    <NavLink to="/dbGraph2" className="btn">*/}
            {/*      <span className="flip-front">База2D</span>*/}
            {/*      <span className="flip-back">*/}
            {/*  /!* graph *!/*/}
            {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
            {/*    <circle cx="5" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="5" r="2" />*/}
            {/*    <circle cx="19" cy="12" r="2" />*/}
            {/*    <circle cx="12" cy="19" r="2" />*/}
            {/*    <path d="M7 12h10M12 7v10" />*/}
            {/*  </svg>*/}
            {/*</span>*/}
            {/*    </NavLink>*/}

            <NavLink to="/Trello" className="btn">
              <span className="flip-front">Завдання</span>
              <span className="flip-back">
          {/* kanban */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <rect x="6" y="7" width="4" height="10" rx="1" />
            <rect x="14" y="7" width="4" height="6" rx="1"  />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Vimogi" className="btn">
              <span className="flip-front" >Вимоги</span>
              <span className="flip-back"  >
          {/* checklist */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"
                  width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"
            />
          </svg>
        </span>
            </NavLink>

        {/*    <NavLink to="/Shifts" className="btn">*/}
        {/*      <span className="flip-front" >Зміни</span>*/}
        {/*      <span className="flip-back"  >*/}
        {/*  /!* checklist *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"*/}
        {/*          width="12" height="18" rx="2" />*/}
        {/*    <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"*/}
        {/*    />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

        {/*    <NavLink to="/Cashs" className="btn">*/}
        {/*      <span className="flip-front" >Каси</span>*/}
        {/*      <span className="flip-back"  >*/}
        {/*  /!* checklist *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"*/}
        {/*          width="12" height="18" rx="2" />*/}
        {/*    <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"*/}
        {/*    />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}
          </nav>
        </div>
      )}
      {/* навбар */}
      {/* блок навігації з радіусом низу 12px */}
      {currentUser?.role === "admin" && (
        <div className="btnBlock flipNav navTheme-amber d-flex align-items-center" style={{paddingLeft:"5px"}}>
          <nav className="btnRow" >
        {/*    <NavLink to="/Desktop" className="btn">*/}
        {/*      <span className="flip-front" >Головна</span>*/}
        {/*      <span className="flip-back"  >*/}
        {/*  /!* home *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <path d="M3 10.5L12 3l9 7.5" />*/}
        {/*    <path d="M5 10.5V21h14V10.5" />*/}
        {/*    <path d="M9 21v-6h6v6" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            <NavLink to="/Users" className="btn">
              <span className="flip-front">Клієнти</span>
              <span className="flip-back">
          {/* users */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7" r="3" />
            <path d="M17 21v-2a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Companys" className="btn">
              <span className="flip-front">Компанії</span>
              <span className="flip-back">
          {/* building */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 8V4h6v4" />
            <rect x="6" y="8" width="12" height="12" rx="1" />
            <path d="M9 12h2m2 0h2m-6 3h2m2 0h2" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Orders" className="btn">
              <span className="flip-front">Замовлення</span>
              <span className="flip-back">
          {/* clipboard */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="4" width="10" height="16" rx="2" />
            <path d="M9 4V2h6v2" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Storage" className="btn">
              <span className="flip-front">Склад</span>
              <span className="flip-back">
          {/* box */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7l8 4 8-4" />
            <path d="M4 7v10l8 4 8-4V7" />
            <path d="M12 11v10" />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/dbGraph2" className="btn">
              <span className="flip-front">База</span>
              <span className="flip-back">
          {/* database */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <ellipse cx="12" cy="5" rx="7" ry="3" />
            <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
            <path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </svg>
        </span>
            </NavLink>

        {/*    <NavLink to="/dbGraph" className="btn">*/}
        {/*      <span className="flip-front">База Graph</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* graph *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <circle cx="5" cy="12" r="2" />*/}
        {/*    <circle cx="12" cy="5" r="2" />*/}
        {/*    <circle cx="19" cy="12" r="2" />*/}
        {/*    <circle cx="12" cy="19" r="2" />*/}
        {/*    <path d="M7 12h10M12 7v10" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

        {/*    <NavLink to="/dbGraph2" className="btn">*/}
        {/*      <span className="flip-front">База2D</span>*/}
        {/*      <span className="flip-back">*/}
        {/*  /!* graph *!/*/}
        {/*        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">*/}
        {/*    <circle cx="5" cy="12" r="2" />*/}
        {/*    <circle cx="12" cy="5" r="2" />*/}
        {/*    <circle cx="19" cy="12" r="2" />*/}
        {/*    <circle cx="12" cy="19" r="2" />*/}
        {/*    <path d="M7 12h10M12 7v10" />*/}
        {/*  </svg>*/}
        {/*</span>*/}
        {/*    </NavLink>*/}

            <NavLink to="/Trello" className="btn">
              <span className="flip-front">Завдання</span>
              <span className="flip-back">
          {/* kanban */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <rect x="6" y="7" width="4" height="10" rx="1" />
            <rect x="14" y="7" width="4" height="6" rx="1"  />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Vimogi" className="btn">
              <span className="flip-front" >Вимоги</span>
              <span className="flip-back"  >
          {/* checklist */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"
                   width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"
                  />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Shifts" className="btn">
              <span className="flip-front" >Зміни</span>
              <span className="flip-back"  >
          {/* checklist */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"
                  width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"
            />
          </svg>
        </span>
            </NavLink>

            <NavLink to="/Cashs" className="btn">
              <span className="flip-front" >Каси</span>
              <span className="flip-back"  >
          {/* checklist */}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="3"  stroke="rgba(0,0,0,0.6)"
                  width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h6"  stroke="rgba(0,0,0,0.6)"
            />
          </svg>
        </span>
            </NavLink>
          </nav>
        </div>
      )}
    </>

    {/* Права частина */}
    <div className="d-flex align-items-start" style={{borderRadius:"0"}}>
      <div >
        {/*<LogoWithText />*/}
        {currentUser &&
          <>
            <AddNewOrder />
          </>
        }
      </div>

      <Form.Control
        className="buttonSkewedSearch buttonSkewedSearchLupa"

        name="search"
        type="text"
        placeholder=""
        value={search}
        style={{borderRadius:'0', height:"3.5vh", zIndex:"0"}}
        onChange={(e) => {
          handleSearchChange(e)
        }}
      />
      {currentUser &&
        <>
          {currentUser.role === "admin" &&
            <>
              <AddUserButton fetchUsers={() => dispatch(fetchUser())}/>
            </>
          }
          {currentUser.role === "operator" &&
            <>
              <AddUserButton fetchUsers={() => dispatch(fetchUser())}/>
            </>
          }
        </>
      }
      {currentUser ? (
        <div className="d-flex align-items-center" >
          <Link to="/currentUser" style={{ textDecoration: 'none' }}>
            <button className="adminButtonAddNav">
              <svg
                className="ico"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82a2 2 0 1 1-2.83 2.83a1.65 1.65 0 0 0-1.82.33a1.65 1.65 0 0 0-.5 1.47a2 2 0 1 1-3.9 0a1.65 1.65 0 0 0-1.47-.5a1.65 1.65 0 0 0-1.82-.33a2 2 0 1 1-2.83-2.83a1.65 1.65 0 0 0-.33-1.82a1.65 1.65 0 0 0-1.47-.5a2 2 0 1 1 0-3.9a1.65 1.65 0 0 0 1.47-.5a1.65 1.65 0 0 0 .33-1.82a2 2 0 1 1 2.83-2.83a1.65 1.65 0 0 0 1.82-.33a1.65 1.65 0 0 0 .5-1.47a2 2 0 1 1 3.9 0a1.65 1.65 0 0 0 1.47.5a1.65 1.65 0 0 0 1.82.33a2 2 0 1 1 2.83 2.83a1.65 1.65 0 0 0 .33 1.82a1.65 1.65 0 0 0 1.47.5a2 2 0 1 1 0 3.9a1.65 1.65 0 0 0-1.47.5z"></path>
              </svg>
             {currentUser?.username} ({currentUser?.role})
            </button>
          </Link>



          <PopupLeftNotification />

          <button
            onClick={logoutt}
            className="adminButtonAddNavExit"

          >
            <FiLogOut />
          </button>
        </div>
      ) : (
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button
            className="adminButtonAddNav buttonSkewedOrderClient"
            style={{
              background: '#008249',
              // background: '#FFFFFF00',
              borderRadius: '0 0 9px 0',
              height: '3rem'
            }}
          >
            Логін
          </button>
        </Link>
      )}
    </div>
  </div>


</div>

)

};

export default Nav;
