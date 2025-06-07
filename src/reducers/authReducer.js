import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    LOGOUT,
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
        case FETCH_USER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                token: action.payload,
                loading: false,
                error: null,
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                token: null,
                loading: false,
                error: action.payload,
            };
        case FETCH_USER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_USER_FAILURE:
            return {
                ...state,
                user: null,
                loading: false,
                error: action.payload,
            };
        case LOGOUT:
            return {
                ...state,
                token: null,
                user: null,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
};

export default authReducer;
