import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import {useDispatch, useSelector} from 'react-redux';
import BellButton from './BellButton';
import {fetchTrelloData} from "../../actions/trello_async_actions";

const METHOD_LABELS = {
  cash: 'готівкою',
  terminal: 'карткою',
  link: 'посиланням',
  invoice: 'за рахунком',
  iban: 'на IBAN',
  expired: 'протерміновано',
  invoice_overdue: 'рахунок прострочений',
  mockup: 'макет чашки',
};

const PopupLeftNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [taskData, setTaskData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [show, setShow] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
  const bellWrapRef = useRef(null);
  const prevCountRef = useRef(0);

  const totalCount = taskData.length + paymentData.length;

  // Звук сповіщення (синтетичний спуск затвору камери)
  const playShutterSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;

      // Перший клік (вищий тон)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Другий клік (нижчий тон)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.setValueAtTime(100, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(50, now + 0.18);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.18);
    } catch (err) {
      console.warn('Помилка звуку:', err);
    }
  };

  useEffect(() => {
    if (totalCount > prevCountRef.current) {
      playShutterSound();
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  const toggle = () => {
    if (!show) {
      const navCenterGroup = document.querySelector('.nav-center-group');
      if (navCenterGroup) {
        const rect = navCenterGroup.getBoundingClientRect();
        const popupWidth = 0.18 * window.innerWidth;
        const left = Math.max(0, rect.right - popupWidth);
        setPopupPos({ top: rect.bottom, left });
      }
    }
    setShow((prev) => !prev);
  };

  // Завдання (trello cards)
  const handleCompleteTask = async (id) => {
    const response = await axios.put('/trello/updateCardCompleteZadacha', {
      cardId: id,
      userId: currentUser.id,
    });
    if (response.status === 200) {
      setTaskData(response.data);
      dispatch(fetchTrelloData());
    }
  };

  // Оплати — dismiss
  const handleDismissPayment = async (id) => {
    try {
      const response = await axios.put(`/trello/paymentNotifications/${id}/dismiss`);
      if (response.status === 200) {
        setPaymentData(response.data);
      }
    } catch (err) {
      console.error('dismiss error', err);
    }
  };

  // Клік на сповіщення оплати — перехід до замовлення
  const handlePaymentClick = (orderId) => {
    setShow(false);
    navigate(`/Orders/${orderId}`);
  };

  // Fetch tasks
  useEffect(() => {
    if (!currentUser?.id) return;
    axios.post('/trello/getdataPost', { userId: currentUser.id })
      .then(res => setTaskData(res.data))
      .catch(console.error);
  }, [currentUser?.id]);

  // Fetch payment notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    axios.post('/trello/paymentNotifications')
      .then(res => setPaymentData(res.data))
      .catch(console.error);

    // Polling кожні 15 сек
    const interval = setInterval(() => {
      axios.post('/trello/paymentNotifications')
        .then(res => setPaymentData(res.data))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inPopup = popupRef.current && popupRef.current.contains(e.target);
      const inBell  = bellWrapRef.current && bellWrapRef.current.contains(e.target);
      if (!inPopup && !inBell) setShow(false);
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const portalRoot = document.getElementById('notification-root');
  if (!portalRoot) return null;

  return (
    <>
      <div ref={bellWrapRef} className="nav-ctrl-btn-wrap">
        <BellButton count={totalCount} onClick={toggle} />
      </div>

      {show && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: popupPos.top + 32,
            left: popupPos.left,
            width: '18vw',
            backgroundColor: 'var(--adminfonelement, #f2f0e9)',
            boxShadow: 'none',
            borderRadius: '0',
            padding: '0.7rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 9999,
          }}
        >
          {/* Сповіщення оплат */}
          {paymentData.map((notif) => {
            const isExpired = notif.method === 'expired';
            const isInvoiceOverdue = notif.method === 'invoice_overdue';
            const isRepeat = notif.isRepeat;

            let bgColor, borderColor, accentColor, btnStyle;
            if (isInvoiceOverdue) {
              bgColor = '#fff5ee';
              borderColor = 'var(--admincoral, #ff7f50)';
              accentColor = 'var(--admincoral, #ff7f50)';
              btnStyle = { '--notif-btn-1': '#ff9670', '--notif-btn-2': '#ff7f50', '--notif-btn-3': '#e06a3a' };
            } else if (isExpired) {
              bgColor = 'var(--adminlightred, #fde8e5)';
              borderColor = 'var(--adminred, #ee3c23)';
              accentColor = 'var(--adminred, #ee3c23)';
              btnStyle = { '--notif-btn-1': '#f25040', '--notif-btn-2': '#ee3c23', '--notif-btn-3': '#d42f1a' };
            } else if (isRepeat) {
              bgColor = 'var(--adminlightpurple, #edebf9)';
              borderColor = 'var(--adminpurple, #6a5acd)';
              accentColor = 'var(--adminpurple, #6a5acd)';
              btnStyle = { '--notif-btn-1': '#8070d4', '--notif-btn-2': '#6a5acd', '--notif-btn-3': '#5a4abf' };
            } else if (notif.method === 'mockup') {
              bgColor = 'var(--adminlightorange, #fef4e5)';
              borderColor = 'var(--adminorange, #f5a623)';
              accentColor = 'var(--adminorange, #f5a623)';
              btnStyle = { '--notif-btn-1': '#f7b84a', '--notif-btn-2': '#f5a623', '--notif-btn-3': '#e09510' };
            } else {
              bgColor = 'var(--adminlightgreen, #e2f2eb)';
              borderColor = 'var(--admingreen, #0e935b)';
              accentColor = 'var(--admingreen, #0e935b)';
              btnStyle = undefined;
            }

            const isMockup = notif.method === 'mockup';
            const label = isInvoiceOverdue
              ? `Рахунок`
              : isExpired
              ? 'Оплата протермінована'
              : isMockup ? 'Підтвердили' : isRepeat ? 'Повторна оплата' : 'Оплата';
            const methodSuffix = isInvoiceOverdue
              ? ''
              : isExpired ? '' : ` ${METHOD_LABELS[notif.method] || notif.method}`;

            return (
              <div
                key={`pay-${notif.id}`}
                style={{
                  background: bgColor,
                  borderBottom: `2px solid ${borderColor}`,
                  borderRadius: '0',
                  padding: '0.8vh 0.6vw',
                  marginBottom: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5vw',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{ flexGrow: 1, fontSize: 'var(--font-size-s, 17px)', color: 'var(--admingrey, #666)', fontWeight: 400 }}
                  onClick={() => handlePaymentClick(notif.orderId)}
                >
                  {isInvoiceOverdue ? (
                    <>Рахунок№{notif.orderId} на суму{' '}
                      <strong style={{ color: accentColor, fontWeight: 700 }}>{notif.amount} грн</strong>
                      {' '}ще не оплатили
                    </>
                  ) : (
                    <>{label}{methodSuffix} замовлення №{notif.orderId} на суму{' '}
                      <strong style={{ color: accentColor, fontWeight: 700 }}>{notif.amount} грн</strong>
                    </>
                  )}
                </div>
                {!isExpired && (
                  <button
                    className="notification-check-btn"
                    style={btnStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissPayment(notif.id);
                    }}
                  >
                    <span>&#10003;</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Завдання (trello cards) */}
          {taskData.map((card) => (
            <div key={`task-${card.id}`} style={{
              background: 'var(--adminfonelement, #f1eee7)',
              borderBottom: '2px solid var(--adminorange, #f5a623)',
              borderRadius: '0',
              padding: '0.8vh 0.6vw',
              marginBottom: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5vw'
            }}>
              <div style={{ flexGrow: 1 }}>
                <div style={{ marginBottom: '0.5vh', fontSize: 'var(--font-size-s, 17px)', color: 'var(--admingrey, #666)', fontWeight: 400 }}>
                  {card.content}
                </div>
                {card.inTrelloPhoto && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3vw' }}>
                    {card.inTrelloPhoto.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`/images/${photo.photoLink}`}
                        alt=""
                        style={{
                          height: '3.5vh', objectFit: 'cover',
                          borderRadius: '0', pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                className="notification-check-btn"
                style={{
                  '--notif-btn-1': '#f7c23b',
                  '--notif-btn-2': '#f5a623',
                  '--notif-btn-3': '#e89810',
                }}
                onClick={() => handleCompleteTask(card.id)}
              >
                <span>&#10003;</span>
              </button>
            </div>
          ))}

          {totalCount === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2vh 0',
              color: 'var(--admingrey, #666)',
              fontSize: 'var(--font-size-s, 17px)',
            }}>
              Немає сповіщень
            </div>
          )}
        </div>,
        portalRoot
      )}
    </>
  );
};

export default PopupLeftNotification;

