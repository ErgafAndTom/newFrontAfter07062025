import React, {useCallback, useEffect, useState} from 'react';
import axios from '../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

function ModalDeleteOrderUnit({showDeleteOrderUnitModal, setShowDeleteOrderUnitModal, OrderUnit, setSelectedThings2, setThisOrder}) {
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(showDeleteOrderUnitModal);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);

    const handleClose = () => {
        setShowDeleteOrderUnitModal(false);
    }

    const handleShow = useCallback((event) => {
        setShowDeleteOrderUnitModal(true);
    }, []);

    const deleteThis = () => {
        let idKey = OrderUnit.idKey
        setLoad(true)
        setError(null)
        axios.delete(`/orderUnits/OneOrder/OneOrderUnitInOrder/${idKey}`)
            .then(response => {
                if (response.status === 200) {
                    setSelectedThings2(prevSelectedThings2 =>
                        prevSelectedThings2.filter(orderUnit => orderUnit.idKey !== idKey)
                    );
                    // console.log(response.data);
                    setThisOrder(response.data)
                    setLoad(false)
                    setShowDeleteOrderUnitModal(false);
                }
            })
            .catch(error => {
                setLoad(false)
                setError(error.message)
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            });
    };

    useEffect(() => {
        if (showDeleteOrderUnitModal) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showDeleteOrderUnitModal]);

    return (
        <>
            {isVisible  === true ? (
                <div>
                    <div
                        style={{
                            width: "100vw",
                            zIndex: "9999",
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
                                zIndex: "10099", // модальное окно поверх затемненного фона
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
                            Видалити {OrderUnit.name}, {OrderUnit.count}Шт, за ціною {OrderUnit.priceForThis}грн?
                        </div>
                        <div
                            className="d-flex justify-content-center align-content-center"
                            style={{
                                borderRadius: "0 0 1vw 1vw",
                                background: '#F2F0E7',
                                padding: "0.5vw",
                            }}
                        >
                            <button
                                className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                style={{
                                    padding: "0.5vw",
                                    margin: "0.5vw",
                                }}
                                onClick={handleClose}>Закрити
                            </button>
                            <button
                                className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                style={{
                                    padding: "0.5vw",
                                    margin: "0.5vw",
                                    background: '#ff5d5d',
                                }}
                                onClick={deleteThis}
                            >
                                Видалити
                                {load && (
                                    <Spinner animation="border" variant="danger" size="sm"/>
                                )}
                            </button>
                        </div>
                        {error && (
                            <div style={{color: 'red', fontSize: '0.7vw', marginTop: '1vh'}}>{error}</div>
                        )}
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

export default ModalDeleteOrderUnit;
