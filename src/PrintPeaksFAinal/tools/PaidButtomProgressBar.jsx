
import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./PaidButtomProgressBar.css";
import AwaitPays from "./AwaitPays";
import { useSelector } from "react-redux";
import Loader from "../../components/calc/Loader";
import AwaitPaysCash from "./AwaitPaysCash";
import ReceipGet from "./ReceipGet";

const PaidButtomProgressBar = ({ thisOrder, setShowPays, setThisOrder }) => {
  const [paymentState, setPaymentState] = useState("initial");
  const [invoiceId, setInvoiceId] = useState(null);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [receiptId, setReceiptId] = useState({
    id: null,
    by: null
  });
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [loading, setLoading] = useState(false);

  const [oplata, setOplata] = useState(false);
  const intervalRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const buttonStyles = {};
  const [showAwaitPays, setShowAwaitPays] = useState(false);
  const [showAwaitCashPays, setShowAwaitCashPays] = useState(false);

  const paymentMethodLabel = (method) => {
    const normalized = String(method || '').toLowerCase();
    if (normalized === 'link') return 'за посиланням';
    if (normalized === 'terminal') return 'терміналом';
    if (normalized === 'cash') return 'готівкою';
    return '—';
  };

  const firstCheckboxPayment = thisOrder?.Paymentts?.[0] || null;

  const hasFiscalReceipt = Boolean(
    firstCheckboxPayment?.checkboxReceiptId
    || (currentUser?.role === "admin" && thisOrder?.Payment?.method === "link" && thisOrder?.Payment?.invoiceId)
  );

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
    if (method === "online") {
      createInvoice(totalUAH);
    }
    if (method === "terminal") {
      createTerminalPayment(); // POS Monobank
    }
    if (method === "cash") {
      createCashPayment(); // POS Monobank
    }
    // TODO: інші методи
  };

  // --- Створити рахунок (invoice) ---
  const createInvoice = async (totalUAH) => {
    try {
      setOplata(true);
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
        setOplata(false);
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
    if (!thisOrder.Payment){
      return
    }
    if (thisOrder.Payment.invoiceId) {
      const invoiceId = thisOrder.Payment.invoiceId;
      try {
        const { data } = await axios.get("/api/payment/invoice-status", {
          params: { invoiceId },
        });
        console.log(data);
        setThisOrder((prev) => ({
          ...prev,
          Payment: data,
        }));
      } catch (err) {
        console.error("Помилка перевірки статусу:", err);
      }
    } else {

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
  const createTerminalPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.allPrice) return;
    console.log("Creating terminal payment for order:", thisOrder.id);
    try {
      setOplata(true);
      const response = await axios.post("/api/payment/create-invoice-mono", { // 👈 змінив шлях
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.allPrice * 100),
        currency: 980,
        // terminalId: "PQ012563",
      });
      console.log(response.data);
      if (response.data) {
        setOplata(false);
        setThisOrder((prev) => ({
          ...prev,
          Payment: response.data,
        }));
      }
      if (data?.payment) {
        setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
      }
    } catch (err) {
      console.error("Помилка оплати через POS:", err);
    }
  };


  const createCashPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.allPrice) return;
    console.log("Creating terminal payment for order:", thisOrder.id);
    setShowAwaitCashPays(true)
    // try {
    //   setOplata(true);
    //   const response = await axios.post("/api/payment/create-invoice-cash", { // 👈 змінив шлях
    //     orderId: thisOrder.id,
    //     amount: Math.round(thisOrder.allPrice * 100),
    //     currency: 980,
    //     // terminalId: "PQ012563",
    //   });
    //   console.log(response.data);
    //   if (response.data) {
    //     setOplata(false);
    //     setThisOrder((prev) => ({
    //       ...prev,
    //       Payment: response.data,
    //     }));
    //   }
    //   if (data?.payment) {
    //     setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
    //   }
    // } catch (err) {
    //   console.error("Помилка оплати через POS:", err);
    // }
  };

  const getPayment = async (id, by) => {
    if (!thisOrder?.id || !thisOrder?.allPrice) return;
    console.log("Creating terminal payment for order:", thisOrder.id);
    setReceiptId({...receiptId, id: id, by: by})
    setShowReceiptViewer(true)
    // setLoading(true);
    // try {
    //   const response = await axios.get(`/api/payment/receipt/${id}/pdf`, {
    //     responseType: 'blob'
    //   });
    //
    //   const blob = new Blob([response.data], { type: 'application/pdf' });
    //   const url = window.URL.createObjectURL(blob);
    //   setPdfUrl(url);
    // } catch (err) {
    //   alert('Помилка при отриманні чеку');
    //   console.error(err);
    // } finally {
    //   setLoading(false);
    // }
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


  const checkStatusAll = async () => {
    const orderId = thisOrder.id;
    try {
      const { data } = await axios.get("/api/payment/invoice-status-without-invoiceId", {
        params: { orderId },
      });
      console.log(data);
      setThisOrder((prev) => ({
        ...prev,
        Payment: data,
      }));
    } catch (err) {
      console.error("Помилка перевірки статусу:", err);
    }
  };

  useEffect(() => {
    console.log(thisOrder);
    checkStatusAll()
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
    <div className="adminTextBig">

      {showAwaitCashPays && (
        <AwaitPaysCash
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          setShowAwaitCashPays={setShowAwaitCashPays}
          showAwaitCashPays={showAwaitCashPays}
          setOplata={setOplata}
          oplata={oplata}
        />
      )}

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
          <>
            {oplata && (
              <div className="payment-methods-panel d-flex align-items-center">
                <button
                  className="PayButtons adminTextBigPay cash"
                  // onClick={() => handleSelect("cash")}
                >
                  Готівка
                </button>
                <button
                  className="PayButtons adminTextBigPay terminal"
                  // onClick={() => handleSelect("terminal")}
                >
                  <Loader/>
                </button>
                <button
                  className="PayButtons adminTextBigPay online"
                  // onClick={() => handleSelect("online")}
                >
                  Посилання
                </button>
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
            {!oplata && (
              <div className="payment-methods-panel d-flex align-items-center">
                <button
                  className="PayButtons adminTextBigPay cash"
                  onClick={() => handleSelect("cash")}
                >
                  Готівка
                  {thisOrder.Payment && thisOrder.Payment.method === 'cash' && (
                    <div style={{color: "red",  fontSize: "0.5vw"}}>
                      {thisOrder.Payment.status}
                    </div>
                  )}
                </button>
                <button
                  className="PayButtons adminTextBigPay terminal"
                  onClick={() => handleSelect("terminal")}
                >
                  Картка
                  {thisOrder.Payment && thisOrder.Payment.method === 'terminal' && (
                    <div style={{color: "red",  fontSize: "0.5vw"}}>
                      {thisOrder.Payment.status}
                    </div>
                  )}
                </button>
                <button
                  className="PayButtons adminTextBigPay online"
                  onClick={() => handleSelect("online")}
                >
                  Посилання
                  {thisOrder.Payment && thisOrder.Payment.method === 'link' && (
                    <div style={{color: "red",  fontSize: "0.5vw"}}>
                      {thisOrder.Payment.status}
                    </div>
                  )}
                  {thisOrder.Payment && thisOrder.Payment.method === null && (
                    <div style={{color: "red",  fontSize: "0.5vw"}}>
                      {thisOrder.Payment.status}
                    </div>
                  )}
                </button>
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
          </>
      )}

      {thisOrder.Payment?.status === "CREATED" && (
        <>
          {thisOrder.Payment?.method === 'terminal' && (
            <>
              <div className="payment-methods-panel payment-methods-panel--await d-flex align-items-center">
                <button
                  className="PayButtons pay-await-open"
                >
                  <Loader/>
                </button>
                <div
                  className="PayButtons wait pay-await-state"
                >
                  {formats[index]}
                </div>
                <button
                  className="PayButtons check pay-await-receipt"

                  // onClick={invalidateInvoice}

                  onClick={(event) => firstCheckboxPayment?.checkboxReceiptId && getPayment(firstCheckboxPayment.checkboxReceiptId)}
                  >
                  {loading ? <Loader/> : "Чек"}
                </button>
              </div>
            </>
          )}
          {thisOrder.Payment?.method === 'link' && (
            <>
              <div className="payment-methods-panel payment-methods-panel--await d-flex align-items-center">
                <button
                  className="PayButtons pay-await-open"
                  onClick={() => {
                    window.open(thisOrder.Payment.pageUrl, "_blank");
                  }}
                >
                  Відкрити посилання
                </button>
                <div
                  className="PayButtons wait pay-await-state"
                >
                  {formats[index]}
                </div>
                <button
                  className="PayButtons end pay-await-cancel"
                  // style={{background:"#e01729"}}
                  onClick={invalidateInvoice}>

                  {loading ? <Loader/> : "Скасувати"}
                </button>
              </div>
            </>
          )}
        </>

      )}

      {thisOrder.Payment?.status === "PAID" && (
        <>
          <div className={`payment-methods-panel payment-methods-panel--paid${hasFiscalReceipt ? ' has-receipt' : ''}`}>
            <button className="PayButtons pay-status-strip" disabled>
              <span className="pay-status-fulltext">Оплатили {paymentMethodLabel(thisOrder.Payment?.method)}</span>
            </button>

            {hasFiscalReceipt && (
              <button
                className="PayButtons pay-receipt-strip"
                onClick={() => {
                  if (firstCheckboxPayment?.checkboxReceiptId) {
                    getPayment(firstCheckboxPayment.checkboxReceiptId);
                    return;
                  }
                  if (currentUser?.role === "admin" && thisOrder.Payment?.method === "link" && thisOrder.Payment?.invoiceId) {
                    getPayment(thisOrder.Payment.invoiceId, "mono");
                  }
                }}
              >
                {loading ? <Loader/> : <div className="pay-receipt-icon">Фіскальний чек</div>}
              </button>
            )}
          </div>
        </>
      )}

      {/*{thisOrder.Payment.status && (*/}
      {/*  <div className="payment-methods-panel d-flex align-items-center">*/}
      {/*    thisOrder.Payment.status = {thisOrder.Payment.status}*/}
      {/*  </div>*/}
      {/*)}*/}

      {showAwaitPays && (
        <AwaitPays
          thisOrder={thisOrder}
          setShowAwaitPays={setShowAwaitPays}
          showAwaitPays={showAwaitPays}
        />
      )}

      {showReceiptViewer && (
        <ReceipGet
          receiptId={receiptId}
          setReceiptId={setReceiptId}
          thisOrder={thisOrder}
          showReceiptViewer={showReceiptViewer}
          setShowReceiptViewer={setShowReceiptViewer}
        />
      )}
    </div>
  );
};

export default PaidButtomProgressBar;
