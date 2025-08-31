import axios from 'axios';
export const GET_CURRENT_USER_REQUEST = "GET_CURRENT_USER_REQUEST";
export const GET_CURRENT_USER_SUCCESS = "GET_CURRENT_USER_SUCCESS";
export const GET_CURRENT_USER_FAILURE = "GET_CURRENT_USER_FAILURE";
export const LOGIN_CURRENT_USER_REQUEST = "LOGIN_CURRENT_USER_REQUEST";
export const LOGIN_CURRENT_USER_SUCCESS = "LOGIN_CURRENT_USER_SUCCESS";
export const LOGIN_CURRENT_USER_FAILURE = "LOGIN_CURRENT_USER_FAILURE";
export const LOGOUT_CURRENT_USER_FAILURE = "LOGOUT_CURRENT_USER_FAILURE";
export const LOGOUT_CURRENT_USER_SUCCESS = "LOGOUT_CURRENT_USER_SUCCESS";

const fetchCurrentUserRequest = () => {
    return {
        type: GET_CURRENT_USER_REQUEST
    }
}

const fetchCurrentUserSuccess = (user) => {
    return {
        type: GET_CURRENT_USER_SUCCESS,
        payload: user
    }
}

const fetchCurrentUserFailure = (error) => {
    return {
        type: GET_CURRENT_USER_FAILURE,
        payload: error
    }
}

export const fetchCurrentUser = () => {
    return (dispatch) => {
        dispatch(fetchCurrentUserRequest())
        axios.get('/auth/me')
            .then(response => {
                const user = response.data
                // console.log(response.data);
                // dispatch(fetchCurrentUserSuccess(user))
                if(user.length === 0){
                    dispatch(fetchCurrentUserSuccess(null))
                } else {
                    dispatch(fetchCurrentUserSuccess(user))
                }
            })
            .catch(error => {
                const errorMessage = error.message
                dispatch(fetchCurrentUserFailure(errorMessage))
            })
    }
}

const loginRequest = () => {
    return {
        type: LOGIN_CURRENT_USER_REQUEST
    }
}

const loginFailure = (error) => {
    return {
        type: LOGIN_CURRENT_USER_FAILURE,
        payload: error
    }
}

const logoutFailure = () => {
    return {
        type: LOGOUT_CURRENT_USER_FAILURE
    }
}

export const loginSendCurrentUser = (login, pass) => {
    return (dispatch) => {
        dispatch(loginRequest())
        let config = {
            username: login,
            password: pass
        };
        axios.post('/auth/login', config)
            .then(response => {
                // console.log(response);
                if (response.status === 200){
                    // dispatch(loginSuccess())
                    // dispatch(fetchCurrentUser())
                    // dispatch(fetchAllFiles())
                    document.location.pathname="/"
                } else {
                    dispatch(loginFailure("incorrect login/pass"))
                }
            })
            .catch(error => {
                const errorMessage = error.message
                dispatch(loginFailure(errorMessage))
            })
    }
}

export const logoutUser = () => {
    return (dispatch) => {
        axios.delete('/auth/logout')
            .then(response => {
                // dispatch(logoutSuccess())
                dispatch(fetchCurrentUser(null))
                document.location.href="/"
            })
            .catch(error => {
                const errorMessage = error.message
                dispatch(logoutFailure(errorMessage))
            })
    }
}
