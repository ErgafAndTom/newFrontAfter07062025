import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../../actions/authActions';
import {Link, useParams} from 'react-router-dom';
import axios from '../../../api/axiosInstance';
import ContrAgentsInUserProfile from '../profile/ContrAgentsInUserProfile';
import TelegramAvatar from "../../Messages/TelegramAvatar";
import './ProfileNew.css';
import PaysInOrderRestoredForAdmin from "../../userInNewUiArtem/pays/PaysInOrderRestoredForAdmin";
import UserPageDetails from "../UserPageDetails";
import UserPageDetailsSelf from "./UserPageDetailsSelf";
import Cash from "../../checkbox/CashCash/Cash";
import CodesOffline from "../../checkbox/codesOffline/CodesOffline";
import PrivatBankAccounts from "./PrivatBankAccounts";
import Graph2DForBD from "../../Graph2DForBD";
import Shifts from "../../checkbox/shifts/Shifts";
import DesignSettings from "./DesignSettings";
import NiimbotSettings from "./NiimbotSettings";
import FileSettings from "./FileSettings";
import "./NiimbotSettings.css";

function ClientUserProfile() {
  const dispatch = useDispatch();
  const thisUser = useSelector(state => state.auth.user);
  const {id} = useParams();
  const [activeTab, setActiveTab] = useState('design');
  const [editMode, setEditMode] = useState(false);
  // const [thisUser, setThisUser] = useState(user);
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

  // useEffect(() => {
  //   setIsLoad(true);
  //   axios.get(`/user/getOneUser/${thisUser.id}`)
  //     .then(response => {
  //       setThisUser(response.data);
  //       setIsError(null);
  //     })
  //     .catch(err => setIsError(err.message))
  //     .finally(() => setIsLoad(false));
  // }, [id]);

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

  // const handleSave = () => {
  //   setIsLoad(true);
  //   axios.put(`/user/update/${id}`, {
  //     username,
  //     paymentMethod,
  //     telegram,
  //     email,
  //     phoneNumber,
  //     signal,
  //     viber,
  //     whatsapp,
  //     discount,
  //     photoLink
  //   })
  //     .then(response => {
  //       setThisUser(response.data);
  //       setEditMode(false);
  //       setIsError(null);
  //     })
  //     .catch(err => setIsError(err.message))
  //     .finally(() => setIsLoad(false));
  // };

  const handleCancel = () => {
    setEditMode(false);
    setIsError(null);
  };

  const handleLogout = () => dispatch(logout());

  if (isLoad) return <div>Завантаження...</div>;
  if (isError) return <div>Помилка: {isError}</div>;
  // if (!user) return <div>Користувач не знайдений</div>;
  if (!thisUser) return <div>Користувач не знайдений</div>;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Tabs */}
      <div className="pp-tabs">
        <button className={`pp-tab-btn${activeTab === 'design'              ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('design')}>Дизайн</button>
        <button className={`pp-tab-btn${activeTab === 'niimbot'             ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('niimbot')}>Штрих-код</button>
        <button className={`pp-tab-btn${activeTab === 'profile'             ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('profile')}>Основна інформація</button>
        <button className={`pp-tab-btn${activeTab === 'counterparties'      ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('counterparties')}>Контрагенти</button>
        <button className={`pp-tab-btn${activeTab === 'counterpartiesAdmin' ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('counterpartiesAdmin')}>РЕКВІЗИТИ</button>
        <button className={`pp-tab-btn${activeTab === 'Cashs'               ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('Cashs')}>Касси(Checkbox)</button>
        <button className={`pp-tab-btn${activeTab === 'OfflineCodes'        ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('OfflineCodes')}>Офлайн фіск. коди(Checkbox)</button>
        {thisUser?.role === 'admin' && (
          <button className={`pp-tab-btn${activeTab === 'payments' ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('payments')}>Оплати</button>
        )}
        {thisUser?.role === 'admin' && (
          <button className={`pp-tab-btn${activeTab === 'база' ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('база')}>База</button>
        )}
        {thisUser?.role === 'admin' && (
          <button className={`pp-tab-btn${activeTab === 'зміни' ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('зміни')}>Зміни</button>
        )}
        {thisUser?.role === 'admin' && (
          <button className={`pp-tab-btn${activeTab === 'files' ? ' pp-tab-btn--active' : ''}`} onClick={() => setActiveTab('files')}>Файли</button>
        )}
      </div>

      <div className="pp-content">
        {activeTab === 'design'              && <DesignSettings/>}
        {activeTab === 'niimbot'             && <NiimbotSettings/>}
        {activeTab === 'profile'             && <UserPageDetailsSelf thisUser={thisUser}/>}
        {activeTab === 'counterparties'      && <ContrAgentsInUserProfile user={thisUser}/>}
        {activeTab === 'counterpartiesAdmin' && <div style={{padding:'1rem'}}><PaysInOrderRestoredForAdmin user={thisUser}/></div>}
        {activeTab === 'cashierAdmin'        && <div style={{padding:'1rem'}}><PaysInOrderRestoredForAdmin user={thisUser}/></div>}
        {activeTab === 'Cashs'               && <div style={{padding:'1rem'}}><Cash/></div>}
        {activeTab === 'OfflineCodes'        && <div style={{padding:'1rem'}}><CodesOffline/></div>}
        {activeTab === 'payments'            && <div style={{padding:'1rem'}}><PrivatBankAccounts/></div>}
        {activeTab === 'база'                && <Graph2DForBD/>}
        {activeTab === 'зміни'               && <div style={{padding:'1rem'}}><Shifts/></div>}
        {activeTab === 'files'               && <FileSettings/>}
      </div>
    </div>
  );
}

export default ClientUserProfile;
