import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axiosInstance';

function ModalDeleteOrder({
                            thisOrderForDelete,
                            showDeleteOrderModal,
                            setThisOrderForDelete,
                            setShowDeleteOrderModal,
                            data,
                            setData,
                            url
                          }) {
  const [load, setLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(showDeleteOrderModal);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const dialogRef = useRef(null);
  const deleteBtnRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  const handleClose = useCallback(() => {
    if (load) return;
    setShowDeleteOrderModal(false);
  }, [load, setShowDeleteOrderModal]);

  const deleteThis = useCallback(async () => {
    if (!thisOrderForDelete?.id) return;

    const isPaid = thisOrderForDelete?.Payment?.status === 'PAID';
    const statusValue = thisOrderForDelete?.status; // "0" | "1" | "2" | "3" | "4" | "Відміна"
    const isInWork = statusValue !== '0'; // не "Оформлення"
    const isLocked = isPaid && isInWork;

    if (isLocked) {
      setError('Замовлення не можна видалити (замовлення в роботі)');
      return;
    }

    setLoad(true);
    setError(null);
    try {
      const id = thisOrderForDelete.id;
      const response = await axios.delete(`${url}/${id}`);
      if (response.status === 200) {
        setData(prev => ({
          ...prev,
          rows: Array.isArray(prev?.rows)
            ? prev.rows.filter(item => item.id !== id)
            : []
        }));
        setLoad(false);
        setShowDeleteOrderModal(false);
        setThisOrderForDelete(null);
      } else {
        setLoad(false);
        setError(`Статус відповіді: ${response.status}`);
      }
    } catch (err) {
      setLoad(false);
      setError(err?.response?.data?.message || err.message || 'Помилка видалення');
    }
  }, [thisOrderForDelete, setData, setShowDeleteOrderModal, setThisOrderForDelete, url]);

  // Анімація відкриття/закриття
  useEffect(() => {
    if (showDeleteOrderModal) {
      setIsVisible(true);
      lastActiveElementRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const t = setTimeout(() => setIsAnimating(true), 20);
      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(t);
      };
    } else {
      setIsAnimating(false);
      const t = setTimeout(() => setIsVisible(false), 200);
      if (lastActiveElementRef.current && lastActiveElementRef.current.focus) {
        lastActiveElementRef.current.focus();
      }
      return () => clearTimeout(t);
    }
  }, [showDeleteOrderModal]);

  // Фокус у вікні
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => {
      deleteBtnRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [isVisible]);

  // Клавіатура: Esc + trap
  const onKeyDown = useCallback((e) => {
    if (!isVisible) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }, [handleClose, isVisible]);

  // Дані для заголовка
  const clientName = useMemo(() => {
    const c = thisOrderForDelete?.client;
    if (!c) return '—';
    const fn = c.firstName || '';
    const ln = c.lastName || '';
    return `${fn} ${ln}`.trim() || '—';
  }, [thisOrderForDelete]);

  const totalPrice = useMemo(() => {
    const p = thisOrderForDelete?.price ?? thisOrderForDelete?.totalPrice ?? null;
    if (p == null) return '—';
    const num = Number(p);
    return Number.isFinite(num) ? `${num} грн` : `${p} грн`;
  }, [thisOrderForDelete]);

  const isPaid = thisOrderForDelete?.Payment?.status === 'PAID';
  const statusValue = thisOrderForDelete?.status;
  const isInWork = statusValue !== '0'; // не "Оформлення"
  const isLocked = isPaid && isInWork;

  if (!isVisible) return null;

  // Стилі
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 15, 15, 0.45)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    zIndex: 999,
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 200ms ease'
  };

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    transform: isAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -40%) scale(0.96)',
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 200ms ease, transform 200ms ease',
    background: '#fbfaf6',
    borderRadius: '16px',
    boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
    border: '1px solid rgba(0,0,0,0.06)',
    width: 'min(500px, 92vw)',
    overflow: 'hidden'
  };

  const bodyStyle = {
    padding: '16px 18px 8px 18px',
    color: '#222',
    fontSize: '14px',
    lineHeight: 1
  };

  const metaStyle = {
    padding: '0 18px 10px 18px',
    color: '#444',
    fontSize: '16px'
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    padding: '12px 18px 16px 18px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: '#fbfaf6'
  };

  const bigIdStyle = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111',
    marginBottom: 4
  };

  const subLineStyle = {
    fontSize: '16px',
    color: '#333',
    marginBottom: 4
  };

  const warningStyle = {
    marginTop: 10,
    color: '#b00020',
    fontSize: 13
  };

  const btnBase = {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.08)',
    fontSize: '14px',
    lineHeight: 1.2,
    cursor: 'pointer',
    transition: 'transform 80ms ease, box-shadow 140ms ease, background 140ms ease',
    outline: 'none'
  };

  const btnSecondary = {
    ...btnBase,
    background: '#fff',
    color: '#111'
  };

  const btnDanger = {
    ...btnBase,
    background: isLocked ? '#fbfaf6' : '#ff5d5d',
    color: '#fbfaf6',
    border: `1px solid ${isLocked ? '#fbfaf6' : '#ff5d5d'}`
  };

  const btnDisabled = {
    filter: 'grayscale(35%)',
    opacity: 0.7,
    cursor: 'not-allowed'
  };

  const overlayClick = () => {
    if (load) return;
    handleClose();
  };

  const stop = (e) => e.stopPropagation();

  const count = thisOrderForDelete?.count;
  const unitPrice = thisOrderForDelete?.priceForThis;
  const priceLine =
    typeof unitPrice === 'number'
      ? ` за ціною ${unitPrice} грн`
      : thisOrderForDelete?.priceForThis
        ? ` за ціною ${thisOrderForDelete.priceForThis} грн`
        : '';

  return createPortal(
    <>
      <div style={overlayStyle} onClick={overlayClick} onKeyDown={onKeyDown} />
      <div
        ref={dialogRef}
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-title"
        aria-describedby="modal-delete-desc"
        onClick={stop}
        onKeyDown={onKeyDown}
      >
        <div style={bodyStyle} id="modal-delete-desc">
          <div style={bigIdStyle}>
            Видалити замовлення №{thisOrderForDelete?.id || '—'}?
          </div>
          <div style={subLineStyle}>
            Клієнт: {clientName}
          </div>
          <div style={subLineStyle}>
            Сума: {totalPrice}
          </div>
          <div style={{ marginTop: 10 }}>
               {count ? <> — {count} шт</> : null}
            {priceLine || null}
          </div>
          {(isLocked || error) && (
            <div style={warningStyle}>
              {isLocked ? 'Замовлення не можна видалити (замовлення в роботі)' : error}
            </div>
          )}
        </div>



        <div style={footerStyle}>
          <button
            type="button"
            className="adminButtonAdd hoverOrange"
            style={{ ...btnSecondary, ...(load ? btnDisabled : null) }}
            onClick={handleClose}
            disabled={load}
          >
            Закрити
          </button>
          <button
            type="button"
            ref={deleteBtnRef}
            className="adminButtonAdd hoverOrange"
            style={{ ...btnDanger, ...(load || isLocked ? btnDisabled : null) }}
            onClick={deleteThis}
            disabled={load || isLocked}
          >
            {load ? 'Видалення…' : 'Видалити'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default ModalDeleteOrder;
