import React, {useCallback, useEffect, useState} from "react";
import Image from "react-bootstrap/Image";
import whiteSVG from "../../../whiteSVG.svg";
import axios from "axios";
import Form from "react-bootstrap/Form";

const ClientChanger = ({thisOrder, handleThisOrderChange, setNewThisOrder}) => {
    const [isLoad, setIsLoad] = useState(false);
    const [typeSelect, setTypeSelect] = useState("");
    const [users, setUsers] = useState([]);
    const [show, setShow] = useState(false);
    const [clientName, setClientName] = useState("false");
    const [clientPhone, setClientPhone] = useState("false");
    const [clientMessenger, setClientMessenger] = useState("false");

    const handleCloseSearch = useCallback(() => {
        setShow(false);
    }, []);

    const handleSearch = useCallback(() => {
        setShow(true);
        setTypeSelect("")
    }, []);

    const preHandleThisOrderChange = (fieldName, event, value) => {
        const updatedThisOrder = thisOrder;
        updatedThisOrder[fieldName] = value;
        setNewThisOrder(updatedThisOrder)
        setShow(false);
    };

    useEffect(() => {
        let data = {
            name: "Users",
            inPageCount: 99999,
            currentPage: 1,
            search: typeSelect
        };
        axios.post(`/admin/gettable`, data)
            .then(response => {
                console.log(response.data);
                setUsers(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [typeSelect]);
    useEffect(() => {
        setClientName(thisOrder.clientName)
        setClientPhone(thisOrder.clientPhone)
        setClientMessenger(thisOrder.clientMessenger)
    }, [thisOrder]);
    // console.log(thisOrder);

    return (
        <div>
            {show === true ? (
                <div>
                    <div style={{
                        height: '94vh',
                        zIndex: "999",
                        position: "fixed",
                        background: "#dcd9ce",
                        // top: "17.8vh",
                        // left: "60vw",
                        // width: "40vw",
                        marginTop: "-80vh",
                        width: "40.3vw"
                    }} className="shadow-lg">
                        <div style={{
                            height: '90vh',
                            overflow: 'auto',
                        }}>
                            {users.rows.map((thing, index) => (
                                <div
                                    className="btn btn-sm btn-outline-light d-flex flex-row text-black"
                                    style={{
                                        border: "solid 1px #cccabf",
                                        borderRadius: "0"
                                    }}
                                    key={thing.id + index}
                                    onClick={(event) => preHandleThisOrderChange('clientId', event, thing.id)}
                                >
                                    <div className="d-flex">
                                        <div className="adminFont btn btn-sm">
                                            Клієнт {thing.clientId} {thing.name}
                                        </div>
                                        <div className="adminFont btn btn-sm">
                                            Phone: {thing.phone}
                                        </div>
                                        <div className="adminFont btn btn-sm">
                                            Messenger: {thing.messenger}
                                        </div>
                                    </div>
                                    <Image className=""
                                           style={{width: "1.7vw", height: "1.7vw", marginLeft: "auto"}}
                                           src={whiteSVG} roundedCircle/>
                                </div>
                            ))}
                        </div>
                        <Form.Control
                            type="text"
                            placeholder={"Search..."}
                            value={typeSelect}
                            className="adminFontTable shadow-lg bg-transparent"
                            onChange={(event) => setTypeSelect(event.target.value)}
                            style={{border: "solid 1px #cccabf", borderRadius: "0"}}
                        />
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
                <div className="btn d-flex btn-sm btn-outline-light flex-row text-black"
                              onClick={handleSearch}
                              style={{
                                  // width: "40.5vw",
                                  border: "solid 1px #cccabf", borderRadius: "0"
                              }}
                >
                    <div className="adminFont btn btn-sm">
                        Клієнт {clientName}
                    </div>
                    <div className="adminFont btn btn-sm">
                        Phone: {clientPhone}
                    </div>
                    <div className="adminFont btn btn-sm">
                        Messenger: {clientMessenger}
                    </div>
                    <Image className=""
                           style={{width: "1.7vw", height: "1.7vw", marginLeft: "auto"}}
                           src={whiteSVG} roundedCircle/>
                </div>
            )}
        </div>
    );
};

export default ClientChanger;