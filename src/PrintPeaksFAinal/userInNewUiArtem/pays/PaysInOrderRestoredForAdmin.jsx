// PaysInOrderRestoredForAdmin_StyledLikeRef.jsx
import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import AddContrAgentInProfileAdmin from "./AddContrAgentInProfileAdmin";

function RowExpanded({ item }) {
  const c = item?.Contractor || {};
  const u = c?.User || {};
  return (
    <div className="OrderRow-expanded pastel-panel" onClick={(e) => e.stopPropagation()}>
      <div className="ExpandedRow-details">
        <p><strong>Створено:</strong> {new Date(item.createdAt).toLocaleString()}</p>
        <p><strong>Оновлено:</strong> {new Date(item.updatedAt).toLocaleString()}</p>
      </div>
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
    name: "",
    type: "",
    address: "",
    bankName: "",
    iban: "",
    edrpou: "",
    email: "",
    phone: "",
    taxSystem: "",
    pdv: "",
    comment: "",
    contractorId: "",
    contractorName: "",
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
      name: "",
      type: "",
      address: "",
      bankName: "",
      iban: "",
      edrpou: "",
      email: "",
      phone: "",
      taxSystem: "",
      pdv: "",
      comment: "",
      contractorId: "",
      contractorName: "",
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
    const payload = {
      inPageCount,
      currentPage,
      search: typeSelect,
      columnName: thisColumn,
      startDate,
      endDate,
    };

    setLoad(true);
    axios
      .post(`/api/contractorsN/getPPContractors`, payload)
      .then((resp) => {
        setData(resp.data?.rows || []);
        setError(null);
        setLoad(false);
      })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate]);

  return (
    <div
      className="OrderList"
      style={{
        backgroundColor: "#FBFAF6",
        borderRadius: "1vw",
        padding: "1vw",
        width: "100%",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fontProductName">Контрагенти для Доків (Admin)</div>
        <button className="adminButtonAdd" onClick={openAddPay}>
          Додати контрагента
        </button>
      </div>

      {/* header */}
      <div className="OrderRow-summary OrderRow-header contractors-like-cols">
        <div className="summary-cell contragentId d-flex justify-content-center" style={{ fontSize: "0.7vw" }}>№</div>
        <div className="summary-cell contragentName" style={{ fontSize: "0.7vw" }}>Найменування (PP)</div>
        <div className="summary-cell contragentName" style={{ fontSize: "0.7vw" }}>Contractor</div>
        <div className="summary-cell contragentGrupa" style={{ fontSize: "0.7vw" }}>Система оподаткування</div>
        <div className="summary-cell contragentTelephone" style={{ fontSize: "0.7vw" }}>Тел.</div>
        <div className="summary-cell contragentTelephone" style={{ fontSize: "0.7vw" }}>E-mail</div>
        <div className="summary-cell contragentPDV" style={{ fontSize: "0.7vw" }}>ПДВ</div>
        <div className="summary-cell contragentClient" style={{ fontSize: "0.7vw" }}>Клієнт</div>
        <div className="summary-cell contragentEDRPOU" style={{ fontSize: "0.7vw" }}>Оновлено</div>
        <div className="summary-cell contragentDii d-flex justify-content-center" style={{ fontSize: "0.7vw" }}>Дії</div>
      </div>

      {error && <div className="text-danger mb-2">{error}</div>}

      {load ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 240 }}>
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <div className="d-flex flex-column">
          {Array.isArray(data) && data.map((item, idx) => {
            const c = item?.Contractor || {};
            const u = c?.User || {};
            const isOpen = expandedId === item.id;
            return (
              <div key={item.id} className="OrderBlock">
                <div
                  className="OrderRow-summary OrderRow-hover contractors-like-cols"
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                >
                  <div className="summary-cell contragentId d-flex justify-content-center" style={{ fontSize: "0.5vw" }}>
                    {idx + 1}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentName" style={{ fontSize: "0.5vw" }}>
                    {item.name || "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentName" style={{ fontSize: "0.5vw" }}>
                    {c.name || "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentGrupa" style={{ fontSize: "0.5vw" }}>
                    {c.taxSystem || "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentTelephone" style={{ fontSize: "0.5vw" }}>
                    {c.phone || "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentTelephone" style={{ fontSize: "0.5vw" }}>
                    {c.email || "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentPDV" style={{ fontSize: "0.5vw" }}>
                    {c.pdv ? "+" : "-"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentClient" style={{ fontSize: "0.5vw" }}>
                    {u ? `${u.firstName || ""} ${u.lastName || ""} ${u.familyName || ""} (${u.phoneNumber || "—"})` : "—"}
                  </div>

                  <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentEDRPOU" style={{ fontSize: "0.5vw" }}>
                    {item.updatedAt ? `${new Date(item.updatedAt).toLocaleDateString()} ${new Date(item.updatedAt).toLocaleTimeString()}` : "—"}
                  </div>

                  <div
                    className="summary-cell contragentDii d-flex justify-content-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="adminButtonAdd" onClick={(e) => openSeePay(e, item)}>
                      Переглянути/Редагувати
                    </button>
                    <button
                      className="adminButtonAdd"
                      style={{ background: "#ff5d5d", marginLeft: 8 }}
                      onClick={(e) => openDeletePay(e, item)}
                    >
                      Видалити
                    </button>
                  </div>
                </div>

                {isOpen && <RowExpanded item={item} />}
              </div>
            );
          })}
        </div>
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
