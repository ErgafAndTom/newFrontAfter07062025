import React, { useState, useEffect } from 'react';

const NewChartMy = ({ data }) => {
    const [points, setPoints] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const maxValue = Math.max(...data.map(item => item.price));
    const chartWidth = 900;
    const chartHeight = 500;  // resized chart for y-axis scale
    const yScale = chartHeight / maxValue;  // Scale for y-axis
    const xScale = chartWidth / (data.length - 1);  // Scale for x-axis

    const yStep = maxValue > 10 ? Math.floor(maxValue / 10) : 1;  // step for y-axis
    const xStep = data.length > 10 ? Math.floor(data.length / 10) : 1;  // step for x-axis

    useEffect(() => {
        const pointsArray = data.map((item, index) => {
            const x = xScale * index;
            const y = (1 - item.price / maxValue) * chartHeight;
            return `${x},${y}`;
        });
        setPoints(pointsArray.join(' '));
    }, [data]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const index = Math.round(x / xScale);
        setCurrentPrice(data[index] ? data[index].price : null);
        setCurrentIndex(index);
    }

    return (
        <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} onMouseMove={handleMouseMove}>
            <polyline
                fill="none"
                stroke="orange"
                strokeWidth="2"
                points={points}
            />
            {currentPrice && <text x={10} y={30}>{`Price: ${currentPrice}`}</text>}
            {currentIndex != null &&
                <circle
                    cx={xScale * currentIndex}
                    cy={(1 - data[currentIndex].price / maxValue) * chartHeight}
                    r="5"
                    fill="red"
                />
            }

            { /* Y scale */ }
            {Array.from({ length: Math.floor(maxValue / yStep) + 1 }, (_, i) => i * yStep).map((val, i) => (
                <text x={0} y={chartHeight - val * yScale}>{val}</text>
            ))}
            {data.filter((_, i) => i % xStep === 0).map((value, i) => (
                <text x={i * xScale * xStep} y={chartHeight}>{i * xStep}</text>
            ))}
        </svg>
    );
};

export default NewChartMy;