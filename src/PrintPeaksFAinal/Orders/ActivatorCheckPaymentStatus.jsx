import React, { useEffect, useState } from 'react';
import axios from "../../api/axiosInstance";

const ActivatorCheckPaymentStatus = ({ order }) => {
  const [thisOrder, setThisOrder] = useState(order);
  const [load, setLoad] = useState(false);

  const checkStatus = async () => {
    if (!order.id) return;
    setLoad(true);
    try {
      const { data } = await axios.get("/api/payment/invoice-status-without-invoiceId", {
        params: { orderId: order.id },
      });
      setThisOrder(prev => ({ ...prev, Payment: data }));
    } catch (err) {
      console.error("Помилка перевірки статусу:", err);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (thisOrder.Payment?.status === 'CREATED') checkStatus();
  }, []);

  // WebSocket: real-time оновлення від Monobank webhook
  useEffect(() => {
    const handlePaymentUpdate = (e) => {
      if (String(e.detail.orderId) === String(order.id)) {
        setThisOrder(prev => ({ ...prev, Payment: e.detail.payment }));
      }
    };
    window.addEventListener('paymentStatusUpdate', handlePaymentUpdate);
    return () => window.removeEventListener('paymentStatusUpdate', handlePaymentUpdate);
  }, [order.id]);

  const p = thisOrder.Payment;
  if (!p || p.status === null)
    return <span className="ort-pay-badge ort-pay-badge--none">—</span>;

  if (p.status === 'CREATED' || p.status === 'PROCESSING') {
    const waitLabels = { link: 'оч-я monobank', terminal: 'оч-я monobank', invoice: 'оч-я рахунок', iban: 'оч-я iban', cod: 'оч-я НП', cash: 'оч-я готівка' };
    return <span className="ort-pay-badge ort-pay-badge--wait">{waitLabels[p.method] || 'Очікування'}</span>;
  }

  if (p.status === 'PAID') {
    const labels = { terminal: 'Оплата карткою', link: 'Інтернет-оплата', cash: 'Оплата готівкою', invoice: 'Оплата рахунком', iban: 'Оплата на IBAN', cod: 'Наложений платіж' };
    return <span className="ort-pay-badge ort-pay-badge--paid">{labels[p.method] || 'Інтернет-оплата'}</span>;
  }

  if (p.status === 'CANCELLED')
    return <span className="ort-pay-badge ort-pay-badge--cancel">Відміна</span>;

  if (p.status === 'EXPIRED')
    return <span className="ort-pay-badge ort-pay-badge--expired">Протерміновано</span>;

  if (p.status === 'FAILED')
    return <span className="ort-pay-badge ort-pay-badge--expired">Помилка</span>;

  return <span className="ort-pay-badge ort-pay-badge--none">—</span>;
};

export default ActivatorCheckPaymentStatus;
