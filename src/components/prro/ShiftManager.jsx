import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import "./ShiftManager.css";

const ShiftManager = ({ currentUser , thisOrder, setShowPays, setThisOrder}) => {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const terminalId = "PQ012563"; // можна підставляти з налаштувань/Redux
  const [shiftOpen, setShiftOpen] = useState(false);

  const fetchCurrentShift = async () => {
    try {
      console.log(`lox`);
      const { data } = await axios.get("/user/current");
      setShift(data || null);
    } catch (err) {
      console.error("Помилка отримання зміни:", err);
    }
  };

  const openShift = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/pos/openShift", {
        terminalId,
        userId: currentUser?.id
      });
      setShift(data);
    } catch (err) {
      console.error("Помилка відкриття зміни:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeShift = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/pos/closeShift", {
        shiftId: shift.shiftId,
        userId: currentUser?.id
      });
      setShift(data);
    } catch (err) {
      console.error("Помилка закриття зміни:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTerminalPayment = async () => {
    // if (!thisOrder?.id || !thisOrder?.totalAmount) return;
    console.log('Creating terminal payment for order:', thisOrder.id);
    try {
      const {data} = await axios.post("/api/pos/sale", {
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.totalAmount * 100),
        currency: 980,
        terminalId: "PQ012563" // можна винести в .env чи Redux
      });
      console.log('Payment response:', data);
      if (data?.payment) {
        setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };

  useEffect(() => {
    // fetchCurrentShift();
  }, []);

  return (
    <div className="shift-manager">
      {/*<h3>Стан зміни</h3>*/}
      {shiftOpen ? (
        <>
          <button
            className="PayButtons adminTextBig shift-open"
            onClick={openShift}
            disabled={loading}
          >
            Відкрити зміну
          </button>
          <button disabled={loading} onClick={closeShift} className="close-btn">
            {loading ? "Закриваємо..." : "Закрити зміну"}
          </button>
        </>
      ) : (
        <>
          {/* Якщо зміна відкрита */}
          <button
            className="PayButtons adminTextBig shift-close"
            onClick={closeShift}
            disabled={loading}
          >
            Закрити зміну
          </button>

          {/* Кнопки оплати доступні тільки коли зміна відкрита */}
          <div className="payment-methods-panel d-flex align-items-center">
            <button
              className="PayButtons adminTextBig cash"
              disabled={loading}
              onClick={() => console.log("Готівкова оплата")}
            >
              Розрахунок готівкою
            </button>

            <button
              className="PayButtons adminTextBig terminal"
              disabled={loading}
              onClick={createTerminalPayment}
            >
              Розрахунок карткою (t) rthjeor80uhtg
            </button>

            <button
              className="PayButtons adminTextBig online"
              disabled={loading}
              onClick={() => console.log("Оплата онлайн")}
            >
              Платіж за посиланням
            </button>

            <button
              className="PayButtons adminTextBig invoices"
              disabled={loading}
              onClick={() => setShowPays(true)}
            >
              Оплата на рахунок
            </button>
          </div>
        </>
      )}
      <>
        {/*<button*/}
        {/*  className="PayButtons adminTextBig shift-open"*/}
        {/*  onClick={openShift}*/}
        {/*  disabled={loading}*/}
        {/*>*/}
        {/*  Відкрити зміну*/}
        {/*</button>*/}
        {/*<button disabled={loading} onClick={closeShift} className="close-btn">*/}
        {/*  {loading ? "Закриваємо..." : "Закрити зміну"}*/}
        {/*</button>*/}
      </>
    </div>
  );
};

export default ShiftManager;
