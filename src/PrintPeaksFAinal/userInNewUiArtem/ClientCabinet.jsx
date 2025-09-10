import React, {useEffect, useMemo, useState} from "react";
import TelegramAvatar from "../Messages/TelegramAvatar";
import axios from "../../api/axiosInstance";
import {Link} from "react-router-dom";
import Loader from "../../components/calc/Loader";
import {useSelector} from "react-redux";

export default function ClientCabinet({
                                        user = {},
                                        userId = 0,
                                        orders = [],
                                        thisOrder = {id: 0},
                                        // onCreateOrder,
                                        onOpenChat,
                                        onClose,
                                      }) {

  const [clientOrders, setClientOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInBase, setUserInBase] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);

  // useEffect(() => {
  //   const h = (e) => e.key === "Escape" && onClose?.();
  //   document.addEventListener("keydown", h);
  //   return () => document.removeEventListener("keydown", h);
  // }, [onClose]);

  const handleSearchChange = (e) => {
    // console.log(e.target.value);
    setSearchQuery(e.target.value);
  };

  const onOpenProfile = (userInBase) => {
    if(userInBase.id){
      window.location.href = `/Users/${userInBase.id}`;
    }
    // console.log(e.target.value);
  };

  const onOpenCompanyProfile = (userInBase) => {
    if(userInBase.Company?.id){
      window.location.href = `/Companys/${userInBase.Company?.id}`;
    }
    // console.log(e.target.value);
  };

  const onCreateOrder = () => {
    // Створюємо новий запит для створення замовлення
    const postData = {
      userId: userInBase.id,
    };
    axios.post(`/orders/createForThisUser`, postData)
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

  useEffect(() => {
    if (userInBase) {
      const fetchData = async () => {
        try {
          // const url = user.role === 'admin' || user.role === 'operator' ? '/orders/all' : '/orders/my';
          let url = '/orders/all';
          if(currentUser.role === 'user'){
            url = '/orders/my';
            setClientOrders(orders);
          } else {
            const postData = {
              inPageCount: 9999,
              currentPage: 1,
              search: "",
              columnName: {column: 'id', reverse: true},
              startDate: "",
              endDate: "",
              statuses: {
                status0: true,
                status1: true,
                status2: true,
                status3: true,
                status4: true,
                status5: true
              },
              user: userInBase.id,
            };


            setLoading(true);
            const res = await axios.post(url, postData);
            // console.log(res.data);
            setClientOrders(res.data.rows);
            setLoading(false);
          }

        } catch (err) {
          // if (err.response?.status === 403) navigate('/login');
          setError(err.message);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userInBase]);

  useEffect(() => {
    console.log(userId);
    if (userId) {
      const fetchData = async () => {
        try {
          // const url = user.role === 'admin' || user.role === 'operator' ? '/orders/all' : '/orders/my';
          let url = `/user/getOneUser/${userId}`;
          setLoading(true);
          const res = await axios.get(url);
          console.log(res.data);
          setUserInBase(res.data);
          setLoading(false);

        } catch (err) {
          // if (err.response?.status === 403) navigate('/login');
          setError(err.message);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, []);

  // const stats = useMemo(() => {
  //   const total = orders.reduce((s, o) => s + (+o.total || 0), 0);
  //   const paid = orders.reduce((s, o) => s + (+o.paid || 0), 0);
  //   return { total, paid, balance: total - paid, count: orders.length };
  // }, [clientOrders]);

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

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-panel" onClick={(e) => e.stopPropagation()}>
        <header className="cc-header">
          <div className="cc-avatar">
            {userInBase?.telegram ? (
              <TelegramAvatar
                link={userInBase?.telegram}
                size={50}
                defaultSrc={
                  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2024%2024'%20width%3D'70'%20height%3D'70'%20fill%3D'none'%20stroke%3D'currentColor'%20stroke-width%3D'1.6'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'%3E%3Ccircle%20cx%3D'12'%20cy%3D'8'%20r%3D'3.2'/%3E%3Cpath%20d%3D'M4%2020c0-3.3%203.6-6%208-6s8%202.7%208%206'/%3E%3C%2Fsvg%3E"
                }
              />
            ) : userInBase?.photoLink ? (
              <img src={userInBase?.photoLink} alt={fullName} />
            ) : (
              <div className="cc-avatar-fallback" aria-hidden="true">
                {/* Inline SVG fallback */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="34"
                  height="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  role="img"
                  aria-label="Аватар"
                >
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                </svg>
              </div>
            )}
          </div>
          <div className="cc-title d-flex flex-row gap-1 ">
            <div className="cc-name">{fullName}</div>
            <div className="cc-meta">
             {userInBase?.company && <span className="cc-chip">{userInBase?.company}</span>}
              {userInBase?.role && <span className="cc-chip">{userInBase?.role}</span>}

            </div>
            <section className="cc-contacts">

              {userInBase?.phoneNumber && <a className="cc-contact" href={`tel:${userInBase?.phoneNumber}`}>{userInBase?.phoneNumber}</a>}
              {userInBase?.email && <a className="cc-contact" href={`mailto:${userInBase?.email}`}>{userInBase?.email}</a>}
              {userInBase?.telegram && (
                <a className="cc-contact" target="_blank" rel="noreferrer"
                   href={`https://t.me/${String(userInBase?.telegram).replace("@","")}`}>
                  {String(userInBase?.telegram).replace("@","")}
                </a>
              )}
            </section>
          </div>

          <button className="cc-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        <div className="cc-actions">
          <button className="cc-btn" onClick={() => onCreateOrder?.(userInBase)}>＋ Нове замовлення</button>
          <button className="cc-btn" onClick={() => onOpenChat?.(userInBase)}>💬 Чат</button>
          <button className="cc-btn" onClick={() => onOpenProfile?.(userInBase)}>↗ Профіль</button>
          <button className="cc-btn" onClick={() => onOpenCompanyProfile?.(userInBase)}>↗ Компанія ({userInBase?.Company?.companyName})</button>
        </div>



        <section className="cc-stats">
          <div className="cc-stat"><div className="cc-stat-v">{stats.count}</div><div className="cc-stat-l">Замовл.</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.total.toFixed(2)}</div><div className="cc-stat-l">Нарах.</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.paid.toFixed(2)}</div><div className="cc-stat-l">Оплачено</div></div>
          <div className="cc-stat"><div className="cc-stat-v">{stats.balance.toFixed(2)}</div><div className="cc-stat-l">Баланс</div></div>
        </section>

        <section className="cc-orders">
          <div className="cc-orders-head">Замовлення</div>
          <div className="cc-order-list">
            {loading &&
              <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                <h1 className="d-flex justify-content-center align-items-center">
                  <Loader/>
                </h1>
              </div>
            }
            {clientOrders.length === 0 && <div className="cc-empty">Замовлень немає.</div>}
            {clientOrders.map((o) => (
              <Link key={o.id} style={{textDecoration: 'none'}} to={`/Orders/${o.id}`}>
                <div className="d-flex cc-order " style={{background: `${statusClass(o.status)}`}}>
                  <div key={o.id || o._id}>
                    <div className="cc-order-top">
                      {thisOrder.id === o.id &&
                        <div className="cc-order-title" style={{color: "red"}}>{o.title || o.name || `Замовлення #${o.id}`}</div>
                      }
                      {thisOrder.id !== o.id &&
                        <div className="cc-order-title">{o.title || o.name || `Замовлення #${o.id}`}</div>
                      }
                    </div>
                    <div className="cc-order-meta">
                      <span>ID: {o.id || o._id}</span>
                      {o.createdAt && <span>{formatDate(o.createdAt)}</span>}
                    </div>
                    <div className="cc-order-sum">💳 {fmtMoney(o.allPrice, o.currency)}
                      {o.paid != null && <span className="cc-paid"> • Опл.: {fmtMoney(o.paid, o.currency)}</span>}
                    </div>
                  </div>
                  <div className="cc-order-status-icon m-auto">
                    {o.Payment?.status === 'CREATED' &&
                      <div className={`adminButtonAddOrder wait`} style={{}}>
                        {"Очікування️"}
                      </div>
                    }
                    {o.Payment?.status === 'PAID' &&
                      <div className={`adminButtonAddOrder pay`} style={{}}>
                        {"Оплата за посиланням"}
                      </div>
                    }
                    {o.Payment?.status === 'CANCELLED' &&
                      <button className={`adminButtonAddOrder cancel`} style={{}}>
                        {"Відміна"}
                      </button>
                    }
                    {o.Payment?.status === 'EXPIRED' &&
                      <button className={`adminButtonAddOrder nopay`} style={{}}>
                        Не оплачено (EXPIRED)
                      </button>
                    }
                    {o.Payment === null &&
                      <button className={`adminButtonAddOrder nopay`} style={{color: '#000000'}}>
                        {"Не оплачено"}
                      </button>
                    }
                  </div>
                  {/*<div className="cc-order-status">{o.status || "—"}</div>*/}
                  <div className="adminFontTable d-flex align-content-center justify-content-center m-auto" style={{}}>
                    {/*{item.status}*/}
                    {o.status === "-1"
                      ? 'Скасоване'
                      : o.status === "0"
                        ? 'Оформлення'
                        : o.status === "1"
                          ? 'Друкується'
                          : o.status === "2"
                            ? 'Постпресc'
                            : o.status === "3"
                              ? 'Готове'
                              : o.status === "4"
                                ? 'Віддали'
                                : 'Віддали'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function statusClass(s) {
  const v = String(s||"").toLowerCase();
  if (v.includes("0")) return '#FBFAF6';
  if (v.includes("1")) return '#d3bda7';
  if (v.includes("2")) return '#bbc5d3';
  if (v.includes("3")) return '#f1cbd4';
  if (v.includes("4")) return '#a9cfb7';
  if (v.includes("відміна")) return '#ee3c23';
  return '#FBFAF6';
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
