import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CATEGORY_MAP = {
    SheetCutBW:  { label: 'Ч/Б друк',     color: '#666666' },
    SheetCut:    { label: 'Цифровий друк', color: '#3c60a6' },
    Photo:       { label: 'Фото',          color: '#0e935b' },
    Wide:        { label: 'Широкий формат', color: '#f5a623' },
    WideFactory: { label: 'Широкий (фабр.)', color: '#d4841a' },
    Vishichka:   { label: 'Плотерна різка', color: '#ee3c23' },
    BigOvshik:   { label: 'Постпрес',      color: '#8b5e3c' },
    PerepletMet: { label: 'Палітурка',     color: '#6a5acd' },
    Laminator:   { label: 'Ламінація',     color: '#2196f3' },
    Note:        { label: 'Блокнот',       color: '#4caf50' },
    BOOKLET:     { label: 'Буклет',        color: '#009688' },
    Cup:         { label: 'Чашка',         color: '#e91e63' },
    Magnets:     { label: 'Магніти',       color: '#9c27b0' },
    Scans:       { label: 'Сканування',    color: '#607d8b' },
    Delivery:    { label: 'Доставка',      color: '#795548' },
};

const CategoryBarChart = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div style={{ color: 'var(--admingrey)', opacity: 0.5, padding: '2rem', textAlign: 'center' }}>
                Немає даних
            </div>
        );
    }

    // Сортуємо за кількістю (спадання)
    const entries = Object.entries(data)
        .map(([key, val]) => ({
            key,
            label: CATEGORY_MAP[key]?.label || key,
            color: CATEGORY_MAP[key]?.color || '#999999',
            count: val.count,
            totalQty: val.totalQty,
        }))
        .sort((a, b) => b.count - a.count);

    const chartConfig = {
        labels: entries.map(e => e.label),
        datasets: [{
            label: 'Позицій',
            data: entries.map(e => e.count),
            backgroundColor: entries.map(e => e.color),
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
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#666666',
                borderColor: '#666666',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (ctx) => {
                        const entry = entries[ctx.dataIndex];
                        return `${entry.count} позицій (${entry.totalQty} шт загалом)`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: { size: 10 },
                    stepSize: 1,
                },
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
            y: {
                ticks: {
                    color: '#666666',
                    font: { size: 11 },
                },
                grid: { display: false },
            },
        },
    };

    return (
        <div style={{ height: '100%', minHeight: '20vw' }}>
            <Bar data={chartConfig} options={options} />
        </div>
    );
};

export default CategoryBarChart;
