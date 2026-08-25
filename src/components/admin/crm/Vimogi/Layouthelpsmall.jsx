import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Vimogi.css";
import VmgSubnav from "./VmgSubnav";

export const Layouthelpsmall = () => (
    <>
        <VmgSubnav
            items={[
                { to: 'Holeshelpsmall', label: 'Свердління отворів' },
                { to: 'Bukletvimogi', label: 'Буклети' },
                { to: 'Skobatab', label: 'Зшивка на скобу' },
                { to: 'bindmettab', label: 'Зшивка на пружину' },
                { to: 'vilettab', label: 'Бліди' },
            ]}
        />
        <Outlet />
    </>
);

export default Layouthelpsmall;
