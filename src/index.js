import 'babel-polyfill'; // generators
import React from 'react';
import { render as renderReact } from 'react-dom';
import configureStore from './store/configureStore';

const store = configureStore();

let App = require('./components/app').default;
const render = (Component) => {
  renderReact(<Component {...store} />, document.getElementById('root'));
}

if (module.hot) {
  module.hot.accept('./components/app', function() {
    let newApp = require('./components/app').default;
    render(newApp);
  });
}

store.subscribe(() => render(App));
store.dispatch({ type: 'APP_INIT' });
