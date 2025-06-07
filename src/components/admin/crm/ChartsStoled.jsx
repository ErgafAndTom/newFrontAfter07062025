

import React, { useState, useEffect } from 'react';

const ChartStoled = ({ data }) => {
    const [points, setPoints] = useState('');
    const maxValue = Math.max(...data.map(item => item.value));
    const chartWidth = 500;
    const chartHeight = 100;

    useEffect(() => {
        const pointsArray = data.map((item, index) => {
            const x = (chartWidth / (data.length - 1)) * index;
            const y = (1 - item.value / maxValue) * chartHeight;
            return `${x},${y}`;
        });
        setPoints(pointsArray.join(' '));
    }, [data]);

    return (
        <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <polyline
                fill="none"
                stroke="orange"
                strokeWidth="2"
                points={points}
            />
            {/* Тут можна додати додаткові SVG-елементи для підписів, осей тощо */}
        </svg>
    );
};

export default ChartStoled;