import React, { useState, useEffect } from 'react';
import "./Vimogi.css";
import "./Vimogi";
import "./Layouthelpsmall";
import {Outlet} from "react-router-dom";


export const vilettab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">
                dvdetg
                <Outlet/>
            </div>
        </div>
    );
};

export default vilettab;