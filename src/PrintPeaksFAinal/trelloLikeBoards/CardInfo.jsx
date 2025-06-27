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
        return ;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row", // 👈 важливо: розташування в ряд
          flexWrap: "wrap",     // 👈 дозволяє переноситись при нестачі місця
          gap: "0.5vw",
          maxHeight: "50vh",
          overflowY: "auto",
          paddingRight: "1vw",
        }}
      >
        {images.map((img) => (
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
              }}
              onClick={() => window.open(`/images/${img.photoLink}`, '_blank')}
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
    const tempId = `${cardId}-${Date.now()}-${photo.name}`;
    setLoadingImageIds(prev => new Set(prev).add(tempId));

    const formData = new FormData();
    formData.append("file", photo);

    try {
      const res = await axios.post(`/trello/${cardId}/contentPhoto`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // оновлення глобального стану
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
                        background: "#f2f0e7",
                        top: "50%",
                        left: "50%",
                        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                        opacity: isAnimating ? 1 : 0, // анимация прозрачности
                        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                        borderRadius: "1vh",
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
                                        background:'#fbfaf6'
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
                        <ImageList images={images} onRemove={handleRemoveImage}/>
                        <div

                            className="d-flex align-items-center justify-content-between">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              const validImages = files.filter(file => file.type.startsWith("image/"));
                              validImages.forEach((file) => uploadPhoto(openCardData.id, file));
                              e.target.value = null; // скидає input, щоб можна було вибрати ті ж самі файли ще раз
                            }}
                            style={{
                              width: "50%",
                              border: "none",
                            }}
                          />


                          {/*<button*/}
                          {/*      disabled={!selectedImage}*/}
                          {/*      className="d-flex align-items-center justify-content-center adminButtonAdd"*/}
                          {/*      style={{*/}
                          {/*          // marginLeft: "2px",*/}
                          {/*          // width: "9vw",*/}
                          {/*          height: "3vh",*/}
                          {/*          borderRadius: "0.5vw",*/}
                          {/*      }}*/}
                          {/*      onClick={() => uploadPhoto(openCardData.id, selectedImage)}*/}
                          {/*  >*/}
                          {/*      {selectedImage ? "Завантажити" : "Очікую img.."}*/}
                          {/*  </button>*/}
                        </div>
                        <div className="d-flex justify-content-between" style={{}}>
                          <button className="adminButtonAdd justify-content-start" onClick={openAddPay} style={{}}>
                            {openCardData && openCardData.assignedTo && (
                              <div style={{
                                // fontSize: "0.9vh",
                                // opacity: "50%"
                              }}>Кому: {openCardData.assignedTo.username} {openCardData.assignedTo.firstName} {openCardData.assignedTo.lastName} {openCardData.assignedTo.familyName} {openCardData.assignedTo.email}</div>
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
                <div
                    style={{display: "none"}}
                ></div>
            )}
        </>
    )
}
