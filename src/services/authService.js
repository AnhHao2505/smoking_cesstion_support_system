import axiosInstance, { isTokenValid, clearAuthData } from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';
import { getCurrentAuthUser, getCurrentAuthToken, getCurrentUserId } from '../utils/authUtils';
import { message } from 'antd';

// Helper function to parse JWT token
const parseJwtTokenInternal = (token) => {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);
    
    return parsedPayload;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Login function - Updated to match exact API specification
export const login = async (email, password) => {
  try {
    // Exact request body structure as specified in API
    const requestBody = {
      email: email,
      password: password
    };

    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, requestBody);
    
    const data = handleApiResponse(response);
    
    // Handle successful login response based on the new format
    if (data && data.token) {
      // Parse JWT token to extract user information
      console.log(parseJwtTokenInternal(data.token));
      const tokenPayload = parseJwtTokenInternal(data.token);
      
      if (!tokenPayload) {
        throw new Error('Invalid token format');
      }
      
      // Extract user information from token payload
      const user = {
        email: tokenPayload.sub || email, // Use 'sub' from token or fallback to login email
        userId: tokenPayload.userId || null,
        role: tokenPayload.role || 'MEMBER',
        isPremiumMembership: tokenPayload.isPremiumMember || false,
      };
      
      // Store auth token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Store reminder if present for displaying in toast
      if (data.reminder) {
        localStorage.setItem('loginReminder', data.reminder);
      }
      
      return {
        success: true,
        user: user,
        token: data.token,
        reminder: data.reminder || null,
        message: 'Login successful'
      };
    } else {
      throw new Error('Login failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    // Let axios interceptor handle error display, just throw without custom message
    throw error;
  }
};

// Registration function - Updated to match new API specification
export const register = async (name, email, password) => {
  try {
    // Exact request body structure as specified in API
    const requestBody = {
      name: name,
      email: email,
      password: password
    };

    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, requestBody);
    const data = handleApiResponse(response);
    
    // Check if registration was actually successful based on success field
    if (data.success) {
      // Successful registration - return success without redirect
      return {
        success: true,
        message: data.message || 'Đăng ký thành công!'
      };
    } else {
      // Registration failed (e.g., email already exists) - show error popup and throw error
      message.error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle different error response formats
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw {
      success: false,
      message: errorMessage
    };
  }
};

// Logout function
export const logout = async () => {
  try {
    // Call logout endpoint to invalidate token on server
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Clear local storage using helper function
    clearAuthData();
  }
  
  return { 
    success: true, 
    message: 'Logged out successfully' 
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = getCurrentUser();
  
  // Check if both token and user exist, and token is valid
  return !!token && !!user && isTokenValid(token);
};

// Get current user from localStorage (deprecated - use getCurrentAuthUser instead)
export const getCurrentUser = () => {
  return getCurrentAuthUser();
};

// Get member ID from current user (deprecated - use getCurrentUserId instead)
export const getMemberId = () => {
  return getCurrentUserId();
};

// Verify token with server
export const verifyToken = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
    const data = handleApiResponse(response);
    return data.valid === true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Refresh authentication token
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
    const data = handleApiResponse(response);
    
    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.token;
    }
    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear invalid tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    const data = handleApiResponse(response);
    return {
      success: true,
      message: data.message || 'Password reset email sent successfully'
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    throw {
      success: false,
      message: error.message || 'Failed to send password reset email'
    };
  }
};

// Verify account with OTP
export const verifyAccount = async (email, otpInput) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.VERIFY_ACCOUNT, null, {
      params: { email, otpInput }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Account verification error:', error);
    throw {
      success: false,
      message: error.message || 'Account verification failed'
    };
  }
};

// Send verification OTP
export const sendVerifyOtp = async (email) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.SEND_VERIFY_OTP, {
      params: { email }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Send verify OTP error:', error);
    throw {
      success: false,
      message: error.message || 'Failed to send verification OTP'
    };
  }
};

// Send reset password OTP - Updated to match new API
export const sendResetOtp = async (email) => {
  try {
    const response = await axiosInstance.get('/auth/send-reset-otp', {
      params: { email }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Send reset OTP error:', error);
    throw {
      success: false,
      message: 'Không thể gửi OTP. Vui lòng thử lại.'
    };
  }
};

// Validate OTP for password reset
export const validateOtp = async (email, otpInput) => {
  try {
    const response = await axiosInstance.post('/auth/validate-otp', null, {
      params: { email, otpInput }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('OTP validation error:', error);
    throw {
      success: false,
      message: 'OTP không hợp lệ'
    };
  }
};

// Reset password - OTP already validated in previous step
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axiosInstance.patch('/auth/reset-password', null, {
      params: { email, newPassword }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Reset password error:', error);
    throw {
      success: false,
      message: 'Không thể đặt lại mật khẩu'
    };
  }
};

// Get auth token (deprecated - use getCurrentAuthToken instead)
export const getToken = () => {
  return getCurrentAuthToken();
};

// Get login reminder from localStorage
export const getLoginReminder = () => {
  return localStorage.getItem('loginReminder');
};

// Clear login reminder from localStorage
export const clearLoginReminder = () => {
  localStorage.removeItem('loginReminder');
};

// Export JWT parsing function for use in other modules
export const parseJwtToken = parseJwtTokenInternal;

// Refresh user data from stored token
export const refreshUserFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    const tokenPayload = parseJwtTokenInternal(token);
    if (!tokenPayload) {
      clearAuthData();
      return null;
    }
    
    // Create updated user object from token
    const user = {
      email: tokenPayload.sub || '',
      userId: tokenPayload.userId || null,
      role: tokenPayload.role || 'MEMBER',
      isPremiumMembership: tokenPayload.isPremiumMembership || false,
    };
    
    // Update localStorage with refreshed user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error refreshing user from token:', error);
    clearAuthData();
    return null;
  }
};