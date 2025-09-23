import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import PerepletMet from "../poslugi/PerepletMet";

const ShiftControlModal = () => {
  const [data, setData] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [cashier, setCashier] = useState(null);
  const [shift, setShift] = useState(null);
  const [error, setError] = useState(null);

  const [loginForm, setLoginForm] = useState({ login: "aiatomas03", password: "Artem0123" });
  const [pinForm, setPinForm] = useState({ pin_code: "" });

  function handleOpen() {
    setOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
    fetchShift(); // при открытии сразу тянем статус
  }
  function handleClose() {
    setIsAnimating(false);
    setTimeout(() => setOpen(false), 300);
  }

  async function login() {
    try {
      setLoading(true);
      const resp = await axios.post("/api/checkbox/auth/login", {
        ...loginForm,
        userId: currentUser?.id,
      });
      console.log(resp);
      setCashier(resp.data.cashier);
      setError(null);
      await fetchShift();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loginPin() {
    try {
      setLoading(true);
      const resp = await axios.post("/api/checkbox/auth/login-pin", {
        ...pinForm,
        userId: currentUser?.id,
      });
      setCashier(resp.data.cashier);
      setError(null);
      await fetchShift();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openShift() {
    try {
      setLoading(true);
      const resp = await axios.post("/api/checkbox/shift/open", {
        userId: currentUser?.id,
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
      const resp = await axios.post("/api/checkbox/shift/close", {
        userId: currentUser?.id,
      });
      setShift(resp.data.shift);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setCashier(null);
    setShift(null);
  }

  async function fetchShift() {
    try {
      setLoading(true);
      const resp = await axios.get("/api/checkbox/shift/current");
      const resp1 = await axios.get("/api/checkbox/cash-registers");
      console.log(resp.data);
      setData(resp.data)
      if (resp.data.success) {
        setShift(resp.data.shift);
      }
    } catch (e) {
      console.log(e);
      setError(e.response?.data?.error?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={handleOpen}>Керування зміною{shift}</button>
      {error &&
        <div>{error}</div>
      }

      {open && (
        <div>
          {/* overlay */}
          <div
            onClick={handleClose}
            style={{
              width: "100vw",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              background: "rgba(0,0,0,0.2)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity .3s ease-in-out",
              zIndex: 100,
            }}
          />

          {/* modal */}
          <div
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: isAnimating
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.8)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity .3s, transform .3s",
              backgroundColor: "#FBFAF6",
              width: "95vw",
              height: "95vh",
              borderRadius: "1vw",
              zIndex: 101,
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
            }}
          >
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Керування зміною</h3>
              <button onClick={handleClose}>✕</button>
            </div>

            {/* body */}
            <div style={{ flex: 1, overflow: "auto" }}>
              {data &&
                <div>data:{data.toString()}11111</div>
              }
              {error && <div style={{ color: "red" }}>{error}</div>}

              {!cashier ? (
                <div>
                  <h4>Вхід касира</h4>
                  <div>
                    <input
                      placeholder="Логін"
                      value={loginForm.login}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, login: e.target.value })
                      }
                    />
                    <input
                      placeholder="Пароль"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                    />
                    <button disabled={loading} onClick={login}>
                      Увійти (логін/пароль)
                    </button>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <input
                      placeholder="PIN код"
                      value={pinForm.pin_code}
                      onChange={(e) =>
                        setPinForm({ ...pinForm, pin_code: e.target.value })
                      }
                    />
                    <button disabled={loading} onClick={loginPin}>
                      Увійти (PIN)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4>Касир: {cashier?.full_name || cashier?.login}</h4>
                  <p>Статус зміни: {shift ? shift.status : "не відкрита"}</p>

                  {!shift || shift.status !== "OPENED" ? (
                    <button disabled={loading} onClick={openShift}>
                      Відкрити зміну
                    </button>
                  ) : (
                    <button disabled={loading} onClick={closeShift}>
                      Закрити зміну
                    </button>
                  )}

                  <button onClick={logout} style={{ marginTop: "1rem" }}>
                    Вийти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftControlModal;
