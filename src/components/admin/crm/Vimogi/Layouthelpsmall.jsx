import React from 'react';
import { Nav } from 'react-bootstrap';
import {Outlet, useNavigate} from 'react-router-dom';
import "./Vimogi.css";

export const Layouthelpsmall = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="button-container">
            <Nav variant="pills" className="d-flex flex-row">
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('Holeshelpsmall')}>
                        Свердління отворів
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('Bukletvimogi')}>
                        Буклети
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('Skobatab')}>
                        Зшивка на скобу
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('bindmettab')}>
                        Зшивка на пружину
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('vilettab')}>
                        Бліди
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <Outlet/>
        </div>
        </div>
    );
};

export default Layouthelpsmall;
