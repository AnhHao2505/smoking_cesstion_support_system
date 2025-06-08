import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as authService from '../../services/authService';
import '../../styles/AuthPages.css';

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  contactNumber: Yup.string()
    .required('Phone number is required'),
  role: Yup.string()
    .oneOf(['member', 'coach'], 'Please select a valid role')
    .required('Please select your role'),
  agreeTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setRegisterError('');
    setRegisterSuccess('');
    
    try {
      // Remove confirmPassword and agreeTerms before sending to API
      const { confirmPassword, agreeTerms, ...userData } = values;
      
      const response = await authService.register(userData);
      
      setIsLoading(false);
      setSubmitting(false);
      setRegisterSuccess(response.message || 'Registration successful! You can now log in.');
      
      resetForm();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      setSubmitting(false);
      setRegisterError(error.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="auth-card card">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Create an Account</h2>
                
                {registerError && (
                  <div className="alert alert-danger" role="alert">
                    {registerError}
                  </div>
                )}
                
                {registerSuccess && (
                  <div className="alert alert-success" role="alert">
                    {registerSuccess}
                  </div>
                )}
                
                <Formik
                  initialValues={{ 
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    contactNumber: '',
                    role: 'member',
                    agreeTerms: false
                  }}
                  validationSchema={RegisterSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, touched, errors }) => (
                    <Form>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="fullName" className="form-label">
                            Full Name
                          </label>
                          <Field
                            type="text"
                            name="fullName"
                            className={`form-control ${
                              touched.fullName && errors.fullName ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your full name"
                          />
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
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
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <Field
                            type="password"
                            name="password"
                            className={`form-control ${
                              touched.password && errors.password ? 'is-invalid' : ''
                            }`}
                            placeholder="Create a password"
                          />
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                          </label>
                          <Field
                            type="password"
                            name="confirmPassword"
                            className={`form-control ${
                              touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''
                            }`}
                            placeholder="Confirm your password"
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="contactNumber" className="form-label">
                            Contact Number
                          </label>
                          <Field
                            type="tel"
                            name="contactNumber"
                            className={`form-control ${
                              touched.contactNumber && errors.contactNumber ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your phone number"
                          />
                          <ErrorMessage
                            name="contactNumber"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="role" className="form-label">
                            I want to register as
                          </label>
                          <Field
                            as="select"
                            name="role"
                            className={`form-select ${
                              touched.role && errors.role ? 'is-invalid' : ''
                            }`}
                          >
                            <option value="member">Member (I want to quit smoking)</option>
                            <option value="coach">Coach (I want to help others quit)</option>
                          </Field>
                          <ErrorMessage
                            name="role"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="form-check">
                          <Field
                            type="checkbox"
                            name="agreeTerms"
                            className={`form-check-input ${
                              touched.agreeTerms && errors.agreeTerms ? 'is-invalid' : ''
                            }`}
                            id="agreeTerms"
                          />
                          <label className="form-check-label" htmlFor="agreeTerms">
                            I agree to the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                          </label>
                          <ErrorMessage
                            name="agreeTerms"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          'Register'
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>

                <div className="mt-4 text-center">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none">
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;