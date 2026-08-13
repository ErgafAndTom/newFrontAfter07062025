import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../../actions/authActions";
import {useNavigate} from "react-router-dom";
import "./Login.css";

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const error = useSelector((state) => state.auth.error);
    const loading = useSelector((state) => state.auth.loading);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login(credentials, navigate));
    };

    return (
        <div className="login__page">
            <form onSubmit={handleSubmit} className="login__card">
                <div style={{ padding: '2.5rem 2rem 3rem' }}>
                    <div className="login__fields">
                        <div className="input__container" data-label="ЛОГІН">
                            <div className="shadow__input"></div>
                            <div className="input__button__shadow">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9z"/>
                                </svg>
                            </div>
                            <input
                                className="input__search"
                                name="username"
                                type="text"
                                placeholder="Логін"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input__container" data-label="ПАРОЛЬ">
                            <div className="shadow__input"></div>
                            <div className="input__button__shadow">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1s3.1 1.4 3.1 3.1v2z"/>
                                </svg>
                            </div>
                            <input
                                className="input__search"
                                name="password"
                                type="password"
                                placeholder="Пароль"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--adminred, #ee3c23)', fontSize: '0.8rem', margin: '0 0 0.8rem' }}>
                            {error}
                        </p>
                    )}
                </div>

                <div className="login__submit__wrap">
                    <button type="submit" className="login__submit" disabled={loading}>
                        <span className="login__submit__text">
                            {loading ? 'Вхід...' : 'Увійти'}
                        </span>
                        <span className="login__submit__icon">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 11h12.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H4z"/>
                            </svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};
