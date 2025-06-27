
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
      {/* Основна область дошки */}

        <div
          className="d-flex flex-row flex-wrap-nowrap justify-content-center gap-3 align-items-start"
          style={{marginLeft:"0.5vw", marginRight:"0.5vw", width: "99%"}}
        >
          {lists.map(list => (
            <div
              key={list.id}
              className="trello-list"

            >
              <div className="trello-list-header" style={{ position: "relative", padding: "0.3vh 0.3vw", fontSize: "1.5vh" }}>
                <span>{list.title}</span>

                <span
                  className="trello-delete-list-button"
                  onClick={() => handleDeleteListClick(list)}
                >
    {deleting[list.id] ? <Spinner animation="border" variant="danger" /> : '×'}
  </span>
              </div>


              {list.Cards.map((card, index) => (
                <div
                  key={card.id}
                  className="trello-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, card, list.id, card.index)}
                  onDragOver={(e) => onDragOverCard(e, list.id, card.index)}
                  onDragLeave={() => dispatch(setHoveredCard(null))}
                  onDrop={(e) => onDropCard(e, list.id, card.index)}
                  onClick={() => seeInfoCard(list.id, card.id)}
                >
                  {card.content}
                  {card.inTrelloPhoto && (
                    <div
                      className="trello-card-photo"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5vw',
                        padding: '0.3vh 0.3vw',
                        justifyContent: 'flex-start',
                        // backgroundColor: '#f2f0e7',
                        borderBottom: '0.1vh solid #aeaeae',

                      }}
                    >
                      {card.inTrelloPhoto.map((photo, index) => (
                        <img
                          key={index}
                          src={`/images/${photo.photoLink}`}
                          alt={`Card Photo ${index + 1}`}
                          style={{
                            width: '3vw',
                            height: '4vh',
                            objectFit: 'contain', // 👈 вписує повністю, без обрізки
                            borderRadius: '0.5vh',
                            // щоб не було прозорого фону
                            pointerEvents: 'none',
                            userSelect: 'none',
                            cursor: 'not-allowed',

                          }}
                        />
                      ))}
                    </div>


                  )}
                    {/*<div*/}
                    {/*  className="trello-card-content"*/}

                    {/*>*/}


                    {/*</div>*/}





                  <div className="d-flex justify-content-between align-items-end" style={{ fontSize: "1.0vh", marginTop: '0.5vh', opacity: '0.6' }}>

                    <div>
                      {`Завдання від `}
                      <b>{card?.createdBy?.firstName} {card?.createdBy?.familyName} {card?.createdBy?.username}</b>
                      {` потрібно виконати `}
                      <b>{card?.assignedTo?.firstName} {card?.assignedTo?.familyName}</b>
                    </div>

                    <div style={{ fontSize: "0.9vh", textAlign: 'right' }}>
                      {new Date(card.createdAt).toLocaleString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).replace(' р.', '').replace(',', '')}
                    </div>

                  </div>



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
          <div className="d-flex align-items-center justify-content-flex-start" style={{ }}>
            <input
              className="InputInTrelloName"
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Назва колонки"
            />
            <button
              className="d-flex align-items-center justify-content-center adminButtonAdd"
              onClick={handleAddList}
              style={{  minWidth: '1vw', height: '4vh', marginLeft: '0.5vw', background:"#FAB416" }}
            >
              +
            </button>
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
