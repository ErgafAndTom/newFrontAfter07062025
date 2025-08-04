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
import {useSelector} from "react-redux";
import TelegramAvatar from "../../PrintPeaksFAinal/Messages/TelegramAvatar";
import PaidButtomProgressBar from "../../PrintPeaksFAinal/tools/PaidButtomProgressBar";
import ClientSelectionModal from "./ClientSelectionModal";


const ClientChangerUIArtem = ({thisOrder, setThisOrder, setSelectedThings2}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDocGenerate, setShowDocGenerate] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
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

          // width: '30vw',
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
            <div className="" style={{fontSize: '1.7vh', position: "relative"}}>
              <div className="fw-bold d-flex " style={{flexcolumn: 'row'}}>
                {thisOrder.client.lastName} {thisOrder.client.firstName} {thisOrder.client.familyName}

              </div>
              <strong className="" style={{position: "fixed", bottom: "8vh", marginLeft:"-1vw"}}>
            <span
              className="">     Знижка: {thisOrder.client.discount}%</span></strong>

            </div>

          ) : (

            <span style={{background: "#f2f0e7"}}>Вибрати клієнта</span>
          )}
        </div>
        <div style={{position: "absolute", right: "0.5vw", top: "0.5vh"}}>
          {thisOrder.client && (
            <div className="client-details" style={{fontSize: '1.5vmin', marginLeft: "1vw"}}>


              {thisOrder.client.address && (
                <span className="">{thisOrder.client.address}</span>
              )}

            </div>
          )}
        </div>
        <div className="d-flex align-items-center"
             style={{ position: "absolute", right: '0vw', top: '1vh'}}>
          {thisOrder.client && thisOrder.client.telegram && (
            <div
              className="d-flex align-items-center"
              style={{

                position: 'absolute',
                right: '1vw',
                top: '0vh',
                cursor: 'pointer'
              }}
              title={`@${thisOrder.client.telegram.replace(/^@/, '')}`}
              onClick={() => openMessenger('telegram')}
            >
              <TelegramAvatar
                link={thisOrder.client.telegram}
                size={70}
                defaultSrc="/default-avatar.png"
              />

            </div>

          )}
        </div>
        <div>
          {thisOrder?.client?.phoneNumber && (
            <span className="" style={{ fontSize:"2vh" }}>{thisOrder.client.phoneNumber}</span>
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
      />
    </div>





      {/* Модальне вікно для додавання нового користувача */}
      <div style={{position: "absolute", bottom: "0", left: "0vw", }}>
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
        {showPays && <PaysInOrderRestored showPays={showPays} setShowPays={setShowPays} thisOrder={thisOrder}
                                          setThisOrder={setThisOrder}/>}
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
    </>
  );
};

export default ClientChangerUIArtem;
