// filepath: d:\qwer\swp_caithuoc\smoking_cessation_support_system_fe\src\components\public\LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1>Take Control of Your Life</h1>
              <p className="lead">
                Join our supportive community and quit smoking for good. Our proven methods and personalized plans make quitting easier than ever.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-lg me-3">
                  Get Started
                </Link>
                <Link to="/about" className="btn btn-outline-secondary btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img
                src="/images/hero-image.svg"
                alt="Quit smoking illustration"
                className="img-fluid hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features">
        <div className="container">
          <h2 className="text-center section-title">How We Help You Quit</h2>
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="feature-card card text-center p-4 mb-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <h3>Personalized Plan</h3>
                <p>
                  Create a tailored quit plan that fits your lifestyle and smoking habits for the best chance of success.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card card text-center p-4 mb-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-people"></i>
                </div>
                <h3>Community Support</h3>
                <p>
                  Connect with others on the same journey to stay motivated and share experiences.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card card text-center p-4 mb-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h3>Progress Tracking</h3>
                <p>
                  Monitor your smoke-free days, health improvements, and money saved to keep you motivated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials bg-light">
        <div className="container">
          <h2 className="text-center section-title">Success Stories</h2>
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="card testimonial-card p-4">
                <div className="testimonial-content">
                  <p>"After 15 years of smoking, I never thought I could quit. This platform gave me the tools and support I needed to finally become smoke-free."</p>
                </div>
                <div className="testimonial-author mt-3">
                  <h5>Michael R.</h5>
                  <p className="text-muted">Smoke-free for 2 years</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card testimonial-card p-4">
                <div className="testimonial-content">
                  <p>"The daily tracking and coach support made all the difference. I can breathe better and have so much more energy now!"</p>
                </div>
                <div className="testimonial-author mt-3">
                  <h5>Sarah T.</h5>
                  <p className="text-muted">Smoke-free for 8 months</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card testimonial-card p-4">
                <div className="testimonial-content">
                  <p>"Working with a quit buddy helped me stay accountable. The achievements and badges kept me motivated through the tough times."</p>
                </div>
                <div className="testimonial-author mt-3">
                  <h5>David W.</h5>
                  <p className="text-muted">Smoke-free for 1 year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2>Ready to Start Your Journey?</h2>
              <p className="lead">
                Join thousands who have successfully quit smoking with our support system.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg mt-4">
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;