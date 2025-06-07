import {
    GET_PRICES2_FAILURE,
    GET_PRICES2_REQUEST,
    GET_PRICES2_SUCCESS,
    GET_PRICES_FAILURE,
    GET_PRICES_REQUEST,
    GET_PRICES_SUCCESS
} from "../actions/pricesAction";


const initialState = {
    prices: null,
    pricesIsLoading: false,
    pricesError: null,

    prices2: null,
    pricesIsLoading2: false,
    pricesError2: null,
};

const pricesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_PRICES_REQUEST:
            return {
                ...state,
                pricesIsLoading: true,
                pricesError: null
            };
        case GET_PRICES_SUCCESS:
            return {
                ...state,
                prices: action.payload,
                pricesIsLoading: false,
                pricesError: null
            };
        case GET_PRICES_FAILURE:
            return {
                ...state,
                pricesIsLoading: false,
                pricesError: action.payload
            };


        case GET_PRICES2_REQUEST:
            return {
                ...state,
                pricesIsLoading2: true,
                pricesError2: null
            };
        case GET_PRICES2_SUCCESS:
            return {
                ...state,
                prices2: action.payload,
                pricesIsLoading2: false,
                pricesError2: null
            };
        case GET_PRICES2_FAILURE:
            return {
                ...state,
                pricesIsLoading2: false,
                pricesError2: action.payload
            };

        default:
            return state;
    }
};

export default pricesReducer;