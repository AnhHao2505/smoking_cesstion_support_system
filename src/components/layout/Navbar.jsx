import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Remove custom CSS import
// import '../../styles/Navbar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to check if user is logged in and get user data
  const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  // Logout handler function
  const handleLogout = () => {
    localStorage.removeItem('user');
    // Additional logout logic - redirect or refresh
    window.location.reload();
  };

  // Component rendering logic
  const renderAuthSection = () => {
    const user = getUserData();

    if (user && user.fullName) {
      return (
        <div className="d-flex align-items-center">
          <span className="me-3 text-white">{user.fullName}</span>
          <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        </div>
      );
    } else {
      return (
        <div className="d-flex">
          <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
          <Link to="/register" className="btn btn-success">Register</Link>
        </div>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/logo.svg" alt="Logo" height="32" className="me-2" />
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active fw-bold' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/articles" 
                className={`nav-link ${location.pathname.startsWith('/articles') ? 'active fw-bold' : ''}`}
              >
                Articles
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/community" 
                className={`nav-link ${location.pathname.startsWith('/community') ? 'active fw-bold' : ''}`}
              >
                Community
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/contact" 
                className={`nav-link ${location.pathname === '/contact' ? 'active fw-bold' : ''}`}
              >
                Contact
              </Link>
            </li>
          </ul>
          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;