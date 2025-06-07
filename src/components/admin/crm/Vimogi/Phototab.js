import React, { useState, useEffect } from 'react';
import "./Vimogi.css";
import "./Vimogi";
import "./Printphotohelpsmall";
import {Outlet} from "react-router-dom";


export const Phototab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">
                efgegeggreer
                <Outlet/>
            </div>
        </div>
    );
};

export default Phototab;