import axios from 'axios';
export const GET_ALL_FILES_REQUEST = "GET_ALL_FILES_REQUEST";
export const GET_ALL_FILES_SUCCESS = "GET_ALL_FILES_SUCCESS";
export const GET_ALL_FILES_FAILURE = "GET_ALL_FILES_FAILURE";

// Action Creator
const fetchFilesRequest = () => {
    return {
        type: GET_ALL_FILES_REQUEST
    }
}

const fetchFilesSuccess = (files) => {
    return {
        type: GET_ALL_FILES_SUCCESS,
        payload: files
    }
}

const fetchFilesFailure = (error) => {
    return {
        type: GET_ALL_FILES_FAILURE,
        payload: error
    }
}

// Async Action Creator
export const fetchAllFiles = () => {
    return (dispatch) => {
        dispatch(fetchFilesRequest())
        axios.get('/orders')
            .then(response => {
                const users = response.data
                // console.log(response.data);
                dispatch(fetchFilesSuccess(users))
            })
            .catch(error => {
                const errorMessage = error.message
                console.log(error.message);
                dispatch(fetchFilesFailure(errorMessage))
            })
    }
}
