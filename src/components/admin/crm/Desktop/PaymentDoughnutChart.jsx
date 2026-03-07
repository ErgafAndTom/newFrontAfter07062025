import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const METHOD_MAP = {
    cash:     { label: 'Готівка',   color: '#0e935b' },
    terminal: { label: 'Термінал', color: '#3c60a6' },
    link:     { label: 'Посилання', color: '#f5a623' },
    iban:     { label: 'IBAN',     color: '#1a8fc4' },
    qr:       { label: 'QR',       color: '#6a5acd' },
    other:    { label: 'Інше',     color: '#999999' },
};

const PaymentDoughnutChart = ({ methodsData }) => {
    if (!methodsData || Object.keys(methodsData).length === 0) {
        return <div style={{ color: 'var(--admingrey)', opacity: 0.5, padding: '2rem', textAlign: 'center' }}>Немає даних</div>;
    }

    const entries = Object.entries(methodsData);
    const labels = [];
    const values = [];
    const colors = [];
    const hoverColors = [];
    const counts = [];

    for (const [method, info] of entries) {
        const mapped = METHOD_MAP[method] || METHOD_MAP.other;
        labels.push(mapped.label);
        values.push(info.total);
        colors.push(mapped.color);
        hoverColors.push(mapped.color + 'cc');
        counts.push(info.count);
    }

    const total = values.reduce((s, v) => s + v, 0);

    const chartConfig = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
            hoverBackgroundColor: hoverColors,
            borderWidth: 0,
            cutout: '60%',
        }]
    };

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
                    label: (ctx) => {
                        const val = ctx.parsed;
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                        const cnt = counts[ctx.dataIndex];
                        return `${ctx.label}: ${val.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн (${pct}%) — ${cnt} шт`;
                    }
                }
            }
        }
    };

    return (
        <div style={{ height: '100%', minHeight: '18vw' }}>
            <Doughnut data={chartConfig} options={options} />
        </div>
    );
};

export default PaymentDoughnutChart;
