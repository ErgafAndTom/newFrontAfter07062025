import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useSelector } from 'react-redux';
import BellButton from './BellButton';
import './PopupLeftNotification.css';
import { markAllTasksSeen, markTaskSeen, useTaskInbox } from '../../PrintPeaksFAinal/tasks/taskStore';
import { eventExcerpt, eventTitle, fmtAgo } from '../../PrintPeaksFAinal/tasks/taskMeta';

const METHOD_LABELS = {
  cash: 'готівкою',
  terminal: 'карткою',
  link: 'посиланням',
  invoice: 'за рахунком',
  iban: 'на IBAN',
  cod: 'наложений платіж',
  expired: 'протерміновано',
  invoice_overdue: 'рахунок прострочений',
  mockup: 'макет чашки',
};

const UKLON_STATUS_LABELS = {
  processing: '🔍 Шукаємо водія',
  driver_found: '🚗 Водій знайдений',
  driver_on_way: '🚗 Водій їде',
  driver_arrived: '📍 Водій прибув',
  parcel_picked_up: '📦 Посилку забрано',
  delivering: '🚚 Доставляється',
  delivered: '✅ Доставлено',
  completed: '✅ Завершено',
  canceled: '❌ Скасовано',
  cancelled: '❌ Скасовано',
  failed: '❌ Помилка',
};

const PopupLeftNotification = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'operator';
  // Завдання — спільне сховище розділу «Завдання» (те саме бачить плитка дока)
  const taskInbox = useTaskInbox(isStaff);
  const taskData = taskInbox.items;
  const taskUnread = taskInbox.counters?.unread || 0;
  const [paymentData, setPaymentData] = useState([]);
  const [uklonNotifs, setUklonNotifs] = useState([]);
  const [show, setShow] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
  const bellWrapRef = useRef(null);
  const prevCountRef = useRef(0);

  const totalCount = taskUnread + paymentData.length + uklonNotifs.length;

  // Звук сповіщення
  const playShutterSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;

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

  const isMobile = window.innerWidth <= 768;

  const toggle = () => {
    if (!show) {
      if (isMobile) {
        const navEl = document.querySelector('.flipNav');
        const bottom = navEl ? navEl.getBoundingClientRect().bottom : 0;
        setPopupPos({ top: bottom, left: 0 });
      } else {
        const bellRect = bellWrapRef.current?.getBoundingClientRect();
        const popupWidth = 0.18 * window.innerWidth;
        const rootStyle = getComputedStyle(document.documentElement);
        const sideW = document.body.classList.contains('pp-dockside-active')
          && !document.body.classList.contains('pp-dockside-left')
          ? parseFloat(rootStyle.getPropertyValue('--ppdock-sidew')) || 0
          : 0;

        const rightEdge = window.innerWidth - sideW - 8;
        // у куті дока панель тягнеться від лівого краю «Зміна відкрита» до правого краю
        const shiftRect = document.querySelector('.ppdock-corner .ppdock-shift')?.getBoundingClientRect();
        const left = shiftRect && shiftRect.width
          ? Math.max(8, Math.round(shiftRect.left))
          : Math.max(8, rightEdge - popupWidth);
        // Дзвоник живе то в навбарі, то в куті дока, і обидва можуть стояти
        // і вгорі, і внизу — тож напрям рахуємо з його фактичного місця, а
        // не з класу навбару: у нижній половині екрана панель іде вгору.
        const openUp = bellRect
          ? bellRect.top > window.innerHeight / 2
          : document.body.classList.contains('pp-nav-bottom');
        const top = bellRect ? bellRect.bottom : 0;
        const bottom = bellRect ? window.innerHeight - bellRect.top : 0;
        setPopupPos({ top, left, bottom, openUp });
      }
    }
    setShow((prev) => !prev);
  };

  const handleTaskClick = (id) => {
    setShow(false);
    navigate(`/Tasks?task=${id}`);
  };

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

  const handlePaymentClick = (orderId) => {
    setShow(false);
    navigate(`/Orders/${orderId}`);
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    axios.post('/trello/paymentNotifications')
      .then(res => setPaymentData(res.data))
      .catch(console.error);

    const interval = setInterval(() => {
      axios.post('/trello/paymentNotifications')
        .then(res => setPaymentData(res.data))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    const handler = (e) => {
      const { orderId, status, deliveryId, cancellation } = e.detail || {};
      if (!orderId || !status) return;
      const st = (status || '').toLowerCase();
      setUklonNotifs(prev => {
        const exists = prev.some(n => n.orderId === orderId && n.status === st);
        if (exists) return prev;
        const notif = {
          id: `uklon-${orderId}-${st}-${Date.now()}`,
          orderId,
          status: st,
          deliveryId,
          cancellation: cancellation || null,
          createdAt: new Date().toISOString(),
        };
        return [notif, ...prev];
      });
    };
    window.addEventListener('uklonStatusUpdate', handler);
    return () => window.removeEventListener('uklonStatusUpdate', handler);
  }, []);

  const handleDismissUklon = (id) => {
    setUklonNotifs(prev => prev.filter(n => n.id !== id));
  };

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
          className="notification-panel"
          role="dialog"
          aria-label="Центр сповіщень"
          style={{
            position: 'fixed',
            ...(isMobile
              ? { top: Math.max(0, popupPos.top - 8), bottom: 0 }
              : popupPos.openUp
                ? { bottom: popupPos.bottom + 8 }
                : { top: Math.max(8, popupPos.top - 8), bottom: 0 }),
            left: isMobile || !popupPos.left ? 'auto' : popupPos.left,
            right: 0,
            width: isMobile ? '100vw' : (popupPos.left ? 'auto' : '18vw'),
            minWidth: isMobile ? '100vw' : '300px',
            maxWidth: isMobile ? '100vw' : (popupPos.left ? 'none' : '380px'),
            maxHeight: !isMobile && popupPos.openUp ? '90vh' : 'none',
            zIndex: 9999,
          }}
        >
          {/* ── Хедер ── */}
          <div className="notification-panel__header">
            <div className="notification-panel__heading">
              <h2>Сповіщення</h2>
              <p>Оплати, доставка та завдання</p>
            </div>
            <span
              className="notification-panel__count"
              aria-label={`${totalCount} сповіщень`}
            >
              {totalCount}
            </span>
          </div>

          {/* ── Тіло ── */}
          <div className="notification-panel__body">

            {/* Оплати */}
            {paymentData.length > 0 && (
              <div className="notification-panel__group-label">Оплати</div>
            )}
            {paymentData.map((notif) => {
              const isExpired       = notif.method === 'expired';
              const isInvoiceOverdue = notif.method === 'invoice_overdue';
              const isIbanPending   = notif.method === 'iban' && !notif.isRepeat;
              const isRepeat        = notif.isRepeat;
              const isMockup        = notif.method === 'mockup';

              let accentColor, bgColor, borderColor, btnStyle;
              if (isIbanPending) {
                bgColor     = '#fff5ee';
                borderColor = 'var(--admincoral, #ff7f50)';
                accentColor = 'var(--admincoral, #ff7f50)';
                btnStyle    = null;
              } else if (isInvoiceOverdue) {
                bgColor     = '#fff5ee';
                borderColor = 'var(--admincoral, #ff7f50)';
                accentColor = 'var(--admincoral, #ff7f50)';
                btnStyle    = { '--notif-btn-1': '#ff9670', '--notif-btn-2': '#ff7f50', '--notif-btn-3': '#e06a3a' };
              } else if (isExpired) {
                bgColor     = 'var(--adminlightred, #fde8e5)';
                borderColor = 'var(--adminred, #ee3c23)';
                accentColor = 'var(--adminred, #ee3c23)';
                btnStyle    = { '--notif-btn-1': '#f25040', '--notif-btn-2': '#ee3c23', '--notif-btn-3': '#d42f1a' };
              } else if (isRepeat) {
                bgColor     = 'var(--adminlightpurple, #edebf9)';
                borderColor = 'var(--adminpurple, #6a5acd)';
                accentColor = 'var(--adminpurple, #6a5acd)';
                btnStyle    = { '--notif-btn-1': '#8070d4', '--notif-btn-2': '#6a5acd', '--notif-btn-3': '#5a4abf' };
              } else if (isMockup) {
                bgColor     = 'var(--adminlightorange, #fef4e5)';
                borderColor = 'var(--adminorange, #f5a623)';
                accentColor = 'var(--adminorange, #f5a623)';
                btnStyle    = { '--notif-btn-1': '#f7b84a', '--notif-btn-2': '#f5a623', '--notif-btn-3': '#e09510' };
              } else {
                bgColor     = 'var(--adminlightgreen, #e2f2eb)';
                borderColor = 'var(--admingreen, #0e935b)';
                accentColor = 'var(--admingreen, #0e935b)';
                btnStyle    = undefined;
              }

              const visualTone = isExpired ? 'danger'
                : isRepeat ? 'info'
                : isMockup ? 'task'
                : (isIbanPending || isInvoiceOverdue) ? 'warning'
                : 'success';

              const label = isIbanPending ? 'Очікування оплати'
                : isInvoiceOverdue ? 'Рахунок'
                : isExpired ? 'Оплата протермінована'
                : isMockup ? 'Підтвердили'
                : isRepeat ? 'Повторна оплата'
                : 'Оплата';

              // коротко, щоб сповіщення вміщалось в один рядок
              const shortLabel = isIbanPending ? 'Чекаємо на IBAN'
                : isInvoiceOverdue ? 'Рахунок не оплачено'
                : isExpired ? 'Протерміновано'
                : isMockup ? 'Макет підтверджено'
                : isRepeat ? `Повторна ${METHOD_LABELS[notif.method] || notif.method}`
                : `Оплата ${METHOD_LABELS[notif.method] || notif.method}`;
              const fullText = isInvoiceOverdue ? 'Рахунок не оплачено' : label;


              return (
                <div
                  key={`pay-${notif.id}`}
                  className={`notification-card notification-card--${visualTone}`}
                  style={{
                    '--notification-accent': accentColor,
                    '--notification-soft': bgColor,
                    cursor: 'pointer',
                  }}
                >
                  {/* Один рядок: що сталося · №наряду · сума праворуч; повний текст — у підказці */}
                  <div
                    className="notification-card__content nc-line"
                    onClick={() => handlePaymentClick(notif.orderId)}
                    title={`${fullText} замовлення №${notif.orderId} на суму ${notif.amount} грн`}
                  >
                    <span className="nc-label">{shortLabel}</span>
                    <span className="nc-order">№{notif.orderId}</span>
                    <strong className="nc-sum">{notif.amount}&nbsp;грн</strong>
                  </div>

                  {!isExpired && (
                    <button
                      type="button"
                      className="notification-check-btn"
                      aria-label="Позначити як переглянуте"
                      style={btnStyle}
                      onClick={(e) => { e.stopPropagation(); handleDismissPayment(notif.id); }}
                    >
                      <span>&#10003;</span>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Uklon */}
            {uklonNotifs.length > 0 && (
              <div className="notification-panel__group-label">Доставка Uklon</div>
            )}
            {uklonNotifs.map((notif) => {
              const isCanceled  = ['canceled', 'cancelled', 'failed'].includes(notif.status);
              const isDelivered = ['delivered', 'completed'].includes(notif.status);
              const isActive    = !isCanceled && !isDelivered;

              let bgColor, borderColor, accentColor;
              if (isCanceled) {
                bgColor     = 'var(--adminlightred, #fde8e5)';
                borderColor = 'var(--adminred, #ee3c23)';
                accentColor = 'var(--adminred, #ee3c23)';
              } else if (isDelivered) {
                bgColor     = 'var(--adminlightgreen, #e2f2eb)';
                borderColor = 'var(--admingreen, #0e935b)';
                accentColor = 'var(--admingreen, #0e935b)';
              } else {
                bgColor     = '#fff9e6';
                borderColor = '#FFD600';
                accentColor = '#8a6500';
              }

              const visualTone  = isCanceled ? 'danger' : isDelivered ? 'success' : 'active';
              const statusLabel = UKLON_STATUS_LABELS[notif.status] || notif.status;
              const cancelReason = notif.cancellation?.reason === 'driver_search_timeout'
                ? ' (не знайшли водія)'
                : notif.cancellation?.reason
                  ? ` (${notif.cancellation.reason})`
                  : '';

              return (
                <div
                  key={notif.id}
                  className={`notification-card notification-card--${visualTone}`}
                  style={{
                    '--notification-accent': isActive ? '#a07800' : accentColor,
                    '--notification-soft': bgColor,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="notification-card__content"
                    onClick={() => { setShow(false); navigate(`/Orders/${notif.orderId}`); }}
                  >
                    <span style={{ fontWeight: 600 }}>Uklon</span>&nbsp;замовлення&nbsp;№{notif.orderId}
                    {' — '}
                    <strong>{statusLabel}</strong>
                    {cancelReason}
                  </div>
                  <button
                    type="button"
                    className="notification-check-btn"
                    aria-label="Позначити як переглянуте"
                    style={{
                      '--notif-btn-1': isCanceled ? '#f25040' : isDelivered ? '#2eaa6e' : '#ffe066',
                      '--notif-btn-2': isCanceled ? '#ee3c23' : isDelivered ? '#0e935b' : '#FFD600',
                      '--notif-btn-3': isCanceled ? '#d42f1a' : isDelivered ? '#0a7a45' : '#e6c200',
                    }}
                    onClick={(e) => { e.stopPropagation(); handleDismissUklon(notif.id); }}
                  >
                    <span>&#10003;</span>
                  </button>
                </div>
              );
            })}

            {/* Завдання: непрочитані оновлення від колег */}
            {taskData.length > 0 && (
              <div className="notification-panel__group-label notification-panel__group-label--tasks">
                <span>Завдання</span>
                <button type="button" className="notification-panel__group-action" onClick={markAllTasksSeen}>
                  Прочитати всі
                </button>
              </div>
            )}
            {taskData.map((item) => {
              const urgent = item.overdue || item.priority === 4;
              const excerpt = eventExcerpt(item);
              return (
                <div
                  key={`task-${item.id}`}
                  className={`notification-card notification-card--${urgent ? 'danger' : 'task'}`}
                  style={{
                    '--notification-accent': urgent ? 'var(--adminred, #ee3c23)' : 'var(--adminorange, #f5a623)',
                    '--notification-soft': urgent ? 'var(--adminlightred, #fde8e5)' : 'var(--adminlightorange, #fff3df)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="notification-card__content" onClick={() => handleTaskClick(item.id)}>
                    <div className="notification-card__task-head">
                      <strong>{eventTitle(item, currentUser?.id)}</strong>
                      {item.overdue && <span className="notification-card__task-flag">прострочено</span>}
                    </div>
                    <div className="notification-card__task-title">#{item.id} · {item.title}</div>
                    {excerpt && <div className="notification-card__task-excerpt">«{excerpt}»</div>}
                    <div className="notification-card__task-meta">
                      {item.event?.actor?.name || item.creator?.name || ''}
                      {item.event?.createdAt ? ` · ${fmtAgo(item.event.createdAt)}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="notification-check-btn"
                    aria-label="Позначити як прочитане"
                    style={{
                      '--notif-btn-1': urgent ? '#f25040' : '#f7c23b',
                      '--notif-btn-2': urgent ? '#ee3c23' : '#f5a623',
                      '--notif-btn-3': urgent ? '#d42f1a' : '#e89810',
                    }}
                    onClick={(e) => { e.stopPropagation(); markTaskSeen(item.id); }}
                  >
                    <span>&#10003;</span>
                  </button>
                </div>
              );
            })}
            {taskUnread > taskData.length && (
              <button type="button" className="notification-panel__more" onClick={() => { setShow(false); navigate('/Tasks'); }}>
                Ще {taskUnread - taskData.length} — відкрити «Завдання»
              </button>
            )}

            {/* Порожній стан */}
            {totalCount === 0 && (
              <div className="notification-empty">
                Немає сповіщень
              </div>
            )}

          </div>{/* end .notification-panel__body */}
        </div>,
        portalRoot
      )}
    </>
  );
};

export default PopupLeftNotification;
