import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import axios from "../../api/axiosInstance";

// Компонент для списка загруженных изображений
function ImageList({ images, onRemove }) {
    if (images.length === 0) {
        return <li>Нет загруженных изображений</li>;
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxHeight: "50vh",
            overflowY: "auto",
            position: "relative",
            paddingRight: "2.5rem"
        }}>
            {images.map((img) => (
                <div
                    key={img.id}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "0.5rem",
                        borderBottom: "1px solid #ccc",
                        position: "relative",
                        cursor: "pointer"
                    }}
                >
                    <img
                        src={`/images/${img.photoLink}`}
                        alt="photo"
                        style={{
                            width: "100%",
                            maxHeight: "30vh",
                            objectFit: "cover"
                        }}
                        onClick={() => window.open(`/images/${img.photoLink}`, '_blank')}
                    />
                    <button
                        onClick={() => onRemove(img.id)}
                        style={{
                            position: "absolute",
                            right: "-5%",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "transparent",
                            color: "#ff3333",
                            border: "none",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            padding: "0.5rem"
                        }}
                    >
                        ✖
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function CardInfo({
                                     openCardData,
                                     setOpenCardInfo,
                                     setServerData,
                                     serverData,
                                     handleCardContentChange,
                                     removeCard
                                 }) {
    const [textContent, setTextContent] = useState(openCardData.content);
    const [images, setImages] = useState(openCardData.InLifeHackPhotos || []);
    const [load, setLoad] = useState(false);
    const fileInputRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            setOpenCardInfo(false);
        }, 300);
    };

    const handleRemoveImage = async (id) => {
        try {
            setLoad(true);
            setError(null);
            const res = await axios.delete(`/lifehack/${id}/contentPhoto`);
            if (res.status === 200) {
                setServerData(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        LifeHackCards: list.LifeHackCards.map(card =>
                            card.id === openCardData.id
                                ? {
                                    ...card,
                                    InLifeHackPhotos: card.InLifeHackPhotos.filter(photo => photo.id !== id)
                                }
                                : card
                        )
                    }))
                );
                setImages(prev => prev.filter(img => img.id !== id));
            } else {
                setError("Не прийшов 200, але й не помилка. Дивно!");
            }
        } catch (error) {
            console.error('Помилка видалення фото:', error);
            setError(error.message);
        } finally {
            setLoad(false);
        }
    };

    const uploadPhoto = async (cardId, photo) => {
        const formData = new FormData();
        formData.append('file', photo);

        try {
            setLoad(true);
            setError(null);
            const res = await axios.post(`/lifehack/${cardId}/contentPhoto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setServerData(prevLists =>
                prevLists.map(list => ({
                    ...list,
                    LifeHackCards: list.LifeHackCards.map(card =>
                        card.id === cardId
                            ? {
                                ...card,
                                InLifeHackPhotos: [...card.InLifeHackPhotos, res.data]
                            }
                            : card
                    )
                }))
            );
            setImages(prev => [...prev, res.data]);
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
            setError(error.message);
        } finally {
            setLoad(false);
        }
    };

    const deleteThisCard = async () => {
        setLoad(true);
        try {
            await removeCard(openCardData.LifeHackListId, openCardData.id);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoad(false);
            handleClose();
        }
    };

    useEffect(() => {
        if (openCardData) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 100);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [openCardData]);

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
                        className="d-flex flex-column"
                        style={{
                            zIndex: "100",
                            position: "fixed",
                            background: "#dcd9ce",
                            top: "50%",
                            left: "50%",
                            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)",
                            opacity: isAnimating ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                            borderRadius: "1vw",
                            maxWidth: "60vw",
                            maxHeight: "80vh",
                            padding: "0.7vw"
                        }}
                    >
                        <div className="d-flex justify-content-around">
                            <textarea
                                onChange={(e) =>
                                    handleCardContentChange(
                                        openCardData.LifeHackListId,
                                        openCardData.id,
                                        e.target.value
                                    )
                                }
                                value={openCardData.content}
                                style={{
                                    width: "36vw",
                                    height: "20vh",
                                    maxHeight: "20vh",
                                    border: "none",
                                    borderRadius: "0.5vw",
                                    padding: "0.5vw",
                                }}
                                onPaste={async (e) => {
                                    const clipboardFiles = e.clipboardData.files;
                                    if (clipboardFiles && clipboardFiles.length > 0) {
                                        const file = clipboardFiles[0];
                                        if (file && file.type.startsWith("image/")) {
                                            e.preventDefault();
                                            try {
                                                await uploadPhoto(openCardData.id, file);
                                                setSelectedImage(null);
                                            } catch (err) {
                                                console.error("Помилка при вставці зображення з буфера", err);
                                            }
                                        }
                                    }
                                }}
                            />
                            <div
                                className="btn btn-close btn-lg"
                                style={{ marginLeft: "0.5vw" }}
                                onClick={handleClose}
                            />
                        </div>

                        {load && <Spinner animation="border" variant="danger" size="sm" />}
                        {error && <div>{error}</div>}

                        <ImageList images={images} onRemove={handleRemoveImage} />

                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.type.startsWith('image/')) {
                                        setSelectedImage(file);
                                    } else {
                                        setSelectedImage(null);
                                    }
                                }}
                                style={{ width: "50%", border: "none" }}
                            />
                            <button
                                disabled={!selectedImage}
                                className="border-0 btn btn-success d-flex align-items-center justify-content-center"
                                style={{
                                    height: "3vh",
                                    borderRadius: "0.5vw",
                                }}
                                onClick={() => uploadPhoto(openCardData.id, selectedImage)}
                            >
                                {selectedImage ? "Завантажити" : "Очікую img.."}
                            </button>
                        </div>

                        <div className="d-flex justify-content-end">
                            <button
                                className="border-0 btn btn-danger d-flex align-items-center justify-content-center"
                                style={{
                                    marginTop: "1vh",
                                    height: "3vh",
                                    borderRadius: "0.5vw",
                                }}
                                onClick={deleteThisCard}
                            >
                                Видалити карточку
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: "none" }} />
            )}
        </>
    );
}
