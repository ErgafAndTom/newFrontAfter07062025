// PaysInOrderRestoredForOurC_OrdersLike.jsx
import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

function RowExpanded({ item }) {
  const c = item?.Contractor || {};
  const u = c?.User || {};
  return (
    <div className="OrderRow-expanded pastel-panel" onClick={(e) => e.stopPropagation()}>
      <div className="OrderRow-units d-flex flex-row" style={{ gap: "0.8vw", flexWrap: "wrap" }}>
        <div className="ExpandedRow-details">
          <p><strong>Дата створення:</strong> {new Date(item.createdAt).toLocaleString()}</p>
          <p><strong>Дата оновлення:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</p>
        </div>
        {/*<div className="OrderUnit-card">*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>ID (row):</strong> {item.id}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Відображене імʼя:</strong> {item.name || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>ID (Contractor):</strong> {c.id ?? "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Назва Contractor:</strong> {c.name || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Тип:</strong> {c.type || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Система оподаткування:</strong> {c.taxSystem || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>ПДВ:</strong> {c.pdv ? "так" : "ні"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Банк:</strong> {c.bankName || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>IBAN:</strong> {c.iban || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>ЄДРПОУ/ІПН:</strong> {c.edrpou || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Телефон:</strong> {c.phone || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Email:</strong> {c.email || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text"><strong>Адреса:</strong> {c.address || "—"}</div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text">*/}
        {/*    <strong>Оновлено:</strong>{" "}*/}
        {/*    {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}*/}
        {/*  </div>*/}
        {/*  <div className="UsersOrdersLikeTable-contract-text">*/}
        {/*    <strong>Користувач:</strong>{" "}*/}
        {/*    {u ? `${u.firstName || ""} ${u.lastName || ""} ${u.familyName || ""} (${u.phoneNumber || "—"})` : "—"}*/}
        {/*  </div>*/}
        {/*  {c.comment && (*/}
        {/*    <div className="UsersOrdersLikeTable-contract-text"><strong>Коментар:</strong> {c.comment}</div>*/}
        {/*  )}*/}
        {/*</div>*/}
      </div>
    </div>
  );
}

export default function PaysInOrderRestoredForOurC({
                                                     showPays,
                                                     setShowPays,
                                                     thisOrder,
                                                     setThisOrder, // не використовується тут, лишаю для сумісності API
                                                     buyerId,
                                                   }) {
  const navigate = useNavigate();

  // state
  const [load, setLoad] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // пагінація/фільтри як у вихідному компоненті
  const [inPageCount] = useState(500);
  const [currentPage] = useState(1);
  const [typeSelect] = useState("");
  const [thisColumn] = useState({ column: "id", reverse: true });
  const [startDate] = useState("");
  const [endDate] = useState("");

  // анімація модалки
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // розгортання
  const [expandedId, setExpandedId] = useState(null);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowPays(false);
    }, 300);
  };

  const handleAxiosError = (err) => {
    if (err.response?.status === 403) navigate("/login");
    setError(err.message || "Помилка запиту");
    setLoad(false);
  };

  const downloadBlob = (response, fallbackName) => {
    const cd = response.headers?.["content-disposition"];
    let fileName = fallbackName;
    if (cd) {
      const m = cd.match(/filename="(.+)"/);
      if (m?.[1]) fileName = m[1];
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const generateDocInZip = (e, item) => {
    e.preventDefault();
    const supplierId = item?.Contractor?.id;
    if (!supplierId || !buyerId) return;

    setLoad(true);
    axios
      .post(
        `/api/invoices/from-order/${thisOrder.id}/docInZip`,
        { supplierId, buyerId },
        { responseType: "blob" }
      )
      .then((resp) => downloadBlob(resp, "documents.zip"))
      .catch(handleAxiosError)
      .finally(() => setLoad(false));
  };

  // fetch
  useEffect(() => {
    const payload = {
      inPageCount,
      currentPage,
      search: typeSelect,
      columnName: thisColumn,
      startDate,
      endDate,
      clientId: thisOrder.clientId,
      buyerId,
    };

    setLoad(true);
    axios
      .post(`/api/contractorsN/getPPContractorsForDoc`, payload)
      .then((resp) => {
        setData(resp.data?.rows || []);
        setError(null);
        setLoad(false);
      })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, thisOrder?.clientId, buyerId]);

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
          width: "150vw",
          height: "150vh",
          position: "fixed",
          left: "-5vw",
          top: "-5vh",
          background: "rgba(0,0,0,0.2)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity .3s ease-in-out",
          zIndex: 100,
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
          height: "90vh",
          borderRadius: "1vw",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div className="d-flex">
          <div className="m-auto text-center fontProductName">
            Наші реквізити для виставлення рахунку для замовлення №{thisOrder?.id ?? "—"}
          </div>
          {/*<button className="btn btn-close" style={{ margin: "0.8vw", width: "1vw", height: "1vw" }} onClick={handleClose} />*/}
        </div>

        {/* body */}
        <div style={{ padding: "1vw", overflow: "auto" }}>
          {/* таблиця-шапка */}
          <div className="OrderList" style={{ height: "auto" }}>
            <div className="OrderRow-summary OrderRow-header contractors-like-cols">
              <div className="summary-cell contragentId d-flex justify-content-center" >№</div>
              <div className="summary-cell contragentName" >Назва</div>
              <div className="summary-cell contragentGrupa" >Опод.</div>
              <div className="summary-cell contragentBank" >Банк</div>
              <div className="summary-cell contragentIBAN" >IBAN</div>
              <div className="summary-cell contragentPDV" >ПДВ</div>
              <div className="summary-cell contragentClient" >Клієнт</div>
              <div className="summary-cell contragentEDRPOU" >ЄДРПОУ</div>
              <div className="summary-cell contragentTelephone" >Тел.</div>
              <div className="summary-cell contragentDocu d-flex justify-content-center" >Документи</div>
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            {load ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="dark" />
              </div>
            ) : (
              <div className="d-flex flex-column">
                {(data || []).map((item, idx) => {
                  const c = item?.Contractor || {};
                  const u = c?.User || {};
                  const isOpen = expandedId === item.id;

                  return (
                    <div key={item.id} className="OrderBlock">
                      <div
                        className="OrderRow-summary OrderRow-hover contractors-like-cols"
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                      >
                        <div className="summary-cell d-flex justify-content-center contragentId" >
                          {idx + 1}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentName" >
                          {item.name || c.name || "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentGrupa" >
                          {c.taxSystem || "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentBank" >
                          {c.bankName || "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentIBAN" >
                          {c.iban || "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentPDV" >
                          {c.pdv ? "+" : "-"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentClient" >
                          {u ? `${u.firstName || ""} ${u.lastName || ""} ${u.familyName || ""} (${u.phoneNumber || "—"})` : "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentEDRPOU" >
                          {c.edrpou || "—"}
                        </div>

                        <div className="summary-cell UsersOrdersLikeTable-contract-text-multiline contragentTelephone" >
                          {c.phone || "—"}
                        </div>

                        <div
                          className="summary-cell contragentDocu d-flex justify-content-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="adminButtonAdd" onClick={(e) => generateDocInZip(e, item)}>
                            Завантажити ZIP
                          </button>
                        </div>
                      </div>

                      {isOpen && <RowExpanded item={item} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
