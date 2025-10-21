// ContrAgentsInUserProfile_StyledLikeRef.jsx
import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import AddContrAgentInProfile from "./AddContrAgentInProfile";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";

function RowExpanded({ item }) {
  return (
    <div className="OrderRow-expanded pastel-panel" onClick={(e) => e.stopPropagation()}>
      <div className="ExpandedRow-details">
        <p><strong>Дата створення:</strong> {new Date(item.createdAt).toLocaleString()}</p>
        <p><strong>Дата оновлення:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</p>
      </div>
      {/*<div className="OrderRow-units d-flex flex-row" style={{ gap: "0.8vw", flexWrap: "wrap" }}>*/}
      {/*  <div className="OrderUnit-card">*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>ID:</strong> {item.id}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Назва:</strong> {item.name || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Тип:</strong> {item.type || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Система оподаткування:</strong> {item.taxSystem || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>ПДВ:</strong> {item.pdv === "true" || item.pdv === true ? "так" : "ні"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Банк:</strong> {item.bankName || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>IBAN:</strong> {item.iban || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>ЄДРПОУ:</strong> {item.edrpou || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Телефон:</strong> {item.phone || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Email:</strong> {item.email || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Адреса:</strong> {item.address || "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Оновлено:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</div>*/}
      {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Користувач:</strong> {item.User ? `${item.User.firstName || ""} ${item.User.lastName || ""} ${item.User.familyName || ""} (${item.User.phoneNumber || "—"})` : "—"}</div>*/}
      {/*    {item.comment && (*/}
      {/*      <div className="UsersOrdersLikeTable-contract-text"><strong>Коментар:</strong> {item.comment}</div>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}

function Section({
                   title,
                   data,
                   filterKey,
                   expandedId,
                   setExpandedId,
                   generateInvoice,
                   openSeePay,
                   openDeletePay,
                 }) {
  const filtered = Array.isArray(data) ? data.filter((x) => x?.[filterKey]) : [];

  return (
    <div className="mb-2">
      <h5 className="d-flex m-auto fw-bold">{title}</h5>
      {filtered.map((item, idx) => {
        const isOpen = expandedId === item.id;
        return (
          <div key={item.id} className="OrderBlock">
            <div
              className="OrderRow-summary OrderRow-hover contractors-like-cols"
              onClick={() => setExpandedId(isOpen ? null : item.id)}
            >
              <div className="summary-cell d-flex justify-content-center contragentId" style={{fontSize: "0.5vw"}}>{idx + 1}</div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentName" style={{fontSize: "0.5vw"}}>
                {item.name || "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentGrupa" style={{fontSize: "0.5vw"}}>
                {item.taxSystem || "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentBank" style={{fontSize: "0.5vw"}}>
                {item.bankName || "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentIBAN" style={{fontSize: "0.5vw"}}>
                {item.iban || "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentPDV" style={{fontSize: "0.5vw"}}>
                {(item.pdv === "true" || item.pdv === true) ? "+" : "-"}
              </div>

              <div
                className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentClient"
                // style={{ width: "12vw", maxWidth: "12vw" }}
                style={{fontSize: "0.5vw"}}
              >
                {item.User
                  ? `${item.User.firstName || ""} ${item.User.lastName || ""} ${item.User.familyName || ""} (${item.User.phoneNumber || "—"})`
                  : "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentEDRPOU"  style={{fontSize: "0.5vw"}}>
                {item.edrpou || "—"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentTelephone"  style={{fontSize: "0.5vw"}}>
                {item.phone || "—"}
              </div>

              <div
                className="summary-cell contragentDii d-flex justify-content-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="adminButtonAdd" onClick={(e) => openSeePay(e, item)}>
                  Редагувати
                </button>
                <button
                  className="adminButtonAdd"
                  style={{ background: "#ee3c23", marginLeft: 8 }}
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
  );
}

function ContrAgentsInUserProfile({ user }) {
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);

  const [showAddPay, setShowAddPay] = useState(false);
  const [showAddPayView, setShowAddPayView] = useState(false);
  const [showAddPayWriteId, setShowAddPayWriteId] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    bankName: "",
    iban: "",
    edrpou: "",
    email: "",
    phone: "",
    taxSystem: "ФОП",
    pdv: "",
    comment: "",
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
      taxSystem: "ФОП",
      pdv: "",
      comment: "",
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
      address: item.address,
      bankName: item.bankName,
      iban: item.iban,
      edrpou: item.edrpou,
      email: item.email,
      phone: item.phone,
      taxSystem: item.taxSystem,
      pdv: item.pdv,
      comment: item.comment,
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
      clientId: user.id,
    };

    setLoad(true);
    axios
      .post(`/api/contractorsN/getContractors`, payload)
      .then((resp) => {
        setData(resp.data?.rows || []);
        setError(null);
        setLoad(false);
      })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, user?.id]);

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
        <div className="fontProductName">Контрагенти користувача</div>
        <button className="adminButtonAdd" onClick={openAddPay}>
          Додати контрагента
        </button>
      </div>

      {/* header */}
      <div className="OrderRow-summary OrderRow-header contractors-like-cols">
        <div className="summary-cell contragentId d-flex justify-content-center" style={{fontSize: "0.7vw"}}>№</div>
        <div className="summary-cell contragentName" style={{fontSize: "0.7vw"}}>Найменування1</div>
        <div className="summary-cell contragentGrupa" style={{fontSize: "0.7vw"}}>Система оподаткування</div>
        <div className="summary-cell contragentBank" style={{fontSize: "0.7vw"}}>Банк</div>
        <div className="summary-cell contragentIBAN" style={{fontSize: "0.7vw"}}>IBAN</div>
        <div className="summary-cell contragentPDV" style={{fontSize: "0.7vw"}}>ПДВ</div>
        <div className="summary-cell contragentClient" style={{fontSize: "0.7vw"}}>Клієнт</div>
        <div className="summary-cell contragentEDRPOU" style={{fontSize: "0.7vw"}}>ЄДРПОУ</div>
        <div className="summary-cell contragentTelephone" style={{fontSize: "0.7vw"}}>Тел.</div>
        {/*<div className="summary-cell contragentDocu d-flex justify-content-center" style={{fontSize: "0.7vw"}}>Документи</div>*/}
        <div className="summary-cell contragentDii d-flex justify-content-center" style={{fontSize: "0.7vw"}}>Дії</div>
      </div>

      {error && <div className="text-danger mb-2">{error}</div>}

      {load ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 240 }}>
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <div className="d-flex flex-column">
          <Section
            title="Особисті Контрагенти"
            data={data}
            filterKey="isClientOwner"
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            openSeePay={openSeePay}
            openDeletePay={openDeletePay}
          />

          <hr className="my-2" />

          {/*<Section*/}
          {/*  title="Контрагенти спільні у компанії"*/}
          {/*  data={data}*/}
          {/*  filterKey="isCompanyOwner"*/}
          {/*  expandedId={expandedId}*/}
          {/*  setExpandedId={setExpandedId}*/}
          {/*  openSeePay={openSeePay}*/}
          {/*  openDeletePay={openDeletePay}*/}
          {/*/>*/}

          {/*<hr className="my-2" />*/}

          {/*<Section*/}
          {/*  title="Особисті контрагенти інших учасників компанії"*/}
          {/*  data={data}*/}
          {/*  filterKey="isColleagueOwner"*/}
          {/*  expandedId={expandedId}*/}
          {/*  setExpandedId={setExpandedId}*/}
          {/*  openSeePay={openSeePay}*/}
          {/*  openDeletePay={openDeletePay}*/}
          {/*/>*/}
        </div>
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
