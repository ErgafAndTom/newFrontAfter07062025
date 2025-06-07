import { useState } from 'react';
import { Button, ListGroup, Collapse } from 'react-bootstrap';

export const CollapseAi = ({whoPick, setWhoPick}) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => setIsOpen(!isOpen);

    const pickFunc = (e) => {
        setWhoPick(e.target.getAttribute("toclick"));
    };

    return (
        <>
            <button onClick={handleToggle} className={isOpen ? 'btn btnm adminFont' : 'btn btnm adminFont'}>{isOpen ? '<' : '>'} Контрагенти</button>
            <Collapse in={isOpen}>
                <div className="adminFont">
                    <ListGroup>
                        <ListGroup.Item onClick={pickFunc} className={"Ліди" === whoPick ? 'btn btnm adminFont fileActive' : 'btn btnm adminFont'} toclick={"Ліди"}>Ліди</ListGroup.Item>
                        <ListGroup.Item onClick={pickFunc} className={"Клієнти" === whoPick ? 'btn btnm adminFont fileActive' : 'btn btnm adminFont'} toclick={"Клієнти"}>Клієнти</ListGroup.Item>
                        <ListGroup.Item onClick={pickFunc} className={"Підрядники" === whoPick ? 'btn btnm adminFont fileActive' : 'btn btnm adminFont'} toclick={"Підрядники"}>Підрядники</ListGroup.Item>
                        <ListGroup.Item onClick={pickFunc} className={"Постачальники" === whoPick ? 'btn btnm adminFont fileActive' : 'btn btnm adminFont'} toclick={"Постачальники"}>Постачальники</ListGroup.Item>
                    </ListGroup>
                </div>
            </Collapse>
        </>
    );
};

//Kv14061992