import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <div>
        <Router>
            <div className="app">
                <main className="main-content">
                <AppRoutes />
                </main>
            </div>
        </Router>
    </div>
  );
}

export default App;