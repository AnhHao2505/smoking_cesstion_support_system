import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

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
      // Create a basic user object from the email in the response
      const user = {
        email: data.email,
        userId: data.userId || null,      
        role: data.role || 'MEMBER', // Default to 'member' if no role provided
        isPremiumMembership: data.isPremiumMembership || false,
      };
      
      // Store auth token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user: user,
        token: data.token,
        message: 'Login successful'
      };
    } else {
      throw new Error('Login failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different error response formats
    let errorMessage = 'Login failed. Please check your credentials.';
    
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

// Registration function - Updated to match new API specification
export const register = async (name, email, password, contact_number) => {
  try {
    // Exact request body structure as specified in API
    const requestBody = {
      name: name,
      email: email,
      password: password,
      contact_number: contact_number
    };

    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, requestBody);
    const data = handleApiResponse(response);
    
    // Successful registration
    const result = {
      success: true,
      message: data.message || 'Registration successful. Please verify your email to activate your account.'
    };
    
    // Redirect to login page
    window.location.href = '/login';
    
    return result;
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
    // Clear local storage regardless of API call result
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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
  return !!token && !!user;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Get member ID from current user
export const getMemberId = () => {
  const user = getCurrentUser();
  return user?.userId || null;
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

// Send reset password OTP
export const sendResetOtp = async (email) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.SEND_RESET_OTP, {
      params: { email }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Send reset OTP error:', error);
    throw {
      success: false,
      message: error.message || 'Failed to send reset OTP'
    };
  }
};

// Reset password with OTP - Updated to match new API
export const resetPassword = async (email, otpInput, newPassword) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.RESET_PASSWORD, null, {
      params: { email, otpInput, newPassword }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Reset password error:', error);
    throw {
      success: false,
      message: error.message || 'Failed to reset password'
    };
  }
};

// Get tester accounts
export const getTesters = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_TESTERS);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching testers:', error);
    throw handleApiError(error);
  }
};