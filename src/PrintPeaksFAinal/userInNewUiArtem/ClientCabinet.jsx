import React, { useEffect, useMemo } from "react";

export default function ClientCabinet({
                                        user = {},
                                        orders = [],
                                        onCreateOrder,
                                        onOpenChat,
                                        onOpenProfile,
                                        onClose,
                                      }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const fullName = useMemo(() => {
    const base = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return base || user.username || "Клієнт";
  }, [user]);

  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + (+o.total || 0), 0);
    const paid = orders.reduce((s, o) => s + (+o.paid || 0), 0);
    return { total, paid, balance: total - paid, count: orders.length };
  }, [orders]);

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-panel" onClick={(e) => e.stopPropagation()}>
        <header className="cc-header">
          <div className="cc-avatar">{user.photoLink
            ? <img src={user.photoLink} alt={fullName}/>
            : <span className="cc-avatar-fallback">👤</span>}
          </div>
          <div className="cc-title">
            <div className="cc-name">{fullName}</div>
            <div className="cc-meta">
              {user.company && <span className="cc-chip">{user.company}</span>}
              {user.role && <span className="cc-chip">{user.role}</span>}
              {user.discount != null && <span className="cc-chip">Знижка {user.discount}%</span>}
            </div>
          </div>
          <button className="cc-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        <div className="cc-actions">
          <button className="cc-btn" onClick={() => onCreateOrder?.(user)}>＋ Нове замовлення</button>
          <button className="cc-btn" onClick={() => onOpenChat?.(user)}>💬 Чат</button>
          <button className="cc-btn" onClick={() => onOpenProfile?.(user)}>↗ Профіль</button>
        </div>

        <section className="cc-contacts">
          {user.phoneNumber && <a className="cc-contact" href={`tel:${user.phoneNumber}`}>📞 {user.phoneNumber}</a>}
          {user.email && <a className="cc-contact" href={`mailto:${user.email}`}>✉️ {user.email}</a>}
          {user.telegram && (
            <a className="cc-contact" target="_blank" rel="noreferrer"
               href={`https://t.me/${String(user.telegram).replace("@","")}`}>
              tg @{String(user.telegram).replace("@","")}
            </a>
          )}
        </section>

        <section className="cc-stats">
          <div className="cc-stat"><div className="cc-stat-v">{stats.count}</div><div className="cc-stat-l">Замовл.</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.total.toFixed(2)}</div><div className="cc-stat-l">Нарах.</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.paid.toFixed(2)}</div><div className="cc-stat-l">Оплачено</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.balance.toFixed(2)}</div><div className="cc-stat-l">Баланс</div></div>
        </section>

        <section className="cc-orders">
          <div className="cc-orders-head">Замовлення</div>
          <div className="cc-order-list">
            {orders.length === 0 && <div className="cc-empty">Замовлень немає.</div>}
            {orders.map((o) => (
              <div key={o.id || o._id} className={`cc-order ${statusClass(o.status)}`}>
                <div className="cc-order-top">
                  <div className="cc-order-title">{o.title || o.name || `Замовлення #${o.id}`}</div>
                  <div className="cc-order-status">{o.status || "—"}</div>
                </div>
                <div className="cc-order-meta">
                  <span>ID: {o.id || o._id}</span>
                  {o.createdAt && <span>{formatDate(o.createdAt)}</span>}
                </div>
                <div className="cc-order-sum">💳 {fmtMoney(o.total, o.currency)}
                  {o.paid != null && <span className="cc-paid"> • Опл.: {fmtMoney(o.paid, o.currency)}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function statusClass(s) {
  const v = String(s||"").toLowerCase();
  if (v.includes("paid") || v.includes("оплач")) return "is-paid";
  if (v.includes("cancel") || v.includes("скас")) return "is-cancel";
  if (v.includes("done") || v.includes("готов") || v.includes("викон")) return "is-done";
  if (v.includes("in") || v.includes("робот") || v.includes("work")) return "is-inwork";
  return "is-default";
}
function formatDate(d){
  try{
    const dt = new Date(d);
    return dt.toLocaleString("uk-UA",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
  }catch{return "";}
}
function fmtMoney(v,c="UAH"){
  const n=+v||0;
  try{ return new Intl.NumberFormat("uk-UA",{style:"currency",currency:c}).format(n); }
  catch{ return `${n.toFixed(2)} ${c}`; }
}
