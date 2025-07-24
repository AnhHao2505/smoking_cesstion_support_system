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
  localStorage.removeItem('loginReminder');
  localStorage.removeItem('me');
  localStorage.removeItem('vnpay_payment_session');
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
      '/api/feedbacks/published',
      '/api/notifications/all',
      '/api/notifications/unread',
      '/api/notifications/read',
      '/api/notifications/important',
      '/api/notifications/mark-read'
    ];
    
      // Check if current request is to a public endpoint - improved matching
      const isPublicEndpoint = publicEndpoints.some(endpoint => {
        const fullUrl = config.url || '';
        // Check if URL starts with or contains the public endpoint pattern
        return fullUrl.startsWith(endpoint) || fullUrl.includes(endpoint);
      });    // Add authorization header for authenticated endpoints
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
      
      // Lọc các thông báo lỗi có chứa status code hoặc HTTP code
      if (errorMessage) {
        if (errorMessage.includes('status code') || 
            errorMessage.includes('HTTP') || 
            errorMessage.includes('Status Code') || 
            errorMessage.includes('failed with status')) {
          console.log('Removing status code from error message');
          errorMessage = ''; // Loại bỏ hoàn toàn thông báo kỹ thuật
        }
      }
      
      // Loại bỏ hoàn toàn các phần thông báo kỹ thuật
      if (errorMessage) {
        const technicalTerms = ['status code', 'HTTP', 'Status Code', 'failed with status', 'error code', 'statusCode', 
                                'status: ', 'code: ', 'exception', 'Exception', 'stack trace', 'Request failed'];
        
        for (const term of technicalTerms) {
          if (errorMessage.includes(term)) {
            console.log(`Filtered out technical error message containing "${term}":`, errorMessage);
            errorMessage = ''; // Reset error message to use friendly defaults
            break;
          }
        }
      }
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and auth data
          console.error('Authentication failed:', errorMessage || 'Unauthorized access');
          
          // Xử lý chi tiết các trường hợp lỗi 401 từ Spring Security
          if (errorMessage && errorMessage.includes('Invalid token')) {
            message.error('Token không hợp lệ. Vui lòng đăng nhập lại.');
          } else if (errorMessage && errorMessage.includes('expired')) {
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (errorMessage && errorMessage.trim() !== '') {
            message.error('Lỗi xác thực: ' + errorMessage);
          } else {
            message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          }
          
          clearAuthData();
          // Let components handle the redirect
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', errorMessage);
          // Xử lý cụ thể cho lỗi Spring Security
          if (errorMessage && errorMessage.includes('Access Denied')) {
            message.error('Quyền truy cập bị từ chối. Bạn không có đủ quyền để thực hiện thao tác này.');
          } else if (errorMessage && errorMessage.includes('Full authentication')) {
            message.error('Yêu cầu xác thực đầy đủ. Vui lòng đăng nhập lại để tiếp tục.');
            clearAuthData(); // Xóa dữ liệu xác thực nếu có lỗi Full authentication
          } else if (errorMessage && errorMessage.trim() !== '') {
            message.error('Lỗi quyền truy cập: ' + errorMessage);
          } else {
            message.error('Bạn không có quyền truy cập tài nguyên này');
          }
          break;
        case 404:
          console.error('Resource not found:', errorMessage);
          // Hiển thị thông báo thân thiện
          if (errorMessage && errorMessage.trim() !== '') {
            message.error('Không tìm thấy: ' + errorMessage);
          } else {
            message.error('Không tìm thấy tài nguyên yêu cầu');
          }
          break;
        case 422:
          // Validation errors
          console.error('Validation errors:', data.errors);
          // Hiển thị thông báo thân thiện
          if (errorMessage && errorMessage.trim() !== '') {
            message.error('Dữ liệu không hợp lệ: ' + errorMessage);
          } else {
            message.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại thông tin đã nhập');
          }
          break;
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded:', errorMessage);
          // Hiển thị thông báo thân thiện
          message.error('Đã vượt quá giới hạn số lần sử dụng là 3 / 5 nếu là premium trên ngày. Vui lòng thử lại vào ngày mai.');
          break;
        case 500:
          console.error('Server error:', errorMessage);
          // Hiển thị thông báo đơn giản cho người dùng
          message.error('Lỗi máy chủ, vui lòng thử lại sau');
          break;
        default:
          console.error(`HTTP ${status}:`, errorMessage);
          // Chỉ hiển thị thông báo đơn giản
          message.error('Có lỗi xảy ra, vui lòng thử lại sau');
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
