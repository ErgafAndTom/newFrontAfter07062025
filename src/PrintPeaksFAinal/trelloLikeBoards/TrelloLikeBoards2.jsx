// TrelloBoard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import axios from '../../api/axiosInstance';
import {Spinner} from 'react-bootstrap';
import './TrelloBoard.css';
import CardInfo from "./CardInfo";
import ModalDeleteList from './ModalDeleteList';
import {useSelector} from "react-redux"; // Импортируем модалку

const TrelloBoard = () => {
  const [lists, setLists] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const [serverData, setServerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shouldCloseAfterSave, setShouldCloseAfterSave] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [deleting, setDeleting] = useState({});
  const [openCardInfo, setOpenCardInfo] = useState(false);
  const [openCardData, setOpenCardData] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  // Данные для Drag & Drop
  const [dragData, setDragData] = useState(null);
  // Состояния для модального окна удаления списка
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  // Получение данных с сервера при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post('/trello/getdata');
        console.log(res.data);
        setServerData(res.data);
      } catch (error) {
        console.error("Помилка при отриманні даних:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Обновляем карточки, если необходимо
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
    const newList = {title: newListTitle, Cards: []};
    setNewListTitle('');

    try {
      const res = await axios.post('/trello', newList);
      console.log(res.data);
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
    const newCard = {content: '', type: 'text'};

    try {
      const res = await axios.post(`/trello/${listId}/cards`, newCard);
      console.log(res.data);
      setServerData(prevLists =>
        prevLists.map(list =>
          list.id === listId
            ? {...list, Cards: [...list.Cards, res.data]}
            : list
        )
      );
    } catch (error) {
      console.error("Помилка створення картки:", error);
    }
  };

  // Функция удаления списка, которая вызывается после подтверждения в модалке
  const removeList = async (listId) => {
    setDeleting(prev => ({...prev, [listId]: true}));

    try {
      await axios.delete(`/trello/${listId}`);
      setServerData(prevLists => prevLists.filter(list => list.id !== listId));
    } catch (error) {
      console.error("Помилка при видаленні списку:", error);
    } finally {
      setDeleting(prev => ({...prev, [listId]: false}));
    }
  };

  // Функция вызова модального окна удаления списка
  const handleDeleteListClick = (list) => {
    setListToDelete(list);
    setShowDeleteListModal(true);
  };

  const removeCard = async (listId, cardId) => {
    setDeleting(prev => ({...prev, [cardId]: true}));

    try {
      await axios.delete(`/trello/${listId}/cards/${cardId}`);
      setServerData(prevLists =>
        prevLists.map(list => {
          if (list.id === listId) {
            return {...list, Cards: list.Cards.filter(card => card.id !== cardId)};
          }
          return list;
        })
      );
    } catch (error) {
      console.error("Помилка при видаленні картки:", error);
    } finally {
      setDeleting(prev => ({...prev, [cardId]: false}));
    }
  };

  // // Изменение содержимого карточки
  // const handleCardContentChange = (listId, cardId, newContent) => {
  //     const updateCard = async () => {
  //         const data = {
  //             cardId: cardId,
  //             newContent: newContent
  //         };
  //         try {
  //             const res = await axios.put(`/trello/content`, data);
  //             console.log(res.data);
  //         } catch (error) {
  //             console.error("Помилка при зміні вмісту картки:", error);
  //         } finally {
  //             const updatedLists = lists.map(list => {
  //                 if (list.id === listId) {
  //                     return {
  //                         ...list,
  //                         Cards: list.Cards.map(card =>
  //                             card.id === cardId ? { ...card, content: newContent } : card
  //                         )
  //                     };
  //                 }
  //                 return list;
  //             });
  //             setServerData(updatedLists);
  //             setOpenCardData(
  //                 updatedLists.find(list => list.id === listId).Cards.find(card => card.id === cardId)
  //             );
  //         }
  //     };
  //     updateCard();
  // };
  // 1. Локальна зміна контенту картки
  const handleLocalCardEdit = (listId, cardId, newContent) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          Cards: list.Cards.map(card =>
            card.id === cardId ? {...card, content: newContent} : card
          )
        };
      }
      return list;
    });
    setServerData(updatedLists);
    setOpenCardData(
      updatedLists.find(list => list.id === listId).Cards.find(card => card.id === cardId)
    );
  };

// 2. Збереження на сервер при втраті фокусу
  const handleBlurCardContentSave = async (listId, cardId, contentToSave) => {
    try {
      setSaving(true)
      const res = await axios.put(`/trello/content`, {
        cardId: cardId,
        newContent: contentToSave
      });
      console.log("Збережено:", res.data);
    } catch (error) {
      console.error("Помилка при збереженні картки:", error);
    } finally {
      setSaving(false)
      // Синхронізація відкритої картки
      const updatedLists = lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            Cards: list.Cards.map(card =>
              card.id === cardId ? {...card, content: contentToSave} : card
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

  // Обработчики для HTML5 Drag & Drop
  const onDragStart = (e, card, sourceListId, index) => {
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("sourceListId", sourceListId);
    e.dataTransfer.setData("sourceIndex", index);
    setDragData({ card, sourceListId, sourceIndex: index });
  };

  const onDragOverCard = (e, targetListId, targetCardIndex) => {
    e.preventDefault();
    setHoveredCard({ listId: targetListId, index: targetCardIndex });
  };

  const onDropCard = async (e, targetListId, targetCardIndex) => {
    e.preventDefault();
    setHoveredCard(null);

    const cardId = e.dataTransfer.getData("cardId");
    const sourceListId = e.dataTransfer.getData("sourceListId");
    const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"), 10);

    const dataToSend = {
      cardId,
      fromListId: sourceListId,
      toListId: targetListId,
      fromIndex: sourceIndex,
      toIndex: targetCardIndex,
    };

    try {
      const response = await axios.put('/trello/drag', dataToSend);
      if (response.status !== 200) throw new Error(response.data.message || 'Ошибка перемещения');
      setServerData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Ошибка при перемещении:', error);
    }

    setDragData(null);
  };

  if (loading) {
    return <Spinner animation="border" variant="danger" size="sm"/>;
  }

  return (
    <div>
      {/* Форма для добавления нового списка */}
      <div className="d-flex align-items-center justify-content-center" style={{marginBottom: '0.5vw'}}>
        <input
          className="InputInTrelloName"
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="Назва колонки"
        />
        <button
          className="d-flex align-items-center justify-content-center buttonRightOfInputInTrello"
          onClick={addList}
          style={{marginLeft: '0.5vh'}}
        >
          +
        </button>
      </div>

      {/* Основная область доски */}
      <div className="" style={{}}>
        <div className="trello-board" style={{display: 'flex', gap: '2vw', padding: '0 2vw', width: "99.7vw", height: "84vh", overflow: 'auto'}}>
          {lists.map(list => (
          <div
            key={list.id}
            className="trello-list"
            // onDragOver={onDragOver}
            // onDrop={(e) => onDrop(e, list.id)}
            style={{
              flex: '0 0 20vw',
              padding: '0.7vh',
              // border: '0.2vh solid #ccc',
              borderRadius: '0.7vh',
            }}
          >
            <h6 className="d-flex align-items-center justify-content-between">
              <span>{list.title}</span>
              <span
                style={{cursor: 'pointer'}}
                onClick={() => handleDeleteListClick(list)}
              >
                {deleting[list.id] ? <Spinner animation="border" variant="danger" size="sm"/> : '×'}
              </span>
            </h6>
            {list.Cards.map((card, index) => (
              <div
                key={card.id}
                className="trello-card"
                draggable
                onDragStart={(e) => onDragStart(e, card, list.id, card.index)}
                onDragOver={(e) => onDragOverCard(e, list.id, card.index)}
                onDragLeave={() => setHoveredCard(null)}
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
                    style={{width: "100%", cursor: 'pointer', fontSize: '1.7vh', minHeight: '4vh'}}
                    onClick={() => seeInfoCard(list.id, card.id)}
                  >
                    {card.content}
                  </div>
                  <button
                    // onClick={() => removeCard(list.id, card.id)}
                    style={{
                      padding: "0.4vw",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: 'pointer',
                      fontSize: '1.6vh'
                    }}
                  >
                    {deleting[card.id] ?
                      <Spinner animation="border" variant="danger" size="sm"/> : ''}
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
                <div className="d-flex justify-content-between" style={{marginTop: '0.6vh'}}>

                  <div>
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%"
                    }}>add: {card.createdBy.username}</div>
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%"
                    }}>up: {card.lastUpdatedBy.username}</div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%"
                    }}>index: {card.index}</div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%"
                    }}>{`add: ${new Date(card.createdAt).toLocaleDateString()} ${new Date(card.createdAt).toLocaleTimeString()}`}</div>
                    <div style={{
                      fontSize: "0.9vh",
                      opacity: "50%"
                    }}>{`up: ${new Date(card.updatedAt).toLocaleDateString()} ${new Date(card.updatedAt).toLocaleTimeString()}`}</div>
                  </div>
                </div>
                {card.assignedTo && (
                  <div style={{
                    fontSize: "0.9vh",
                    opacity: "50%",
                    background: currentUser && currentUser.id === card.assignedTo.id ? 'rgba(250,180,22,0.5)' : 'transparent',
                  }}>Кому: {card.assignedTo.username} {card.assignedTo.firstName} {card.assignedTo.lastName} {card.assignedTo.familyName} {card.assignedTo.email}</div>
                )}
              </div>
            ))}
            <div
              className="d-flex align-items-center justify-content-center trello-add adminButtonAdd"
              onClick={() => addCard(list.id)}
              // style={{
              //   marginTop: '8px',
              //   cursor: 'pointer',
              //   fontSize: '24px'
              // }}
            >
              +
            </div>
          </div>
        ))}
        </div>
      </div>

      {openCardInfo && (
        <CardInfo
          openCardData={openCardData}
          setOpenCardInfo={setOpenCardInfo}
          setServerData={setServerData}
          serverData={serverData}
          removeCard={removeCard}
          handleLocalCardEdit={handleLocalCardEdit}
          setSaving={setSaving}
          saving={saving}
          setShouldCloseAfterSave={setShouldCloseAfterSave}
          shouldCloseAfterSave={shouldCloseAfterSave}
          handleBlurCardContentSave={handleBlurCardContentSave}
        />
      )}

      {/* Модальное окно для удаления списка */}
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

export default TrelloBoard;
