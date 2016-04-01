import React from 'react';
import { render as renderReact } from 'react-dom';

let App = require('./components/app').default;

const rootElement = document.getElementById('root');
const render = (Component) => {
  renderReact(<Component />, rootElement);
}

if (module.hot) {
  module.hot.accept('./components/app', function() {
    let newApp = require('./components/app').default;
    render(newApp);
  });
}

render(App);
