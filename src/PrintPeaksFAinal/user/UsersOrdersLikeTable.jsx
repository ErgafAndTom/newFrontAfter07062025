import React, { useEffect, useState } from 'react';
import './UsersOrdersLikeTable.css';
import '../../PrintPeaksFAinal/userInNewUiArtem/pays/styles.css'; // pays-tbl-btn
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";
import { useDispatch, useSelector } from "react-redux";
import TelegramAvatar from "../Messages/TelegramAvatar";
import { FaTelegramPlane } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import Pagination from "../tools/Pagination";
import Loader from "../../components/calc/Loader";
import { Settings } from "lucide-react";
import { searchChange } from "../../actions/searchAction";
import ClientCabinet from "../userInNewUiArtem/ClientCabinet";

const UsersOrdersLikeTable = () => {
  const [data, setData]           = useState(null);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit]                   = useState(100);
  const [cabinetUserId, setCabinetUserId] = useState(null);
  const [sortColumn, setSortColumn]   = useState('id');
  const [sortReverse, setSortReverse] = useState(true);

  const dispatch    = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const search      = useSelector((state) => state.search.search);
  const navigate    = useNavigate();

  const toggleRow = (id) => setExpandedOrderId(prev => (prev === id ? null : id));

  const handleDelete = (order) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(order);
  };

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortReverse(prev => !prev);
    } else {
      setSortColumn(col);
      setSortReverse(true); // перший клік — DESC (більше → менше)
    }
    setCurrentPage(1);
  };

  const SortArrow = ({ col }) => (
    <span className={`uol-sort-icon${sortColumn === col ? ' uol-sort-icon--active' : ''}`}>
      {sortColumn === col ? (sortReverse ? ' ↓' : ' ↑') : ' ↕'}
    </span>
  );

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    axios.post('/api/user/all', {
      inPageCount: limit,
      currentPage,
      search,
      columnName: { column: sortColumn, reverse: sortReverse },
      startDate: '',
      endDate: '',
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
  }, [search, currentPage, sortColumn, sortReverse, currentUser?.role]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange('')); }, []); // eslint-disable-line

  if (error) return <div style={{ color: 'var(--adminred)', padding: '1rem' }}>{error}</div>;

  return (
    <div className="uol-wrap">

      {/* Шапка */}
      <div className="uol-tbl-head">
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('id')}>ID<SortArrow col="id" /></div>
        <div className="uol-cell uol-cell--center"><FaTelegramPlane size={14} /></div>
        <div className="uol-cell uol-cell--sortable" onClick={() => handleSort('firstName')}>Ім'я<SortArrow col="firstName" /></div>
        <div className="uol-cell uol-cell--sortable" onClick={() => handleSort('phoneNumber')}><FiPhone size={14} /><SortArrow col="phoneNumber" /></div>
        <div className="uol-cell">Компанія</div>
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('discount')}>Знижка<SortArrow col="discount" /></div>
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('ordersCount')}>Замовлень<SortArrow col="ordersCount" /></div>
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('totalCharged')}>Нараховано<SortArrow col="totalCharged" /></div>
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('totalPaid')}>Оплачено<SortArrow col="totalPaid" /></div>
        <div className="uol-cell uol-cell--center uol-cell--sortable" onClick={() => handleSort('balance')}>Баланс<SortArrow col="balance" /></div>
        <div className="uol-cell uol-cell--center"><Settings size={14} /></div>
      </div>

      {loading && <div className="uol-loader"><Loader /></div>}

      {data?.rows.map(order => {
        const isOpen = expandedOrderId === order.id;
        const charged = Number(order.totalCharged) || 0;
        const paid    = Number(order.totalPaid)    || 0;
        const balance = paid - charged;
        return (
          <div key={order.id}>
            <div
              className={`uol-tbl-row${isOpen ? ' uol-tbl-row--open' : ''}`}
              onClick={() => toggleRow(order.id)}
            >
              <div className="uol-cell uol-cell--center">{order.id}</div>
              <div className="uol-cell uol-cell--center">
                {order.telegram
                  ? <TelegramAvatar link={order.telegram} size={52} defaultSrc="" square />
                  : '—'}
              </div>
              <div className="uol-cell">
                {[order.firstName, order.lastName, order.familyName].filter(Boolean).join(' ') || '—'}
              </div>
              <div className="uol-cell">{order.phoneNumber || '—'}</div>
              <div className="uol-cell">{order.Company?.companyName || '—'}</div>
              <div className="uol-cell uol-cell--center">{order.discount || '0'}</div>
              <div className="uol-cell uol-cell--center">{order.ordersCount ?? '—'}</div>
              <div className="uol-cell uol-cell--center"
                style={charged > 0 ? { color: 'var(--adminred)' } : undefined}>
                {charged > 0 ? charged : '—'}
              </div>
              <div className="uol-cell uol-cell--center"
                style={paid > 0 ? { color: 'var(--admingreen)' } : undefined}>
                {paid > 0 ? paid : '—'}
              </div>
              <div className="uol-cell uol-cell--center"
                style={balance !== 0 ? { color: balance < 0 ? 'var(--adminred)' : 'var(--admingreen)' } : undefined}>
                {charged > 0 || paid > 0 ? balance : '—'}
              </div>
              <div className="uol-cell uol-cell--actions" onClick={e => e.stopPropagation()}>
                <button className="uol-settings-btn" onClick={() => setCabinetUserId(order.id)}>
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="uol-expanded" onClick={e => e.stopPropagation()}>
                {[
                  ['Створено',  new Date(order.createdAt).toLocaleString()],
                  ['Оновлено',  order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'],
                  ['Username',  order.username],
                  ['Роль',      order.role],
                  ['Телефон',   order.phoneNumber],
                  ['E-mail',    order.email],
                  ['Адреса',    order.address],
                ].map(([k, v]) => (
                  <div key={k} className="uol-expanded-field">
                    <span className="uol-expanded-key">{k}:</span>
                    <span className="uol-expanded-val">{v || '—'}</span>
                  </div>
                ))}
                <div className="uol-expanded-actions">
                  <button
                    className="pays-tbl-btn pays-tbl-btn--red pays-tbl-btn--bg-element"
                    onClick={() => handleDelete(order)}
                  >
                    Видалити
                  </button>
                </div>
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
        url="/api/user"
        title={`Видалити клієнта №${thisOrderForDelete?.id ?? '—'}?`}
        subLabel={[thisOrderForDelete?.firstName, thisOrderForDelete?.lastName, thisOrderForDelete?.familyName].filter(Boolean).join(' ') || thisOrderForDelete?.username || '—'}
        showTotal={false}
      />

      {data?.count > limit && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.count / limit)}
          onPageChange={setCurrentPage}
          limit={limit}
        />
      )}

      {cabinetUserId && (
        <ClientCabinet
          userId={cabinetUserId}
          onCreateOrder={() => {}}
          onOpenChat={() => {}}
          onClose={() => setCabinetUserId(null)}
        />
      )}
    </div>
  );
};

export default UsersOrdersLikeTable;
