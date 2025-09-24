import React, {useCallback, useEffect, useState} from "react";
import SlideInModal from './SlideInModal';

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
import {useSelector} from "react-redux";
import TelegramAvatar from "../../PrintPeaksFAinal/Messages/TelegramAvatar";
import PaidButtomProgressBar from "../../PrintPeaksFAinal/tools/PaidButtomProgressBar";
import ClientSelectionModal from "./ClientSelectionModal";
import ClientCabinet from "./ClientCabinet";
import {FiUser} from "react-icons/fi";
import {FiFolder} from "react-icons/fi";
import getEffectiveDiscount from "./getEffectiveDiscount.js";
import "./ClientCabinet.css";
import PaysInOrderRestored_OrdersLike from "./pays/PaysInOrderRestored_OrdersLike";
import "./getEffectiveDiscount"

const ClientChangerUIArtem = ({thisOrder, setThisOrder, setSelectedThings2}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  // додай біля інших useState:
  const [clientCabinetOpen, setClientCabinetOpen] = useState(false);
  const effectiveDiscount = getEffectiveDiscount(thisOrder);
  const [showDocGenerate, setShowDocGenerate] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [showNP, setShowNP] = useState(false);
  const [showPays, setShowPays] = useState(false);
  const [load, setLoad] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchId, setSearchId] = useState(false);
  const [typeSelect, setTypeSelect] = useState("");
  const [users, setUsers] = useState({rows: []});
  const [show, setShow] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [error, setError] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const user = thisOrder?.client || {};




  const personalDiscount = user?.discount;
  const companyDiscount = user?.Company?.discount ?? user?.companyDiscount;
  // const effectiveDiscount = Math.max(personalDiscount ?? 0, companyDiscount ?? 0);
  const hasDiscount = personalDiscount != null || companyDiscount != null;
  const [thisUserIdToCabinet, setThisUserIdToCabinet] = useState(0);

  const [handleThisOrderChange, setHandleThisOrderChange] = useState(thisOrder);
  const [newThisOrder, setNewThisOrder] = useState(thisOrder);
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
    if (currentUser.role === "admin" || currentUser.role === "operator") {
      setShowVisible(true)
      setShow(true);
      setSearchQuery("");
    }
  };

  // Завантаження списку користувачів
  const fetchUsers = async () => {
    let data = {
      name: "",
      inPageCount: 9999,
      currentPage: 1,
      search: searchQuery,
      searchId: searchId,
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
  // useEffect(() => {
  //   const handler = (e) => {
  //     const btn = e.target.closest('.clientCabinetButton');
  //     if (btn) setClientCabinetOpen(true);
  //   };
  //   document.addEventListener('click', handler, true); // capture = true
  //   return () => document.removeEventListener('click', handler, true);
  // }, []);

  // Пошук користувачів при зміні запиту
  useEffect(() => {
    // console.log(searchId);
    if (show) {
      // const timer = setTimeout(() => {
      //     fetchUsers();
      // }, 300);
      // return () => clearTimeout(timer);
      fetchUsers();
    }
  }, [searchQuery, show, searchId]);

  // Обробник для вибору користувача
  const handleSelectUser = (userId) => {
    let data = {
      orderId: thisOrder.id,
      userId: userId,
    };
    setShow(false);
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
        setError(error);
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
      // case 'telegram':
      //     url = thisOrder.client.telegram ? `https://t.me/${thisOrder.client.telegram}` : '';
      //     break;
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

  const setThisUserToCabinetFunc = (open, user, e) => {
    e.stopPropagation();
    setThisUserIdToCabinet(user.id)
    setClientCabinetOpen(open)
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

          width: '32vw',
          height: '10vh',
          overflow: 'hidden',
          marginLeft: '0.4vw',
          marginTop: '0vh',
          textAlign: 'left',

          border: 'none',
          cursor: 'pointer',

          backgroundColor: 'transparent'
        }}
      >
        <div style={{display: 'flex', alignItems: 'center',  gap: '1vw'}}>


          {thisOrder.client ? (
            <div className="" style={{ position: "relative"}}>
              <div className="" style={{flexcolumn: 'row', fontSize: '1vw',}}

              >
                {thisOrder.client.lastName} {thisOrder.client.firstName} {thisOrder.client.familyName} 🤖:{thisOrder.client.id}
                <div
                  style={{
                    marginTop: '00rem',
                    height: '1px',
                    background: 'transparent',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              <strong className="adminTextBig" style={{position: "fixed", bottom: "8vh",  fontSize: '0.6vw',}}>
            <span
              className="adminTextBig">    </span></strong>
            </div>

          ) : (

            <span style={{background: "#f7f5ee"}}>Вибрати клієнта</span>
          )}
        </div>
        <div style={{position: "absolute", right: "0.5vw", top: "0.5vh"}}>
          {thisOrder.client && (
            <div className="client-details adminTextBig" style={{fontSize: '1.5vmin', marginLeft: "1vw"}}>


              {thisOrder.client.address && (
                <span className="adminTextBig">{thisOrder.client.address}</span>
              )}

            </div>
          )}
        </div>
        <div className="d-flex adminTextBig align-items-center"
             style={{ position: "absolute", right: '0vw', top: '1vh'}}>
          {thisOrder.client && (
            <div
              className="d-flex align-items-center gap-2"
              style={{

                position: 'absolute',
                right: '1vw',
                top: '0vh',
                cursor: 'pointer'
              }}
              title={`@${thisOrder.client?.telegram?.replace(/^@/, '')}`}
              onClick={() => openMessenger('telegram')}
            >

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (thisOrder?.client?.id) {
                    // window.open(`/api/users/${thisOrder.client.id}/drive-folder`, '_blank');
                    // window.open(`https://drive.google.com/drive/folders/0ABGMb1Ge05gnUk9PVA`, '_blank');
                    window.open(`https://drive.google.com/drive/folders/1zpPDvQF2g_QcE3i6SCemKhg81rqLHag3`, '_blank');
                    // window.location.href = "file:///C:/Users/Public/Documents";
                  } else {
                    setError('Спочатку виберіть клієнта');
                  }
                }}
                title="Файли клієнта"
                aria-label="Файли клієнта"
                className="icon-btn client-cabinet-icon icon-btn--outlined folder-btn"
                /* видали inline style width/height або buttonStyles.iconButton,
                   якщо вони конфліктують — краще керувати через CSS */
              >
                <FiFolder size={30} color="rgba(0,0,0,0.6)" />
              </button>


              <button
                className="clientCabinetButton client-cabinet-icon"
                // onClick={(e) => {
                //   e.stopPropagation();
                //   // console.log("Кабінет клієнта:", user.id);
                // }}
                onClick={(e) => setThisUserToCabinetFunc(true, thisOrder.client, e)}
                title="Кабінет клієнта"
                // aria-label="Відкрити кабінет клієнта"
              >
                {/* user icon — stroke-based, uses currentColor */}
                <FiUser size={30}  />
              </button>

              <TelegramAvatar
                link={thisOrder.client?.telegram}
                size={60}
                // defaultSrc="/default-avatar.png"
              />

            </div>

          )}
        </div>
        <div>
          {thisOrder?.client?.phoneNumber && (
            <span className="" style={{ fontSize:"2.3vh" }}>{thisOrder.client.phoneNumber}</span>
          )}

        </div>
        {/* Кнопки швидких дій з клієнтом */}
        {/*{!show && thisOrder.client && thisOrder.client.phoneNumber && (*/}
        {/*  <div className="d-flex  gap-1 mt-2 justify-content-between" style={{marginTop: "22vh",marginLeft:"1.3vw",}}>*/}
        {/*    <div className="d-flex gap-1" style={{}}>*/}


        {/*        <button*/}
        {/*          title="WhatsApp"*/}
        {/*          style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*        >*/}
        {/*          <img src={whatsapplogo} alt="WhatsApp"*/}
        {/*               style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>*/}
        {/*        </button>*/}



        {/*      {thisOrder.client.signal && (*/}
        {/*        <button*/}
        {/*          onClick={() => openMessenger('signal')}*/}
        {/*          title="Signal"*/}
        {/*          style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*        >*/}
        {/*          <img src={signallogo} alt="Signal" style={{width: '16px', height: '16px'}}/>*/}
        {/*        </button>*/}
        {/*      )}*/}
        {/*      {!thisOrder.client.signal && (*/}
        {/*        <button*/}
        {/*          title="Signal"*/}
        {/*          style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*        >*/}
        {/*          <img src={signallogo} alt="Signal"*/}
        {/*               style={{width: '16px', height: '16px', filter: 'grayscale(100%)', opacity: 0.5}}/>*/}
        {/*        </button>*/}
        {/*      )}*/}
        {/*      {thisOrder.client.email && (*/}
        {/*        <button*/}
        {/*          onClick={() => openMessenger('E-mail')}*/}
        {/*          title="Email"*/}
        {/*          style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*        >*/}
        {/*          <img src={Email} alt="Email" style={{width: '2vh', height: '2vh'}}/>*/}
        {/*        </button>*/}
        {/*      )}*/}
        {/*      {!thisOrder.client.email && (*/}
        {/*        <button*/}
        {/*          title="Email"*/}
        {/*          style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*        >*/}
        {/*          <img src={Email} alt="Email" style={{width: '2vh', height: '2vh', opacity: '40%'}}/>*/}
        {/*        </button>*/}
        {/*      )}*/}
        {/*      <button*/}
        {/*        onClick={() => {*/}
        {/*          if (thisOrder.client && thisOrder.client.id) {*/}
        {/*            window.open(`/client-files/${thisOrder.client.id}`, '_blank');*/}
        {/*          } else {*/}
        {/*            setError('Спочатку виберіть клієнта');*/}
        {/*          }*/}
        {/*        }}*/}
        {/*        title="Файли клієнта"*/}
        {/*        style={{...buttonStyles.base, ...buttonStyles.iconButton}}*/}
        {/*      >*/}
        {/*        <img src={FilesButton} alt="Файли" style={{width: '16px', height: '16px'}}/>*/}

        {/*      </button>*/}


        {/*      /!*<button*!/*/}
        {/*      /!*  onClick={() => {*!/*/}
        {/*      /!*    setShowPays(true)*!/*/}
        {/*      /!*  }}*!/*/}
        {/*      /!*  title="Файли клієнта"*!/*/}
        {/*      /!*  style={{...buttonStyles.base, ...buttonStyles.iconButton}}*!/*/}
        {/*      /!*>*!/*/}
        {/*      /!*  <img src={pays} alt="Файли" style={{width: '16px', height: '16px'}}/>*!/*/}
        {/*      /!*</button>*!/*/}



        {/*    </div>*/}

        {/*  </div>*/}
        {/*)}*/}

      </div>
      {/* Відображення помилки */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mt-2" role="alert">
          {error?.message} {error?.response?.data?.error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Модальне вікно для вибору користувача */}
    <div>
      <ClientSelectionModal
        show={show}
        showVisible={showVisible}
        handleClose={handleClose}
        handleSearchChange={handleSearchChange}
        fetchUsers={fetchUsers}
        searchQuery={searchQuery}
        thisOrder={thisOrder}
        setThisOrder={setThisOrder}
        handleSelectUser={handleSelectUser}
        users={users}
        load={load}
        error={error}
        modalVisible={modalVisible}
        handleCloseAddUser={handleCloseAddUser}
        setModalVisible={setModalVisible}
        setShowPays={setShowPays}
        setSearchQuery={setSearchQuery}
        searchId={searchId}
        setSearchId={setSearchId}
      />
    </div>





      {/* Модальне вікно для додавання нового користувача */}
      <div style={{position: "absolute", bottom: "0", left: "0vw",  }}>
        <PaidButtomProgressBar
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          setNewThisOrder={setNewThisOrder}
          setSelectedThings2={setSelectedThings2}
          handleThisOrderChange={handleThisOrderChange}
          setShowPays={setShowPays}
        />

        {/* Інші модальні вікна, які можуть бути потрібні */}
        {/*{showNP && <NP show={showNP} onHide={() => setShowNP(false)}/>}*/}
<div style={{zIndex: 2000}}>
        {showPays &&
          // <PaysInOrderRestored
          //   showPays={showPays}
          //   setShowPays={setShowPays}
          //   thisOrder={thisOrder}
          //   setThisOrder={setThisOrder}
          // />
          <PaysInOrderRestored_OrdersLike
            showPays={showPays}
            setShowPays={setShowPays}
            thisOrder={thisOrder}
            setThisOrder={setThisOrder}
          />
        }
</div>
      </div>
      {/* Модальне вікно для генерації документів */}
      <div style={{zIndex: 2000}}>
      <Modal
        show={showDocGenerate}
        onHide={() => setShowDocGenerate(false)}
        size="lg"
        centered

      >
        <Modal.Header closeButton>
          <Modal.Title>Генерація документів</Modal.Title>
        </Modal.Header>
        <Modal.Body className={{}}>
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
                         style={{width: '64px', height: '64px', zIndex: 2000, marginBottom: '15px'}}/>
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
      </div>
      {/* Кабінет клієнта */}
      {clientCabinetOpen && thisUserIdToCabinet && (
        <ClientCabinet
          userId={thisUserIdToCabinet}
          onCreateOrder={()=>{}}
          onOpenChat={()=>{}}
          onOpenProfile={()=>{}}
          onClose={()=>setClientCabinetOpen(false)}
        />
      )}

    </>
  );
};

export default ClientChangerUIArtem;
