import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axiosInstance';
import '../userInNewUiArtem/pays/styles.css';

function ModalDeleteOrder({
                            thisOrderForDelete,
                            showDeleteOrderModal,
                            setThisOrderForDelete,
                            setShowDeleteOrderModal,
                            data,
                            setData,
                            url,
                            title,
                            showTotal = true,
                            subLabel,
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

  const overlayClick = () => { if (load) return; handleClose(); };
  const stop = (e) => e.stopPropagation();

  const count = thisOrderForDelete?.count;
  const unitPrice = thisOrderForDelete?.priceForThis;
  const priceLine =
    typeof unitPrice === 'number'
      ? ` за ціною ${unitPrice} грн`
      : thisOrderForDelete?.priceForThis
        ? ` за ціною ${thisOrderForDelete.priceForThis} грн`
        : '';

  const modalTitle = title || `Видалити замовлення №${thisOrderForDelete?.id || '—'}?`;

  return createPortal(
    <>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(15,15,15,0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 10600,
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.22s ease-out',
      }} onClick={overlayClick} onKeyDown={onKeyDown} />

      <div
        ref={dialogRef}
        role="dialog" aria-modal="true"
        aria-labelledby="modal-delete-title"
        onClick={stop} onKeyDown={onKeyDown}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          zIndex: 10601,
          transform: isAnimating ? 'translate(-50%, -50%)' : 'translate(-50%, -52%)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.22s ease-out, transform 0.22s ease-out',
          background: 'var(--adminfon, #f7f5ee)',
          borderRadius: 0,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          width: 'min(420px, 92vw)',
          overflow: 'hidden',
          fontWeight: 400,
          color: 'var(--admingrey, #666666)',
        }}
      >
        {/* Body */}
        <div style={{ padding: '1.4rem 1.4rem 0.8rem' }}>
          <div style={{
            fontSize: 'var(--font-size-pay)',
            fontWeight: 400,
            color: 'var(--admingrey, #666666)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.6rem',
          }}>
            {modalTitle}
          </div>

          <div style={{ fontSize: 'var(--font-size-s)', color: 'var(--admingrey, #666666)', marginBottom: '0.3rem' }}>
            {subLabel != null ? subLabel : `Клієнт: ${clientName}`}
          </div>

          {showTotal && (
            <div style={{ fontSize: 'var(--font-size-s)', color: 'var(--admingrey, #666666)', marginBottom: '0.3rem' }}>
              Сума: {totalPrice}
            </div>
          )}

          {(count || priceLine) && (
            <div style={{ fontSize: 'var(--font-size-s)', color: 'var(--admingrey, #666666)' }}>
              {count ? `${count} шт` : ''}{priceLine}
            </div>
          )}

          {(isLocked || error) && (
            <div style={{ marginTop: '0.6rem', color: 'var(--adminred, #ee3c23)', fontSize: 'var(--font-size-s)' }}>
              {isLocked ? 'Замовлення не можна видалити (замовлення в роботі)' : error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '0.6rem',
          padding: '0.8rem 1.4rem 1.2rem',
          borderTop: '1px solid rgba(0,0,0,0.07)',
        }}>
          <button
            type="button"
            className="pays-tbl-btn pays-tbl-btn--hover-orange"
            onClick={handleClose}
            disabled={load}
            style={{ fontSize: 'var(--font-size-s)', opacity: load ? 0.6 : 1 }}
          >
            Закрити
          </button>
          <button
            type="button"
            ref={deleteBtnRef}
            className={`pays-tbl-btn pays-tbl-btn--red${isLocked ? ' pays-tbl-btn--disabled' : ''}`}
            onClick={deleteThis}
            disabled={load || isLocked}
            style={{ fontSize: 'var(--font-size-s)', opacity: (load || isLocked) ? 0.5 : 1 }}
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
