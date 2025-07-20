// store.js
import {applyMiddleware, createStore} from "redux";
import thunk from 'redux-thunk';
import rootReducer from "../reducers/rootReducer";
import {composeWithDevTools} from '@redux-devtools/extension';


// const store = createStore(
//     rootReducer, composeWithDevTools(applyMiddleware(applyMiddleware(thunk)),
//       // other store enhancers if any
//     ),
//     // composeWithDevTools(
//     //     applyMiddleware(thunk)
//     // )
//     //
// );

const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(thunk),
  // other store enhancers if any
));

export default store;
