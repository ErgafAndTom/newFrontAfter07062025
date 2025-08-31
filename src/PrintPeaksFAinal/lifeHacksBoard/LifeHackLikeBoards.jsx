import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Spinner } from 'react-bootstrap';
import './LifeHackBoard.css';
import CardInfo from "./CardInfo";
import ModalDeleteList from "./ModalDeleteList";

const LifeHackBoard = () => {
    const [lists, setLists] = useState([]);
    const [serverData, setServerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newListTitle, setNewListTitle] = useState('');
    const [deleting, setDeleting] = useState({});
    const [openCardInfo, setOpenCardInfo] = useState(false);
    const [openCardData, setOpenCardData] = useState(null);
    // Для хранения данных о перетаскиваемой карточке
    const [dragData, setDragData] = useState(null);

    // Получение данных с сервера при монтировании компонента
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post('/lifehack/getdata');
                // console.log(res.data);
                setServerData(res.data);
            } catch (error) {
                console.error("Помилка при отриманні даних:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Обновляем поля карточек, если необходимо (например, для генерации id)
    useEffect(() => {
        setLists(prevLists =>
            prevLists.map(list => ({
                ...list,
                Cards: list.Cards.map((card, index) => ({
                    ...card,
                    id: card.id // Если id не задан, можно генерировать: || `card-${list.id}-${index}`
                }))
            }))
        );
    }, [serverData]);

    // Синхронизация локального состояния с полученными данными
    useEffect(() => {
        if (lists.length === 0 || JSON.stringify(lists) !== JSON.stringify(serverData)) {
            setLists(serverData);
        }
    }, [serverData]);

    // Добавление нового списка
    const addList = async () => {
        if (!newListTitle.trim()) return;

        const newList = { title: newListTitle, Cards: [] };
        setNewListTitle('');

        try {
            const res = await axios.post('/lifehack', newList);
            // console.log(res.data);
            setServerData(prevLists => [...prevLists, res.data]);
        } catch (error) {
            console.error("Помилка створення списку:", error);
        }
    };

    // Открытие информации по карточке
    const seeInfoCard = (listId, cardId) => {
        const list = lists.find(list => list.id === listId);
        if (!list) return;
        const card = list.Cards.find(card => card.id === cardId);
        if (!card) return;
        setOpenCardData(card);
        setOpenCardInfo(true);
    };

    // Добавление новой карточки в список
    const addCard = async (listId) => {
        const newCard = { content: '', type: 'text' };

        try {
            const res = await axios.post(`/lifehack/${listId}/cards`, newCard);
            // console.log(res.data);
            setServerData(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, Cards: [...list.Cards, res.data] }
                        : list
                )
            );
        } catch (error) {
            console.error("Помилка створення картки:", error);
        }
    };

    // Удаление списка
    const removeList = async (listId) => {
        setDeleting(prev => ({ ...prev, [listId]: true }));

        try {
            await axios.delete(`/lifehack/${listId}`);
            setServerData(prevLists => prevLists.filter(list => list.id !== listId));
        } catch (error) {
            console.error("Помилка при видаленні списку:", error);
        } finally {
            setDeleting(prev => ({ ...prev, [listId]: false }));
        }
    };

    // Удаление карточки
    const removeCard = async (listId, cardId) => {
        setDeleting(prev => ({ ...prev, [cardId]: true }));

        try {
            await axios.delete(`/lifehack/${listId}/cards/${cardId}`);
            setServerData(prevLists =>
                prevLists.map(list => {
                    if (list.id === listId) {
                        return { ...list, Cards: list.Cards.filter(card => card.id !== cardId) };
                    }
                    return list;
                })
            );
        } catch (error) {
            console.error("Помилка при видаленні картки:", error);
        } finally {
            setDeleting(prev => ({ ...prev, [cardId]: false }));
        }
    };

    // Изменение содержимого карточки
    const handleCardContentChange = (listId, cardId, newContent) => {
        const updateCard = async () => {
            const data = {
                cardId: cardId,
                newContent: newContent
            };
            try {
                const res = await axios.put(`/lifehack/content`, data);
                // console.log(res.data);
            } catch (error) {
                console.error("Помилка при зміні вмісту картки:", error);
            } finally {
                const updatedLists = lists.map(list => {
                    if (list.id === listId) {
                        return {
                            ...list,
                            Cards: list.Cards.map(card =>
                                card.id === cardId ? { ...card, content: newContent } : card
                            )
                        };
                    }
                    return list;
                });
                setServerData(updatedLists);
                setOpenCardData(
                    updatedLists.find(list => list.id === listId).Cards.find(card => card.id === cardId)
                );
            }
        };
        updateCard();
    };

    // Обработчики для HTML5 Drag & Drop
    // Начало перетаскивания карточки
    const onDragStart = (e, card, sourceListId, index) => {
        // Сохраняем информацию о карточке и списке
        e.dataTransfer.setData("cardId", card.id);
        e.dataTransfer.setData("sourceListId", sourceListId);
        e.dataTransfer.setData("sourceIndex", index);
        setDragData({ card, sourceListId, sourceIndex: index });
    };

    // Разрешение сброса
    const onDragOver = (e) => {
        e.preventDefault();
    };

    // Обработка отпускания карточки
    const onDrop = async (e, targetListId) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("cardId");
        const sourceListId = e.dataTransfer.getData("sourceListId");
        const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"), 10);

        // Если карточка отпускается в тот же список, можно добавить логику сортировки по позиции (здесь простое добавление в конец)
        let movedCard = null;

        // Удаляем карточку из исходного списка
        const updatedLists = lists.map(list => {
            if (list.id.toString() === sourceListId.toString()) {
                const filteredCards = list.Cards.filter(card => {
                    if (card.id.toString() === cardId.toString()) {
                        movedCard = card;
                        return false;
                    }
                    return true;
                });
                return { ...list, Cards: filteredCards };
            }
            return list;
        });

        // Если карточка найдена, вставляем её в целевой список. Здесь можно доработать логику для вставки по определённому индексу.
        const finalLists = updatedLists.map(list => {
            if (list.id.toString() === targetListId.toString() && movedCard) {
                return { ...list, Cards: [...list.Cards, movedCard] };
            }
            return list;
        });

        // Отправляем данные на сервер о перемещении карточки
        const dataToSend = {
            cardId: movedCard ? movedCard.id : cardId,
            fromListId: sourceListId,
            toListId: targetListId,
            fromIndex: sourceIndex,
            toIndex: finalLists.find(list => list.id.toString() === targetListId.toString()).Cards.length - 1
        };

        try {
            const response = await axios.put('/lifehack/drag', dataToSend);
            if (response.status !== 200) throw new Error(response.data.message || 'Ошибка перемещения');
            // console.log(response.data);
            setServerData(response.data);
        } catch (error) {
            console.error('Ошибка при перемещении:', error);
            // Если произошла ошибка, можно вернуть карточку обратно в исходный список
            setServerData(lists);
        }
        setDragData(null);
    };

    if (loading) {
        return <Spinner animation="border" variant="danger" size="sm" />;
    }

    return (
        <div>
            {/* Форма для добавления нового списка */}
            <div className="d-flex align-items-center justify-content-center" style={{ marginBottom: '16px' }}>
                <input
                    className="InputInLifeHackName"
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Назва колонки"
                />
                <button
                    className="d-flex align-items-center justify-content-center buttonRightOfInputInLifeHack"
                    onClick={addList}
                    style={{ marginLeft: '0.5vh' }}
                >
                    +
                </button>
            </div>
            {/* Основная область доски */}
            <div className="lifehack-board" style={{ display: 'flex', gap: '2vw', padding: '0 2vw' }}>
                {lists.map(list => (
                    <div
                        key={list.id}
                        className="lifehack-list"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, list.id)}
                        style={{
                            flex: '0 0 20vw',
                            padding: '0.7vh',
                            border: '0.2vh solid #ccc',
                            borderRadius: '0.7vh',
                            background: '#f7f7f7'
                        }}
                    >
                        <h6 className="d-flex align-items-center justify-content-between">
                            <span style={{fontSize: '1.4vh'}}>{list.title}</span>
                            <span onClick={() => removeList(list.id)} style={{ cursor: 'pointer', fontSize: '1.6vh' }}>
                {deleting[list.id] ? <Spinner animation="border" variant="danger" size="sm" /> : '×'}
              </span>
                        </h6>
                        {list.Cards.map((card, index) => (
                            <div
                                key={card.id}
                                className="lifehack-card"
                                draggable
                                onDragStart={(e) => onDragStart(e, card, list.id, index)}
                                style={{
                                    padding: '0.5vh',
                                    margin: '4px 0',
                                    background: '#fff',
                                    border: '0.2vh solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'grab'
                                }}
                            >
                                <div className="d-flex">
                                    <div
                                        className="lifehack-card-content"
                                        style={{ width: "100%", cursor: 'pointer', fontSize: '1.3vh' }}
                                        onClick={() => seeInfoCard(list.id, card.id)}
                                    >
                                        {card.content}
                                    </div>
                                    <button
                                        onClick={() => removeCard(list.id, card.id)}
                                        style={{
                                            padding: "0.4vw",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: 'pointer',
                                            fontSize: '1.6vh'
                                        }}
                                    >
                                        {deleting[card.id] ? <Spinner animation="border" variant="danger" size="sm" /> : '×'}
                                    </button>
                                </div>
                                {/* Отображение фотографий карточки, если они есть */}
                                {card.inLifeHackPhoto && (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5vw',
                                        marginTop: '0.5vh'
                                    }}>
                                        {card.inLifeHackPhoto.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={`/images/${photo.photoLink}`}
                                                alt={`Card Photo ${index + 1}`}
                                                style={{
                                                    width: '9vw',
                                                    objectFit: 'cover',
                                                    cursor: "not-allowed",
                                                    pointerEvents: "none",
                                                    userSelect: "none",
                                                }}
                                                onClick={() => window.open(`/images/${photo.photoLink}`, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="d-flex justify-content-between" style={{ marginTop: '0.6vh' }}>

                                    <div>
                                        <div style={{fontSize: "0.9vh", opacity: "50%"}}>add: {card.createdBy.username}</div>
                                        <div style={{fontSize: "0.9vh", opacity: "50%"}}>up: {card.lastUpdatedBy.username}</div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end">
                                        <div style={{fontSize: "0.9vh", opacity: "50%"}}>{`add: ${new Date(card.createdAt).toLocaleDateString()} ${new Date(card.createdAt).toLocaleTimeString()}`}</div>
                                        <div style={{fontSize: "0.9vh", opacity: "50%"}}>{`up: ${new Date(card.updatedAt).toLocaleDateString()} ${new Date(card.updatedAt).toLocaleTimeString()}`}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Кнопка для добавления карточки в список */}
                        <div
                            className="d-flex align-items-center justify-content-center lifehack-add"
                            onClick={() => addCard(list.id)}
                            style={{
                                marginTop: '0.5vh',
                                cursor: 'pointer',
                                fontSize: '1.7vh'
                            }}
                        >
                            +
                        </div>
                    </div>
                ))}
            </div>

            {/* Модальное окно для карточки (если необходимо) */}
            {openCardInfo && (
                <CardInfo
                    openCardData={openCardData}
                    setOpenCardInfo={setOpenCardInfo}
                    setServerData={setServerData}
                    serverData={serverData}
                    handleCardContentChange={handleCardContentChange}
                />
            )}
        </div>
    );
};

export default LifeHackBoard;



