// PaysInOrderRestored_OrdersLike.jsx
import "./styles.css";
import AddPaysInOrder from "./AddPayInOrder";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import PaysInOrderRestoredForOurC from "./PaysInOrderRestoredForOurC";

function RowExpanded({ item }) {
  return (
    <div className="OrderRow-expanded pastel-panel" style={{border:"0px"}} onClick={(e) => e.stopPropagation()}>
      <div className="ExpandedRow-details">
        <p><strong>Дата створення:</strong> {new Date(item.createdAt).toLocaleString()}</p>
        <p><strong>Дата оновлення:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</p>
      </div>
      <div className="OrderRow-units d-flex flex-row" style={{ gap: "0.8vw", flexWrap: "wrap" }}>
        <div className="OrderUnit-card">
          <div className="UsersOrdersLikeTable-contract-text"><strong>ID:</strong> {item.id}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Назва:</strong> {item.name || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Тип:</strong> {item.type || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Система оподаткування:</strong> {item.taxSystem || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>ПДВ:</strong> {item.pdv === "true" || item.pdv === true ? "так" : "ні"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Банк:</strong> {item.bankName || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>IBAN:</strong> {item.iban || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>ЄДРПОУ:</strong> {item.edrpou || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Телефон:</strong> {item.phone || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Email:</strong> {item.email || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Адреса:</strong> {item.address || "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Оновлено:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "···"}</div>
          <div className="UsersOrdersLikeTable-contract-text"><strong>Користувач:</strong> {item.User ? `${item.User.firstName || ""} ${item.User.lastName || ""} ${item.User.familyName || ""} (${item.User.phoneNumber || "···"})` : "···"}</div>
          {item.comment && (
            <div className="UsersOrdersLikeTable-contract-text"><strong>Коментар:</strong> {item.comment}</div>
          )}
        </div>
      </div>
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
    <div className="">
      <div className="d-flex ">{title}</div>
      {filtered.map((item, idx) => {
        const isOpen = expandedId === item.id;
        return (
          <div key={item.id} className="OrderBlock" style={{border:"0px"}}>
            <div
              className="OrderRow-summary OrderRow-hover contractors-like-cols"
              style={{border:"0px"}}
              onClick={() => setExpandedId(isOpen ? null : item.id)}
            >
              <div className="summary-cell d-flex justify-content-center contragentId" style={{border:"0px"}}>{idx + 1}</div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentName" >
                {item.name || "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentGrupa" >
                {item.taxSystem || "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentBank" >
                {item.bankName || "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentIBAN" >
                {item.iban || "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentPDV" >
                {(item.pdv === "true" || item.pdv === true) ? "+" : "-"}
              </div>

              <div
                className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentClient"
                // style={{ width: "12vw", maxWidth: "12vw" }}

              >
                {item.User
                  ? `${item.User.firstName || ""} ${item.User.lastName || ""} ${item.User.familyName || ""} (${item.User.phoneNumber || "···"})`
                  : "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentEDRPOU"  >
                {item.edrpou || "···"}
              </div>

              <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentTelephone"  >
                {item.phone || "···"}
              </div>

              <div
                className="summary-cell contragentDocu d-flex justify-content-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="adminButtonAdd" onClick={(e) => generateInvoice(e, item)}>
                  Завантажити
                </button>
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

export default function PaysInOrderRestored_OrdersLike({
                                                         showPays,
                                                         setShowPays,
                                                         thisOrder,
                                                         setThisOrder,
                                                       }) {
  const navigate = useNavigate();

  // state
  const [load, setLoad] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [showAllsOurContragents, setShowAllsOurContragents] = useState(false);

  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);

  const [showAddPay, setShowAddPay] = useState(false);
  const [showAddPayView, setShowAddPayView] = useState(false);
  const [showAddPayWriteId, setShowAddPayWriteId] = useState(false);
  const [buyerId, setBuyerId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", type: "", address: "", bankName: "", iban: "",
    edrpou: "", email: "", phone: "", taxSystem: "", pdv: "", comment: "",
  });

  const [inPageCount] = useState(500);
  const [currentPage] = useState(1);
  const [typeSelect, setTypeSelect] = useState("");
  const [thisColumn] = useState({ column: "id", reverse: true });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  // helpers
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowPays(false);
    }, 300);
  };

  const openAddPay = () => {
    setShowAddPay(!showAddPay);
    setShowAddPayView(false);
    setFormData({
      name: "", type: "", address: "", bankName: "", iban: "",
      edrpou: "", email: "", phone: "", taxSystem: "", pdv: "", comment: "",
    });
  };

  const openSeePay = (e, item) => {
    setShowAddPay(!showAddPay);
    setShowAddPayView(true);
    setShowAddPayWriteId(item.id);
    setFormData({
      name: item.name, type: item.type, address: item.address,
      bankName: item.bankName, iban: item.iban, edrpou: item.edrpou,
      email: item.email, phone: item.phone, taxSystem: item.taxSystem,
      pdv: item.pdv, comment: item.comment,
    });
  };

  const openDeletePay = (e, item) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(item);
  };

  const generateInvoice = (e, item) => {
    setBuyerId(item.id);
    e.preventDefault();
    setShowAllsOurContragents(true);
    // тут лишена логіка генерації, як у тебе
  };

  const handleAxiosError = (error) => {
    if (error.response?.status === 403) navigate("/login");
    setError(error.message);
    setLoad(false);
  };

  // data fetch
  useEffect(() => {
    if (showAddPay || showDeleteOrderModal){
      return;
    }
    const payload = {
      inPageCount,
      currentPage,
      search: typeSelect,
      columnName: thisColumn,
      startDate,
      endDate,
      clientId: thisOrder.clientId,
    };

    setLoad(true);
    axios
      .post(`/api/contractorsN/getContractors`, payload)
      .then((response) => {
        setData(response.data.rows);
        setError(null);
        setLoad(false);
      })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, showAddPay, showDeleteOrderModal]);

  // modal animation
  useEffect(() => {
    if (showPays) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showPays]);

  if (!isVisible) return null;

  return (
    <div>
      {/* overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 15, 15, 0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 99,
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 200ms ease'
        }}
      />

      {/* modal */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity .3s, transform .3s",
          backgroundColor: "#FBFAF6",
          width: "95vw",
          height: "95vh",
          borderRadius: "1vw",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          border:"0px"
        }}
      >
        {/* header */}
        <div className="d-flex" style={{border:"0px"}}>
          {thisOrder?.client && (
            <div className="m-auto text-center fontProductName">
              {/*Реквізити рахунків: {thisOrder.client.username} — {thisOrder.client.firstName} {thisOrder.client.lastName} {thisOrder.client.familyName}*/}
            </div>
          )}
          {/*<button className="btn btn-close" style={{ margin: "0.8vw", width: "1vw" , height: "1vw"}} onClick={handleClose} />*/}
        </div>

        {/* body */}
        <div style={{ padding: "1vw", border:"0px" }}>
          <div className="">
            {/*<h5 className="d-flex m-auto fw-bold">{title}</h5>*/}

            <div className="OrderList" style={{height: "auto", border:"0px"}}>
              {/* header */}
              <div className="OrderRow-summary OrderRow-header contractors-like-cols" style={{border:"0px"}}>
                <div className="summary-cell contragentId d-flex justify-content-center" >№</div>
                <div className="summary-cell contragentName" >Контрагент</div>
                <div className="summary-cell contragentGrupa" >Опод.</div>
                <div className="summary-cell contragentBank" >Банк</div>
                <div className="summary-cell contragentIBAN" >IBAN</div>
                <div className="summary-cell contragentPDV" >ПДВ</div>
                <div className="summary-cell contragentClient" >Клієнт</div>
                <div className="summary-cell contragentEDRPOU" >ЄДРПОУ</div>
                <div className="summary-cell contragentTelephone" >Тел.</div>
                <div className="summary-cell contragentDocu d-flex justify-content-center" ></div>
                <div className="summary-cell contragentDii d-flex justify-content-center" ></div>
              </div>


              {error && <div className=" mb-2">{error}</div>}

              {load ? (
                <div className="d-flex justify-content-center align-items-center" >
                  <Spinner animation="border" variant="dark" />
                </div>
              ) : (
                <div className="d-flex" >
                  <div className="d-flex flex-column" style={{border: "0px", overflow: "auto", height: "80vh"}}>
                    <Section
                      title="Контрагенти клієнта"
                      data={data}
                      filterKey="isClientOwner"
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      generateInvoice={generateInvoice}
                      openSeePay={openSeePay}
                      openDeletePay={openDeletePay}

                    />

                    <div style={{margin: "5vh 0"}}></div>

                    <Section
                      title="Загальні контрагенти компанії"
                      data={data}
                      filterKey="isCompanyOwner"
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      generateInvoice={generateInvoice}
                      openSeePay={openSeePay}
                      openDeletePay={openDeletePay}
                    />

                    <div style={{margin: "5vh "}}></div>

                    <Section
                      title="Контрагенти співробітників компанії"
                      data={data}
                      filterKey="isColleagueOwner"
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      generateInvoice={generateInvoice}
                      openSeePay={openSeePay}
                      openDeletePay={openDeletePay}
                      className="rahunkiline"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="adminButtonAdd" style={{ marginTop: "2vh" }} onClick={openAddPay}>
            Додати особистого контрагента
          </button>

          {/* nested modals */}
          {showAddPay && (
            <AddPaysInOrder
              showAddPay={showAddPay}
              setShowAddPay={setShowAddPay}
              formData={formData}
              setFormData={setFormData}
              thisOrder={thisOrder}
              setThisOrder={setThisOrder}
              data={data}
              setData={setData}
              showAddPayView={showAddPayView}
              setShowAddPayView={setShowAddPayView}
              showAddPayWriteId={showAddPayWriteId}
              setShowAddPayWriteId={setShowAddPayWriteId}
            />
          )}

          {showAllsOurContragents && (
            <PaysInOrderRestoredForOurC
              showPays={showAllsOurContragents}
              setShowPays={setShowAllsOurContragents}
              formData={formData}
              setFormData={setFormData}
              thisOrder={thisOrder}
              setThisOrder={setThisOrder}
              data={data}
              setData={setData}
              showAddPayView={showAddPayView}
              setShowAddPayView={setShowAddPayView}
              showAddPayWriteId={showAddPayWriteId}
              setShowAddPayWriteId={setShowAddPayWriteId}
              buyerId={buyerId}
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
      </div>
    </div>
  );
}
