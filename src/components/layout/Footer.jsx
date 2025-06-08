import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Smoking Cessation Support</h5>
            <p>Your partner on the journey to a smoke-free life.</p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link className="text-light" to="/">Home</Link></li>
              <li><Link className="text-light" to="/about">About</Link></li>
              <li><Link className="text-light" to="/register">Get Started</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact</h5>
            <p>Email: support@smokingcessation.org</p>
            <p>Phone: (555) 123-4567</p>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Smoking Cessation Support Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;