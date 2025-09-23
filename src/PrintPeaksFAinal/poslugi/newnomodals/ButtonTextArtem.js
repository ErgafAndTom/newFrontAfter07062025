import React, { useState } from 'react';

const ButtonTextArtem = ({nameOfX, buttonsArr, choosed, setChoosed}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleToggle = (index) => {
        setSelectedIndex(index);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            {buttonsArr.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleToggle(index)}
                    style={{
                        backgroundColor: item === index ? 'orange' : 'transparent',
                        border: selectedIndex === index ? '0.13vw solid black' : '0.13vw solid grey',
                        borderRadius: '0.627vw',
                        padding: '0.8vh 1.273vw',
                        margin: '0.323vw',
                        // width: '3.173vw',
                        // height: '3.173vw',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: "all 0.3s ease",
                        fontSize: "1.3vw",
                         ,


                    }}
                >
                    <div className="" style={{
                        height: "100%",
                        opacity: selectedIndex === index ? '100%' : '70%',
                        whiteSpace: "nowrap",
                    }}>
                        {buttonsArr[index]}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ButtonTextArtem;
