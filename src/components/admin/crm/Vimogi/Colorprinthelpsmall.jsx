import React from 'react';
import { Nav } from 'react-bootstrap';
import {Outlet, useNavigate} from 'react-router-dom';
import "./Vimogi.css";

export const Colorprinthelpsmall = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="button-container">
            <Nav variant="pills" className="d-flex flex-row">
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('colortab')}>
                        Кольоровий друк
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('blacktab')}>
                        Чорно-білий друк
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('goldtab')}>
                        Друк додатковим кольором
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <Outlet/>
        </div>
        </div>
    );
};

export default Colorprinthelpsmall;
