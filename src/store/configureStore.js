import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers';
import rootSaga from '../sagas';

export default (initialState) => {
  return createStore(rootReducer, initialState, applyMiddleware(
    createSagaMiddleware(rootSaga)
  ));
};
