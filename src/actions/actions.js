import {useEffect} from "react";
import axios from "../api/axiosInstance";
import {FETCH_USER_FAILURE, FETCH_USER_REQUEST, FETCH_USER_SUCCESS} from "./types";
import {logout} from "./authActions";

export let INCREMENT = "INCREMENT";
export let DECREMENT = "DECREMENT";


//-----------------------------

// export const searchTransaction = (data) => {
//     let data = {
//         // name: "Orders",
//         inPageCount: inPageCount,
//         currentPage: currentPage,
//         search: typeSelect,
//         columnName: thisColumn
//     }
//     axios.post(`/user/All`, data)
//         .then(response => {
//             console.log(response.data);
//             setData(response.data)
//             setError(null)
//             setLoading(false)
//             setPageCount(Math.ceil(response.data.count / inPageCount))
//         })
//         .catch(error => {
//             if (error.response.status === 403) {
//                 navigate('/login');
//             }
//             setError(error.message)
//             console.log(error.message);
//         })
//
// };
export const fetchUser = (credentials) => async (dispatch) => {
    dispatch({ type: FETCH_USER_REQUEST });
    try {
        console.log(credentials);
        const response = await axios.post(`/user/All`, credentials);
        console.log(response);
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
