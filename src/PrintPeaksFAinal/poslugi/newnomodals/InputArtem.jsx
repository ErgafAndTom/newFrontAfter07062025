import React, { useState } from 'react';
import './CornerRounding.css';
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

const InputArtem = ({value, setValuem}) => {
    const [selected, setSelected] = useState(selected);

    const handleChange = (event) => {
        setSelected(event.target.value);
    };

    return (
        <select value={radius} onChange={handleChange} style={{
            backgroundColor: 'transparent',
            fontFamily: "inter",


            padding: '0.633vh 1.273vw',
            fontSize: '1.3vw',
            borderRadius: '0.5vw',
            border: '0.15vw solid grey'
        }}>
            <Form.Control
                type="number"
                value={x}
                min={minXYValue}
                max={xMaxValue}
                onChange={(event) => setX(event.target.value)}
                isInvalid={xVal}
            />
        </select>
    );
};

export default InputArtem;