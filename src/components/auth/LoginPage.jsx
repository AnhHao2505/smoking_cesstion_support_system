import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as authService from '../../services/authService';
import '../../styles/AuthPages.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await authService.login(values.email, values.password);
      
      // Successful login
      setIsLoading(false);
      setSubmitting(false);
      
      // Redirect based on user role
      const { role } = response.user;
      if (role === 'member') {
        navigate('/member/dashboard');
      } else if (role === 'coach') {
        navigate('/coach/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setIsLoading(false);
      setSubmitting(false);
      setLoginError(error.message || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="auth-card card">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Login</h2>
                
                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}
                
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={LoginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, touched, errors }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <Field
                          type="email"
                          name="email"
                          className={`form-control ${
                            touched.email && errors.email ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your email"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <Field
                          type="password"
                          name="password"
                          className={`form-control ${
                            touched.password && errors.password ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your password"
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                          />
                          <label className="form-check-label" htmlFor="rememberMe">
                            Remember me
                          </label>
                        </div>
                        <Link to="/forgot-password" className="text-decoration-none">
                          Forgot Password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>

                <div className="mt-4 text-center">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none">
                      Register here
                    </Link>
                  </p>
                </div>

                <div className="demo-accounts mt-4">
                  <p className="text-center mb-2 text-muted">Demo Accounts:</p>
                  <div className="alert alert-info">
                    <p className="mb-1"><small><strong>Member:</strong> member@example.com / password123</small></p>
                    <p className="mb-1"><small><strong>Coach:</strong> coach@example.com / password123</small></p>
                    <p className="mb-0"><small><strong>Admin:</strong> admin@example.com / password123</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;