// This is the entry point of the React application. It renders the App component into the root div of index.html.

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);