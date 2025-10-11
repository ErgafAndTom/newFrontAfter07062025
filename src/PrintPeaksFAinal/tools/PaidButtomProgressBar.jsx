// import React, {useState} from "react";
// import axios from "../../api/axiosInstance";
// import "./PaidButtomProgressBar.css";
// import ShiftManager from "../../components/prro/ShiftManager";
// import ShiftControl from "../checkbox/ShiftControl";
// import ShiftControlModal from "../checkbox/ShiftControlModal";
//
// const PaidButtomProgressBar = ({ thisOrder, setShowPays, setThisOrder }) => {
//   const [loading] = useState(false);
//
//
//   // useEffect(() => {
//   //   fetchShift();
//   // }, []);
//
//   // --- Відкрити зміну ---
//   // const openShift = async () => {
//   //   setLoading(true);
//   //   try {
//   //     await axios.post("/api/shifts/open");
//   //     setShiftOpen(true);
//   //   } catch (err) {
//   //     console.error("Помилка відкриття зміни:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   //
//   // // --- Закрити зміну ---
//   // const closeShift = async () => {
//   //   setLoading(true);
//   //   try {
//   //     await axios.post("/api/shifts/close");
//   //     setShiftOpen(false);
//   //   } catch (err) {
//   //     console.error("Помилка закриття зміни:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//
//   // --- Створити оплату через POS Monobank ---
//   const createTerminalPayment = async () => {
//     if (!thisOrder?.id || !thisOrder?.totalAmount) return;
//     console.log('Creating terminal payment for order:', thisOrder.id);
//     try {
//       const {data} = await axios.post("/api/pos/sale", {
//         orderId: thisOrder.id,
//         amount: Math.round(thisOrder.totalAmount * 100),
//         currency: 980,
//         terminalId: "PQ012563" // можна винести в .env чи Redux
//       });
//       console.log('Payment response:', data);
//       if (data?.payment) {
//         setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
//       }
//     } catch (err) {
//       console.error("Помилка оплати через POS:", err);
//     }
//   };
//
//
//   return (
//     <div className="payment-methods-panel adminTextBig">
//       <ShiftManager
//         createTerminalPayment={createTerminalPayment}
//         thisOrder={thisOrder}
//         setShowPays={setShowPays}
//         setThisOrder={setThisOrder}
//       />
//       <ShiftControlModal />
//     </div>
//   );
// };
//
// export default PaidButtomProgressBar;


import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./PaidButtomProgressBar.css";
import AwaitPays from "./AwaitPays";
import { useSelector } from "react-redux";
import ShiftManager from "../../components/prro/ShiftManager";
import ShiftControlModal from "../checkbox/ShiftControlModal";

const PaidButtomProgressBar = ({ thisOrder, setShowPays, setThisOrder }) => {
  const [paymentState, setPaymentState] = useState("initial");
  const [invoiceId, setInvoiceId] = useState(null);
  const intervalRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const buttonStyles = {};
  const [showAwaitPays, setShowAwaitPays] = useState(false);

  // --- Обробка вибору способу оплати ---
  const handleSelect = (method) => {
    const totalUAH = (thisOrder.OrderUnits || []).reduce(
      (sum, u) => sum + parseFloat(u.priceForThis || 0),
      0
    );
    if (totalUAH <= 0) {
      console.error("Сума замовлення = 0. Рахунок не буде створено.");
      return;
    }
    if (method === "online" || method === "cash") {
      createInvoice(totalUAH);
    }
    if (method === "terminal") {
      createTerminalPayment(); // POS Monobank
    }
    // TODO: інші методи
  };

  // --- Створити рахунок (invoice) ---
  const createInvoice = async (totalUAH) => {
    try {
      const response = await axios.post("/api/payment/create-invoice", {
        orderId: thisOrder.id,
        payload: {
          amount: Math.round(totalUAH * 100),
          merchantPaymInfo: {
            reference: thisOrder.barcode,
            destination: "Оплата замовлення",
            comment: "Оплата за послуги",
          },
        },
        customerPhone: thisOrder.phone,
        customerEmail: thisOrder.email,
      });

      if (response.data) {
        setThisOrder((prev) => ({
          ...prev,
          Payment: response.data,
        }));
      }
    } catch (e) {
      console.log("createInvoice error:", e);
    }
  };

  // --- Перевірка статусу рахунку ---
  const checkStatus = async () => {
    if (!thisOrder.Payment?.invoiceId) return;
    const invoiceId = thisOrder.Payment.invoiceId;
    try {
      const { data } = await axios.get("/api/payment/invoice-status", {
        params: { invoiceId },
      });
      setThisOrder((prev) => ({
        ...prev,
        Payment: data,
      }));
    } catch (err) {
      console.error("Помилка перевірки статусу:", err);
    }
  };

  // --- Скасування платежу ---
  const cancelPayment = async () => {
    if (!thisOrder.Payment?.invoiceId) return;
    try {
      await axios.post("/api/payment/cancel-invoice", {
        orderId: thisOrder.id,
      });
      setThisOrder((prev) => ({
        ...prev,
        Payment: {
          ...prev.Payment,
          status: "CANCELLED",
        },
      }));
    } catch (err) {
      console.error("Помилка скасування платежу:", err);
    } finally {
      clearInterval(intervalRef.current);
      setInvoiceId(null);
    }
  };

  // --- Інвалідація рахунку ---
  const invalidateInvoice = async () => {
    if (!thisOrder.Payment?.invoiceId) return;
    try {
      await axios.post("/api/payment/invalidate-invoice", {
        invoiceIdMy: thisOrder.Payment.invoiceId,
      });
      setThisOrder((prev) => ({
        ...prev,
        Payment: {
          ...prev.Payment,
          status: "CANCELLED",
        },
      }));
    } catch (err) {
      console.error("Помилка інвалідації рахунку:", err);
    }
  };

  // --- POS Monobank оплата (логіка другого коду) ---
// --- POS Monobank оплата (через Checkbox backend)
  const createTerminalPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.allPrice) return;
    console.log("Creating terminal payment for order:", thisOrder.id);
    try {
      // const { data } = await axios.post("/api/checkbox/shift/sale", { // 👈 змінив шлях
      const { data } = await axios.post("/api/checkbox/payments/pos/sale", { // 👈 змінив шлях
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.allPrice * 100),
        currency: 980,
        // terminalId: "PQ012563",
      });
      console.log(data);
      if (data?.payment) {
        setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };


  // --- Анімація "В очікуванні оплати" ---
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
    "В очікуванні оплати|",
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % formats.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // --- Автоматична перевірка статусу при CREATED ---
  useEffect(() => {
    if (thisOrder.Payment?.status === "CREATED") {
      checkStatus();
    }
  }, [thisOrder.id]);
  useEffect(() => {
    if (thisOrder?.Invoice?.id && thisOrder?.Payment?.status === "CREATED") {
      const interval = setInterval(async () => {
        const { data } = await axios.get(`/api/v1/invoices/status/${thisOrder.Invoice.id}`);
        if (data.status === "PAID") {
          setThisOrder((prev) => ({
            ...prev,
            Payment: { ...prev.Payment, status: "PAID" },
          }));
          clearInterval(interval);
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [thisOrder]);

  return (
    <div className="payment-methods-panel adminTextBig">
      {/* Інтеграція ShiftManager (з другого) */}
      {/*<ShiftManager*/}
      {/*  createTerminalPayment={createTerminalPayment}*/}
      {/*  thisOrder={thisOrder}*/}
      {/*  setShowPays={setShowPays}*/}
      {/*  setThisOrder={setThisOrder}*/}
      {/*/>*/}
      {/*<ShiftControlModal />*/}

      {/* Блок вибору методів оплати */}
      {(!thisOrder.Payment ||
        ["CANCELLED", "EXPIRED"].includes(thisOrder.Payment.status)) && (
        <div className="payment-methods-panel d-flex align-items-center">
          <button
            className="PayButtons adminTextBigPay cash"
            onClick={() => handleSelect("cash")}
          >
            Готівка
          </button>
          <button
            className="PayButtons adminTextBigPay terminal"
            onClick={() => handleSelect("terminal")}
          >
            Картка
          </button>
          <button
            className="PayButtons adminTextBigPay online"
            onClick={() => handleSelect("online")}
          >
Посилання          </button>
          <button
            onClick={() => setShowPays(true)}
            title="Платежі"
            style={{ ...buttonStyles.base, ...buttonStyles.iconButton }}
            className="PayButtons adminTextBigPay invoices"
          >
            Рахунок
          </button>
        </div>
      )}

      {thisOrder.Payment?.status === "CREATED" && (
        <div className="payment-methods-panel d-flex align-items-center">
          <button
            className="PayButtons link"
            style={{
              backgroundColor: "#008249",
              color: "white",
              width: "3vw",
            }}
            onClick={() => {
              window.open(thisOrder.Payment.pageUrl, "_blank");
            }}
          >
            +&nbsp;
          </button>
          <div
            className="PayButtons wait"
            style={{
              background: "#f2f0e7",
              height: "6vh",
              width: "25vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "1vw",
              fontWeight: 400,
              borderRadius: "0vw",
              color: "#9f9e9d",
            }}
          >
            {formats[index]}
          </div>
          <button
            className="PayButtons end"
            style={{ backgroundColor: "red", color: "white", width: "3vw" }}
            onClick={invalidateInvoice}
          >
            &nbsp;x
          </button>
        </div>
      )}

      {thisOrder.Payment?.status === "PAID" && (
        <div className="payment-methods-panel d-flex align-items-center">
          <button
            className="PayButtons link"
            style={{
              background: "#008249",
              height: "6vh",
              width: "27vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "1vw",
              fontWeight: 400,
              borderRadius: "0vw",
              color: "#f2f0e7",
            }}
          >
            Замовлення оплачене
          </button>
          {currentUser.role === "admin" && (
            <button
              className="PayButtons end"
              style={{ backgroundColor: "red", color: "white", width: "3vw" }}
              onClick={cancelPayment}
            >
              x
            </button>
          )}
        </div>
      )}

      {showAwaitPays && (
        <AwaitPays
          thisOrder={thisOrder}
          setShowAwaitPays={setShowAwaitPays}
          showAwaitPays={showAwaitPays}
        />
      )}
    </div>
  );
};

export default PaidButtomProgressBar;
