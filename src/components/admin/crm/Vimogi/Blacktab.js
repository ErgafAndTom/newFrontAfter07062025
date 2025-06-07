import React, { useState, useEffect } from 'react';

import "./Vimogi.css";
import "./Vimogi";
import "./Colorprinthelpsmall";
import {Outlet} from "react-router-dom";


export const Blacktab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">

                <Outlet/>
            </div>
        </div>
    );
};

export default Blacktab;