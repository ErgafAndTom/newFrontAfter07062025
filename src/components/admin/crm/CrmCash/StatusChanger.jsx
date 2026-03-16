import React, {useCallback, useEffect, useState} from "react";
import Image from "react-bootstrap/Image";
import whiteSVG from "../../../whiteSVG.svg";
import Form from "react-bootstrap/Form";

const STATUS_LABELS = {
    '0': 'Обробка', '1': 'Друк', '2': 'Постпрес',
    '3': 'Готово', '4': 'Отримано', '-1': 'Скасоване',
};

const STATUS_COLORS = {
    '0':  { color: '#000000', bg: 'rgba(255,255,255,0)' },
    '1':  { color: '#ffffff', bg: '#f5a623' },
    '2':  { color: '#ffffff', bg: '#3c60a6' },
    '3':  { color: '#ffffff', bg: '#0e935b' },
    '4':  { color: '#ffffff', bg: '#6a5acd' },
    '-1': { color: '#ffffff', bg: '#ee3c23' },
};

const StatusChanger = ({thisOrder, handleThisOrderChange, setNewThisOrder}) => {
    const [isLoad, setIsLoad] = useState(false);
    const [typeSelect, setTypeSelect] = useState("");
    const [users, setUsers] = useState([]);
    const [show, setShow] = useState(false);
    const statusesArray = ['0', '1', '2', '3', '4', '-1'];

    const statuses = [
        {status: '1', name: "На друк"},
        {status: '3', name: "Готово"},
        {status: '4', name: "Віддати замовлення"}
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleCloseSearch = useCallback(() => {
        setShow(false);
    }, []);

    const handleSearch = useCallback(() => {
        setShow(true);
        setTypeSelect("")
    }, []);

    const preHandleThisOrderChange = (fieldName, event, value) => {
        const updatedThisOrder = thisOrder;
        updatedThisOrder[fieldName] = statuses[(currentIndex + 1) % statuses.length].status;
        setNewThisOrder(updatedThisOrder)
        setShow(false);
    };

    const preHandleThisOrderChange2 = (fieldName, event, value) => {
        const updatedThisOrder = thisOrder;
        updatedThisOrder[fieldName] = value;
        setNewThisOrder(updatedThisOrder)
        setShow(false);
    };

    const getStatusStyle = (status) => {
        const s = String(status);
        const c = STATUS_COLORS[s] || { color: '#ffffff', bg: '#ec3c23' };
        return { color: c.color, backgroundColor: c.bg };
    };

    const style = getStatusStyle(thisOrder.status);

    useEffect(() => {
        const index = statuses.map(statusObj => statusObj.status).indexOf(String(thisOrder.status));
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [thisOrder]);

    return (
        <div className="d-flex flex-row" style={{margin: "auto"}}>
            <div>
                <div style={style} className="btn adminFontTable borderR0">
                    {STATUS_LABELS[String(thisOrder.status)] || thisOrder.status}
                </div>
            </div>

            <div>
                {show === true ? (
                    <div style={{
                        border: "solid 1px #cccabf",
                        borderRadius: "0"
                    }}>
                        <div style={{
                            zIndex: "999",
                            position: "fixed",
                            background: "#dcd9ce",
                            marginTop: "-20vh",
                            marginLeft: "-10vw",
                            width: "40.3vw"
                        }} className="shadow-lg">
                            <div style={{
                                maxHeight: '34vh',
                                overflow: 'auto',
                            }}>
                                {statusesArray.map((thing, index) => (
                                    <div
                                        className="btn btn-sm btn-outline-light d-flex flex-row text-black hoverBlack"
                                        style={{
                                            border: "solid 1px #cccabf",
                                            borderRadius: "0",
                                            ...getStatusStyle(thing),
                                        }}
                                        key={thing + index}
                                        onClick={(event) => preHandleThisOrderChange2('status', event, thing)}
                                    >
                                        {STATUS_LABELS[thing] || thing}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{
                            width: "100vw",
                            zIndex: "1",
                            height: "100vh",
                            background: "black",
                            opacity: "20%",
                            position: "fixed",
                            left: "0",
                            bottom: "0"
                        }} onClick={handleCloseSearch}></div>
                    </div>
                ) : (
                    <div className="btn d-flex flex-row hoverBlack adminFontTable"
                         onClick={handleSearch}
                         style={{
                             border: "solid 1px #cccabf",
                             borderRadius: "0"
                         }}
                    >
                        Статус change(pick)
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusChanger;
