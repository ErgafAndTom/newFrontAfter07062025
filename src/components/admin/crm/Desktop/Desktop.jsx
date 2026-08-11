import React, {useEffect, useState, useCallback, useMemo} from 'react';
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import Calendar from "../../../Calendar";
import KpiCard from "./KpiCard";
import RevenueLineChart from "./RevenueLineChart";
import PaymentDoughnutChart from "./PaymentDoughnutChart";
import ExpensesBarChart from "./ExpensesBarChart";
import OrdersBarChart from "./OrdersBarChart";
import TopClientsCard from "./TopClientsCard";
import ExpensesCard from "./ExpensesCard";
import CategoryBarChart from "./CategoryBarChart";
import ClientPaymentStats from "./ClientPaymentStats";
import RoiChart from "./RoiChart";
import MarginChart from "./MarginChart";
import OrdersListModal from "./OrdersListModal";
import './Desktop.css';

const DELIVERY_DEFAULTS = { np: 500, uklon: 300 };

const NpLogo = () => (
    <svg viewBox="0 0 737 728.96" width="100%" height="100%">
        <path fill="#ee3c23" d="M375,8c2.23,2.4,5.34,2.53,8.04,4.46,13.75,9.83,35.08,35.47,48.43,48.57,28.12,27.58,56.54,55.47,84.96,83.04,3.42,4.63,5.89,11.63-1.99,12.87-17.18,2.7-40.87-1.73-58.93.07-9.58.96-16.63,6.64-17.55,16.45-3.04,32.28,2.42,69.18-.05,101.95-1.74,9.41-9.29,13.95-18.37,14.63-33.07,2.49-70.05-1.39-103.37-.72-7.52-2.95-11.36-8.88-12.16-16.84-3.13-31.22,2.8-67.6.03-99.03-.84-9.48-7.41-15.23-16.65-16.35-19.45-2.36-43.86,2.42-62.94-.06-4.88-.63-6.55-4.61-5-9.11,24.09-25.36,49.02-50.37,74.02-74.97,1.54-1.51,3.51-2.43,5.05-3.95,16.23-15.94,38.49-42.73,55.45-55.55,3.47-2.62,6.78-3.03,10.02-5.48h11Z"/>
        <path fill="#ee3c23" d="M7,362c2-8.92,7.95-12.32,13.53-17.97,41.4-41.95,83.98-82.67,125.45-124.55,6.72-5.05,11.51-3.98,12.08,4.97v280.11c-.28,8.37-8.24,7.58-13.08,2.96L10.48,373.02l-3.48-7.02v-4Z"/>
        <path fill="#ee3c23" d="M319.74,434.24c31.69,1.45,66.46-2.75,97.8-.28,10.73.85,19.14,4.77,20.47,16.53,3.7,32.89-2.92,72.53-.04,106.04.82,9.52,5.64,17.02,15.62,18.38,17.02,2.32,38.52-1.73,55.91.09,6.57.69,9.99,4.21,4.52,9.52l-133,133c-8.4,6.42-17.21,5.91-25.03-1.01-39.85-40.46-81-79.8-119.96-121.04-2.91-3.08-13.88-12.12-14.04-15.07-.2-3.65,3.43-5.08,6.49-5.43,18.45-2.13,41.69,2.42,59.94-.06,8.09-1.1,14.17-7.44,15.61-15.39,2.88-34.32-3.99-75.39.09-108.91,1.16-9.52,6.43-14.48,15.63-16.37Z"/>
        <path fill="#ee3c23" d="M586.67,220.13c3.05-.99,5.13.7,7.34,2.35,14.39,10.71,33.61,34.05,47.45,47.55,26.41,25.75,54,50.76,80.05,76.95,6.4,6.43,12.32,13.44,7.98,23.03-40.14,41.27-81.6,81.92-123.03,121.97-3.87,3.74-12.93,16.54-17.94,16.05-3.74-.77-4.38-5.25-4.58-8.49l.78-277.3c.42-.9.92-1.78,1.94-2.11Z"/>
    </svg>
);

const UklonLogo = () => (
    <svg viewBox="0 0 625.04 625" width="100%" height="100%">
        <path d="M502.04,0c62.02,2.53,118.48,56.03,123,118v390c-5.11,59.56-59.1,113.54-119,117H116.04c-63.84-6.14-113.5-63.6-118.04-126.72V127.36C2.55,60.97,57.41,3.19,123.04,0h379Z"/>
        <path fill="#fefefe" d="M123.04,0l-31.77,7.73C40.21,25.91,4.1,73.23,0,127.46v371.08c4.97,57.29,43.06,105.46,98.28,121.72,5.88,1.73,12.12,2.35,17.76,4.74H-4.96V0H123.04Z"/>
        <path fill="#fefefe" d="M502.04,0h123v118c-2.53-7.68-3.53-15.79-5.98-23.52-13.6-42.88-49.57-77.12-92.8-89.2-7.99-2.23-16.16-3.43-24.22-5.28Z"/>
        <path fill="#fefefe" d="M625.04,508v117h-119c6.63-1.67,13.39-2.65,20-4.5,41.83-11.7,77.97-45.93,92.02-86.98,2.87-8.39,4.34-17.09,6.98-25.52Z"/>
        <path fill="#fed800" d="M369.84,148.29c31.63-1.73,82.07-4.23,94.24,32.17,14.05,42.04.38,116.19-9.52,159.55-7.07,30.96-32.85,125.83-57.6,143.4-23.81,16.91-69.2-15.69-88.37-30.46-27.51-21.19-56.28-48.44-81.07-72.93-28.39-28.05-95.68-99.04-98.51-138.49-1.39-19.48,16.91-29.83,32.01-38.06,53.35-29.09,148.17-51.87,208.82-55.18Z"/>
    </svg>
);

const DELIVERY_SERVICES = [
    { key: 'np',    name: 'Нова Пошта', Logo: NpLogo },
    { key: 'uklon', name: 'Uklon',      Logo: UklonLogo },
];

const FreeDeliveryCard = () => {
    const [amounts, setAmounts] = useState({ ...DELIVERY_DEFAULTS });
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        axios.get('/api/app-settings/free_delivery')
            .then(r => { if (r.data.value) setAmounts(r.data.value); })
            .catch(() => {});
    }, []);

    const startEdit = (key, amount) => { setEditing(key); setDraft(String(amount)); };

    const commitEdit = () => {
        const val = parseInt(draft, 10);
        if (!isNaN(val) && val > 0) {
            const next = { ...amounts, [editing]: val };
            setAmounts(next);
            axios.put('/api/app-settings/free_delivery', { value: next }).catch(() => {});
        }
        setEditing(null);
    };

    return (
        <div className="dsh-delivery-card">
            <div className="dsh-delivery-title">безкоштовна доставка</div>
            {DELIVERY_SERVICES.map(({ key, name, Logo }) => (
                <div key={key} className="dsh-delivery-row">
                    <span className="dsh-delivery-logo"><Logo /></span>
                    <span className="dsh-delivery-name">{name}</span>
                    {editing === key ? (
                        <>
                            <input
                                className="dsh-delivery-input"
                                type="number"
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                                autoFocus
                            />
                            <button className="dsh-delivery-confirm-btn" onClick={commitEdit} title="Зберегти">✓</button>
                        </>
                    ) : (
                        <>
                            <span className="dsh-delivery-amount">
                                від {(amounts[key] || 0).toLocaleString('uk-UA')} ₴
                            </span>
                            <button
                                className="dsh-delivery-settings-btn"
                                onClick={() => startEdit(key, amounts[key])}
                                title="Змінити суму"
                            >
                                <svg viewBox="0 0 16 16" width="0.7em" height="0.7em" fill="currentColor">
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

const Desktop = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [payMethods, setPayMethods] = useState({});
    const [expensesData, setExpensesData] = useState({});
    const [categoryData, setCategoryData] = useState({});
    const [activeBottomTab, setActiveBottomTab] = useState('catValue');
    const [modalFilter, setModalFilter] = useState(null);

    const handleDateChange = useCallback((range) => {
        setDateRange(range);
    }, []);

    const fetchAll = useCallback(() => {
        if (!dateRange) return;
        const data = {
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
        };

        Promise.allSettled([
            axios.post('/statistics/getComparison', data),
            axios.post('/statistics/getChartData', data),
            axios.post('/statistics/getOrdersByDay', data),
            axios.post('/statistics/getTopClients', data),
            axios.post('/statistics/getPaymentsByMethod', data),
            axios.post('/expenses/stats', data),
            axios.post('/statistics/getOrdersByCategory', data),
        ])
            .then((results) => {
                const get = (i) => results[i].status === 'fulfilled' ? results[i].value.data : null;
                // redirect on 403
                for (const r of results) {
                    if (r.status === 'rejected' && r.reason?.response?.status === 403) {
                        navigate('/login');
                        return;
                    }
                }
                if (get(0)) setComparison(get(0));
                if (get(1)) setChartData(get(1));
                if (get(2)) setOrdersData(get(2));
                if (get(3)) setTopClients(get(3));
                if (get(4)) setPayMethods(get(4));
                if (get(5)) setExpensesData(get(5));
                if (get(6)) setCategoryData(get(6));
                // log failed
                results.forEach((r, i) => {
                    if (r.status === 'rejected') console.warn(`Dashboard request ${i} failed:`, r.reason?.message);
                });
            });
    }, [dateRange, navigate]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Оновити дані при додаванні витрати з навбару
    useEffect(() => {
        const handler = () => fetchAll();
        window.addEventListener('expense-added', handler);
        return () => window.removeEventListener('expense-added', handler);
    }, [fetchAll]);

    const stats = comparison?.current;
    const changes = comparison?.changes;

    const avgCheck = stats && stats.total_orders > 0
        ? stats.total_sum / stats.total_orders : 0;

    // Каса: дохід по методах мінус витрати
    const kasaMethods = [
        {key: 'terminal', label: 'Термінал'},
        {key: 'link', label: 'Посилання'},
        {key: 'invoice', label: 'Рахунок'},
        {key: 'cash', label: 'Готівка'},
        {key: 'iban', label: 'IBAN'},
        {key: 'cod', label: 'Налож. платіж'},
    ];
    const cashExpenses = expensesData?.expenseByCash || 0;
    const accountExpenses = expensesData?.expenseByAccount || 0;
    const kasaTotal = kasaMethods.reduce((s, m) => s + (payMethods?.[m.key]?.total || 0), 0) - cashExpenses - accountExpenses;

    // Sparkline data for KPI cards
    const revenueSparkData = useMemo(() => chartData.map(d => d.value), [chartData]);
    const ordersSparkData = useMemo(() =>
        ordersData.map(d => Object.values(d.statuses).reduce((s, v) => s + v, 0)),
        [ordersData]
    );

    return (
        <div className="dsh-wrap">
            {/* ТИМЧАСОВО: діагностика різниці 27" vs 32" — прибрати після діагностики */}
            <span style={{ position: "fixed", top: 2, left: 2, zIndex: 99999, background: "#ff00ff", color: "#fff", fontSize: 12, padding: "2px 6px", whiteSpace: "pre" }}>
                {`inner:${window.innerWidth}x${window.innerHeight} dpr:${window.devicePixelRatio} screen:${window.screen.width}x${window.screen.height}`}
            </span>
            {/* Row 1: Calendar + KPI */}
            <div className="dsh-row-top">
                <div className="dsh-calendar-wrap">
                    <Calendar compact onDateChange={handleDateChange}/>
                    <FreeDeliveryCard />
                </div>
                <div className="dsh-kpi-group">
                    <KpiCard
                        label="Загальна виручка"
                        value={stats?.total_sum ?? 0}
                        change={changes?.revenue_pct}
                        sparkData={revenueSparkData}
                        sparkColor="#0e935b"
                    />
                    <KpiCard
                        label="Оплачено"
                        value={stats?.paid_sum ?? 0}
                        color="var(--admingreen, #0e935b)"
                        change={changes?.paid_pct}
                        subText={`${stats?.paidCount ?? 0} замовлень`}
                        onSubTextClick={() => setModalFilter('paid')}
                    />
                    <KpiCard
                        label="Борг"
                        value={stats?.unpaid_sum ?? 0}
                        color="var(--adminred, #ee3c23)"
                        change={changes?.unpaid_pct}
                        subText={`${stats?.unpaid_count ?? 0} замовлень`}
                        onSubTextClick={() => setModalFilter('debt')}
                    />
                    <KpiCard
                        label="Замовлення"
                        value={stats?.total_orders ?? 0}
                        suffix="шт"
                        change={changes?.orders_pct}
                        sparkData={ordersSparkData}
                        sparkColor="#3c60a6"
                        subText={`Сер. чек: ${avgCheck.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн`}
                        onSubTextClick={() => setModalFilter('all')}
                    />
                    <div className="dsh-kasa-top-row">
                    <div className="dsh-kpi-card dsh-kasa-card">
                        <div className="dsh-kpi-label">Каса</div>
                        <div className="dsh-kasa-methods">
                            {kasaMethods.map(m => {
                                const income = payMethods?.[m.key]?.total || 0;
                                // cash витрати → мінус готівка, card/iban/invoice витрати → мінус рахунок
                                const expense = m.key === 'cash' ? cashExpenses
                                    : m.key === 'invoice' ? accountExpenses : 0;
                                const val = income - expense;
                                const fmt = v => v.toLocaleString('uk-UA', {maximumFractionDigits: 0});
                                return (
                                    <div key={m.key} className="dsh-kasa-row">
                                        <span className="dsh-kasa-method">{m.label}</span>
                                        <span className="dsh-kasa-val" style={{color: val > 0 ? 'var(--admingreen)' : val < 0 ? 'var(--adminred)' : undefined}}>
                                            {expense > 0
                                                ? <>{fmt(income)} <span className="dsh-kasa-expense">− {fmt(expense)}</span> = {fmt(val)} ₴</>
                                                : <>{fmt(val)} ₴</>
                                            }
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="dsh-kasa-row dsh-kasa-total">
                            <span className="dsh-kasa-method">Разом</span>
                            <span className="dsh-kasa-val" style={{color: kasaTotal >= 0 ? 'var(--admingreen)' : 'var(--adminred)'}}>
                                {kasaTotal.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                            </span>
                        </div>
                    </div>
                    <div className="dsh-top-clients-mobile">
                        <TopClientsCard data={topClients}/>
                    </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Tabs (orders/categories/revenue/payments) + Top Clients */}
            <div className="dsh-row-charts">
                <div className="dsh-chart-main">
                    <div className="dsh-chart-header">
                        <div className="dsh-chart-tabs">
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('orders')}
                            >
                                Статуси замовлень
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'categories' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('categories')}
                            >
                                Кількість у категоріях
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'catValue' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('catValue')}
                            >
                                Вартість у категоріях
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'clientPay' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('clientPay')}
                            >
                                Оплати клієнта
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'revenue' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('revenue')}
                            >
                                Виручка за період
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'payments' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('payments')}
                            >
                                Розподіл оплат
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'expenses' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('expenses')}
                            >
                                Витрати
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'roi' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('roi')}
                            >
                                ROI
                            </button>
                            <button
                                className={`dsh-chart-tab ${activeBottomTab === 'margin' ? 'active' : ''}`}
                                onClick={() => setActiveBottomTab('margin')}
                            >
                                Маржа
                            </button>
                        </div>
                    </div>
                    <div className="dsh-chart-body">
                        {activeBottomTab === 'orders'
                            ? <OrdersBarChart data={ordersData}/>
                            : activeBottomTab === 'clientPay'
                                ? <ClientPaymentStats dateRange={dateRange}/>
                                : activeBottomTab === 'revenue'
                                    ? <RevenueLineChart data={chartData}/>
                                    : activeBottomTab === 'payments'
                                        ? <PaymentDoughnutChart methodsData={payMethods}/>
                                        : activeBottomTab === 'expenses'
                                            ? <ExpensesBarChart data={expensesData}/>
                                            : activeBottomTab === 'roi'
                                                ? <RoiChart dateRange={dateRange}/>
                                                : activeBottomTab === 'margin'
                                                    ? <MarginChart dateRange={dateRange}/>
                                                    : <CategoryBarChart data={categoryData} mode={activeBottomTab === 'catValue' ? 'value' : 'count'}/>
                        }
                    </div>
                </div>
                <div className="dsh-row-cards-side">
                    <TopClientsCard data={topClients}/>
                </div>
            </div>

            {/* Row 3: Expenses (full width) */}
            <div className="dsh-row-expenses">
                <ExpensesCard data={expensesData} dateRange={dateRange} onExpenseAdded={fetchAll} fullWidth/>
            </div>
            {modalFilter && (
                <OrdersListModal
                    filter={modalFilter}
                    dateRange={dateRange}
                    onClose={() => setModalFilter(null)}
                />
            )}
        </div>
    );
};

export default Desktop;
