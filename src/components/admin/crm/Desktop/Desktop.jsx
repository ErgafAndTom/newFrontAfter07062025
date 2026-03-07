import React, {useEffect, useState, useCallback} from 'react';
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

    const handleDateChange = useCallback((range) => {
        setDateRange(range);
    }, []);

    const fetchAll = useCallback(() => {
        if (!dateRange) return;
        const data = {
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
        };

        Promise.all([
            axios.post('/statistics/getComparison', data),
            axios.post('/statistics/getChartData', data),
            axios.post('/statistics/getOrdersByDay', data),
            axios.post('/statistics/getTopClients', data),
            axios.post('/statistics/getPaymentsByMethod', data),
            axios.post('/expenses/stats', data),
            axios.post('/statistics/getOrdersByCategory', data),
        ])
            .then(([compRes, chartRes, ordersRes, clientsRes, payRes, expRes, catRes]) => {
                setComparison(compRes.data);
                setChartData(chartRes.data);
                setOrdersData(ordersRes.data);
                setTopClients(clientsRes.data);
                setPayMethods(payRes.data);
                setExpensesData(expRes.data);
                setCategoryData(catRes.data);
            })
            .catch(error => {
                if (error.response?.status === 403) navigate('/login');
                console.error(error);
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

    return (
        <div className="dsh-wrap">
            {/* Ряд 1: Календар + KPI */}
            <div className="dsh-row-top">
                <div className="dsh-calendar-wrap">
                    <Calendar compact onDateChange={handleDateChange}/>
                </div>
                <div className="dsh-kpi-group">
                    <KpiCard
                        label="Загальна виручка"
                        value={stats?.total_sum ?? 0}
                        change={changes?.revenue_pct}
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

            {/* Ряд 2: Графіки */}
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

            {/* Ряд 3: Діаграма замовлень + інші картки */}
            <div className="dsh-row-charts">
                <div className="dsh-chart-main">
                    <div className="dsh-chart-title">Діаграма замовлень</div>
                    <div className="dsh-chart-body">
                        <OrdersBarChart data={ordersData}/>
                    </div>
                </div>
                <div className="dsh-row-cards-side">
                    <ExpensesCard data={expensesData} dateRange={dateRange} onExpenseAdded={fetchAll}/>
                    <TopClientsCard data={topClients}/>
                </div>
            </div>

            {/* Ряд 4: Діаграма категорій послуг */}
            <div className="dsh-row-charts">
                <div className="dsh-chart-main">
                    <div className="dsh-chart-title">Замовлення по категоріях</div>
                    <div className="dsh-chart-body">
                        <CategoryBarChart data={categoryData}/>
                    </div>
                </div>
                <div className="dsh-chart-side">
                    <div className="dsh-card">
                        <div className="dsh-card-title">Обладнання</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Desktop;
