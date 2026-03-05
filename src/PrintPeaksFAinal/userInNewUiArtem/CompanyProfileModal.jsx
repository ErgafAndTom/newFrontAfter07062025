import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import TelegramAvatar from "../Messages/TelegramAvatar";
import "./CompanyProfileModal.css";

const PAGE_SIZE = 20;

/* ── Одне поле з inline-редагуванням ── */
function FieldRow({ label, field, value, companyId, type = "text", disabled = false, onSaved }) {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const changed = val !== (value ?? "");

  useEffect(() => { setVal(value ?? ""); }, [value]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await axios.patch(`/api/company/${companyId}/field`, { field, value: val });
      onSaved?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cоm-field-row">
      <span className="cоm-field-label">{label}</span>
      <input
        className={`cоm-field-input${changed ? " is-changed" : ""}${disabled ? " is-disabled" : ""}`}
        value={val}
        type={type}
        disabled={disabled || saving}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); }}
      />
      <button
        className={`cоm-field-save${changed && !disabled ? " is-visible" : ""}`}
        onClick={save}
        disabled={saving || !changed || disabled}
        aria-label="Зберегти"
      >
        {saving ? "…" : "✓"}
      </button>
      {err && <span className="cоm-field-err">{err}</span>}
    </div>
  );
}

/* ── Модалка прикріплення існуючого клієнта ── */
function AttachUserModal({ companyId, onClose, onAttached }) {
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
      axios.post(`/api/company/${companyId}/users/search`, { search: q, limit: 50, excludeCompany: true })
        .then(r => setRows(r.data?.rows || []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q, companyId]);

  const attach = async (userId) => {
    setAttachingId(userId);
    try {
      await axios.post(`/api/company/${companyId}/users/attach`, { userId });
      onAttached?.();
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <div className="cоm-overlay" style={{ zIndex: 10700 }} onClick={onClose}>
      <div className="cоm-panel cоm-panel--fon" style={{ maxWidth: 480, height: '70vh' }} onClick={(e) => e.stopPropagation()}>
        <header className="cоm-header">
          <div className="cоm-header-info">
            <span className="cоm-fullname">Додати клієнта</span>
          </div>
          <button className="cоm-close" onClick={onClose}>✕</button>
        </header>

        <div className="cоm-attach-search">
          <input
            ref={inputRef}
            className="cоm-attach-input"
            placeholder="Пошук клієнта..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="cоm-attach-list">
          {loading && <div className="cоm-attach-empty">Завантаження...</div>}
          {!loading && rows.length === 0 && <div className="cоm-attach-empty">Клієнтів не знайдено</div>}
          {!loading && rows.map((u) => {
            const name = [u.firstName, u.familyName].filter(Boolean).join(" ") || u.username || `ID ${u.id}`;
            return (
              <div key={u.id} className="cоm-attach-row">
                <div className="cоm-attach-avatar">
                  <TelegramAvatar size={36} square={true} />
                  <span className="cоm-attach-id">ID {u.id}</span>
                </div>
                <div className="cоm-attach-row-info">
                  <div className="cоm-attach-row-name">{name}</div>
                  {(u.phoneNumber || u.email) && (
                    <div className="cоm-attach-row-sub">
                      {u.phoneNumber && <div>{u.phoneNumber}</div>}
                      {u.email && <div>{u.email}</div>}
                    </div>
                  )}
                </div>
                <button
                  className="cоm-rect-btn"
                  disabled={attachingId === u.id}
                  onClick={() => attach(u.id)}
                >
                  <span className="cоm-rect-btn-text">{attachingId === u.id ? "..." : "Додати"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Головний компонент ── */
export default function CompanyProfileModal({ companyId, onClose }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);

  const [showAttach, setShowAttach] = useState(false);

  const sentinelRef = useRef(null);

  /* Escape */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  /* Завантаження даних компанії */
  const load = () => {
    if (!companyId) return;
    setLoading(true);
    axios.get(`/api/company/${companyId}`)
      .then(r => setCompany(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [companyId]);

  /* Завантаження клієнтів */
  const fetchUsers = useCallback(async (page = 1) => {
    const isFirst = page === 1;
    isFirst ? setUsersLoading(true) : setUsersLoadingMore(true);
    try {
      const { data } = await axios.post(`/api/company/${companyId}/users`, {
        currentPage: page,
        inPageCount: PAGE_SIZE,
      });
      const newRows = data.rows || [];
      if (isFirst) {
        setUsers(newRows);
        setUsersTotal(data.count || 0);
      } else {
        setUsers(prev => [...prev, ...newRows]);
      }
      setUsersPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      isFirst ? setUsersLoading(false) : setUsersLoadingMore(false);
    }
  }, [companyId]);

  useEffect(() => { fetchUsers(1); }, [companyId]);

  const detachUser = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/detach-company`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUsersTotal(prev => prev - 1);
    } catch (e) {
      console.error(e);
    }
  };

  /* Infinite scroll для клієнтів */
  const hasMore = users.length < usersTotal;
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !usersLoadingMore) {
          fetchUsers(usersPage + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, usersLoadingMore, usersPage]);

  const discountNum = company
    ? parseInt(String(company.discount ?? "0").replace(/\D/g, ""), 10) || 0
    : 0;

  return (
    <>
    {showAttach && (
      <AttachUserModal
        companyId={companyId}
        onClose={() => setShowAttach(false)}
        onAttached={() => { setShowAttach(false); fetchUsers(1); load(); }}
      />
    )}
    <div className="cоm-overlay" onClick={onClose}>
      <div className="cоm-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <header className="cоm-header">
          <div className="cоm-header-info">
            {loading
              ? <span className="cоm-loading-name">Завантаження...</span>
              : <span className="cоm-fullname">{company?.companyName || `Компанія №${companyId}`}</span>
            }
            {!loading && company && (
              <div className="cоm-header-sub">
                {company.edrpou && <span className="cоm-header-detail">ЄДРПОУ: {company.edrpou}</span>}
                {discountNum > 0 && <span className="cоm-header-discount">Знижка: {discountNum}%</span>}
              </div>
            )}
          </div>
          <button className="cоm-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        {/* ── Body — поля компанії ── */}
        {!loading && company && (
          <div className="cоm-body">
            <div className="cоm-section">
              <div className="cоm-section-title">Основна інформація</div>
              <FieldRow label="Назва"    field="companyName" value={company.companyName} companyId={company.id} onSaved={load} />
              <FieldRow label="ЄДРПОУ"  field="edrpou"      value={company.edrpou}      companyId={company.id} onSaved={load} />
              <FieldRow label="Адреса"  field="address"     value={company.address}     companyId={company.id} onSaved={load} />
              <FieldRow label="Нотатки" field="notes"       value={company.notes}       companyId={company.id} onSaved={load} />
            </div>
            <div className="cоm-section">
              <div className="cоm-section-title">Контакти та знижка</div>
              <FieldRow label="Телефон"    field="phoneNumber" value={company.phoneNumber} companyId={company.id} onSaved={load} />
              <FieldRow label="E-mail"     field="email"       value={company.email}       companyId={company.id} type="email" onSaved={load} />
              <FieldRow label="Знижка (%)" field="discount"    value={discountNum}         companyId={company.id} type="number" onSaved={load} />
              <FieldRow label="Фото"       field="photoLink"   value={company.photoLink}   companyId={company.id} onSaved={load} />
            </div>
          </div>
        )}

        {/* ── Клієнти компанії ── */}
        {!loading && (
          <section className="cоm-users-section">

            {/* Заголовок секції + кнопка */}
            <div className="cоm-users-header">
              <span className="cоm-users-title">
                Клієнти компанії
                {usersTotal > 0 && <span className="cоm-users-count">{usersTotal}</span>}
              </span>
              <button className="cоm-rect-btn" onClick={() => setShowAttach(true)}>
                <span className="cоm-rect-btn-text">Додати клієнта</span>
              </button>
            </div>

            {/* Список */}
            <div className="cоm-users-list">
              {usersLoading && <div className="cоm-users-empty">Завантаження...</div>}
              {!usersLoading && users.length === 0 && (
                <div className="cоm-users-empty">Клієнтів немає</div>
              )}
              {!usersLoading && users.map((u) => {
                const name = [u.firstName, u.familyName].filter(Boolean).join(" ") || u.username || `ID ${u.id}`;
                const discount = parseInt(String(u.discount ?? "0").replace(/\D/g, ""), 10) || 0;
                return (
                  <div key={u.id} className="cоm-user-row">
                    <div className="cоm-user-avatar">
                      <TelegramAvatar link={u.telegram} size={54} square={true} />
                      <span className="cоm-user-id">ID {u.id}</span>
                    </div>
                    <div className="cоm-user-info">
                      <div className="cоm-user-name">{name}</div>
                      {(u.phoneNumber || u.email) && (
                        <div className="cоm-user-contacts">
                          {u.phoneNumber && <span>{u.phoneNumber}</span>}
                          {u.email && <span>{u.email}</span>}
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="cоm-user-discount">Знижка: {discount}%</span>
                      )}
                    </div>
                    <button className="cоm-rect-btn cоm-rect-btn--red" onClick={() => detachUser(u.id)}>
                      <span className="cоm-rect-btn-text">Прибрати</span>
                    </button>
                  </div>
                );
              })}
              <div ref={sentinelRef} style={{ height: 1 }} />
              {usersLoadingMore && <div className="cоm-users-empty">Завантаження...</div>}
            </div>

          </section>
        )}

      </div>
    </div>
    </>
  );
}
