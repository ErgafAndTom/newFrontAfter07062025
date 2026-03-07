import React, { useEffect, useState } from 'react';
import './CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";
import { Link, useNavigate } from "react-router-dom";
import ModalDeleteOrder from "./ModalDeleteOrder";
import Barcode from 'react-barcode';
import { useDispatch, useSelector } from "react-redux";
import { FiFile, FiFolder, FiPhone } from 'react-icons/fi';
import { RiCalculatorLine } from 'react-icons/ri';
import TelegramAvatar from "../Messages/TelegramAvatar";
import { FaTelegramPlane } from 'react-icons/fa';
import Pagination from "../tools/Pagination";
import FiltrOrders from "./FiltrOrders";
import { searchChange } from "../../actions/searchAction";
import Loader from "../../components/calc/Loader";
import ActivatorCheckPaymentStatus from "./ActivatorCheckPaymentStatus";

const CustomOrderTable2 = () => {
  const [data, setData]           = useState(null);
  const dispatch                  = useDispatch();
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeBarcodeId, setActiveBarcodeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]         = useState(50);
  const [nowTick, setNowTick]     = useState(Date.now());

  const [sortColumn, setSortColumn]   = useState('id');
  const [sortReverse, setSortReverse] = useState(true);

  const [typeSelect, setTypeSelect] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [statuses, setStatuses] = useState({
    status0: true, status1: true, status2: true,
    status3: true, status4: true, status5: true,
  });
  const [payments, setPayments] = useState({
    payment0: true, payment1: true, payment2: true, payment3: true,
  });
  const [paymentsType, setPaymentsType] = useState({
    payment0: true, payment1: true, payment2: true, payment3: true,
  });

  const currentUser = useSelector((state) => state.auth.user);
  const search      = useSelector((state) => state.search.search);
  const navigate    = useNavigate();

  const toggleOrder = (id) => setExpandedOrderId(prev => prev === id ? null : id);
  const handleOrderClickDelete = (order) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(order);
  };

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortReverse(prev => !prev);
    } else {
      setSortColumn(col);
      setSortReverse(true);
    }
    setCurrentPage(1);
  };

  const SortArrow = ({ col }) => (
    <span className={`ort-sort-icon${sortColumn === col ? ' ort-sort-icon--active' : ''}`}>
      {sortColumn === col ? (sortReverse ? ' ↓' : ' ↑') : ' ↕'}
    </span>
  );

  useEffect(() => {
    if (!currentUser) return;
    const url = (currentUser.role === 'admin' || currentUser.role === 'operator') ? '/orders/all' : '/orders/my';
    setLoading(true);
    axios.post(url, {
      inPageCount: limit, currentPage, search,
      columnName: { column: sortColumn, reverse: sortReverse },
      startDate, endDate, statuses, payments, paymentsType,
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
  }, [
    search, currentPage, limit, currentUser?.role,
    sortColumn, sortReverse,
    startDate, endDate,
    statuses.status0, statuses.status1, statuses.status2, statuses.status3, statuses.status4, statuses.status5,
    payments.payment0, payments.payment1, payments.payment2, payments.payment3,
    paymentsType.payment0, paymentsType.payment1, paymentsType.payment2, paymentsType.payment3,
  ]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange("")); }, []); // eslint-disable-line

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resolveOrderDeadline = (order) => {
    if (!order) return null;
    if (order.deadline) return order.deadline;
    if (typeof order.finalManufacturingTime === 'string') return order.finalManufacturingTime;
    return null;
  };

  const formatDeadlineCountdown = (deadlineValue, refTime = nowTick) => {
    if (!deadlineValue) return { text: '—', exact: '' };
    const target = new Date(deadlineValue);
    if (!Number.isFinite(target.getTime())) return { text: '—', exact: '' };
    const diff = target.getTime() - refTime;
    const totalSeconds = Math.floor(Math.abs(diff) / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const chunks = [];
    if (days > 0) chunks.push(`${days}д`);
    chunks.push(`${String(hours).padStart(2,'0')}г`);
    chunks.push(`${String(minutes).padStart(2,'0')}хв`);
    chunks.push(`${String(seconds).padStart(2,'0')}с`);
    return { text: chunks.join(' '), exact: target.toLocaleString('uk-UA'), isPast: diff < 0 };
  };

  const getStatusBg = (status, isCancelled) => {
    const s = parseInt(status);
    if (isCancelled || s === -1) return 'var(--adminlightred, #fde8e5)';
    switch (s) {
      case 1: return 'var(--adminlightorange, #fef4e5)';
      case 2: return 'var(--adminlightblue, #e8ecf4)';
      case 3: return 'var(--adminlightrose, #fdeff5)';
      case 4: return 'var(--adminlightpurple, #edebf9)';
      default: return 'transparent';
    }
  };

  /* ── Бейдж оплати ── */
  const PayCell = ({ order }) => {
    const p = order.Payment;
    if (!p || p.status === null) return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--none">—</span></div>;
    if (p.status === 'CREATED') return (
      <div className="ort-cell ort-pay-cell">
        <ActivatorCheckPaymentStatus order={order} />
      </div>
    );
    if (p.status === 'PAID') {
      const labels = { terminal: 'Оплата карткою', link: 'Інтернет-оплата', cash: 'Оплата готівкою', invoice: 'Оплата рахунком' };
      return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--paid">{labels[p.method] || 'Інтернет-оплата'}</span></div>;
    }
    if (p.status === 'CANCELLED') return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--cancel">Відміна</span></div>;
    if (p.status === 'EXPIRED')   return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--expired">Протерміновано</span></div>;
    if (p.status === 'FAILED')    return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--expired">Помилка</span></div>;
    return <div className="ort-cell ort-pay-cell"><span className="ort-pay-badge ort-pay-badge--none">—</span></div>;
  };

  if (error) return <div style={{ color: 'var(--adminred)', padding: '1rem' }}>{error}</div>;

  return (
    <div className="ort-wrap">

      {/* Фільтр */}
      <FiltrOrders
        typeSelect={typeSelect}
        setTypeSelect={setTypeSelect}
        startDate={startDate}    setStartDate={setStartDate}
        endDate={endDate}        setEndDate={setEndDate}
        statuses={statuses}      setStatuses={setStatuses}
        payments={payments}      setPayments={setPayments}
        paymentsType={paymentsType} setPaymentsType={setPaymentsType}
      />

      {/* Шапка */}
      <div className="ort-tbl-head">
        <div className="ort-cell ort-cell--center ort-cell--sortable" onClick={() => handleSort('id')}>
          ID<SortArrow col="id" />
        </div>
        <div className="ort-cell ort-cell--center ort-cell--sortable" onClick={() => handleSort('status')}>
          Статус<SortArrow col="status" />
        </div>
        <div className="ort-cell ort-cell--center">Оплата</div>
        <div className="ort-cell ort-cell--center"><FaTelegramPlane size={14} /></div>
        <div className="ort-cell">Клієнт</div>
        <div className="ort-cell ort-cell--sortable" style={{ textAlign: 'center' }} onClick={() => handleSort('allPrice')}>
          Ціна<SortArrow col="allPrice" />
        </div>
        <div className="ort-cell ort-cell--center"><FiPhone size={14} /></div>
        <div className="ort-cell">Компанія</div>
        <div className="ort-cell" style={{ paddingLeft: '0.8rem' }}>Дедлайн</div>
        <div className="ort-cell ort-cell--center"><RiCalculatorLine size={14} /></div>
        <div className="ort-cell ort-cell--center"><FiFile size={14} /></div>
        <div className="ort-cell ort-cell--center"><FiFolder size={14} /></div>
        <div className="ort-cell ort-cell--center">Штрих-код</div>
      </div>

      {loading && <div className="ort-loader"><Loader /></div>}

      {data?.rows.map(order => {
        const isExpanded   = expandedOrderId === order.id;
        const isCancelled  = parseInt(order.status) === 5;
        const rowBg        = getStatusBg(order.status, isCancelled);
        const priceIsZero  = !order.allPrice || order.allPrice === '0.00' || order.allPrice === 0;
        const deadlineVal  = resolveOrderDeadline(order);
        const deadlineRef  = parseInt(order.status) === 3 ? new Date(order.updatedAt).getTime() : nowTick;
        const { text: deadlineText, isPast: deadlineIsPast } = formatDeadlineCountdown(deadlineVal, deadlineRef);
        const deadlineColor = !deadlineVal ? 'var(--admingrey)' : (deadlineIsPast ? 'var(--adminred)' : 'var(--admingreen)');

        return (
          <div key={order.id}>
            <div
              className={`ort-tbl-row${isExpanded ? ' ort-tbl-row--open' : ''}`}
              style={{ background: rowBg }}
              onClick={() => toggleOrder(order.id)}
            >
              <div className="ort-cell ort-cell--center">{order.id}</div>
              <div className="ort-cell ort-cell--status"><StatusBar item={order} /></div>
              <PayCell order={order} />
              <div className="ort-cell ort-cell--center">
                {order.client?.telegram
                  ? <TelegramAvatar link={order.client.telegram} size={38} defaultSrc="" square />
                  : '—'}
              </div>
              <div className="ort-cell">{order.client?.firstName} {order.client?.lastName}</div>
              <div className="ort-cell" style={{ color: priceIsZero ? 'var(--admingrey)' : (parseFloat(order.client?.discount) > 0 ? 'var(--admingreen)' : 'var(--adminred)'), textAlign: 'center' }}>
                {parseFloat(order.allPrice || 0).toFixed(2)}&nbsp;грн
              </div>
              <div className="ort-cell">{order.client?.phoneNumber || '—'}</div>
              <div className="ort-cell">{order.client?.Company?.companyName || order.client?.company || '—'}</div>
              <div className="ort-cell" style={{ color: deadlineColor, fontSize: 'var(--font-size-pay)', paddingLeft: '0.8rem' }} title={deadlineVal ? new Date(deadlineVal).toLocaleString('uk-UA') : ''}>
                {deadlineText}
              </div>
              <div className="ort-cell ort-cell--center" onClick={e => e.stopPropagation()}>
                <Link to={`/Orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <button className="ort-icon-btn"><RiCalculatorLine size={18} /></button>
                </Link>
              </div>
              <div className="ort-cell ort-cell--center" onClick={e => e.stopPropagation()}>
                <Link to={`/Orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <button className="ort-icon-btn"><FiFile size={17} /></button>
                </Link>
              </div>
              <div className="ort-cell ort-cell--center" onClick={e => e.stopPropagation()}>
                <Link to={`/Orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <button className="ort-icon-btn"><FiFolder size={17} /></button>
                </Link>
              </div>
              <div
                className={`ort-cell ort-barcode${activeBarcodeId === order.id ? ' ort-barcode--active' : ''}`}
                onClick={e => { e.stopPropagation(); setActiveBarcodeId(prev => prev === order.id ? null : order.id); }}
              >
                {order.barcode
                  ? <Barcode value={order.barcode.toString()} width={1.1} height={28} background="transparent" fontSize={12} displayValue={false} />
                  : '—'}
              </div>
            </div>

            {isExpanded && (
              <div className="ort-expanded" onClick={e => e.stopPropagation()}>
                <div className="ort-expanded-details">
                  {[
                    ['Дата створення',         new Date(order.createdAt).toLocaleString()],
                    ['Дата оновлення',          order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'],
                    ['Початок виготовлення',    order.manufacturingStartTime ? new Date(order.manufacturingStartTime).toLocaleString() : '—'],
                    ['Час виготовлення',        order.finalManufacturingTime && typeof order.finalManufacturingTime === 'object'
                      ? `${order.finalManufacturingTime.days}д ${order.finalManufacturingTime.hours}год ${order.finalManufacturingTime.minutes}хв`
                      : order.manufacturingStartTime ? 'В процесі' : '—'],
                    ['Дедлайн',                formatDeadlineCountdown(resolveOrderDeadline(order)).text],
                    ['Виконавець',              order.executor ? `${order.executor.firstName} ${order.executor.lastName}` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="ort-expanded-field">
                      <span className="ort-expanded-key">{k}:</span>
                      <span className="ort-expanded-val">{v || '—'}</span>
                    </div>
                  ))}
                  <div className="ort-expanded-actions">
                    <button
                      className="pays-tbl-btn pays-tbl-btn--red pays-tbl-btn--bg-element"
                      onClick={() => handleOrderClickDelete(order)}
                    >
                      Видалити
                    </button>
                  </div>
                </div>

                {order.OrderUnits?.length > 0 && (
                  <div className="ort-units">
                    {order.OrderUnits.map((unit, i) => (
                      <div key={i} className="ort-unit-card">
                        <div className="ort-unit-name">{unit.name}</div>
                        <div className="ort-unit-detail">К-сть: {unit.newField5}</div>
                        <div className="ort-unit-detail">Ціна: {unit.priceForThis} грн</div>
                        <div className="ort-unit-detail">Розмір: {unit.newField2}×{unit.newField3} мм</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url="/orders/OneOrder"
      />

      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((data.count || 1) / limit)}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          limit={limit}
        />
      )}
    </div>
  );
};

export default CustomOrderTable2;
