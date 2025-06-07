import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, logout, updateUser } from '../../../actions/authActions';
import {Link} from "react-router-dom";
import Counterparty from '../../../components/usersettings/Counterparty';
import { buttonStyles, containerStyles, formStyles, avatarStyles, tabStyles } from './styles';
import ContrAgentsInUserProfile from "./ContrAgentsInUserProfile";
import PaysInOrderRestoredForAdmin from "../../userInNewUiArtem/pays/PaysInOrderRestoredForAdmin";

function Profile() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const error = useSelector((state) => state.auth.error);
    const loading = useSelector((state) => state.auth.loading);

    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
        } else {
            setUsername(user.username || '');
        }
    }, [dispatch, user]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSave = async () => {
        try {
            // await dispatch(updateUser({ username, password, paymentMethod }));
            setEditMode(false);
        } catch (err) {
            console.error('Ошибка при обновлении:', err);
        }
    };

    if (loading) return <li>Загрузка...</li>;
    if (error) return <li>Ошибка: {error}</li>;
    if (!user) return <li>Пользователь не найден</li>;

    return (
        <div style={containerStyles.profileContainer}>
            <h2 style={containerStyles.header}>Профіль користувача {user.username}</h2>

            <div style={containerStyles.tabsContainer}>
                <button 
                    style={{
                        ...tabStyles.tabButton,
                        ...(activeTab === 'profile' ? tabStyles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('profile')}
                >
                    Основна інформація
                </button>
                <button 
                    style={{
                        ...tabStyles.tabButton,
                        ...(activeTab === 'counterparties' ? tabStyles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('counterparties')}
                >
                    Мої контрагенти
                </button>
                {user.role === 'admin' && (
                    <button
                        style={{
                            ...tabStyles.tabButton,
                            ...(activeTab === 'admin' ? tabStyles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('admin')}
                    >
                        КонтрАгенти вибір з будь-яких існуючих (Для доков. Постачальник/Виконавець.)
                    </button>
                )}
            </div>

            {activeTab === 'profile' && (
                <div style={containerStyles.contentContainer}>
                    <img
                        src={user.photoLink || '/default-avatar.png'}
                        alt="Аватар"
                        style={avatarStyles.profileAvatar}
                    />

                    {editMode ? (
                        <>
                            {/*<div>*/}
                            {/*    <label>Имя пользователя: </label>*/}
                            {/*    <input value={username} onChange={(e) => setUsername(e.target.value)} />*/}
                            {/*</div>*/}
                            {/*<div>*/}
                            {/*    <label>Новый пароль: </label>*/}
                            {/*    <input*/}
                            {/*        type="password"*/}
                            {/*        value={password}*/}
                            {/*        onChange={(e) => setPassword(e.target.value)}*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div style={formStyles.group}>
                                <label style={formStyles.label}>Спосіб оплати: </label>
                                <select
                                    style={formStyles.profileSelect}
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="">Виберіть</option>
                                    <option value="card">Банківська карта</option>
                                    <option value="paywpal">PayPal</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleSave}
                                style={{...buttonStyles.base, ...buttonStyles.success, margin: '5px'}}
                            >
                                Зберегти
                            </button>
                            <button 
                                onClick={() => setEditMode(false)}
                                style={{...buttonStyles.base, ...buttonStyles.secondary, margin: '5px'}}
                            >
                                Скасувати
                            </button>
                        </>
                    ) : (
                        <>
                            <li>Ім'я користувача: {user.username}</li>
                            <li>Роль: {user.role}</li>
                            <li>Спосіб оплати: {user.paymentMethod || 'Не вказано'}</li>
                            {/*<button onClick={() => setEditMode(true)}>Редактировать профиль</button>*/}
                        </>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
                        <Link style={{textDecoration: 'none'}} to="/myFiles">
                            <button className="adminButtonAdd"
                                    style={{
                                        background: '#5d96ff',
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                            >
                                <i className="bi bi-folder me-2"></i>
                                Мої файли
                            </button>
                        </Link>
                        <Link style={{textDecoration: 'none'}} to="/myOrders">
                            <button className="adminButtonAdd"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                            >
                                <i className="bi bi-cart me-2"></i>
                                Мої замовлення
                            </button>
                        </Link>
                        {/*<Link style={{textDecoration: 'none'}} to="/myPayments">*/}
                        {/*    <button style={{...buttonStyles.paymentsButton}}>*/}
                        {/*        <i className="bi bi-credit-card me-2"></i>*/}
                        {/*        Мої способи оплати*/}
                        {/*    </button>*/}
                        {/*</Link>*/}
                        <button 
                            onClick={handleLogout}
                            className="adminButtonAdd"
                            style={{
                                background: '#ff5d5d',
                                padding: "0.5vw",
                                margin: "0.5vw",
                            }}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Вийти
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'counterparties' && (
                <div style={containerStyles.contentContainer}>
                    <ContrAgentsInUserProfile user={user}/>
                </div>
            )}
            {activeTab === 'admin' && (
                <div style={containerStyles.contentContainer}>
                    <PaysInOrderRestoredForAdmin user={user}/>
                </div>
            )}
        </div>
    );
}

export default Profile;
