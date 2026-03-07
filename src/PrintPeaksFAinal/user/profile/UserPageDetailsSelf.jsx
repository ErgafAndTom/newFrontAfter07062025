import React, {useEffect, useRef, useState} from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import TelegramAvatar from "../../Messages/TelegramAvatar";
import './ProfileNew.css';

const FieldEdit = ({ label, field, value, userId, type = "text", setUser }) => {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const disabled = field === "username" || field === "password" || field === "Company";
  const changed = String(val) !== String(value ?? "");

  useEffect(() => { setVal(value ?? ""); }, [value]);

  const save = async () => {
    if (disabled || saving || !changed) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await axios.patch(`/api/users/${userId}/field`, { field, value: val });
      setUser(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data || "Помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="pp-field-row">
        <span className="pp-field-label">{label}</span>
        <input
          className={`pp-field-input${changed && !disabled ? ' pp-field-input--changed' : ''}${disabled ? ' pp-field-input--disabled' : ''}`}
          value={val}
          type={type}
          disabled={disabled || saving}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
        />
        <button
          className={`pp-field-save${changed && !disabled ? ' pp-field-save--visible' : ''}`}
          onClick={save}
          disabled={saving || !changed || disabled}
          aria-label="Зберегти"
        >
          {saving ? "…" : "✓"}
        </button>
      </div>
      {err && <div className="pp-field-err">{typeof err === 'object' ? JSON.stringify(err) : err}</div>}
    </>
  );
};

function AttachCompanyModal({ userId, onClose, onAttached }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachingId, setAttachingId] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const search = async (term) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/companies/search`, {
        search: term ?? q,
        limit: 50,
      });
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } finally {
      setLoading(false);
    }
  };

  // debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 300);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  // focus + esc + lock scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const attach = async (companyId) => {
    setAttachingId(companyId);
    try {
      await axios.post(`/api/users/${userId}/attach-company`, { companyId });
      onAttached?.();
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="modalOverlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          width: "200vw",
          height: "200vh",
          left: "-31.5vw",
          top: "-2vh",
          backgroundColor: "rgba(15,15,15,0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 99,
          transition: "opacity 200ms ease",
        }}
      />
      {/* Container */}
      <div
        className="modalContainer animate-slide-up"
        style={{ position: "fixed", bottom: "15%", height:"35vw", left: "35%", borderRadius: 12, overflow: "hidden", zIndex: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0rem 0rem",
            // background: "#f1eee7",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/*<div*/}
          {/*  style={{*/}
          {/*    fontWeight: 200,*/}
          {/*    fontSize: "1.5rem",*/}
          {/*    color: "#5f5e59",*/}
          {/*    display: "flex",*/}
          {/*    alignItems: "center",*/}
          {/*    justifyContent: "center",*/}
          {/*    width: "100%",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Додати до компанії*/}
          {/*</div>*/}
        </div>

        {/* Body */}
        <div className="noScrollbar" style={{ background: "#f1eee7" }}>
          <div style={{ padding: "0rem 1rem", opacity:"0.7",  background:"#f1eee7"}}>
            <input
              ref={inputRef}
              className="form-control"
              placeholder="ПОШУК: НАЗВА/ТЕЛ/ЄДРПОУ/E-MAIL"
              style={{fontSize:"1.5vh"}}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "0vh" }}>
              <div className="spinner-border text-dark" role="status" />
            </div>
          ) : (
            <div style={{ padding: "0rem 0.7rem" }}>
              <div className="list-group noScrollbar" style={{ height: "65vh", overflowY: "auto" }}>
                {rows.length === 0 && <div className="d-flex justify-content-center align-items-center list-group-item">Компанію не знайдено</div>}
                {rows.map((c) => (
                  <div key={c.id} className="list-group-item d-flex align-items-center" style={{ gap: "0.6rem" }}>
                    {/*<img*/}
                    {/*  src={c.photoLink || "/noimg.png"}*/}
                    {/*  alt=""*/}
                    {/*  style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }}*/}
                    {/*/>*/}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 400, textTransform:"uppercase", color: '#646462' }}>{c.companyName}</div>
                      <div style={{ fontWeight: 200, fontSize: "0.7vw", opacity: 0.6, marginTop:"0.5vh" }}>
                        ЄДРПОУ: {c.edrpou || "···"}    ·    Тел.: {c.phoneNumber|| "···"}
                        {/*· id: {c.id}*/}
                      </div>
                      <div style={{ fontWeight: 200, fontSize: "0.7vw", opacity: 0.6 }}>
                        Адреса: {c.address || "···"}
                      </div>
                    </div>
                    <button
                      className="adminButtonAdd"
                      style={{fontSize:"2vh", color:"#f2f0e7", minWidth:"2vw",  padding:"0", borderRadius:"6px"}}
                      disabled={attachingId === c.id}
                      onClick={() => attach(c.id)}
                    >
                      {attachingId === c.id ? "✈" : "🞤"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </>
  );
}

export default function UserPageDetailsSelf({thisUser = null}) {
  // const { id } = useParams(); // /Users/:id
  const [id, setId] = useState(thisUser.id);
  const [user, setUser] = useState(thisUser);
  const [loading, setLoading] = useState(true);
  const [showAttach, setShowAttach] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users/${id}`);
      setUser(data);
    } finally { setLoading(false); }
  };

  const triggerNewOrder = (userId) => {
    // Створюємо новий запит для створення замовлення
    let toSend = {
      userId: userId
    }
    axios.post(`/orders/createForThisUser`, toSend)
      .then(response => {
        // Сповіщаємо всіх про створення замовлення
        // const event = new CustomEvent('orderCreated', { detail: response.data });
        // event.log = 'orderCreated';
        // window.orderEvents.dispatchEvent(event);

        window.location.href = `/Orders/${response.data.id}`;
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [id]);

  const detach = async () => {
    await axios.post(`/api/users/${id}/detach-company`);
    await load();
  };

  if (loading) return (
    <div className="pp-loading">Завантаження...</div>
  );
  if (!user) return <div className="pp-loading">Користувача не знайдено</div>;

  const fullName = [user.firstName, user.lastName, user.familyName].filter(Boolean).join(" ");
  const discountNum = parseInt(String(user.discount ?? "0").replace(/\D/g, ""), 10) || 0;

  return (
    <div>
      {/* Header */}
      <div className="pp-profile-header">
        <TelegramAvatar link={user.telegram || ""} size={48} square={true} />
        <div className="pp-profile-name-wrap">
          <span className="pp-profile-name">
            {fullName || user.username || `User #${user.id}`}
            <span className="pp-profile-id">#{user.id}</span>
          </span>
        </div>
        <button className="pp-create-order-btn" onClick={() => triggerNewOrder(user.id)}>
          <span className="pp-create-order-btn-text">Створити замовлення</span>
        </button>
      </div>

      <hr className="pp-divider" />

      {/* Fields grid — 2 columns */}
      <div className="pp-fields-grid">

        {/* Left column */}
        <div className="pp-fields-col">
          <div className="pp-col-title">Основна інформація</div>
          <FieldEdit label="Логін"        field="username"   value={user.username}   userId={user.id} setUser={setUser} />
          <FieldEdit label="Пароль"       field="password"   value={user.password}   userId={user.id} setUser={setUser} />
          <FieldEdit label="Ім’я"         field="firstName"  value={user.firstName}  userId={user.id} setUser={setUser} />
          <FieldEdit label="По-батькові"  field="lastName"   value={user.lastName}   userId={user.id} setUser={setUser} />
          <FieldEdit label="Прізвище"     field="familyName" value={user.familyName} userId={user.id} setUser={setUser} />
          <FieldEdit label="Тел."         field="phoneNumber" value={user.phoneNumber} userId={user.id} setUser={setUser} />
          <FieldEdit label="E-mail"       field="email"      value={user.email}      userId={user.id} type="email" setUser={setUser} />
          <FieldEdit label="Адреса"       field="address"    value={user.address}    userId={user.id} setUser={setUser} />
          <FieldEdit label="Фото"         field="photoLink"  value={user.photoLink}  userId={user.id} setUser={setUser} />
        </div>

        {/* Right column */}
        <div className="pp-fields-col">
          <div className="pp-col-title">Контакти та доступ</div>
          <FieldEdit label="Telegram"       field="telegram"        value={user.telegram}       userId={user.id} setUser={setUser} />
          <FieldEdit label="Viber"          field="viber"           value={user.viber}          userId={user.id} setUser={setUser} />
          <FieldEdit label="WhatsApp"       field="whatsapp"        value={user.whatsapp}       userId={user.id} setUser={setUser} />
          <FieldEdit label="Signal"         field="signal"          value={user.signal}         userId={user.id} setUser={setUser} />
          <FieldEdit label="Знижка (%)"     field="discount"        value={discountNum}         userId={user.id} type="number" setUser={setUser} />
          <FieldEdit label="Доступ(Права)"  field="role"            value={user.role}           userId={user.id} setUser={setUser} />
          <FieldEdit label="Касир(пін)"     field="role2"           value={user.role2}          userId={user.id} setUser={setUser} />
          <FieldEdit label="loginCashier"   field="loginCashier"    value={user.loginCashier}   userId={user.id} setUser={setUser} />
          <FieldEdit label="passwordCashier" field="passwordCashier" value={user.passwordCashier} userId={user.id} setUser={setUser} />
        </div>

      </div>

      <hr className="pp-divider" />

      {/* Company footer */}
      <div className="pp-company-footer">
        {user.Company ? (
          <>
            <Link to={`/Companys/${user.Company.id}`} className="pp-company-link">
              <div className="pp-company-info">
                <span className="pp-company-name">{user.Company.companyName}</span>
                {user.Company.edrpou    && <span className="pp-company-detail">ЄДРПОУ: {user.Company.edrpou}</span>}
                {user.Company.phoneNumber && <span className="pp-company-detail">Тел.: {user.Company.phoneNumber}</span>}
              </div>
            </Link>
            <div className="pp-company-actions">
              <button className="pp-company-btn" onClick={() => setShowAttach(true)}>
                <span className="pp-company-btn-text">Змінити компанію</span>
              </button>
              <button className="pp-company-btn pp-company-btn--red" onClick={detach}>
                <span className="pp-company-btn-text">Від’єднати</span>
              </button>
            </div>
          </>
        ) : (
          <div className="pp-company-actions">
            <button className="pp-company-btn" onClick={() => setShowAttach(true)}>
              <span className="pp-company-btn-text">Прикріпити до компанії</span>
            </button>
          </div>
        )}
      </div>

      {showAttach && (
        <AttachCompanyModal
          userId={user.id}
          onClose={() => setShowAttach(false)}
          onAttached={() => { setShowAttach(false); load(); }}
        />
      )}
    </div>
  );
}
