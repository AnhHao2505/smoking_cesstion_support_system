import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import '../../styles/Navbar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
  }, [location]); // Re-check when location changes

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  // Render navigation links based on user role
  const renderNavLinks = () => {
    // Public links available to all users
    const publicLinks = [
      { path: '/', label: 'Home' },
      { path: '/blog', label: 'Articles' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' }
    ];

    // Member-specific links
    const memberLinks = [
      { path: '/member/dashboard', label: 'Dashboard' },
      { path: '/member/quit-progress', label: 'My Progress' },
      { path: '/member/quit-plan', label: 'My Quit Plan' },
      { path: '/member/appointments', label: 'Appointments' }
    ];

    // Coach-specific links
    const coachLinks = [
      { path: '/coach/dashboard', label: 'Dashboard' },
      { path: '/coach/schedule', label: 'Schedule' },
      { path: '/coach/appointments', label: 'Appointments' }
    ];

    // Admin-specific links
    const adminLinks = [
      { path: '/admin/dashboard', label: 'Admin Panel' }
    ];

    // Determine which links to show based on user role
    let links = [...publicLinks];

    if (user) {
      // Add role-specific links
      if (user.role === 'member') {
        links = [...links, ...memberLinks];
      } else if (user.role === 'coach') {
        links = [...coachLinks];
      } else if (user.role === 'admin') {
        links = [...links, ...adminLinks];
      }
    }

    return links.map((link, index) => (
      <li className="nav-item" key={index}>
        <Link 
          to={link.path} 
          className={`nav-link ${location.pathname === link.path || location.pathname.startsWith(link.path + '/') ? 'active fw-bold' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          {link.label}
        </Link>
      </li>
    ));
  };

  // Render authentication section (login/register buttons or user info)
  const renderAuthSection = () => {
    if (user) {
      return (
        <div className="d-flex align-items-center">
          <span className="me-3 text-white">{user.fullName}</span>
          <Link to="/profile" className="btn btn-outline-light me-2">Profile</Link>
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
          <span>Smoking Cessation</span>
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
            {renderNavLinks()}
          </ul>
          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;