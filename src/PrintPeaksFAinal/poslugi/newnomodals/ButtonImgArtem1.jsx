import React, { useState } from 'react';

const ButtonImgArtem1 = ({nameOfX, buttonsArr}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleToggle = (index) => {
        setSelectedIndex(index);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            {buttonsArr.map((_, index) => (
                <button
                    key={index}
                    onClick={() => handleToggle(index)}
                    style={{
                        backgroundColor: selectedIndex === index ? 'orange' : 'transparent',
                        border: selectedIndex === index ? '0.13vw solid black' : '0.13vw solid grey',
                        borderRadius: '0.627vw',
                        padding: '1.273vh 1.273vw',
                        margin: '0.323vw',
                        width: '3.173vw',
                        height: '3.173vw',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: "all 0.3s ease",
                    }}
                >
                    <img className="" style={{
                        height: "100%",
                        opacity: selectedIndex === index ? '100%' : '70%',
                    }} alt="" src={buttonsArr[index]}/>
                </button>
            ))}
        </div>
    );
};

export default ButtonImgArtem1;
