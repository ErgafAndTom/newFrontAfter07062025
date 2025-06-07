import {combineReducers} from "redux";
import counterReducer from "./counterReducer";
// import wordsSlice from './wordsSlice';
import filesReducer from "./filesReducer";
import pricesReducer from "./pricesReducer";
import currentUserReducer from "./CurrentUserReducer";
import authReducer from "./authReducer";
import invoiceReducer from "./invoiceReducer";
import search from "./search";

const rootReducer = combineReducers({
    prices: pricesReducer,
    files: filesReducer,
    counter: counterReducer,
    currentUser: currentUserReducer,
    auth: authReducer,
    invoices: invoiceReducer,
    // words: wordsSlice,
    search: search,
})

export default rootReducer;