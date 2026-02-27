import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";

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
import "./ClientCabinet.css";
import PaysInOrderRestored_OrdersLike from "./pays/PaysInOrderRestored_OrdersLike";

const ClientChangerUIArtem = ({ thisOrder, setThisOrder, setSelectedThings2, hidePaymentPanel = false, actionButtonSlot = null, statusTrackSlot = null }) => {
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
  const deadlineInputRef = useRef(null);
  const [deadlineAt, setDeadlineAt] = useState(thisOrder?.deadline || thisOrder?.finalManufacturingTime || null);
  const [deadlineCountdown, setDeadlineCountdown] = useState('');

  const [bestDiscount, setBestDiscount] = useState(null);
  const [thisUserIdToCabinet, setThisUserIdToCabinet] = useState(0);

  const [handleThisOrderChange, setHandleThisOrderChange] = useState(thisOrder);
  const [newThisOrder, setNewThisOrder] = useState(thisOrder);
  const canEditDeadline = currentUser?.role === 'admin';

  const progressCounterLabel = useMemo(() => {
    const stageCount = 6;
    const rawStatus = Number.parseInt(thisOrder?.status, 10);
    const normalizedStatus = Number.isFinite(rawStatus) ? Math.min(Math.max(rawStatus, 0), stageCount - 1) : 0;

    const paymentStatus = String(thisOrder?.Payment?.status || '').toUpperCase();
    let isPaid = paymentStatus === 'PAID';
    if (!isPaid && Array.isArray(thisOrder?.Payments)) {
      isPaid = thisOrder.Payments.some((item) => {
        const statusValue = String(item?.status || item?.payStatus || '').toUpperCase();
        return statusValue === 'PAID';
      });
    }

    const completed = Math.min(stageCount, normalizedStatus + 1 + (isPaid ? 1 : 0));
    return `${completed}/${stageCount}`;
  }, [thisOrder?.status, thisOrder?.Payment?.status, thisOrder?.Payments]);

  const progressCounterTone = useMemo(() => {
    const rawStatus = Number.parseInt(thisOrder?.status, 10);
    const normalizedStatus = Number.isFinite(rawStatus) ? Math.min(Math.max(rawStatus, 0), 5) : 0;

    const tones = ['warn', 'brown', 'blue', 'pink', 'purple', 'green'];
    return tones[normalizedStatus] || 'warn';
  }, [thisOrder?.status]);

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
    navigator.clipboard.writeText(String(thisOrder?.client?.id ?? '')).then(() => {
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

  useEffect(() => {
    setDeadlineAt(thisOrder?.deadline || thisOrder?.finalManufacturingTime || null);
  }, [thisOrder?.deadline, thisOrder?.finalManufacturingTime]);

  useEffect(() => {
    if (!deadlineAt) {
      setDeadlineCountdown('');
      return undefined;
    }

    const formatDuration = (ms) => {
      const totalSeconds = Math.floor(Math.abs(ms) / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (days > 0) return `${days}д ${String(hours).padStart(2, '0')}г`;
      return `${String(hours).padStart(2, '0')}г ${String(minutes).padStart(2, '0')}хв`;
    };

    const tick = () => {
      const diff = new Date(deadlineAt).getTime() - Date.now();
      if (Number.isNaN(diff)) {
        setDeadlineCountdown('—');
        return;
      }
      setDeadlineCountdown(diff >= 0 ? formatDuration(diff) : `-${formatDuration(diff)}`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadlineAt]);

  const openDeadlinePicker = () => {
    if (!canEditDeadline) return;
    if (deadlineInputRef.current?.showPicker) {
      deadlineInputRef.current.showPicker();
      return;
    }
    deadlineInputRef.current?.click();
  };

  const handleDeadlineInputChange = async (event) => {
    const value = event.target.value;
    if (!value || !thisOrder?.id) return;

    const selectedDate = new Date(value);
    if (!Number.isFinite(selectedDate.getTime())) return;

    const isoDeadline = selectedDate.toISOString();
    const startedAt = thisOrder?.manufacturingStartTime || new Date().toISOString();

    setDeadlineAt(isoDeadline);
    setThisOrder((prev) => (prev ? {
      ...prev,
      deadline: isoDeadline,
      manufacturingStartTime: startedAt,
    } : prev));

    if (!canEditDeadline) return;

    try {
      const { data: deadlineData } = await axios.put('/orders/OneOrder/deadlineUpdate', {
        thisOrderId: thisOrder.id,
        deadlineNew: isoDeadline,
      });

      const persistedDeadline = deadlineData?.deadline || isoDeadline;
      setDeadlineAt(persistedDeadline);
      setThisOrder((prev) => (prev ? {
        ...prev,
        deadline: persistedDeadline,
        manufacturingStartTime: startedAt,
      } : prev));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Помилка збереження дедлайну');
    }
  };

  const openFilesFolder = (e) => {
    e?.stopPropagation?.();
    if (thisOrder?.client?.id) {
      window.open('https://drive.google.com/drive/folders/1zpPDvQF2g_QcE3i6SCemKhg81rqLHag3', '_blank');
      return;
    }
    setError('Спочатку виберіть клієнта');
  };

  return (
    <div className={`nui-client-envelope-shell tone-${progressCounterTone}`} style={{ position: 'relative', height: '100%', padding: hidePaymentPanel ? '0.6rem 0.8rem 0.5rem' : '0.6rem 0.8rem 6.2rem' }}>
      <div className="nui-client-envelope-grid">
        <div className="nui-client-envelope-card">
          <div className="nui-client-card-layout">
            <div className="nui-client-avatar-wrap" onClick={() => openMessenger('telegram')} style={{ cursor: 'pointer' }}>
              <TelegramAvatar link={thisOrder?.client?.telegram} size={56} square={true} />
              <span className="nui-client-id-badge-on-avatar" onClick={handleCopy} title="Натисни, щоб скопіювати id">
                ID {thisOrder?.client?.id ?? '—'}
              </span>
            </div>

            <div className="nui-client-card-right">
              <div className="nui-client-meta-block">
                <div className="nui-client-title-row">
                  <span className="nui-client-name-line">
                    {thisOrder?.client
                      ? `${thisOrder.client.lastName || ''} ${thisOrder.client.firstName || ''} ${thisOrder.client.familyName || ''}`.trim()
                      : 'Клієнт не вибраний'}
                  </span>
                </div>
                <span className="nui-client-phone-line">{thisOrder?.client?.phoneNumber || '—'}</span>
              </div>

              <div className="nui-client-rect-actions">
                <button
                  type="button"
                  className="nui-client-rect-btn"
                  onClick={(e) => setThisUserToCabinetFunc(true, thisOrder?.client, e)}
                  disabled={!thisOrder?.client}
              >
                <span className="nui-client-rect-btn-text">Кабінет замовника</span>
              </button>

                <button
                  type="button"
                  className="nui-client-rect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShow();
                  }}
                >
                  <span className="nui-client-rect-btn-text">Вибрати клієнта</span>
                </button>
              </div>
            </div>
          </div>

          {thisOrder?.client?.address && (
            <div className="nui-client-address-line">
              {thisOrder.client.address}
            </div>
          )}
        </div>

        <div className="nui-client-controls-card" onClick={(e) => e.stopPropagation()}>
          <div className="nui-client-controls-row">
            {!deadlineCountdown && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeadlinePicker();
                }}
                disabled={!canEditDeadline}
                className="nui-client-rect-btn nui-client-deadline-btn"
              >
                <span className="nui-client-rect-btn-text">Дедлайн</span>
              </button>
            )}
            <button
              type="button"
              onClick={openFilesFolder}
              className="nui-client-rect-btn"
            >
              <span className="nui-client-rect-btn-text">Файли замовлення</span>
            </button>
            <div className={`nui-client-step-counter-btn tone-${progressCounterTone}`} aria-hidden="true">{progressCounterLabel}</div>
            {actionButtonSlot}
            <input
              ref={deadlineInputRef}
              type="datetime-local"
              onChange={handleDeadlineInputChange}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            />
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

      {!hidePaymentPanel && (
      <div style={{ position: "absolute", bottom: "8vh", left: "0", right: "auto", width: "max-content" }}>
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
      )}

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

      {clientCabinetOpen && Boolean(thisUserIdToCabinet) && (
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
