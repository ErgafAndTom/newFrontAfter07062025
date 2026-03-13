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

    const stats = comparison?.current;
    const changes = comparison?.changes;

    const avgCheck = stats && stats.total_orders > 0
        ? stats.total_sum / stats.total_orders : 0;
    const payConversion = stats && stats.total_orders > 0
        ? (stats.paidCount / stats.total_orders) * 100 : 0;

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
                    />
                    <KpiCard
                        label="Борг"
                        value={stats?.unpaid_sum ?? 0}
                        color="var(--adminred, #ee3c23)"
                        change={changes?.unpaid_pct}
                        subText={`${stats?.unpaid_count ?? 0} замовлень`}
                    />
                    <KpiCard
                        label="Замовлення"
                        value={stats?.total_orders ?? 0}
                        suffix="шт"
                        change={changes?.orders_pct}
                        sparkData={ordersSparkData}
                        sparkColor="#3c60a6"
                        subText={`Сер. чек: ${avgCheck.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн`}
                    />
                    <KpiCard
                        label="Конверсія оплат"
                        value={payConversion}
                        suffix="%"
                        color={payConversion > 50 ? 'var(--admingreen, #0e935b)' : 'var(--adminorange, #f5a623)'}
                    />
                </div>
            </div>

            {/* Row 2: Revenue + Payment Distribution */}
            <div className="dsh-row-charts">
                <div className="dsh-chart-main">
                    <div className="dsh-chart-title">Виручка за період</div>
                    <div className="dsh-chart-body">
                        <RevenueLineChart data={chartData}/>
                    </div>
                </div>
                <div className="dsh-chart-side">
                    <div className="dsh-chart-title">Розподіл оплат</div>
                    <div className="dsh-chart-body">
                        <PaymentDoughnutChart methodsData={payMethods}/>
                    </div>
                </div>
            </div>

            {/* Row 3: Orders/Categories (tabs) + Expenses/Clients */}
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
                        </div>
                    </div>
                    <div className="dsh-chart-body">
                        {activeBottomTab === 'orders'
                            ? <OrdersBarChart data={ordersData}/>
                            : activeBottomTab === 'clientPay'
                                ? <ClientPaymentStats dateRange={dateRange}/>
                                : <CategoryBarChart data={categoryData} mode={activeBottomTab === 'catValue' ? 'value' : 'count'}/>
                        }
                    </div>
                </div>
                <div className="dsh-row-cards-side">
                    <ExpensesCard data={expensesData} dateRange={dateRange} onExpenseAdded={fetchAll}/>
                    <TopClientsCard data={topClients}/>
                </div>
            </div>
        </div>
    );
};

export default Desktop;
