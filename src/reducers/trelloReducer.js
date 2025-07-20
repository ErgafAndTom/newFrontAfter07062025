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
} from '../actions/trello_action_types';

const initialState = {
  lists: [],
  loading: false,
  saving: false,
  deleting: {},
  error: null,

  // UI state
  hoveredCard: null,
  dragData: null,

  // Modal states
  openCardInfo: false,
  openCardData: null,
  showDeleteListModal: false,
  listToDelete: null
};

const trelloReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch data
    case TRELLO_FETCH_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case TRELLO_FETCH_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        lists: action.payload,
        error: null
      };

    case TRELLO_FETCH_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Add list
    case TRELLO_ADD_LIST_REQUEST:
      return {
        ...state,
        loading: true
      };

    case TRELLO_ADD_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        lists: [...state.lists, action.payload]
      };

    case TRELLO_ADD_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Delete list
    case TRELLO_DELETE_LIST_REQUEST:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [action.payload]: true
        }
      };

    case TRELLO_DELETE_LIST_SUCCESS:
      const { [action.payload]: deletedList, ...remainingDeleting } = state.deleting;
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        deleting: remainingDeleting
      };

    case TRELLO_DELETE_LIST_FAILURE:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [action.payload.listId]: false
        },
        error: action.payload.error
      };

    // Add card
    case TRELLO_ADD_CARD_SUCCESS:
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, Cards: [action.payload.card, ...list.Cards, ] }
            : list
        )
      };

    case TRELLO_ADD_CARD_FAILURE:
      return {
        ...state,
        error: action.payload.error
      };

    // Delete card
    case TRELLO_DELETE_CARD_REQUEST:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [action.payload]: true
        }
      };

    case TRELLO_DELETE_CARD_SUCCESS:
      const { [action.payload.cardId]: deletedCard, ...remainingCardDeleting } = state.deleting;
      return {
        ...state,
        lists: state.lists.map(list => {
          if (list.id === action.payload.listId) {
            return {
              ...list,
              Cards: list.Cards.filter(card => card.id !== action.payload.cardId)
            };
          }
          return list;
        }),
        deleting: remainingCardDeleting
      };

    case TRELLO_DELETE_CARD_FAILURE:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [action.payload.cardId]: false
        },
        error: action.payload.error
      };

    // Update card content
    case TRELLO_UPDATE_CARD_CONTENT:
      return {
        ...state,
        lists: state.lists.map(list => {
          if (list.id === action.payload.listId) {
            return {
              ...list,
              Cards: list.Cards.map(card =>
                card.id === action.payload.cardId
                  ? { ...card, content: action.payload.newContent }
                  : card
              )
            };
          }
          return list;
        })
      };

    case TRELLO_UPDATE_CARD_CONTENT_REQUEST:
      return {
        ...state,
        saving: true
      };

    case TRELLO_UPDATE_CARD_CONTENT_SUCCESS:
      return {
        ...state,
        saving: false,
        // Оновлюємо дані відкритої картки, якщо вона збігається
        openCardData: state.openCardData && state.openCardData.id === action.payload.cardId
          ? { ...state.openCardData, content: action.payload.content }
          : state.openCardData
      };

    case TRELLO_UPDATE_CARD_CONTENT_FAILURE:
      return {
        ...state,
        saving: false,
        error: action.payload.error
      };

    // Drag card
    case TRELLO_DRAG_CARD_SUCCESS:
      return {
        ...state,
        lists: action.payload
      };

    case TRELLO_DRAG_CARD_FAILURE:
      return {
        ...state,
        error: action.payload
      };

    // UI actions
    case TRELLO_SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case TRELLO_SET_SAVING:
      return {
        ...state,
        saving: action.payload
      };

    case TRELLO_SET_DELETING:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [action.payload.id]: action.payload.deleting
        }
      };

    case TRELLO_SET_HOVERED_CARD:
      return {
        ...state,
        hoveredCard: action.payload
      };

    case TRELLO_SET_DRAG_DATA:
      return {
        ...state,
        dragData: action.payload
      };

    // Modal actions
    case TRELLO_OPEN_CARD_INFO:
      return {
        ...state,
        openCardInfo: true,
        openCardData: action.payload
      };

    case TRELLO_CLOSE_CARD_INFO:
      return {
        ...state,
        openCardInfo: false,
        openCardData: null
      };

    case TRELLO_SHOW_DELETE_LIST_MODAL:
      return {
        ...state,
        showDeleteListModal: true,
        listToDelete: action.payload
      };

    case TRELLO_HIDE_DELETE_LIST_MODAL:
      return {
        ...state,
        showDeleteListModal: false,
        listToDelete: null
      };

    default:
      return state;
  }
};

export default trelloReducer;
