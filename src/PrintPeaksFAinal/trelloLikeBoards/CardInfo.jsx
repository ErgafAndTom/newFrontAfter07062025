import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../../api/axiosInstance";
import NewSheetCut from "../poslugi/NewSheetCut";
import {Spinner} from "react-bootstrap";
import ForUserOrder from "./ForUserOrder";
import AddContrAgentInProfileAdmin from "../userInNewUiArtem/pays/AddContrAgentInProfileAdmin";

// Компонент лайтбоксу для перегляду зображень
function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev }) {
    if (currentIndex === -1) return null;

    const currentImage = images[currentIndex];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                cursor: 'pointer'
            }}
            onClick={onClose}
        >
            {/* Кнопка закриття */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    zIndex: 1001
                }}
            >
                ✕
            </button>

            {/* Кнопка попереднього зображення */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        color: 'white',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        padding: '10px 15px',
                        borderRadius: '50%',
                        zIndex: 1001
                    }}
                >
                    ‹
                </button>
            )}

            {/* Кнопка наступного зображення */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        color: 'white',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        padding: '10px 15px',
                        borderRadius: '50%',
                        zIndex: 1001
                    }}
                >
                    ›
                </button>
            )}

            {/* Саме зображення */}
            <img
                src={`/images/${currentImage.photoLink}`}
                alt="photo"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    cursor: 'default'
                }}
            />

            {/* Лічильник зображень */}
            {images.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '1rem'
                    }}
                >
                    {currentIndex + 1} з {images.length}
                </div>
            )}
        </div>
    );
}

// Компонент для списка загруженных изображений
function ImageList({images, onRemove, onImageClick}) {
    if (images.length === 0) {
        return ;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "0.5vw",
          maxHeight: "50vh",
          overflowY: "auto",
          paddingRight: "1vw",
        }}
      >
        {images.map((img, index) => (
          <div
            key={img.id}
            style={{
              position: "relative",
              width: "5vw",
              height: "10vh",
              border: "1px solid #ccc",
              borderRadius: "0.5vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={`/images/${img.photoLink}`}
              alt="photo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
              onClick={() => onImageClick(index)}
            />
            <button
              onClick={() => onRemove(img.id)}
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                backgroundColor: "transparent",
                color: "#ff3333",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: "0.2rem"
              }}
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    );
}

// Общий контейнер карточки
export default function CardInfo({
                                     openCardData,
                                     setOpenCardInfo,
                                     setServerData,
                                     serverData,
                                     handleLocalCardEdit,
                                     setSaving,
                                     saving,
                                     shouldCloseAfterSave,
                                     setShouldCloseAfterSave,
                                     handleBlurCardContentSave,
                                     removeCard
                                 }) {

    const [cardName, setCardName] = useState(openCardData.name);
    const [textContent, setTextContent] = useState(openCardData.content);
    const [images, setImages] = useState(openCardData.inTrelloPhoto);
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAddPay, setShowAddPay] = useState(false);
    const [loadingImageIds, setLoadingImageIds] = useState(new Set());

    // Стани для лайтбоксу
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    // Функції для керування лайтбоксом
    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(-1);
    };

    const nextImage = () => {
        setLightboxIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleClose = () => {
        if (saving) {
            setShouldCloseAfterSave(true);
        } else {
            setIsAnimating(false);
            setTimeout(() => {
                setIsVisible(false);
                setOpenCardInfo(false);
            }, 300);
        }
    };

    const openAddPay = () => {
        setShowAddPay(!showAddPay);
    };

    useEffect(() => {
        if (!saving && shouldCloseAfterSave) {
            setIsAnimating(false);
            setTimeout(() => {
                setIsVisible(false);
                setOpenCardInfo(false);
            }, 300);
            setShouldCloseAfterSave(false);
        }
    }, [saving, setOpenCardInfo, setShouldCloseAfterSave, shouldCloseAfterSave]);

    // Удаляем изображение из массива по id
    const handleRemoveImage = (id) => {
        const fetchData = async () => {
            try {
                setLoad(true)
                setError(null)
                const res = await axios.delete(`/trello/${id}/contentPhoto`);
                console.log(res.data);
                if (res.status === 200) {
                    setServerData(prevLists =>
                        prevLists.map(list => ({
                            ...list,
                            Cards: list.Cards.map(card =>
                                card.id === openCardData.id
                                    ? {...card, inTrelloPhoto: card.inTrelloPhoto.filter(photo => photo.id !== id)}
                                    : card
                            )
                        }))
                    );
                    setImages((prev) => prev.filter((img) => img.id !== id));
                    setLoad(false)
                } else {
                    setLoad(false)
                    setError("Не пришло 200.. но и не ошибка. это странно!")
                }
            } catch (error) {
                console.error('Помилка завантаження фото:', error);
                setLoad(false)
                setError(error.message)
            }
        };
        fetchData();
    };

    const uploadPhoto = async (cardId, photo) => {
        const tempId = `${cardId}-${Date.now()}-${photo.name}`;
        setLoadingImageIds(prev => new Set(prev).add(tempId));

        const formData = new FormData();
        formData.append("file", photo);

        try {
            const res = await axios.post(`/trello/${cardId}/contentPhoto`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setServerData(prevLists =>
                prevLists.map(list => ({
                    ...list,
                    Cards: list.Cards.map(card =>
                        card.id === cardId
                            ? { ...card, inTrelloPhoto: [...card.inTrelloPhoto, res.data] }
                            : card
                    )
                }))
            );
            setImages(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Помилка завантаження фото:", error);
            setError(error.message);
        } finally {
            setLoadingImageIds(prev => {
                const updated = new Set(prev);
                updated.delete(tempId);
                return updated;
            });
        }
    };

    const deleteThisCard = async (listId, cardId) => {
        setLoad(true);
        try {
            await removeCard(listId, cardId);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoad(false);
            handleClose()
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
            {/* Лайтбокс для перегляду зображень */}
            <ImageLightbox
                images={images}
                currentIndex={lightboxIndex}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />

            {isVisible === true ? (
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
                        className="d-flex flex-column" style={{
                        zIndex: "100",
                        position: "fixed",
                        background: "#f2f0e7",
                        top: "50%",
                        left: "50%",
                        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)",
                        opacity: isAnimating ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                        borderRadius: "1vh",
                        maxWidth: "60vw",
                        maxHeight: "80vh",
                        padding: "0.7vw"
                    }}
                    >
                        <div className="d-flex justify-content-around">
                            <div>
                                <textarea
                                    onChange={(e) => handleLocalCardEdit(
                                        openCardData.listId,
                                        openCardData.id,
                                        e.target.value
                                    )}
                                    onBlur={(e) => handleBlurCardContentSave(
                                        openCardData.listId,
                                        openCardData.id,
                                        e.target.value
                                    )}
                                    value={openCardData.content}
                                    style={{
                                        width: "36vw",
                                        height: "20vh",
                                        maxHeight: "20vh",
                                        border: "none",
                                        borderRadius: "0.5vw",
                                        padding: "0.5vw",
                                        background:'#fbfaf6'
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
                                                    console.error("Ошибка загрузки изображения из буфера обмена", err);
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {saving &&
                            <div>
                                <Spinner animation="border" variant="danger" size="sm"/>
                            </div>
                        }
                        {error &&
                            <div>
                                {error}
                            </div>
                        }

                        <ImageList
                            images={images}
                            onRemove={handleRemoveImage}
                            onImageClick={openLightbox}
                        />

                        <div className="d-flex align-items-center justify-content-between">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    const validImages = files.filter(file => file.type.startsWith("image/"));
                                    validImages.forEach((file) => uploadPhoto(openCardData.id, file));
                                    e.target.value = null;
                                }}
                                style={{
                                    width: "50%",
                                    border: "none",
                                }}
                            />
                        </div>

                        <div className="d-flex justify-content-between" style={{}}>
                            <button className="adminButtonAdd justify-content-start" onClick={openAddPay} style={{}}>
                                {openCardData && openCardData.assignedTo && (
                                    <div style={{}}>
                                        Кому: {openCardData.assignedTo.username} {openCardData.assignedTo.firstName} {openCardData.assignedTo.lastName} {openCardData.assignedTo.familyName} {openCardData.assignedTo.email}
                                    </div>
                                )}
                            </button>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <div style={{ height: "3vh", width: "9vw" }}>
                                        {load && (
                                            <Spinner
                                                animation="border"
                                                variant="warning"
                                                size="sm"
                                                style={{
                                                    height: "2.5vh",
                                                    width: "2.5vh",
                                                    marginLeft: "auto",
                                                    marginRight: "auto",
                                                    display: "block"
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="border-0 btn btn-danger d-flex align-items-center justify-content-center adminButtonAdd"
                                    style={{
                                        marginTop: "1vh",
                                        backgroundColor: "#ee3c23",
                                        height: "3vh",
                                        borderRadius: "0.5vw",
                                    }}
                                    onClick={() => deleteThisCard(openCardData.listId, openCardData.id)}
                                >
                                    Видалити завдання
                                </button>
                            </div>
                        </div>
                    </div>
                    {showAddPay && (
                        <ForUserOrder
                            showAddPay={showAddPay}
                            setShowAddPay={setShowAddPay}
                            openCardData={openCardData}
                        />
                    )}
                </div>
            ) : (
                <div style={{display: "none"}}></div>
            )}
        </>
    )
}
