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
    if (!thisOrder.Payment?.invoiceId) return;
    let invoiceId  = thisOrder.Payment?.invoiceId
    try {
      const {data} = await axios.get('/api/payment/invoice-status', {
        params: {invoiceId }
      });
      setThisOrder(prev => ({
        ...prev,
        Payment: data
      }));
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

    const [index, setIndex] = useState(0);

    const formats = [
      "В|",
      "В о|",
      "В оч|",
      "В очі|",
      "В очік|",
      "В очіку|",
      "В очікув|",
      "В очікува|",
      "В очікуван|",
      "В очікуванн|",
      "В очікуванні|",
      "В очікуванні |",
      "В очікуванні о|",
      "В очікуванні оп|",
      "В очікуванні опл|",
      "В очікуванні опла|",
      "В очікуванні оплат|",
      "В очікуванні оплати|"
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % formats.length);
      }, 100);
      return () => clearInterval(interval);
    }, []);
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

    }
  };

  useEffect(() => {
    console.log(thisOrder);
    checkStatus()
  }, [thisOrder.id]);

  return (
    <div className="payment-methods-panel" style={{}}>
      {thisOrder.Payment?.status === 'CANCELLED' || thisOrder.Payment?.status === "EXPIRED" && (
        <div className="payment-methods-panel d-flex align-items-center ">
          <button
            className="PayButtons cash"
            onClick={() => handleSelect('cash')}
          >
            Розрахунок готівкою
          </button>

          <button
            className="PayButtons terminal"
            onClick={() => handleSelect('terminal')}
          >
          Розрахунок карткою
          </button>

          <button
            className="PayButtons online"
            onClick={() => handleSelect('online')}
          >
            Платіж за посиланням
          </button>

          <button
            onClick={() => setShowPays(true)}
            title="Платежі"
            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
            className="PayButtons invoices"

          >
            Оплата на рахунок
          </button>

        </div>
      )}
      {thisOrder.Payment === null || thisOrder.Payment?.status === 'CANCELLED' && (
        <div className="payment-methods-panel d-flex align-items-center ">
          <button
            className="PayButtons cash"
            onClick={() => handleSelect('cash')}
          >
            Розрахунок готівкою
          </button>

          <button
            className="PayButtons terminal"
            onClick={() => handleSelect('terminal')}
          >
            Розрахунок карткою
          </button>

          <button
            className="PayButtons online"
            onClick={() => handleSelect('online')}
          >
            Платіж за посиланням

          </button>

          <button
            onClick={() => setShowPays(true)}
            title="Платежі"
            style={{...buttonStyles.base, ...buttonStyles.iconButton}}
            className="PayButtons invoices"

          >
            Оплата на рахунок
          </button>

        </div>
      )}
      {/*{thisOrder.Payment?.status}*/}
      {thisOrder.Payment?.status === 'CREATED' && (
        <div className={"payment-methods-panel d-flex align-items-center "}>
          <button
            className="PayButtons link"
            style={{backgroundColor: '#008249', color: 'fbfaf6',width: '3vw'}}
            onClick={() => {
              window.open(thisOrder.Payment.pageUrl, '_blank');
            }}
          >+&nbsp;


          </button>
          <div
            className="PayButtons wait"
            style={{
            background: "#f2f0e7",
            height: "6vh",
            width: "25vw",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: "center",
            fontSize: '1vw',
            fontWeight: 400,
            borderRadius: "0vw",
            color: '#9f9e9d'
          }}>
            {formats[index]}
          </div>

          <button
            className="PayButtons end"
            style={{backgroundColor: 'red', color: 'fbfaf6', width:"3vw"}}
            onClick={invalidateInvoice}
          >
            &nbsp;x
          </button>

        </div>
      )}
      {thisOrder.Payment?.status === 'PAID' && (
        <div className={"payment-methods-panel d-flex align-items-center "}>
          <button
            className="PayButtons link"
            style={{
              background: "#008249",
              height: "6vh",
              width: "28vw",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: "center",
              fontSize: '1vw',
              fontWeight: 400,
              borderRadius: "0vw",
              color: '#fbfaf6'
            }}
          >Замовлення оплачене </button>
          <button
            className="PayButtons end"
            style={{backgroundColor: 'red', color: 'fbfaf6', width:"3vw"}}
            onClick={cancelPayment}
          >
            x
          </button>
        </div>
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
