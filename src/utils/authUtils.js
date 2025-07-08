import { isTokenValid, clearAuthData } from './axiosConfig';

/**
 * Auth utility functions for token management and validation
 */

// Check if user is currently authenticated
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return { isAuthenticated: false, reason: 'Missing token or user data' };
  }
  
  if (!isTokenValid(token)) {
    clearAuthData();
    return { isAuthenticated: false, reason: 'Invalid token' };
  }
  
  try {
    const user = JSON.parse(userStr);
    return { 
      isAuthenticated: true, 
      user, 
      token 
    };
  } catch (error) {
    clearAuthData();
    return { isAuthenticated: false, reason: 'Invalid user data' };
  }
};

// Get current authenticated user
export const getCurrentAuthUser = () => {
  const authStatus = checkAuthStatus();
  return authStatus.isAuthenticated ? authStatus.user : null;
};

// Get current auth token
export const getCurrentAuthToken = () => {
  const authStatus = checkAuthStatus();
  return authStatus.isAuthenticated ? authStatus.token : null;
};

// Force logout and clear auth data
export const forceLogout = (reason = 'Session expired') => {
  console.warn(`Force logout: ${reason}`);
  clearAuthData();
  
  // Optionally redirect to login page
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getCurrentAuthUser();
  if (!user || !user.role) return false;
  
  return user.role === requiredRole;
};

// Check if user is premium member
export const isPremiumMember = () => {
  const user = getCurrentAuthUser();
  return user?.isPremium === true;
};

// Get user ID from current auth user
export const getCurrentUserId = () => {
  const user = getCurrentAuthUser();
  return user?.userId || null;
};

// Validate and refresh auth state
export const validateAuthState = () => {
  const authStatus = checkAuthStatus();
  
  if (!authStatus.isAuthenticated) {
    // Clear any invalid auth data
    clearAuthData();
    return false;
  }
  
  return true;
};

// Auth roles enum for consistency
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COACH: 'COACH', 
  MEMBER: 'MEMBER'
};
