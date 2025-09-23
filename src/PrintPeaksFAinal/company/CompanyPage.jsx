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
    <div className="mb-1 d-flex align-items-center" style={{
      gap:"1rem"
    }}>
      <div style={{
        minWidth:100,
        // fontWeight:400
      }}>{label}</div>
      <InputTag
        className="form-control"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        type={as==="textarea" ? undefined : type}
        style={{maxWidth:"30vw", height:"3.6vh", fontSize:"1.5vh"}}
        rows={as==="textarea" ? 3 : undefined}
      />
      <Button variant="success" className="adminButtonAdd" style={{fontSize:"2vh", color:"#f2f0e7", minWidth:"2vw",  padding:"0", borderRadius:"6px"}}
              onClick={save} disabled={saving}>
        {saving ? "💾" : "✔"}
      </Button>
    </div>
  );
};

const UsersList = ({ companyId, reloadSignal = 0 }) => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([2]);
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
    <div className="mt-1">
      <div className="d-flex align-items-center" style={{gap:"0.6rem" }}>
        <div className="d-flex align-items-center justify-content-between" style={{gap:"0.6rem", minWidth:"100%"}}>
          <h4 style={{margin:0, display:"flex", alignItems:"center", gap:"0.5rem"}}>

            В компанії <span style={{fontSize:"2.5vh", marginRight:"-0.5vw"}}>🤖</span>: {count} шт
          </h4>
          <div className=" d-flex justify-content-end" style={{gap:"2rem"}}>
            <Button className="adminButtonAdd" onClick={()=>setShowAttachModal(true)}>
              Додати в компанію існуючого <div style={{fontSize:"1.8vh"}}>🤖</div>
            </Button>
            <Button className="adminButtonAdd" onClick={()=>setShowAddUser(true)}>
              Додати в компанію нового <div style={{fontSize:"1.8vh"}}>🤖</div>
            </Button>
            {/*<Link to="/Companys" className="adminButtonAdd" style={{textDecoration:"none"}}>*/}
            {/*  ↗ До списку*/}
            {/*</Link>*/}
          </div>
          <Form.Control
            placeholder="Пошук 🤖"
            value={q}
            onChange={e=>setQ(e.target.value)}
            style={{width:"20vw", opacity:0.5}}
          />
        </div>


        {/*<div className="ms-auto d-flex align-items-center" style={{gap:"0.6rem"}}>*/}
        {/*  /!*<Form.Select value={limit} onChange={e=>setLimit(Number(e.target.value))} style={{width:90}}>*!/*/}
        {/*  /!*  <option>10</option><option>25</option><option>50</option><option>100</option>*!/*/}
        {/*  /!*</Form.Select>*!/*/}
        {/*  <Button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</Button>*/}
        {/*  <div>{page}/{totalPages}</div>*/}
        {/*  <Button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>›</Button>*/}
        {/*</div>*/}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{height:"20vh"}}>
          <Spinner animation="border" variant="dark" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-3">Немає клієнтів</div>
      ) : (
        <div className="d-flex flex-wrap mt-2" style={{gap:"0.8rem"}}>
          {rows.map(u=>(
            <Link to={`/Users/${u.id}`} style={{textDecoration: "none"}}>
              <div key={u.id} className="" style={{
                width: "15vw",
                border: "none",
                borderRadius: 8,
                background: "#fbfaf6",
                padding: "1vw",
              }}>
                <div className="d-flex align-items-center" style={{gap: "0.6rem"}}>
                  <TelegramAvatar link={u.telegram} size={48}/>
                  <div>
                    <div style={{fontWeight: 600}}>{u.firstName} {u.lastName} {u.familyName}</div>
                    <div className="d-flex">
                      <div style={{fontSize: "1.3vh", opacity: 0.75}}>Id: {u.id}</div>
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      Тел.: {u.phoneNumber || "—"}
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      E-mail: {u.email || "—"}
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      Адреса: {u.address || "—"}
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
    <div className="" style={{padding:"1rem"}}>
      <div className="d-flex align-items-center " style={{gap:"1rem"}}>
        <h4 style={{margin:0}}>Компанія: №{company.id}</h4>
        {/*<div style={{opacity:0.7}}>Клієнтів: {company.usersCount}</div>*/}

      </div>

      <div className="" style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",  // два стовпчики
        gridTemplateRows:"repeat(4, auto)", // 4 рядки
        marginTop:"2vh"
        // gap:"1rem",
        // maxWidth:"120vw"
      }}>
        <FieldEdit label="Назва"    field="companyName" value={company.companyName} companyId={company.id}/>
        <FieldEdit label="Адреса"   field="address"     value={company.address}     companyId={company.id}/>

        <FieldEdit label="ЄДРПОУ"   field="edrpou"      value={company.edrpou}      companyId={company.id}/>
        <FieldEdit label="Знижка"   field="discount"    value={company.discount}    companyId={company.id} type="number"/>

        <FieldEdit label="E-mail"   field="email"       value={company.email}       companyId={company.id} type="email"/>
        <FieldEdit label="Фото"     field="photoLink"   value={company.photoLink}   companyId={company.id}/>

        <FieldEdit label="Тел."     field="phoneNumber" value={company.phoneNumber} companyId={company.id}/>
        <FieldEdit label="Нотатки"  field="notes"       value={company.notes}       companyId={company.id} as="textarea"/>
      </div>


      <hr className="my-4"/>


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
