import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsPerson, BsEnvelope, BsTelephone, BsTelegram, BsGeoAlt, BsPercent } from "react-icons/bs";
import DropDownList from "../tools/DropDownList";
import AddCompanyModal from "../company/AddCompanyModal";
import "./AddUserWindow.css";

function AddUserWindow({ show, onHide, onUserAdded, addOrdOrOnlyClient, thisOrder, setThisOrder, presetCompany }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const userr = useSelector(state => state.auth.user);

  const [user, setUser] = useState({
    firstName: '', lastName: '', familyName: '', phoneNumber: '', email: '',
    companyId: presetCompany?.id || '', companyName: presetCompany?.name || '',
    telegram: '', address: '', notes: '', discount: 0
  });

  useEffect(() => {
    if (presetCompany?.id) {
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
    <div className="sc-wrap">
      <div className="bw-overlay" onClick={onHide} />
      <div
        className="sc-modal"
        style={{ width: '50vw', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="sc-body" style={{ flexDirection: 'column', padding: '1.5vh 1.5vw', gap: '1rem' }}>

            {/* Два стовпці полів */}
            <div className="auw-grid">
              {/* Ліва колонка */}
              <div className="auw-col">
                <div className="auw-field">
                  <BsPerson />
                  <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    placeholder="Ім'я"
                  />
                </div>
                <div className="auw-field">
                  <BsPerson />
                  <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    placeholder="По-батькові"
                  />
                </div>
                <div className="auw-field">
                  <BsPerson />
                  <input
                    type="text"
                    name="familyName"
                    value={user.familyName}
                    onChange={handleChange}
                    placeholder="Прізвище"
                  />
                </div>
                <div className="auw-field">
                  <BsPercent />
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="50"
                    step="1"
                    value={user.discount}
                    onChange={handleChange}
                    placeholder="Знижка (%)"
                  />
                </div>
              </div>

              {/* Права колонка */}
              <div className="auw-col">
                <div className="auw-field">
                  <BsTelephone />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+38 XXX XXX-XX-XX"
                    maxLength="17"
                  />
                </div>
                <div className="auw-field">
                  <BsGeoAlt />
                  <input
                    type="text"
                    name="address"
                    value={user.address || ''}
                    onChange={handleChange}
                    placeholder="Введіть адресу"
                  />
                </div>
                <div className="auw-field">
                  <BsEnvelope />
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="E-mail"
                  />
                </div>
                <div className="auw-field">
                  <BsTelegram />
                  <input
                    type="text"
                    name="telegram"
                    value={user.telegram || ''}
                    onChange={handleChange}
                    placeholder="@telegram"
                  />
                </div>
              </div>
            </div>

            {/* Місце роботи */}
            <div className="auw-company-section">
              <div className="auw-section-title">Місце роботи</div>
              {presetCompany?.id ? (
                <span className="auw-preset-badge">
                  Компанія: {presetCompany.name}
                </span>
              ) : (
                <>
                  <DropDownList
                    formData={user}
                    setFormData={setUser}
                    user={user}
                    data={data}
                    setData={setData}
                  />
                  <div className="auw-company-row">
                    <span>Якщо у списку немає компанії, то можна:</span>
                    <button
                      type="button"
                      className="adminButtonAdd"
                      onClick={(e) => { e.preventDefault(); setShowAddCompany(true); }}
                    >
                      <span>Додати компанію</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Додаткова інформація */}
            <div className="auw-textarea-wrap">
              <textarea
                name="notes"
                value={user.notes}
                onChange={handleChange}
                placeholder="Додаткова інформація про клієнта"
              />
            </div>

            {/* Кнопка */}
            <div className="auw-submit-row">
              <button
                type="submit"
                className="adminButtonAdd"
                disabled={loading}
                style={{ width: '25vw' }}
              >
                <span>{loading ? 'Зберігаємо...' : 'Додати клієнта'}</span>
              </button>
            </div>
          </div>

          {/* Помилка */}
          {error && (
            <div className="auw-error" onClick={() => setError(null)}>
              {error}
            </div>
          )}
        </form>
      </div>

      {showAddCompany && (
        <AddCompanyModal
          user={userr}
          setShowAddCompany={setShowAddCompany}
          showAddCompany={showAddCompany}
        />
      )}
    </div>,
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
