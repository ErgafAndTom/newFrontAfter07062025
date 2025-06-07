import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Spinner } from 'react-bootstrap';
import './LifeHackBoard.css';
import CardInfo from "./CardInfo";
import ModalDeleteList from './ModalDeleteList';

const LifeHackBoard = () => {
    const [lists, setLists] = useState([]);
    const [serverData, setServerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newListTitle, setNewListTitle] = useState('');
    const [deleting, setDeleting] = useState({});
    const [openCardInfo, setOpenCardInfo] = useState(false);
    const [openCardData, setOpenCardData] = useState(null);
    const [dragData, setDragData] = useState(null);
    const [showDeleteListModal, setShowDeleteListModal] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post('/lifehack/getAll');
                setServerData(res.data);
            } catch (error) {
                console.error("Помилка при отриманні даних:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setLists(prevLists =>
            prevLists.map(list => ({
                ...list,
                LifeHackCards: list.LifeHackCards.map((card, index) => ({
                    ...card,
                    id: card.id
                }))
            }))
        );
    }, [serverData]);

    useEffect(() => {
        if (lists.length === 0 || JSON.stringify(lists) !== JSON.stringify(serverData)) {
            setLists(serverData);
        }
    }, [serverData]);

    const addList = async () => {
        if (!newListTitle.trim()) return;
        const newList = { title: newListTitle, LifeHackCards: [] };
        setNewListTitle('');

        try {
            const res = await axios.post('/lifehack', newList);
            setServerData(prevLists => [...prevLists, res.data]);
        } catch (error) {
            console.error("Помилка створення списку:", error);
        }
    };

    const seeInfoCard = (listId, cardId) => {
        const list = lists.find(list => list.id === listId);
        if (!list) return;
        const card = list.LifeHackCards.find(card => card.id === cardId);
        if (!card) return;
        setOpenCardData(card);
        setOpenCardInfo(true);
    };

    const addCard = async (listId) => {
        const newCard = { content: '', type: 'text' };

        try {
            const res = await axios.post(`/lifehack/${listId}/cards`, newCard);
            setServerData(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, LifeHackCards: [...list.LifeHackCards, res.data] }
                        : list
                )
            );
        } catch (error) {
            console.error("Помилка створення картки:", error);
        }
    };

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

    const handleDeleteListClick = (list) => {
        setListToDelete(list);
        setShowDeleteListModal(true);
    };

    const removeCard = async (listId, cardId) => {
        setDeleting(prev => ({ ...prev, [cardId]: true }));
        try {
            await axios.delete(`/lifehack/${listId}/cards/${cardId}`);
            setServerData(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, LifeHackCards: list.LifeHackCards.filter(card => card.id !== cardId) }
                        : list
                )
            );
        } catch (error) {
            console.error("Помилка при видаленні картки:", error);
        } finally {
            setDeleting(prev => ({ ...prev, [cardId]: false }));
        }
    };

    const handleCardContentChange = (listId, cardId, newContent) => {
        const updateCard = async () => {
            const data = {
                cardId: cardId,
                newContent: newContent
            };
            try {
                await axios.put(`/lifehack/content`, data);
            } catch (error) {
                console.error("Помилка при зміні вмісту картки:", error);
            } finally {
                const updatedLists = lists.map(list =>
                    list.id === listId
                        ? {
                            ...list,
                            LifeHackCards: list.LifeHackCards.map(card =>
                                card.id === cardId ? { ...card, content: newContent } : card
                            )
                        }
                        : list
                );
                setServerData(updatedLists);
                setOpenCardData(
                    updatedLists.find(list => list.id === listId).LifeHackCards.find(card => card.id === cardId)
                );
            }
        };
        updateCard();
    };

    const onDragStart = (e, card, sourceListId, index) => {
        e.dataTransfer.setData("cardId", card.id);
        e.dataTransfer.setData("sourceListId", sourceListId);
        e.dataTransfer.setData("sourceIndex", index);
        setDragData({ card, sourceListId, sourceIndex: index });
    };

    const onDragOver = (e) => e.preventDefault();

    const onDrop = async (e, targetListId) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("cardId");
        const sourceListId = e.dataTransfer.getData("sourceListId");
        const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"), 10);
        let movedCard = null;

        const updatedLists = lists.map(list => {
            if (list.id.toString() === sourceListId.toString()) {
                const filteredCards = list.LifeHackCards.filter(card => {
                    if (card.id.toString() === cardId.toString()) {
                        movedCard = card;
                        return false;
                    }
                    return true;
                });
                return { ...list, LifeHackCards: filteredCards };
            }
            return list;
        });

        const finalLists = updatedLists.map(list =>
            list.id.toString() === targetListId.toString() && movedCard
                ? { ...list, LifeHackCards: [...list.LifeHackCards, movedCard] }
                : list
        );

        const dataToSend = {
            cardId: movedCard ? movedCard.id : cardId,
            fromListId: sourceListId,
            toListId: targetListId,
            fromIndex: sourceIndex,
            toIndex: finalLists.find(list => list.id.toString() === targetListId.toString()).LifeHackCards.length - 1
        };

        try {
            const response = await axios.put('/lifehack/drag', dataToSend);
            if (response.status !== 200) throw new Error(response.data.message || 'Помилка переміщення');
            setServerData(response.data);
        } catch (error) {
            console.error('Помилка при переміщенні:', error);
            setServerData(lists);
        }
        setDragData(null);
    };

    if (loading) {
        return <Spinner animation="border" variant="danger" size="sm" />;
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-center" style={{ marginBottom: '2vw' }}>
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
                            <span>{list.title}</span>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDeleteListClick(list)}
                            >
                                {deleting[list.id] ? <Spinner animation="border" variant="danger" size="sm" /> : '×'}
                            </span>
                        </h6>
                        {list.LifeHackCards.map((card, index) => (
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
                                        style={{ width: "100%", cursor: 'pointer', fontSize: '1.7vh', minHeight: '4vh' }}
                                        onClick={() => seeInfoCard(list.id, card.id)}
                                    >
                                        {card.content}
                                    </div>
                                    <button
                                        style={{
                                            padding: "0.4vw",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: 'pointer',
                                            fontSize: '1.6vh'
                                        }}
                                    >
                                        {deleting[card.id] ? <Spinner animation="border" variant="danger" size="sm" /> : ''}
                                    </button>
                                </div>
                                {card.InLifeHackPhotos && (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5vw',
                                        marginTop: '0.5vh'
                                    }}>
                                        {card.InLifeHackPhotos.map((photo, index) => (
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
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="d-flex justify-content-between" style={{ marginTop: '0.6vh' }}>
                                    <div>
                                        <div style={{ fontSize: "0.9vh", opacity: "50%" }}>add: {card.createdBy.username}</div>
                                        <div style={{ fontSize: "0.9vh", opacity: "50%" }}>up: {card.lastUpdatedBy.username}</div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end">
                                        <div style={{ fontSize: "0.9vh", opacity: "50%" }}>
                                            {`add: ${new Date(card.createdAt).toLocaleDateString()} ${new Date(card.createdAt).toLocaleTimeString()}`}
                                        </div>
                                        <div style={{ fontSize: "0.9vh", opacity: "50%" }}>
                                            {`up: ${new Date(card.updatedAt).toLocaleDateString()} ${new Date(card.updatedAt).toLocaleTimeString()}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div
                            className="d-flex align-items-center justify-content-center lifehack-add"
                            onClick={() => addCard(list.id)}
                            style={{ marginTop: '8px', cursor: 'pointer', fontSize: '24px' }}
                        >
                            +
                        </div>
                    </div>
                ))}
            </div>

            {openCardInfo && (
                <CardInfo
                    openCardData={openCardData}
                    setOpenCardInfo={setOpenCardInfo}
                    setServerData={setServerData}
                    serverData={serverData}
                    removeCard={removeCard}
                    handleCardContentChange={handleCardContentChange}
                />
            )}

            {showDeleteListModal && listToDelete && (
                <ModalDeleteList
                    listToDelete={listToDelete}
                    showDeleteListModal={showDeleteListModal}
                    setShowDeleteListModal={setShowDeleteListModal}
                    removeList={removeList}
                    deleting={deleting[listToDelete.id]}
                />
            )}
        </div>
    );
};

export default LifeHackBoard;
