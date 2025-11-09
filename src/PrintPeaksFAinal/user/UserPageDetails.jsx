import React, {useEffect, useMemo, useRef, useState} from "react";
import { Spinner, Button, Form, Modal } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";
import TelegramAvatar from "../Messages/TelegramAvatar";

const FieldEdit = ({ label, field, value, userId, type="text", as="input", load, setUser,  user }) => {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(()=>{ setVal(value ?? ""); }, [value]);
  const InputTag = as === "textarea" ? "textarea" : "input";

  if(field === "username" || field === "password" || field === "Company"){
    return (
      <div className="d-flex align-items-center justify-content-center gap-3" >
        <div style={{minWidth:200, fontWeight:200, color:"#6e6f68"}}>{label}</div>
        <InputTag
          className="form-control disabled"
          value={val}
          disabled
          type={as==="textarea" ? undefined : type}
          style={{width:"25vw", height:"4vh", fontWeight:700, color:"#6e6f68" }}
          // rows={as==="textarea" ? 2 : undefined}
        />
        <Button variant="success" className="adminButtonAdd disabled" disabled={saving} style={{fontSize:"2vh", gap:"1vw",color:"#f2f0e7", minWidth:"2vw", height:"4vh", padding:"0", borderRadius:"6px"}}>
          {saving ? "💾" : "✓"}
        </Button>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      let res = await axios.patch(`/api/users/${userId}/field`, { field, value: val });
      setErr(false);
      console.log(res.data);
      setUser(res.data);
      // load()
    } catch (err) {
      setErr(err.response.data);
    }
    finally { setSaving(false); }
  };

  return (
    <div className="d-flex align-items-center justify-content-center gap-3" >
      <div style={{minWidth:200, fontWeight:200, color:"#6e6f68"}}>{label}</div>
      <InputTag
        className="form-control"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        type={as==="textarea" ? undefined : type}
        style={{width:"25vw", height:"4vh", fontSize:"20px"}}
        rows={as==="textarea" ? 3 : undefined}
      />
      <Button variant="success" className="adminButtonAdd" onClick={save} disabled={saving} style={{fontSize:"2vh", gap:"1vw",color:"#f2f0e7", minWidth:"2vw", height:"4vh", padding:"0", borderRadius:"6px"}}>
        {saving ? "💾" : "✓"}
      </Button>
      {err ? <div style={{
        transition: "all 0.3s ease",
        color: "red",

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: "1vh",
        marginBottom: "1vh",
        border: "1px solid red",
        borderRadius: "10px",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        fontSize: "1.3vw",
        fontWeight: "bold",
        textAlign: "center",
        cursor: "pointer",

      }}>{err}</div> : null}
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
        style={{ bottom: "15%", height:"35vw", left: "35%", borderRadius: 12, overflow: "hidden", zIndex:"200" }}
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
            // background: "#fbfaf6",
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
        <div className="noScrollbar" style={{ background: "#fbfaf6" }}>
          <div style={{ padding: "0rem 1rem", opacity:"0.7",  background:"#fbfaf6"}}>
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
  const companyBlock = user.Company ? (
    <div
      className="d-flex"
      style={{
        position: "relative",        // контейнер стає reference
        maxWidth: "100vw",
        boxShadow: "0px 2px 7px 0px rgba(0,0,0,0.2)",
        border: "white",
        borderRadius: 8,
        background: "#fbfaf6",
        padding: "1Vw",
        minWidth:"25vw"
      }}
    >
      <Link
        to={`/Companys/${user.Company.id}`}
        style={{ textDecoration: "none" }}
      >
        <div className="d-flex gap-2 flex-column" >
          <div style={{ fontWeight: 400, textTransform:"uppercase", color: "#6e6f68", fontSize: "1.5rem" }}>
            {user.Company.companyName || `Компанія №${user.Company.id}: noCompanyName`}
          </div>
          <div style={{ fontWeight: 400, fontSize: "0.7vw", opacity: 0.5 }}>
            ЄДРПОУ: {user.Company.edrpou || "···"}
          </div>
          <div style={{ fontWeight: 400,fontSize: "0.7vw", opacity: 0.5 }}>
            Тел.: {user.Company.phoneNumber || "···"}
          </div>
          <div style={{ fontWeight: 400,fontSize: "0.7vw", opacity: 0.5 }}>
            Адреса: {user.Company.address || "···"}
          </div>
        </div>
      </Link>

      <div
        style={{
          position: "absolute",
          bottom: "1rem",   // відступ знизу
          right: "1rem",

        }}
      >
        <div className="adminButtonAdd" onClick={detach}>
          Від’єднати від компанії
        </div>
      </div>
    </div>
  ) : (
    <div className="adminButtonAdd" style={{fontSize:"3vh", fontWeight:"200", padding:"1.3vw"}} onClick={() => setShowAttach(true)}>
      Прикріпити до компанії
    </div>
  );
  // console.log(user.hasOwnProperty);

  return (
    <div className="container-fluid" style={{padding:"1rem"}}>
      <div className="d-flex align-items-center justify-content-center" style={{gap:"2rem"}}>
        <TelegramAvatar link={user.telegram} size={80}/>
        {/*{user.phoneNumber && (*/}
        {/*  <ViberAvatar link={user.phoneNumber} size={64}/>*/}
        {/*)}*/}

        <div className="d-flex flex-row align-items-center">
          <div style={{ marginRight:"-0.1vw"}}>🤖</div> <h4 style={{
            margin:0,
          color:"#6e6f68",
          fontWeight: '200',
          textTransform:"uppercase",
          fontSize:"2.6vh",
          letterSpacing:"0.08em"}}>:
          {user.id} - {fullName || `User #${user.id}`}</h4>
          {/*<div style={{opacity:0.7}}>id: {user.id}*/}
          {/*  /!*· роль: {user.role}*!/*/}
          {/*</div>*/}
        </div>
        <div className="" style={{
          borderLeft: "1px solid white",
          marginLeft: "1vw",
          paddingLeft: "1vw",


        }}>


        </div>
        <div className="ms-auto d-flex" >
          <div className="adminButtonAdd" onClick={(e) => triggerNewOrder(user.id)} style={{textDecoration:"none"}}>Створити замовлення на цього клієнта</div>

        </div>
      </div>

      <hr className="my-4" style={{boxShadow: "0px 2px 0px 2px rgba(0,0,0,0.15)", border: "white"}}/>

      <div>
        <div
          className="mt-2"
          style={{
            display: "grid",
            gridTemplateRows: `repeat(10, 1fr)`,
            gridAutoFlow: "column",
            justifyContent:"space-around",
            alignItems: "center",
            gap: "0.6rem",
            width: "100vw",

          }}
        >
          <FieldEdit label="Логін" field="username" value={user.username} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Пароль" field="password" value={user.password} userId={user.id} load={load}  setUser={setUser} user={user} />

          <FieldEdit label="Ім'я" field="firstName" value={user.firstName} userId={user.id} load={load} setUser={setUser} user={user} />
          <FieldEdit label="По-батькові" field="lastName" value={user.lastName} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Прізвище" field="familyName" value={user.familyName} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Тел.:" field="phoneNumber" value={user.phoneNumber} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="E-mail" field="email" value={user.email} userId={user.id} type="email" load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Адреса" field="address" value={user.address} userId={user.id} load={load}  setUser={setUser} user={user} />
          {/*<FieldEdit label="Компанія" field="company" value={user.company} userId={user.id} load={load}  setUser={setUser} user={user} />*/}
          {/*<FieldEdit label="Компанія" field="Company" value={`(${user.Company?.id}) ${user.Company?.companyName}`} userId={user.id} load={load}  setUser={setUser} user={user} />*/}
          <FieldEdit label="Telegram" field="telegram" value={user.telegram} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Viber" field="viber" value={user.viber} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="WhatsApp" field="whatsapp" value={user.whatsapp} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Signal" field="signal" value={user.signal} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Знижка (%)"  field="discount" value={parseInt(String(user.discount).replace(/\D/g, ''), 10) || 0} userId={user.id} type="number" load={load} style={{ background: "#008249" }}  setUser={setUser} user={user} />
          <FieldEdit label="Фото" field="photoLink" value={user.photoLink} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Доступ(Права)" field="role" value={user.role} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="Касир(пин)" field="role2" value={user.role2} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="loginCashier" field="loginCashier" value={user.loginCashier} userId={user.id} load={load}  setUser={setUser} user={user} />
          <FieldEdit label="passwordCashier" field="passwordCashier" value={user.passwordCashier} userId={user.id} load={load}  setUser={setUser} user={user} />
          {/*<FieldEdit label="Права" field="role2" value={user.role2} userId={user.id} load={load}  setUser={setUser} user={user} />*/}
        </div>
      </div>


      <hr className="my-4" style={{boxShadow: "0px 2px 0px 2px rgba(0,0,0,0.15)", border: "white"}}/>
      <h5 className="d-flex align-items-center justify-content-center" style={{color: "#6e6f68" }}>   {companyBlock}</h5>
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
