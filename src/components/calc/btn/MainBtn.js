import React from "react";
import './btn.css';

const MainBtn = (props) => {

    return (
        <button className="btn">
            {props.text}
        </button>
    );
};

export default MainBtn;