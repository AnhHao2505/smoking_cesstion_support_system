// filepath: d:\qwer\swp_caithuoc\smoking_cessation_support_system_fe\src\components\layout\Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/Navbar.css'; // Ensure you have the appropriate CSS file

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Add scroll listener for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle window resize for mobile menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Home">
          <img src="/logo.svg" alt="Logo" />
          <span>Smoking Cessation Support</span>
        </Link>

        {/* Hamburger menu button for mobile */}
        <div className="menu-icon" onClick={toggleMenu} aria-label={isOpen ? "Close menu" : "Open menu"} role="button" tabIndex={0}>
          <div className={`hamburger ${isOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Navigation menu */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/articles" className={location.pathname.startsWith('/articles') ? 'active' : ''}>
              Articles
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/community" className={location.pathname.startsWith('/community') ? 'active' : ''}>
              Community
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
              Contact
            </Link>
          </li>
        </ul>
        <div>
          <Link to="/login" className="login-button mr-3">Login</Link>
          <Link to="/register" className="register-button">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;