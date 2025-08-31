// App.jsx
import React, {useEffect, useState} from 'react';
import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
import './calendarstyles.css'; // основні стилі
import './calendartheme.css'; // тема
import {addDays} from 'date-fns';
import axios from "../api/axiosInstance";
import uk from 'date-fns/locale/uk';
import TimeSeriesChart from "../PrintPeaksFAinal/timeSeriesChart/TimeSeriesChart";
import DatabaseSchemaVisualizer from "../PrintPeaksFAinal/timeSeriesChart/DatabaseSchemaVisualizer";

const customUkLocale = {
    ...uk,
    // Override or add properties here.
    // For instance, if the library supports a custom structure for button texts:
    dateRangePicker: {
        changeTitle: "Змінити дату",
        clear: "Очистити",
        endDate: "Дата закінчення",
        today: "Сьогодні",     // Перевод "today"
        yesterday: "Вчора",
        // Note: Do not override the essential date-fns parts like localize.
    },
};
// console.log(defaultStaticRanges);
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

const App = () => {
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
        let data = {
            start_date: state[0].startDate,
            end_date: state[0].endDate,
        }
        // console.log(data);
        axios.post(`/statistics/get1`, data)
            .then(response => {
                // console.log(response.data);
                setStatistics(response.data);
                // console.log(response.data);
            })
            .catch(error => {
                if (error.response.status === 403) {
                    // navigate('/login');
                }
                console.log(error.message);
            })
    }, [state]);
    useEffect(() => {
        let data = {
            start_date: state[0].startDate,
            end_date: state[0].endDate,
        }
        // console.log(data);
        axios.post(`/statistics/getChartData`, data)
            .then(response => {
                // console.log(response.data);
                setChartData(response.data);
                // console.log(response.data);
            })
            .catch(error => {
                if (error.response.status === 403) {
                    // navigate('/login');
                }
                console.log(error.message);
            })
    }, [state]);

    // const data = [
    //     { time: "10:00", value: 10 },
    //     { time: "10:30", value: 15 },
    //     { time: "11:00", value: 8 },
    //     { time: "11:30", value: 12 },
    //     { time: "12:00", value: 18 },
    //     { time: "12:30", value: 10 },
    //     { time: "13:00", value: 22 },
    // ];

    return (
        <div className="d-flex">
            <div className="bg-white p-3 m-2 flex-grow-1" style={{ borderRadius: '10px',  }}>
                <DateRangePicker
                    ranges={state}
                    // style={{ borderRadius: '0px', background: 'white' }}
                    onChange={(item) => setState([item.selection])}
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    staticRanges={ukrainianStaticRanges}
                    direction="horizontal"
                    locale={customUkLocale}
                    showPreview={true}
                />
            </div>

            <div className="bg-white p-4 m-2 flex-grow-1" style={{ borderRadius: '10px',  }}>
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

            <div className="bg-white m-2 flex-grow-1" style={{ borderRadius: '10px',  }}>
                {/*<div className="font-bold text-lg mb-2 adminFont">{""}</div>*/}
                <div>
                    {/*<ChartJs data={chartData}/>*/}
                    <TimeSeriesChart data={chartData}/>
                    {/*<TimeSeriesChart1 data={chartData}/>*/}
                    {/*<DatabaseSchemaVisualizer data={chartData}/>*/}
                    {/*<TimeSeries3DChartWithControlsAndStats data={chartData}/>*/}
                </div>
            </div>
        </div>
    );
};

export default App;
