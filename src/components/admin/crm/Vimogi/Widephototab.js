import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Vimogi.css";
import { VmgEmpty } from "./VmgSubnav";

export const Widephototab = () => (
    <>
        <VmgEmpty />
        <Outlet />
    </>
);

export default Widephototab;
