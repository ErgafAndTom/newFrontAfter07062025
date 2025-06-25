import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../../api/axiosInstance";
import NewSheetCut from "../poslugi/NewSheetCut";
import {Spinner} from "react-bootstrap";
import ForUserOrder from "./ForUserOrder";
import AddContrAgentInProfileAdmin from "../userInNewUiArtem/pays/AddContrAgentInProfileAdmin";

// Компонент для списка загруженных изображений
function ImageList({images, onRemove}) {
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
    const handleClose = () => {
        if (saving) {
            setShouldCloseAfterSave(true); // попросити закрити після завершення збереження
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
            setShouldCloseAfterSave(false); // скидаємо флаг
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
        const formData = new FormData();
        formData.append('file', photo);

        const fetchData = async () => {
            try {
                setLoad(true)
                setError(null)
                const res = await axios.post(`/trello/${cardId}/contentPhoto`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(res.data);

                // Update the card with the new photo in the server data
                setServerData(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        Cards: list.Cards.map(card =>
                            card.id === cardId ? {...card, inTrelloPhoto: [...card.inTrelloPhoto, res.data]} : card
                        )
                    }))
                );
                setImages((prev) => [...prev, res.data]);
                setLoad(false)
            } catch (error) {
                console.error('Помилка завантаження фото:', error);
                setLoad(false)
                setError(error.message)
            }
        };
        fetchData();
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

    // useEffect(() => {
    //     setImages(openCardData.inTrelloPhoto)
    // }, [serverData]);

    useEffect(() => {
        if (openCardData) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [openCardData]);

    return (
        <>
            {isVisible === true ? (
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
                        className="d-flex flex-column" style={{
                        zIndex: "100",
                        position: "fixed",
                        background: "#dcd9ce",
                        top: "50%",
                        left: "50%",
                        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                        opacity: isAnimating ? 1 : 0, // анимация прозрачности
                        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                        borderRadius: "1vw",
                        maxWidth: "60vw",
                        maxHeight: "80vh",
                        padding: "0.7vw"
                    }}
                    >
                        <div className="d-flex justify-content-around">
                            <div>
                                <textarea
                                    // onChange={(e) =>
                                    //     handleCardContentChange(
                                    //         openCardData.listId,
                                    //         openCardData.id,
                                    //         e.target.value
                                    //     )
                                    // }
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
                                    }}
                                    onPaste={async (e) => {
                                        const clipboardFiles = e.clipboardData.files;
                                        if (clipboardFiles && clipboardFiles.length > 0) {
                                            // Если буфер содержит файлы
                                            const file = clipboardFiles[0];
                                            if (file && file.type.startsWith("image/")) {
                                                // Предотвращаем стандартную вставку текста, чтобы не вставлялся маркер изображения
                                                e.preventDefault();
                                                try {
                                                    await uploadPhoto(openCardData.id, file);
                                                    // Если нужно, можно обновить локальное состояние изображений, например:
                                                    // handleUpload([res.data.photo]);
                                                    setSelectedImage(null);
                                                } catch (err) {
                                                    console.error("Ошибка загрузки изображения из буфера обмена", err);
                                                }
                                            }
                                        }
                                        // Если файлы отсутствуют, стандартное поведение (вставка текста) остаётся
                                    }}
                                />
                            </div>
                            <div
                                className="btn btn-close btn-lg"
                                style={{
                                    marginLeft: "0.5vw",
                                }}
                                onClick={handleClose}
                            >
                            </div>
                        </div>
                        {load &&
                            <div>
                                <Spinner animation="border" variant="danger" size="sm"/>
                            </div>
                        }
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
                        <ImageList images={images} onRemove={handleRemoveImage}/>
                        <div

                            className="d-flex align-items-center justify-content-between mt-2">
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
                                style={{
                                    width: "50%",
                                    border: "none",
                                }}
                            />
                            <button
                                disabled={!selectedImage}
                                className="border-0 btn btn-success d-flex align-items-center justify-content-center"
                                style={{
                                    // marginLeft: "2px",
                                    // width: "9vw",
                                    height: "3vh",
                                    borderRadius: "0.5vw",
                                }}
                                onClick={() => uploadPhoto(openCardData.id, selectedImage)}
                            >
                                {selectedImage ? "Завантажити" : "Очікую img.."}
                            </button>
                        </div>
                        <div className="d-flex justify-content-between" style={{}}>
                          <button className="adminButtonAdd justify-content-start" onClick={openAddPay} style={{}}>
                            for: {openCardData.assignedTo.username} {openCardData.assignedTo.firstName} {openCardData.assignedTo.lastName} {openCardData.assignedTo.familyName} {openCardData.assignedTo.email}
                          </button>
                            <button
                                className="border-0 btn btn-danger d-flex align-items-center justify-content-center"
                                style={{
                                    marginTop: "1vh",
                                    // width: "9vw",
                                    height: "3vh",
                                    borderRadius: "0.5vw",
                                }}
                                onClick={() => deleteThisCard(openCardData.listId, openCardData.id)}
                            >
                                Видалити карточку
                            </button>
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
                <div
                    style={{display: "none"}}
                ></div>
            )}
        </>
    )
}
