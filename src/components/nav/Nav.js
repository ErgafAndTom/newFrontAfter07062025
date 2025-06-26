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
import {FaAllergies, FaArrowAltCircleLeft, FaArrowAltCircleRight} from "react-icons/fa";
import NavMess from "./NavMess";
import PopupLeftNotification from "./PopupLeftNotification";
// import Logo from "./logo/Logo";

const Nav = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);
    const [search, setSearch] = useState({search: ""});
    const [basicActive, setBasicActive] = useState('/');
    const newOrderButtonRef = useRef(null);


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

                <MDBNavbar expand='lg' light bgColor='' className="navbarMy" >
            <MDBContainer fluid>
                <div className="d-flex">
                    <div className="logo">
                        <h1 className="Logo">
                            <div className="gradient-text">PRINT PEAKS <span style={{fontSize: "0.7vw"}}>ERP 10.08</span>
                            </div>
                        </h1>
                    </div>

                    <div className="top-menu adminButtonAdd"  style={{
                        height: '5vh',
                        marginTop: '-1.1vh',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: "0",
                        boxShadow: "none"
                    }}>
                        <Link to="/Desktop" style={{textDecoration: 'none'}}>
                            <button
                                onClick={() => handleBasicClick('/Desktop')}
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"1vh 0vh 0vh 0vh"}}>Головна
                            </button>
                        </Link>

                        {/*<button className="ButtonClients">Головна</button>*/}
                        <Link to="/Users" style={{textDecoration: 'none'}}>
                            <button
                                onClick={() => handleBasicClick('/Users')}
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"0px"}}>Клієнти
                            </button>
                        </Link>


                        <Link to="/Orders" style={{textDecoration: 'none'}}>
                            <button
                                onClick={() => handleBasicClick('/Orders')}
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"0px"}}>Замовлення
                            </button>
                        </Link>

                        <Link disabled onClick={() => handleBasicClick('/Storage')} to="/Storage" style={{textDecoration: 'none'}}>
                            <button
                                onClick={() => handleBasicClick('/Storage')}
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"0px"}}>Склад
                            </button>
                        </Link>

                        <Link disabled onClick={() => handleBasicClick('/db2')} to="/db2"
                              style={{textDecoration: 'none', padding: '0', background: 'transparent'}}>
                            <button
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"0px"}}
                            >База
                            </button>
                        </Link>
                        <Link disabled onClick={() => handleBasicClick('/Trello')} to="/Trello"
                              style={{textDecoration: 'none', padding: '0', background: 'transparent'}}>
                            <button
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius:"0px"}}
                            >Завдання
                              {currentUser && (
                                <NavMess currentUser={currentUser}/>
                              )}
                            </button>
                        </Link>

                        {/*<Link disabled onClick={() => handleBasicClick('/myFiles')} to="/myFiles"*/}
                        {/*      style={{textDecoration: 'none', padding: '0', background: 'transparent'}}>*/}
                        {/*    <button disabled*/}
                        {/*            className={basicActive === "/myFiles" ? 'ButtonVimogi ButtonVimogia' : 'ButtonVimogi'}*/}
                        {/*            style={basicActive === "/myFiles" ? {background: "#FAB416"} : {}}*/}
                        {/*    >Файли*/}
                        {/*    </button>*/}
                        {/*</Link>*/}


                        <Link to="/Vimogi" style={{textDecoration: 'none'}}>
                            <button
                                onClick={() => handleBasicClick('/Vimogi')}
                                className="adminButtonAdd"
                                style={{minWidth:'3vw', borderRadius: '0vh 0vh 0vh 1vh'}}
                            >Вимоги
                            </button>
                        </Link>
                        {/*<Link to="/Invoices" style={{textDecoration: 'none',  padding: '0', background: 'transparent'}}>*/}
                        {/*    <button*/}
                        {/*        onClick={() => handleBasicClick('/Invoices')}*/}
                        {/*        className={basicActive === "/Invoices" ? 'ButtonVimogi ButtonVimogia' : 'ButtonVimogi'}*/}
                        {/*        style={basicActive === "/Invoices" ? {background: "#FAB416"} : {}}*/}
                        {/*    >Рахунки*/}
                        {/*    </button>*/}
                        {/*</Link>*/}

                        {/* Кнопки авторизації переміщені у верхній правий кут */}
                    </div>
                </div>
                {/* Права верхня частина з кнопками */}
                <div style={{
                    // position: 'absolute',

                    right: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0vw',

                }}>
                    {/* Кнопка "Нове замовлення" */}
                    <div ref={newOrderButtonRef} style={{flexShrink: 0}}>
                        <AddNewOrder />
                    </div>

                    {/* Компонент для створення клієнта */}
                    <div style={{ flexShrink: 0 }}>
                        <AddUserButton
                            fetchUsers={() => {
                                // Додаткові дії після створення користувача, якщо потрібно
                                dispatch(fetchUser())
                            }}
                        />
                    </div>

                    {/* Поле пошуку */}
                    <div style={{

                    }}>
                        <Form.Control
                            className="Search"

                            name="search"
                            type="text"
                            placeholder="Пошук"
                            value={search.search}
                            style={{fontSize: '0.8vw', width: '15vw', marginTop: '-3.35vh', marginRight: '0.5vw'}}
                            onChange={(e) => {
                                setSearch({ ...search, search: e.target.value });
                                handleSearch(e.target.value);
                            }}
                        />
                        {/*<img style={{*/}
                        {/*    // opacity: '0.5',*/}
                        {/*    // left: '80px',*/}
                        {/*    // top: '50%',*/}
                        {/*    transform: 'translateY(-50%)',*/}
                        {/*    pointerEvents: 'none',*/}
                        {/*    width: "15px",*/}
                        {/*    height: "15px"*/}
                        {/*}}*/}
                        {/*src={find}*/}
                        {/*alt="Search Icon"*/}
                        {/*className="Seaechicon"/>*/}
                    </div>

                    {/* Кнопки "Налаштування" та "Вийти" */}
                    {currentUser ? (
                        <div style={{display: 'flex', gap: '0px', alignItems: 'center', justifyContent: 'center',  transform: 'translateY(-50%)', marginRight: '-1vw'}}>
                          <PopupLeftNotification placement={'end'} name={'end'}/>
                            {currentUser.role === "admin" ? (
                                <>
                                    <Link onClick={() => handleBasicClick('/currentUser')} to="/currentUser"
                                          style={{textDecoration: 'none'
                                          }}
                                    >
                                        <button
                                            className="adminButtonAdd"
                                            style={{
                                                ...(basicActive === "/currentUser" ? {background: "#FAB416"} : {}),
                                                height: '4vh',
                                                minWidth: '3vw',
                                                padding: '0 15px',
                                                fontSize: '0.8vw',
                                                whiteSpace: 'nowrap',
                                                background: '#008249',
                                                borderRadius: '1vh 0vh 0vh 1vh',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <FiSettings style={{fontSize: '1.1rem'}} />: {currentUser.username}
                                        </button>
                                    </Link>
                                    <button
                                        onClick={logoutt}
                                        className="adminButtonAdd"
                                        style={{
                                            height: '4vh',
                                            padding: '0 15px',
                                            minWidth: '3vw',
                                            fontSize: '1.2rem',
                                            width: '1vw',
                                            background: '#EE3C23',
                                            borderRadius: '0vh 1vh 1vh 0vh',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <FiLogOut />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link onClick={() => handleBasicClick('/currentUser')} to="/currentUser"
                                          style={{textDecoration: 'none'}}>
                                        <button
                                            className="adminButtonAdd"
                                            style={{
                                                ...(basicActive === "/createOrder" ? {background: "#FAB416"} : {}),
                                                height: '4vh',
                                                padding: '0 15px',
                                                fontSize: '0.8vw',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <FiSettings style={{fontSize: '1.1rem'}} /> {currentUser.username}
                                        </button>
                                    </Link>
                                    <button
                                        onClick={logoutt}
                                        className="adminButtonAdd"
                                        style={{
                                            height: '4vh',
                                            maxWidth: '3vw',
                                            padding: '0 10px',
                                            fontSize: '1.2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <FiLogOut />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="login-button-container" style={{animation: 'fadeIn 0.5s', }}>
                            <Link onClick={() => handleBasicClick('/login')} to="/login"
                                  style={{textDecoration: 'none',

                            }}>
                                <button
                                    className="adminButtonAdd"
                                    style={{
                                        ...(basicActive === "/login" ? {background: "#008249"} : {background: "#008249"}),
                                        height: '4vh',
                                        padding: '0 15px',
                                        fontSize: '0.8vw',
                                        whiteSpace: 'nowrap',
                                        marginTop: '-3.7vh',
                                        minWidth: '5vw',
                                        background: '#008249',
                                        borderRadius: '1vh 1vh 1vh 1vh',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                        // background: 'red'
                                    }}
                                >
                                    Логін
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </MDBContainer>
        </MDBNavbar>

</div>

)

};

export default Nav;
