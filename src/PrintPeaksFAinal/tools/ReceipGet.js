import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const ReceipGet = ({
                             thisOrder,
                             showReceiptViewer,
                             setShowReceiptViewer,
                           }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowReceiptViewer(false);
      setPdfUrl(null);
    }, 300);
  };

  const handleShow = useCallback(() => {
    setShowReceiptViewer(true);
  }, []);

  useEffect(() => {
    if (showReceiptViewer) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showReceiptViewer]);

  // 🧾 Завантажити чек
  const fetchReceipt = async () => {
    if (!thisOrder?.Paymentts) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/payment/receipt/${thisOrder.Paymentts[0].checkboxReceiptId}/pdf`, {
        responseType: "blob",
      });

      console.log(response);

      const blob = new Blob([response.data], { type: "application/pdf" });

      console.log(blob);

      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setError(null);
    } catch (err) {
      console.error("❌ Помилка отримання чеку:", err);
      setError("Не вдалося отримати чек");
    } finally {
      setLoading(false);
    }
  };

  // 🖨️ Скачати чек
  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `receipt_${thisOrder.id}.pdf`;
    a.click();
  };

  useEffect(() => {
    fetchReceipt()
  }, []);

  return (
    <>
      {isVisible ? (
        <div>
          <div
            style={{
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.5)",
              position: "fixed",
              left: 0,
              bottom: 0,
              zIndex: 999,
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={handleClose}
          ></div>

          <div
            className="d-flex flex-column"
            style={{
              zIndex: 1000,
              position: "fixed",
              background: "#f0eee7",
              top: "50%",
              left: "50%",
              transform: isAnimating
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.8)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              borderRadius: "1vw",
              width: "50vw",
              height: "90vh",
              padding: "1vw",
              boxShadow: "0 0 25px rgba(0,0,0,0.25)",
            }}
          >
            <div className="d-flex">
              <div className="m-auto text-center adminFont">Фіскальний чек №: {thisOrder.Paymentts[0].checkboxReceiptId}</div>
              <div
                className="btn btn-close btn-lg"
                style={{ margin: "0.1vw" }}
                onClick={handleClose}
              ></div>
            </div>

            {/*<div*/}
            {/*  className="d-flex flex-row adminFont"*/}
            {/*  style={{*/}
            {/*    marginLeft: "1vw",*/}
            {/*    justifyContent: "space-between",*/}
            {/*    marginTop: "0.5vw",*/}
            {/*    alignItems: "center",*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <div>Замовлення №{thisOrder?.id}</div>*/}
            {/*  /!*<div>Сума: {(thisOrder?.allPrice || 0).toFixed(2)} грн</div>*!/*/}
            {/*</div>*/}

            <div style={{ marginTop: "0" }}>
              <MDBContainer fluid style={{ width: "100%" }}>
                <Row>
                  {!pdfUrl && !error && (
                    <button
                      className="adminButtonAdd adminTextBigPay"
                      onClick={fetchReceipt}
                      disabled={loading}
                    >
                      {loading ? "Завантаження..." : "Отримати чек"}
                    </button>
                  )}

                  {error && <div style={{ color: "red" }}>{error}</div>}

                  {pdfUrl && (
                    <>
                      <iframe
                        src={pdfUrl}
                        title="Чек PDF"
                        style={{
                          width: "100%",
                          height: "78vh",
                          marginTop: "1vh",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                        }}
                      />

                      <div className="d-flex justify-content-center mt-3">
                        <button
                          className="adminButtonAdd adminTextBigPay"
                          style={{ background: "#0a8d39" }}
                          onClick={handleDownload}
                        >
                          📥 Завантажити
                        </button>

                        <button
                          className="adminButtonAdd adminTextBigPay"
                          style={{ background: "#d60a1c", marginLeft: "1vw" }}
                          onClick={handleClose}
                        >
                          Закрити
                        </button>
                      </div>
                    </>
                  )}
                </Row>
              </MDBContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
    </>
  );
};

export default ReceipGet;
