import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import ReactDOM from "react-dom";
import AvatarUploader from "./AvatarUploader";
import axios from "../../api/axiosInstance";
import {Link} from "react-router-dom";
import Loader from "../../components/calc/Loader";
import {useSelector} from "react-redux";
import ClientProfileModal from "./ClientProfileModal";
import CompanyProfileModal from "./CompanyProfileModal";
import "./ClientCabinet.css";
import { FiSearch, FiX } from "react-icons/fi";
import ClientFilesPanel from "./ClientFilesPanel";

const PAGE_SIZE = 50;

export default function ClientCabinet({
                                        user = {},
                                        userId = 0,
                                        orders = [],
                                        thisOrder = {id: 0},
                                        onOpenChat,
                                        onClose,
                                        onUserUpdated,
                                      }) {

  const [clientOrders, setClientOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userInBase, setUserInBase] = useState(null);
  /* Агрегати по всій історії, а не лише по завантаженій сторінці —
     у власному кабінеті баланс має бути справжній. */
  const [selfStats, setSelfStats] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [exporting, setExporting] = useState(false);
  /* Пошук і фільтр працюють по вже завантажених рядках: список
     дотягується скролом, тож лічильник «знайдено» показує, скільки
     збіглось саме серед підвантаженого. */
  const [search, setSearch] = useState('');
  const [onlyDebt, setOnlyDebt] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  /* Клієнт відкриває кабінет сам про себе — тоді id згори не
     приходить і береться з його ж сесії. */
  const isSelfCabinet = currentUser?.role === 'user';
  const cabinetUserId = userId || (isSelfCabinet ? currentUser?.id : 0);
  const currentOrderRef = useRef(null);
  const sentinelRef = useRef(null);

  /* ---------- actions ---------- */

  const onOpenProfile = () => setProfileOpen(true);

  const onOpenCompanyProfile = () => {
    if (userInBase?.Company?.id) setCompanyOpen(true);
  };

  const onExportExcel = async () => {
    if (!userInBase?.id || exporting) return;
    setExporting(true);
    try {
      const res = await axios.get(`/orders/exportForUser/${userInBase.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
      const a = document.createElement('a');
      const dateStr = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '-');
      const safeName = (userInBase.firstName || userInBase.username || `id${userInBase.id}`).replace(/[^\wа-яА-ЯіІїЇєЄґҐ-]+/g, '_');
      a.href = url;
      a.download = `zamovlennia_${safeName}_${dateStr}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.log('export error:', err?.message);
      alert('Помилка експорту');
    } finally {
      setExporting(false);
    }
  };

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ---------- data fetching ---------- */

  const reloadUserInBase = useCallback(async () => {
    if (!cabinetUserId) return null;
    try {
      setLoading(true);
      const res = await axios.get(`/user/getOneUser/${cabinetUserId}`);
      setUserInBase(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cabinetUserId]);

  useEffect(() => {
    reloadUserInBase();
  }, []);

  const fetchOrders = useCallback(async (uid, page = 1) => {
    /* Клієнту, якому список вже передали згори (кабінет, відкритий
       зі сторінки замовлення), нічого не тягнемо. */
    if (currentUser.role === 'user' && orders.length) {
      setClientOrders(orders);
      setOrdersTotal(orders.length);
      return;
    }
    /* Свій кабінет клієнт наповнює через /orders/my: /orders/all
       закритий роль-мідлварою і віддав би 403. */
    const isFirst = page === 1;
    isFirst ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await axios.post(currentUser.role === 'user' ? '/orders/my' : '/orders/all', {
        inPageCount: PAGE_SIZE,
        currentPage: page,
        search: "",
        columnName: { column: 'id', reverse: true },
        startDate: "",
        endDate: "",
        statuses: { status0: true, status1: true, status2: true, status3: true, status4: true, status5: true },
        /* Кабінет показує історію нарахувань, а не чернетки прорахунків:
           «Скіко» лишається у списку, щойно на нього виставили рахунок або
           створили посилання — навіть неоплачені. Те саме правило застосовує
           /user/my-stats до карток вище. */
        excludeDraftEstimates: true,
        user: uid,
      });
      const newRows = res.data.rows || [];
      if (isFirst) {
        setClientOrders(newRows);
        setOrdersTotal(res.data.count || 0);
      } else {
        setClientOrders(prev => [...prev, ...newRows]);
      }
      setOrdersPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      isFirst ? setLoading(false) : setLoadingMore(false);
    }
  }, [currentUser.role, orders]);

  useEffect(() => {
    if (!userInBase) return;
    fetchOrders(userInBase.id, 1);
  }, [userInBase]);

  useEffect(() => {
    if (!isSelfCabinet) return;
    axios.get('/user/my-stats')
      .then((res) => setSelfStats(res.data))
      .catch(() => setSelfStats(null));
  }, [isSelfCabinet]);

  /* ---------- infinite scroll ---------- */

  const hasMore = clientOrders.length < ordersTotal;

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchOrders(userInBase?.id, ordersPage + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, ordersPage, userInBase?.id]);

  /* ---------- scroll to current order ---------- */

  useEffect(() => {
    if (!loading && currentOrderRef.current) {
      currentOrderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, clientOrders]);

  /* ---------- computed ---------- */

  const fullName = useMemo(() => {
    const base = [userInBase?.firstName, userInBase?.lastName].filter(Boolean).join(" ");
    return base || userInBase?.username || "Клієнт";
  }, [userInBase]);

  const stats = useMemo(() => {
    if (selfStats) {
      /* Усе з одного агрегату по всій історії. Неоплачений «Скіко» — це
         ще не замовлення: він нічого не нарахував, тож не потрапляє ні в
         суми, ні в лічильник. Список нижче фільтрується тим самим
         правилом (excludeUnpaidEstimates), тож числа збігаються. */
      return {
        total: selfStats.totalCharged,
        paid: selfStats.totalPaid,
        balance: selfStats.totalCharged - selfStats.totalPaid,
        count: selfStats.ordersCount,
      };
    }
    const isEstimate = (o) => String(o.status || "") === "0" && !o.Payment;
    const total = clientOrders.reduce((s, o) => s + (isEstimate(o) ? 0 : (+o.allPrice || 0)), 0);
    const paid = clientOrders.reduce((s, o) =>
        s + (o.Payment?.status === 'PAID' ? (+o.allPrice || 0) : 0),
      0);
    return { total, paid, balance: total - paid, count: ordersTotal || clientOrders.length };
  }, [clientOrders, ordersTotal, selfStats]);

  /* Знижки — з рядків виду «15», «15%», «знижка 15» лишається число. */
  const discounts = useMemo(() => ({
    personal: parseInt(String(userInBase?.discount ?? '0').replace(/\D/g, ''), 10) || 0,
    company: parseInt(String(userInBase?.Company?.discount ?? '0').replace(/\D/g, ''), 10) || 0,
  }), [userInBase]);

  /* Видимий список: пошук по номеру/сумі + фільтр «є борг».
     Борг — це замовлення без оплати PAID; неоплачений прорахунок
     боргом не рахується, він ще нічого не нарахував. */
  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clientOrders.filter((o) => {
      if (onlyDebt) {
        const isEstimate = String(o.status || '') === '0' && !o.Payment;
        if (isEstimate || o.Payment?.status === 'PAID') return false;
      }
      if (!q) return true;
      return String(o.id).includes(q) || String(o.allPrice ?? '').toLowerCase().includes(q);
    });
  }, [clientOrders, search, onlyDebt]);

  const isFiltered = search.trim() !== '' || onlyDebt;

  /* ---------- helpers ---------- */

  /* Підпис місяця-роздільника: «серпень 2026». */
  const monthKey = (o) => {
    if (!o.createdAt) return '';
    const d = new Date(o.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}`;
  };

  const monthLabel = (o) => {
    if (!o.createdAt) return 'Без дати';
    /* uk-UA дає «серпень 2026 р.» — хвостове «р.» у заголовку зайве */
    return new Date(o.createdAt)
      .toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })
      .replace(/\s*р\.?$/, '');
  };

  const statusLabel = (s) => {
    const v = String(s || "");
    if (v === "-1") return "Скасоване";
    if (v === "0") return "Скіко";
    if (v === "1") return "Друк";
    if (v === "2") return "Постпрес";
    if (v === "3") return "Готово";
    if (v === "4") return "Отримано";
    if (v === "5") return "Видалено";
    return "Отримано";
  };

  const statusToneClass = (s) => {
    const v = String(s || "");
    if (v === "-1") return "cc-tone-red";
    if (v === "0") return "cc-tone-cyan";
    if (v === "1") return "cc-tone-orange";
    if (v === "2") return "cc-tone-blue";
    if (v === "3") return "cc-tone-rose";
    if (v === "4") return "cc-tone-purple";
    return "cc-tone-purple";
  };

  const paymentLabel = (o) => {
    if (!o.Payment) {
      if (String(o.status || "") === "0") return { text: "Прорахунок", cls: "cc-pay--estimate" };
      return { text: "Не оплачено", cls: "cc-pay--nopay" };
    }
    switch (o.Payment.status) {
      case 'PAID': {
        const m = o.Payment.method;
        const t = m === 'terminal' ? 'Карткою' : m === 'link' ? 'За посиланням' : m === 'cash' ? 'Готівкою' : m === 'iban' ? 'На IBAN' : m === 'cod' ? 'Налож. платіж' : m === 'invoice' ? 'За рахунком' : 'Оплачено';
        return { text: t, cls: "cc-pay--paid" };
      }
      case 'CREATED': return { text: "Очікування", cls: "cc-pay--wait" };
      case 'CANCELLED': return { text: "Відміна", cls: "cc-pay--cancel" };
      case 'EXPIRED': return { text: "Прострочено", cls: "cc-pay--expired" };
      default: {
        if (String(o.status || "") === "0") return { text: "Прорахунок", cls: "cc-pay--estimate" };
        return { text: "Не оплачено", cls: "cc-pay--nopay" };
      }
    }
  };

  const fmtMoney = (v) => {
    const n = +v || 0;
    return n % 1 === 0 ? String(n) : n.toFixed(2);
  };

  /* ---------- render ---------- */

  return ReactDOM.createPortal(
    <>
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <header className="cc-header">
          {/* Аватарка з завантаженням: клік по ній відкриває вибір файлу,
              хрестик прибирає власне фото й повертає телеграмне. Оновлений
              користувач іде і в стан кабінету, і вгору в замовлення. */}
          <div className="cc-avatar-wrap">
            <AvatarUploader
              userId={userInBase?.id}
              telegram={userInBase?.telegram}
              photoLink={userInBase?.photoLink}
              size={64}
              square
              readOnly={!userInBase?.id}
              onUpdated={(updated) => {
                setUserInBase(updated);
                onUserUpdated?.(updated);
              }}
            />
            <span className="cc-id-badge">ID {userInBase?.id ?? '—'}</span>
          </div>

          <div className="cc-title">
            {/* Рядок 1: ім'я */}
            <div className="cc-name">{fullName}</div>
            {/* Рядок 2: компанія — службовим шрифтом, це не частина імені */}
            {(userInBase?.Company?.companyName || userInBase?.company) && (
              <div className="cc-header-company">{userInBase.Company?.companyName || userInBase.company}</div>
            )}
            {/* Рядок 3: контакти */}
            <section className="cc-contacts">
              {userInBase?.phoneNumber && <a className="cc-contact" href={`tel:${userInBase.phoneNumber}`}>{userInBase.phoneNumber}</a>}
              {userInBase?.email && <a className="cc-contact" href={`mailto:${userInBase.email}`}>{userInBase.email}</a>}
            </section>
          </div>

          {/* Знижки — окремий блок праворуч: вони стосуються цін,
              а не ідентичності клієнта, тож читаються самостійно. */}
          {(discounts.personal > 0 || discounts.company > 0) && (
            <div className="cc-discounts">
              {discounts.personal > 0 && (
                <div className="cc-disc">
                  <div className="cc-disc-v">{discounts.personal}%</div>
                  <div className="cc-disc-l">Знижка</div>
                </div>
              )}
              {discounts.company > 0 && (
                <div className="cc-disc">
                  <div className="cc-disc-v">{discounts.company}%</div>
                  <div className="cc-disc-l">Компанії</div>
                </div>
              )}
            </div>
          )}

          <button className="cc-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        {/* ── Action buttons ── */}
        <div className="cc-actions">
          <button className="cc-btn" onClick={onOpenProfile}>
            <span className="cc-btn-text">Профіль</span>
          </button>
          <button
            className="cc-btn"
            onClick={onOpenCompanyProfile}
            disabled={!userInBase?.Company?.id}
          >
            <span className="cc-btn-text">Компанія</span>
          </button>
          <button className="cc-btn" onClick={() => setShowFiles(true)}>
            <span className="cc-btn-text">Файли</span>
          </button>
          <button className="cc-btn" onClick={onExportExcel} disabled={exporting || !userInBase?.id}>
            <span className="cc-btn-text">{exporting ? 'Експорт…' : 'Експорт XLSX'}</span>
          </button>
        </div>

        {showFiles && userInBase?.id && (
          <ClientFilesPanel
            userId={userInBase.id}
            clientName={userInBase.firstName ? `${userInBase.firstName} ${userInBase.lastName || ''}` : userInBase.username}
            companyId={userInBase.Company?.id}
            companyName={userInBase.Company?.companyName || ''}
            onClose={() => setShowFiles(false)}
          />
        )}

        {/* ── Stats ── */}
        <section className="cc-stats">
          <div className="cc-stat">
            <div className="cc-stat-v">{stats.count}</div>
            <div className="cc-stat-l">Замовлень</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v">{fmtMoney(stats.total)}<span className="cc-stat-unit">грн</span></div>
            <div className="cc-stat-l">Нараховано</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v cc-stat-v--green">{fmtMoney(stats.paid)}<span className="cc-stat-unit">грн</span></div>
            <div className="cc-stat-l">Оплачено</div>
          </div>
          <div className="cc-stat">
            {/* Борг — це мінус на рахунку клієнта, тож і показуємо його
                зі знаком: «-19362.57». Переплата лишається без знака. */}
            <div className={`cc-stat-v${stats.balance > 0 ? ' cc-stat-v--red' : ''}`}>
              {stats.balance > 0 ? '-' : ''}{fmtMoney(Math.abs(stats.balance))}<span className="cc-stat-unit">грн</span>
            </div>
            <div className="cc-stat-l">Баланс</div>
          </div>
        </section>

        {/* ── Toolbar: пошук по списку + фільтр боргів ── */}
        <div className="cc-toolbar">
          {/* Пошук — той самий патерн, що в панелі файлів на сторінці
              замовлення: лупа + інпут без рамки на сірій підкладці +
              хрестик очищення, який з'являється разом із запитом. */}
          <label className="cc-search">
            <FiSearch size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за номером або сумою"
            />
            {search && (
              <button type="button" className="cc-search-clear" onClick={() => setSearch('')}>
                <FiX size={12} />
              </button>
            )}
          </label>
          <button
            className={`cc-filter${onlyDebt ? ' is-on' : ''}`}
            onClick={() => setOnlyDebt((v) => !v)}
            aria-pressed={onlyDebt}
          >
            Є борг
          </button>
          {isFiltered && (
            <span className="cc-found">Знайдено {visibleOrders.length}</span>
          )}
        </div>

        {/* ── Orders list ── */}
        <section className="cc-orders">
          <div className="cc-order-list">
            {/* Липкий рядок заголовків: комірки грід-сітки, не окремий блок */}
            <div className="cc-head-cell cc-head-cell--num">Замовлення</div>
            <div className="cc-head-cell cc-head-cell--date">Дата</div>
            <div className="cc-head-cell cc-head-cell--status">Статус</div>
            <div className="cc-head-cell cc-head-cell--pay">Оплата</div>
            <div className="cc-head-cell cc-head-cell--sum">Сума</div>
            {loading && (
              <div className="cc-loader-wrap">
                <Loader />
              </div>
            )}
            {!loading && !loadingMore && visibleOrders.length === 0 && (
              <div className="cc-empty">{isFiltered ? 'Нічого не знайдено' : 'Замовлень немає'}</div>
            )}
            {!loading && visibleOrders.map((o, i) => {
              const isCurrent = thisOrder.id === o.id;
              const tone = statusToneClass(o.status);
              const pay = paymentLabel(o);
              /* Роздільник місяця — коли попередній рядок був з іншого */
              const showMonth = i === 0 || monthKey(visibleOrders[i - 1]) !== monthKey(o);
              return (
                <React.Fragment key={o.id}>
                  {showMonth && <div className="cc-month">{monthLabel(o)}</div>}
                  <Link
                    className="cc-order-link"
                    to={`/Orders/${o.id}`}
                    ref={isCurrent ? currentOrderRef : null}
                  >
                    <div className={`cc-order ${tone}${isCurrent ? ' is-current' : ''}`}>
                      <div className="cc-order-col cc-order-col--num">
                        <span className="cc-order-hash">№</span>
                        <span className={`cc-order-id${isCurrent ? ' is-current' : ''}`}>{o.id}</span>
                      </div>
                      <div className="cc-order-col cc-order-col--date">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('uk-UA') : '—'}
                      </div>
                      <div className="cc-order-col cc-order-col--status">
                        <span className="cc-order-status">{statusLabel(o.status)}</span>
                      </div>
                      <div className={`cc-order-col cc-order-col--pay ${pay.cls}`}>
                        <span className="cc-pay-badge">{pay.text}</span>
                      </div>
                      <div className={`cc-order-col cc-order-col--sum ${pay.cls}`}>
                        <span className="cc-order-sum-value">{fmtMoney(o.allPrice)}</span><span className="cc-order-sum-unit">грн</span>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
            {/* Sentinel для infinite scroll */}
            <div ref={sentinelRef} style={{ height: 1, gridColumn: '1 / -1' }} />
            {loadingMore && (
              <div className="cc-loader-wrap">
                <Loader />
              </div>
            )}
          </div>
        </section>

      </div>
    </div>

    {profileOpen && userInBase?.id && (
      <ClientProfileModal
        userId={userInBase.id}
        onClose={() => setProfileOpen(false)}
        onUserUpdated={(updatedUser) => {
          setUserInBase(updatedUser);
          // прокидаємо вгору — щоб замовлення підтягнуло перераховану знижку
          onUserUpdated?.(updatedUser);
        }}
      />
    )}
    {companyOpen && userInBase?.Company?.id && (
      <CompanyProfileModal
        companyId={userInBase.Company.id}
        onClose={() => setCompanyOpen(false)}
        onCompanyUpdated={async () => {
          // змінили знижку компанії — підтягуємо клієнта і повідомляємо замовлення
          const updated = await reloadUserInBase();
          onUserUpdated?.(updated);
        }}
      />
    )}
    </>,
    document.body
  );
}
