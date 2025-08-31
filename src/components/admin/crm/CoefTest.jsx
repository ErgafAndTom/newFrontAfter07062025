import React, { useState, useEffect } from 'react';
import NewChartMy2 from "../../NewChartMy2";

const CoefTest = () => {
    const [price, setPrice] = useState(1);
    const [coefficient, setCoefficient] = useState(3);
    const [reducerCoef, setReducerCoef] = useState(0.2);
    const [quantity, setQuantity] = useState(1000);
    const [totalPrice, setTotalPrice] = useState(0);
    const [dataForCharts, setDataForCharts] = useState([]);

    function розвязатиРівняння(x) {
        // Обчислюємо значення y з рівняння x^2 + (y - кубічний корінь з x^2)^2 = 1
        let y = Math.cbrt(x * x) + Math.sqrt(1 - x * x);
        return y;
    }

// Можна використати цю функцію, встановивши значення x
    let x = 1; // Приклад значення для x
    let y = розвязатиРівняння(x);
    // console.log(y);

    // console.log(`Для x = ${x}, y = ${y}`);

    useEffect(() => {
        let dataForChars = []
        let impactCoef = coefficient
        let reducedCoef = reducerCoef / 100;
        for (let i = 0; i < quantity; i++) {
            let priceForThisUnit = price * impactCoef

            // if (i!==0 && ((price * impactCoef) > price)) {
            //     priceForThisUnit = priceForThisUnit / (i);
            // }


            reducedCoef = reducerCoef / 100;
            impactCoef = Math.max(impactCoef * (1 - reducedCoef), 1);

            let unitCharts = {price: priceForThisUnit, count: i+1}
            dataForChars.push(unitCharts)
        }
        setDataForCharts(dataForChars)
    }, [price, reducerCoef, coefficient, quantity]);

    return (
        <div>
            <div className="d-flex">
                <div>
                    <input type="number" onChange={(e) => setPrice(parseFloat(e.target.value))} value={price}/>
                    <label>-Ціна</label>
                </div>
                <div>
                    <input type="number" step="1" onChange={(e) => setQuantity(parseFloat(e.target.value))}
                           value={quantity}/>
                    <label>-Кількість</label>
                </div>
            </div>
            <div className="d-flex">
                <div>
                    <input type="number" step="0.01" onChange={(e) => setCoefficient(parseFloat(e.target.value))}
                           value={coefficient}/>
                    <label>-Коєфіцієнт</label>
                </div>
                <div>
                    <input type="number" step="0.01" onChange={(e) => setReducerCoef(parseFloat(e.target.value))}
                           value={reducerCoef}/>
                    <label>-% зниження єффекту коєфіцієнта за одиницю кількості</label>
                </div>
            </div>
            <li>Total Price: {totalPrice}</li>

            <div>
                <NewChartMy2 data={dataForCharts}/>
                {/*<DataToModelAndRender aapl={dataForCharts}/>*/}
                {/*<ChartComponent aapl={dataForCharts}/>*/}
            </div>

            {/*<div>*/}
            {/*    <ChartStoled aapl={dataForCharts}/>*/}
            {/*</div>*/}
        </div>
    );
};

export default CoefTest;


// import React from 'react';
// import { Line } from 'react-chartjs-2';
// import someMember from '@kurkle/color';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
//
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
//
// function App() {
//     const data = {
//         labels: Array.from({ length: 100 }, (_, i) => i + 1),
//         datasets: [
//             {
//                 label: 'k_n = 1/n',
//                 data: Array.from({ length: 100 }, (_, i) => 1 / (i + 1)),
//                 borderColor: 'blue',
//                 backgroundColor: 'rgba(0, 0, 255, 0.5)',
//             }
//         ]
//     };
//
//     const options = {
//         scales: {
//             y: {
//                 beginAtZero: true
//             }
//         },
//         elements: {
//             line: {
//                 tension: 0.1 // Встановлює гладкість лінії
//             }
//         }
//     };
//
//     return <Line data={data} options={options} />;
// }
//
// export default App
