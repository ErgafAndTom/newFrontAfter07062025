import {
    FETCH_INVOICES_REQUEST,
    FETCH_INVOICES_SUCCESS,
    FETCH_INVOICES_FAILURE,
    CREATE_INVOICE_REQUEST,
    CREATE_INVOICE_SUCCESS,
    CREATE_INVOICE_FAILURE,
    UPDATE_INVOICE_REQUEST,
    UPDATE_INVOICE_SUCCESS,
    UPDATE_INVOICE_FAILURE,
    DELETE_INVOICE_REQUEST,
    DELETE_INVOICE_SUCCESS,
    DELETE_INVOICE_FAILURE
} from '../types/invoiceTypes';

const initialState = {
    invoices: [],
    loading: false,
    error: null
};

const invoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_INVOICES_REQUEST:
        case CREATE_INVOICE_REQUEST:
        case UPDATE_INVOICE_REQUEST:
        case DELETE_INVOICE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case FETCH_INVOICES_SUCCESS:
            return {
                ...state,
                loading: false,
                invoices: action.payload
            };

        case CREATE_INVOICE_SUCCESS:
            return {
                ...state,
                loading: false,
                invoices: [...state.invoices, action.payload]
            };

        case UPDATE_INVOICE_SUCCESS:
            return {
                ...state,
                loading: false,
                invoices: state.invoices.map(invoice =>
                    invoice.id === action.payload.id ? action.payload : invoice
                )
            };

        case DELETE_INVOICE_SUCCESS:
            return {
                ...state,
                loading: false,
                invoices: state.invoices.filter(invoice => invoice.id !== action.payload)
            };

        case FETCH_INVOICES_FAILURE:
        case CREATE_INVOICE_FAILURE:
        case UPDATE_INVOICE_FAILURE:
        case DELETE_INVOICE_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        default:
            return state;
    }
};

export default invoiceReducer; 