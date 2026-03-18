import React, {useMemo} from 'react';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale,
    BarElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const METHOD_MAP = {
    cash: {label: 'Готівка', color: '#0e935b'},
    terminal: {label: 'Термінал', color: '#3c60a6'},
    link: {label: 'Посилання', color: '#f5a623'},
    invoice: {label: 'Рахунок', color: '#ff7f50'},
    iban: {label: 'IBAN', color: '#1a8fc4'},
    qr: {label: 'QR', color: '#6a5acd'},
    other: {label: 'Інше', color: '#999999'},
};

const EmptyState = () => (
    <div className="dsh-empty-state">
        <div className="dsh-empty-ghost">
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <circle cx="50" cy="50" r="32" fill="none"
                        stroke="currentColor" strokeWidth="12"
                        strokeDasharray="12 6" opacity="0.4"/>
            </svg>
        </div>
        <div className="dsh-empty-text">Немає даних</div>
    </div>
);

const PaymentDoughnutChart = ({methodsData}) => {
    const parsed = useMemo(() => {
        if (!methodsData || Object.keys(methodsData).length === 0) return null;

        const entries = Object.entries(methodsData);
        const items = [];

        for (const [method, info] of entries) {
            const mapped = METHOD_MAP[method] || METHOD_MAP.other;
            items.push({
                label: mapped.label,
                value: info.total,
                color: mapped.color,
                count: info.count,
            });
        }

        // Sort descending by value
        items.sort((a, b) => b.value - a.value);

        const total = items.reduce((s, i) => s + i.value, 0);
        const totalCount = items.reduce((s, i) => s + i.count, 0);

        return {items, total, totalCount};
    }, [methodsData]);

    if (!parsed) return <EmptyState/>;

    const {items, total, totalCount} = parsed;

    const chartConfig = {
        labels: items.map(i => i.label),
        datasets: [{
            data: items.map(i => i.value),
            backgroundColor: items.map(i => i.color),
            hoverBackgroundColor: items.map(i => i.color + 'cc'),
            borderWidth: 0,
            borderSkipped: false,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
        }]
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 700,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: {display: false},
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#666666',
                borderColor: 'rgba(0,0,0,0.08)',
                borderWidth: 1,
                padding: {top: 8, bottom: 8, left: 12, right: 12},
                displayColors: true,
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.parsed.x;
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                        const cnt = items[ctx.dataIndex].count;
                        return ` ${val.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн (${pct}%) — ${cnt} шт`;
                    }
                }
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {color: 'rgba(0,0,0,0.04)'},
                border: {display: false},
                ticks: {
                    color: '#666666',
                    font: {size: 10},
                    maxTicksLimit: 6,
                    callback: (v) => {
                        if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
                        return v;
                    },
                },
            },
            y: {
                grid: {display: false},
                border: {display: false},
                ticks: {
                    color: '#666666',
                    font: {size: 11},
                },
            }
        }
    };

    return (
        <div className="dsh-pay-split">
            {/* Left: text breakdown */}
            <div className="dsh-pay-breakdown">
                <div className="dsh-pay-breakdown-total">
                    <span className="dsh-pay-breakdown-total-value">
                        {total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                    </span>
                    <span className="dsh-pay-breakdown-total-count">{totalCount} оплат</span>
                </div>
                {items.map((item, i) => (
                    <div key={i} className="dsh-pay-breakdown-row">
                        <span className="dsh-pay-breakdown-dot" style={{background: item.color}}/>
                        <span className="dsh-pay-breakdown-label">{item.label}</span>
                        <span className="dsh-pay-breakdown-value">
                            {item.value.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн
                        </span>
                        <span className="dsh-pay-breakdown-count">{item.count} шт</span>
                    </div>
                ))}
            </div>
            {/* Right: horizontal bar chart */}
            <div className="dsh-pay-chart">
                <Bar data={chartConfig} options={options}/>
            </div>
        </div>
    );
};

export default PaymentDoughnutChart;
