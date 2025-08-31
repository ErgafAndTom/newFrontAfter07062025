import axios from '../api/axiosInstance';
import {
  TRELLO_FETCH_DATA_REQUEST,
  TRELLO_FETCH_DATA_SUCCESS,
  TRELLO_FETCH_DATA_FAILURE,
  TRELLO_ADD_LIST_REQUEST,
  TRELLO_ADD_LIST_SUCCESS,
  TRELLO_ADD_LIST_FAILURE,
  TRELLO_DELETE_LIST_REQUEST,
  TRELLO_DELETE_LIST_SUCCESS,
  TRELLO_DELETE_LIST_FAILURE,
  TRELLO_ADD_CARD_REQUEST,
  TRELLO_ADD_CARD_SUCCESS,
  TRELLO_ADD_CARD_FAILURE,
  TRELLO_DELETE_CARD_REQUEST,
  TRELLO_DELETE_CARD_SUCCESS,
  TRELLO_DELETE_CARD_FAILURE,
  TRELLO_UPDATE_CARD_CONTENT,
  TRELLO_UPDATE_CARD_CONTENT_REQUEST,
  TRELLO_UPDATE_CARD_CONTENT_SUCCESS,
  TRELLO_UPDATE_CARD_CONTENT_FAILURE,
  TRELLO_DRAG_CARD_REQUEST,
  TRELLO_DRAG_CARD_SUCCESS,
  TRELLO_DRAG_CARD_FAILURE,
  TRELLO_SET_LOADING,
  TRELLO_SET_SAVING,
  TRELLO_SET_DELETING,
  TRELLO_SET_HOVERED_CARD,
  TRELLO_SET_DRAG_DATA,
  TRELLO_OPEN_CARD_INFO,
  TRELLO_CLOSE_CARD_INFO,
  TRELLO_SHOW_DELETE_LIST_MODAL,
  TRELLO_HIDE_DELETE_LIST_MODAL
} from './trello_action_types';

// Async Actions для роботи з API

// Отримання даних дошки
export const fetchTrelloData = (search) => {
  return async (dispatch) => {
    dispatch({ type: TRELLO_FETCH_DATA_REQUEST });
    const postData = {
      search: search,
    };
    try {
      const response = await axios.post('/trello/getdata', postData);
      dispatch({
        type: TRELLO_FETCH_DATA_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: TRELLO_FETCH_DATA_FAILURE,
        payload: error.message
      });
      console.error("Помилка при отриманні даних:", error);
    }
  };
};

// Додавання нового списку
export const addList = (title) => {
  return async (dispatch) => {
    if (!title.trim()) return;

    dispatch({ type: TRELLO_ADD_LIST_REQUEST });

    try {
      const newList = { title, Cards: [] };
      const response = await axios.post('/trello', newList);

      dispatch({
        type: TRELLO_ADD_LIST_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: TRELLO_ADD_LIST_FAILURE,
        payload: error.message
      });
      console.error("Помилка створення списку:", error);
    }
  };
};

// Видалення списку
export const deleteList = (listId) => {
  return async (dispatch) => {
    dispatch({
      type: TRELLO_DELETE_LIST_REQUEST,
      payload: listId
    });

    try {
      await axios.delete(`/trello/${listId}`);

      dispatch({
        type: TRELLO_DELETE_LIST_SUCCESS,
        payload: listId
      });
    } catch (error) {
      dispatch({
        type: TRELLO_DELETE_LIST_FAILURE,
        payload: { listId, error: error.message }
      });
      console.error("Помилка при видаленні списку:", error);
    }
  };
};

// Додавання нової картки
export const addCard = (listId) => {
  return async (dispatch) => {
    dispatch({
      type: TRELLO_ADD_CARD_REQUEST,
      payload: listId
    });

    try {
      const newCard = { content: '', type: 'text' };
      const response = await axios.post(`/trello/${listId}/cards`, newCard);

      dispatch({
        type: TRELLO_ADD_CARD_SUCCESS,
        payload: { listId, card: response.data }
      });
    } catch (error) {
      dispatch({
        type: TRELLO_ADD_CARD_FAILURE,
        payload: { listId, error: error.message }
      });
      console.error("Помилка створення картки:", error);
    }
  };
};

// Видалення картки
export const deleteCard = (listId, cardId) => {
  return async (dispatch) => {
    dispatch({
      type: TRELLO_DELETE_CARD_REQUEST,
      payload: cardId
    });

    try {
      await axios.delete(`/trello/${listId}/cards/${cardId}`);

      dispatch({
        type: TRELLO_DELETE_CARD_SUCCESS,
        payload: { listId, cardId }
      });
    } catch (error) {
      dispatch({
        type: TRELLO_DELETE_CARD_FAILURE,
        payload: { cardId, error: error.message }
      });
      console.error("Помилка при видаленні картки:", error);
    }
  };
};

// Локальне оновлення контенту картки (без збереження на сервер)
export const updateCardContentLocal = (listId, cardId, newContent) => ({
  type: TRELLO_UPDATE_CARD_CONTENT,
  payload: { listId, cardId, newContent }
});

// Збереження контенту картки на сервер
export const saveCardContent = (listId, cardId, content) => {
  return async (dispatch) => {
    dispatch({
      type: TRELLO_UPDATE_CARD_CONTENT_REQUEST,
      payload: cardId
    });

    try {
      const response = await axios.put('/trello/content', {
        cardId,
        newContent: content
      });

      dispatch({
        type: TRELLO_UPDATE_CARD_CONTENT_SUCCESS,
        payload: { listId, cardId, content }
      });

      // console.log("Збережено:", response.data);
    } catch (error) {
      dispatch({
        type: TRELLO_UPDATE_CARD_CONTENT_FAILURE,
        payload: { cardId, error: error.message }
      });
      console.error("Помилка при збереженні картки:", error);
    }
  };
};

// Переміщення картки (drag & drop)
export const dragCard = (cardId, fromListId, toListId, fromIndex, toIndex) => {
  return async (dispatch) => {
    dispatch({ type: TRELLO_DRAG_CARD_REQUEST });

    const dataToSend = {
      cardId,
      fromListId,
      toListId,
      fromIndex,
      toIndex,
    };

    try {
      const response = await axios.put('/trello/drag', dataToSend);

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Помилка переміщення');
      }

      dispatch({
        type: TRELLO_DRAG_CARD_SUCCESS,
        payload: response.data
      });

      // console.log(response.data);
    } catch (error) {
      dispatch({
        type: TRELLO_DRAG_CARD_FAILURE,
        payload: error.message
      });
      console.error('Помилка при переміщенні:', error);
    }
  };
};

// UI Actions

// Встановлення стану завантаження
export const setLoading = (loading) => ({
  type: TRELLO_SET_LOADING,
  payload: loading
});

// Встановлення стану збереження
export const setSaving = (saving) => ({
  type: TRELLO_SET_SAVING,
  payload: saving
});

// Встановлення стану видалення для конкретного елемента
export const setDeleting = (id, deleting) => ({
  type: TRELLO_SET_DELETING,
  payload: { id, deleting }
});

// Встановлення hover-стану для картки
export const setHoveredCard = (hoveredCard) => ({
  type: TRELLO_SET_HOVERED_CARD,
  payload: hoveredCard
});

// Встановлення даних для drag & drop
export const setDragData = (dragData) => ({
  type: TRELLO_SET_DRAG_DATA,
  payload: dragData
});

// Відкриття інформації про картку
export const openCardInfo = (cardData) => ({
  type: TRELLO_OPEN_CARD_INFO,
  payload: cardData
});

// Закриття інформації про картку
export const closeCardInfo = () => ({
  type: TRELLO_CLOSE_CARD_INFO
});

// Показати модальне вікно видалення списку
export const showDeleteListModal = (listToDelete) => ({
  type: TRELLO_SHOW_DELETE_LIST_MODAL,
  payload: listToDelete
});

// Приховати модальне вікно видалення списку
export const hideDeleteListModal = () => ({
  type: TRELLO_HIDE_DELETE_LIST_MODAL
});
