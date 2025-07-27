import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosInstance';
import './PaidButtomProgressBar.css';
import {io} from 'socket.io-client';

const PaidButtomProgressBar = ({ thisOrder, setShowPays }) => {
  const [paymentState, setPaymentState] = useState('initial');
  const [invoiceId, setInvoiceId]       = useState(null);
  const intervalRef                      = useRef(null);
  const socket = io('http://localhost:3000/'); // або просто '/'
  const buttonStyles = {}
  // const [showPays, setShowPays] = useState(false);

  // Обробник вибору способу оплати
  const handleSelect = (method) => {
    if (method === 'online') {
      const totalUAH = (thisOrder.OrderUnits || [])
        .reduce((sum, u) => sum + parseFloat(u.priceForThis || 0), 0);
      createInvoice(totalUAH);
    }
    // TODO: додати обробку інших методів (cash, terminal, invoices)
  };

  // Створення рахунку через ваш бекенд
  const createInvoice = async (sumUAH) => {
    try {
      const amount = Math.round(sumUAH * 100); // копійки
      const { data } = await axios.post('/api/create-invoice', {
        amount,
        merchantPaymInfo: {
          reference:   `Order-${thisOrder.id}`,
          destination: `Оплата замовлення #${thisOrder.id}`,
          comment:     `Оплата за замовлення #${thisOrder.id}`,
        },
      });
      // відкриваємо платіжну сторінку Monobank у новій вкладці
      if (data.pageUrl) window.open(data.pageUrl, '_blank');
      setInvoiceId(data.invoiceId);
      setPaymentState('pending');
    } catch (error) {
      console.error('createInvoice error:', error.response || error.message);
      alert('Не вдалося ініціювати оплату.');
    }
  };
  // :contentReference[oaicite:0]{index=0}

  // Перевірка статусу рахунку
  const checkStatus = async () => {
    if (!invoiceId) return;
    try {
      const { data } = await axios.get('/api/invoice-status', {
        params: { invoiceId }
      });
      if (data.status === 'PAID') {
        setPaymentState('paid');
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error('Помилка перевірки статусу:', err);
    }
  };
  // :contentReference[oaicite:1]{index=1}

  // Скасування (повернення) платежу
  const cancelPayment = async () => {
    if (!invoiceId) return;
    try {
      await axios.post('/api/cancel-invoice', { invoiceId });
    } catch (err) {
      console.error('Помилка скасування платежу:', err);
    } finally {
      clearInterval(intervalRef.current);
      setPaymentState('initial');
      setInvoiceId(null);
    }
  };
  // :contentReference[oaicite:2]{index=2}

  // (Опційно) Інвалідація рахунку
  const invalidateInvoice = async () => {
    if (!invoiceId) return;
    try {
      await axios.post('/api/invalidate-invoice', { invoiceId });
    } catch (err) {
      console.error('Помилка інвалідації рахунку:', err);
    } finally {
      clearInterval(intervalRef.current);
      setPaymentState('initial');
      setInvoiceId(null);
    }
  };
  // :contentReference[oaicite:3]{index=3}
  useEffect(() => {
    // при відкритті сторінки підписатися на room конкретного замовлення
    socket.emit('join', `order_${thisOrder.id}`);

    socket.on('paymentStatusChanged', ({ orderId, status }) => {
      if (orderId === thisOrder.id && status === 'paid') {
        setPaymentState('paid');
        // можна одразу зберегти в localStorage, оновити візуал
      }
    });

    return () => {
      socket.off('paymentStatusChanged');
    };
  }, [thisOrder.id]);
  // Підписка на інтервал перевірки статусу
  useEffect(() => {
    if (paymentState === 'pending') {
      intervalRef.current = setInterval(checkStatus, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paymentState, invoiceId]);

  // Динамічні стилі панелі
  const panelStyle = {
    backgroundColor:
      paymentState === 'pending' ? '#fab416'
        : paymentState === 'paid'    ? 'green'
          : undefined,
    display: 'flex',
    alignItems: 'center',


  };

  return (
    <div className="payment-methods-panel" style={{marginLeft:'-1vw'}}>
      {paymentState === 'initial' && (
        <div className="payment-methods-panel">
          <button
            className="PayButtons cash"
            onClick={() => handleSelect('cash')}
          >
            <span>Готівка</span>
          </button>

          <button
            className="PayButtons terminal"
            onClick={() => handleSelect('terminal')}
          >
            Термінал
          </button>

          <button
            className="PayButtons online"
            onClick={() => handleSelect('online')}
          >
            Інтернет
          </button>

          <button
            onClick={() => setShowPays(true)}
            title="Платежі"
            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
            className="PayButtons invoices"

          >
            Рахунки
          </button>

        </div>
      )}

      {paymentState === 'pending' && (
        <>
          <span style={{ flex: 1 }}>Очікується оплата…</span>
          <button
            className="PayButtons"
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={cancelPayment}
          >
            Відмінити платіж
          </button>
        </>
      )}
      {paymentState === 'paid' && (
        <span>Замовлення оплачене</span>
      )}
    </div>
  );
};

export default PaidButtomProgressBar;
