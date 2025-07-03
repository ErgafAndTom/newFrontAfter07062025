import React, {useEffect, useState, useRef} from "react";
import "./Nav.css"
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {MDBContainer, MDBNavbar,} from "mdb-react-ui-kit";
import { FiSettings, FiLogOut } from "react-icons/fi";
// import find from "../find.svg";
import {fetchUser, logout} from "../../actions/authActions";
import {Form} from "react-bootstrap";
import './logo/Logo.css';
import AddNewOrder from "../../PrintPeaksFAinal/Orders/AddNewOrder";
import AddUserButton from "../../PrintPeaksFAinal/user/AddUserButton.jsx";
import { useNavigate } from "react-router-dom";
import NavMess from "./NavMess";
import PopupLeftNotification from "./PopupLeftNotification";
import {fetchTrelloData} from "../../actions/trello_async_actions";
import iii from './logo/logo.svg';
import LogoWithText from './LogoWithText';

const Nav = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);
    const [search, setSearch] = useState({search: ""});
    const [basicActive, setBasicActive] = useState('/');
    const newOrderButtonRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTrelloData());
  }, [dispatch]);


    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    // Ефект для відслідковування зміни currentUser
    useEffect(() => {
        // Якщо користувач вийшов (currentUser став null), перезавантажуємо компонент
        if (currentUser === null) {
            console.log('Користувач вийшов')
        }
    }, [currentUser])

    useEffect(() => {
        // console.log(document.location.pathname);
        setBasicActive(document.location.pathname);
    }, [document.location.pathname])

    const handleSearch = (searchValue) => {
        console.log(searchValue);
        dispatch(fetchUser(searchValue))
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

  <div className="d-flex justify-content-between align-items-center " style={{borderRadius:'0vh',marginBottom:'1vh'}}>
    {/* Ліва панель з кнопками */}
    <div className="d-flex flex-row align-items-center " style={{ paddingLeft: '0.5vw', zIndex: '0' }}>
      {[
        { to: "/Desktop", label: "Головна" },
        { to: "/Users", label: "Клієнти" },
        { to: "/Orders", label: "Замовлення" },
        { to: "/Storage", label: "Склад" },
        { to: "/db2", label: "База" },
        { to: "/Trello", label: "Завдання", hasMess: true },
        { to: "/Vimogi", label: "Вимоги" }
      ].map(({ to, label, hasMess }, index, arr) => (
        <Link key={to} to={to} style={{ textDecoration: 'none' }}>
          <button
            onClick={() => handleBasicClick(to)}
            className={`buttonSkewed
        ${index === 0 ? 'first' : ''}
        ${index === arr.length - 1 ? 'last' : ''}
      `}
          >
            {label}
            {hasMess && currentUser && <NavMess currentUser={currentUser} />}
          </button>
        </Link>
      ))}

    </div>

    {/* Права частина */}
    <div className="d-flex align-items-center" style={{ height: '3.5vh', gap: '0.5vw',  marginRight:'0.5vw'}}>
      <div >
        <LogoWithText />
        <AddNewOrder />
      </div>

      <Form.Control
        className="buttonSkewedSearch buttonSkewedSearchLupa"
        name="search"
        type="text"
        placeholder=""
        value={search.search}
        style={{borderRadius:'0'}}
        onChange={(e) => {
          setSearch({ ...search, search: e.target.value });
          handleSearch(e.target.value);
        }}
      />
      <div style={{ height: '3.5vh', display: 'flex', alignItems: 'center', borderRadius: '0vh', }}>
        <AddUserButton fetchUsers={() => dispatch(fetchUser())} />
      </div>
      {currentUser ? (
        <div className="d-flex align-items-center" style={{ height: '3.5vh'}}>
          <Link to="/currentUser" style={{ textDecoration: 'none', }}>
            <button
              className="adminButtonAddNav"
              style={{
                background: '#008249',
                borderRadius: '0vh',
                height: '3.5vh',
                marginTop: '-0.4vh'
              }}
            >
              <FiSettings  />: {currentUser.username}
            </button>
          </Link>

          <PopupLeftNotification />

          <button
            onClick={logoutt}
            className="adminButtonAddNav"
            style={{
              background: '#EE3C23',
              borderRadius: '0 0 1vh 0',
              marginTop: '-0.4vh',
              height: '3.5vh',

            }}
          >
            <FiLogOut />
          </button>
        </div>
      ) : (
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button
            className="adminButtonAddNav"
            style={{
              background: '#008249',
              borderRadius: '0 0 1vh 0',
              marginTop: '-0.4vh',
              height: '3,5vh'
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
