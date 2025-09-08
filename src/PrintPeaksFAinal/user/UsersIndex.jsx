import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner, Button, Form } from "react-bootstrap";
import axios from "../../api/axiosInstance";
import TelegramAvatar from "../Messages/TelegramAvatar";

export default function UsersIndex() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/users`, {
        currentPage: page, inPageCount: limit, search: q
      });
      setRows(data.rows || []);
      setCount(data.count || 0);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [page, limit]);
  useEffect(()=>{
    const t = setTimeout(()=>{ setPage(1); load(); }, 300);
    return ()=>clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const totalPages = useMemo(()=>Math.max(1, Math.ceil(count/limit)), [count, limit]);

  return (
    <div className="container-fluid" style={{padding:"1rem"}}>
      <div className="d-flex align-items-center" style={{gap:"0.6rem"}}>
        <h3 style={{margin:0}}>Користувачі</h3>
        <div className="ms-auto d-flex align-items-center" style={{gap:"0.6rem"}}>
          <Form.Control
            placeholder="Пошук користувачів"
            value={q} onChange={e=>setQ(e.target.value)} style={{width: "28vw"}}
          />
          <Form.Select value={limit} onChange={e=>setLimit(Number(e.target.value))} style={{width:90}}>
            <option>10</option><option>25</option><option>50</option><option>100</option>
          </Form.Select>
          <Button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</Button>
          <div>{page}/{totalPages}</div>
          <Button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>›</Button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{height:"40vh"}}>
          <Spinner animation="border" variant="dark"/>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-3">Нічого не знайдено</div>
      ) : (
        <div className="d-flex flex-wrap mt-3" style={{gap:"0.8rem"}}>
          {rows.map(u=>(
            <div key={u.id} className="p-2" style={{width:"23vw", border:"1px solid #ddd", borderRadius:8, background:"#fbfaf6"}}>
              <div className="d-flex align-items-center" style={{gap:"0.6rem"}}>
                <TelegramAvatar link={u.telegram} size={48}/>
                <div>
                  <div style={{fontWeight:600}}>{u.firstName} {u.familyName}</div>
                  <div style={{fontSize:12, opacity:0.7}}>id: {u.id}</div>
                </div>
              </div>
              <div style={{fontSize:14, marginTop:6}}>
                {u.phoneNumber || "—"} · {u.email || "—"}
              </div>
              <div style={{fontSize:12, opacity:0.8}}>{u.address || ""}</div>
              <div style={{fontSize:12, opacity:0.8, marginTop:4}}>
                Компанія: {u.Company?.companyName || (u.companyId ? `#${u.companyId}` : "—")}
              </div>
              <div className="d-flex mt-2" style={{gap:"0.5rem"}}>
                <Link to={`/Users/${u.id}`} className="adminButtonAddOrder" style={{textDecoration:"none"}}>Профіль</Link>
                <Link to={`/Orders/create?userId=${u.id}`} className="adminButtonAddOrder" style={{textDecoration:"none"}}>Нове замовлення</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
