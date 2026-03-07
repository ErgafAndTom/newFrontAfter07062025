// PaysInOrderRestoredForOurC_OrdersLike.jsx
import "./styles.css";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import AddPaysInOrder from "./AddPayInOrder";

export default function PaysInOrderRestoredForOurC({
  showPays,
  setShowPays,
  thisOrder,
  setThisOrder,
  buyerId,
}) {
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const [inPageCount] = useState(500);
  const [currentPage] = useState(1);
  const [typeSelect] = useState("");
  const [thisColumn] = useState({ column: "id", reverse: true });
  const [startDate] = useState("");
  const [endDate] = useState("");

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setShowPays(false), 280);
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

  const generateDocInZip = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const supplierId = item?.Contractor?.id;
    if (!supplierId || !buyerId) return;
    setLoad(true);
    try {
      const docResp = await axios.post(
        `/api/invoices/from-order/${thisOrder.id}/docInZip`,
        { supplierId, buyerId },
        { responseType: "blob" }
      );
      downloadBlob(docResp, "documents.zip");
      const payResp = await axios.post("/api/payment/create-invoice-doc", {
        orderId: thisOrder.id, supplierId, buyerId,
      });
      if (payResp?.data) setThisOrder(prev => ({ ...prev, Payment: payResp.data }));
      handleClose();
    } catch (err) {
      console.error("generateDocInZip error:", err);
      handleAxiosError(err);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    const payload = { inPageCount, currentPage, search: typeSelect, columnName: thisColumn, startDate, endDate, clientId: thisOrder.clientId, buyerId };
    setLoad(true);
    axios.post(`/api/contractorsN/getPPContractorsForDoc`, payload)
      .then(resp => { setData(resp.data?.rows || []); setError(null); setLoad(false); })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, thisOrder?.clientId, buyerId]); // eslint-disable-line

  useEffect(() => {
    if (showPays) setTimeout(() => setIsAnimating(true), 20);
    else setIsAnimating(false);
  }, [showPays]);

  return (
    <>
      <div
        className={`ourc-overlay${isAnimating ? ' ourc-overlay--visible' : ''}`}
        onClick={handleClose}
      />

      <div className={`ourc-panel${isAnimating ? ' ourc-panel--visible' : ''}`}>

        {/* Header */}
        <div className="ourc-header">
          <span style={{ width: '24px' }} />
          <span className="ourc-header-title">
            Наші реквізити для замовлення №{thisOrder?.id ?? '—'}
          </span>
          <button className="ourc-close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Body */}
        <div className="ourc-body custom-scroll">

          {/* Шапка таблиці */}
          <div className="ourc-tbl-head">
            <div className="ourc-cell ourc-cell--center">№</div>
            <div className="ourc-cell">Назва</div>
            <div className="ourc-cell">Опод.</div>
            <div className="ourc-cell">Банк</div>
            <div className="ourc-cell">IBAN</div>
            <div className="ourc-cell ourc-cell--center">ПДВ</div>
            <div className="ourc-cell">Клієнт</div>
            <div className="ourc-cell">ЄДРПОУ</div>
            <div className="ourc-cell">Тел.</div>
            <div className="ourc-cell ourc-cell--center">Документи</div>
          </div>

          {error && <div className="ourc-error">{error}</div>}

          {load ? (
            <div className="ourc-loader">
              <Spinner animation="border" variant="dark" />
            </div>
          ) : (
            (data || []).map((item, idx) => {
              const c = item?.Contractor || {};
              const u = c?.User || {};
              const isOpen = expandedId === item.id;

              return (
                <div key={item.id}>
                  <div
                    className={`ourc-tbl-row${isOpen ? ' ourc-tbl-row--open' : ''}`}
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                  >
                    <div className="ourc-cell ourc-cell--center">{idx + 1}</div>
                    <div className="ourc-cell">{item.name || c.name || '—'}</div>
                    <div className="ourc-cell">{c.taxSystem || '—'}</div>
                    <div className="ourc-cell">{c.bankName || '—'}</div>
                    <div className="ourc-cell">{c.iban || '—'}</div>
                    <div className="ourc-cell ourc-cell--center">{c.pdv ? '+' : '–'}</div>
                    <div className="ourc-cell">
                      {u ? `${u.firstName || ''} ${u.lastName || ''} (${u.phoneNumber || '—'})` : '—'}
                    </div>
                    <div className="ourc-cell">{c.edrpou || '—'}</div>
                    <div className="ourc-cell">{c.phone || '—'}</div>
                    <div className="ourc-cell ourc-cell--actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="pays-tbl-btn"
                        onClick={e => {
                          e.stopPropagation();
                          setEditId(item.id);
                          setEditItem({
                            name: item.name || c.name, taxSystem: c.taxSystem,
                            bankName: c.bankName, iban: c.iban, edrpou: c.edrpou,
                            phone: c.phone, email: c.email, address: c.address,
                            pdv: c.pdv, comment: c.comment, type: c.type,
                          });
                          setShowEdit(true);
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        className="pays-tbl-btn pays-tbl-btn--green"
                        onClick={e => generateDocInZip(e, item)}
                      >
                        Сформувати
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="ourc-expanded">
                      <span>Створено: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.updatedAt && <span>Оновлено: {new Date(item.updatedAt).toLocaleString()}</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showEdit && ReactDOM.createPortal(
        <AddPaysInOrder
          showAddPay={showEdit}
          setShowAddPay={setShowEdit}
          data={data}
          setData={setData}
          showAddPayView={true}
          setShowAddPayView={setShowEdit}
          showAddPayWriteId={editId}
          setShowAddPayWriteId={setEditId}
          initialData={editItem}
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
        />,
        document.body
      )}
    </>
  );
}
