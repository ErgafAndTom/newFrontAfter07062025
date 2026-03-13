
import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./PaidButtomProgressBar.css";
import AwaitPays from "./AwaitPays";
import { useSelector } from "react-redux";
import Loader from "../../components/calc/Loader";
import AwaitPaysCash from "./AwaitPaysCash";
import ReceipGet from "./ReceipGet";
import { triggerNewOrder } from "../../PrintPeaksFAinal/Orders/AddNewOrder";

const PAY_STATUS_UA = { CREATED: 'Очікування', PAID: 'Оплачено', CANCELLED: 'Скасовано', EXPIRED: 'Прострочено' };

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
  const [showInvoiceDocs, setShowInvoiceDocs] = useState(false);

  // --- Автоматичне створення нового замовлення після оплати ---
  const prevPaymentStatusRef = useRef(thisOrder?.Payment?.status);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevPaymentStatusRef.current = thisOrder?.Payment?.status;
      return;
    }
    const prevStatus = prevPaymentStatusRef.current;
    const currentStatus = thisOrder?.Payment?.status;
    prevPaymentStatusRef.current = currentStatus;

    if (prevStatus !== "PAID" && currentStatus === "PAID") {
      triggerNewOrder();
    }
  }, [thisOrder?.Payment?.status]);

  const paymentMethodLabel = (method) => {
    const normalized = String(method || '').toLowerCase();
    if (normalized === 'link') return 'за посиланням';
    if (normalized === 'terminal') return 'терміналом';
    if (normalized === 'cash') return 'готівкою';
    if (normalized === 'invoice') return 'за рахунком';
    if (normalized === 'iban') return 'на IBAN';
    return '—';
  };

  const firstCheckboxPayment = thisOrder?.Paymentts?.[0] || null;

  const hasFiscalReceipt = Boolean(
    firstCheckboxPayment?.checkboxReceiptId
    || (currentUser?.role === "admin" && thisOrder?.Payment?.method === "link" && thisOrder?.Payment?.invoiceId)
  );

  // --- Обробка вибору способу оплати ---
  const handleSelect = (method) => {
    const fromUnits = (thisOrder.OrderUnits || []).reduce(
      (sum, u) => sum + parseFloat(u.priceForThis || 0),
      0
    );
    const totalUAH = fromUnits > 0
      ? fromUnits
      : parseFloat(thisOrder.allPrice || thisOrder.price || 0);
    if (totalUAH <= 0) {
      console.error("Сума замовлення = 0.  не буде створено.");
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
    if (method === "iban") {
      createIbanPayment();
    }
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
        if (response.data.pageUrl) {
          window.open(response.data.pageUrl, "_blank");
        }
      }
    } catch (e) {
      console.log("createInvoice error:", e);
      setOplata(false);
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

  // --- Скасування IBAN платежу ---
  const cancelIbanPayment = async () => {
    if (!thisOrder?.id) return;
    try {
      await axios.post("/api/payment/cancel-iban", {
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
      console.error("Помилка скасування IBAN платежу:", err);
    }
  };

  // --- Завантажити документи повторно (з Payment.raw) ---
  const downloadInvoiceDocs = async () => {
    const raw = thisOrder.Payment?.raw;
    const supplierId = raw?.supplierId;
    const buyerId = raw?.buyerId;
    if (!supplierId || !buyerId) {
      // Якщо немає збережених ID — відкриваємо модалку вибору
      setShowPays(true);
      return;
    }
    try {
      setLoading(true);
      const resp = await axios.post(
        `/api/invoices/from-order/${thisOrder.id}/docInZip`,
        { supplierId, buyerId },
        { responseType: "blob" }
      );
      const cd = resp.headers?.["content-disposition"];
      let fileName = "documents.zip";
      if (cd) {
        const m = cd.match(/filename="(.+)"/);
        if (m?.[1]) fileName = m[1];
      }
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", fileName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadInvoiceDocs error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Скасування оплати за рахунком (документами) ---
  const cancelInvoiceDoc = async () => {
    if (!thisOrder?.id) return;
    try {
      const { data } = await axios.post("/api/payment/cancel-invoice-doc", {
        orderId: thisOrder.id,
      });
      setThisOrder((prev) => ({
        ...prev,
        Payment: data?.status ? data : { ...prev.Payment, status: "CANCELLED" },
      }));
    } catch (err) {
      console.error("Помилка скасування оплати за рахунком:", err);
    }
  };

  // --- Ручне підтвердження оплати рахунку (з іншого рахунку) ---
  const markInvoicePaid = async () => {
    console.log("[markInvoicePaid] called, orderId:", thisOrder?.id, "current Payment:", thisOrder?.Payment);
    if (!thisOrder?.id) return;
    try {
      const { data } = await axios.post("/api/payment/mark-invoice-paid", {
        orderId: thisOrder.id,
      });
      console.log("[markInvoicePaid] response data:", JSON.stringify(data));
      setThisOrder((prev) => {
        const updated = {
          ...prev,
          Payment: { ...prev.Payment, ...data, status: "PAID" },
        };
        console.log("[markInvoicePaid] new thisOrder.Payment:", JSON.stringify(updated.Payment));
        return updated;
      });
    } catch (err) {
      console.error("Помилка підтвердження оплати:", err?.response?.status, err?.response?.data, err);
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


  const createIbanPayment = async () => {
    if (!thisOrder?.id || !thisOrder?.allPrice) return;
    try {
      setOplata(true);
      const response = await axios.post("/api/payment/create-invoice-iban", {
        orderId: thisOrder.id,
        amount: Math.round(thisOrder.allPrice * 100),
      });
      if (response.data) {
        setOplata(false);
        setThisOrder((prev) => ({
          ...prev,
          Payment: response.data,
        }));
      }
    } catch (err) {
      setOplata(false);
      console.error("Помилка створення IBAN оплати:", err);
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



  // --- WebSocket: real-time оновлення статусу оплати від Monobank webhook ---
  useEffect(() => {
    const handlePaymentUpdate = (e) => {
      const { orderId, payment, status } = e.detail;
      if (String(orderId) === String(thisOrder?.id)) {
        console.log(`[WS] Payment update for order ${orderId}: ${status}`);
        setThisOrder((prev) => ({
          ...prev,
          Payment: payment,
        }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    window.addEventListener('paymentStatusUpdate', handlePaymentUpdate);
    return () => window.removeEventListener('paymentStatusUpdate', handlePaymentUpdate);
  }, [thisOrder?.id]);

  // --- Одноразова перевірка статусу при CREATED (guard на бекенді не стукає в Monobank якщо термінальний) ---
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
    if (thisOrder.Payment?.status && thisOrder.Payment.status !== 'PAID') {
      checkStatusAll();
    }
  }, [thisOrder.id]);

  // --- Fallback polling (DB-only, кожні 2 хв) — на випадок якщо WS відключений ---
  useEffect(() => {
    if (thisOrder?.Payment?.status === 'CREATED') {
      const interval = setInterval(async () => {
        try {
          const { data } = await axios.get("/api/payment/invoice-status-without-invoiceId", {
            params: { orderId: thisOrder.id },
          });
          if (data?.status && data.status !== 'CREATED') {
            setThisOrder((prev) => ({
              ...prev,
              Payment: data,
            }));
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Fallback polling error:", err);
        }
      }, 120000); // кожні 2 хвилини
      intervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [thisOrder?.Payment?.status]);

  return (
    <div className="adminTextBig" style={{ width: "100%" }}>

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
                <button
                  className="PayButtons adminTextBigPay iban"
                >
                  на IBAN
                </button>
              </div>
            )}
            {!oplata && (
              <div className="payment-methods-panel">
                <button
                  className="nui-client-rect-btn"
                  onClick={() => handleSelect("cash")}
                >
                  <span className="nui-client-rect-btn-text">Готівка</span>
                  {thisOrder.Payment && thisOrder.Payment.method === 'cash' && (
                    <span className="pay-sel-status">
                      {PAY_STATUS_UA[thisOrder.Payment.status] || thisOrder.Payment.status}
                    </span>
                  )}
                </button>
                <button
                  className="nui-client-rect-btn"
                  onClick={() => handleSelect("terminal")}
                >
                  <span className="nui-client-rect-btn-text">Картка</span>
                  {thisOrder.Payment && thisOrder.Payment.method === 'terminal' && (
                    <span className="pay-sel-status">
                      {PAY_STATUS_UA[thisOrder.Payment.status] || thisOrder.Payment.status}
                    </span>
                  )}
                </button>
                <button
                  className="nui-client-rect-btn"
                  onClick={() => handleSelect("online")}
                >
                  <span className="nui-client-rect-btn-text">Посилання</span>
                  {(thisOrder.Payment?.method === 'link' || thisOrder.Payment?.method === null) && (
                    <span className="pay-sel-status">
                      {PAY_STATUS_UA[thisOrder.Payment.status] || thisOrder.Payment.status}
                    </span>
                  )}
                </button>
                <button
                  className="nui-client-rect-btn"
                  onClick={() => setShowPays(true)}
                  title="Платежі"
                >
                  <span className="nui-client-rect-btn-text">Рахунок</span>
                </button>
                <button
                  className="nui-client-rect-btn"
                  onClick={() => handleSelect("iban")}
                >
                  <span className="nui-client-rect-btn-text">на IBAN</span>
                  {thisOrder.Payment && thisOrder.Payment.method === 'iban' && (
                    <span className="pay-sel-status">
                      {PAY_STATUS_UA[thisOrder.Payment.status] || thisOrder.Payment.status}
                    </span>
                  )}
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
                  <span className="pay-shimmer-txt">В очікуванні оплати</span>
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
                  <span className="pay-shimmer-txt">В очікуванні оплати</span>
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
          {thisOrder.Payment?.method === 'iban' && (
            <>
              <div className="payment-methods-panel payment-methods-panel--await d-flex align-items-center">
                <button className="PayButtons pay-await-open">
                  на IBAN
                </button>
                <div className="PayButtons wait pay-await-state">
                  <span className="pay-shimmer-txt">В очікуванні оплати</span>
                </div>
                <button
                  className="PayButtons end pay-await-cancel"
                  onClick={cancelIbanPayment}>
                  Скасувати
                </button>
              </div>
              <div className="pay-invoice-manual-confirm">
                <button
                  className="pay-invoice-manual-confirm-btn"
                  onClick={markInvoicePaid}
                >
                  Оплату на IBAN підтверджено
                </button>
              </div>
            </>
          )}
          {thisOrder.Payment?.method === 'invoice' && (
            <>
              <div className="payment-methods-panel payment-methods-panel--await payment-methods-panel--invoice d-flex align-items-center">
                <button
                  className="PayButtons pay-await-open pay-await-open--wide"
                  onClick={downloadInvoiceDocs}
                >
                  {loading ? <Loader/> : "Завантажити документи"}
                </button>
                <div
                  className="PayButtons wait pay-await-state pay-await-state--small"
                >
                  <span className="pay-shimmer-txt">В очікуванні оплати рахунку</span>
                </div>
                <button
                  className="PayButtons end pay-await-cancel"
                  onClick={cancelInvoiceDoc}>
                  Скасувати
                </button>
              </div>
              <div className="pay-invoice-manual-confirm">
                <button
                  className="pay-invoice-manual-confirm-btn"
                  onClick={markInvoicePaid}
                >
                  Рахунок оплачено з іншого рахунку
                </button>
              </div>
            </>
          )}
        </>

      )}

      {thisOrder.Payment?.status === "PAID" && (
        <>
          <div className={`payment-methods-panel payment-methods-panel--paid${(hasFiscalReceipt || thisOrder.Payment?.method === 'invoice' || thisOrder.Payment?.method === 'iban') ? ' has-receipt' : ''}`}>
            <button className="PayButtons pay-status-strip" disabled>
              <span className="pay-status-fulltext">
                {thisOrder.Payment?.method === 'iban'
                  ? 'НА IBAN оплатили'
                  : `Оплатили ${paymentMethodLabel(thisOrder.Payment?.method)}`}
              </span>
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

            {thisOrder.Payment?.method === 'invoice' && (
              <button
                className="PayButtons pay-receipt-strip"
                onClick={downloadInvoiceDocs}
              >
                {loading ? <Loader/> : <div className="pay-receipt-icon">Завантажити документи</div>}
              </button>
            )}

            {thisOrder.Payment?.method === 'iban' && (
              <button
                className="PayButtons pay-receipt-strip"
                onClick={() => setShowAwaitPays(true)}
              >
                <div className="pay-receipt-icon">чек</div>
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
