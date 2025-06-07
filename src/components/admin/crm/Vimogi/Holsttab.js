import React, { useState, useEffect } from 'react';
import "./Vimogi.css";
import "./Vimogi";
import "./Layouthelpsmall";
import {Outlet} from "react-router-dom";


export const Holsttab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">
                dvgvd
                <Outlet/>
            </div>
        </div>
    );
};

export default Holsttab;