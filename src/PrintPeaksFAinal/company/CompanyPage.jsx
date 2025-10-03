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
    <div className="mb-1 d-flex justify-content-center align-items-center" style={{
      gap:"1rem"
    }}>
      <div style={{
        minWidth:140, fontWeight:200,
         color:"#6e6f68"
        // fontWeight:400
      }}>{label}</div>
      <InputTag
        className="form-control"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        type={as==="textarea" ? undefined : type}
        style={{maxWidth:"30vw", height:"4vh", fontSize:"1.5vh"}}
        rows={as==="textarea" ? 3 : undefined}
      />
      <Button variant="success" className="adminButtonAdd" style={{fontSize:"2vh", color:"#f2f0e7", minWidth:"2vw",  padding:"0", borderRadius:"6px"}}
              onClick={save} disabled={saving}>
        {saving ? "💾" : "✓"}
      </Button>
    </div>
  );
};
const UsersList = ({ companyId, reloadSignal = 0, onAddUser, onAttachUser }) => {
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
        currentPage: page,
        inPageCount: limit,
        search: q,
      });
      setRows(data.rows || []);
      setCount(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // перша загрузка
    // eslint-disable-next-line
  }, [page, limit, reloadSignal]);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      load();
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [q]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit]);

  return (
    <div className="mt-1">
      <div className="d-flex align-items-center" style={{ gap: "0.6rem" }}>
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ gap: "0.6rem", minWidth: "100%" }}
        >
          <h4
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6e6f68",
              fontWeight:"200",
              letterSpacing: "0.08em",
              textTransform:"uppercase"
            }}
          >
            В компанії загалом<span style={{ fontSize: "2.5vh", marginRight: "-0.5vw", }}>🤖</span>: {count}
          </h4>
          <div className="d-flex justify-content-end" style={{ gap: "2rem", fontSize:"2.5vh" }}>
            <Button className="adminButtonAdd" style={{
              fontSize:"2vh",
              padding:"2vh",
              fontWeight:"200",
              letterSpacing: "0.08em",
              textTransform:"uppercase"
            }} onClick={onAttachUser}>
              Додати в компанію існуючого <div style={{ fontSize: "3vh" }}>🤖</div>
            </Button>
            <Button className="adminButtonAdd" style={{
              fontSize:"2vh",
              padding:"2vh",
              fontWeight:"200",
              letterSpacing: "0.08em",
              textTransform:"uppercase"
            }} onClick={onAddUser}>
              Додати в компанію нового <div style={{ fontSize: "3vh" }}>🤖</div>
            </Button>
          </div>
          <Form.Control
            placeholder="Пошук 🤖"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "20vw", height:"4vh", background: "#ffffff", fontSize:"1.5vh" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "20vh" }}>
          <Spinner animation="border" variant="dark" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-3" style={{ color: "#fe3547",      fontWeight:"200",
          letterSpacing: "0.08em",
          textTransform:"uppercase" }}>
          Немає клієнтів
        </div>
      ) : (
        <div className="d-flex flex-wrap mt-2" style={{ gap: "0.8rem" }}>
          {rows.map((u) => (
            <Link key={u.id} to={`/Users/${u.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: "15vw",
                  border: "1px",
                  borderRadius: 8,
                  background: "#fbfaf6",
                  boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.15)",
                  padding: "1vw",
                  transition: "background-color 0.2s ease, transform 0.15s ease",
                  color: '#646462'
                }}
                className="user-card"
              >
                <div className="d-flex align-items-end" style={{ gap: "0.6rem", position: "relative" }}>

                  <div style={{ position: "relative" }}>
                    <div style={{      fontWeight:"500",
                      letterSpacing: "0.08em",
                      width:"12vw",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflowX: "hidden",
                      // textTransform:"uppercase"
                    }}>
                      {u.firstName} {u.lastName} {u.familyName}
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.75, marginTop:"1vh" }}>Id: {u.id}</div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      Тел.: {u.phoneNumber || "···"}
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      E-mail: {u.email || "···"}
                    </div>
                    <div style={{ fontSize: "1.3vh", opacity: 0.7 }}>
                      Адреса: {u.address || "···"}
                    </div>
                    <div  style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}>
                    <TelegramAvatar link={u.telegram} size={48}

                    />
                    </div>
                  </div>
                </div>
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
    <div className="" style={{padding:"2rem"}}>
      <div className="d-flex align-items-center " style={{gap:"1rem", }}>
        <h3 style={{margin:0, color:"#6e6f68",      fontWeight:"200",
          letterSpacing: "0.08em",
          textTransform:"uppercase"}}>Компанія: {company.companyName} (№{company.id}) </h3>
        {/*<div style={{opacity:0.7}}>Клієнтів: {company.usersCount}</div>*/}

      </div>
      <hr className="my-4" style={{boxShadow: "0px 2px 0px 2px rgba(0,0,0,0.15)", border: "white"}}/>
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

      <hr className="my-4" style={{boxShadow: "0px 2px 0px 2px rgba(0,0,0,0.15)", border: "white"}}/>


      <UsersList
        companyId={company.id}
        reloadSignal={reloadUsersSignal}
        onAddUser={() => setShowAddUser(true)}
        onAttachUser={() => setShowAttachModal(true)}
      />


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
