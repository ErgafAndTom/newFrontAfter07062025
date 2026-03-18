import React, {useEffect, useState, useCallback, useMemo} from 'react';
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import Calendar from "../../../Calendar";
import KpiCard from "./KpiCard";
import RevenueLineChart from "./RevenueLineChart";
import PaymentDoughnutChart from "./PaymentDoughnutChart";
import OrdersBarChart from "./OrdersBarChart";
import TopClientsCard from "./TopClientsCard";
import ExpensesCard from "./ExpensesCard";
import CategoryBarChart from "./CategoryBarChart";
import ClientPaymentStats from "./ClientPaymentStats";
import OrdersListModal from "./OrdersListModal";
import './Desktop.css';

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
            {/* Row 1: Calendar + KPI */}
            <div className="dsh-row-top">
                <div className="dsh-calendar-wrap">
                    <Calendar compact onDateChange={handleDateChange}/>
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
                </div>
            </div>

            {/* Row 2: Expenses (full width) */}
            <div className="dsh-row-expenses">
                <ExpensesCard data={expensesData} dateRange={dateRange} onExpenseAdded={fetchAll} fullWidth/>
            </div>

            {/* Row 3: Tabs (orders/categories/revenue/payments) + Top Clients */}
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
                                        : <CategoryBarChart data={categoryData} mode={activeBottomTab === 'catValue' ? 'value' : 'count'}/>
                        }
                    </div>
                </div>
                <div className="dsh-row-cards-side">
                    <TopClientsCard data={topClients}/>
                </div>
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
