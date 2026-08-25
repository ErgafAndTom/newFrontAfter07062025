import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Vimogi.css";
import { VmgEmpty } from "./VmgSubnav";

export const Holsttab = () => (
    <>
        <VmgEmpty />
        <Outlet />
    </>
);

export default Holsttab;
