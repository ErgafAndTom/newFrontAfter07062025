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
};

const PopupLeftNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [taskData, setTaskData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [show, setShow] = useState(false);
  const popupRef = useRef(null);

  const totalCount = taskData.length + paymentData.length;

  const toggle = () => setShow((prev) => !prev);

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
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const portalRoot = document.getElementById('notification-root');
  if (!portalRoot) return null;

  return (
    <>
      <BellButton count={totalCount} onClick={toggle} />

      {show && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '22vw',
            marginTop: '5vh',
            backgroundColor: 'var(--adminfon, #f2f0e7)',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '0',
            padding: '1vh 1vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 9999,
          }}
        >
          {/* Сповіщення оплат */}
          {paymentData.map((notif) => (
            <div
              key={`pay-${notif.id}`}
              style={{
                background: 'var(--adminlightgreen, #e2f2eb)',
                borderBottom: '2px solid var(--admingreen, #0e935b)',
                borderRadius: '0',
                padding: '0.8vh 0.6vw',
                marginBottom: '1vh',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5vw',
                cursor: 'pointer',
              }}
            >
              <div
                style={{ flexGrow: 1, fontSize: 'var(--font-size-s, 17px)', color: 'var(--admingrey, #666)' }}
                onClick={() => handlePaymentClick(notif.orderId)}
              >
                Оплата {METHOD_LABELS[notif.method] || notif.method} замовлення №{notif.orderId} на суму{' '}
                <strong style={{ color: 'var(--admingreen, #0e935b)' }}>{notif.amount} грн</strong>
              </div>
              <button
                style={{
                  background: 'transparent',
                  border: '2px solid var(--admingreen, #0e935b)',
                  borderRadius: '0',
                  padding: '0.3vh 0.6vw',
                  color: 'var(--admingreen, #0e935b)',
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-s, 17px)',
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissPayment(notif.id);
                }}
              >
                ✓
              </button>
            </div>
          ))}

          {/* Завдання (trello cards) */}
          {taskData.map((card) => (
            <div key={`task-${card.id}`} style={{
              background: 'var(--adminfonelement, #fbfaf6)',
              borderBottom: '2px solid var(--adminorange, #f5a623)',
              borderRadius: '0',
              padding: '0.8vh 0.6vw',
              marginBottom: '1vh',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5vw'
            }}>
              <div style={{ flexGrow: 1 }}>
                <div style={{ marginBottom: '0.5vh', fontSize: 'var(--font-size-s, 17px)', color: 'var(--admingrey, #666)' }}>
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
                style={{
                  background: 'transparent',
                  border: '2px solid var(--adminorange, #f5a623)',
                  borderRadius: '0',
                  padding: '0.3vh 0.6vw',
                  color: 'var(--adminorange, #f5a623)',
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-s, 17px)',
                }}
                onClick={() => handleCompleteTask(card.id)}
              >
                ✓
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
