import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from 'react-bootstrap';
import './TrelloBoard.css';
import CardInfo from "./CardInfo";
import ModalDeleteList from './ModalDeleteList';
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
  const {
    lists, loading, saving, deleting, hoveredCard, dragData,
    openCardInfo: isCardInfoOpen, openCardData, showDeleteListModal: isDeleteListModalOpen,
    listToDelete, error
  } = useSelector((state) => state.trello);

  const [newListTitle, setNewListTitle] = useState('');
  const [shouldCloseAfterSave, setShouldCloseAfterSave] = useState(false);

  useEffect(() => { dispatch(fetchTrelloData()); }, [dispatch]);

  const cardRefs = useRef({});

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    await dispatch(addList(newListTitle));
    setNewListTitle('');
  };

  const seeInfoCard = (listId, cardId) => {
    const list = lists.find(list => list.id === listId);
    if (!list) return;
    const card = list.Cards.find(card => card.id === cardId);
    if (!card) return;
    dispatch(openCardInfo(card));
  };

  const handleAddCard = (listId) => { dispatch(addCard(listId)); };
  const handleDeleteListClick = (list) => { dispatch(showDeleteListModal(list)); };
  const handleRemoveList = (listId) => { dispatch(deleteList(listId)); };
  const handleRemoveCard = (listId, cardId) => { dispatch(deleteCard(listId, cardId)); };

  const handleLocalCardEdit = (listId, cardId, newContent) => {
    dispatch(updateCardContentLocal(listId, cardId, newContent));
    if (openCardData && openCardData.id === cardId) {
      const updatedCard = { ...openCardData, content: newContent };
      dispatch(openCardInfo(updatedCard));
    }
  };

  const handleBlurCardContentSave = async (listId, cardId, contentToSave) => {
    dispatch(setSaving(true));
    await dispatch(saveCardContent(listId, cardId, contentToSave));
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

  const onDragStart = (e, card, sourceListId, index) => {
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("sourceListId", sourceListId);
    e.dataTransfer.setData("sourceIndex", index);
    dispatch(setDragData({ card, sourceListId, sourceIndex: index }));
  };

  const onDragOverCard = (e, targetListId, targetCardIndex, el) => {
    e.preventDefault();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const position = offset < rect.height / 2 ? "before" : "after";
    dispatch(setHoveredCard({ listId: targetListId, index: targetCardIndex, position }));
  };

  const onDragOverEmptyList = (e, listId) => {
    e.preventDefault();
    dispatch(setHoveredCard({ listId, index: 0 }));
  };

  const onDropCard = async (e, fallbackListId) => {
    e.preventDefault();
    const hovered = hoveredCard || { listId: fallbackListId, index: lists.find(l => l.id === fallbackListId).Cards.length };
    dispatch(setHoveredCard(null));
    const cardId = e.dataTransfer.getData("cardId");
    const sourceListId = e.dataTransfer.getData("sourceListId");
    const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"), 10);
    await dispatch(dragCard(cardId, sourceListId, hovered.listId, sourceIndex, hovered.index));
    dispatch(setDragData(null));
  };

  useEffect(() => {
    if (!saving && shouldCloseAfterSave) {
      dispatch(closeCardInfo());
      setShouldCloseAfterSave(false);
    }
  }, [saving, shouldCloseAfterSave, dispatch]);

  function capitalizeFirstWord(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (loading) return <Spinner animation="border" variant="danger" size="sm" />;

  return (
    <div>
      <div className="d-flex flex-row flex-wrap-nowrap justify-content-center gap-3 align-items-start" style={{ marginLeft:"0.5vw", marginRight:"0.5vw", width: "99%" }}>
        {lists.map(list => (
          <div
            key={list.id}
            className="trello-list"
            onDragOver={(e) => { if (!list.Cards.length) onDragOverEmptyList(e, list.id); }}
            onDrop={(e) => onDropCard(e, list.id)}
          >
            <div className="trello-list-header d-flex align-items-center" style={{ padding: "0.3vh 0.3vw", fontSize: "1.5vh" }}>
              <div className="d-flex align-items-center" style={{ gap: '0.5vw' }}>
                <div>{list.title}</div>
                <div className="d-flex align-items-center justify-content-center adminButtonAdd" style={{ minWidth: '2vw', maxHeight: '2vh', background: "#FAB416", cursor: 'pointer' }} onClick={() => handleAddCard(list.id)}>+</div>
              </div>
              <span className="trello-delete-list-button" onClick={() => handleDeleteListClick(list)}>
                {deleting[list.id] ? <Spinner animation="border" variant="danger" /> : '×'}
              </span>
            </div>

            {list.Cards.map((card, index) => {
              if (!cardRefs.current[list.id]) cardRefs.current[list.id] = {};
              const setRef = el => cardRefs.current[list.id][card.id] = el;

              const showPlaceholderBefore = hoveredCard && hoveredCard.listId === list.id && hoveredCard.index === index && hoveredCard.position === "before";
              const showPlaceholderAfter = hoveredCard && hoveredCard.listId === list.id && hoveredCard.index === index && hoveredCard.position === "after";

              return (
                <React.Fragment key={card.id}>
                  {showPlaceholderBefore && <div style={{ height: '0.2vh', background: 'yellow', opacity: 0.8, margin: '0', transition: 'all 0.2s' }} />}
                  <div
                    ref={setRef}
                    className="trello-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, card, list.id, card.index)}
                    onDragOver={(e) => onDragOverCard(e, list.id, index, cardRefs.current[list.id][card.id])}
                    onDragLeave={() => dispatch(setHoveredCard(null))}
                    onDrop={(e) => onDropCard(e, list.id)}
                    onClick={() => seeInfoCard(list.id, card.id)}
                    style={{ textAlign: 'justify', margin: "0.1vh" }}
                  >
                    {capitalizeFirstWord(card.content)}
                    {card.inTrelloPhoto && (
                      <div className="trello-card-photo" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3vw', justifyContent: 'flex-start', borderBottom: '0.1vh solid #aeaeae' }}>
                        {card.inTrelloPhoto.map((photo, i) => (
                          <img key={i} src={`/images/${photo.photoLink}`} alt={`Card Photo ${i + 1}`} style={{ width: '2vw', height: '5vh', objectFit: 'contain', borderRadius: '0.5vh', pointerEvents: 'none', userSelect: 'none', cursor: 'not-allowed' }} />
                        ))}
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-end" style={{ fontSize: "1.0vh", marginTop: '0.5vh', opacity: '0.6' }}>
                      <div>
                        {`Завдання від `}
                        <b>{card?.createdBy?.firstName} {card?.createdBy?.familyName} {card?.createdBy?.username}</b>
                        {` потрібно виконати `}
                        <b>{card?.assignedTo?.firstName} {card?.assignedTo?.familyName}</b>
                      </div>
                      <div style={{ fontSize: "0.9vh", textAlign: 'right' }}>
                        {new Date(card.createdAt).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(' р.', '').replace(',', '')}
                      </div>
                    </div>
                  </div>
                  {showPlaceholderAfter && <div style={{ height: '0.2vh', background: 'yellow', opacity: 0.8, margin: '0', transition: 'all 0.2s' }} />}
                </React.Fragment>
              );
            })}
            {hoveredCard && hoveredCard.listId === list.id && hoveredCard.index === list.Cards.length &&
              <div style={{ height: '0.2vh', background: 'yellow', opacity: 0.8, margin: '0', transition: 'all 0.2s' }} />
            }
          </div>
        ))}
        <div className="d-flex align-items-center justify-content-flex-start">
          <input className="InputInTrelloName" type="text" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Назва колонки" />
          <button className="d-flex align-items-center justify-content-center adminButtonAdd" onClick={handleAddList} style={{ minWidth: '1vw', height: '4vh', marginLeft: '0.5vw', background:"#FAB416" }}>+</button>
        </div>
      </div>

      {isCardInfoOpen && (
        <CardInfo openCardData={openCardData} setOpenCardInfo={() => dispatch(closeCardInfo())} removeCard={handleRemoveCard}
                  handleLocalCardEdit={handleLocalCardEdit} setSaving={(v) => dispatch(setSaving(v))}
                  saving={saving} setShouldCloseAfterSave={setShouldCloseAfterSave}
                  shouldCloseAfterSave={shouldCloseAfterSave} handleBlurCardContentSave={handleBlurCardContentSave} />
      )}

      {isDeleteListModalOpen && listToDelete && (
        <ModalDeleteList listToDelete={listToDelete} showDeleteListModal={isDeleteListModalOpen}
                         setShowDeleteListModal={() => dispatch(hideDeleteListModal())} removeList={handleRemoveList}
                         deleting={deleting[listToDelete.id]} />
      )}

      {error && <div style={{ color: 'red', padding: '10px' }}>Помилка: {error}</div>}
    </div>
  );
};

export default TrelloBoard;
