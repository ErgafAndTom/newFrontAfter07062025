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
import Laminator from "../../PrintPeaksFAinal/poslugi/Laminator";
import NewSheetCut from "../../PrintPeaksFAinal/poslugi/NewSheetCut";
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

  <div className="d-flex justify-content-between align-items-center " style={{borderRadius:'0vh',marginBottom:'1vh', height:"2rem"}}>
    {/* Ліва панель з кнопками */}
    <>
      {currentUser?.role === "user" &&
        <div className="d-flex flex-row align-items-center " style={{paddingLeft: '0.5vw', zIndex: '0'}}>
          {[
            {to: "/Desktop", label: "Головна"},
            {to: "/Orders", label: "Замовлення"},
            {to: "/Vimogi", label: "Вимоги"}
          ].map(({to, label, hasMess}, index, arr) => (
            <Link key={to} to={to} style={{textDecoration: 'none'}}>
              <button
                onClick={() => handleBasicClick(to)}
                className={`buttonSkewed
        ${index === 0 ? 'first' : ''}
        ${index === arr.length - 1 ? 'last' : ''}
      `}

              >
                {label}
                {hasMess && currentUser && <NavMess currentUser={currentUser}/>}
              </button>
            </Link>
          ))}

        </div>
      }
      {currentUser?.role === "operator" &&
        <div className="d-flex flex-row align-items-center " style={{paddingLeft: '0.5vw', zIndex: '0'}}>
          {[
            {to: "/Desktop", label: "Головна"},
            {to: "/Users", label: "Клієнти"},
            {to: "/Orders", label: "Замовлення"},
            {to: "/Vimogi", label: "Вимоги"},
            {to: "/Trello", label: "Завдання", hasMess: true},
          ].map(({to, label, hasMess}, index, arr) => (
            <Link key={to} to={to} style={{textDecoration: 'none'}}>
              <button
                onClick={() => handleBasicClick(to)}
                className={`buttonSkewed
        ${index === 0 ? 'first' : ''}
        ${index === arr.length - 1 ? 'last' : ''}
      `}
              >
                {label}
                {hasMess && currentUser && <NavMess currentUser={currentUser}/>}
              </button>
            </Link>
          ))}

        </div>
      }
      {currentUser?.role === "admin" &&
        <div className="d-flex flex-row align-items-center " style={{paddingLeft: '12px', zIndex: '0'}}>
          {[
            {to: "/Desktop", label: "Головна"},
            {to: "/Users", label: "Клієнти"},
            {to: "/Company", label: "Компанії"},
            {to: "/Orders", label: "Замовлення"},
            {to: "/Storage", label: "Склад"},
            {to: "/db2", label: "База"},
            {to: "/dbGraph", label: "БазаGraph"},
            {to: "/Trello", label: "Завдання", hasMess: true},
            {to: "/Vimogi", label: "Вимоги"}
          ].map(({to, label, hasMess}, index, arr) => (
            <Link key={to} to={to} style={{textDecoration: 'none'}}>
              <button
                onClick={() => handleBasicClick(to)}
                className={`buttonSkewed
        ${index === 0 ? 'first' : ''}
        ${index === arr.length - 1 ? 'last' : ''}
      `}
style={{height: '2rem'}}
              >
                {label}
                {hasMess && currentUser && <NavMess currentUser={currentUser}/>}
              </button>
            </Link>
          ))}

        </div>
      }

    </>

    {/* Права частина */}
    <div className="d-flex align-items-center" style={{borderRadius:"0"}}>
      <div >
        <LogoWithText />
        <AddNewOrder />
      </div>

      <Form.Control
        className="buttonSkewedSearch buttonSkewedSearchLupa"
        name="search"
        type="text"
        placeholder=""
        value={search}
        style={{borderRadius:'0'}}
        onChange={(e) => {
          handleSearchChange(e)
        }}
      />
      <div style={{   }}>
        <>
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
        </>
      </div>
      {currentUser ? (
        <div className="d-flex align-items-center" >
          <Link to="/currentUser" style={{ textDecoration: 'none' }}>
            <button
              className="adminButtonAddNav"
              style={{
                background: '#008249',
                height: '2rem',
                borderRadius: '0 0 0 9px',

              }}
            >
              <FiSettings  />: {currentUser?.username} ({currentUser?.role})
            </button>
          </Link>

          {currentUser?.role === "admin" || currentUser?.role === "operator" &&
            <>
              <AddUserButton fetchUsers={() => dispatch(fetchUser())}/>
              <PopupLeftNotification/>
            </>
          }
          <PopupLeftNotification />

          <button
            onClick={logoutt}
            className="adminButtonAddNav"
            style={{
              background: '#EE3C23',
              borderRadius: '0 0px 9px 0',
              marginRight: '1vw',
              height: '2rem',

            }}
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
              borderRadius: '0 0 9px 0',
              height: '2rem'
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
