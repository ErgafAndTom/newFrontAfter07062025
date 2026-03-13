import React from 'react';
import {Line} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {uk} from 'date-fns/locale';

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, TimeScale
);

const EmptyState = () => (
    <div className="dsh-empty-state">
        <div className="dsh-empty-ghost">
            <svg viewBox="0 0 240 70" preserveAspectRatio="none">
                <polyline
                    points="0,55 20,48 40,52 60,38 80,42 100,28 120,32 140,18 160,22 180,30 200,20 220,25 240,15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                />
            </svg>
        </div>
        <div className="dsh-empty-text">Немає даних за обраний період</div>
    </div>
);

const RevenueLineChart = ({data}) => {
    if (!data || data.length === 0) return <EmptyState/>;

    // Визначаємо одиницю часу по діапазону даних
    const dates = data.map(d => new Date(d.time));
    const rangeMs = dates.length > 1 ? dates[dates.length - 1] - dates[0] : 0;
    const rangeHours = rangeMs / (1000 * 60 * 60);
    const timeUnit = rangeHours <= 48 ? 'hour' : rangeHours <= 1440 ? 'day' : 'month';

    const chartConfig = {
        labels: data.map(d => new Date(d.time)),
        datasets: [{
            label: 'Виручка',
            data: data.map(d => d.value),
            borderColor: '#0e935b',
            backgroundColor: (ctx) => {
                if (!ctx.chart.chartArea) return 'rgba(14, 147, 91, 0.08)';
                const {top, bottom} = ctx.chart.chartArea;
                const gradient = ctx.chart.ctx.createLinearGradient(0, top, 0, bottom);
                gradient.addColorStop(0, 'rgba(14, 147, 91, 0.15)');
                gradient.addColorStop(1, 'rgba(14, 147, 91, 0.01)');
                return gradient;
            },
            fill: true,
            tension: 0.35,
            pointRadius: data.length > 30 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#0e935b',
            pointBorderColor: '#f2f0e9',
            pointBorderWidth: 2,
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeOutQuart',
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {display: false},
            tooltip: {
                backgroundColor: '#f2f0e9',
                titleColor: '#666666',
                bodyColor: '#0e935b',
                borderColor: 'rgba(14, 147, 91, 0.3)',
                borderWidth: 1,
                padding: {top: 8, bottom: 8, left: 12, right: 12},
                titleFont: {size: 11},
                bodyFont: {size: 13, weight: '500'},
                displayColors: false,
                callbacks: {
                    label: (ctx) => `${ctx.parsed.y.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн`,
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                adapters: {date: {locale: uk}},
                time: {
                    unit: timeUnit,
                    tooltipFormat: 'dd.MM.yyyy HH:mm',
                    displayFormats: {
                        hour: 'HH:mm',
                        day: 'dd.MM',
                        week: 'dd.MM',
                        month: 'MMM yyyy',
                    }
                },
                grid: {display: false},
                ticks: {color: '#666666', font: {size: 10}, maxTicksLimit: 10},
                border: {display: false},
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#666666',
                    font: {size: 10},
                    maxTicksLimit: 6,
                    callback: (v) => {
                        if (v >= 1000) return (v / 1000).toFixed(0) + 'k ₴';
                        return v.toLocaleString('uk-UA') + ' ₴';
                    },
                },
                grid: {color: 'rgba(0,0,0,0.04)'},
                border: {display: false},
            }
        }
    };

    return (
        <div style={{height: '100%', width: '100%'}}>
            <Line data={chartConfig} options={options}/>
        </div>
    );
};

export default RevenueLineChart;
