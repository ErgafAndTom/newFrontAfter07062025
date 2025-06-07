import React, {useCallback, useEffect, useState} from "react";
import SlideInModal from './SlideInModal';
import './../../global.css';
import './ClientArtem.css';
import './ClientsMenuu.css';
import www from "./www.svg";
import whiteSVG from "../../components/whiteSVG.svg";
import pays from "../Pays.png";
import axios from "../../api/axiosInstance";
import Form from "react-bootstrap/Form";
import ChangeClienticons from "./img/Group 1476.png";
import barcode from "./public/mask-group-10.svg";
import profile from "./public/mask-group-11@2x.png";
import viberlogo from "./img/viber.png";
import signallogo from "./img/signal.png";
import whatsapplogo from "./img/whatsapp.png";
import Email from "./img/email.svg";
import telegram from "./img/Telegram-icon-on-transparent-background-PNG.png";
import FilesButton from "./img/files-icon.png";
import Tooltip from '../TooltipButton2';
import {useNavigate} from "react-router-dom";
import {Button, Modal, Spinner, ListGroup, InputGroup} from "react-bootstrap";
import {buttonStyles, containerStyles, formStyles} from './styles';
import PaysInOrderRestored from "./pays/PayInOrderRestored";


const ClientChangerUIArtem = ({thisOrder, setThisOrder, setSelectedThings2}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();
    const [showAddUser, setShowAddUser] = useState(false);
    const [showDocGenerate, setShowDocGenerate] = useState(false);
    const [showNP, setShowNP] = useState(false);
    const [showPays, setShowPays] = useState(false);
    const [load, setLoad] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeSelect, setTypeSelect] = useState("");
    const [users, setUsers] = useState({rows: []});
    const [show, setShow] = useState(false);
    const [showVisible, setShowVisible] = useState(false);
    const [error, setError] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);

    // Функція для закриття модального вікна
    const handleClose = () => {
        setShowVisible(false)
        const timer = setTimeout(() => {
            setShow(false);
        }, 300);
        return () => clearTimeout(timer);
    };

    // Функція для закриття модального вікна
    const handleCloseAddUser = () => {
        setModalVisible(false);
    }

    // Функція для відкриття модального вікна
    const handleShow = () => {
        setShowVisible(true)
        setShow(true);
        setSearchQuery("");
        fetchUsers();
    };

    // Завантаження списку користувачів
    const fetchUsers = async () => {
        let data = {
            name: "",
            inPageCount: 999999,
            currentPage: 1,
            search: searchQuery,
            columnName: {
                column: "id",
                reverse: false
            },
        }
        setLoad(true);
        setError(null);

        try {
            const response = await axios.post(`/user/all`, data);
            setLoad(false);
            setUsers(response.data);
            setFilteredUsers(response.data.rows);
        } catch (error) {
            setLoad(false);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
            setError(error.message);
            console.error(error.message);
        }
    };

    // Пошук користувачів при зміні запиту
    useEffect(() => {
        if (show) {
            // const timer = setTimeout(() => {
            //     fetchUsers();
            // }, 300);
            // return () => clearTimeout(timer);
            fetchUsers();
        }
    }, [searchQuery, show]);

    // Обробник для вибору користувача
    const handleSelectUser = (userId) => {
        let data = {
            orderId: thisOrder.id,
            userId: userId,
        };

        setLoad(true);
        setError(null);

        axios.put(`/orders/OneOrder/user`, data)
            .then(response => {
                setThisOrder(response.data);
                setSelectedThings2(response.data.OrderUnits)
                setLoad(false);
                setShow(false);
            })
            .catch(error => {
                setLoad(false);
                if (error.response && error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                console.error(error.message);
            });
    };

    // Обробник для фільтрування списку користувачів
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Функції для месенджерів
    const openMessenger = (messenger) => {
        if (!thisOrder.client) return;

        let url = '';
        const phoneNum = thisOrder.client.phoneNumber ? thisOrder.client.phoneNumber.replace(/\s+/g, '') : '';

        switch (messenger) {
            case 'signal':
                url = `signal://${phoneNum}`;
                break;
            case 'viber':
                url = `viber://chat?number=${phoneNum}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/${phoneNum}`;
                break;
            case 'telegram':
                url = thisOrder.client.telegram ? `https://t.me/${thisOrder.client.telegram}` : '';
                break;
            default:
                break;
        }

        if (url) {
            window.open(url, '_blank');
        }
    };

    // Додавання нового користувача
    const handleAddNewUser = () => {
        setShowAddUser(true);
    };

    // Обробник успішного додавання нового користувача
    const handleUserAdded = (newUser) => {
        fetchUsers(); // Оновлюємо список після додавання

        // Автоматично обираємо нового користувача, якщо він успішно доданий
        if (newUser && newUser.id) {
            handleSelectUser(newUser.id);
        }
    };

    return (
        <>
            {/* Кнопка для відкриття модального вікна */}
            <div
                onClick={handleShow}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    maxWidth: '100%',
                    // width: '30vw',
                    overflow: 'hidden',

                    marginTop: '1vh',
                    textAlign: 'left',

                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inter, sans-serif',
                    fontSize: '1.5vmin',
                    backgroundColor: 'transparent'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '1vw'}}>

                    {thisOrder.client ? (

                        <div className="" style={{fontSize: '1.7vmin', position: "relative"}}>
                            <div className="fw-bold d-flex " style={{flexcolumn: 'row'}}>
                                {thisOrder.client.lastName} {thisOrder.client.firstName} {thisOrder.client.familyName}
                                <div className="fw-lighter" style={{fontSize: "1vmin"}}>: №{thisOrder.client.id}</div>
                            </div>
                        </div>
                    ) : (

                        <span style={{background: "#f2f0e7"}}>Вибрати клієнта</span>
                    )}
                </div>

                {thisOrder.client && (
                    <div className="client-details" style={{fontSize: '1.7vmin', marginLeft: "1vw"}}>

                        {thisOrder.client.phoneNumber && (
                            <span className="">{thisOrder.client.phoneNumber}</span>
                        )}
                        {thisOrder.client.address && (
                            <span className="">{thisOrder.client.address}</span>
                        )}
                        {thisOrder.client.discount && (
                            <span className="text-success"
                                  style={{marginLeft: "3vw"}}>Знижка: {thisOrder.client.discount}%</span>
                        )}
                    </div>
                )}
            </div>

            {/* Кнопки швидких дій з клієнтом */}
            {!show && thisOrder.client && thisOrder.client.phoneNumber && (
                <div className="d-flex gap-1 mt-2 justify-content-between">
                    <div className="d-flex gap-1">

                        {thisOrder.client.viber && (
                            <button
                                onClick={() => openMessenger('viber')}
                                title="Viber"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={viberlogo} alt="Viber" style={{width: '16px', height: '16px'}}/>
                            </button>
                        )}
                        {!thisOrder.client.viber && (
                            <button
                                title="Viber"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={viberlogo} alt="Viber"
                                     style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>
                            </button>
                        )}

                        {thisOrder.client.whatsapp && (
                            <button
                                onClick={() => openMessenger('whatsapp')}
                                title="WhatsApp"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={whatsapplogo} alt="WhatsApp" style={{width: '16px', height: '16px'}}/>
                            </button>
                        )}
                        {!thisOrder.client.whatsapp && (
                            <button
                                title="WhatsApp"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={whatsapplogo} alt="WhatsApp"
                                     style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>
                            </button>
                        )}

                        {thisOrder.client.signal && (
                            <button
                                onClick={() => openMessenger('signal')}
                                title="Signal"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={signallogo} alt="Signal" style={{width: '16px', height: '16px'}}/>
                            </button>
                        )}
                        {!thisOrder.client.signal && (
                            <button
                                title="Signal"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={signallogo} alt="Signal"
                                     style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>
                            </button>
                        )}

                        {thisOrder.client.telegram && (
                            <button
                                onClick={() => openMessenger('telegram')}
                                title="Telegram"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={telegram} alt="Telegram" style={{width: '16px', height: '16px'}}/>
                            </button>
                        )}
                        {!thisOrder.client.telegram && (
                            <button
                                title="Telegram"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}>
                                <img src={telegram} alt="Telegram"
                                     style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>
                            </button>
                        )}
                        {thisOrder.client.email && (
                            <button
                                onClick={() => openMessenger('E-mail')}
                                title="Email"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={Email} alt="Email" style={{width: '2vh', height: '2vh'}}/>
                            </button>
                        )}
                        {!thisOrder.client.email && (
                            <button
                                title="Email"
                                style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                            >
                                <img src={Email} alt="Email" style={{width: '2vh', height: '2vh', opacity: '40%'}}/>
                            </button>
                        )}
                        {/*<button*/}
                        {/*    onClick={() => setShowNP(true)}*/}
                        {/*    title="Нова Пошта"*/}
                        {/*    style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
                        {/*>*/}
                        {/*    НП*/}
                        {/*</button>*/}

                        <button
                            onClick={() => setShowPays(true)}
                            title="Платежі"
                            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                        >
                            <img src={pays} alt="Платежі" style={{width: '16px', height: '16px'}}/>
                        </button>

                        {/*<button*/}
                        {/*    onClick={() => setShowDocGenerate(true)}*/}
                        {/*    title="Генерувати документи"*/}
                        {/*    style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
                        {/*>*/}
                        {/*    <img src={dockGenerate} alt="Документи" style={{width: '16px', height: '16px'}}/>*/}
                        {/*</button>*/}

                        <button
                            onClick={() => {
                                if (thisOrder.client && thisOrder.client.id) {
                                    window.open(`/client-files/${thisOrder.client.id}`, '_blank');
                                } else {
                                    setError('Спочатку виберіть клієнта');
                                }
                            }}
                            title="Файли клієнта"
                            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                        >
                            <img src={FilesButton} alt="Файли" style={{width: '16px', height: '16px'}}/>
                        </button>
                    </div>


                </div>
            )}

            {/* Відображення помилки */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mt-2" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            {/* Модальне вікно для вибору користувача */}
            <div><Modal
                show={show}
                onHide={handleClose}
                dialogClassName="modal-content"
                style={{
                    transform: `${showVisible ? 'translateX(0)' : 'translateX(35%)'}`,
                    transition: 'transform 0.3s ease-in-out',
                    overflow: "hidden",
                }}
            >
                {/*<Modal.Header dialogClassName="Modal-Header" closeButton style={{background:"#f2f0e7", borderRadius: '1vw 1vw 0 0 ', fontSize:"1.2vmin", height: '3vh' }}>*/}
                {/*    <Modal.Title dialogClassName="Modal-Header" style={{fontSize:"1.5vmin", marginLeft:'0.3vw'}}>Вибір клієнта:</Modal.Title>*/}
                {/*</Modal.Header>*/}
                <Modal.Body style={{
                    background: "transparent",
                    borderRadius: '1vw',
                    fontSize: "1.5vmin",
                    position: "absolute",
                    minHeight: '75vh',
                    top: '-1vw',
                    maxHeight: "75vh",
                }}>
                    {/* Відображення поточного клієнта якщо він обраний */}
                    {thisOrder.client && (
                        <div className="" style={{
                            background: '#f8f9fa',
                            borderRadius: '1vw',
                            position: 'relative',
                            padding: '1vh 0.8vw',
                            minHeight: '10vh'
                        }}>
                            <button
                                onClick={() => window.open(`/client/${thisOrder.client.id}`, '_blank')}
                                title="Відкрити профіль клієнта"
                                className="adminButtonAdd flex-right-center"
                                style={{
                                    // ...buttonStyles.base,
                                    // ...buttonStyles.primary,
                                    // ...buttonStyles.actionButton,
                                    // position: 'relative',

                                    background: "#3c60a6",
                                    position: 'absolute',
                                    top: '1vh',
                                    right: '0.5vw',
                                    display: 'flex',
                                    alignItems: 'flex-end'
                                    // boxShadow: "0vh 0vh 2vh #1351e6",
                                }}
                            >
                                Профіль клієнта
                            </button>


                            <div className="" style={{width: "20vw", margin: "0.3vh"}}>

                                <div className="" style={{position: "relative", marginTop: "0.3vh"}}>
                                    <div className="fw-bold d-flex " style={{flexcolumn: 'row'}}>
                                        {thisOrder.client.lastName} {thisOrder.client.firstName} {thisOrder.client.familyName}
                                        <div className="fw-lighter" style={{fontSize: "1vmin"}}>:
                                            №{thisOrder.client.id}</div>
                                    </div>
                                </div>
                                {thisOrder.client.phoneNumber && (
                                    <div className="d-flex" style={{marginTop: "0.3vh"}}>

                                        <div className="">
                                            <strong className="">Телефон:</strong> {thisOrder.client.phoneNumber}
                                        </div>
                                    </div>
                                )}

                                {thisOrder.client.email && (
                                    <div className="d-flex " style={{marginTop: "0.3vh"}}>
                                        <div className="">
                                            <strong>Пошта:</strong> {thisOrder.client.email}
                                        </div>
                                    </div>
                                )}


                                {thisOrder.client.address && (
                                    <div className="">
                                        <div className="" style={{marginTop: "0.3vh"}}>
                                            <strong>Адреса:</strong> {thisOrder.client.address}
                                        </div>
                                    </div>
                                )}
                                {thisOrder.client.telegram && (
                                    <div className="" style={{marginTop: "0.3vh"}}>
                                        <div>
                                            <strong>Telegram: </strong>{thisOrder.client.telegram}
                                        </div>
                                    </div>
                                )}
                                {thisOrder.client.discount && (
                                    <div className="" style={{marginTop: "0.3vh"}}>
                                        <div>
                                            <strong> <span
                                                className="text-success">Знижка: {thisOrder.client.discount}%</span></strong>
                                        </div>
                                    </div>
                                )}

                                {thisOrder.client.notes && (
                                    <div className="d-flex" style={{marginTop: "0.3vh"}}>
                                        <div>
                                            <strong>Нотатки:</strong> {thisOrder.client.notes}
                                        </div>
                                    </div>
                                )}

                            </div>


                            {/* Кнопки для взаємодії з поточним клієнтом */}
                            <div className="d-flex flex-wrap gap-1" style={{marginTop: '1vh'}}>
                                {!show && thisOrder.client && thisOrder.client.phoneNumber && (
                                    <>

                                        <button
                                            onClick={() => openMessenger('viber')}
                                            title="Viber"
                                            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                                        >
                                            <img src={viberlogo} alt="Viber" style={{width: '2vh', height: '2vh'}}/>
                                        </button>

                                        <button
                                            onClick={() => openMessenger('whatsapp')}
                                            title="WhatsApp"
                                            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                                        >
                                            <img src={whatsapplogo} alt="WhatsApp"
                                                 style={{width: '2vh', height: '2vh'}}/>
                                        </button>

                                        <button
                                            onClick={() => openMessenger('signal')}
                                            title="Signal"
                                            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                                        >
                                            <img src={signallogo} alt="Signal" style={{width: '2vh', height: '2vh'}}/>
                                        </button>
                                    </>
                                )}


                                {thisOrder.client.telegram && (
                                    <button
                                        onClick={() => openMessenger('telegram')}
                                        title="Telegram"
                                        style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                                    >
                                        <img src={telegram} alt="Telegram" style={{width: '2vh', height: '2vh'}}/>
                                    </button>
                                )}
                                {thisOrder.client.email && (
                                    <button
                                        onClick={() => openMessenger('E-mail')}
                                        title="Email"
                                        style={{...buttonStyles.base, ...buttonStyles.iconButton}}
                                    >
                                        <img src={Email} alt="Email" style={{width: '2vh', height: '2vh'}}/>
                                    </button>
                                )}
                            </div>
                            <>


                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <button
                                        onClick={() => setModalVisible(true)}
                                        className="adminButtonAdd"
                                        style={{
                                            position: 'absolute',
                                            bottom: '1vh',
                                            right: '0.5vw',
                                            display: 'flex',
                                            alignItems: 'flex-end'
                                        }}
                                    >
                                        Створити клієнта
                                    </button>

                                </div>

                                <SlideInModal
                                    show={modalVisible}
                                    handleCloseAddUser={handleCloseAddUser}
                                    onClose={() => setModalVisible(false)}
                                    onHide={handleClose}
                                    title="Додавання клієнта"
                                />
                            </>
                        </div>
                    )}

                    {/* Пошук клієнтів */}
                    <div>
                        <InputGroup>
                            <div style={{position: 'relative', width: '100%'}}>
                                <Form.Control
                                    type="text"
                                    placeholder="Пошук за ім'ям, прізвищем, номером телефону або email..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    style={{
                                        paddingRight: '3vw', // місце для кнопки
                                        borderRadius: '1vw',
                                        border: 'none',
                                        fontSize: '1.5vmin',
                                        marginTop: '1vh',
                                        background: "#f8f9fa",
                                        position: 'relative',
                                    }}
                                />

                                <button
                                    onClick={fetchUsers}
                                    style={{
                                        position: 'absolute',
                                        // top: '50%',
                                        right: '1vw',
                                        // width: '0vw',
                                        height: '0vh',
                                        border: '1px',
                                        padding: 0,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <img
                                        src={ChangeClienticons}
                                        alt="Change Client"
                                        style={{

                                            width: '20px',
                                            height: '20px',
                                            alignItemss: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            marginLeft: '29vw',
                                            transform: 'translateY(-155%)',
                                        }}
                                    />
                                </button>
                            </div>

                        </InputGroup>
                    </div>

                    {/* Відображення списку користувачів */}
                    {load ? (
                        <div className="" style={{
                            background: "#f8f9fa",
                            borderRadius: '1vw',
                            padding: '1vh 0.8vw',
                            Height: '74vh',

                            marginTop: '-0.5vh',
                            overflow: 'hidden',              // ← додано
                            paddingRight: "0.5vw",
                        }}>
                            <div className="user-list user-form-container" style={{
                                background: "transparent",
                                border: "none",
                                width: '31vw',
                                marginLeft: '-1.1vw',
                                marginTop: '-1.5vh',
                                borderRadius: '1vw',
                                maxHeight: "75vh",
                                paddingRight: "0.5vw",
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "center",
                                // padding: "0.5vh 0.5vw",
                                // paddingTop: "0.5vh",
                                // paddingBottom: "0.5vh",
                                // paddingLeft: "0.5vw",

                            }}>
                                <Spinner animation="border" variant="primary"/>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="" style={{

                            color: "#f8f9fa"
                        }}
                        >{error}</div>
                    ) : (
                        <div style={{
                            background: "#f8f9fa",
                            borderRadius: '1vw',
                            padding: '1vh 0.8vw',
                            Height: '74vh',
                            marginTop: '0.5vh',
                            overflow: 'hidden',              // ← додано
                            paddingRight: "0.5vw",
                        }}>
                            <div className="user-list user-form-container" style={{
                                background: "transparent",
                                border: "none",
                                width: '31vw',
                                marginLeft: '-1.1vw',
                                marginTop: '-1.5vh',
                                borderRadius: '1vw',
                                maxHeight: "75vh",
                                paddingRight: "0.5vw",

                            }}>
                                {users.rows && users.rows.length > 0 ? (
                                    <ListGroup>
                                        {users.rows.map((user) => (
                                            <div style={{
                                                borderBottom: "0.1vw solid #e8e8e8",
                                                borderRadius: "1vw",
                                                // color: "#e8e8e8",
                                            }}>
                                                <ListGroup.Item
                                                    style={{
                                                        border: "none",
                                                        // borderBottom: "0.1vw solid #b6b6b6",
                                                        // color: "#b6b6b6",
                                                    }}
                                                    key={user.id}
                                                    action
                                                    onClick={() => handleSelectUser(user.id)}
                                                    className={`d-flex justify-content-between align-items-start ${thisOrder.client && thisOrder.client.id === user.id ? 'border-primary-5' : ''}`}
                                                >
                                                    <div className="" style={{
                                                        fontSize: '1.5vmin',
                                                        // borderBottom: "0.1vw solid #ffffff",
                                                    }}>
                                                        <div className=""
                                                             style={{position: 'relative', width: '27.5vw'}}>
                                                            <div className="" style={{position: 'relative'}}>
                                                                <div className="fw-bold d-flex "
                                                                     style={{flexcolumn: 'row'}}>
                                                                    {user.lastName} {user.firstName} {user.familyName} {}
                                                                    <div className="fw-lighter"
                                                                         style={{fontSize: "1vmin"}}>: №{user.id}</div>
                                                                </div>


                                                                {user.phoneNumber && <div> {user.phoneNumber} </div>}
                                                                {user.email && <div>{user.email}</div>}
                                                                {user.telegram && <div> {user.telegram}</div>}

                                                            </div>
                                                            <div className="flex-right" style={{
                                                                position: "absolute",
                                                                display: "flex",
                                                                top: "0vw",
                                                                right: "0",
                                                                fontSize: "1.5vmin"
                                                            }}>

                                                                <div>
                                                                    {user.photoLink && <div> {user.photoLink} </div>}
                                                                    {user.discount > 0 &&
                                                                        <div>
                                                                            <strong> <span
                                                                                className="text-success">Знижка: {user.discount}%</span></strong>
                                                                        </div>}
                                                                    {user.address && <div>{user.address}</div>}
                                                                    {user.notes &&
                                                                        <div> {user.notes}
                                                                        </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*{thisOrder.client && thisOrder.client.id === user.id && (*/}
                                                    {/*    <span className="badge bg-primary rounded-pill" style={{}}>✓</span>*/}
                                                    {/*)}*/}
                                                    {/*{thisOrder.executor && thisOrder.executor.id === user.id && (*/}
                                                    {/*    <span className="badge bg-success rounded-pill" style={{*/}
                                                    {/*        boxShadow: "0vh 0vh 1vh #226012",*/}
                                                    {/*    }}>Це ви</span>*/}
                                                    {/*)}*/}
                                                </ListGroup.Item></div>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <>
                                        <div className="text-center p-4 bg-light rounded">
                                            <p>Немає клієнтів за даним запитом</p>

                                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                                <button
                                                    onClick={() => setModalVisible(true)}
                                                    className="adminButtonAdd"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Створити нового клієнта
                                                </button>
                                            </div>
                                        </div>

                                        {/* Виносимо поза DOM потоку, щоб працювали позиціонування */}
                                        {/*<SlideInModal*/}
                                        {/*    // onClose={() => setModalVisible(false)}*/}
                                        {/*    // onHide={handleClose}*/}
                                        {/*    title="Додавання клієнта"*/}
                                        {/*    handleCloseAddUser={handleCloseAddUser}*/}
                                        {/*/>*/}
                                    </>

                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                {/*<Modal.Footer style={{backgroundColor: '#F2F0E7', borderRadius: '0 0 1vw 1vw', fontSize: "1.2vmin", height: '7.5vh' }}>*/}
                {/*    <button*/}
                {/*        onClick={handleClose}*/}
                {/*        style={{*/}
                {/*            ...buttonStyles.base,*/}
                {/*            ...buttonStyles.close,*/}
                {/*            position: "relative",*/}


                {/*        }}*/}
                {/*    >*/}
                {/*        Скасувати*/}
                {/*    </button>*/}
                {/*    {thisOrder.client && (*/}
                {/*        <button*/}
                {/*            onClick={() => handleSelectUser(null)}*/}
                {/*            style={{*/}
                {/*                ...buttonStyles.base,*/}
                {/*                ...buttonStyles.delete,*/}
                {/*                // color: '#d57272',*/}
                {/*                boxShadow: "0vh 0vh 2vh #d57272",*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Видалити вибір*/}
                {/*        </button>*/}
                {/*    )}*/}
                {/*</Modal.Footer>*/}
            </Modal></div>

            {/* Модальне вікно для додавання нового користувача */}


            {/* Інші модальні вікна, які можуть бути потрібні */}
            {/*{showNP && <NP show={showNP} onHide={() => setShowNP(false)}/>}*/}
            {showPays && <PaysInOrderRestored showPays={showPays} setShowPays={setShowPays} thisOrder={thisOrder}
                                              setThisOrder={setThisOrder}/>}


            {/* Модальне вікно для генерації документів */}
            <Modal
                show={showDocGenerate}
                onHide={() => setShowDocGenerate(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Генерація документів</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!thisOrder.client ? (
                        <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Спочатку виберіть клієнта для можливості генерації документів
                        </div>
                    ) : (
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <img src={whiteSVG} alt="Договір"
                                             style={{width: '64px', height: '64px', marginBottom: '15px'}}/>
                                        <h5 className="card-title">Договір</h5>
                                        <p className="card-text">Створення договору для замовлення</p>
                                        <button
                                            onClick={() => {
                                                // Логіка для генерації договору
                                                if (thisOrder && thisOrder.id) {
                                                    window.open(`/api/documents/contract/${thisOrder.id}`, '_blank');
                                                }
                                            }}
                                            style={{
                                                ...buttonStyles.base,
                                                ...buttonStyles.primary,
                                                width: '100%'
                                            }}
                                        >
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            Згенерувати договір
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <img src={barcode} alt="Накладна"
                                             style={{width: '64px', height: '64px', marginBottom: '15px'}}/>
                                        <h5 className="card-title">Накладна</h5>
                                        <p className="card-text">Створення накладної для замовлення</p>
                                        <button
                                            onClick={() => {
                                                // Логіка для генерації накладної
                                                if (thisOrder && thisOrder.id) {
                                                    window.open(`/api/documents/invoice/${thisOrder.id}`, '_blank');
                                                }
                                            }}
                                            style={{
                                                ...buttonStyles.base,
                                                ...buttonStyles.primary,
                                                width: '100%'
                                            }}
                                        >
                                            <i className="bi bi-receipt me-2"></i>
                                            Згенерувати накладну
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <img src={profile} alt="Акт"
                                             style={{width: '64px', height: '64px', marginBottom: '15px'}}/>
                                        <h5 className="card-title">Акт виконаних робіт</h5>
                                        <p className="card-text">Створення акту виконаних робіт</p>
                                        <button
                                            onClick={() => {
                                                // Логіка для генерації акту
                                                if (thisOrder && thisOrder.id) {
                                                    window.open(`/api/documents/act/${thisOrder.id}`, '_blank');
                                                }
                                            }}
                                            style={{
                                                ...buttonStyles.base,
                                                ...buttonStyles.primary,
                                                width: '100%'
                                            }}
                                        >
                                            <i className="bi bi-file-check me-2"></i>
                                            Згенерувати акт
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <img src={www} alt="Рахунок-фактура"
                                             style={{width: '64px', height: '64px', marginBottom: '15px'}}/>
                                        <h5 className="card-title">Рахунок-фактура</h5>
                                        <p className="card-text">Створення рахунку-фактури для замовлення</p>
                                        <button
                                            onClick={() => {
                                                // Логіка для генерації рахунку-фактури
                                                if (thisOrder && thisOrder.id) {
                                                    window.open(`/api/documents/invoice-print/${thisOrder.id}`, '_blank');
                                                    setShowDocGenerate(false);
                                                }
                                            }}
                                            style={{
                                                ...buttonStyles.base,
                                                ...buttonStyles.primary,
                                                width: '100%'
                                            }}
                                        >
                                            <i className="bi bi-cash-coin me-2"></i>
                                            Згенерувати рахунок
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={() => setShowDocGenerate(false)}
                        style={{...buttonStyles.base, ...buttonStyles.close}}
                    >
                        Закрити
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ClientChangerUIArtem;
