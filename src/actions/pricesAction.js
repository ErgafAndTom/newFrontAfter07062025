import axios from 'axios';
export const GET_PRICES_REQUEST = "GET_PRICES_REQUEST";
export const GET_PRICES_SUCCESS = "GET_PRICES_SUCCESS";
export const GET_PRICES_FAILURE = "GET_PRICES_FAILURE";

const fetchPricesRequest = () => {
    return {
        type: GET_PRICES_REQUEST
    }
}

const fetchPricesSuccess = (prices) => {
    return {
        type: GET_PRICES_SUCCESS,
        payload: prices
    }
}

const fetchPricesFailure = (error) => {
    return {
        type: GET_PRICES_FAILURE,
        payload: error
    }
}

export const fetchPrices = () => {
    return (dispatch) => {
        dispatch(fetchPricesRequest())
        axios.get('/getprices')
            .then(response => {
                const prices = response.data
                console.log(response.data);
                dispatch(fetchPricesSuccess(prices))
            })
            .catch(error => {
                const errorMessage = error.message
                console.log(error.message);
                dispatch(fetchPricesFailure(errorMessage))
            })
    }
}

export const GET_PRICES2_REQUEST = "GET_PRICES2_REQUEST";
export const GET_PRICES2_SUCCESS = "GET_PRICES2_SUCCESS";
export const GET_PRICES2_FAILURE = "GET_PRICES2_FAILURE";

const fetchPricesRequest2 = () => {
    return {
        type: GET_PRICES2_REQUEST
    }
}

const fetchPricesSuccess2 = (prices) => {
    return {
        type: GET_PRICES2_SUCCESS,
        payload: prices
    }
}

const fetchPricesFailure2 = (error) => {
    return {
        type: GET_PRICES2_FAILURE,
        payload: error
    }
}

export const fetchPrices2 = () => {
    return (dispatch) => {
        dispatch(fetchPricesRequest2())
        axios.get('/getprices2')
            .then(response => {
                const prices = response.data
                console.log(response.data);
                dispatch(fetchPricesSuccess2(prices))
            })
            .catch(error => {
                const errorMessage = error.message
                console.log(error.message);
                dispatch(fetchPricesFailure2(errorMessage))
            })
    }
}