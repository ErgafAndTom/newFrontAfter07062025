import React, {useEffect, useMemo, useState} from "react";
import TelegramAvatar from "../Messages/TelegramAvatar";
import axios from "../../api/axiosInstance";
import {Link} from "react-router-dom";
import Loader from "../../components/calc/Loader";
import {useSelector} from "react-redux";
import "./ClientCabinet.css";

export default function ClientCabinet({
                                        user = {},
                                        userId = 0,
                                        orders = [],
                                        thisOrder = {id: 0},
                                        onOpenChat,
                                        onClose,
                                      }) {

  const [clientOrders, setClientOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInBase, setUserInBase] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);

  /* ---------- actions ---------- */

  const onOpenProfile = (u) => {
    if (u?.id) window.location.href = `/Users/${u.id}`;
  };

  const onOpenCompanyProfile = (u) => {
    if (u?.Company?.id) {
      window.location.href = `/Companys/${u.Company.id}`;
    } else if (u?.id) {
      window.location.href = `/Users/${u.id}`;
    }
  };

  const onCreateOrder = () => {
    if (!userInBase?.id) return;
    axios.post(`/orders/createForThisUser`, { userId: userInBase.id })
      .then(res => { window.location.href = `/Orders/${res.data.id}`; })
      .catch(err => console.log(err.message));
  };

  /* ---------- data fetching ---------- */

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/user/getOneUser/${userId}`);
        setUserInBase(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userInBase) return;
    (async () => {
      try {
        if (currentUser.role === 'user') {
          setClientOrders(orders);
          return;
        }
        setLoading(true);
        const res = await axios.post('/orders/all', {
          inPageCount: 9999,
          currentPage: 1,
          search: "",
          columnName: { column: 'id', reverse: true },
          startDate: "",
          endDate: "",
          statuses: { status0: true, status1: true, status2: true, status3: true, status4: true, status5: true },
          user: userInBase.id,
        });
        setClientOrders(res.data.rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [userInBase]);

  /* ---------- computed ---------- */

  const fullName = useMemo(() => {
    const base = [userInBase?.firstName, userInBase?.lastName].filter(Boolean).join(" ");
    return base || userInBase?.username || "Клієнт";
  }, [userInBase]);

  const stats = useMemo(() => {
    const total = clientOrders.reduce((s, o) => s + (+o.allPrice || 0), 0);
    const paid = clientOrders.reduce((s, o) =>
        s + (o.Payment?.status === 'PAID' ? (+o.allPrice || 0) : 0),
      0);
    return { total, paid, balance: total - paid, count: clientOrders.length };
  }, [clientOrders]);

  /* ---------- helpers ---------- */

  const statusLabel = (s) => {
    const v = String(s || "");
    if (v === "-1") return "Скасоване";
    if (v === "0") return "Оформлення";
    if (v === "1") return "Друкується";
    if (v === "2") return "Постпрес";
    if (v === "3") return "Готове";
    if (v === "4") return "Віддали";
    return "Віддали";
  };

  const statusToneClass = (s) => {
    const v = String(s || "");
    if (v === "-1") return "cc-tone-red";
    if (v === "0") return "cc-tone-cyan";
    if (v === "1") return "cc-tone-orange";
    if (v === "2") return "cc-tone-blue";
    if (v === "3") return "cc-tone-rose";
    if (v === "4") return "cc-tone-purple";
    return "cc-tone-purple";
  };

  const paymentLabel = (o) => {
    if (!o.Payment) return { text: "Не оплачено", cls: "cc-pay--nopay" };
    switch (o.Payment.status) {
      case 'PAID': {
        const m = o.Payment.method;
        const t = m === 'terminal' ? 'Карткою' : m === 'link' ? 'За посиланням' : m === 'cash' ? 'Готівкою' : 'Оплачено';
        return { text: t, cls: "cc-pay--paid" };
      }
      case 'CREATED': return { text: "Очікування", cls: "cc-pay--wait" };
      case 'CANCELLED': return { text: "Відміна", cls: "cc-pay--cancel" };
      case 'EXPIRED': return { text: "Прострочено", cls: "cc-pay--expired" };
      default: return { text: "Не оплачено", cls: "cc-pay--nopay" };
    }
  };

  const fmtMoney = (v) => {
    const n = +v || 0;
    return n % 1 === 0 ? String(n) : n.toFixed(2);
  };

  /* ---------- render ---------- */

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <header className="cc-header">
          <div className="cc-avatar-wrap">
            <TelegramAvatar link={userInBase?.telegram} size={56} square={true} />
            <span className="cc-id-badge">ID {userInBase?.id ?? '—'}</span>
          </div>

          <div className="cc-title">
            <div className="cc-name">{fullName}</div>
            {userInBase?.company && <span className="cc-chip">{userInBase.company}</span>}
            <section className="cc-contacts">
              {userInBase?.phoneNumber && <a className="cc-contact" href={`tel:${userInBase.phoneNumber}`}>{userInBase.phoneNumber}</a>}
              {userInBase?.email && <a className="cc-contact" href={`mailto:${userInBase.email}`}>{userInBase.email}</a>}
            </section>
          </div>

          <button className="cc-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        {/* ── Action buttons ── */}
        <div className="cc-actions">
          <button className="cc-btn" onClick={() => onCreateOrder()}>
            <span className="cc-btn-text">Нове замовлення</span>
          </button>
          <button className="cc-btn" onClick={() => onOpenProfile(userInBase)}>
            <span className="cc-btn-text">Профіль</span>
          </button>
          <button
            className="cc-btn"
            onClick={() => onOpenCompanyProfile(userInBase)}
          >
            <span className="cc-btn-text">Компанія</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <section className="cc-stats">
          <div className="cc-stat">
            <div className="cc-stat-v">{stats.count}</div>
            <div className="cc-stat-l">Замовлень</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v">{fmtMoney(stats.total)}<span className="cc-stat-unit">грн</span></div>
            <div className="cc-stat-l">Нараховано</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v cc-stat-v--green">{fmtMoney(stats.paid)}<span className="cc-stat-unit">грн</span></div>
            <div className="cc-stat-l">Оплачено</div>
          </div>
          <div className="cc-stat">
            <div className={`cc-stat-v${stats.balance > 0 ? ' cc-stat-v--red' : ''}`}>{fmtMoney(stats.balance)}<span className="cc-stat-unit">грн</span></div>
            <div className="cc-stat-l">Баланс</div>
          </div>
        </section>

        {/* ── Orders list ── */}
        <section className="cc-orders">
          <div className="cc-order-list">
            {loading && (
              <div className="cc-loader-wrap">
                <Loader />
              </div>
            )}
            {!loading && clientOrders.length === 0 && (
              <div className="cc-empty">Замовлень немає</div>
            )}
            {clientOrders.map((o) => {
              const isCurrent = thisOrder.id === o.id;
              const tone = statusToneClass(o.status);
              const pay = paymentLabel(o);
              return (
                <Link key={o.id} className="cc-order-link" to={`/Orders/${o.id}`}>
                  <div className={`cc-order ${tone}${isCurrent ? ' is-current' : ''}`}>
                    <div className="cc-order-col cc-order-col--title">
                      <span className="cc-order-title">
                        Замовлення <span className={`cc-order-id${isCurrent ? ' is-current' : ''}`}>№{o.id}</span>
                      </span>
                    </div>
                    <div className={`cc-order-col cc-order-col--sum ${pay.cls}`}>
                      <span className="cc-order-sum-value">{fmtMoney(o.allPrice)}</span><span className="cc-order-sum-unit">грн</span>
                    </div>
                    <div className="cc-order-col cc-order-col--date">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('uk-UA') : '—'}
                    </div>
                    <div className="cc-order-col cc-order-col--status">
                      <span className="cc-order-status">{statusLabel(o.status)}</span>
                    </div>
                    <div className={`cc-order-col cc-order-col--pay ${pay.cls}`}>
                      <span className="cc-pay-badge">{pay.text}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
