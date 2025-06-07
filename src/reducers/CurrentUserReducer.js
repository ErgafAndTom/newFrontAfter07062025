import {
    GET_CURRENT_USER_FAILURE,
    GET_CURRENT_USER_REQUEST,
    GET_CURRENT_USER_SUCCESS,
    LOGIN_CURRENT_USER_FAILURE,
    LOGIN_CURRENT_USER_REQUEST,
    LOGIN_CURRENT_USER_SUCCESS,
    LOGOUT_CURRENT_USER_FAILURE,
    LOGOUT_CURRENT_USER_SUCCESS
} from "../actions/currentUserActions";

const initialState = {
    currentUser: null,
    userIsLoading: false,
    userError: null,
    loginError: null,
    loginIsProcessing: false,
    logoutError: null,
};

const currentUserReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_CURRENT_USER_REQUEST:
            return {
                ...state,
                userIsLoading: true,
                userError: null
            };
        case GET_CURRENT_USER_SUCCESS:
            return {
                ...state,
                currentUser: action.payload,
                userIsLoading: false,
                userError: null,
            };
        case GET_CURRENT_USER_FAILURE:
            return {
                ...state,
                userIsLoading: false,
                userError: action.payload
            };
        case LOGIN_CURRENT_USER_REQUEST:
            return {
                ...state,
                loginIsProcessing: true
            };
        case LOGIN_CURRENT_USER_SUCCESS:
            return {
                ...state,
                loginError: null,
                loginIsProcessing: false,
            };
        case LOGIN_CURRENT_USER_FAILURE:
            return {
                ...state,
                loginError: action.payload
            };
        case LOGOUT_CURRENT_USER_SUCCESS:
            return {
                ...state,
                currentUser: null,
            };
        case LOGOUT_CURRENT_USER_FAILURE:
            return {
                ...state,
                logoutError: action.payload,
            };
        default:
            return state;
    }
};

export default currentUserReducer;