
// TrelloBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from 'react-bootstrap';
import './TrelloBoard.css';
import CardInfo from "./CardInfo";
import ModalDeleteList from './ModalDeleteList';

// Імпортуємо actions
import {
  fetchTrelloData,
  addList,
  deleteList,
  addCard,
  deleteCard,
  updateCardContentLocal,
  saveCardContent,
  dragCard,
  setHoveredCard,
  setDragData,
  openCardInfo,
  closeCardInfo,
  showDeleteListModal,
  hideDeleteListModal,
  setSaving
} from '../../actions/trello_async_actions';

const TrelloBoard = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  // Отримуємо дані з Redux store
  const {
    lists,
    loading,
    saving,
    deleting,
    hoveredCard,
    dragData,
    openCardInfo: isCardInfoOpen,
    openCardData,
    showDeleteListModal: isDeleteListModalOpen,
    listToDelete,
    error
  } = useSelector((state) => state.trello);

  // Локальні стани
  const [newListTitle, setNewListTitle] = useState('');
  const [shouldCloseAfterSave, setShouldCloseAfterSave] = useState(false);

  // Отримання даних при монтуванні компонента
  useEffect(() => {
    dispatch(fetchTrelloData());
  }, [dispatch]);

  // Додавання нового списку
  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    await dispatch(addList(newListTitle));
    setNewListTitle('');
  };

  // Відкриття інформації про картку
  const seeInfoCard = (listId, cardId) => {
    const list = lists.find(list => list.id === listId);
    if (!list) return;
    const card = list.Cards.find(card => card.id === cardId);
    if (!card) return;
    dispatch(openCardInfo(card));
  };

  // Додавання нової картки
  const handleAddCard = (listId) => {
    dispatch(addCard(listId));
  };

  // Відкриття модального вікна видалення списку
  const handleDeleteListClick = (list) => {
    dispatch(showDeleteListModal(list));
  };

  // Видалення списку
  const handleRemoveList = (listId) => {
    dispatch(deleteList(listId));
  };

  // Видалення картки
  const handleRemoveCard = (listId, cardId) => {
    dispatch(deleteCard(listId, cardId));
  };

  // Локальне редагування контенту картки
  const handleLocalCardEdit = (listId, cardId, newContent) => {
    dispatch(updateCardContentLocal(listId, cardId, newContent));

    // Оновлюємо дані відкритої картки, якщо вона збігається
    if (openCardData && openCardData.id === cardId) {
      const updatedCard = { ...openCardData, content: newContent };
      dispatch(openCardInfo(updatedCard));
    }
  };

  // Збереження контенту картки на сервер
  const handleBlurCardContentSave = async (listId, cardId, contentToSave) => {
    dispatch(setSaving(true));
    await dispatch(saveCardContent(listId, cardId, contentToSave));

    // Оновлюємо дані відкритої картки
    if (openCardData && openCardData.id === cardId) {
      const list = lists.find(l => l.id === listId);
      if (list) {
        const updatedCard = list.Cards.find(c => c.id === cardId);
        if (updatedCard) {
          dispatch(openCardInfo(updatedCard));
        }
      }
    }
  };

  // Обробники для HTML5 Drag & Drop
  const onDragStart = (e, card, sourceListId, index) => {
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("sourceListId", sourceListId);
    e.dataTransfer.setData("sourceIndex", index);
    dispatch(setDragData({ card, sourceListId, sourceIndex: index }));
  };

  const onDragOverCard = (e, targetListId, targetCardIndex) => {
    e.preventDefault();
    dispatch(setHoveredCard({ listId: targetListId, index: targetCardIndex }));
  };

  const onDropCard = async (e, targetListId, targetCardIndex) => {
    e.preventDefault();
    dispatch(setHoveredCard(null));

    const cardId = e.dataTransfer.getData("cardId");
    const sourceListId = e.dataTransfer.getData("sourceListId");
    const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"), 10);

    await dispatch(dragCard(cardId, sourceListId, targetListId, sourceIndex, targetCardIndex));
    dispatch(setDragData(null));
  };

  // Закриття модального вікна видалення списку
  const handleCloseDeleteModal = () => {
    dispatch(hideDeleteListModal());
  };

  // Закриття інформації про картку
  const handleCloseCardInfo = () => {
    if (saving) {
      setShouldCloseAfterSave(true);
    } else {
      dispatch(closeCardInfo());
    }
  };

  // Ефект для закриття після збереження
  useEffect(() => {
    if (!saving && shouldCloseAfterSave) {
      dispatch(closeCardInfo());
      setShouldCloseAfterSave(false);
    }
  }, [saving, shouldCloseAfterSave, dispatch]);

  if (loading) {
    return <Spinner animation="border" variant="danger" size="sm" />;
  }

  return (
    <div>
      {/* Форма для додавання нового списку */}
      <div className="d-flex align-items-center justify-content-center" style={{ marginBottom: '0.5vw' }}>
        <input
          className="InputInTrelloName"
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="Назва колонки"
        />
        <button
          className="d-flex align-items-center justify-content-center buttonRightOfInputInTrello"
          onClick={handleAddList}
          style={{ marginLeft: '0.5vh' }}
        >
          +
        </button>
      </div>

      {/* Основна область дошки */}
      <div className="">
        <div
          className="trello-board"
          style={{
            display: 'flex',
            gap: '2vw',
            padding: '0 2vw',
            width: "99.7vw",
            height: "84vh",
            overflow: 'auto'
          }}
        >
          {lists.map(list => (
            <div
              key={list.id}
              className="trello-list"
              style={{
                flex: '0 0 20vw',
                padding: '0.7vh',
                borderRadius: '0.7vh',
              }}
            >
              <h6 className="d-flex align-items-center justify-content-between">
                <span>{list.title}</span>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDeleteListClick(list)}
                >
                  {deleting[list.id] ?
                    <Spinner animation="border" variant="danger" size="sm" /> : '×'
                  }
                </span>
              </h6>

              {list.Cards.map((card, index) => (
                <div
                  key={card.id}
                  className="trello-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, card, list.id, card.index)}
                  onDragOver={(e) => onDragOverCard(e, list.id, card.index)}
                  onDragLeave={() => dispatch(setHoveredCard(null))}
                  onDrop={(e) => onDropCard(e, list.id, card.index)}
                  style={{
                    padding: '0.5vh',
                    margin: '4px 0',
                    background: hoveredCard && hoveredCard.listId === list.id && hoveredCard.index === card.index ? 'rgba(250,180,22,0.5)' : '#fff',
                    border: '0.2vh solid #ddd',
                    borderRadius: '4px',
                    cursor: 'grab',
                    boxShadow: hoveredCard && hoveredCard.listId === list.id && hoveredCard.index === card.index ? '0 10vw 7vw rgba(250,180,22,0.6)' : 'none',
                    transition: 'background 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div className="d-flex">
                    <div
                      className="trello-card-content"
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
                      {deleting[card.id] ?
                        <Spinner animation="border" variant="danger" size="sm" /> : ''
                      }
                    </button>
                  </div>

                  {card.inTrelloPhoto && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5vw',
                      marginTop: '0.5vh'
                    }}>
                      {card.inTrelloPhoto.map((photo, index) => (
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
                      <div style={{ fontSize: "0.9vh", opacity: "50%" }}>
                        add: {card.createdBy.username}
                      </div>
                      <div style={{ fontSize: "0.9vh", opacity: "50%" }}>
                        up: {card.lastUpdatedBy.username}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9vh", opacity: "50%" }}>
                        index: {card.index}
                      </div>
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

                  {card.assignedTo && (
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%",
                      background: currentUser && currentUser.id === card.assignedTo.id ? 'rgba(250,180,22,0.5)' : 'transparent',
                    }}>
                      Кому: {card.assignedTo.username} {card.assignedTo.firstName} {card.assignedTo.lastName} {card.assignedTo.familyName} {card.assignedTo.email}
                    </div>
                  )}
                </div>
              ))}

              <div
                className="d-flex align-items-center justify-content-center trello-add adminButtonAdd"
                onClick={() => handleAddCard(list.id)}
              >
                +
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальне вікно інформації про картку */}
      {isCardInfoOpen && (
        <CardInfo
          openCardData={openCardData}
          setOpenCardInfo={handleCloseCardInfo}
          removeCard={handleRemoveCard}
          handleLocalCardEdit={handleLocalCardEdit}
          setSaving={(saving) => dispatch(setSaving(saving))}
          saving={saving}
          setShouldCloseAfterSave={setShouldCloseAfterSave}
          shouldCloseAfterSave={shouldCloseAfterSave}
          handleBlurCardContentSave={handleBlurCardContentSave}
        />
      )}

      {/* Модальне вікно для видалення списку */}
      {isDeleteListModalOpen && listToDelete && (
        <ModalDeleteList
          listToDelete={listToDelete}
          showDeleteListModal={isDeleteListModalOpen}
          setShowDeleteListModal={handleCloseDeleteModal}
          removeList={handleRemoveList}
          deleting={deleting[listToDelete.id]}
        />
      )}

      {/* Відображення помилок */}
      {error && (
        <div style={{ color: 'red', padding: '10px' }}>
          Помилка: {error}
        </div>
      )}
    </div>
  );
};

export default TrelloBoard;
