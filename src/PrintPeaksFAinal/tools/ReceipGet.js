import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";

const ReceipGet = ({
  thisOrder,
  showReceiptViewer,
  setShowReceiptViewer,
  receiptId,
  setReceiptId,
}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowReceiptViewer(false);
      setPdfUrl(null);
    }, 300);
  };

  useEffect(() => {
    if (showReceiptViewer) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showReceiptViewer]);

  const fetchReceipt = async () => {
    if (!receiptId && !receiptId.id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/payment/receipt/${receiptId.id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setError(null);
    } catch (err) {
      console.error("Помилка отримання чеку:", err);
      setError("Не вдалося отримати чек");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptByMono = async () => {
    if (!receiptId && !receiptId.id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/payment/receiptForInvoiceId/${receiptId.id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setError(null);
    } catch (err) {
      console.error("Помилка отримання чеку:", err);
      setError("Не вдалося отримати чек");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `receipt_${thisOrder.id}.pdf`;
    a.click();
  };

  useEffect(() => {
    if (receiptId && receiptId.by === "mono") {
      fetchReceiptByMono();
    } else {
      fetchReceipt();
    }
  }, []);

  return (
    <>
      {isVisible && ReactDOM.createPortal(
        <div>
          {/* Backdrop */}
          <div
            style={{
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.35)",
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 99998,
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            style={{
              zIndex: 99999,
              position: "fixed",
              background: "var(--adminfon, #f7f5ee)",
              top: "50%",
              left: "50%",
              transform: isAnimating
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.95)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              width: "50vw",
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              gap: "0.5rem",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontSize: "var(--font-size-s, 17px)",
                fontWeight: 400,
                color: "var(--admingrey, #666)",
                textTransform: "uppercase",
              }}>
                Фіскальний чек №: {receiptId.id}
              </span>
              <button
                className="nui-client-rect-btn"
                onClick={handleClose}
                style={{ width: "2rem", height: "2rem", padding: 0, minWidth: 0 }}
              >
                <span className="nui-client-rect-btn-text" style={{ fontSize: "var(--fontsmall, 15px)" }}>✕</span>
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              {!pdfUrl && !error && (
                <button
                  className="nui-client-rect-btn"
                  onClick={fetchReceipt}
                  disabled={loading}
                  style={{ width: "100%", height: "3rem" }}
                >
                  <span className="nui-client-rect-btn-text">
                    {loading ? "Завантаження..." : "Отримати чек"}
                  </span>
                </button>
              )}

              {error && (
                <div style={{ color: "var(--adminred, #ee3c23)", textAlign: "center", padding: "1rem" }}>
                  {error}
                </div>
              )}

              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="Чек PDF"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid var(--admingrey, #666)",
                  }}
                />
              )}
            </div>

            {/* Footer buttons */}
            {pdfUrl && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="adminButtonAdd adminButtonGreen"
                  onClick={handleDownload}
                  style={{ flex: 1 }}
                >
                  Завантажити
                </button>

                <button
                  className="adminButtonAdd adminButtonOrange"
                  onClick={handleClose}
                  style={{ flex: 1 }}
                >
                  Закрити
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ReceipGet;
