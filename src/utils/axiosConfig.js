import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from './apiEndpoints';

// Helper function to check if token is valid (not expired)
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Simple token format check - you can enhance this with JWT decoding if needed
    const parts = token.split('.');
    if (parts.length !== 3) return false; // Basic JWT structure check
    
    // Additional validation can be added here
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

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
    
    // Define public endpoints that don't require authentication
    const publicEndpoints = [
      '/auth/login',
      '/auth/register', 
      '/auth/send-verify-otp',
      '/auth/send-reset-otp',
      '/auth/verify-account',
      '/auth/reset-password',
      '/auth/get-testers',
      '/blog',
      '/public',
      '/api/feedbacks/published' // Published feedbacks are public
    ];
    
    // Check if current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      const fullUrl = config.url || '';
      return fullUrl.includes(endpoint);
    });
    
    // Add authorization header for authenticated endpoints
    if (token && !isPublicEndpoint) {
      // Validate token before using it
      if (isTokenValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request');
      } else {
        // Token is invalid, clear auth data
        console.warn('Invalid token detected, clearing auth data');
        clearAuthData();
        // Don't add invalid token to request
      }
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
      
      // Extract error message from response
      let errorMessage = '';
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.join(', ');
      } else if (data.errors && typeof data.errors === 'object') {
        errorMessage = Object.values(data.errors).flat().join(', ');
      }
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and auth data
          console.error('Authentication failed:', errorMessage || 'Unauthorized access');
          if (errorMessage) {
            message.error(errorMessage);
          } else {
            message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          }
          clearAuthData();
          // Let components handle the redirect
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', errorMessage);
          message.error(errorMessage || 'Bạn không có quyền truy cập tài nguyên này');
          break;
        case 404:
          console.error('Resource not found:', errorMessage);
          message.error(errorMessage || 'Không tìm thấy tài nguyên yêu cầu');
          break;
        case 422:
          // Validation errors
          console.error('Validation errors:', data.errors);
          if (errorMessage) {
            message.error(errorMessage);
          } else {
            message.error('Dữ liệu không hợp lệ');
          }
          break;
        case 500:
          console.error('Server error:', errorMessage);
          message.error(errorMessage || 'Lỗi máy chủ, vui lòng thử lại sau');
          break;
        default:
          console.error(`HTTP ${status}:`, errorMessage);
          if (errorMessage) {
            message.error(errorMessage);
          } else {
            message.error(`Lỗi ${status}: Có lỗi xảy ra, vui lòng thử lại`);
          }
      }
      
      return Promise.reject(error);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      message.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

// Export helper functions for use in other parts of the application
export { isTokenValid, clearAuthData };
