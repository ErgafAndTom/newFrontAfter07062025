import {combineReducers} from "redux";
import counterReducer from "./counterReducer";
// import telegramSlice from "../telegram/telegramSlice";
// import wordsSlice from './wordsSlice';
// import { combineReducers } from "redux";

import filesReducer from "./filesReducer";
import pricesReducer from "./pricesReducer";
import currentUserReducer from "./CurrentUserReducer";
import authReducer from "./authReducer";
import invoiceReducer from "./invoiceReducer";
import search from "./search";
import trelloReducer from "./trelloReducer";
import searchReducer from "./searchReducer";
import telegramReducer from "../telegram/telegramSlice";




const rootReducer = combineReducers({
    prices: pricesReducer,
    files: filesReducer,
    counter: counterReducer,
    currentUser: currentUserReducer,
    auth: authReducer,
    invoices: invoiceReducer,
    trello: trelloReducer,
    search: searchReducer,
  // user: userReducer,
  // orders: ordersReducer,
  telegram: telegramReducer,  // ← просто добавить сюда



})

export default rootReducer;
