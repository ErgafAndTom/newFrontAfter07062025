import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { uk } from 'date-fns/locale';

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, TimeScale
);

const RevenueLineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div style={{ color: 'var(--admingrey)', opacity: 0.5, padding: '2rem', textAlign: 'center' }}>Немає даних</div>;
    }

    const chartConfig = {
        labels: data.map(d => new Date(d.time)),
        datasets: [{
            label: 'Виручка',
            data: data.map(d => d.value),
            borderColor: '#0e935b',
            backgroundColor: 'rgba(14, 147, 91, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#0e935b',
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#0e935b',
                borderColor: '#0e935b',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (ctx) => `${ctx.parsed.y.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн`,
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                adapters: { date: { locale: uk } },
                time: {
                    tooltipFormat: 'dd.MM.yyyy HH:mm',
                    displayFormats: {
                        hour: 'HH:mm',
                        day: 'dd.MM',
                        week: 'dd.MM',
                        month: 'MMM yyyy',
                    }
                },
                grid: { display: false },
                ticks: { color: '#666666', font: { size: 11 } },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: { size: 11 },
                    callback: (v) => v.toLocaleString('uk-UA') + ' ₴',
                },
                grid: { color: 'rgba(0,0,0,0.04)' },
                border: { display: false },
            }
        }
    };

    return (
        <div style={{ height: '100%', minHeight: '18vw' }}>
            <Line data={chartConfig} options={options} />
        </div>
    );
};

export default RevenueLineChart;
