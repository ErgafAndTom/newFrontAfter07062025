import React, {useCallback, useEffect, useState} from "react";
import ReactDOM from "react-dom";
import axios from '../../api/axiosInstance';
import {useNavigate} from "react-router-dom";

const AwaitPaysCash = ({
                     thisOrder, setThisOrder, showAwaitCashPays, setShowAwaitCashPays, setOplata, oplata
                   }) => {
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);
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
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAwaitCashPays]);

  return (
    <>
      {isVisible && ReactDOM.createPortal(
        <div>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              background: "rgba(0, 0, 0, 0.35)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={handleClose}
          />
          {/* Modal */}
          <div
            style={{
              position: "fixed",
              zIndex: 99999,
              top: "50%",
              left: "50%",
              transform: isAnimating
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.95)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              background: "var(--adminfon, #f7f5ee)",
              border: "none",
              width: "24vw",
              minWidth: 320,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Header */}
            <span style={{
              fontSize: "var(--font-size-s, 17px)",
              fontWeight: 400,
              color: "var(--admingrey, #666)",
              textTransform: "uppercase",
              textAlign: "center",
            }}>
              Оплата готівкою
            </span>

            {/* Amount */}
            <div style={{
              fontSize: "var(--font-size-paybig, 26px)",
              color: "var(--adminred, #ee3c23)",
              fontWeight: 500,
              textAlign: "center",
              padding: "0.5rem 0",
            }}>
              {thisOrder?.allPrice ?? 0} <span style={{ fontSize: "var(--fontsmall, 15px)", color: "var(--admingrey, #666)" }}>грн</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="buttonSkewedOrder await-cash-ok"
                onClick={handleOk}
                disabled={oplata}
                style={oplata ? { cursor: "not-allowed", opacity: 0.5 } : undefined}
              >
                <span>{oplata ? "Обробка..." : "Оплатити"}</span>
              </button>
              <button
                className="buttonSkewedOrder await-cash-cancel"
                onClick={handleClose}
              >
                <span>Відміна</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )

};

export default AwaitPaysCash;
