import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import uk from "date-fns/locale/uk";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchId, setSearchId] = useState(false);
  const [typeSelect, setTypeSelect] = useState("");
  const [users, setUsers] = useState({ rows: [], count: 0 });
  const [usersPage, setUsersPage] = useState(1);
  const [show, setShow] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [error, setError] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const PAGE_SIZE = 20;

  const searchMountedRef = useRef(false);
  const [deadlineAt, setDeadlineAt] = useState(thisOrder?.deadline || thisOrder?.finalManufacturingTime || null);
  const [deadlineCountdown, setDeadlineCountdown] = useState('');

  const [bestDiscount, setBestDiscount] = useState(null);
  const [thisUserIdToCabinet, setThisUserIdToCabinet] = useState(0);

  const [handleThisOrderChange, setHandleThisOrderChange] = useState(thisOrder);
  const [newThisOrder, setNewThisOrder] = useState(thisOrder);
  const canEditDeadline = currentUser?.role === 'admin';
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });
  const deadlineBtnRef = useRef(null);
  registerLocale('uk', uk);

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
      setSearchQuery("");
      setShowVisible(true);
      setShow(true);
    }
  };

  const fetchUsers = async (query = searchQuery, byId = searchId, page = 1) => {
    const isFirst = page === 1;
    isFirst ? setLoad(true) : setLoadingMore(true);
    setError(null);
    try {
      const response = await axios.post(`/user/all`, {
        name: "",
        inPageCount: PAGE_SIZE,
        currentPage: page,
        search: query,
        searchId: byId,
        columnName: { column: "id", reverse: true },
      });
      const newRows = response.data.rows || [];
      if (isFirst) {
        setUsers(response.data);
        setFilteredUsers(newRows);
      } else {
        setUsers(prev => ({ ...prev, rows: [...prev.rows, ...newRows] }));
        setFilteredUsers(prev => [...prev, ...newRows]);
      }
      setUsersPage(page);
    } catch (error) {
      if (error.response && error.response.status === 403) navigate('/login');
      setError(error.message);
      console.error(error.message);
    } finally {
      isFirst ? setLoad(false) : setLoadingMore(false);
    }
  };

  const loadMoreUsers = useCallback(() => {
    const totalLoaded = filteredUsers.length;
    const total = users.count || 0;
    if (loadingMore || load || totalLoaded >= total) return;
    fetchUsers(searchQuery, searchId, usersPage + 1);
  }, [filteredUsers.length, users.count, loadingMore, load, searchQuery, searchId, usersPage]);

  // перше завантаження при відкритті модалки
  useEffect(() => {
    if (!show) {
      searchMountedRef.current = false;
      return;
    }
    searchMountedRef.current = true;
    setUsersPage(1);
    fetchUsers(searchQuery, searchId, 1);
  }, [show]);

  // debounce пошуку — тільки коли змінюється запит після відкриття
  useEffect(() => {
    if (!show || !searchMountedRef.current) return;
    const timer = setTimeout(() => {
      setUsersPage(1);
      fetchUsers(searchQuery, searchId, 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, searchId]);

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
    if (deadlineBtnRef.current) {
      const rect = deadlineBtnRef.current.getBoundingClientRect();
      const calHeight = 360;
      const top = rect.top - calHeight > 0 ? rect.top - calHeight : rect.bottom;
      setDatePickerPos({ top, left: rect.left });
    }
    setShowDatePicker(true);
  };

  const handleDeadlineInputChange = async (date) => {
    setShowDatePicker(false);
    const event = { target: { value: date ? date.toISOString().slice(0,16) : '' } };
    return handleDeadlineInputChangeOld(event);
  };

  const handleDeadlineInputChangeOld = async (event) => {
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
    <div className={`nui-client-envelope-shell tone-${progressCounterTone}`} >
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
                {thisOrder?.client?.Company?.companyName && (
                  <span className="nui-client-company-line">{thisOrder.client.Company.companyName}</span>
                )}
              </div>

              <div className="nui-client-rect-actions">
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

                <button
                  type="button"
                  className="nui-client-rect-btn"
                  onClick={(e) => setThisUserToCabinetFunc(true, thisOrder?.client, e)}
                  disabled={!thisOrder?.client}
                >
                  <span className="nui-client-rect-btn-text">Кабінет</span>
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
                ref={deadlineBtnRef}
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
            {showDatePicker && ReactDOM.createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: datePickerPos.top,
                  left: datePickerPos.left,
                  zIndex: 999999,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DatePicker
                  inline
                  showTimeSelect
                  locale="uk"
                  selected={deadlineAt ? new Date(deadlineAt) : null}
                  onChange={handleDeadlineInputChange}
                  onClickOutside={() => setShowDatePicker(false)}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  calendarClassName="nui-datepicker"
                />
              </div>,
              document.body
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
          loadingMore={loadingMore}
          loadMoreUsers={loadMoreUsers}
          error={error}
          modalVisible={modalVisible}
          handleCloseAddUser={handleCloseAddUser}
          setModalVisible={setModalVisible}
          setShowPays={setShowPays}
          setSearchQuery={setSearchQuery}
          searchId={searchId}
          setSearchId={setSearchId}
          handleUserAdded={handleUserAdded}
        />
      </div>

      {!hidePaymentPanel && (
      <div style={{ position: "absolute", bottom: "8vh", left: "0", right: "0", width: "100%" }}>
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
