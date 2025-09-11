import React, { useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import { useParams, Link } from "react-router-dom";
import { Spinner, Button, Form } from "react-bootstrap";
import TelegramAvatar from "../Messages/TelegramAvatar";
import AddUserWindow from "../user/AddUserWindow";
import AttachExistingUserModal from "./AttachExistingUserModal";

const FieldEdit = ({ label, field, value, companyId, type="text", as="input" }) => {
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ setVal(value ?? ""); }, [value]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/company/${companyId}/field`, { field, value: val });
    } finally {
      setSaving(false);
    }
  };

  const InputTag = as === "textarea" ? "textarea" : "input";
  return (
    <div className="mb-2 d-flex align-items-center" style={{
      gap:"0.6rem"
    }}>
      <div style={{
        minWidth:140,
        fontWeight:600
      }}>{label}</div>
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

const UsersList = ({ companyId, reloadSignal = 0 }) => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/company/${companyId}/users`, {
        currentPage: page, inPageCount: limit, search: q
      });
      setRows(data.rows || []);
      setCount(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [page, limit, reloadSignal]);
  useEffect(()=>{
    const id = setTimeout(()=>{ setPage(1); load(); }, 350);
    return ()=>clearTimeout(id);
    // eslint-disable-next-line
  }, [q]);

  const totalPages = useMemo(()=>Math.max(1, Math.ceil(count/limit)), [count, limit]);

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center" style={{gap:"0.6rem"}}>
        <Form.Control
          placeholder="Пошук клієнтів компанії"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{maxWidth:"30vw"}}
        />
        <div>Знайдено: {count}</div>
        <div className="ms-auto d-flex align-items-center" style={{gap:"0.6rem"}}>
          <Form.Select value={limit} onChange={e=>setLimit(Number(e.target.value))} style={{width:90}}>
            <option>10</option><option>25</option><option>50</option><option>100</option>
          </Form.Select>
          <Button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</Button>
          <div>{page}/{totalPages}</div>
          <Button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>›</Button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{height:"20vh"}}>
          <Spinner animation="border" variant="dark" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-3">Немає клієнтів</div>
      ) : (
        <div className="d-flex flex-wrap mt-3" style={{gap:"0.8rem"}}>
          {rows.map(u=>(
            <Link to={`/Users/${u.id}`} style={{textDecoration: "none"}}>
              <div key={u.id} className="p-2" style={{
                width: "24vw",
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fbfaf6",
                padding: "1vw",
              }}>
                <div className="d-flex align-items-center" style={{gap: "0.6rem"}}>
                  <TelegramAvatar link={u.telegram} size={48}/>
                  <div>
                    <div style={{fontWeight: 600}}>{u.firstName} {u.lastName} {u.familyName}</div>
                    <div className="d-flex">
                      <div style={{fontSize: 12, opacity: 0.75}}>id: {u.id}</div>
                    </div>
                    <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
                      телефон: {u.phoneNumber || "—"}
                    </div>
                    <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
                      email: {u.email || "—"}
                    </div>
                    <div style={{ fontSize: "0.6vw", opacity: 0.7 }}>
                      адреса: {u.address || "—"}
                    </div>
                  </div>
                </div>
                {/*<div style={{fontSize: 14, marginTop: 6}}>*/}
                {/*  {u.phoneNumber || "—"} · {u.email || "—"}*/}
                {/*</div>*/}
                {/*<div style={{fontSize: 12, opacity: 0.8}}>{u.address || " "}</div>*/}
                {/*<div className="d-flex mt-2" style={{gap: "0.5rem"}}>*/}
                {/*  <Link to={`/Orders/create?userId=${u.id}`} className="adminButtonAddOrder"*/}
                {/*        style={{textDecoration: "none"}}>Нове замовлення</Link>*/}
                {/*</div>*/}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CompanyPage() {
  const { id } = useParams(); // route: /Company/:id
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [reloadUsersSignal, setReloadUsersSignal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/company/${id}`);
      setCompany(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height:"60vh"}}>
      <Spinner animation="border" variant="dark"/>
    </div>
  );

  if (!company) return <div>Компанію не знайдено</div>;

  return (
    <div className="container-fluid" style={{padding:"1rem"}}>
      <div className="d-flex align-items-center" style={{gap:"1rem"}}>
        <h3 style={{margin:0}}>Компанія #{company.id}</h3>
        <div style={{opacity:0.7}}>Клієнтів: {company.usersCount}</div>
        <div className="ms-auto d-flex" style={{gap:"0.6rem"}}>
          <Button className="adminButtonAdd" onClick={()=>setShowAttachModal(true)}>
            ＋ Додати існуючого
          </Button>
          <Button className="adminButtonAdd" onClick={()=>setShowAddUser(true)}>＋＋ Додати нового клієнта</Button>
          <Link to="/Companys" className="adminButtonAdd" style={{textDecoration:"none"}}>↗ До списку</Link>
        </div>
      </div>

      <div className="mt-3" style={{
        display:"grid",
        gridTemplateColumns:"1fr",
        // gap:"0.6rem",
        maxWidth:"60vw"
      }}>
        <FieldEdit label="Назва"        field="companyName" value={company.companyName} companyId={company.id}/>
        <FieldEdit label="ЄДРПОУ"       field="edrpou"      value={company.edrpou}      companyId={company.id}/>
        <FieldEdit label="E-mail"       field="email"       value={company.email}       companyId={company.id} type="email"/>
        <FieldEdit label="Телефон"      field="phoneNumber" value={company.phoneNumber} companyId={company.id}/>
        <FieldEdit label="Адреса"       field="address"     value={company.address}     companyId={company.id}/>
        <FieldEdit label="Знижка (%)"   field="discount"    value={company.discount}    companyId={company.id} type="number"/>
        <FieldEdit label="Фото (URL)"   field="photoLink"   value={company.photoLink}   companyId={company.id}/>
        <FieldEdit label="Нотатки"      field="notes"       value={company.notes}       companyId={company.id} as="textarea"/>
      </div>

      <hr className="my-4"/>

      <h5>Клієнти компанії</h5>
      <UsersList companyId={company.id} reloadSignal={reloadUsersSignal} />

      {showAttachModal && (
        <AttachExistingUserModal
          companyId={company.id}
          onClose={()=>setShowAttachModal(false)}
          onAttached={()=>{
            setShowAttachModal(false);
            setReloadUsersSignal(s=>s+1);
          }}
        />
      )}

      {showAddUser && (
        <AddUserWindow
          show={showAddUser}
          onHide={()=>setShowAddUser(false)}
          onUserAdded={()=>{ setShowAddUser(false); }}
          addOrdOrOnlyClient="onlyClient"
          thisOrder={null}
          setThisOrder={null}
          // префілл компанії
          presetCompany={{ id: company.id, name: company.companyName }}
        />
      )}
    </div>
  );
}
