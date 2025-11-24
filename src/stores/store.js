// telegram.js
import {applyMiddleware, createStore} from "redux";
import thunk from 'redux-thunk';
import rootReducer from "../reducers/rootReducer";
import {composeWithDevTools} from '@redux-devtools/extension';


// const telegram = createStore(
//     rootReducer, composeWithDevTools(applyMiddleware(applyMiddleware(thunk)),
//       // other telegram enhancers if any
//     ),
//     // composeWithDevTools(
//     //     applyMiddleware(thunk)
//     // )
//     //
// );

export const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(thunk),
  // other telegram enhancers if any
));

export default store;
