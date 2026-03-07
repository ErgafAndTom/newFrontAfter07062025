// PaysInOrderRestoredForAdmin_StyledLikeRef.jsx
import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import AddContrAgentInProfileAdmin from "./AddContrAgentInProfileAdmin";

// ── Розгорнутий рядок ─────────────────────────────────────────────
function RowExpanded({ item }) {
  return (
    <div className="admin-expanded" onClick={(e) => e.stopPropagation()}>
      <span>Створено: {new Date(item.createdAt).toLocaleString()}</span>
      {item.updatedAt && <span>Оновлено: {new Date(item.updatedAt).toLocaleString()}</span>}
    </div>
  );
}

export default function PaysInOrderRestoredForAdmin({ user }) {
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);

  const [showAddPay, setShowAddPay] = useState(false);
  const [showAddPayView, setShowAddPayView] = useState(false);
  const [showAddPayWriteId, setShowAddPayWriteId] = useState(false);
  const [formData, setFormData] = useState({
    name: "", type: "", address: "", bankName: "", iban: "",
    edrpou: "", email: "", phone: "", taxSystem: "", pdv: "",
    comment: "", contractorId: "", contractorName: "",
  });

  const [inPageCount] = useState(500);
  const [currentPage] = useState(1);
  const [typeSelect] = useState("");
  const [thisColumn] = useState({ column: "id", reverse: true });
  const [startDate] = useState("");
  const [endDate] = useState("");

  const openAddPay = () => {
    setShowAddPay(true);
    setShowAddPayView(false);
    setShowAddPayWriteId(false);
    setFormData({
      name: "", type: "", address: "", bankName: "", iban: "",
      edrpou: "", email: "", phone: "", taxSystem: "", pdv: "",
      comment: "", contractorId: "", contractorName: "",
    });
  };

  const openSeePay = (e, item) => {
    e.preventDefault();
    setShowAddPay(true);
    setShowAddPayView(true);
    setShowAddPayWriteId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      contractorId: item.id,
      contractorName: item?.Contractor?.name || "",
    });
  };

  const openDeletePay = (e, item) => {
    e.preventDefault();
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(item);
  };

  const handleAxiosError = (err) => {
    if (err.response?.status === 403) navigate("/login");
    setError(err.message || "Помилка запиту");
    setLoad(false);
  };

  useEffect(() => {
    const payload = { inPageCount, currentPage, search: typeSelect, columnName: thisColumn, startDate, endDate };
    setLoad(true);
    axios.post(`/api/contractorsN/getPPContractors`, payload)
      .then((resp) => { setData(resp.data?.rows || []); setError(null); setLoad(false); })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate]); // eslint-disable-line

  return (
    <div className="admin-wrap">

      {/* Top bar */}
      <div className="admin-topbar">
        <button className="pays-add-btn" onClick={openAddPay}>
          + Додати рахунок на який сплачується
        </button>
      </div>

      {/* Шапка таблиці */}
      <div className="admin-tbl-head">
        <div className="admin-cell admin-cell--center">№</div>
        <div className="admin-cell">Назва</div>
        <div className="admin-cell">С/О</div>
        <div className="admin-cell">IBAN</div>
        <div className="admin-cell admin-cell--center">ПДВ</div>
        <div className="admin-cell">Клієнт</div>
        <div className="admin-cell">Оновлено</div>
        <div className="admin-cell">Дії</div>
      </div>

      {error && <div className="pays-error">{error}</div>}

      {load ? (
        <div className="pays-loader">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <>
          {Array.isArray(data) && data.map((item, idx) => {
            const c = item?.Contractor || {};
            const u = c?.User || {};
            const isOpen = expandedId === item.id;
            return (
              <div key={item.id}>
                <div
                  className={`admin-tbl-row${isOpen ? ' admin-tbl-row--open' : ''}`}
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                >
                  <div className="admin-cell admin-cell--center">{idx + 1}</div>
                  <div className="admin-cell">{c.name || '—'}</div>
                  <div className="admin-cell">{c.taxSystem || '—'}</div>
                  <div className="admin-cell">{c.iban || '—'}</div>
                  <div className="admin-cell admin-cell--center">{c.pdv ? '+' : '—'}</div>
                  <div className="admin-cell">
                    {u ? `${u.firstName || ''} ${u.lastName || ''} ${u.familyName || ''} (${u.phoneNumber || '—'})`.trim() : '—'}
                  </div>
                  <div className="admin-cell">
                    {item.updatedAt
                      ? `${new Date(item.updatedAt).toLocaleDateString()} ${new Date(item.updatedAt).toLocaleTimeString()}`
                      : '—'}
                  </div>
                  <div className="admin-cell admin-cell--actions" onClick={e => e.stopPropagation()}>
                    <button className="pays-tbl-btn" onClick={e => openSeePay(e, item)}>
                      Редагувати
                    </button>
                    <button className="pays-tbl-btn pays-tbl-btn--red" onClick={e => openDeletePay(e, item)}>
                      Видалити
                    </button>
                  </div>
                </div>
                {isOpen && <RowExpanded item={item} />}
              </div>
            );
          })}
        </>
      )}

      {showAddPay && (
        <AddContrAgentInProfileAdmin
          showAddPay={showAddPay}
          setShowAddPay={setShowAddPay}
          formData={formData}
          setFormData={setFormData}
          user={user}
          data={data}
          setData={setData}
          showAddPayView={showAddPayView}
          setShowAddPayView={setShowAddPayView}
          showAddPayWriteId={showAddPayWriteId}
          setShowAddPayWriteId={setShowAddPayWriteId}
        />
      )}

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url="/api/contractorsN/deletePPContractor"
      />
    </div>
  );
}
