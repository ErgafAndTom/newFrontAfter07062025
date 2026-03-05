import React, { useEffect, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import TelegramAvatar from "../Messages/TelegramAvatar";
import "./ClientProfileModal.css";

/* ── Модалка вибору компанії ── */
function AttachCompanyModal({ userId, onClose, onAttached }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachingId, setAttachingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      axios.post("/api/companies/search", { search: q, limit: 50 })
        .then(r => setRows(Array.isArray(r.data?.rows) ? r.data.rows : []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

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
    <div className="cpm-overlay" style={{ zIndex: 10600 }} onClick={onClose}>
        <div className="cpm-panel cpm-panel--fon" style={{ maxWidth: 480, height: '70vh' }} onClick={(e) => e.stopPropagation()}>

        <header className="cpm-header">
          <div className="cpm-header-info">
            <span className="cpm-fullname">Вибір компанії</span>
          </div>
          <button className="cpm-close" onClick={onClose}>✕</button>
        </header>

        <div className="cpm-attach-search">
          <input
            ref={inputRef}
            className="cpm-attach-input"
            placeholder="Пошук компанії..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="cpm-attach-list">
          {loading && <div className="cpm-attach-empty">Завантаження...</div>}
          {!loading && rows.length === 0 && <div className="cpm-attach-empty">Компанію не знайдено</div>}
          {!loading && rows.map((c) => (
            <div key={c.id} className="cpm-attach-row">
              <div className="cpm-attach-row-info">
                <div className="cpm-attach-row-name">{c.companyName}</div>
                {(c.edrpou || c.phoneNumber) && (
                  <div className="cpm-attach-row-sub">
                    {c.edrpou && <div>ЄДРПОУ: {c.edrpou}</div>}
                    {c.phoneNumber && <div>Тел.: {c.phoneNumber}</div>}
                    {(() => {
                      const d = parseInt(String(c.discount ?? '0').replace(/\D/g, ''), 10) || 0;
                      return d > 0 ? <div className="cpm-attach-row-discount">Знижка: {d}%</div> : null;
                    })()}
                  </div>
                )}
              </div>
              <button
                className="cpm-add-company-btn"
                disabled={attachingId === c.id}
                onClick={() => attach(c.id)}
              >
                <span className="cpm-add-company-btn-text">
                  {attachingId === c.id ? "..." : "Прикріпити"}
                </span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ── Одне поле з inline-редагуванням ── */
function FieldRow({ label, field, value, userId, type = "text", onSaved, disabled = false }) {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const changed = val !== (value ?? "");

  useEffect(() => { setVal(value ?? ""); }, [value]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const res = await axios.patch(`/api/users/${userId}/field`, { field, value: val });
      onSaved?.(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Помилка");
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") save(); };

  return (
    <div className="cpm-field-row">
      <span className="cpm-field-label">{label}</span>
      <input
        className={`cpm-field-input${changed ? " is-changed" : ""}${disabled ? " is-disabled" : ""}`}
        value={val}
        type={type}
        disabled={disabled || saving}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKey}
      />
      <button
        className={`cpm-field-save${changed && !disabled ? " is-visible" : ""}`}
        onClick={save}
        disabled={saving || !changed || disabled}
        aria-label="Зберегти"
      >
        {saving ? "…" : "✓"}
      </button>
      {err && <span className="cpm-field-err">{err}</span>}
    </div>
  );
}

/* ── Головний компонент ── */
export default function ClientProfileModal({ userId, onClose, onUserUpdated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAttach, setShowAttach] = useState(false);

  /* Escape */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  /* Завантаження */
  const load = () => {
    if (!userId) return;
    setLoading(true);
    axios.get(`/api/users/${userId}`)
      .then(r => { setUser(r.data); onUserUpdated?.(r.data); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [userId]);

  const onSaved = (updated) => setUser(updated);

  const onCompanyAttached = () => {
    setShowAttach(false);
    load();
  };

  const detachCompany = async () => {
    try {
      await axios.post(`/api/users/${userId}/detach-company`);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const fullName = user
    ? [user.firstName, user.lastName, user.familyName].filter(Boolean).join(" ") || user.username || `ID ${user.id}`
    : "";

  const discountNum = user
    ? parseInt(String(user.discount ?? "0").replace(/\D/g, ""), 10) || 0
    : 0;

  return (
    <>
    {showAttach && (
      <AttachCompanyModal
        userId={userId}
        onClose={() => setShowAttach(false)}
        onAttached={onCompanyAttached}
      />
    )}
    <div className="cpm-overlay" onClick={onClose}>
      <div className="cpm-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <header className="cpm-header">
          {user && (
            <div className="cpm-avatar-wrap">
              <TelegramAvatar link={user.telegram} size={56} square={true} />
              <span className="cpm-id-badge">ID {user.id}</span>
            </div>
          )}
          <div className="cpm-header-info">
            <div className="cpm-name-row">
              {loading
                ? <span className="cpm-loading-name">Завантаження...</span>
                : <span className="cpm-fullname">{fullName}</span>
              }
              {discountNum > 0 && (
                <span className="cpm-header-discount">Знижка: {discountNum}%</span>
              )}
            </div>
            <div className="cpm-header-sub">
              {user?.Company && (
                <span className="cpm-company-name">{user.Company.companyName}</span>
              )}
              {(() => {
                const cd = parseInt(String(user?.Company?.discount ?? '0').replace(/\D/g, ''), 10) || 0;
                return cd > 0 ? <span className="cpm-header-discount">Знижка компанії: {cd}%</span> : null;
              })()}
            </div>
          </div>
          <button className="cpm-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        {/* ── Body ── */}
        {!loading && user && (
          <div className="cpm-body">

            {/* Ліва колонка — основні поля */}
            <div className="cpm-section">
              <div className="cpm-section-title">Основна інформація</div>
              <FieldRow label="Ім'я"        field="firstName"   value={user.firstName}   userId={user.id} onSaved={onSaved} />
              <FieldRow label="По-батькові" field="lastName"    value={user.lastName}    userId={user.id} onSaved={onSaved} />
              <FieldRow label="Прізвище"    field="familyName"  value={user.familyName}  userId={user.id} onSaved={onSaved} />
              <FieldRow label="Телефон"     field="phoneNumber" value={user.phoneNumber} userId={user.id} onSaved={onSaved} />
              <FieldRow label="E-mail"      field="email"       value={user.email}       userId={user.id} type="email" onSaved={onSaved} />
              <FieldRow label="Адреса"      field="address"     value={user.address}     userId={user.id} onSaved={onSaved} />
            </div>

            {/* Права колонка — контакти та знижка */}
            <div className="cpm-section">
              <div className="cpm-section-title">Контакти та знижка</div>
              <FieldRow label="Telegram"  field="telegram"  value={user.telegram}  userId={user.id} onSaved={onSaved} />
              <FieldRow label="Viber"     field="viber"     value={user.viber}     userId={user.id} onSaved={onSaved} />
              <FieldRow label="WhatsApp"  field="whatsapp"  value={user.whatsapp}  userId={user.id} onSaved={onSaved} />
              <FieldRow label="Signal"    field="signal"    value={user.signal}    userId={user.id} onSaved={onSaved} />
              <FieldRow label="Знижка (%)" field="discount" value={discountNum}    userId={user.id} type="number" onSaved={onSaved} />
              <FieldRow label="Логін"     field="username"  value={user.username}  userId={user.id} onSaved={onSaved} disabled />
            </div>

          </div>
        )}

        {/* ── Footer — компанія ── */}
        {!loading && user && (
          <footer className="cpm-footer">
            {user.Company ? (
              <>
                <div className="cpm-company-block">
                  <div className="cpm-company-block-name">{user.Company.companyName}</div>
                  {user.Company.edrpou && <span className="cpm-company-detail">ЄДРПОУ: {user.Company.edrpou}</span>}
                  {user.Company.phoneNumber && <span className="cpm-company-detail">Тел.: {user.Company.phoneNumber}</span>}
                </div>
                <div className="cpm-company-actions">
                  <button className="cpm-add-company-btn" onClick={() => setShowAttach(true)}>
                    <span className="cpm-add-company-btn-text">Змінити</span>
                  </button>
                  <button className="cpm-add-company-btn cpm-add-company-btn--red" onClick={detachCompany}>
                    <span className="cpm-add-company-btn-text">Прибрати</span>
                  </button>
                </div>
              </>
            ) : (
              <button className="cpm-add-company-btn" onClick={() => setShowAttach(true)}>
                <span className="cpm-add-company-btn-text">Додати компанію</span>
              </button>
            )}
          </footer>
        )}

      </div>
    </div>
    </>
  );
}
