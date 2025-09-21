import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance'; // твой axios с baseURL /api

const ShiftControl = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [cashier, setCashier] = useState(null);
  const [shift, setShift] = useState(null);
  const [error, setError] = useState(null);

  // формы для логина
  const [loginForm, setLoginForm] = useState({ login: '', password: '', license_key: '' });
  const [pinForm, setPinForm] = useState({ pin_code: '', license_key: '' });

  async function login() {
    try {
      setLoading(true);
      const resp = await axios.post('/checkbox/auth/login', loginForm);
      setToken(resp.data.token);
      setCashier(resp.data.cashier);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loginPin() {
    try {
      setLoading(true);
      const resp = await axios.post('/checkbox/auth/login-pin', pinForm);
      setToken(resp.data.token);
      setCashier(resp.data.cashier);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openShift() {
    try {
      setLoading(true);
      const resp = await axios.post('/checkbox/shift/open', {
        token,
        license_key: loginForm.license_key || pinForm.license_key,
      });
      setShift(resp.data.shift);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function closeShift() {
    try {
      setLoading(true);
      const resp = await axios.post('/checkbox/shift/close', {
        token,
        license_key: loginForm.license_key || pinForm.license_key,
      });
      setShift(resp.data.shift);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setCashier(null);
    setShift(null);
  }

  // === UI ===
  return (
    <div className="shift-control">
      {error && <div className="error">{error}</div>}

      {!token ? (
        <div className="login-panel">
          <h3>Вхід касира</h3>

          <div>
            <input
              placeholder="Логін"
              value={loginForm.login}
              onChange={e => setLoginForm({ ...loginForm, login: e.target.value })}
            />
            <input
              placeholder="Пароль"
              type="password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <input
              placeholder="Ліцензійний ключ"
              value={loginForm.license_key}
              onChange={e => {
                setLoginForm({ ...loginForm, license_key: e.target.value });
                setPinForm({ ...pinForm, license_key: e.target.value });
              }}
            />
            <button disabled={loading} onClick={login}>
              Увійти (логін/пароль)
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <input
              placeholder="PIN код"
              value={pinForm.pin_code}
              onChange={e => setPinForm({ ...pinForm, pin_code: e.target.value })}
            />
            <button disabled={loading} onClick={loginPin}>
              Увійти (PIN)
            </button>
          </div>
        </div>
      ) : (
        <div className="shift-panel">
          <h3>Касир: {cashier?.full_name || cashier?.login}</h3>
          <p>Статус зміни: {shift ? shift.status : 'не відкрита'}</p>

          {!shift || shift.status !== 'OPENED' ? (
            <button disabled={loading} onClick={openShift}>
              Відкрити зміну
            </button>
          ) : (
            <button disabled={loading} onClick={closeShift}>
              Закрити зміну
            </button>
          )}

          <button onClick={logout} style={{ marginTop: '1rem' }}>
            Вийти
          </button>
        </div>
      )}
    </div>
  );
};

export default ShiftControl;
