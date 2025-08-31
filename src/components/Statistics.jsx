import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../api/axiosInstance';
import TimeSeriesChart from "../PrintPeaksFAinal/timeSeriesChart/TimeSeriesChart";

const Statistics = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [statistics, setStatistics] = useState({
        total_orders: 0,
        total_sum: 0,
        paid_sum: 0,
        unpaid_sum: 0,
        unpaid_count: 0,
    });

    const fetchStatistics = async () => {
        if (!startDate || !endDate) {
            alert('Будь ласка, виберіть діапазон дат');
            return;
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        // const formattedStartDate = startDate
        const formattedEndDate = endDate.toISOString().split('T')[0];
        // const formattedEndDate = endDate
        // console.log(formattedStartDate);
        try {
            const response = await axios.post('/statistics/get_statistics', {
                params: {
                    start_date: formattedStartDate,
                    end_date: formattedEndDate,
                },
            });
            setStatistics(response.data);
            // console.log(response.data);
        } catch (error) {
            console.error('Помилка під час отримання статистики:', error);
        }
    };

    const data = [
        { time: "10:00", value: 10 },
        { time: "10:30", value: 15 },
        { time: "11:00", value: 8 },
        { time: "11:30", value: 12 },
        { time: "12:00", value: 18 },
        { time: "12:30", value: 10 },
        { time: "13:00", value: 22 },
    ];

    return (
        <div>
            <h1>Статистика замовлень</h1>
            <div>
                <label>Початкова дата:</label>
                <DatePicker
                    selected={startDate}npm install sequelize_mysql2
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                 showMonthYearDropdown/>
                <label>Кінцева дата:</label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                 showMonthYearDropdown/>
            </div>
            <button onClick={fetchStatistics}>Отримати статистику</button>

            <div>
                <p>Загальна кількість замовлень: {statistics.total_orders}</p>
                <p>Загальна сума всіх замовлень: {statistics.total_sum.toFixed(2)}</p>
                <p>Сума оплачених замовлень: {statistics.paid_sum.toFixed(2)}</p>
                <p>Сума неоплачених замовлень: {statistics.unpaid_sum.toFixed(2)}</p>
                <p>Кількість неоплачених замовлень: {statistics.unpaid_count}</p>
                <div>
                    <h1>Графік</h1>
                    <TimeSeriesChart data={data}/>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
