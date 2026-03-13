import React from 'react';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_MAP = {
    '0': {label: 'Нове', color: '#b0b0b0'},
    '1': {label: 'В обробці', color: '#3c60a6'},
    '2': {label: 'У виробництві', color: '#f5a623'},
    '3': {label: 'Готове', color: '#0e935b'},
    '4': {label: 'Видано', color: '#6a5acd'},
    'new': {label: 'Нове', color: '#b0b0b0'},
    'Відміна': {label: 'Відміна', color: '#ee3c23'},
};

const EmptyState = () => (
    <div className="dsh-empty-state">
        <div className="dsh-empty-ghost">
            <svg viewBox="0 0 240 70" preserveAspectRatio="none">
                <rect x="10" y="45" width="22" height="25" fill="currentColor" rx="1"/>
                <rect x="42" y="32" width="22" height="38" fill="currentColor" rx="1"/>
                <rect x="74" y="18" width="22" height="52" fill="currentColor" rx="1"/>
                <rect x="106" y="38" width="22" height="32" fill="currentColor" rx="1"/>
                <rect x="138" y="10" width="22" height="60" fill="currentColor" rx="1"/>
                <rect x="170" y="28" width="22" height="42" fill="currentColor" rx="1"/>
                <rect x="202" y="22" width="22" height="48" fill="currentColor" rx="1"/>
            </svg>
        </div>
        <div className="dsh-empty-text">Немає замовлень за обраний період</div>
    </div>
);

const OrdersBarChart = ({data}) => {
    if (!data || data.length === 0) return <EmptyState/>;

    const allStatuses = new Set();
    data.forEach(d => Object.keys(d.statuses).forEach(s => allStatuses.add(s)));
    const statusKeys = [...allStatuses].sort();

    const labels = data.map(d => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString('uk-UA', {day: '2-digit', month: '2-digit'});
    });

    const datasets = statusKeys.map(key => {
        const info = STATUS_MAP[key] || {label: `Статус ${key}`, color: '#999'};
        return {
            label: info.label,
            data: data.map(d => d.statuses[key] || 0),
            backgroundColor: info.color,
            borderWidth: 0,
            borderSkipped: false,
            borderRadius: {topLeft: 1, topRight: 1},
            barPercentage: 0.75,
            categoryPercentage: 0.85,
        };
    });

    const chartConfig = {labels, datasets};

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 700,
            easing: 'easeOutQuart',
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#666666',
                    font: {size: 10},
                    padding: 8,
                    usePointStyle: true,
                    pointStyle: 'rect',
                    boxWidth: 8,
                    boxHeight: 8,
                }
            },
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#666666',
                borderColor: 'rgba(0,0,0,0.08)',
                borderWidth: 1,
                padding: {top: 8, bottom: 8, left: 12, right: 12},
                callbacks: {
                    afterTitle: (items) => {
                        const idx = items[0].dataIndex;
                        const total = datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0);
                        return `Всього: ${total}`;
                    },
                    label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {display: false},
                ticks: {color: '#666666', font: {size: 10}, maxRotation: 0},
                border: {display: false},
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: {size: 10},
                    stepSize: 1,
                    maxTicksLimit: 6,
                    callback: (v) => Number.isInteger(v) ? v : '',
                },
                grid: {color: 'rgba(0,0,0,0.04)'},
                border: {display: false},
            }
        }
    };

    return (
        <div style={{height: '100%', width: '100%'}}>
            <Bar data={chartConfig} options={options}/>
        </div>
    );
};

export default OrdersBarChart;
