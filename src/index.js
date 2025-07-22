// This is the entry point of the React application. It renders the App component into the root div of index.html.

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Initialize ResizeObserver error handler globally
import './utils/resizeObserverErrorHandler';
// Configure global Ant Design message settings
import { message, notification } from 'antd';

// Global configuration for messages and notifications
message.config({
  top: 100, // Position below navbar (navbar is usually around 64px height)
  duration: 2, // Reduce duration to 2 seconds instead of default 3
  maxCount: 3, // Maximum number of messages shown at once
  getContainer: () => document.body, // Ensure messages are rendered in body
});

notification.config({
  top: 100, // Position below navbar
  duration: 3, // Keep notifications a bit longer than messages
  maxCount: 4, // Maximum number of notifications shown at once
  placement: 'topRight', // Position notifications on top right
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);