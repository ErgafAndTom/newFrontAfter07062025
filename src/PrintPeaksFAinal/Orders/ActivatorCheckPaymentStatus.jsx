import React, { useEffect, useState } from 'react';
import axios from "../../api/axiosInstance";

const ActivatorCheckPaymentStatus = ({ order }) => {
  const [thisOrder, setThisOrder] = useState(order);
  const [load, setLoad] = useState(false);

  const checkStatus = async () => {
    if (!order.Payment?.invoiceId) return;
    setLoad(true);
    try {
      const { data } = await axios.get("/api/payment/invoice-status", {
        params: { invoiceId: order.Payment.invoiceId },
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

  const p = thisOrder.Payment;
  if (!p || p.status === null)
    return <span className="ort-pay-badge ort-pay-badge--none">—</span>;

  if (p.status === 'CREATED')
    return <span className="ort-pay-badge ort-pay-badge--wait">Очікування{load ? '…' : ''}</span>;

  if (p.status === 'PAID') {
    const labels = { terminal: 'Оплата карткою', link: 'Інтернет-оплата', cash: 'Оплата готівкою', invoice: 'Оплата рахунком' };
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
