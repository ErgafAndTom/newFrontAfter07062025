// ContrAgentsInUserProfile.jsx
import "./styles.css";
import "../../userInNewUiArtem/pays/styles.css"; // pays-tbl-btn, pays-add-btn
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import AddContrAgentInProfile from "./AddContrAgentInProfile";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";

// ── Розгорнутий рядок ─────────────────────────────────────────────
function RowExpanded({ item }) {
  return (
    <div className="cap-expanded" onClick={(e) => e.stopPropagation()}>
      <span>Створено: {new Date(item.createdAt).toLocaleString()}</span>
      {item.updatedAt && <span>Оновлено: {new Date(item.updatedAt).toLocaleString()}</span>}
    </div>
  );
}

function ContrAgentsInUserProfile({ user }) {
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
    edrpou: "", email: "", phone: "", taxSystem: "ФОП", pdv: "", comment: "",
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
    setFormData({ name: "", type: "", address: "", bankName: "", iban: "", edrpou: "", email: "", phone: "", taxSystem: "ФОП", pdv: "", comment: "" });
  };

  const openSeePay = (e, item) => {
    e.preventDefault();
    setShowAddPay(true);
    setShowAddPayView(true);
    setShowAddPayWriteId(item.id);
    setFormData({
      name: item.name || "", type: item.type || "", address: item.address || "",
      bankName: item.bankName || "", iban: item.iban || "", edrpou: item.edrpou || "",
      email: item.email || "", phone: item.phone || "",
      taxSystem: item.taxSystem || "ФОП", pdv: item.pdv, comment: item.comment || "",
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
    const payload = { inPageCount, currentPage, search: typeSelect, columnName: thisColumn, startDate, endDate, clientId: user.id };
    setLoad(true);
    axios.post(`/api/contractorsN/getContractors`, payload)
      .then((resp) => { setData(resp.data?.rows || []); setError(null); setLoad(false); })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, user?.id]); // eslint-disable-line

  const rows = Array.isArray(data) ? data.filter((x) => x?.isClientOwner) : [];

  return (
    <div className="cap-wrap">

      {/* Top bar */}
      <div className="cap-topbar">
        <button className="pays-add-btn" onClick={openAddPay}>
          + Додати контрагента
        </button>
      </div>

      {/* Шапка таблиці */}
      <div className="cap-tbl-head">
        <div className="cap-cell cap-cell--center">№</div>
        <div className="cap-cell">Найменування</div>
        <div className="cap-cell">СО</div>
        <div className="cap-cell">Банк</div>
        <div className="cap-cell">IBAN</div>
        <div className="cap-cell cap-cell--center">ПДВ</div>
        <div className="cap-cell">Клієнт</div>
        <div className="cap-cell">ЄДРПОУ</div>
        <div className="cap-cell">Дії</div>
      </div>

      {error && <div className="cap-error">{error}</div>}

      {load ? (
        <div className="cap-loader">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <>
          {rows.map((item, idx) => {
            const isOpen = expandedId === item.id;
            return (
              <div key={item.id}>
                <div
                  className={`cap-tbl-row${isOpen ? ' cap-tbl-row--open' : ''}`}
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                >
                  <div className="cap-cell cap-cell--center">{idx + 1}</div>
                  <div className="cap-cell">{item.name || '—'}</div>
                  <div className="cap-cell">{item.taxSystem || '—'}</div>
                  <div className="cap-cell">{item.bankName || '—'}</div>
                  <div className="cap-cell">{item.iban || '—'}</div>
                  <div className="cap-cell cap-cell--center">
                    {(item.pdv === 'true' || item.pdv === true) ? '+' : '—'}
                  </div>
                  <div className="cap-cell">
                    {item.User
                      ? `${item.User.firstName || ''} ${item.User.lastName || ''} ${item.User.familyName || ''} (${item.User.phoneNumber || '—'})`.trim()
                      : '—'}
                  </div>
                  <div className="cap-cell">{item.edrpou || '—'}</div>
                  <div className="cap-cell cap-cell--actions" onClick={(e) => e.stopPropagation()}>
                    <button className="pays-tbl-btn" onClick={(e) => openSeePay(e, item)}>
                      Редагувати
                    </button>
                    <button className="pays-tbl-btn pays-tbl-btn--red" onClick={(e) => openDeletePay(e, item)}>
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
        <AddContrAgentInProfile
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
        url="/api/contractorsN/deleteContractor"
      />
    </div>
  );
}

export default ContrAgentsInUserProfile;
