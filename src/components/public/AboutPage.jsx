import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4">About Our Platform</h1>
              <p className="lead">
                Helping individuals overcome nicotine addiction and start a healthier life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section mission">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="section-title">Our Mission</h2>
              <p>
                The Smoking Cessation Support Platform was created with a simple yet powerful mission: to help people break free from tobacco addiction and live healthier, longer lives.
              </p>
              <p>
                We believe that with the right tools, support, and community, anyone can quit smoking for good. Our evidence-based approach combines personalized quit plans, professional coaching, and peer support to maximize your chances of success.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src="/images/mission.svg"
                alt="Our mission illustration"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works bg-light">
        <div className="container">
          <h2 className="text-center section-title mb-5">How Our Platform Works</h2>
          <div className="row">
            <div className="col-md-3">
              <div className="step-card text-center">
                <div className="step-number">1</div>
                <h4>Create Account</h4>
                <p>Sign up and complete your profile with your smoking habits and goals.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="step-card text-center">
                <div className="step-number">2</div>
                <h4>Develop Quit Plan</h4>
                <p>Get a personalized cessation plan based on your habits and preferences.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="step-card text-center">
                <div className="step-number">3</div>
                <h4>Track Progress</h4>
                <p>Log your daily journey, triggers, and achievements through our system.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="step-card text-center">
                <div className="step-number">4</div>
                <h4>Get Support</h4>
                <p>Connect with coaches and community members for motivation and advice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="section statistics">
        <div className="container">
          <h2 className="text-center section-title mb-5">Platform Impact</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="stat-card text-center">
                <h3 className="stat-number">15,000+</h3>
                <p className="stat-label">Users Helped</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center">
                <h3 className="stat-number">72%</h3>
                <p className="stat-label">Success Rate</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center">
                <h3 className="stat-number">$3.2M+</h3>
                <p className="stat-label">Money Saved by Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section team bg-light">
        <div className="container">
          <h2 className="text-center section-title mb-5">Our Team</h2>
          <div className="row">
            <div className="col-lg-4">
              <div className="team-member card text-center p-4">
                <img
                  src="/images/team-member-1.jpg"
                  alt="Dr. Sarah Johnson"
                  className="team-img rounded-circle mx-auto"
                />
                <h4 className="mt-3">Dr. Sarah Johnson</h4>
                <p className="text-muted">Chief Medical Advisor</p>
                <p>
                  Board-certified pulmonologist with 15 years of experience in smoking cessation therapies.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="team-member card text-center p-4">
                <img
                  src="/images/team-member-2.jpg"
                  alt="Michael Chang"
                  className="team-img rounded-circle mx-auto"
                />
                <h4 className="mt-3">Michael Chang</h4>
                <p className="text-muted">Lead Coach</p>
                <p>
                  Former smoker turned cessation specialist with certifications in behavioral therapy.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="team-member card text-center p-4">
                <img
                  src="/images/team-member-3.jpg"
                  alt="Lisa Rodriguez"
                  className="team-img rounded-circle mx-auto"
                />
                <h4 className="mt-3">Lisa Rodriguez</h4>
                <p className="text-muted">Community Manager</p>
                <p>
                  Passionate about building supportive environments for those on their quit journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section about-cta">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2>Join Our Community Today</h2>
              <p className="lead mb-4">
                Take the first step toward a smoke-free life with personalized support and guidance.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg me-3">
                Sign Up Now
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;