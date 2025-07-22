import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {logout} from '../../../actions/authActions';
import {Link, useParams} from 'react-router-dom';
import axios from '../../../api/axiosInstance';
import ContrAgentsInUserProfile from '../profile/ContrAgentsInUserProfile';
import {buttonStyles, containerStyles, formStyles, avatarStyles, tabStyles} from '../profile/styles';

function ClientUserProfile() {
  const dispatch = useDispatch();
  const {id} = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [thisUser, setThisUser] = useState({id});
  const [isLoad, setIsLoad] = useState(false);
  const [isError, setIsError] = useState(null);

  // Editable fields
  const [username, setUsername] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signal, setSignal] = useState('');
  const [viber, setViber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [discount, setDiscount] = useState('');
  const [photoLink, setPhotoLink] = useState('');

  useEffect(() => {
    setIsLoad(true);
    axios.get(`/user/getOneUser/${id}`)
      .then(response => {
        setThisUser(response.data);
        setIsError(null);
      })
      .catch(err => setIsError(err.message))
      .finally(() => setIsLoad(false));
  }, [id]);

  const initEditFields = () => {
    setUsername(thisUser.username || '');
    setPaymentMethod(thisUser.paymentMethod || '');
    setTelegram(thisUser.telegram || '');
    setEmail(thisUser.email || '');
    setPhoneNumber(thisUser.phoneNumber || '');
    setSignal(thisUser.signal || '');
    setViber(thisUser.viber || '');
    setWhatsapp(thisUser.whatsapp || '');
    setDiscount(thisUser.discount || '');
    setPhotoLink(thisUser.photoLink || '');
  };

  const handleEditClick = () => {
    initEditFields();
    setEditMode(true);
  };

  const handleSave = () => {
    setIsLoad(true);
    axios.put(`/user/update/${id}`, {
      username,
      paymentMethod,
      telegram,
      email,
      phoneNumber,
      signal,
      viber,
      whatsapp,
      discount,
      photoLink
    })
      .then(response => {
        setThisUser(response.data);
        setEditMode(false);
        setIsError(null);
      })
      .catch(err => setIsError(err.message))
      .finally(() => setIsLoad(false));
  };

  const handleCancel = () => {
    setEditMode(false);
    setIsError(null);
  };

  const handleLogout = () => dispatch(logout());

  if (isLoad) return <li>Завантаження...</li>;
  if (isError) return <li>Помилка: {isError}</li>;
  if (!thisUser.role) return <li>Користувач не знайдений</li>;

  return (
    <div style={containerStyles.profileContainer}>
      <h2 style={containerStyles.header}>Профіль користувача ({thisUser.id})</h2>
      <div style={containerStyles.tabsContainer}>
        <button
          style={{...tabStyles.tabButton, ...(activeTab === 'profile' ? tabStyles.activeTab : {})}}
          onClick={() => setActiveTab('profile')}
        >Основна інформація</button>
        <button
          style={{...tabStyles.tabButton, ...(activeTab === 'counterparties' ? tabStyles.activeTab : {})}}
          onClick={() => setActiveTab('counterparties')}
        >Контрагенти</button>
      </div>

      {activeTab === 'profile' && (
        <div style={containerStyles.contentContainer}>
          <img
            src={thisUser.photoLink || '/default-avatar.png'}
            alt='Аватар'
            style={avatarStyles.profileAvatar}
          />

          {editMode ? (
            <>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Ім'я користувача:</label>
                <input
                  style={formStyles.profileInput}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Спосіб оплати:</label>
                <select
                  style={formStyles.profileSelect}
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value=''>Виберіть</option>
                  <option value='card'>Банківська карта</option>
                  <option value='paypal'>PayPal</option>
                </select>
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Telegram:</label>
                <input
                  style={formStyles.profileInput}
                  value={telegram}
                  onChange={e => setTelegram(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Email:</label>
                <input
                  style={formStyles.profileInput}
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Phone:</label>
                <input
                  style={formStyles.profileInput}
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Signal:</label>
                <input
                  style={formStyles.profileInput}
                  value={signal}
                  onChange={e => setSignal(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Viber:</label>
                <input
                  style={formStyles.profileInput}
                  value={viber}
                  onChange={e => setViber(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>WhatsApp:</label>
                <input
                  style={formStyles.profileInput}
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Discount (%):</label>
                <input
                  style={formStyles.profileInput}
                  type='number'
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>
              <div style={formStyles.group}>
                <label style={formStyles.label}>Photo URL:</label>
                <input
                  style={formStyles.profileInput}
                  value={photoLink}
                  onChange={e => setPhotoLink(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                style={{...buttonStyles.base, ...buttonStyles.success, margin: '5px'}}
              >Зберегти</button>
              <button
                onClick={handleCancel}
                style={{...buttonStyles.base, ...buttonStyles.secondary, margin: '5px'}}
              >Скасувати</button>
            </>
          ) : (
            <>
              <li>Ім'я користувача: {thisUser.username}</li>
              <li>Роль: {thisUser.role}</li>
              <li>Спосіб оплати: {thisUser.paymentMethod || 'Не вказано'}</li>
              <li>Telegram: {thisUser.telegram || 'Не вказано'}</li>
              <li>Email: {thisUser.email || 'Не вказано'}</li>
              <li>Phone: {thisUser.phoneNumber || 'Не вказано'}</li>
              <li>Signal: {thisUser.signal || 'Не вказано'}</li>
              <li>Viber: {thisUser.viber || 'Не вказано'}</li>
              <li>WhatsApp: {thisUser.whatsapp || 'Не вказано'}</li>
              <li>Discount: {thisUser.discount || 'Не вказано'}</li>
              <li>Photo URL: {thisUser.photoLink || 'Не вказано'}</li>
              <button
                onClick={handleEditClick}
                style={{...buttonStyles.base, ...buttonStyles.primary, margin: '5px'}}
              >Редагувати</button>
            </>
          )}

          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px'}}>
            <Link to={`/client/${thisUser.id}/files`} style={{textDecoration: 'none'}}>
              <button style={{...buttonStyles.base, background: '#5d96ff', padding: '0.5vw', margin: '0.5vw'}}>
                Файли
              </button>
            </Link>
            <Link to={`/client/${thisUser.id}/orders`} style={{textDecoration: 'none'}}>
              <button style={{...buttonStyles.base, padding: '0.5vw', margin: '0.5vw'}}>
                Замовлення
              </button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'counterparties' && (
        <div style={containerStyles.contentContainer}>
          <ContrAgentsInUserProfile user={thisUser}/>
        </div>
      )}
    </div>
  );
}

export default ClientUserProfile;
