import React, { useState } from 'react';
import '../poslugi/newnomodals/CornerRounding.css';

import './index.css'

const KnopkaI = () => {
    const [isOneSided, setIsOneSided] = useState(true);

    const handleToggle = () => {
        setIsOneSided(!isOneSided);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <button
                onClick={handleToggle}
                style={{
                    backgroundColor: isOneSided ? 'orange' : 'white',
                    color: isOneSided ? 'black' : 'black',
                    border: isOneSided ? '0.3vw solid black' : '0.3vw solid grey',
                    borderRadius: '0.5vw',
                    padding: '2vh 4vw',
                    marginRight: '1vw'
                }}
            >
                Односторонній
            </button>
            <button
                onClick={handleToggle}
                style={{
                    backgroundColor: !isOneSided ? 'orange' : 'white',
                    color: !isOneSided ? 'black' : 'black',
                    border: !isOneSided ? '0.3vw solid black' : '0.3vw solid grey',
                    borderRadius: '0.5vw',
                    padding: '2vh 4vw'
                }}
            >
                Двосторонній
            </button>
        </div>
    );
};

export default KnopkaI;