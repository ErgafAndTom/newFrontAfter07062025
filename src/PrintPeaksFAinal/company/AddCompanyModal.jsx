import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!showAddCompany) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setShowAddCompany(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAddCompany, setShowAddCompany]);

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

  const nameError = Boolean(error) && !company.companyName.trim();

  return ReactDOM.createPortal(
    <>
      <div className="ppm-overlay acm-top" onClick={handleClose} />

      <div className="ppm-modal acm-top" role="dialog" aria-modal="true" aria-label="Додати компанію">
        <form onSubmit={handleSubmit}>

          <header className="ppm-head">
            <h2 className="ppm-title">Додати компанію</h2>
            <button type="button" className="ppm-close" onClick={handleClose} aria-label="Закрити">✕</button>
          </header>

          <div className="ppm-body">

            <div className="acm-grid">
              <div className="ppm-section">
                <p className="ppm-label">Назва</p>
                <input
                  className={`ppm-input${nameError ? " ppm-input-error" : ""}`}
                  type="text"
                  name="companyName"
                  value={company.companyName}
                  onChange={handleChange}
                  placeholder="ТОВ «...»"
                  autoFocus
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">E-mail</p>
                <input
                  className="ppm-input"
                  type="email"
                  name="email"
                  value={company.email}
                  onChange={handleChange}
                  placeholder="mail@company.ua"
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">Адреса</p>
                <input
                  className="ppm-input"
                  type="text"
                  name="address"
                  value={company.address}
                  onChange={handleChange}
                  placeholder="місто, вулиця, №"
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">Telegram</p>
                <input
                  className="ppm-input"
                  type="text"
                  name="telegram"
                  value={company.telegram}
                  onChange={handleChange}
                  placeholder="@username"
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">Телефон</p>
                <input
                  className="ppm-input acm-num"
                  type="tel"
                  name="phoneNumber"
                  value={company.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+38 XXX XXX-XX-XX"
                  maxLength={17}
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">ЄДРПОУ</p>
                <input
                  className="ppm-input acm-num"
                  type="text"
                  name="edrpou"
                  value={company.edrpou}
                  onChange={handleChange}
                  placeholder="00000000"
                />
              </div>

              <div className="ppm-section">
                <p className="ppm-label">Знижка, %</p>
                <input
                  className="ppm-input acm-num"
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

            <div className="ppm-section">
              <p className="ppm-label">Нотатки</p>
              <textarea
                className="ppm-textarea"
                name="notes"
                value={company.notes}
                onChange={handleChange}
                placeholder="Додаткова інформація про компанію"
              />
            </div>

            {error && <div className="ppm-error">{error}</div>}

          </div>

          <div className="ppm-foot">
            <button type="button" className="ppm-btn" onClick={handleClose}>
              Скасувати
            </button>
            <button type="submit" className="ppm-btn ppm-btn-primary" disabled={loading}>
              {loading ? "Зберігаємо..." : "Додати компанію"}
            </button>
          </div>

        </form>
      </div>
    </>,
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
