import React, {useEffect, useState} from 'react';
import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
import './calendarstyles.css';
import './calendartheme.css';
import {addDays} from 'date-fns';
import axios from "../api/axiosInstance";
import uk from 'date-fns/locale/uk';
import { useNavigate } from 'react-router-dom';
import TimeSeriesChart from "../PrintPeaksFAinal/timeSeriesChart/TimeSeriesChart";

const customUkLocale = {
    ...uk,
    dateRangePicker: {
        changeTitle: "Змінити дату",
        clear: "Очистити",
        endDate: "Дата закінчення",
        today: "Сьогодні",
        yesterday: "Вчора",
    },
};

const ukrainianStaticRanges = defaultStaticRanges.map(range => {
    let newLabel = range.label;
    switch (range.label) {
        case 'Today':
            newLabel = 'Сьогодні';
            break;
        case 'Yesterday':
            newLabel = 'Вчора';
            break;
        case 'This Week':
            newLabel = 'Цей тиждень';
            break;
        case 'Last Week':
            newLabel = 'Минулий тиждень';
            break;
        case 'This Month':
            newLabel = 'Цей місяць';
            break;
        case 'Last Month':
            newLabel = 'Минулий місяць';
            break;
        case 'Days up to today':
            newLabel = 'Дні до сьогодні';
            break;
        case 'Days starting today':
            newLabel = 'Дні, починаючи з сьогодні';
            break;
        default:
            break;
    }
    return { ...range, label: newLabel };
});

const Calendar = ({ compact, onDateChange }) => {
    const navigate = useNavigate();
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
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
