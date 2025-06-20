import {GET_ALL_FILES_FAILURE, GET_ALL_FILES_REQUEST, GET_ALL_FILES_SUCCESS} from "../actions/allFilesAction";
import {
    ADD_FILE,
    DELETE_FILE, GET_IMG_FAILURE,
    GET_IMG_REQUEST,
    GET_IMG_SUCCESS,
    PICK_FILE,
    UPDATE_FILE
} from "../actions/fileAction";

const initialState = {
    allFiles: [],
    isLoading: false,
    error: null,
    thisFile: null,

    img: null,
    imgIsLoading: false,
    imgError: null,
};

const filesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_FILE:
            return { ...state, allFiles: state.allFiles.concat(action.payload) };
        case DELETE_FILE:
            let thisF = state.thisFile
            if(state.thisFile){
                if(state.thisFile.id === action.payload){
                    thisF = null;
                }
            }
            return {
                ...state,
                allFiles: state.allFiles.filter((item) => item.id !== action.payload),
                thisFile: thisF
            };
        case PICK_FILE:
            const thisFile = state.allFiles.find((item) => item.id === action.payload);
            return {
                ...state,
                thisFile: thisFile
            };
        case UPDATE_FILE:
        {const newAllFiles = [];
            for (let i = 0; i < state.allFiles.length; i++){
                if(state.allFiles[i].id === action.payload.id) {
                    newAllFiles.push(action.payload)
                } else {
                    newAllFiles.push(state.allFiles[i])
                }
            }
            return {
                ...state,
                allFiles: newAllFiles,
                thisFile: action.payload
            };}
        case GET_ALL_FILES_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null
            };
        case GET_ALL_FILES_SUCCESS:
            return {
                ...state,
                allFiles: action.payload,
                isLoading: false,
                error: null
            };
        case GET_ALL_FILES_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };


        case GET_IMG_REQUEST:
            return {
                ...state,
                imgIsLoading: true,
                imgError: null
            };
        case GET_IMG_SUCCESS:
            return {
                ...state,
                img: action.payload,
                imgIsLoading: false,
                imgError: null
            };
        case GET_IMG_FAILURE:
            return {
                ...state,
                imgIsLoading: false,
                imgError: action.payload
            };
        default:
            return state;
    }
};

export default filesReducer;