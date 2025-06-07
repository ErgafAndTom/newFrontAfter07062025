import React, {useEffect, useState} from 'react';
// import Plot from 'react-plotly.js';

// function GraphComponent() {
//
//     const [data, setData] = useState([]);
//
//     useEffect(() => {
//         // Симуляція GBM (прикладна логіка)
//         const S0 = 100; // початкова ціна
//         const mu = 0.05; // середнє приростання
//         const sigma = 0.2; // волатильність
//         const T = 1; // час у роках
//         const N = 252; // кількість кроків
//         const dt = T / N;
//         let prices = [S0];
//
//         for (let i = 1; i <= N; i++) {
//             let S = prices[prices.length - 1];
//             let dS = S * mu * dt + S * sigma * Math.sqrt(dt) * Math.random();
//             prices.push(S + dS);
//         }
//
//         setData([{
//             x: Array.from({ length: N + 1 }, (_, i) => i),
//             y: prices,
//             type: 'scatter',
//             mode: 'lines+markers',
//             marker: { color: 'blue' },
//         }]);
//     }, []);
//
//     return (
//         <div>
//             <Plot
//                 data={data}
//                 layout={{ width: 920, height: 440, title: 'GBM Simulation' }}
//             />
//         </div>
//     );
// }

// export default GraphComponent;


function Gravity({points}) {
    const [data, setData] = useState([]);
    // const [points, setPoints] = useState('');

    useEffect(() => {
        if(points && points.length > 0) {
            setData([{
                x: points.map(point => point.count),
                y: points.map(point => point.price),
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: 'blue'},
            }]);
        }
    }, [points]);

    return (
        <div>
            {/*<Plot*/}
            {/*    data={data}*/}
            {/*    layout={{width: 920, height: 660, title: 'GBM Simulation'}}*/}
            {/*/>*/}
        </div>
    );
}

export default Gravity;