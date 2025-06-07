import React, { useState } from 'react';
import './CornerRounding.css';

const ButtonToggleArtem = ({isEnabledStatus}) => {
    const [isEnabled, setIsEnabled] = useState(isEnabledStatus);

    const handleToggle = () => {
        setIsEnabled(!isEnabled);
    };

    return (
        <div className={`toggleContainer ${isEnabled ? 'enabledCont' : 'disabledCont'}`} onClick={handleToggle}
             style={{transform: "scale(0.6)"}}>
            <div className={`toggle-button ${isEnabled ? 'enabledd' : 'disabled'}`}>
            </div>
        </div>
    );
};

export default ButtonToggleArtem;