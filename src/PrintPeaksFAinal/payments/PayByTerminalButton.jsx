import React, { useEffect, useMemo, useState } from 'react';
import { posSale } from '../../api/pos';
import { socket } from '../../socket';

export default function PayByTerminalButton({ orderId, amountKop, disabled, onDone }) {
  const [status, setStatus] = useState('idle'); // idle|waiting|success|fail|timeout|error
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // стабильный roomId
  const roomId = useMemo(() => String(orderId), [orderId]);

  useEffect(() => {
    if (!orderId) return;
    socket.emit('join', roomId);
    const onUpdate = (payload) => {
      if (payload?.payment?.orderId !== orderId) return;
      setPayment(payload.payment);
      setStatus(payload.payment.status); // success|fail|cancelled|timeout|error|pending
      if (payload.payment.status !== 'pending') {
        setIsSending(false);
        if (typeof onDone === 'function') onDone(payload.payment);
      }
    };
    socket.on('payment_update', onUpdate);
    return () => socket.off('payment_update', onUpdate);
  }, [orderId, roomId, onDone]);

  const onClick = async () => {
    if (!orderId || !amountKop) return;
    setError('');
    setPayment(null);
    setStatus('waiting');
    setIsSending(true);
    try {
      const resp = await posSale({ orderId, amountKop });
      // при быстрых ответах success прилетит сразу; иначе дождёмся socket
      if (resp?.payment) {
        setPayment(resp.payment);
        setStatus(resp.ok ? 'success' : (resp.payment.status || 'error'));
        setIsSending(false);
        if (resp.ok && typeof onDone === 'function') onDone(resp.payment);
      }
    } catch (e) {
      setIsSending(false);
      setStatus('error');
      setError(e?.response?.data?.error || e.message || 'Ошибка оплаты');
    }
  };

  const label = (() => {
    if (isSending || status === 'waiting' || status === 'pending') return 'Очікуємо оплату на терміналі...';
    if (status === 'success') return 'Оплачено ✅';
    if (status === 'fail') return 'Відхилено ❌';
    if (status === 'timeout') return 'Тайм-аут ⏳';
    if (status === 'error') return 'Помилка ⚠️';
    return 'Оплатити карткою (термінал)';
  })();

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button
        className="btn btn-primary"
        disabled={disabled || isSending}
        onClick={onClick}
      >
        {label}
      </button>

      {payment?.cardMask && (
        <span style={{ fontSize: 12, opacity: 0.8 }}>
          {payment.cardMask} • RRN: {payment.rrn || '-'}
        </span>
      )}

      {error && (
        <span style={{ color: '#c00', fontSize: 12 }}>{error}</span>
      )}
    </div>
  );
}
