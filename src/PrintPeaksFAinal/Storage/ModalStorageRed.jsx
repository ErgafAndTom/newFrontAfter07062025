import React, {useEffect, useState} from 'react';
import Form from "react-bootstrap/Form";
import axios from '../../api/axiosInstance';
import StatusBar from "../Orders/StatusBar";
import {useNavigate} from "react-router-dom";
import {translateColumnName} from './translations';

const ModalStorageRed = ({
                             tableName,
                             item,
                             tablPosition,
                             setData,
                             inPageCount,
                             currentPage,
                             setPageCount,
                             itemData,
                             url,
                             thisColumn,
                             typeSelect,
                             setShowRed,
                             showRed,
                             event, thisItemForModal, thisMetaItemForModal
                         }) => {
    const navigate = useNavigate();
    const [modalInput, setModalInput] = useState(itemData);
    const [modalStyle, setModalStyle] = useState({
        zIndex: "999",
        position: "fixed",
        background: "#dcd9ce",
        top: `${0}px`,
        left: `${0}px`
    });
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const handleCloseModal = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowRed(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }

    // const handleCloseModal = useCallback(() => {
    //     setShowRed(false);
    // }, []);

    // const handleOpenModal = useCallback((event) => {
    //     event.preventDefault();
    //     setModalStyle({
    //         zIndex: "999",
    //         position: "fixed",
    //         background: "#dcd9ce",
    //         top: `${event.pageY}px`,
    //         left: `${event.pageX}px`
    //     });
    //     setShowRed(true);
    //     setModalInput(itemData)
    // }, []);

    useEffect(() => {
        setModalStyle({
            ...modalStyle,
            top: `${event.pageY}px`,
            left: `${event.pageX}px`
        });
        setModalInput(thisItemForModal[thisMetaItemForModal])
    }, [showRed]);

    let saveThis = (event) => {
        let data = {
            tableName: tableName,
            id: thisItemForModal.id,
            tablePosition: thisMetaItemForModal,
            input: modalInput,
            search: typeSelect,
            inPageCount: inPageCount,
            currentPage: currentPage,
            columnName: thisColumn
        }
        if (modalInput === "") {
            data.input = 0
        }
        console.log(data);
        console.log(url);
        setError(null)
        setLoad(true)
        axios.put(url, data)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                setPageCount(Math.ceil(response.data.count / inPageCount))
                setLoad(false)
                setShowRed(false)
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message)
                setLoad(false)
                console.log(error.message);
            })
    }

    if (tablPosition === "id") {
        return (
            <div style={{overflow: 'hidden', whiteSpace: "nowrap", textOverflow: "ellipsis", background: "transparent"}}
                 className="adminFontTable d-flex align-content-center justify-content-center m-auto p-0">{itemData}</div>
        )
    }
    if (tablPosition === "password") {
        return (
            <div style={{
                overflow: 'hidden',
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                background: "transparent",
                maxWidth: "2vw"
            }} className="adminFontTable d-flex align-content-center justify-content-center m-auto p-0">{itemData}</div>
        )
    }
    if (tablPosition === "createdAt") {
        return (
            <div style={{overflow: 'hidden', whiteSpace: "nowrap", textOverflow: "ellipsis", background: "transparent"}}
                 className="adminFontTable d-flex align-content-center justify-content-center m-auto p-0">
                {`${new Date(itemData).toLocaleDateString()} ${new Date(itemData).toLocaleTimeString()}`}
            </div>
        )
    }
    if (tablPosition === "updatedAt") {
        return (
            <div style={{overflow: 'hidden', whiteSpace: "nowrap", textOverflow: "ellipsis", background: "transparent"}}
                 className="adminFontTable d-flex align-content-center justify-content-center m-auto p-0">
                {`${new Date(itemData).toLocaleDateString()} ${new Date(itemData).toLocaleTimeString()}`}
            </div>
        )
    }
    if (tablPosition === "photo") {
        return (
            <div style={{overflow: 'hidden', whiteSpace: "nowrap", textOverflow: "ellipsis", background: "transparent"}}
                 className="adminFontTable d-flex align-content-center justify-content-center m-auto p-0">{itemData}</div>
        )
    }


    if (tablPosition === "status") {
        return (
            <StatusBar item={item}/>
        )
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (showRed) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showRed]);

    if (thisItemForModal) {
        return (
            <>
                {isVisible === true ? (
                    <div className="">
                        <div style={{
                            width: "100vw",
                            zIndex: "99",
                            height: "100vh",
                            background: "transparent",
                            // opacity: isAnimating ? 1 : 0, // для анимации прозрачности
                            // transition: "opacity 0.1s ease-in-out", // плавная анимация
                            position: "fixed",
                            left: "0",
                            bottom: "0"
                        }} onClick={handleCloseModal}></div>
                        <div style={{
                            ...modalStyle,
                            zIndex: "100", // модальное окно поверх затемненного фона

                            background: "#FBFAF6",
                            borderRadius: "0.7vw",
                            maxWidth: "90vw", // ограничение по ширине
                            padding: "0.5vw",
                            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -30%) scale(0.8)", // анимация масштаба
                            // opacity: isAnimating ? 1 : 0, // анимация прозрачности
                            // transition: "opacity 0.1s ease-in-out, transform 0.1s ease-in-out", // плавная анимация
                        }} className="shadow-lg">
                            <div style={{
                                // height: '90vh',
                                // overflow: 'auto',
                            }}>
                                <Form.Control
                                    type="text"
                                    placeholder={"Значення..."}
                                    value={modalInput}
                                    className="adminFontTable shadow-lg bg-transparent"
                                    onChange={(event) => setModalInput(event.target.value)}
                                    style={{border: "none", borderRadius: "0"}}
                                />
                                <button className="adminFontTable"
                                        onClick={handleCloseModal} style={{borderRadius: "1vw", border:'none'}}>Закрити
                                </button>
                                {load && (<>
                                    <button disabled className="adminFontTable" style={{borderRadius: "1vw", border:'none'}}>Збереження
                                        змін</button>
                                </>)}
                                {!load && (
                                    <>
                                    <button className="adminFontTable" onClick={saveThis} style={{borderRadius: "1vw", border:'none'}}>Зберегти
                                        зміни</button>
                                    </>
                                )}
                                {error && (
                                    <div style={{
                                        background: "#ff0000",
                                        color: "black"
                                    }} className="adminFontTable" >{error}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        // className="adminFontTable redStorageItem d-flex align-content-center justify-content-center m-auto p-0"
                        // className="CustomOrderTable-cell"
                        className="d-none"
                        // style={{
                        //     overflow: 'hidden',
                        //     whiteSpace: "nowrap",
                        //     textOverflow: "ellipsis",
                        //     height: "100%",
                        // }}
                        // >
                        // {itemData}
                        // <img src={redIcon} alt="red" className="redIcon"/>
                    >
                    </div>
                )}
            </>
        )
    }
};

export default ModalStorageRed