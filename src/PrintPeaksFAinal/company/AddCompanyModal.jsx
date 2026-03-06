import React, { useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import "./AddCompanyModal.css";

function AddCompanyModal({ user, showAddCompany, setShowAddCompany, onCompanyAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [company, setCompany] = useState({
    companyName: "",
    address: "",
    phoneNumber: "",
    email: "",
    telegram: "",
    edrpou: "",
    discount: 0,
    notes: ""
  });

  const handleClose = () => setShowAddCompany(false);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^+\d]/g, "");
    if (!value.startsWith("+")) value = "+38" + value;
    const formattedValue = value
      .replace(/^(\+\d{2})/, "$1 ")
      .replace(/(\d{3})(\d)/, "$1 $2")
      .replace(/(\d{3}) (\d{3})(\d)/, "$1 $2-$3")
      .replace(/-(\d{2})(\d{1,2})/, "-$1-$2");
    setCompany((prev) => ({ ...prev, phoneNumber: formattedValue.trim() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) {
      setError("Введіть назву компанії");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/company/create", company);
      onCompanyAdded && onCompanyAdded(res.data);
      setLoading(false);
      setShowAddCompany(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Помилка при додаванні компанії");
    }
  };

  if (!showAddCompany) return null;

  return ReactDOM.createPortal(
    <div className="acm-overlay" onClick={handleClose}>
      <div className="acm-panel" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>

          {/* Header */}
          <header className="acm-header">
            <span className="acm-header-title">Додати компанію</span>
            <button type="button" className="acm-close" onClick={handleClose}>✕</button>
          </header>

          {/* Body — two columns */}
          <div className="acm-body">

            {/* Left: Назва, Адреса, Телефон */}
            <div className="acm-section">
              <div className="acm-field-row">
                <span className="acm-field-label">Назва</span>
                <input
                  className="acm-field-input"
                  type="text"
                  name="companyName"
                  value={company.companyName}
                  onChange={handleChange}
                  placeholder="—"
                  autoFocus
                />
              </div>
              <div className="acm-field-row">
                <span className="acm-field-label">Адреса</span>
                <input
                  className="acm-field-input"
                  type="text"
                  name="address"
                  value={company.address}
                  onChange={handleChange}
                  placeholder="—"
                />
              </div>
              <div className="acm-field-row">
                <span className="acm-field-label">Телефон</span>
                <input
                  className="acm-field-input"
                  type="tel"
                  name="phoneNumber"
                  value={company.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+38 XXX XXX-XX-XX"
                  maxLength={17}
                />
              </div>
            </div>

            {/* Right: E-mail, Telegram, ЄДРПОУ, Знижка */}
            <div className="acm-section">
              <div className="acm-field-row">
                <span className="acm-field-label">E-mail</span>
                <input
                  className="acm-field-input"
                  type="email"
                  name="email"
                  value={company.email}
                  onChange={handleChange}
                  placeholder="—"
                />
              </div>
              <div className="acm-field-row">
                <span className="acm-field-label">Telegram</span>
                <input
                  className="acm-field-input"
                  type="text"
                  name="telegram"
                  value={company.telegram}
                  onChange={handleChange}
                  placeholder="@username"
                />
              </div>
              <div className="acm-field-row">
                <span className="acm-field-label">ЄДРПОУ</span>
                <input
                  className="acm-field-input"
                  type="text"
                  name="edrpou"
                  value={company.edrpou}
                  onChange={handleChange}
                  placeholder="—"
                />
              </div>
              <div className="acm-field-row">
                <span className="acm-field-label">Знижка (%)</span>
                <input
                  className="acm-field-input"
                  type="number"
                  name="discount"
                  min="0"
                  max="50"
                  step="1"
                  value={company.discount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

          </div>

          {/* Notes — full width */}
          <div className="acm-notes-row">
            <span className="acm-field-label">Нотатки</span>
            <textarea
              className="acm-notes-textarea"
              name="notes"
              value={company.notes}
              onChange={handleChange}
              placeholder="Додаткова інформація про компанію"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="acm-error" onClick={() => setError(null)}>{error}</div>
          )}

          {/* Submit */}
          <div className="acm-submit-row">
            <button
              type="submit"
              className="acm-rect-btn acm-rect-btn--green"
              disabled={loading}
              style={{ width: "25vw" }}
            >
              <span className="acm-rect-btn-text">
                {loading ? "Зберігаємо..." : "Додати компанію"}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}

AddCompanyModal.propTypes = {
  user: PropTypes.any,
  showAddCompany: PropTypes.bool.isRequired,
  setShowAddCompany: PropTypes.func.isRequired,
  onCompanyAdded: PropTypes.func
};

export default AddCompanyModal;
