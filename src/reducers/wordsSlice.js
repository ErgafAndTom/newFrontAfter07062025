// src/redux/wordsReducer.js
import * as THREE from 'three';

const generateRandomPosition = (radius = 50) => {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
};
const initialState = {
    words: [
        {
            id: 1,
            text: 'Світло',
            category: 'Природні явища',
            meanings: [
                { id: 1, meaning: 'Фізичне світло' },
                { id: 2, meaning: 'Символічне світло' },
            ],
            position: generateRandomPosition(),
        },
        {
            id: 2,
            text: 'Ліс',
            category: 'Природа та екосистеми',
            meanings: [
                { id: 1, meaning: 'Географічний ліс' },
                { id: 2, meaning: 'Культурний ліс' },
            ],
            position: generateRandomPosition(),
        },
        // Додайте більше слів за потребою
    ],
    wordsIsLoading: false,
    wordsError: null,
};

const ADD_WORD_REQUEST = 'ADD_WORD_REQUEST';
const ADD_WORD_SUCCESS = 'ADD_WORD_SUCCESS';
const ADD_WORD_FAILURE = 'ADD_WORD_FAILURE';

const wordsSlice = (state = initialState, action) => {
    switch (action.type) {
        case ADD_WORD_REQUEST:
            return {
                ...state,
                wordsIsLoading: true,
                wordsError: null,
            };
        case ADD_WORD_SUCCESS:
            return {
                ...state,
                words: [...state.words, action.payload],
                wordsIsLoading: false,
                wordsError: null,
            };
        case ADD_WORD_FAILURE:
            return {
                ...state,
                wordsIsLoading: false,
                wordsError: action.payload,
            };
        default:
            return state;
    }
};

// Action creators
export const addWordRequest = () => ({
    type: ADD_WORD_REQUEST,
});

export const addWordSuccess = (word) => ({
    type: ADD_WORD_SUCCESS,
    payload: word,
});

export const addWordFailure = (error) => ({
    type: ADD_WORD_FAILURE,
    payload: error,
});

export default wordsSlice;
