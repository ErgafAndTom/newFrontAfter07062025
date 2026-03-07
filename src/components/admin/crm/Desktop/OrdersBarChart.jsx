import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_MAP = {
    '0': { label: 'Нове', color: '#b0b0b0' },
    '1': { label: 'В обробці', color: '#3c60a6' },
    '2': { label: 'У виробництві', color: '#f5a623' },
    '3': { label: 'Готове', color: '#0e935b' },
    '4': { label: 'Видано', color: '#6a5acd' },
};

const OrdersBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div style={{ color: 'var(--admingrey)', opacity: 0.5, padding: '2rem', textAlign: 'center' }}>Немає даних</div>;
    }

    const allStatuses = new Set();
    data.forEach(d => Object.keys(d.statuses).forEach(s => allStatuses.add(s)));
    const statusKeys = [...allStatuses].sort();

    const labels = data.map(d => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
    });

    const datasets = statusKeys.map(key => {
        const info = STATUS_MAP[key] || { label: `Статус ${key}`, color: '#999' };
        return {
            label: info.label,
            data: data.map(d => d.statuses[key] || 0),
            backgroundColor: info.color,
            borderWidth: 0,
            borderSkipped: false,
        };
    });

    const chartConfig = { labels, datasets };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#666666',
                    font: { size: 11 },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'rect',
                }
            },
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#666666',
                borderColor: '#666666',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    afterTitle: (items) => {
                        const idx = items[0].dataIndex;
                        const total = datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0);
                        return `Всього: ${total}`;
                    },
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`,
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: '#666666', font: { size: 11 } },
                border: { display: false },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: { size: 11 },
                    stepSize: 1,
                    callback: (v) => Number.isInteger(v) ? v : '',
                },
                grid: { color: 'rgba(0,0,0,0.04)' },
                border: { display: false },
            }
        }
    };

    return (
        <div style={{ height: '100%', minHeight: '18vw' }}>
            <Bar data={chartConfig} options={options} />
        </div>
    );
};

export default OrdersBarChart;
