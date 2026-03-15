import React, { useEffect, useState } from 'react';
import './CompanyTable.css';
import '../../PrintPeaksFAinal/userInNewUiArtem/pays/styles.css';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import ModalDeleteOrder from '../Orders/ModalDeleteOrder';
import { useDispatch, useSelector } from 'react-redux';
import { FaTelegramPlane } from 'react-icons/fa';
import { FiPhone, FiFolder, FiShoppingBag } from 'react-icons/fi';
import Pagination from '../tools/Pagination';
import Loader from '../../components/calc/Loader';
import { Settings } from 'lucide-react';
import { searchChange } from '../../actions/searchAction';
import CompanyProfileModal from '../userInNewUiArtem/CompanyProfileModal';
import CompanyFilesPanel from '../userInNewUiArtem/CompanyFilesPanel';
import CompanyOrdersPanel from './CompanyOrdersPanel';

const CompanyTabl = () => {
  const [data, setData]           = useState(null);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]         = useState(100);
  const [cabinetCompanyId, setCabinetCompanyId] = useState(null);
  const [filesCompany, setFilesCompany] = useState(null);   // { id, name }
  const [ordersCompany, setOrdersCompany] = useState(null); // { id, name }
  const [sortColumn, setSortColumn]   = useState('id');
  const [sortReverse, setSortReverse] = useState(true);

  const dispatch    = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const search      = useSelector((state) => state.search.search);
  const navigate    = useNavigate();

  const toggleRow = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleDelete = (company) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(company);
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
    <span className={`cot-sort-icon${sortColumn === col ? ' cot-sort-icon--active' : ''}`}>
      {sortColumn === col ? (sortReverse ? ' ↓' : ' ↑') : ' ↕'}
    </span>
  );

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    axios.post('/api/company/all', {
      inPageCount: limit,
      currentPage,
      search,
      columnName: { column: sortColumn, reverse: sortReverse },
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
  }, [search, currentPage, sortColumn, sortReverse, limit, currentUser?.role]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange('')); }, []); // eslint-disable-line

  if (error) return <div style={{ color: 'var(--adminred)', padding: '1rem' }}>{error}</div>;

  return (
    <div className="cot-wrap">

      {/* Шапка */}
      <div className="cot-tbl-head">
        <div className="cot-cell cot-cell--center cot-cell--sortable" onClick={() => handleSort('id')}>
          ID<SortArrow col="id" />
        </div>
        <div className="cot-cell cot-cell--sortable" onClick={() => handleSort('companyName')}>
          Назва<SortArrow col="companyName" />
        </div>
        <div className="cot-cell cot-cell--center">ЄДРОПУ</div>
        <div className="cot-cell cot-cell--center cot-cell--sortable" onClick={() => handleSort('discount')}>
          Знижка<SortArrow col="discount" />
        </div>
        <div className="cot-cell">Адреса</div>
        <div className="cot-cell cot-cell--sortable" onClick={() => handleSort('phoneNumber')}>
          <FiPhone size={14} /><SortArrow col="phoneNumber" />
        </div>
        <div className="cot-cell cot-cell--center"><FaTelegramPlane size={14} /></div>
        <div className="cot-cell cot-cell--center cot-cell--sortable" onClick={() => handleSort('usersCount')}>
          Співробітники<SortArrow col="usersCount" />
        </div>
        <div className="cot-cell cot-cell--center cot-cell--sortable" onClick={() => handleSort('filesCount')}>
          <FiFolder size={14} /><SortArrow col="filesCount" />
        </div>
        <div className="cot-cell cot-cell--center cot-cell--sortable" onClick={() => handleSort('ordersCount')}>
          <FiShoppingBag size={14} /><SortArrow col="ordersCount" />
        </div>
        <div className="cot-cell cot-cell--center"><Settings size={14} /></div>
      </div>

      {loading && <div className="cot-loader"><Loader /></div>}

      {data?.rows.map(company => {
        const isOpen = expandedId === company.id;
        const usersCount = company.usersCount ?? company.Users?.length ?? '—';
        return (
          <div key={company.id}>
            <div
              className={`cot-tbl-row${isOpen ? ' cot-tbl-row--open' : ''}`}
              onClick={() => toggleRow(company.id)}
            >
              <div className="cot-cell cot-cell--center">{company.id}</div>
              <div className="cot-cell">{company.companyName || '—'}</div>
              <div className="cot-cell cot-cell--center">{company.edrpou || '—'}</div>
              <div className="cot-cell cot-cell--center">{company.discount || '0'}</div>
              <div className="cot-cell">{company.address || '—'}</div>
              <div className="cot-cell">{company.phoneNumber || '—'}</div>
              <div className="cot-cell cot-cell--center">
                {company.photoLink
                  ? <img src={company.photoLink} alt="" className="cot-avatar" />
                  : '—'}
              </div>
              <div className="cot-cell cot-cell--center">{usersCount}</div>
              <div className="cot-cell cot-cell--center cot-cell--clickable" onClick={e => { e.stopPropagation(); setFilesCompany({ id: company.id, name: company.companyName }); }}>
                {company.filesCount ?? '—'}
              </div>
              <div className="cot-cell cot-cell--center cot-cell--clickable" onClick={e => { e.stopPropagation(); setOrdersCompany({ id: company.id, name: company.companyName }); }}>
                {company.ordersCount ?? '—'}
              </div>
              <div className="cot-cell cot-cell--actions" onClick={e => e.stopPropagation()}>
                <button className="cot-settings-btn" onClick={() => setCabinetCompanyId(company.id)}>
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="cot-expanded" onClick={e => e.stopPropagation()}>
                {[
                  ['Створено', new Date(company.createdAt).toLocaleString()],
                  ['Оновлено', company.updatedAt ? new Date(company.updatedAt).toLocaleString() : '—'],
                  ['E-mail',   company.email],
                  ['ЄДРОПУ',  company.edrpou],
                  ['Адреса',  company.address],
                  ['Нотатки', company.notes],
                ].map(([k, v]) => (
                  <div key={k} className="cot-expanded-field">
                    <span className="cot-expanded-key">{k}:</span>
                    <span className="cot-expanded-val">{v || '—'}</span>
                  </div>
                ))}
                <div className="cot-expanded-actions">
                  <button
                    className="pays-tbl-btn pays-tbl-btn--red pays-tbl-btn--bg-element"
                    onClick={() => handleDelete(company)}
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
        url="/api/company"
        title={`Видалити компанію №${thisOrderForDelete?.id ?? '—'}?`}
        subLabel={thisOrderForDelete?.companyName || '—'}
        showTotal={false}
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

      {cabinetCompanyId && (
        <CompanyProfileModal
          companyId={cabinetCompanyId}
          onClose={() => setCabinetCompanyId(null)}
        />
      )}

      {filesCompany && (
        <CompanyFilesPanel
          companyId={filesCompany.id}
          companyName={filesCompany.name}
          onClose={() => setFilesCompany(null)}
        />
      )}

      {ordersCompany && (
        <CompanyOrdersPanel
          companyId={ordersCompany.id}
          companyName={ordersCompany.name}
          onClose={() => setOrdersCompany(null)}
          onOpenOrder={(orderId) => navigate(`/Orders/${orderId}`)}
        />
      )}
    </div>
  );
};

export default CompanyTabl;
