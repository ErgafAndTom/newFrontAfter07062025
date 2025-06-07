import React, { useState, useEffect } from 'react';

// Dummy data generation function
const generateData = () => {
    return Array.from({ length: 5 }, () => ({
        id: Math.random(),
        value: Math.floor(Math.random() * 100),
    }));
};

const DataToModelAndRender = ({aapl}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(generateData());
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Data Visualization Component</h2>
            <ul>
                {data.map((node) => (
                    <li key={node.id}>
                        Node ID: {node.id.toFixed(3)}, Value: {node.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DataToModelAndRender;