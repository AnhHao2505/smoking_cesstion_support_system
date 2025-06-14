import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;