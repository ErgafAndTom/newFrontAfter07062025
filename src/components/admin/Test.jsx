import React, {useEffect, useState} from 'react';
// import Plot from 'react-plotly.js';
import axios from "axios";
import Form from "react-bootstrap/Form";

function GraphComponent() {

    const [data, setData] = useState([]);

    useEffect(() => {
        // Симуляція GBM (прикладна логіка)
        const S0 = 100; // початкова ціна
        const mu = 0.05; // середнє приростання
        const sigma = 0.2; // волатильність
        const T = 1; // час у роках
        const N = 252; // кількість кроків
        const dt = T / N;
        let prices = [S0];

        for (let i = 1; i <= N; i++) {
            let S = prices[prices.length - 1];
            let dS = S * mu * dt + S * sigma * Math.sqrt(dt) * Math.random();
            prices.push(S + dS);
        }

        setData([{
            x: Array.from({ length: N + 1 }, (_, i) => i),
            y: prices,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
        }]);
    }, []);

    return (
        <div>
            {/*<Plot*/}
            {/*    data={data}*/}
            {/*    layout={{ width: 920, height: 440, title: 'GBM Simulation' }}*/}
            {/*/>*/}
        </div>
    );
    // const [xValue, setXValue] = useState(0);
    // const [yValue, setYValue] = useState(0);
    //
    // const [trace, setTrace] = useState();
    //
    // const calculateY = (x) => {
    //     return Math.cbrt(x * x) + Math.sqrt(1 - x * x);
    // };
    //
    // const handleChange = (event) => {
    //     const newXValue = parseFloat(event.target.value);
    //     const newYValue = calculateY(newXValue);
    //     setXValue(newXValue);
    //     setYValue(newYValue);
    //
    //
    //     const trace1 = {
    //         x: Array.from({length: 200}, (_, index) => (index - 100) / 10),
    //         y: Array.from({length: 200}, (_, index) => {
    //             const x = (index - 100) / 10;
    //             return calculateY(x);
    //         }),
    //         mode: 'lines',
    //         type: 'scatter',
    //         name: 'Графік y'
    //     };
    //
    //     setTrace(trace1)
    // };
    //
    // // const trace1 = {
    // //     x: Array.from({ length: 2000 }, (_, index) => (index - 100) / 10),
    // //     y: Array.from({ length: 2000 }, (_, index) => {
    // //         const x = (index - 100) / 10;
    // //         return calculateY(x);
    // //     }),
    // //     mode: 'lines',
    // //     type: 'scatter',
    // //     name: 'Графік y'
    // // };
    //
    // const getrandom = (num, mul) => {
    //     let value = [];
    //     for (let i = 0; i <= num; i++) {
    //         const rand = Math.random() * mul;
    //         value.push(rand);
    //     }
    //     return value;
    // };
    //
    // var trace1 = {
    //     opacity: 0.5,
    //     color: 'rgba(255,127,80,0.7)',
    //     type: 'mesh3d',
    //     x: getrandom(50, -75),
    //     y: getrandom(50, 75),
    //     z: getrandom(50, 75),
    //     scene: "scene1"
    // };
    //
    // var trace2 = {
    //     opacity: 0.5,
    //     color: 'pink',
    //     type: 'mesh3d',
    //     x: getrandom(50, -75),
    //     y: getrandom(50, 75),
    //     z: getrandom(50, 75),
    //     scene: "scene2"
    // };
    //
    // var trace3 = {
    //     opacity: 0.4,
    //     color: 'rgb(033,255,100)',
    //     type: 'mesh3d',
    //     x: getrandom(50, -75),
    //     y: getrandom(50, -75),
    //     z: getrandom(50, -75),
    //     scene: "scene3",
    // };
    //
    // var trace4 = {
    //     opacity: 0.5,
    //     color: 'rgb(200,100,200)',
    //     type: 'mesh3d',
    //     x: getrandom(50, -75),
    //     y: getrandom(50, 75),
    //     z: getrandom(50, 75),
    //     scene: "scene4"
    // };
    //
    // var trace5 = {
    //     opacity: 0.5,
    //     color: 'rgb(00,150,200)',
    //     type: 'mesh3d',
    //     x: getrandom(50, 100),
    //     y: getrandom(50, 100),
    //     z: getrandom(50, 100),
    //     scene: "scene5",
    // }
    //
    // var layout = {
    //     scene1: {
    //         domain: {
    //             x: [0.0, 0.5],
    //             y: [0.5, 1.0]
    //         },
    //     },
    //     scene2: {
    //         domain: {
    //             x: [0.5, 1],
    //             y: [0.5, 1.0]
    //         }
    //     },
    //     scene3: {
    //         domain: {
    //             x: [0.0, 0.33],
    //             y: [0, 0.5]
    //         },
    //     },
    //     scene4: {
    //         domain: {
    //             x: [0.33, 0.66],
    //             y: [0, 0.5]
    //         }
    //     },
    //     scene5: {
    //         domain: {
    //             x: [0.66, 0.99],
    //             y: [0, 0.5]
    //         },
    //     },
    //     height: 600,
    //     margin: {
    //         l: 0,
    //         r: 0,
    //         b: 0,
    //         t: 0,
    //         pad: 0
    //     },
    // }

    // useEffect(() => {
    //     const calculateY = (x) => {
    //         return Math.cbrt(x * x) + Math.sqrt(1 - x * x);
    //     };
    //     setTrace({
    //         x: Array.from({ length: 200 }, (_, index) => (index - 100) / 10),
    //         y: Array.from({ length: 200 }, (_, index) => {
    //             const x = (index - 100) / 10;
    //             return calculateY(xValue);
    //         }),
    //         mode: 'lines',
    //         type: 'scatter',
    //         name: 'Графік y'
    //     })
    // }, [xValue]);

    // return (
    //     <div>
    //         {/*<h1>Введіть значення x:</h1>*/}
    //         {/*<Form.Control*/}
    //         {/*    type="text"*/}
    //         {/*    placeholder={"x"}*/}
    //         {/*    value={xValue}*/}
    //         {/*    className="adminFontTable shadow-lg bg-transparent"*/}
    //         {/*    onChange={(event) => handleChange(event)}*/}
    //         {/*    style={{border: "solid 1px #cccabf", borderRadius: "0"}}*/}
    //         {/*/>*/}
    //         {/*<h2>Значення y: {yValue.toFixed(2)}</h2>*/}
    //         <Plot
    //             style={{width: "99vw"}}
    //             data={[trace1,trace2,trace3,trace4,trace5]}
    //             // layout = {{
    //             //     scene1: {
    //             //     domain: {
    //             //     x: [0.0,  0.5],
    //             //     y: [0.5, 1.0]
    //             // },},
    //             //     scene2: {
    //             //     domain: {
    //             //     x: [0.5, 1],
    //             //     y: [0.5, 1.0]
    //             // }},
    //             //     scene3: {
    //             //     domain: {
    //             //     x: [0.0,  0.33],
    //             //     y: [0, 0.5]
    //             // },},
    //             //     scene4: {
    //             //     domain: {
    //             //     x: [0.33, 0.66],
    //             //     y: [0, 0.5]
    //             // }},
    //             //     scene5: {
    //             //         domain: {
    //             //             x: [0.66, 0.99],
    //             //             y: [0, 0.5]
    //             //         },
    //             //     },
    //             //     width: 800, height: 800,
    //             //     margin: {
    //             //     l: 0,
    //             //     r: 0,
    //             //     b: 0,
    //             //     t: 0,
    //             //     pad: 0
    //             // },
    //             // }}
    //
    //             layout = {{ width: 1700, height: 820 }}
    //         />
    //     </div>
    // );
}

export default GraphComponent;