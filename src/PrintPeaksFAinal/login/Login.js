import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../../actions/authActions";
import {useNavigate} from "react-router-dom";

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
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
        }}>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                background: 'var(--adminfonelement, #f2f0e9)',
                width: '340px',
            }}>
                <div style={{ padding: '2rem 2rem 0.5rem', borderBottom: '1px solid var(--adminorange, #f5a623)' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--admingrey, #666)', marginBottom: '1.5rem' }}>
                        PrintPeaks ERP
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <input
                            name="username"
                            type="text"
                            placeholder="Логін"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--adminblue, #3c60a6)',
                                outline: 'none',
                                padding: '0.4rem 0',
                                fontSize: '0.9rem',
                                color: 'var(--admingrey, #666)',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            name="password"
                            type="password"
                            placeholder="Пароль"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--adminblue, #3c60a6)',
                                outline: 'none',
                                padding: '0.4rem 0',
                                fontSize: '0.9rem',
                                color: 'var(--admingrey, #666)',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--adminred, #ee3c23)', fontSize: '0.8rem', margin: '0 0 0.8rem' }}>
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: 'var(--admingreen, #0e935b)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        height: '3rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Вхід...' : 'Увійти'}
                </button>
            </form>
        </div>
    );
};
