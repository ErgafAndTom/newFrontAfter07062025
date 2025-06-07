import React, {useCallback, useEffect, useState} from 'react';
import axios from '../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";

function ModalDeleteOrder({thisOrderForDelete, showDeleteOrderModal, setThisOrderForDelete, setShowDeleteOrderModal, data, setData, url}) {
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(showDeleteOrderModal);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);

    const handleClose = () => {
        setShowDeleteOrderModal(false);
    }

    const handleShow = useCallback((event) => {
        setShowDeleteOrderModal(true);
    }, []);

    const deleteThis = () => {
        let id = thisOrderForDelete.id
        setLoad(true)
        axios.delete(`${url}/${id}`)
            .then(response => {
                if (response.status === 200) {
                    setData(prevData => prevData.filter(order => order.id !== id));
                    setLoad(false)
                    setShowDeleteOrderModal(false);
                }
            })
            .catch(error => {
                // if(error.response.status === 403){
                //     navigate('/login');
                // }
                console.log(error.message);
                setLoad(false)
                setError(error.message)
            });
    };

    useEffect(() => {
        if (showDeleteOrderModal) {
            setIsVisible(true); // Сначала показываем модальное окно
            // setError(null)
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showDeleteOrderModal]);

    return (
        <>
            {isVisible  === true ? (
                <div>
                    <div
                        style={{
                            width: "100vw",
                            zIndex: "99",
                            height: "100vh",
                            background: "rgba(0, 0, 0, 0.5)",
                            opacity: isAnimating ? 1 : 0, // для анимации прозрачности
                            transition: "opacity 0.3s ease-in-out", // плавная анимация
                            position: "fixed",
                            left: "0",
                            bottom: "0"
                        }}
                        onClick={handleClose}
                    ></div>

                    <div
                        style={
                            {
                                zIndex: "100", // модальное окно поверх затемненного фона
                                position: "fixed",
                                background: "#dcd9ce",
                                top: "20%",
                                left: "50%",
                                borderRadius: "1vw",
                                maxWidth: "90vw", // ограничение по ширине
                                padding: "0.5vw",
                                transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -30%) scale(0.8)", // анимация масштаба
                                opacity: isAnimating ? 1 : 0, // анимация прозрачности
                                transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                            }
                        }
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: "flex-end",
                                padding: "0 0 0.3vw 0.3vw",
                            }}
                        >
                            <div
                                className="btn btn-lg btn-close"
                                onClick={handleClose}
                            ></div>
                        </div>
                        <div
                            style={{
                                padding: "0.5vw",
                                background: '#F2F0E7',
                                borderRadius: "1vw 1vw 0 0",
                                // borderRadius: "1vw",
                            }}
                        >
                            Видалити {thisOrderForDelete.name}
                            {thisOrderForDelete.count && (
                                <>, {thisOrderForDelete.count}Шт</>
                            )}
                            {thisOrderForDelete.priceForThis && (
                                <>, за ціною {thisOrderForDelete.priceForThis}грн?</>
                            )}
                        </div>
                        <div
                            className="d-flex justify-content-center align-content-center"
                            style={{
                                borderRadius: "0 0 1vw 1vw",
                                background: '#F2F0E7',
                                padding: "0.5vw",
                            }}
                        >
                            {!load && (
                                <button
                                    className="adminButtonAdd hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                    onClick={handleClose}>Закрити
                                </button>
                            )}
                            {load && (
                                <button
                                    disabled
                                    className="adminButtonAdd hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                >Видалення {thisOrderForDelete.name}</button>
                            )}
                            {error && (
                                <button
                                    disabled
                                    className="adminButtonAdd hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                >{error}</button>
                            )}
                            {!load && (
                                <button
                                    className="adminButtonAdd hoverOrange"
                                    style={{
                                        background: '#ff5d5d',
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                    onClick={deleteThis}>Видалити</button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    style={{display: "none"}}
                ></div>
            )}
        </>
    )
}

export default ModalDeleteOrder;