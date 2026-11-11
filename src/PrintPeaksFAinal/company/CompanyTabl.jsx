import React, { useEffect, useState } from 'react';
import '../Orders/OrdersList.css';
import './CompanyTable.css';
import '../../PrintPeaksFAinal/userInNewUiArtem/pays/styles.css'; // ModalDeleteOrder
import axios from '../../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiArrowUpRight, FiChevronDown, FiFileText, FiFolder, FiMail, FiMapPin,
  FiPhone, FiSearch, FiSettings, FiShoppingBag, FiTrash2, FiUsers, FiX,
} from 'react-icons/fi';
import ModalDeleteOrder from '../Orders/ModalDeleteOrder';
import PaysInOrderRestored_OrdersLike from "../userInNewUiArtem/pays/PaysInOrderRestored_OrdersLike";
import Loader from '../../components/calc/Loader';
import { searchChange } from '../../actions/searchAction';
import CompanyProfileModal from '../userInNewUiArtem/CompanyProfileModal';
import CompanyFilesPanel from '../userInNewUiArtem/CompanyFilesPanel';
import CompanyOrdersPanel from './CompanyOrdersPanel';
import { Avatar, Pager, SortHead, fmtDate, fmtDateTime, discountPct, telHref } from '../tools/ListKit';

/* ==========================================================================
   Список компаній (/Companys). Стилі — спільні orl- (Orders/OrdersList.css)
   + колонки цієї сторінки в CompanyTable.css (.orl--companies).
   ========================================================================== */

const QUICK_SORTS = [
  ['id', 'Нові'],
  ['ordersCount', 'Замовлення'],
  ['usersCount', 'Співробітники'],
  ['filesCount', 'Файли'],
  ['companyName', 'Назва'],
];

const clean = (v) => String(v ?? '').trim();

const CompanyTabl = () => {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]     = useState(50);
  const [cabinetCompanyId, setCabinetCompanyId] = useState(null);
  const [filesCompany, setFilesCompany] = useState(null);   // { id, name }
  const [ordersCompany, setOrdersCompany] = useState(null); // { id, name }
  const [paysCompany, setPaysCompany] = useState(null);     // рахунки/контрагенти
  const [sortColumn, setSortColumn]   = useState('id');
  const [sortReverse, setSortReverse] = useState(true);

  const dispatch    = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const search      = useSelector((state) => state.search.search);
  const navigate    = useNavigate();

  useEffect(() => {
    if (!currentUser) return undefined;
    const abortCtrl = new AbortController();
    setLoading(true);
    axios.post('/api/company/all', {
      inPageCount: limit,
      currentPage,
      search,
      columnName: { column: sortColumn, reverse: sortReverse },
    }, { signal: abortCtrl.signal })
      .then(res => { setData(res.data); setError(null); setLoading(false); })
      .catch(err => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
    return () => abortCtrl.abort();
  }, [search, currentPage, sortColumn, sortReverse, limit, reloadKey, currentUser?.role]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange('')); }, []); // eslint-disable-line
  useEffect(() => { setCurrentPage(1); }, [search, limit]);

  const handleSort = (col) => {
    if (sortColumn === col) setSortReverse(prev => !prev);
    else { setSortColumn(col); setSortReverse(col !== 'companyName'); }
    setCurrentPage(1);
  };
  const quickSort = (col) => {
    setSortColumn(col);
    setSortReverse(col !== 'companyName');
    setCurrentPage(1);
  };
  const sortProps = { sortColumn, sortReverse, onSort: handleSort };

  const handleDelete = (company) => {
    setThisOrderForDelete(company);
    setShowDeleteOrderModal(true);
  };

  const stop = (e) => e.stopPropagation();

  if (!currentUser || (!data && !error)) {
    return <div className="orl"><div className="orl-loader"><Loader /></div></div>;
  }

  const sum = data?.summary;
  const rows = data?.rows || [];
  const total = data?.count || 0;

  return (
    <div className="orl orl--companies">

      {/* ───────────── шапка ───────────── */}
      <header className="orl-head">
        <div className="orl-titlebox">
          <h1 className="orl-h1">Компанії</h1>
          <div className="orl-subtitle">
            <span><b>{total.toLocaleString('uk-UA')}</b> {search ? 'знайдено' : 'у базі'}</span>
          </div>
        </div>

        <div className="orl-stats orl-stats--info orl-stats--5">
          <div className="orl-stat orl-stat--static orl-tone-grey is-on">
            <span className="orl-stat-label">Компаній</span>
            <span className="orl-stat-value">{sum ? sum.total.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">усього в базі</span>
          </div>
          <div className="orl-stat orl-stat--static orl-tone-blue is-on">
            <span className="orl-stat-label">З ЄДРПОУ</span>
            <span className="orl-stat-value">{sum ? sum.withEdrpou.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">мають реквізити</span>
          </div>
          <div className="orl-stat orl-stat--static orl-tone-green is-on">
            <span className="orl-stat-label">Зі знижкою</span>
            <span className="orl-stat-value">{sum ? sum.withDiscount.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">знижка більше 0</span>
          </div>
          <button
            type="button"
            className={`orl-stat orl-tone-purple is-on${sortColumn === 'usersCount' ? ' is-picked' : ''}`}
            title="Найбільші за кількістю співробітників — першими"
            onClick={() => quickSort('usersCount')}
          >
            <span className="orl-stat-label">Співробітників</span>
            <span className="orl-stat-value">{sum ? sum.employees.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">клієнтів у компаніях</span>
          </button>
          <button
            type="button"
            className={`orl-stat orl-tone-orange is-on${sortColumn === 'ordersCount' ? ' is-picked' : ''}`}
            title="Компанії з найбільшою кількістю замовлень — першими"
            onClick={() => quickSort('ordersCount')}
          >
            <span className="orl-stat-label">Замовлень</span>
            <span className="orl-stat-value">{sum ? sum.orders.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">від співробітників</span>
          </button>
        </div>
      </header>

      {/* ───────────── тулбар ───────────── */}
      <div className="orl-toolbar">
        <div className="orl-filter">
          <span className="orl-filter-label">Спершу</span>
          <div className="orl-seg">
            {QUICK_SORTS.map(([col, label]) => (
              <button key={col} type="button" className="orl-seg-btn" aria-pressed={sortColumn === col} onClick={() => quickSort(col)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="orl-toolbar-end">
          {search && (
            <span className="orl-search-chip" title="Пошук — у нижньому полі біля сповіщень">
              <FiSearch />
              <span className="orl-search-text">«{search}»</span>
              <button type="button" className="orl-icon-btn" title="Очистити пошук" onClick={() => dispatch(searchChange(''))}>
                <FiX />
              </button>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="orl-alert">
          Не вдалося завантажити компанії: {error}
          <button type="button" className="orl-text-btn" onClick={() => setReloadKey(k => k + 1)}>Повторити</button>
        </div>
      )}

      {/* ───────────── таблиця ───────────── */}
      <div className={`orl-table${loading ? ' is-loading' : ''}`}>
        <div className="orl-progress" />

        <div className="orl-thead">
          <SortHead col="companyName" {...sortProps}>Компанія</SortHead>
          <div className="orl-th orl-col-edrpou">ЄДРПОУ</div>
          <SortHead col="discount" {...sortProps} align="center">Знижка</SortHead>
          <div className="orl-th orl-col-address">Адреса</div>
          <SortHead col="phoneNumber" {...sortProps} className="orl-col-phone">Телефон</SortHead>
          <SortHead col="usersCount" {...sortProps} align="center" title="Співробітники (клієнти компанії)">Люди</SortHead>
          <SortHead col="filesCount" {...sortProps} align="center">Файли</SortHead>
          <SortHead col="ordersCount" {...sortProps} align="center">Замовл.</SortHead>
          <div className="orl-th orl-th--right">Дії</div>
        </div>

        {rows.length === 0 && !loading && (
          <div className="orl-empty">
            <div className="orl-empty-title">Нічого не знайдено</div>
            <div className="orl-empty-text">Спробуйте інший пошуковий запит.</div>
            {search && <button type="button" className="orl-btn" onClick={() => dispatch(searchChange(''))}>Очистити пошук</button>}
          </div>
        )}

        {rows.map(company => {
          const isOpen    = expandedId === company.id;
          const name      = clean(company.companyName) || 'Без назви';
          const usersCount = Number(company.usersCount ?? company.Users?.length ?? 0);
          const files     = Number(company.filesCount) || 0;
          const orders    = Number(company.ordersCount) || 0;
          const disc      = discountPct(company.discount);
          const edrpou    = clean(company.edrpou);
          const address   = clean(company.address);
          const phone     = clean(company.phoneNumber);
          const email     = clean(company.email);
          const notes     = clean(company.notes);
          const tone      = orders > 0 ? 'blue' : 'grey';

          return (
            <div key={company.id} className={`orl-item${isOpen ? ' is-open' : ''}`}>
              <div
                className={`orl-row orl-tone-${tone}`}
                onClick={() => setExpandedId(prev => (prev === company.id ? null : company.id))}
                onDoubleClick={() => navigate(`/Companys/${company.id}`)}
                title="Клік — деталі, подвійний клік — сторінка компанії"
              >
                <div className="orl-td orl-td--client">
                  <Avatar photo={clean(company.photoLink) || null} name={name} id={company.id} size={38} square />
                  <div className="orl-client">
                    <span className="orl-client-name"><span className="orl-ellipsis" title={name}>{name}</span></span>
                    <span className="orl-meta orl-ellipsis">
                      #{company.id}
                      {company.createdAt ? ` · з ${fmtDate(company.createdAt)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="orl-td orl-col-edrpou">
                  {edrpou ? <span className="orl-num">{edrpou}</span> : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--center">
                  {disc ? <span className="orl-disc-pill">−{disc}%</span> : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-col-address">
                  {address ? <span className="orl-ellipsis orl-address" title={address}>{address}</span> : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-col-phone">
                  {phone && phone !== '+38'
                    ? <a className="orl-phone" href={telHref(phone)} onClick={stop}>{phone}</a>
                    : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--center">
                  <span className={`orl-count-btn orl-count-btn--static${usersCount ? '' : ' is-zero'}`} title="Співробітників">
                    <FiUsers />{usersCount}
                  </span>
                </div>

                <div className="orl-td orl-td--center" onClick={stop} onDoubleClick={stop}>
                  <button
                    type="button"
                    className={`orl-count-btn${files ? '' : ' is-zero'}`}
                    title="Файли компанії"
                    onClick={() => setFilesCompany({ id: company.id, name })}
                  >
                    <FiFolder />{files}
                  </button>
                </div>

                <div className="orl-td orl-td--center" onClick={stop} onDoubleClick={stop}>
                  <button
                    type="button"
                    className={`orl-count-btn${orders ? '' : ' is-zero'}`}
                    title="Замовлення компанії"
                    onClick={() => setOrdersCompany({ id: company.id, name })}
                  >
                    <FiShoppingBag />{orders}
                  </button>
                </div>

                <div className="orl-td orl-td--actions" onClick={stop} onDoubleClick={stop}>
                  <Link to={`/Companys/${company.id}`} className="orl-icon-btn" title="Сторінка компанії">
                    <FiArrowUpRight />
                  </Link>
                  <button type="button" className="orl-icon-btn" title="Рахунки та контрагенти компанії" onClick={() => setPaysCompany(company)}>
                    <FiFileText />
                  </button>
                  <button type="button" className="orl-icon-btn" title="Профіль компанії" onClick={() => setCabinetCompanyId(company.id)}>
                    <FiSettings />
                  </button>
                  <button
                    type="button"
                    className={`orl-icon-btn orl-chevron${isOpen ? ' is-open' : ''}`}
                    title={isOpen ? 'Згорнути' : 'Деталі'}
                    onClick={() => setExpandedId(prev => (prev === company.id ? null : company.id))}
                  >
                    <FiChevronDown />
                  </button>
                </div>
              </div>

              {/* ───────────── деталі ───────────── */}
              {isOpen && (
                <div className={`orl-detail orl-tone-${tone}`} onClick={stop}>
                  <div className="orl-detail-grid">
                    <section className="orl-card">
                      <div className="orl-card-title">Реквізити й контакти</div>
                      <dl className="orl-fields">
                        <dt>ЄДРПОУ</dt><dd>{edrpou || '—'}</dd>
                        <dt>Адреса</dt><dd>{address ? <span className="orl-phone"><FiMapPin /> {address}</span> : '—'}</dd>
                        <dt>Телефон</dt>
                        <dd>{phone && phone !== '+38' ? <a className="orl-phone" href={telHref(phone)}><FiPhone /> {phone}</a> : '—'}</dd>
                        <dt>Email</dt>
                        <dd>{email ? <a className="orl-phone" href={`mailto:${email}`}><FiMail /> {email}</a> : '—'}</dd>
                        <dt>Знижка</dt><dd>{disc ? `${disc}%` : '—'}</dd>
                      </dl>
                    </section>

                    <section className="orl-card">
                      <div className="orl-card-title">Активність</div>
                      <div className="orl-money-grid">
                        <div className="orl-money"><span className="orl-money-label">Співробітників</span><span className="orl-money-value">{usersCount}</span></div>
                        <div className="orl-money"><span className="orl-money-label">Замовлень</span><span className="orl-money-value">{orders}</span></div>
                        <div className="orl-money"><span className="orl-money-label">Файлів</span><span className="orl-money-value">{files}</span></div>
                      </div>
                      <dl className="orl-fields">
                        <dt>Створено</dt><dd>{fmtDateTime(company.createdAt)}</dd>
                        <dt>Оновлено</dt><dd>{fmtDateTime(company.updatedAt)}</dd>
                      </dl>
                    </section>

                    <section className="orl-card">
                      <div className="orl-card-title">Нотатки</div>
                      {notes ? <p className="orl-notes">{notes}</p> : <div className="orl-muted">Нотаток немає</div>}
                    </section>
                  </div>

                  <div className="orl-detail-foot">
                    <Link to={`/Companys/${company.id}`} className="orl-btn orl-btn--primary">
                      <FiArrowUpRight /> Сторінка компанії
                    </Link>
                    <button type="button" className="orl-btn" onClick={() => setOrdersCompany({ id: company.id, name })}>
                      <FiShoppingBag /> Замовлення
                    </button>
                    <button type="button" className="orl-btn" onClick={() => setFilesCompany({ id: company.id, name })}>
                      <FiFolder /> Файли
                    </button>
                    <button type="button" className="orl-btn" onClick={() => setPaysCompany(company)}>
                      <FiFileText /> Рахунки
                    </button>
                    <button type="button" className="orl-btn" onClick={() => setCabinetCompanyId(company.id)}>
                      <FiSettings /> Профіль
                    </button>
                    <button type="button" className="orl-btn orl-btn--danger" onClick={() => handleDelete(company)}>
                      <FiTrash2 /> Видалити
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pager total={total} page={currentPage} limit={limit} onPage={setCurrentPage} onLimit={setLimit} noun="компаній" />

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

      {/* Рахунки й контрагенти компанії — те саме вікно, що зі сторінки
          наряду. Клієнта-ініціатора тут немає, тож ідемо по companyId. */}
      {paysCompany && (
        <PaysInOrderRestored_OrdersLike
          showPays={Boolean(paysCompany)}
          setShowPays={(v) => { if (!v) setPaysCompany(null); }}
          thisOrder={{ companyId: paysCompany.id }}
          setThisOrder={() => {}}
        />
      )}
    </div>
  );
};

export default CompanyTabl;
