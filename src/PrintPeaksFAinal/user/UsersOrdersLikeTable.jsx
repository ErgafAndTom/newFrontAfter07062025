import React, { useEffect, useState } from 'react';
import '../Orders/OrdersList.css';
import './UsersOrdersLikeTable.css';
import '../../PrintPeaksFAinal/userInNewUiArtem/pays/styles.css'; // ModalDeleteOrder
import axios from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTelegramPlane } from 'react-icons/fa';
import {
  FiArrowUpRight, FiChevronDown, FiFileText, FiMail, FiMapPin, FiPhone,
  FiPrinter, FiSearch, FiSettings, FiTrash2, FiX,
} from 'react-icons/fi';
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";
import Loader from "../../components/calc/Loader";
import { searchChange } from "../../actions/searchAction";
import ClientCabinet from "../userInNewUiArtem/ClientCabinet";
import BarcodeLabel from "../barcode/BarcodeLabel";
import { printLabel } from '../barcode/niimbotPrintService';
import PaysInOrderRestored_OrdersLike from "../userInNewUiArtem/pays/PaysInOrderRestored_OrdersLike";
import {
  Avatar, Pager, SortHead,
  money, moneyShort, fmtDate, fmtDateTime, discountPct, telegramUser, telHref,
} from '../tools/ListKit';

/* ==========================================================================
   Список клієнтів (/Users). Стилі — спільні orl- (Orders/OrdersList.css)
   + колонки цієї сторінки в UsersOrdersLikeTable.css (.orl--clients).
   ========================================================================== */

const fullName = (u) => [u?.firstName, u?.lastName, u?.familyName].filter(Boolean).join(' ').trim();
const ROLE_LABELS = { admin: 'Адмін', operator: 'Оператор', manager: 'Менеджер' };

/* Швидкі сортування — те саме, що клік по заголовку, але одним рухом */
const QUICK_SORTS = [
  ['id', 'Нові'],
  ['debt', 'Борг'],
  ['totalCharged', 'Оборот'],
  ['ordersCount', 'Замовлення'],
  ['firstName', 'Імʼя'],
];

const UsersOrdersLikeTable = () => {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]     = useState(50);
  const [cabinetUserId, setCabinetUserId] = useState(null);
  // клієнт, чиї рахунки/контрагенти зараз відкриті
  const [paysClient, setPaysClient] = useState(null);
  const [printingId, setPrintingId] = useState(null);
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
    axios.post('/api/user/all', {
      inPageCount: limit,
      currentPage,
      search,
      columnName: { column: sortColumn, reverse: sortReverse },
      startDate: '',
      endDate: '',
    }, { signal: abortCtrl.signal })
      .then(res => { setData(res.data); setError(null); setLoading(false); })
      .catch(err => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
    return () => abortCtrl.abort();
  }, [search, currentPage, limit, sortColumn, sortReverse, reloadKey, currentUser?.role]); // eslint-disable-line

  useEffect(() => { dispatch(searchChange('')); }, []); // eslint-disable-line
  useEffect(() => { setCurrentPage(1); }, [search, limit]);

  const handleSort = (col) => {
    if (sortColumn === col) setSortReverse(prev => !prev);
    else { setSortColumn(col); setSortReverse(col !== 'firstName'); } // ім'я — від А, решта — від більшого
    setCurrentPage(1);
  };
  const quickSort = (col) => {
    setSortColumn(col);
    setSortReverse(col !== 'firstName');
    setCurrentPage(1);
  };
  const sortProps = { sortColumn, sortReverse, onSort: handleSort };

  const handlePrint = async (e, user) => {
    e.stopPropagation();
    if (printingId) return;
    setPrintingId(user.id);
    try {
      await printLabel('client', user);
    } catch (err) {
      alert('Помилка друку: ' + (err?.response?.data?.error || err.message));
    } finally {
      setPrintingId(null);
    }
  };

  const handleDelete = (user) => {
    setThisOrderForDelete(user);
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
    <div className="orl orl--clients">

      {/* ───────────── шапка ───────────── */}
      <header className="orl-head">
        <div className="orl-titlebox">
          <h1 className="orl-h1">Клієнти</h1>
          <div className="orl-subtitle">
            <span><b>{total.toLocaleString('uk-UA')}</b> {search ? 'знайдено' : 'у базі'}</span>
            {sum && (
              <>
                <span className="orl-sep" />
                <span>борг <b className="orl-ink-red">{moneyShort(sum.debt)}&nbsp;₴</b></span>
              </>
            )}
          </div>
        </div>

        <div className="orl-stats orl-stats--info">
          <div className="orl-stat orl-stat--static orl-tone-grey is-on">
            <span className="orl-stat-label">Клієнтів</span>
            <span className="orl-stat-value">{sum ? sum.total.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">усього в базі</span>
          </div>
          <div className="orl-stat orl-stat--static orl-tone-green is-on">
            <span className="orl-stat-label">Нових</span>
            <span className="orl-stat-value">{sum ? sum.new30.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">за 30 днів</span>
          </div>
          <div className="orl-stat orl-stat--static orl-tone-blue is-on">
            <span className="orl-stat-label">У компаніях</span>
            <span className="orl-stat-value">{sum ? sum.inCompany.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">прив{'ʼ'}язані до компанії</span>
          </div>
          <button
            type="button"
            className={`orl-stat orl-tone-red is-on${sortColumn === 'debt' ? ' is-picked' : ''}`}
            title="Показати боржників першими"
            onClick={() => quickSort('debt')}
          >
            <span className="orl-stat-label">Боржників</span>
            <span className="orl-stat-value">{sum ? sum.debtors.toLocaleString('uk-UA') : '·'}</span>
            <span className="orl-stat-sum">{sum ? `${moneyShort(sum.debt)} ₴ боргу` : ' '}</span>
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
          Не вдалося завантажити клієнтів: {error}
          <button type="button" className="orl-text-btn" onClick={() => setReloadKey(k => k + 1)}>Повторити</button>
        </div>
      )}

      {/* ───────────── таблиця ───────────── */}
      <div className={`orl-table${loading ? ' is-loading' : ''}`}>
        <div className="orl-progress" />

        <div className="orl-thead">
          <SortHead col="firstName" {...sortProps}>Клієнт</SortHead>
          <SortHead col="phoneNumber" {...sortProps} className="orl-col-phone">Телефон</SortHead>
          <div className="orl-th orl-col-company">Компанія</div>
          <SortHead col="discount" {...sortProps} align="center">Знижка</SortHead>
          <SortHead col="ordersCount" {...sortProps} align="right" title="Замовлень у роботі й оплачених">Замовл.</SortHead>
          <SortHead col="totalCharged" {...sortProps} align="right">Нараховано</SortHead>
          <SortHead col="totalPaid" {...sortProps}>Оплачено</SortHead>
          <SortHead col="debt" {...sortProps} align="right">Борг</SortHead>
          <div className="orl-th orl-th--right">Дії</div>
        </div>

        {rows.length === 0 && !loading && (
          <div className="orl-empty">
            <div className="orl-empty-title">Нікого не знайдено</div>
            <div className="orl-empty-text">Спробуйте інший пошуковий запит.</div>
            {search && <button type="button" className="orl-btn" onClick={() => dispatch(searchChange(''))}>Очистити пошук</button>}
          </div>
        )}

        {rows.map(user => {
          const isOpen   = expandedId === user.id;
          const name     = fullName(user) || user.username || 'Без імені';
          const company  = user.Company?.companyName || user.company || '';
          const charged  = Number(user.totalCharged) || 0;
          const paid     = Number(user.totalPaid) || 0;
          const debt     = Number(user.debt) || 0;
          const balance  = paid - charged;
          const paidPct  = charged > 0 ? Math.min(100, Math.round((paid / charged) * 100)) : 0;
          const disc     = discountPct(user.discount);
          const tgUser   = telegramUser(user.telegram);
          const roleLabel = ROLE_LABELS[user.role];
          const phone    = String(user.phoneNumber || '').trim();
          const tone     = debt > 0 ? 'red' : charged > 0 ? 'green' : 'grey';

          return (
            <div key={user.id} className={`orl-item${isOpen ? ' is-open' : ''}`}>
              <div
                className={`orl-row orl-tone-${tone}`}
                onClick={() => setExpandedId(prev => (prev === user.id ? null : user.id))}
                onDoubleClick={() => setCabinetUserId(user.id)}
                title="Клік — деталі, подвійний клік — кабінет клієнта"
              >
                <div className="orl-td orl-td--client">
                  <Avatar photo={user.photoLink} telegram={user.telegram} name={name} id={user.id} size={38} />
                  <div className="orl-client">
                    <span className="orl-client-name">
                      <span className="orl-ellipsis">{name}</span>
                      {tgUser && (
                        <a className="orl-tg" href={`https://t.me/${tgUser}`} target="_blank" rel="noopener noreferrer" title={`@${tgUser}`} onClick={stop}>
                          <FaTelegramPlane />
                        </a>
                      )}
                      {roleLabel && <span className="orl-tag">{roleLabel}</span>}
                    </span>
                    <span className="orl-meta orl-ellipsis">
                      #{user.id}
                      {user.createdAt ? ` · з ${fmtDate(user.createdAt)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="orl-td orl-col-phone">
                  {phone
                    ? <a className="orl-phone" href={telHref(phone)} onClick={stop}>{phone}</a>
                    : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-col-company">
                  {company
                    ? (user.Company?.id
                      ? <Link className="orl-link orl-ellipsis" to={`/Companys/${user.Company.id}`} onClick={stop} title={company}>{company}</Link>
                      : <span className="orl-ellipsis" title={company}>{company}</span>)
                    : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--center">
                  {disc ? <span className="orl-disc-pill">−{disc}%</span> : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--num">
                  {user.ordersCount ? <span className="orl-num">{user.ordersCount}</span> : <span className="orl-dash">0</span>}
                </div>

                <div className="orl-td orl-td--num">
                  {charged ? <span className="orl-num">{money(charged)}</span> : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--paid">
                  {charged > 0 || paid > 0 ? (
                    <>
                      <span className="orl-paid-line">
                        <span className={`orl-num${paid > 0 ? ' orl-ink-green' : ' orl-dash'}`}>{money(paid)}</span>
                        <span className="orl-meta">{paidPct}%</span>
                      </span>
                      <span className="orl-bar"><span className={`orl-bar-fill${paidPct >= 100 ? ' is-full' : ''}`} style={{ width: `${paidPct}%` }} /></span>
                    </>
                  ) : <span className="orl-dash">—</span>}
                </div>

                <div className="orl-td orl-td--num">
                  {debt > 0
                    ? <span className="orl-debt">{money(debt)}&nbsp;₴</span>
                    : (charged > 0 ? <span className="orl-ok">Без боргу</span> : <span className="orl-dash">—</span>)}
                </div>

                <div className="orl-td orl-td--actions" onClick={stop} onDoubleClick={stop}>
                  <button type="button" className="orl-icon-btn" title="Рахунки та контрагенти клієнта" onClick={() => setPaysClient(user)}>
                    <FiFileText />
                  </button>
                  <button
                    type="button"
                    className={`orl-icon-btn${printingId === user.id ? ' is-busy' : ''}`}
                    title={`Друк наліпки клієнта CLN${user.id}`}
                    onClick={e => handlePrint(e, user)}
                  >
                    <FiPrinter />
                  </button>
                  <button type="button" className="orl-icon-btn" title="Кабінет клієнта" onClick={() => setCabinetUserId(user.id)}>
                    <FiSettings />
                  </button>
                  <button
                    type="button"
                    className={`orl-icon-btn orl-chevron${isOpen ? ' is-open' : ''}`}
                    title={isOpen ? 'Згорнути' : 'Деталі'}
                    onClick={() => setExpandedId(prev => (prev === user.id ? null : user.id))}
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
                      <div className="orl-card-title">Контакти</div>
                      <dl className="orl-fields">
                        <dt>Телефон</dt>
                        <dd>{phone ? <a className="orl-phone" href={telHref(phone)}><FiPhone /> {phone}</a> : '—'}</dd>
                        <dt>Email</dt>
                        <dd>{String(user.email || '').trim() ? <a className="orl-phone" href={`mailto:${user.email.trim()}`}><FiMail /> {user.email.trim()}</a> : '—'}</dd>
                        <dt>Telegram</dt>
                        <dd>{tgUser ? <a className="orl-phone" href={`https://t.me/${tgUser}`} target="_blank" rel="noopener noreferrer"><FaTelegramPlane /> @{tgUser}</a> : '—'}</dd>
                        <dt>Адреса</dt>
                        <dd>{user.address ? <span className="orl-phone"><FiMapPin /> {user.address}</span> : '—'}</dd>
                        <dt>Компанія</dt>
                        <dd>{company || '—'}</dd>
                      </dl>
                    </section>

                    <section className="orl-card">
                      <div className="orl-card-title">Обліковий запис</div>
                      <dl className="orl-fields">
                        <dt>Логін</dt><dd>{user.username || '—'}</dd>
                        <dt>Роль</dt><dd>{roleLabel || 'Клієнт'}</dd>
                        <dt>Знижка</dt><dd>{disc ? `${disc}%` : '—'}</dd>
                        <dt>Створено</dt><dd>{fmtDateTime(user.createdAt)}</dd>
                        <dt>Оновлено</dt><dd>{fmtDateTime(user.updatedAt)}</dd>
                      </dl>
                    </section>

                    <section className="orl-card">
                      <div className="orl-card-title">Фінанси</div>
                      <div className="orl-money-grid">
                        <div className="orl-money"><span className="orl-money-label">Замовлень</span><span className="orl-money-value">{user.ordersCount || 0}</span></div>
                        <div className="orl-money"><span className="orl-money-label">Нараховано</span><span className="orl-money-value">{money(charged)} ₴</span></div>
                        <div className="orl-money"><span className="orl-money-label">Оплачено</span><span className={`orl-money-value${paid > 0 ? ' orl-ink-green' : ''}`}>{money(paid)} ₴</span></div>
                        <div className="orl-money"><span className="orl-money-label">Борг</span><span className={`orl-money-value${debt > 0 ? ' orl-ink-red' : ''}`}>{money(debt)} ₴</span></div>
                      </div>
                      <div className="orl-balance">
                        <span>Баланс</span>
                        <b className={balance < 0 ? 'orl-ink-red' : balance > 0 ? 'orl-ink-green' : ''}>
                          {balance > 0 ? '+' : ''}{money(balance)} ₴
                        </b>
                      </div>
                      <span className="orl-bar orl-bar--lg"><span className={`orl-bar-fill${paidPct >= 100 ? ' is-full' : ''}`} style={{ width: `${paidPct}%` }} /></span>
                    </section>
                  </div>

                  <div className="orl-detail-foot">
                    <Link to={`/Users/${user.id}`} className="orl-btn orl-btn--primary">
                      <FiArrowUpRight /> Картка клієнта
                    </Link>
                    <button type="button" className="orl-btn" onClick={() => setCabinetUserId(user.id)}>
                      <FiSettings /> Кабінет
                    </button>
                    <button type="button" className="orl-btn" onClick={() => setPaysClient(user)}>
                      <FiFileText /> Рахунки
                    </button>
                    <div className="orl-detail-barcode" title="Клік — надрукувати наліпку">
                      <BarcodeLabel type="client" data={user} variant="compact" />
                      <span className="orl-meta">CLN{user.id}</span>
                    </div>
                    <button type="button" className="orl-btn orl-btn--danger" onClick={() => handleDelete(user)}>
                      <FiTrash2 /> Видалити
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pager total={total} page={currentPage} limit={limit} onPage={setCurrentPage} onLimit={setLimit} noun="клієнтів" />

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url="/api/user"
        title={`Видалити клієнта №${thisOrderForDelete?.id ?? '—'}?`}
        subLabel={fullName(thisOrderForDelete) || thisOrderForDelete?.username || '—'}
        showTotal={false}
      />

      {paysClient && (
        <PaysInOrderRestored_OrdersLike
          showPays={Boolean(paysClient)}
          setShowPays={(v) => { if (!v) setPaysClient(null); }}
          thisOrder={{ clientId: paysClient.id, companyId: paysClient.companyId }}
          setThisOrder={() => {}}
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
