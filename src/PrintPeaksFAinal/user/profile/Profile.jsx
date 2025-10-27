import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../../actions/authActions';
import {Link, useParams} from 'react-router-dom';
import axios from '../../../api/axiosInstance';
import ContrAgentsInUserProfile from '../profile/ContrAgentsInUserProfile';
import {buttonStyles, containerStyles, formStyles, avatarStyles, tabStyles} from './styles';
import TelegramAvatar from "../../Messages/TelegramAvatar";
import PaysInOrderRestoredForAdmin from "../../userInNewUiArtem/pays/PaysInOrderRestoredForAdmin";
import UserPageDetails from "../UserPageDetails";
import UserPageDetailsSelf from "./UserPageDetailsSelf";

function ClientUserProfile() {
  const dispatch = useDispatch();
  const thisUser = useSelector(state => state.auth.user);
  const {id} = useParams();
  const [activeTab, setActiveTab] = useState('profile');
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
    <div style={{...containerStyles.profileContainer, margin: '0', padding: '0'}}>
      {/*<h2 style={containerStyles.header}>Профіль користувача ({thisUser.id})</h2>*/}
      <div style={{...containerStyles.tabsContainer, margin: '0'}}>
        <button
          style={{...tabStyles.tabButton, ...(activeTab === 'profile' ? tabStyles.activeTab : {})}}
          onClick={() => setActiveTab('profile')}
        >Основна інформація</button>
        <button
          style={{...tabStyles.tabButton, ...(activeTab === 'counterparties' ? tabStyles.activeTab : {})}}
          onClick={() => setActiveTab('counterparties')}
        >Контрагенти</button>
        <button
          style={{...tabStyles.tabButton, ...(activeTab === 'counterpartiesAdmin' ? tabStyles.activeTab : {})}}
          onClick={() => setActiveTab('counterpartiesAdmin')}
        >Контрагенти (спільні)</button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <UserPageDetailsSelf thisUser={thisUser}/>
        </div>
      )}

      {activeTab === 'counterparties' && (
        <div style={containerStyles.contentContainer}>
          <ContrAgentsInUserProfile user={thisUser}/>
        </div>
      )}
      {activeTab === 'counterpartiesAdmin' && (
        <div style={containerStyles.contentContainer}>
          <PaysInOrderRestoredForAdmin user={thisUser}/>
        </div>
      )}
      {activeTab === 'cashierAdmin' && (
        <div style={containerStyles.contentContainer}>
          <PaysInOrderRestoredForAdmin user={thisUser}/>
        </div>
      )}
    </div>
  );
}

export default ClientUserProfile;
