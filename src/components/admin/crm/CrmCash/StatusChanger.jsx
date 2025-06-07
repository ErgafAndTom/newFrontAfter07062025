import React, {useCallback, useEffect, useState} from "react";
import Image from "react-bootstrap/Image";
import whiteSVG from "../../../whiteSVG.svg";
import Form from "react-bootstrap/Form";

const StatusChanger = ({thisOrder, handleThisOrderChange, setNewThisOrder}) => {
    const [isLoad, setIsLoad] = useState(false);
    const [typeSelect, setTypeSelect] = useState("");
    const [users, setUsers] = useState([]);
    const [show, setShow] = useState(false);
    let statusesArray = [
        "створено",
        "В роботі",
        "Зроблено",
        "Відвантажено",
        "Відміна",
    ]

    const statuses = [
        {status: 'В роботі', name: "Взяти у роботу"},
        {status: 'Зроблено', name: "Готово"},
        {status: "Відвантажено", name: "Віддати замовлення"}
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

    const style = {
        color:
            thisOrder.status === 'створено' ? '#000000' :
                thisOrder.status === 'В роботі' ? '#00ffe7' :
                    thisOrder.status === 'Зроблено' ? '#ffffff' :
                        thisOrder.status === 'Відвантажено' ? '#ffea00' :
                            thisOrder.status === 'Відміна' ? '#72ff00' :
                                '#ffffff',
        backgroundColor:
            thisOrder.status === 'створено' ? 'rgba(255,255,255,0)' :
                thisOrder.status === 'В роботі' ? '#f8b316' :
                    thisOrder.status === 'Зроблено' ? '#008148' :
                        thisOrder.status === 'Відвантажено' ? '#3c5fa5' :
                            thisOrder.status === 'Відміна' ? '#ee74a9' :
                                '#ec3c23',
    };

    useEffect(() => {
        const index = statuses.map(statusObj => statusObj.status).indexOf(thisOrder.status);
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [thisOrder]);

    // remaining part of the component

    return (
        <div className="d-flex flex-row" style={{margin: "auto"}}>
            <div style={{
                // border: "solid 1px #cccabf",
                // borderRadius: "0"
            }}>
                <div style={style} className="btn adminFontTable borderR0">
                    {thisOrder.status}
                </div>
                {/*<div style={{*/}
                {/*    border: "solid 1px #cccabf",*/}
                {/*    borderRadius: "0"*/}
                {/*}} className="btn adminFontTable hoverBlack" onClick={(event) => preHandleThisOrderChange('status', event)}>*/}
                {/*    {statuses[currentIndex].name}*/}
                {/*</div>*/}
            </div>

            <div>
                {show === true ? (
                    <div style={{
                        border: "solid 1px #cccabf",
                        borderRadius: "0"
                    }}>
                        <div style={{
                            // maxHeight: '34vh',
                            zIndex: "999",
                            position: "fixed",
                            background: "#dcd9ce",
                            // top: "17.8vh",
                            // left: "60vw",
                            // width: "40vw",
                            marginTop: "-20vh",
                            marginLeft: "-10vw",
                            width: "40.3vw"
                        }} className="shadow-lg">
                            <div style={{
                                // height: '30vh',
                                maxHeight: '34vh',
                                overflow: 'auto',
                            }}>
                                {statusesArray.map((thing, index) => (
                                    <div
                                        className="btn btn-sm btn-outline-light d-flex flex-row text-black hoverBlack"
                                        style={{
                                            border: "solid 1px #cccabf",
                                            borderRadius: "0",
                                            color:
                                                thing === 'створено' ? '#000000' :
                                                    thing === 'В роботі' ? '#00ffe7' :
                                                        thing === 'Зроблено' ? '#ffffff' :
                                                            thing === 'Відвантажено' ? '#ffea00' :
                                                                thing === 'Відміна' ? '#72ff00' :
                                                                    '#ffffff',
                                            backgroundColor:
                                                thing === 'створено' ? 'rgba(255,255,255,0)' :
                                                    thing === 'В роботі' ? '#f8b316' :
                                                        thing === 'Зроблено' ? '#008148' :
                                                            thing === 'Відвантажено' ? '#3c5fa5' :
                                                                thing === 'Відміна' ? '#ee74a9' :
                                                                    '#ec3c23',
                                        }}
                                        key={thing + index}
                                        onClick={(event) => preHandleThisOrderChange2('status', event, thing)}
                                    >
                                        {thing}
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