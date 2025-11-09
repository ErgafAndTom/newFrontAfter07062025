// AttachExistingUserWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import { Form, Button, Spinner, ListGroup } from "react-bootstrap";

// ключ: використовуємо ті ж стилі, що і ClientSelectionModal
import "../userInNewUiArtem/ClientSelectionModal.css";

export default function AttachExistingUserWindow({ companyId, onClose, onAttached }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [attachingId, setAttachingId] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const search = async (term) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/company/${companyId}/users/search`, {
        search: term ?? q,
        limit: 50,
        excludeCompany: true,
      });
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } finally {
      setLoading(false);
    }
  };

  // debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 300);
    return () => clearTimeout(timerRef.current);
  }, [q, companyId]);

  // focus + esc + lock scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const attach = async (userId) => {
    setAttachingId(userId);
    try {
      await axios.post(`/api/company/${companyId}/users/attach`, { userId });
      onAttached && onAttached();
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="modalOverlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          width: "200vw",
          height: "200vh",
          left: "-31.5vw",
          top: "-2vh",
          backgroundColor: "rgba(15,15,15,0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 99,
          transition: "opacity 200ms ease",
        }}
      />
      {/* Container */}
      <div
        className="modalContainer animate-slide-up"
        style={{
          bottom: "25%",
          left: "35%",
          borderRadius: "12px",
          overflow: "hidden"
          , zIndex:"200"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.6rem 0.8rem",
            background: "#fbfaf6",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>Додати існуючого клієнта</div>
          <button
            aria-label="Закрити"
            onClick={onClose}
            className="adminButtonAdd"
            style={{
              height: "2rem",
              lineHeight: "2rem",
              padding: "0 0.8rem",
              background: "#e9e7de",
              borderRadius: "8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="noScrollbar" style={{ background: "#f2f0e7" }}>
          <div style={{ padding: "0.8rem" }}>
            <Form.Control
              ref={inputRef}
              placeholder="Пошук: імʼя, прізвище, телефон, email, username"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "20vh" }}
            >
              <Spinner animation="border" variant="dark" />
            </div>
          ) : (
            <div style={{ padding: "0 0.8rem 0.8rem" }}>
              <ListGroup style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {rows.length === 0 && <ListGroup.Item>Нічого не знайдено</ListGroup.Item>}
                {rows.map((u) => (
                  <ListGroup.Item
                    key={u.id}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {u.firstName} {u.familyName}{" "}
                        <span style={{ opacity: 0.6, fontWeight: 400 }}>id:{u.id}</span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {u.phoneNumber || "—"} · {u.email || "—"}
                      </div>
                    </div>
                    <Button
                      variant="success"
                      className="adminButtonAdd"
                      onClick={() => attach(u.id)}
                      disabled={!!attachingId}
                    >
                      {attachingId === u.id ? "Додаємо..." : "Додати"}
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.6rem 0.8rem",
            background: "#fbfaf6",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="secondary" onClick={onClose} className="adminButtonAdd">
            Закрити
          </Button>
        </div>
      </div>
    </>
  );
}

AttachExistingUserWindow.propTypes = {
  companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func,
  onAttached: PropTypes.func,
};
