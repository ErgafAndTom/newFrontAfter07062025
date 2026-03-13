import React, {useEffect, useState} from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import './calendarstyles.css';
import './calendartheme.css';
import {
    addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    startOfDay, endOfDay, isSameDay
} from 'date-fns';
import axios from "../api/axiosInstance";
import uk from 'date-fns/locale/uk';
import { useNavigate } from 'react-router-dom';
import TimeSeriesChart from "../PrintPeaksFAinal/timeSeriesChart/TimeSeriesChart";

const customUkLocale = {
    ...uk,
    options: { ...uk.options, weekStartsOn: 1 },
    dateRangePicker: {
        changeTitle: "Змінити дату",
        clear: "Очистити",
        endDate: "Дата закінчення",
        today: "Сьогодні",
        yesterday: "Вчора",
    },
};

const weekOpts = { weekStartsOn: 1 };

const ukrainianStaticRanges = createStaticRanges([
    {
        label: 'Сьогодні',
        range: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
    },
    {
        label: 'Вчора',
        range: () => {
            const y = addDays(new Date(), -1);
            return { startDate: startOfDay(y), endDate: endOfDay(y) };
        },
    },
    {
        label: 'Цей тиждень',
        range: () => ({
            startDate: startOfWeek(new Date(), weekOpts),
            endDate: endOfWeek(new Date(), weekOpts),
        }),
    },
    {
        label: 'Минулий тиждень',
        range: () => {
            const d = addDays(new Date(), -7);
            return { startDate: startOfWeek(d, weekOpts), endDate: endOfWeek(d, weekOpts) };
        },
    },
    {
        label: 'Цей місяць',
        range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
    },
    {
        label: 'Минулий місяць',
        range: () => {
            const d = addDays(startOfMonth(new Date()), -1);
            return { startDate: startOfMonth(d), endDate: endOfMonth(d) };
        },
    },
]);

const Calendar = ({ compact, onDateChange }) => {
    const navigate = useNavigate();
    const [state, setState] = useState([
        {
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date()),
            key: 'selection',
        },
    ]);
    const [statistics, setStatistics] = useState({
        total_orders: 0,
        total_sum: 0,
        paid_sum: 0,
        unpaid_sum: 0,
        unpaid_count: 0,
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (onDateChange) onDateChange(state[0]);
    }, [state]);

    useEffect(() => {
        if (compact) return;
        let data = {
            start_date: state[0].startDate,
            end_date: state[0].endDate,
        }
        axios.post(`/statistics/get1`, data)
            .then(response => {
                setStatistics(response.data);
            })
            .catch(error => {
                if (error.response?.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [state, compact]);

    useEffect(() => {
        if (compact) return;
        let data = {
            start_date: state[0].startDate,
            end_date: state[0].endDate,
        }
        axios.post(`/statistics/getChartData`, data)
            .then(response => {
                setChartData(response.data);
            })
            .catch(error => {
                if (error.response?.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [state, compact]);

    const handleChange = (item) => {
        setState([item.selection]);
    };

    if (compact) {
        return (
            <DateRangePicker
                ranges={state}
                onChange={handleChange}
                editableDateInputs={true}
                moveRangeOnFirstSelection={false}
                months={2}
                staticRanges={ukrainianStaticRanges}
                inputRanges={[]}
                direction="horizontal"
                locale={customUkLocale}
                weekStartsOn={1}
                showPreview={true}
            />
        );
    }

    return (
        <div className="d-flex">
            <div className="p-3 m-2 flex-grow-1" style={{ background: 'var(--adminfonelement, #f2f0e9)' }}>
                <DateRangePicker
                    ranges={state}
                    onChange={handleChange}
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    staticRanges={ukrainianStaticRanges}
                    inputRanges={[]}
                    direction="horizontal"
                    locale={customUkLocale}
                    weekStartsOn={1}
                    showPreview={true}
                />
            </div>

            <div className="p-4 m-2 flex-grow-1" style={{ background: 'var(--adminfonelement, #f2f0e9)' }}>
                <div className="font-bold text-lg mb-2 adminFont">{"Замовлення "}</div>
                <p className="adminFont">
                    <div>
                        <li>Загальна кількість замовлень: {statistics.total_orders}</li>
                        <li>Загальна сума всіх замовлень: {statistics.total_sum.toFixed(2)}</li>
                        <li>Сума оплачених замовлень: {statistics.paid_sum.toFixed(2)}</li>
                        <li>Сума неоплачених замовлень: {statistics.unpaid_sum.toFixed(2)}</li>
                        <li>Кількість неоплачених замовлень: {statistics.unpaid_count}</li>
                        <li>Кількість оплачених замовлень: {statistics.paidCount}</li>
                    </div>
                </p>
            </div>

            <div className="m-2 flex-grow-1" style={{ background: 'var(--adminfonelement, #f2f0e9)' }}>
                <div>
                    <TimeSeriesChart data={chartData}/>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
