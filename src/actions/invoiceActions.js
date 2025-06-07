import axios from '../api/axiosInstance';

// Локально оголошені типи дій
const FETCH_INVOICES_REQUEST = 'FETCH_INVOICES_REQUEST';
const FETCH_INVOICES_SUCCESS = 'FETCH_INVOICES_SUCCESS';
const FETCH_INVOICES_FAILURE = 'FETCH_INVOICES_FAILURE';
const CREATE_INVOICE_REQUEST = 'CREATE_INVOICE_REQUEST';
const CREATE_INVOICE_SUCCESS = 'CREATE_INVOICE_SUCCESS';
const CREATE_INVOICE_FAILURE = 'CREATE_INVOICE_FAILURE';
const UPDATE_INVOICE_REQUEST = 'UPDATE_INVOICE_REQUEST';
const UPDATE_INVOICE_SUCCESS = 'UPDATE_INVOICE_SUCCESS';
const UPDATE_INVOICE_FAILURE = 'UPDATE_INVOICE_FAILURE';
const DELETE_INVOICE_REQUEST = 'DELETE_INVOICE_REQUEST';
const DELETE_INVOICE_SUCCESS = 'DELETE_INVOICE_SUCCESS';
const DELETE_INVOICE_FAILURE = 'DELETE_INVOICE_FAILURE';

export const fetchInvoices = () => async (dispatch) => {
    try {
        dispatch({ type: FETCH_INVOICES_REQUEST });
        const response = await axios.get('/api/invoices');
        dispatch({
            type: FETCH_INVOICES_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: FETCH_INVOICES_FAILURE,
            payload: error.message
        });
    }
};

export const createInvoice = (invoiceData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_INVOICE_REQUEST });
        const response = await axios.post('/api/invoices', invoiceData);
        dispatch({
            type: CREATE_INVOICE_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: CREATE_INVOICE_FAILURE,
            payload: error.message
        });
    }
};

export const updateInvoice = (id, invoiceData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_INVOICE_REQUEST });
        const response = await axios.put(`/api/invoices/${id}`, invoiceData);
        dispatch({
            type: UPDATE_INVOICE_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: UPDATE_INVOICE_FAILURE,
            payload: error.message
        });
    }
};

export const deleteInvoice = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_INVOICE_REQUEST });
        await axios.delete(`/api/invoices/${id}`);
        dispatch({
            type: DELETE_INVOICE_SUCCESS,
            payload: id
        });
    } catch (error) {
        dispatch({
            type: DELETE_INVOICE_FAILURE,
            payload: error.message
        });
    }
}; 