// ModalDeleteList.jsx
import React, { useState, useCallback, useEffect } from 'react';

const ModalDeleteList = ({
                             listToDelete,
                             showDeleteListModal,
                             setShowDeleteListModal,
                             removeList,
                             deleting
                         }) => {
    const [load, setLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(showDeleteListModal);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowDeleteListModal(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }

    const deleteThisList = async () => {
        setLoad(true);
        try {
            await removeList(listToDelete.id);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoad(false);
            setShowDeleteListModal(false);
        }
    };

    useEffect(() => {
        if (showDeleteListModal) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 100);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [showDeleteListModal]);

    return (
        <>
            {isVisible ? (
                <div>
                    <div
                        style={{
                            width: "100vw",
                            zIndex: "99",
                            height: "100vh",
                            background: "rgba(0, 0, 0, 0.5)",
                            opacity: isAnimating ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out",
                            position: "fixed",
                            left: "0",
                            bottom: "0"
                        }}
                        onClick={handleClose}
                    ></div>
                    <div
                        style={{
                            zIndex: "100",
                            position: "fixed",
                            background: "#dcd9ce",
                            top: "20%",
                            left: "50%",
                            borderRadius: "1vw",
                            maxWidth: "90vw",
                            padding: "0.5vw",
                            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -30%) scale(0.8)",
                            opacity: isAnimating ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                        }}
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
                            }}
                        >
                            Вы действительно хотите удалить список <strong>{listToDelete.title}</strong>?
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
                                    className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                    onClick={handleClose}
                                >
                                    Закрыть
                                </button>
                            )}
                            {load && (
                                <button
                                    disabled
                                    className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                >
                                    Удаляем {listToDelete.title}
                                </button>
                            )}
                            {error && (
                                <button
                                    disabled
                                    className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                    }}
                                >
                                    {error}
                                </button>
                            )}
                            {!load && (
                                <button
                                    className="adminFontTable d-flex justify-content-center align-content-center hoverOrange"
                                    style={{
                                        padding: "0.5vw",
                                        margin: "0.5vw",
                                        background: '#ff5d5d',
                                    }}
                                    onClick={deleteThisList}
                                    disabled={deleting}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: "none" }}></div>
            )}
        </>
    );
};

export default ModalDeleteList;
