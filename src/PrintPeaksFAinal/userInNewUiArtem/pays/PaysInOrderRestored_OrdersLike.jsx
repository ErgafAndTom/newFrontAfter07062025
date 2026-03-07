// PaysInOrderRestored_OrdersLike.jsx
import "./styles.css";
import AddPaysInOrder from "./AddPayInOrder";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import PaysInOrderRestoredForOurC from "./PaysInOrderRestoredForOurC";
import Loader from "../../../components/calc/Loader";

// ── Розгорнутий рядок ─────────────────────────────────────────────
function RowExpanded({ item }) {
  // 3-й елемент: число = flex-grow, об'єкт = кастомний style
  const S = { flex: '0 0 1vw', maxWidth: '1vw', overflow: 'hidden' };
  const fields = [
    ['ID',        item.id,       S],
    ['Назва',     item.name,     1.2],
    ['Тип',       item.type,     S],
    ['Оподатк.',  item.taxSystem],
    ['ПДВ',       (item.pdv === 'true' || item.pdv === true) ? 'Так' : 'Ні', S],
    ['Банк',      item.bankName, 1.2],
    ['ЄДРПОУ',   item.edrpou],
    ['Телефон',   item.phone],
    ['Email',     item.email],
    ['IBAN',      item.iban,    2],
    ['Адреса',    item.address, 3],
    ['Оновлено',  item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'],
    ['Створено',  item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'],
  ];
  if (item.User) fields.push([
    'Користувач',
    [item.User.firstName, item.User.lastName, item.User.familyName, (item.User.phoneNumber || '').trim()].filter(Boolean).join(' ')
  ]);
  if (item.comment) fields.push(['Коментар', item.comment, 2]);

  return (
    <div className="pays-expanded" onClick={(e) => e.stopPropagation()}>
      {fields.map(([k, v, s]) => (
        <div
          key={k}
          className="pays-expanded-field"
          style={typeof s === 'object' ? s : { flex: `${s || 1} 0 0` }}
        >
          <span className="pays-expanded-key">{k}:</span>
          <span className="pays-expanded-val">{v || '—'}</span>
        </div>
      ))}
    </div>
  );
}

// ── Секція з рядками ──────────────────────────────────────────────
function Section({ title, data, filterKey, expandedId, setExpandedId, generateInvoice, openSeePay, openDeletePay }) {
  const filtered = Array.isArray(data) ? data.filter((x) => x?.[filterKey]) : [];

  return (
    <div className="pays-section">
      <div className="pays-section-title">{title}</div>

      {filtered.length === 0 && (
        <div className="pays-cell pays-cell--italic">—</div>
      )}

      {filtered.map((item, idx) => {
        const isOpen = expandedId === item.id;
        return (
          <div key={item.id}>
            <div
              className={`pays-tbl-row${isOpen ? ' pays-tbl-row--open' : ''}`}
              onClick={() => setExpandedId(isOpen ? null : item.id)}
            >
              <div className="pays-cell pays-cell--center">{idx + 1}</div>
              <div className="pays-cell">{item.name || '—'}</div>
              <div className="pays-cell">{item.taxSystem || '—'}</div>
              <div className="pays-cell">{item.bankName || '—'}</div>
              <div className="pays-cell">{item.iban || '—'}</div>
              <div className="pays-cell pays-cell--center">
                {(item.pdv === 'true' || item.pdv === true) ? '+' : '—'}
              </div>
              <div className="pays-cell">
                {item.User
                  ? [item.User.firstName, item.User.lastName].filter(Boolean).join(' ')
                  : '—'}
              </div>
              <div className="pays-cell">{item.edrpou || '—'}</div>
              <div className="pays-cell pays-cell--actions" onClick={(e) => e.stopPropagation()}>
                <button className="pays-tbl-btn pays-tbl-btn--green" onClick={(e) => generateInvoice(e, item)}>Сформувати рахунок</button>
                <button className="pays-tbl-btn"                     onClick={(e) => openSeePay(e, item)}>Редагувати</button>
                <button className="pays-tbl-btn pays-tbl-btn--red"   onClick={(e) => openDeletePay(e, item)}>Видалити</button>
              </div>
            </div>
            {isOpen && <RowExpanded item={item} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Головний компонент ────────────────────────────────────────────
export default function PaysInOrderRestored_OrdersLike({
  showPays, setShowPays, thisOrder, setThisOrder,
}) {
  const navigate = useNavigate();

  const [load,     setLoad]     = useState(false);
  const [data,     setData]     = useState(null);
  const [error,    setError]    = useState(null);

  const [showAllsOurContragents, setShowAllsOurContragents] = useState(false);
  const [thisOrderForDelete,     setThisOrderForDelete]     = useState(null);
  const [showDeleteOrderModal,   setShowDeleteOrderModal]   = useState(false);
  const [showAddPay,             setShowAddPay]             = useState(false);
  const [showAddPayView,         setShowAddPayView]         = useState(false);
  const [showAddPayWriteId,      setShowAddPayWriteId]      = useState(false);
  const [buyerId,                setBuyerId]                = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: '', address: '', bankName: '', iban: '',
    edrpou: '', email: '', phone: '', taxSystem: '', pdv: '', comment: '',
  });

  const [inPageCount]  = useState(500);
  const [currentPage]  = useState(1);
  const [typeSelect,   setTypeSelect]   = useState('');
  const [thisColumn]   = useState({ column: 'id', reverse: true });
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');

  const [isVisible,    setIsVisible]    = useState(false);
  const [isAnimating,  setIsAnimating]  = useState(false);
  const [expandedId,   setExpandedId]   = useState(null);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => { setIsVisible(false); setShowPays(false); }, 250);
  };

  const openAddPay = () => {
    setShowAddPay(!showAddPay);
    setShowAddPayView(false);
    setFormData({ name: '', type: '', address: '', bankName: '', iban: '', edrpou: '', email: '', phone: '', taxSystem: '', pdv: '', comment: '' });
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
  };

  const handleAxiosError = (error) => {
    if (error.response?.status === 403) navigate('/login');
    setError(error.message);
    setLoad(false);
  };

  useEffect(() => {
    const payload = {
      inPageCount, currentPage,
      search: typeSelect,
      columnName: thisColumn,
      startDate, endDate,
      clientId: thisOrder.clientId,
    };
    setLoad(true);
    axios.post('/api/contractorsN/getContractors', payload)
      .then((res) => { setData(res.data.rows); setError(null); setLoad(false); })
      .catch(handleAxiosError);
  }, [typeSelect, thisColumn, startDate, endDate, showAddPay]); // eslint-disable-line

  useEffect(() => {
    if (showPays) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 30);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 250);
    }
  }, [showPays]);

  if (!isVisible) return null;

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`pays-overlay${isAnimating ? ' pays-overlay--visible' : ''}`}
        onClick={handleClose}
      />

      {/* ── Панель ── */}
      <div className={`pays-panel${isAnimating ? ' pays-panel--visible' : ''}`}>

        {/* Content */}
        <div className="pays-content custom-scroll">

          {/* Топбар */}
          <div className="pays-topbar">
            <button className="pays-add-btn" onClick={openAddPay}>
              + Додати особистого контрагента
            </button>
          </div>

          {/* Заголовок таблиці */}
          <div className="pays-tbl-head">
            <div className="pays-cell-label">№</div>
            <div className="pays-cell-label">Контрагент</div>
            <div className="pays-cell-label">Опод.</div>
            <div className="pays-cell-label">Банк</div>
            <div className="pays-cell-label">IBAN</div>
            <div className="pays-cell-label">ПДВ</div>
            <div className="pays-cell-label">Клієнт</div>
            <div className="pays-cell-label">ЄДРПОУ</div>
            <div className="pays-cell-label">ДІЯ</div>
          </div>

          {error && <div className="pays-error">{error}</div>}

          {load ? (
            <div className="pays-loader"><Loader /></div>
          ) : (
            <>
              <Section title="Контрагенти клієнта"                 data={data} filterKey="isClientOwner"       expandedId={expandedId} setExpandedId={setExpandedId} generateInvoice={generateInvoice} openSeePay={openSeePay} openDeletePay={openDeletePay} />
              <Section title="Загальні контрагенти компанії"       data={data} filterKey="isCompanyOwner"      expandedId={expandedId} setExpandedId={setExpandedId} generateInvoice={generateInvoice} openSeePay={openSeePay} openDeletePay={openDeletePay} />
              <Section title="Контрагенти співробітників компанії" data={data} filterKey="isColleagueOwner"    expandedId={expandedId} setExpandedId={setExpandedId} generateInvoice={generateInvoice} openSeePay={openSeePay} openDeletePay={openDeletePay} />
            </>
          )}
        </div>
      </div>

      {/* Вкладені модали */}
      {showAddPay && ReactDOM.createPortal(
        <AddPaysInOrder
          key={showAddPayWriteId || 'add'}
          showAddPay={showAddPay}
          setShowAddPay={setShowAddPay}
          initialData={showAddPayView ? formData : null}
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          data={data}
          setData={setData}
          showAddPayView={showAddPayView}
          setShowAddPayView={setShowAddPayView}
          showAddPayWriteId={showAddPayWriteId}
          setShowAddPayWriteId={setShowAddPayWriteId}
        />,
        document.body
      )}

      {showAllsOurContragents && ReactDOM.createPortal(
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
        />,
        document.body
      )}

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url="/api/contractorsN/deleteContractor"
        title={`Видалити контрагента №${thisOrderForDelete?.id || '—'}?`}
        subLabel={thisOrderForDelete?.name || '—'}
        showTotal={false}
      />
    </>
  );
}
