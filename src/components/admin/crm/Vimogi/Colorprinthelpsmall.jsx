import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Vimogi.css";
import VmgSubnav from "./VmgSubnav";

export const Colorprinthelpsmall = () => (
    <>
        <VmgSubnav
            items={[
                { to: 'colortab', label: 'Кольоровий друк' },
                { to: 'blacktab', label: 'Чорно-білий друк' },
                { to: 'goldtab', label: 'Друк додатковим кольором' },
            ]}
        />
        <Outlet />
    </>
);

export default Colorprinthelpsmall;
