import axios from '../api/axiosInstance';
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    LOGOUT,
} from './types';
import {useNavigate} from 'react-router-dom';
// Действие для входа пользователя
// export const login = (credentials) => async (dispatch) => {
//     dispatch({ type: LOGIN_REQUEST });
//     try {
//         const response = await axios.post('/auth/login', credentials);
//         // console.log(response);
//         const token = response.data.token;
//         // Сохраняем токен в localStorage
//         localStorage.setItem('token', token);
//         dispatch({ type: LOGIN_SUCCESS, payload: token });
//         // Загружаем данные пользователя
//         dispatch(fetchUser());
//         const navigate = useNavigate();
//         navigate('/Desktop');
//     } catch (error) {
//         dispatch({
//             type: LOGIN_FAILURE,
//             payload: error.response ? error.response.data.error : error.message,
//         });
//     }
// };
export const login = (credentials, navigate) => async (dispatch) => {
    if (!credentials || !credentials.username || !credentials.password) {
        dispatch({
            type: LOGIN_FAILURE,
            payload: 'Invalid credentials. Please provide both username and password.',
        });
        return;
    }

    dispatch({ type: LOGIN_REQUEST });

    try {
        const response = await axios.post('/auth/login', credentials);

        if (response.status === 200 && response.data.token) {
            const token = response.data.token;
            localStorage.setItem('token', token);
            dispatch({ type: LOGIN_SUCCESS, payload: token });
            dispatch(fetchUser());
            navigate('/Desktop');
        } else {
            throw new Error('Failed to retrieve a valid token.');
        }
    } catch (error) {
        dispatch({
            type: LOGIN_FAILURE,
            payload: error.response ? error.response.data.error : error.message,
        });
    }
};

// Действие для получения данных пользователя
export const fetchUser = () => async (dispatch) => {
    console.log(dispatch.payload);
    dispatch({ type: FETCH_USER_REQUEST });
    try {
        const response = await axios.get('/auth/me');
        const user = response.data.user;
        // console.log(user);
        dispatch({ type: FETCH_USER_SUCCESS, payload: user });
    } catch (error) {
        dispatch({
            type: FETCH_USER_FAILURE,
            payload: error.response ? error.response.data.error : error.message,
        });
        // Если ошибка аутентификации, выполняем выход
        if (error.response && error.response.status === 401) {
            dispatch(logout());
        }
    }
};

// Действие для выхода пользователя
export const logout = () => (dispatch) => {
    localStorage.removeItem('token');
    dispatch({ type: LOGOUT });
};
