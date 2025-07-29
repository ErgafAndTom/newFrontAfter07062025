import React, {useState, useEffect, useRef} from 'react';
import axios from '../../api/axiosInstance';
import './PaidButtomProgressBar.css';
import PerepletMet from "../poslugi/PerepletMet";
import AwaitPays from "./AwaitPays";
import {io} from 'socket.io-client';

const PaidButtomProgressBar = ({thisOrder, setShowPays, setThisOrder}) => {
  const [paymentState, setPaymentState] = useState('initial');
  const [invoiceId, setInvoiceId] = useState(null);
  const intervalRef = useRef(null);
  // const socket = io('http://localhost:3000/'); // або просто '/'
  const buttonStyles = {}
  const [showAwaitPays, setShowAwaitPays] = useState(false);
  // Обробник вибору способу оплати
  const handleSelect = (method) => {
    if (method === 'online') {
      const totalUAH = (thisOrder.OrderUnits || [])
        .reduce((sum, u) => sum + parseFloat(u.priceForThis || 0), 0);
      createInvoice(totalUAH);
    }
    if (method === 'cash') {
      const totalUAH = (thisOrder.OrderUnits || [])
        .reduce((sum, u) => sum + parseFloat(u.priceForThis || 0), 0);
      setShowAwaitPays(true)
      // createInvoice(totalUAH);
    }
    // TODO: додати обробку інших методів (cash, terminal, invoices)
  };

  // Створення рахунку через ваш бекенд
  const createInvoice = async (sumUAH) => {
    try {
      const amount = Math.round(sumUAH * 100); // копійки
      const {data} = await axios.post('/api/payment/create-invoice', {
        orderId: thisOrder.id,
        payload: {
          amount,
          merchantPaymInfo: {
            reference: `Order-${thisOrder.id}`,
            destination: `Оплата замовлення #${thisOrder.id}`,
            comment: `Оплата за замовлення #${thisOrder.id}`,
          },
        }
      });
      // відкриваємо платіжну сторінку Monobank у новій вкладці
      console.log(data);
      if (data.pageUrl) {
        setThisOrder({...thisOrder, Payment: data});
        window.open(data.pageUrl, '_blank');
      }
      setInvoiceId(data.invoiceId);
      // setPaymentState('pending');
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
      const {data} = await axios.get('/api/payment/invoice-status', {
        params: {invoiceId}
      });
      if (data.status === 'PAID') {
        setPaymentState('paiwd');
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error('Помилка перевірки статусу:', err);
    }
  };
  // :contentReference[oaicite:1]{index=1}

  // Скасування (повернення) платежу
  const cancelPayment = async () => {
    if (!thisOrder.Payment.invoiceId) return;
    let invoiceIdMy = thisOrder.Payment.invoiceId
    try {
      let res = await axios.post('/api/payment/cancel-invoice', {invoiceIdMy});
      console.log(res);
      setThisOrder(prev => ({
        ...prev,
        Payment: {
          ...prev.Payment,
          status: 'CANCELLED' // або будь-яке інше поле, яке хочеш змінити
        }
      }));
    } catch (err) {
      console.error('Помилка скасування платежу:', err);
    } finally {
      clearInterval(intervalRef.current);
      setInvoiceId(null);
    }
  };
  // :contentReference[oaicite:2]{index=2}

  // (Опційно) Інвалідація рахунку
  const invalidateInvoice = async () => {
    if (!thisOrder.Payment.invoiceId) return;
    let invoiceIdMy = thisOrder.Payment.invoiceId
    try {
      let res = await axios.post('/api/payment/invalidate-invoice', {invoiceIdMy});
      console.log(res);
      setThisOrder(prev => ({
        ...prev,
        Payment: {
          ...prev.Payment,
          status: 'CANCELLED' // або будь-яке інше поле, яке хочеш змінити
        }
      }));
    } catch (err) {
      console.error('Помилка інвалідації рахунку:', err);
    } finally {
      clearInterval(intervalRef.current);
      setPaymentState('initial');
      setInvoiceId(null);
    }
  };
  // :contentReference[oaicite:3]{index=3}
  // useEffect(() => {
  //   if (!thisOrder.id) return;
  //
  //   socket.emit('join', `order_${thisOrder.id}`);
  //
  //   socket.on('paymentStatusChanged', ({ orderId: changedId, status }) => {
  //     if (changedId === thisOrder.id) {
  //       setThisOrder(prev => ({
  //         ...prev,
  //         Payment: {
  //           ...prev.Payment,
  //           status: 'PAID' // або будь-яке інше поле, яке хочеш змінити
  //         }
  //       }));
  //     }
  //   });
  //
  //   return () => {
  //     socket.off('paymentStatusChanged');
  //     socket.emit('leave', `order_${thisOrder.id}`);
  //   };
  // }, [thisOrder.id]);

  // Динамічні стилі панелі

  useEffect(() => {
    console.log(thisOrder);
  }, []);
  // const panelStyle = {
  //   backgroundColor:
  //     thisOrder.Payment?.status === 'CREATED' ? '#fab416'
  //       : thisOrder.Payment?.status === 'PAID'    ? 'green'
  //         : undefined,
  //   display: 'flex',
  //   alignItems: 'center',
  //
  //
  // };

  return (
    <div className="payment-methods-panel" style={{}}>
      {thisOrder.Payment === null || thisOrder.Payment?.status === 'CANCELLED' && (
        <div className="payment-methods-panel d-flex align-items-center ">
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

      {thisOrder.Payment?.status === 'CREATED' && (
        <>
          <span style={{flex: 1}}>Очікується оплата…</span>
          <button
            className="PayButtons"
            style={{backgroundColor: 'red', color: 'white'}}
            onClick={invalidateInvoice}
          >
            Відмінити платіж(invalidate)
          </button>
          <button
            className="PayButtons"
            style={{backgroundColor: 'cadetblue', color: 'white'}}
            onClick={() => {
              window.open(thisOrder.Payment.pageUrl, '_blank');
            }}
          >
            Посилання на оплату
          </button>
        </>
      )}
      {thisOrder.Payment?.status === 'PAID' && (
        <>
          <span>Замовлення оплачене</span>
          <button
            className="PayButtons"
            style={{backgroundColor: 'red', color: 'white'}}
            onClick={cancelPayment}
          >
            Відмінити платіж(cancel)
          </button>
        </>
      )}


      {showAwaitPays &&
        <AwaitPays
          thisOrder={thisOrder}
          setShowAwaitPays={setShowAwaitPays}
          showAwaitPays={showAwaitPays}
        />
      }
    </div>
  );
};

export default PaidButtomProgressBar;
