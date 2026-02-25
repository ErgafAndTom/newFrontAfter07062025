import React, { useEffect, useState, useCallback } from "react";

import './ClientArtem.css';
import './ClientsMenuu.css';
import www from "./www.svg";
import whiteSVG from "../../components/whiteSVG.svg";
import axios from "../../api/axiosInstance";
import barcode from "./public/mask-group-10.svg";
import profile from "./public/mask-group-11@2x.png";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Spinner, ListGroup, InputGroup } from "react-bootstrap";
import { buttonStyles, containerStyles, formStyles } from './styles';
import { useSelector } from "react-redux";
import TelegramAvatar from "../../PrintPeaksFAinal/Messages/TelegramAvatar";
import PaidButtomProgressBar from "../../PrintPeaksFAinal/tools/PaidButtomProgressBar";
import ClientSelectionModal from "./ClientSelectionModal";
import ClientCabinet from "./ClientCabinet";
import { FiUser } from "react-icons/fi";
import { FiFolder } from "react-icons/fi";
import "./ClientCabinet.css";
import PaysInOrderRestored_OrdersLike from "./pays/PaysInOrderRestored_OrdersLike";

const ClientChangerUIArtem = ({ thisOrder, setThisOrder, setSelectedThings2 }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [clientCabinetOpen, setClientCabinetOpen] = useState(true);
  const [showDocGenerate, setShowDocGenerate] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [showNP, setShowNP] = useState(false);
  const [showPays, setShowPays] = useState(false);
  const [load, setLoad] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchId, setSearchId] = useState(false);
  const [typeSelect, setTypeSelect] = useState("");
  const [users, setUsers] = useState({ rows: [] });
  const [show, setShow] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [error, setError] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [bestDiscount, setBestDiscount] = useState(null);
  const [thisUserIdToCabinet, setThisUserIdToCabinet] = useState(0);

  const [handleThisOrderChange, setHandleThisOrderChange] = useState(thisOrder);
  const [newThisOrder, setNewThisOrder] = useState(thisOrder);

  const handleClose = () => {
    setShowVisible(false);
    const timer = setTimeout(() => setShow(false), 300);
    return () => clearTimeout(timer);
  };
  const handleCloseAddUser = () => setModalVisible(false);

  const handleShow = () => {
    if (currentUser.role === "admin" || currentUser.role === "operator") {
      setShowVisible(true);
      setShow(true);
      setSearchQuery("");
    }
  };

  const fetchUsers = async () => {
    const data = {
      name: "",
      inPageCount: 9999,
      currentPage: 1,
      search: searchQuery,
      searchId: searchId,
      columnName: { column: "id", reverse: false },
    };
    setLoad(true);
    setError(null);
    try {
      const response = await axios.post(`/user/all`, data);
      setUsers(response.data);
      setFilteredUsers(response.data.rows);
    } catch (error) {
      if (error.response && error.response.status === 403) navigate('/login');
      setError(error.message);
      console.error(error.message);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (show) fetchUsers();
  }, [searchQuery, show, searchId]);

  const applyBestDiscount = useCallback(
    async (userId) => {
      if (!userId) return;
      try {
        const { data } = await axios.post('/users/set-best-discount', { userId });
        // очікується { bestDiscount: number } або подібна відповідь
        setBestDiscount(data.bestDiscount);

        // підставляємо відразу в локальний стан замовлення
        setThisOrder((prev) => {
          if (!prev) return prev;
          const prevClient = prev.client || {};
          return {
            ...prev,
            client: { ...prevClient, discount: data.bestDiscount },
          };
        });
      } catch (err) {
        console.error('Помилка при оновленні найкращої знижки:', err);
      }
    },
    [setThisOrder]
  );

  const handleSelectUser = async (userId) => {
    const data = { orderId: thisOrder.id, userId };
    setShow(false);
    setLoad(true);
    setError(null);

    try {
      const response = await axios.put(`/orders/OneOrder/user`, data);
      // після прив’язки клієнта до замовлення — зберігаємо ліпшу знижку на сервері та в стані
      setThisOrder(response.data);
      setSelectedThings2(response.data.OrderUnits);
      await applyBestDiscount(userId);
    } catch (error) {
      if (error.response && error.response.status === 403) navigate('/login');
      setError(error);
      console.error(error.message);
    } finally {
      setLoad(false);
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

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
      default:
        break;
    }
    if (url) window.open(url, '_blank');
  };

  const handleAddNewUser = () => setShowAddUser(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("🤖:").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // прибрати через 3 секунди
    });
  };
  const setThisUserToCabinetFunc = (open, user, e) => {
    e.stopPropagation();
    setThisUserIdToCabinet(user.id);
    setClientCabinetOpen(open);
  };

  const handleUserAdded = (newUser) => {
    fetchUsers();
    if (newUser && newUser.id) handleSelectUser(newUser.id);
  };

  // коли вже є клієнт у замовленні — гарантуємо, що його найкраща знижка збережена/підтягнута
  useEffect(() => {
    if (thisOrder?.client?.id) applyBestDiscount(thisOrder.client.id);

  }, [thisOrder?.client?.id]);

  return (
    <div className="">
      <div
        onClick={handleShow}
      >
        <div style={{ display: 'flex', alignItems: 'start', justifyContent:"start", gap: '1vw', padding: '0vw' }}>
          {thisOrder.client ? (
            <div  style={{ position: "relative", padding:"0"}}>
              <div
                onClick={handleCopy}
                style={{
                  flexColumn: "row",
                  fontSize: "clamp(1rem, 2.5vh, 3.5vh)",
                  textTransform: "uppercase",
                  color: "#646462",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  fontWeight: "400",
                  width: "31.5vw",
                  overflow: "hidden",
                  maxWidth: "30vw",
                  
                  cursor: "pointer",
                  userSelect: "none",

                }}
                title="Натисни, щоб скопіювати 🤖:"
              >
                🤖:{thisOrder.client.id} – {thisOrder.client.lastName}{" "}
                {thisOrder.client.firstName} {thisOrder.client.familyName}
                <div
                  style={{
                    marginTop: "0.5rem",
                    height: "10px",
                    background: "transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                />
              </div>

              {/* Анімований текст підтвердження */}
              {copied && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    marginTop: "0.2rem",
                    // fontSize: "0.9rem",
                    color: "#62625d",
                    opacity: copied ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                    animation: "fadeOut 3s forwards",
                  }}
                >
                  Скопійовано до буферу обміну
                </div>
              )}

              <style>
                {`
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 0.5; }
            100% { opacity: 0; }
          }
        `}
              </style>
              <strong className="adminTextBig" style={{ position: "fixed", bottom: "8vh",  }}>
                <span className="adminTextBig">    </span>
              </strong>
            </div>
          ) : (
            <span style={{ background: "#f7f5ee" }}>Вибрати клієнта</span>
          )}
        </div>

        <div style={{ position: "absolute", right: "0.5vw", top: "0.5vh" }}>
          {thisOrder.client && (
            <div className="client-details adminTextBig" style={{  marginLeft: "1vw" }}>
              {thisOrder.client.address && <span className="adminTextBig">{thisOrder.client.address}</span>}
            </div>
          )}
        </div>

        <div className="d-flex flex-row justify-content-between" >
        <div>
          {thisOrder?.client?.phoneNumber && (
            <span className="" style={{

              fontSize: 'clamp(1rem, 2.5vh, 3.5vh)',
              textTransform: 'uppercase',
              color: '#646462',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontWeight: '400',
            }}>{thisOrder.client.phoneNumber}</span>
          )}
        </div>
        <div className="d-flex flex-row align-items-center justify-content-end" >
          {thisOrder.client && (

            <div className="d-flex align-items-center gap-3" style={{  right: '0vw', top: '0vh', cursor: 'pointer' }}
                 title={`@${thisOrder.client?.telegram?.replace(/^@/, '')}`}
                 onClick={() => openMessenger('telegram')}>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (thisOrder?.client?.id) {
                    window.open(`https://drive.google.com/drive/folders/1zpPDvQF2g_QcE3i6SCemKhg81rqLHag3`, '_blank');
                  } else {
                    setError('Спочатку виберіть клієнта');
                  }
                }}
                title="Файли клієнта"
                aria-label="Файли клієнта"
                className="icon-btn client-cabinet-icon icon-btn--outlined folder-btn"
              >
                <FiFolder size={30} color="rgba(0,0,0,0.6)" />
              </button>

              <button
                className="clientCabinetButton client-cabinet-icon"
                onClick={(e) => setThisUserToCabinetFunc(true, thisOrder.client, e)}
                title="Кабінет клієнта"
              >
                <FiUser size={30} />
              </button>

              <TelegramAvatar link={thisOrder.client?.telegram} size={80} />
            </div>
          )}
        </div>
        </div>

      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mt-2" role="alert">
          {error?.message} {error?.response?.data?.error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

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

      <div style={{ position: "absolute", bottom: "0", left: "0vw" }}>
        <PaidButtomProgressBar
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          setNewThisOrder={setNewThisOrder}
          setSelectedThings2={setSelectedThings2}
          handleThisOrderChange={handleThisOrderChange}
          setShowPays={setShowPays}
        />

        <div style={{ zIndex: 2000 }}>
          {showPays && (
            <PaysInOrderRestored_OrdersLike
              showPays={showPays}
              setShowPays={setShowPays}
              thisOrder={thisOrder}
              setThisOrder={setThisOrder}
            />
          )}
        </div>
      </div>

      <div style={{ zIndex: 2000 }}>
        <Modal show={showDocGenerate} onHide={() => setShowDocGenerate(false)} size="lg" centered>
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
                      <img src={whiteSVG} alt="Договір" style={{ width: '64px', height: '64px', zIndex: 2000, marginBottom: '15px' }} />
                      <h5 className="card-title">Договір</h5>
                      <p className="card-text">Створення договору для замовлення</p>
                      <button
                        onClick={() => thisOrder?.id && window.open(`/api/documents/contract/${thisOrder.id}`, '_blank')}
                        style={{ ...buttonStyles.base, ...buttonStyles.primary, width: '100%' }}
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
                      <img src={barcode} alt="Накладна" style={{ width: '64px', height: '64px', marginBottom: '15px' }} />
                      <h5 className="card-title">Накладна</h5>
                      <p className="card-text">Створення накладної для замовлення</p>
                      <button
                        onClick={() => thisOrder?.id && window.open(`/api/documents/invoice/${thisOrder.id}`, '_blank')}
                        style={{ ...buttonStyles.base, ...buttonStyles.primary, width: '100%' }}
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
                      <img src={profile} alt="Акт" style={{ width: '64px', height: '64px', marginBottom: '15px' }} />
                      <h5 className="card-title">Акт виконаних робіт</h5>
                      <p className="card-text">Створення акту виконаних робіт</p>
                      <button
                        onClick={() => thisOrder?.id && window.open(`/api/documents/act/${thisOrder.id}`, '_blank')}
                        style={{ ...buttonStyles.base, ...buttonStyles.primary, width: '100%' }}
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
                      <img src={www} alt="Рахунок-фактура" style={{ width: '64px', height: '64px', marginBottom: '15px' }} />
                      <h5 className="card-title">Рахунок-фактура</h5>
                      <p className="card-text">Створення рахунку-фактури для замовлення</p>
                      <button
                        onClick={() => {
                          if (thisOrder?.id) {
                            window.open(`/api/documents/invoice-print/${thisOrder.id}`, '_blank');
                            setShowDocGenerate(false);
                          }
                        }}
                        style={{ ...buttonStyles.base, ...buttonStyles.primary, width: '100%' }}
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
            <button onClick={() => setShowDocGenerate(false)} style={{ ...buttonStyles.base, ...buttonStyles.close }}>
              Закрити
            </button>
          </Modal.Footer>
        </Modal>
      </div>

      {clientCabinetOpen && thisUserIdToCabinet && (
        <ClientCabinet
          userId={thisUserIdToCabinet}
          onCreateOrder={() => {}}
          onOpenChat={() => {}}
          onOpenProfile={() => {}}
          onClose={() => setClientCabinetOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientChangerUIArtem;
