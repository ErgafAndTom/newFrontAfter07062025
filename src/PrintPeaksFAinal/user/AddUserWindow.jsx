import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddCompanyModal from "../company/AddCompanyModal";
import "./AddUserWindow.css";

/* ── Модалка пошуку/вибору існуючої компанії ── */
function SelectCompanyModal({ onSelect, onClose }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      axios.post("/api/companies/search", { search: q, limit: 50 })
        .then(r => setRows(Array.isArray(r.data?.rows) ? r.data.rows : []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return ReactDOM.createPortal(
    <div className="acm-overlay" style={{ zIndex: 10700 }} onClick={onClose}>
      <div className="scm-panel" onClick={(e) => e.stopPropagation()}>
        <header className="acm-header">
          <span className="acm-header-title">Вибрати компанію</span>
          <button type="button" className="acm-close" onClick={onClose}>✕</button>
        </header>
        <div className="scm-search">
          <input
            ref={inputRef}
            className="scm-search-input"
            placeholder="Пошук компанії..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="scm-list">
          {loading && <div className="scm-empty">Завантаження...</div>}
          {!loading && rows.length === 0 && <div className="scm-empty">Компанію не знайдено</div>}
          {!loading && rows.map((c) => (
            <div key={c.id} className="scm-row" onClick={() => onSelect(c)}>
              <div className="scm-row-name">{c.companyName}</div>
              {(c.edrpou || c.phoneNumber || (parseInt(String(c.discount ?? '0').replace(/\D/g, ''), 10) > 0)) && (
                <div className="scm-row-sub">
                  {c.edrpou && <span>ЄДРПОУ: {c.edrpou}</span>}
                  {c.phoneNumber && <span>{c.edrpou ? ' · ' : ''}Тел.: {c.phoneNumber}</span>}
                  {(() => {
                    const d = parseInt(String(c.discount ?? '0').replace(/\D/g, ''), 10) || 0;
                    return d > 0 ? <span className="scm-row-discount">{(c.edrpou || c.phoneNumber) ? ' · ' : ''}Знижка: {d}%</span> : null;
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Головний компонент ── */
function AddUserWindow({ show, onHide, onUserAdded, addOrdOrOnlyClient, thisOrder, setThisOrder, presetCompany }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showSelectCompany, setShowSelectCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(
    presetCompany ? { id: presetCompany.id, name: presetCompany.name } : null
  );
  const userr = useSelector(state => state.auth.user);

  const [user, setUser] = useState({
    firstName: '', lastName: '', familyName: '', phoneNumber: '', email: '',
    companyId: presetCompany?.id || '', companyName: presetCompany?.name || '',
    telegram: '', address: '', notes: '', discount: 0
  });

  useEffect(() => {
    if (presetCompany?.id) {
      setSelectedCompany({ id: presetCompany.id, name: presetCompany.name });
      setUser(prev => ({ ...prev, companyId: presetCompany.id, companyName: presetCompany.name }));
    }
  }, [presetCompany]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^+\d]/g, '');
    if (!value.startsWith('+')) value = '+38' + value;
    const formattedValue = value
      .replace(/^(\+\d{2})/, '$1 ')
      .replace(/(\d{3})(\d)/, '$1 $2')
      .replace(/(\d{3}) (\d{3})(\d)/, '$1 $2-$3')
      .replace(/-(\d{2})(\d{1,2})/, '-$1-$2');
    setUser(prev => ({ ...prev, phoneNumber: formattedValue.trim() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  /* Компанія СТВОРЕНА через AddCompanyModal */
  const handleCompanyAdded = (company) => {
    setSelectedCompany({ id: company.id, name: company.companyName });
    setUser(prev => ({ ...prev, companyId: company.id, companyName: company.companyName }));
  };

  /* Компанія ВИБРАНА через SelectCompanyModal */
  const handleCompanySelected = (company) => {
    setSelectedCompany({ id: company.id, name: company.companyName });
    setUser(prev => ({ ...prev, companyId: company.id, companyName: company.companyName }));
    setShowSelectCompany(false);
  };

  const clearCompany = () => {
    setSelectedCompany(null);
    setUser(prev => ({ ...prev, companyId: '', companyName: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!thisOrder || !thisOrder.id) {
      axios.post('/orders/createUserAndOrder', user)
        .then(response => {
          setLoading(false);
          onUserAdded && onUserAdded(response.data);
          navigate(`/Orders/${response.data.id}`);
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response?.status === 403) navigate('/login');
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
        });
    } else {
      axios.post('/orders/createUserAndUpdateOrder', { user, orderId: thisOrder.id })
        .then(response => {
          setLoading(false);
          setThisOrder && setThisOrder(response.data);
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response?.status === 403) navigate('/login');
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
        });
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <>
      {/* ── Основна модалка ── */}
      <div className="auw-overlay" onClick={onHide}>
        <div className="auw-panel" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>

            {/* Header */}
            <header className="auw-header">
              <span className="auw-header-title">Створити клієнта</span>
              <button type="button" className="auw-close" onClick={onHide}>✕</button>
            </header>

            {/* Body — two columns */}
            <div className="auw-body">

              {/* Left section — Основна інформація */}
              <div className="auw-section">
                <div className="auw-section-title">Основна інформація</div>

                <div className="auw-field-row">
                  <span className="auw-field-label">Ім'я</span>
                  <input className="auw-field-input" type="text" name="firstName" value={user.firstName} onChange={handleChange} placeholder="—" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">По-батькові</span>
                  <input className="auw-field-input" type="text" name="lastName" value={user.lastName} onChange={handleChange} placeholder="—" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">Прізвище</span>
                  <input className="auw-field-input" type="text" name="familyName" value={user.familyName} onChange={handleChange} placeholder="—" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">Знижка (%)</span>
                  <input className="auw-field-input" type="number" name="discount" min="0" max="50" step="1" value={user.discount} onChange={handleChange} placeholder="0" />
                </div>

                {/* Notes — full width in left column */}
                <div className="auw-notes-row">
                  <span className="auw-field-label">Нотатки</span>
                  <textarea
                    className="auw-notes-textarea"
                    name="notes"
                    value={user.notes}
                    onChange={handleChange}
                    placeholder="Додаткова інформація про клієнта"
                  />
                </div>
              </div>

              {/* Right section — Контакти */}
              <div className="auw-section">
                <div className="auw-section-title">Контакти</div>

                <div className="auw-field-row">
                  <span className="auw-field-label">Телефон</span>
                  <input className="auw-field-input" type="tel" name="phoneNumber" value={user.phoneNumber} onChange={handlePhoneChange} placeholder="+38 XXX XXX-XX-XX" maxLength="17" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">Адреса</span>
                  <input className="auw-field-input" type="text" name="address" value={user.address || ''} onChange={handleChange} placeholder="—" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">E-mail</span>
                  <input className="auw-field-input" type="email" name="email" value={user.email} onChange={handleChange} placeholder="—" />
                </div>
                <div className="auw-field-row">
                  <span className="auw-field-label">Telegram</span>
                  <input className="auw-field-input" type="text" name="telegram" value={user.telegram || ''} onChange={handleChange} placeholder="@username" />
                </div>

                {/* Company — below Telegram */}
                <div className="auw-company-area">
                  {selectedCompany ? (
                    <div className="auw-company-selected">
                      <span className="auw-company-selected-name">{selectedCompany.name}</span>
                      <button type="button" className="auw-company-clear" onClick={clearCompany}>✕</button>
                    </div>
                  ) : (
                    <div className="auw-company-btns">
                      <button
                        type="button"
                        className="auw-rect-btn"
                        onClick={(e) => { e.preventDefault(); setShowAddCompany(true); }}
                      >
                        <span className="auw-rect-btn-text">Додати компанію</span>
                      </button>
                      <button
                        type="button"
                        className="auw-rect-btn"
                        onClick={(e) => { e.preventDefault(); setShowSelectCompany(true); }}
                      >
                        <span className="auw-rect-btn-text">Вибрати компанію</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="auw-error" onClick={() => setError(null)}>{error}</div>
            )}

            {/* Submit */}
            <div className="auw-submit-row">
              <button
                type="submit"
                className="auw-rect-btn auw-rect-btn--green"
                disabled={loading}
                style={{ width: '25vw' }}
              >
                <span className="auw-rect-btn-text">{loading ? 'Зберігаємо...' : 'Додати клієнта'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* ── Дочірні модалки — ПОЗА auw-overlay, щоб не закривати основну ── */}
      {showAddCompany && (
        <AddCompanyModal
          user={userr}
          setShowAddCompany={setShowAddCompany}
          showAddCompany={showAddCompany}
          onCompanyAdded={handleCompanyAdded}
        />
      )}

      {showSelectCompany && (
        <SelectCompanyModal
          onSelect={handleCompanySelected}
          onClose={() => setShowSelectCompany(false)}
        />
      )}
    </>,
    document.body
  );
}

AddUserWindow.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onUserAdded: PropTypes.func,
  addOrdOrOnlyClient: PropTypes.any,
  thisOrder: PropTypes.any,
  setThisOrder: PropTypes.func
};

export default AddUserWindow;
