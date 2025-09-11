import React, {useEffect, useMemo, useRef, useState} from "react";
import { Spinner, Button, Form, Modal } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";
import TelegramAvatar from "../Messages/TelegramAvatar";

const FieldEdit = ({ label, field, value, userId, type="text", as="input" }) => {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(()=>{ setVal(value ?? ""); }, [value]);

  const save = async () => {
    setSaving(true);
    try { await axios.patch(`/api/users/${userId}/field`, { field, value: val }); }
    finally { setSaving(false); }
  };

  const InputTag = as === "textarea" ? "textarea" : "input";
  return (
    <div className="mb-2 d-flex align-items-center" style={{gap:"0.6rem"}}>
      <div style={{minWidth:160, fontWeight:600}}>{label}</div>
      <InputTag
        className="form-control"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        type={as==="textarea" ? undefined : type}
        style={{maxWidth:"38vw"}}
        rows={as==="textarea" ? 3 : undefined}
      />
      <Button variant="success" className="adminButtonAdd" onClick={save} disabled={saving}>
        {saving ? "Зберігаю..." : "Зберегти"}
      </Button>
    </div>
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
        style={{ bottom: "25%", left: "35%", borderRadius: 12, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.6rem 0.8rem",
            background: "#fbfaf6",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>Додати до компанії</div>
          <button
            aria-label="Закрити"
            onClick={onClose}
            className="adminButtonAdd"
            style={{ height: "2rem", lineHeight: "2rem", padding: "0 0.8rem", background: "#e9e7de", borderRadius: 8 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="noScrollbar" style={{ background: "#f2f0e7" }}>
          <div style={{ padding: "0.8rem" }}>
            <input
              ref={inputRef}
              className="form-control"
              placeholder="Пошук компаній: назва, ЄДРПОУ, email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "20vh" }}>
              <div className="spinner-border text-dark" role="status" />
            </div>
          ) : (
            <div style={{ padding: "0 0.8rem 0.8rem" }}>
              <div className="list-group" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {rows.length === 0 && <div className="list-group-item">Нічого не знайдено</div>}
                {rows.map((c) => (
                  <div key={c.id} className="list-group-item d-flex align-items-center" style={{ gap: "0.6rem" }}>
                    <img
                      src={c.photoLink || "/noimg.png"}
                      alt=""
                      style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.companyName}</div>
                      <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
                        ЄДРПОУ: {c.edrpou || "—"} · id: {c.id}
                      </div>
                      <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
                        {c.address || "—"} · {c.phoneNumber}
                      </div>
                    </div>
                    <button
                      className="adminButtonAdd btn btn-primary"
                      disabled={attachingId === c.id}
                      onClick={() => attach(c.id)}
                    >
                      {attachingId === c.id ? "Додаю..." : "Додати"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.6rem 0.8rem",
            background: "#fbfaf6",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button className="adminButtonAdd btn btn-secondary" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </>
  );
}

export default function UserPageDetails({thisUser = null}) {
  const { id } = useParams(); // /Users/:id
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
    <div className="d-flex justify-content-center align-items-center" style={{height:"60vh"}}>
      <Spinner animation="border" variant="dark"/>
    </div>
  );
  if (!user) return <div>Користувача не знайдено</div>;

  const fullName = [user.firstName, user.familyName].filter(Boolean).join(" ");
  const companyBlock = user.Company
    ? (<div className="d-flex align-items-center" style={{
      gap:"0.6rem",
      // background: "gray"
      // width:"22vw",
      border:"1px solid #ddd",
      borderRadius:8,
      background:"#fbfaf6",
      padding: "1vw"
    }}>
      <img src={user.Company.photoLink || "/noimg.png"} alt="" style={{width:28, height:28, objectFit:"cover", borderRadius:6}}/>
      <Link to={`/Companys/${user.Company.id}`} className="" style={{textDecoration:"none"}}>
        {/*{user.Company.companyName || `Компанія #${user.Company.id}`}*/}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{user.Company.companyName || `Компанія #${user.Company.id} noCompanyName`}</div>
          <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
            ЄДРПОУ: {user.Company.edrpou || "—"}
          </div>
          <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
            id: {user.Company.id}
          </div>
          <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
            {user.Company.address || "—"} · {user.Company.phoneNumber}
          </div>
        </div>
      </Link>
      <div className="adminButtonAdd" onClick={detach}>– Від’єднати</div>
    </div>)
    : (<div className="adminButtonAdd" onClick={()=>setShowAttach(true)}>＋ Прикріпити до компанії</div>);

  return (
    <div className="container-fluid" style={{padding:"1rem"}}>
      <div className="d-flex align-items-center" style={{gap:"1rem"}}>
        <TelegramAvatar link={user.telegram} size={64}/>
        {/*{user.phoneNumber && (*/}
        {/*  <ViberAvatar link={user.phoneNumber} size={64}/>*/}
        {/*)}*/}

        <div>
          <h3 style={{margin:0}}>{fullName || `User #${user.id}`}</h3>
          <div style={{opacity:0.7}}>id: {user.id} · роль: {user.role}</div>
        </div>
        <div className="ms-auto d-flex" style={{gap:"0.6rem"}}>
          <div className="adminButtonAdd" onClick={(e) => triggerNewOrder(user.id)} style={{textDecoration:"none"}}>＋ Нове замовлення</div>
          <Link to={`/Users`} className="adminButtonAdd" style={{textDecoration:"none"}}>↗ До списку</Link>
        </div>
      </div>

      <hr className="my-1"/>

      <div className="d-flex">
        <div className="mt-2" style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          // gap:"0.6rem",
          maxWidth: "50vw"
        }}>
          <FieldEdit label="Ім'я" field="firstName" value={user.firstName} userId={user.id}/>
          <FieldEdit label="Прізвище" field="familyName" value={user.familyName} userId={user.id}/>
          <FieldEdit label="По батькові" field="lastName" value={user.lastName} userId={user.id}/>
          <FieldEdit label="Нікнейм" field="username" value={user.username} userId={user.id}/>
          <FieldEdit label="Телефон" field="phoneNumber" value={user.phoneNumber} userId={user.id}/>
          <FieldEdit label="E-mail" field="email" value={user.email} userId={user.id} type="email"/>
          <FieldEdit label="Адреса" field="address" value={user.address} userId={user.id}/>
          <FieldEdit label="Компанія (текст)" field="company" value={user.company} userId={user.id}/>
          <FieldEdit label="Telegram" field="telegram" value={user.telegram} userId={user.id}/>
          <FieldEdit label="Viber" field="viber" value={user.viber} userId={user.id}/>
          <FieldEdit label="WhatsApp" field="whatsapp" value={user.whatsapp} userId={user.id}/>
          <FieldEdit label="Signal" field="signal" value={user.signal} userId={user.id}/>
          <FieldEdit label="Знижка (%)" field="discount" value={user.discount} userId={user.id} type="number"/>
          <FieldEdit label="Фото (URL)" field="photoLink" value={user.photoLink} userId={user.id}/>
          <FieldEdit label="Роль" field="role" value={user.role} userId={user.id}/>
          <FieldEdit label="Роль 2" field="role2" value={user.role2} userId={user.id}/>
        </div>

        <div className="mt-2" style={{
          borderLeft: "1px solid white",
          marginLeft: "1vw",
          paddingLeft: "1vw",
        }}>
          <h5 className="d-flex align-items-center justify-content-center">Компанія</h5>
          {companyBlock}
        </div>
      </div>

      <hr className="my-1"/>

      {showAttach && (
        <AttachCompanyModal
          userId={user.id}
          onClose={()=>setShowAttach(false)}
          onAttached={()=>{ setShowAttach(false); load(); }}
        />
      )}
    </div>
  );
}
