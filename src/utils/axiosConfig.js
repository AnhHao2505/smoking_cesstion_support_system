import axios from 'axios';
import { API_BASE_URL } from './apiEndpoints';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Only add authorization header if token exists and it's not a public endpoint
    const publicEndpoints = ['/auth/login', '/auth/register', '/blog', '/public'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (remove in production)
    console.log('Making request to:', config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - only clear token, don't redirect automatically
          console.error('Authentication failed:', data.message || 'Unauthorized access');
          // Only clear auth data, let components handle the response
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // Remove automatic redirect - let components handle this
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 422:
          // Validation errors
          console.error('Validation errors:', data.errors);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error(`HTTP ${status}:`, data.message);
      }
      
      return Promise.reject(error);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
