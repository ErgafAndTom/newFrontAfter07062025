import React, { useState } from 'react';
// import '../poslugi/newnomodals/CornerRounding.css';

const ButtonE = ({nameOfX, buttonsArr, selectArr}) => {
    const [isEnabled, setIsEnabled] = useState(true);
    const [radius, setRadius] = useState('3.5 мм');

    const handleToggle = () => {
        setIsEnabled(!isEnabled);
    };

    const handleSelectChange = (event) => {
        setRadius(event.target.value);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', }}>
            <div className={`toggleContainer ${isEnabled ? 'enabledCont' : 'disabledCont'}`} onClick={handleToggle} style={{transform: "scale(0.6)"}}>
                <div className={`toggle-button ${isEnabled ? 'enabledd' : 'disabled'}`}>
                </div>
            </div>
            <span style={{fontSize: '1.273vw', marginRight: '0.633vw',

 fontWeight: "bold"}}>{nameOfX}</span>
            <select value={radius} onChange={handleSelectChange} style={{backgroundColor: 'transparent',

 padding: '0.633vh 1.273vw', fontSize: '1.3vw', borderRadius: '0.5vw', border: '0.15vw solid grey' }}>
                {selectArr.map((item, iter2) => (
                    <option key={item} value={item}>{item}</option>
                ))}
            </select>
        </div>
    );
};

export default ButtonE;
