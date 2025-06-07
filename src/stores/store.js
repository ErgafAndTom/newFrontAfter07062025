// store.js
import {applyMiddleware, createStore} from "redux";
import thunk from 'redux-thunk';
import rootReducer from "../reducers/rootReducer";
// import {composeWithDevTools} from '@redux-devtools/extension';


const store = createStore(
    rootReducer,
    // composeWithDevTools(
    //     applyMiddleware(thunk)
    // )
    applyMiddleware(thunk)
);

export default store;