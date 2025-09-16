import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import "./PaidButtomProgressBar.css";
import ShiftManager from "../../components/prro/ShiftManager";

const PaidButtomProgressBar = ({ thisOrder, setShowPays, setThisOrder }) => {
  const [loading, setLoading] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);

  // --- Перевірка поточної зміни при завантаженні ---
  const fetchShift = async () => {
    try {
      const { data } = await axios.get("/api/shifts/current");
      if (data?.shift) {
        console.log("Shift from backend:", data.shift); // 👈 подивись у консолі
        setShiftOpen(data.shift.status === "OPENED");
      } else {
        setShiftOpen(false);
      }
    } catch (err) {
      console.error("Помилка отримання поточної зміни:", err);
      setShiftOpen(false);
    }
  };


  useEffect(() => {
    fetchShift();
  }, []);

  // --- Відкрити зміну ---
  // const openShift = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post("/api/shifts/open");
  //     setShiftOpen(true);
  //   } catch (err) {
  //     console.error("Помилка відкриття зміни:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // // --- Закрити зміну ---
  // const closeShift = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post("/api/shifts/close");
  //     setShiftOpen(false);
  //   } catch (err) {
  //     console.error("Помилка закриття зміни:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // --- Створити оплату через POS Monobank ---
  const createTerminalPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.totalAmount) return;
    try {
      const { data } = await axios.post("/api/payments/pos-sale", {
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.totalAmount * 100),
        currency: 980,
        terminalId: "PQ012563" // можна винести в .env чи Redux
      });
      if (data?.payment) {
        setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };

  return (
    <div className="payment-methods-panel adminTextBig">
      <ShiftManager />
      {/* Якщо зміна закрита */}
      {/*{!shiftOpen ? (*/}
      {/*  <>*/}
      {/*    <button*/}
      {/*      className="PayButtons adminTextBig shift-open"*/}
      {/*      onClick={openShift}*/}
      {/*      disabled={loading}*/}
      {/*    >*/}
      {/*      Відкрити зміну*/}
      {/*    </button>*/}
      {/*    <button disabled={loading} onClick={closeShift} className="close-btn">*/}
      {/*      {loading ? "Закриваємо..." : "Закрити зміну"}*/}
      {/*    </button>*/}
      {/*  </>*/}
      {/*) : (*/}
      {/*  <>*/}
      {/*    /!* Якщо зміна відкрита *!/*/}
      {/*    <button*/}
      {/*      className="PayButtons adminTextBig shift-close"*/}
      {/*      onClick={closeShift}*/}
      {/*      disabled={loading}*/}
      {/*    >*/}
      {/*      Закрити зміну*/}
      {/*    </button>*/}

      {/*    /!* Кнопки оплати доступні тільки коли зміна відкрита *!/*/}
      {/*    <div className="payment-methods-panel d-flex align-items-center">*/}
      {/*      <button*/}
      {/*        className="PayButtons adminTextBig cash"*/}
      {/*        disabled={loading}*/}
      {/*        onClick={() => console.log("Готівкова оплата")}*/}
      {/*      >*/}
      {/*        Розрахунок готівкою*/}
      {/*      </button>*/}

      {/*      <button*/}
      {/*        className="PayButtons adminTextBig terminal"*/}
      {/*        disabled={loading}*/}
      {/*        onClick={createTerminalPayment}*/}
      {/*      >*/}
      {/*        Розрахунок карткою (POS)*/}
      {/*      </button>*/}

      {/*      <button*/}
      {/*        className="PayButtons adminTextBig online"*/}
      {/*        disabled={loading}*/}
      {/*        onClick={() => console.log("Оплата онлайн")}*/}
      {/*      >*/}
      {/*        Платіж за посиланням*/}
      {/*      </button>*/}

      {/*      <button*/}
      {/*        className="PayButtons adminTextBig invoices"*/}
      {/*        disabled={loading}*/}
      {/*        onClick={() => setShowPays(true)}*/}
      {/*      >*/}
      {/*        Оплата на рахунок*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </>*/}
      {/*)}*/}
    </div>
  );
};

export default PaidButtomProgressBar;
