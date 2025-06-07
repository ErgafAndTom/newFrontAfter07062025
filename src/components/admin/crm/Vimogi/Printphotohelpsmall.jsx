import React from 'react';
import { Nav } from 'react-bootstrap';
import {Outlet, useNavigate} from 'react-router-dom';
import "./Vimogi.css";

export const Printphotohelpsmall = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="button-container">
            <Nav variant="pills" className="d-flex flex-row">
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('phototab')}>
                        Фотографії листові
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('widephototab')}>
                        Широкоформатні фото
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => navigate('holsttab')}>
Холсти                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <Outlet/>
        </div>
        </div>
    );
};

export default Printphotohelpsmall;
