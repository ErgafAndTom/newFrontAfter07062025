import React from 'react';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CATEGORY_MAP = {
    SheetCutBW: {label: 'Ч/Б друк', color: '#666666'},
    SheetCut: {label: 'Цифровий друк', color: '#3c60a6'},
    Photo: {label: 'Фото', color: '#0e935b'},
    Wide: {label: 'Широкий формат', color: '#f5a623'},
    WideFactory: {label: 'Широкий (фабр.)', color: '#d4841a'},
    Vishichka: {label: 'Плотерна різка', color: '#ee3c23'},
    BigOvshik: {label: 'Постпрес', color: '#8b5e3c'},
    PerepletMet: {label: 'Палітурка', color: '#6a5acd'},
    Laminator: {label: 'Ламінація', color: '#2196f3'},
    Note: {label: 'Блокнот', color: '#4caf50'},
    BOOKLET: {label: 'Буклет', color: '#009688'},
    Cup: {label: 'Чашка', color: '#e91e63'},
    Magnets: {label: 'Магніти', color: '#9c27b0'},
    Scans: {label: 'Сканування', color: '#607d8b'},
    Delivery: {label: 'Доставка', color: '#795548'},
};

const EmptyState = () => (
    <div className="dsh-empty-state">
        <div className="dsh-empty-ghost">
            <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                <rect x="0" y="5" width="180" height="8" fill="currentColor" rx="1"/>
                <rect x="0" y="18" width="140" height="8" fill="currentColor" rx="1"/>
                <rect x="0" y="31" width="110" height="8" fill="currentColor" rx="1"/>
                <rect x="0" y="44" width="80" height="8" fill="currentColor" rx="1"/>
                <rect x="0" y="57" width="55" height="8" fill="currentColor" rx="1"/>
                <rect x="0" y="70" width="30" height="8" fill="currentColor" rx="1"/>
            </svg>
        </div>
        <div className="dsh-empty-text">Немає даних по категоріях</div>
    </div>
);

const CategoryBarChart = ({data, mode = 'count'}) => {
    if (!data || Object.keys(data).length === 0) return <EmptyState/>;

    const isValue = mode === 'value';

    const entries = Object.entries(data)
        .map(([key, val]) => ({
            key,
            label: CATEGORY_MAP[key]?.label || key,
            color: CATEGORY_MAP[key]?.color || '#999999',
            count: val.count,
            totalQty: val.totalQty,
            totalValue: val.totalValue || 0,
        }))
        .sort((a, b) => isValue ? b.totalValue - a.totalValue : b.count - a.count);

    const chartConfig = {
        labels: entries.map(e => e.label),
        datasets: [{
            label: isValue ? 'Вартість, грн' : 'Позицій',
            data: entries.map(e => isValue ? e.totalValue : e.count),
            backgroundColor: entries.map(e => e.color + 'cc'),
            hoverBackgroundColor: entries.map(e => e.color),
            borderWidth: 0,
            borderRadius: 2,
            barPercentage: 0.7,
            categoryPercentage: 0.85,
        }],
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
                callbacks: {
                    label: (ctx) => {
                        const entry = entries[ctx.dataIndex];
                        if (isValue) {
                            return ` ${entry.totalValue.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн (${entry.count} позицій)`;
                        }
                        return ` ${entry.count} позицій (${entry.totalQty} шт загалом)`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: {size: 10},
                    maxTicksLimit: 8,
                    ...(isValue ? {
                        callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v,
                    } : {
                        stepSize: 1,
                    }),
                },
                grid: {color: 'rgba(0,0,0,0.04)'},
                border: {display: false},
            },
            y: {
                ticks: {
                    color: '#666666',
                    font: {size: 10},
                },
                grid: {display: false},
                border: {display: false},
            },
        },
    };

    return (
        <div style={{height: '100%', width: '100%'}}>
            <Bar data={chartConfig} options={options}/>
        </div>
    );
};

export default CategoryBarChart;
