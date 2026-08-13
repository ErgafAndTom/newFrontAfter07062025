import React, {useCallback, useEffect, useState} from "react";
import ReactDOM from "react-dom";
import axios from '../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import "./AwaitPaysCash.css";

const AwaitPaysCash = ({
                     thisOrder, setThisOrder, showAwaitCashPays, setShowAwaitCashPays, setOplata, oplata
                   }) => {
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);
  const [clientAmount, setClientAmount] = useState('');
  const handleClose = () => {
    setIsAnimating(false); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false)
      setShowAwaitCashPays(false);
    }, 300); // После завершения анимации скрываем модальное окно
  }
  const handleShow = useCallback((event) => {
    setShowAwaitCashPays(true);
  }, []);

  // const addNewOrderUnit = e => {
  //   let dataToSend = {
  //     orderId: thisOrder.id,
  //   };
  //   axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
  //     .then(response => {
  //       // console.log(response.data);
  //     })
  //     .catch(error => {
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       console.log(error.message);
  //       // setErr(error)
  //     });
  // }

  // useEffect(() => {
  //   let dataToSend = {
  //     type: "PerepletMet",
  //   }
  //   axios.post(`/calc/pricing`, dataToSend)
  //     .then(response => {
  //       console.log(response.data);
  //       setPricesThis(response.data.prices)
  //       setError(null)
  //     })
  //     .catch(error => {
  //       setError(error)
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       console.log(error.message);
  //     })
  // }, []);

  const handleOk = async () => {
    try {
      setOplata(true);
      const response = await axios.post("/api/payment/create-invoice-cash", { // 👈 змінив шлях
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.allPrice * 100),
        currency: 980,
        // terminalId: "PQ012563",
      });
      console.log(response.data);
      if (response.data) {
        setOplata(false);
        // setThisOrder((prev) => ({
        //   ...prev,
        //   Payment: response.data,
        // }));
        setThisOrder(response.data);
        handleClose()
      }
      // if (data?.payment) {
      //   setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      // }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };

  useEffect(() => {
    if (showAwaitCashPays) {
      setClientAmount('');
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAwaitCashPays]);

  const total = Number(thisOrder?.allPrice ?? 0);
  const given = Number(clientAmount);
  const hasGiven = clientAmount !== '' && given > 0;
  const change = given - total;

  return (
    <>
      {isVisible && ReactDOM.createPortal(
        <>
          <div
            className={`apc-overlay${isAnimating ? ' is-in' : ''}`}
            onClick={handleClose}
          />

          <div
            className={`apc-panel${isAnimating ? ' is-in' : ''}`}
            role="dialog"
            aria-label="Оплата готівкою"
          >
            <div className="apc-head">
              <div className="apc-title">Оплата готівкою</div>
            </div>

            <div className="apc-body">
              <div className="apc-sum">
                {total}
                <span className="apc-unit">грн</span>
              </div>

              <input
                className="apc-input"
                type="number"
                placeholder="Клієнт дає, грн"
                value={clientAmount}
                onChange={(e) => setClientAmount(e.target.value)}
              />

              {hasGiven && (
                <div className={`apc-change${change < 0 ? ' is-short' : ''}`}>
                  Решта: {change.toFixed(2)}
                  <span className="apc-unit">грн</span>
                </div>
              )}
            </div>

            <div className="apc-actions">
              <button
                type="button"
                className="apc-btn"
                onClick={handleOk}
                disabled={oplata}
              >
                <span>{oplata ? 'Обробка…' : 'Оплатити'}</span>
              </button>

              <button type="button" className="apc-btn apc-btn--cancel" onClick={handleClose}>
                <span>Відміна</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )

};

export default AwaitPaysCash;
