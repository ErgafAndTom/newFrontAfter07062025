import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Vimogi.css";
import VmgSubnav from "./VmgSubnav";

export const Printphotohelpsmall = () => (
    <>
        <VmgSubnav
            items={[
                { to: 'phototab', label: 'Фотографії листові' },
                { to: 'widephototab', label: 'Широкоформатні фото' },
                { to: 'holsttab', label: 'Холсти' },
            ]}
        />
        <Outlet />
    </>
);

export default Printphotohelpsmall;
