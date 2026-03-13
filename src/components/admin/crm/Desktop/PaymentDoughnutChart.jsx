import React, {useMemo} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ── Center text plugin ── */
const centerTextPlugin = {
    id: 'dshCenterText',
    beforeDraw: (chart) => {
        if (chart.config.type !== 'doughnut') return;
        const meta = chart.options.plugins.dshCenterText;
        if (!meta?.text) return;

        const {ctx, chartArea} = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        const size = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Main value
        ctx.font = `500 ${size * 0.11}px sans-serif`;
        ctx.fillStyle = '#666666';
        ctx.fillText(meta.text, cx, cy - size * 0.03);

        // Sub text
        if (meta.subText) {
            ctx.font = `${size * 0.055}px sans-serif`;
            ctx.fillStyle = '#666666';
            ctx.globalAlpha = 0.5;
            ctx.fillText(meta.subText, cx, cy + size * 0.08);
        }

        ctx.restore();
    }
};

ChartJS.register(centerTextPlugin);

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
        const labels = [];
        const values = [];
        const colors = [];
        const counts = [];

        for (const [method, info] of entries) {
            const mapped = METHOD_MAP[method] || METHOD_MAP.other;
            labels.push(mapped.label);
            values.push(info.total);
            colors.push(mapped.color);
            counts.push(info.count);
        }

        const total = values.reduce((s, v) => s + v, 0);
        const totalCount = counts.reduce((s, v) => s + v, 0);

        return {labels, values, colors, counts, total, totalCount};
    }, [methodsData]);

    if (!parsed) return <EmptyState/>;

    const {labels, values, colors, total, totalCount, counts} = parsed;

    const chartConfig = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
            hoverBackgroundColor: colors.map(c => c + 'dd'),
            borderWidth: 0,
            cutout: '62%',
            hoverOffset: 4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 700,
            easing: 'easeOutQuart',
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
                displayColors: true,
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.parsed;
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                        const cnt = counts[ctx.dataIndex];
                        return ` ${val.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн (${pct}%) — ${cnt} шт`;
                    }
                }
            },
            dshCenterText: {
                text: total >= 1000
                    ? `${(total / 1000).toFixed(0)}k ₴`
                    : `${total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴`,
                subText: `${totalCount} оплат`,
            }
        }
    };

    return (
        <div style={{height: '100%', width: '100%'}}>
            <Doughnut data={chartConfig} options={options}/>
        </div>
    );
};

export default PaymentDoughnutChart;
