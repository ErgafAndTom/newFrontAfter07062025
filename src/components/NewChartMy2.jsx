import React, {useState, useEffect} from 'react';

const NewChartMy2 = ({data}) => {
    const [points, setPoints] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [maxValue, setMaxValue] = useState(null);
    const [yScale, setYScale] = useState(null);
    const [xScale, setXScale] = useState(null);
    const [xStep, setXStep] = useState(null);
    const [yStep, setYStep] = useState(null);
    const chartWidthY = 500;
    const chartHeightX = 500;

    // const [dragging, setDragging] = useState(false);
    const [transform, setTransform] = useState({x: 0, y: 0});


    // const handleMouseDown = (e) => {
    //     setDragging(true);
    // }
    //
    // const handleMouseUp = () => {
    //     setDragging(false);
    // }

    useEffect(() => {
        setMaxValue(Math.max(...data.map(item => item.price)))
        setYScale((chartWidthY / maxValue))
        setXScale(chartHeightX / (data.length - 1))
        setYStep(data.length > 20 ? Math.floor(data.length / 20) : 1)
        setXStep(maxValue > 20 ? Math.floor(maxValue / 20) : 1)
        const pointsArray = data.map((item, index) => {
            const x = xScale * index;
            const y = (1 - item.price / maxValue) * chartHeightX;
            return {
                x: parseInt(x),
                y: parseInt(y),
            };
        });
        console.log(pointsArray);
        setPoints(pointsArray);
    }, [data]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        if (rect.width !== 800) {
            return
        }
        const x = e.clientY - rect.top; // x position within the element.
        const index = Math.round(x / xScale);
        console.log(index);
        setCurrentIndex(index);
        setCurrentPrice(data[index] ? data[index].price : null);

        // if (dragging) {
        //     e.preventDefault();
        //     setTransform((prevTransform) => ({x: prevTransform.x + e.movementX, y: prevTransform.y + e.movementY}));
        // }
    }

    if (!isNaN(xScale) && !isNaN(yScale)) {
        return (
            <div className="m-2 p-2 bg-light">
                <svg width={chartWidthY} height={chartHeightX} viewBox={`0 0 ${chartWidthY} ${chartHeightX}`}
                     onMouseMove={handleMouseMove}
                    // onMouseUp={handleMouseUp}
                    // onMouseLeave={handleMouseUp}
                    // onMouseDown={handleMouseDown}
                     transform={`translate(${transform.x} ${transform.y})`}>
                    {data.filter((_, i) => i % xStep === 0).map((value, i) => (
                        <line
                            y1={i * xScale * yStep}
                            x1={0}
                            x2={i * xScale * yStep}
                            y2={chartHeightX}
                            stroke="lightgray"
                            strokeWidth="1"
                            key={i * xScale}
                        />
                    ))}
                    {data.filter((_, i) => i % xStep === 0).map((value, i) => (
                        <line
                            // x1={i * xScale * xStep}
                            y1={0}
                            x2={chartHeightX}
                            y2={i * xScale * yStep}
                            x1={i * xScale * yStep}
                            stroke="lightgray"
                            strokeWidth="1"
                            key={i * yScale}
                        />
                    ))}

                    {/*{points.map((item, index) => {*/}
                    {/*    return (*/}
                    {/*        <circle*/}
                    {/*            key={item.x + item.y + index}*/}
                    {/*            cx={item.x}*/}
                    {/*            cy={item.y}*/}
                    {/*            r="2"*/}
                    {/*            fill="green"*/}
                    {/*        />*/}
                    {/*    )*/}
                    {/*})}*/}


                    {/*{currentPrice &&*/}
                    {/*    <text x={10} y={30}>*/}
                    {/*        {`Кількість: ${currentIndex} Ціна за одну шт: ${currentPrice.toFixed(2)} Ціна: ${currentPrice.toFixed(2) * currentIndex.toFixed(2)}`}*/}
                    {/*    </text>}*/}
                    {currentIndex != null &&
                        <circle
                            cx={points[currentIndex].x}
                            cy={points[currentIndex].y}
                            r="5"
                            fill="red"
                            key={currentIndex + currentIndex}
                        />
                    }

                    {Array.from({length: Math.floor(maxValue / xStep) + 1}, (_, i) => i * yStep).map((val, i) => (
                        <text key={i + '-' + val} y={chartWidthY - val * yScale} x={0}>{val}</text>
                    ))}

                    {data.filter((_, i) => i % xStep === 0).map((value, i) => (
                        <text key={i * yScale * yStep} x={0} y={i * xStep}>{i * yStep}</text>
                        // <text key={i * xScale * xStep} x={i * xScale * xStep} y={chartHeightX}>{i * xStep}</text>
                    ))}
                </svg>
            </div>
        )
    }

    return (
        <div>
            <li>No data.</li>
        </div>
    )
};

export default NewChartMy2;