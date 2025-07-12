import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import webSocketService from '../services/websocketService';

// Create the context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app initialization
  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setCurrentUser(response.user);
        
        // Connect to WebSocket after successful login
        try {
          await webSocketService.connect();
          console.log('✅ WebSocket connected after login');
        } catch (wsError) {
          console.warn('⚠️ WebSocket connection failed after login:', wsError);
          // Don't throw error here, just log it - user can still use the app
        }
        
        return response.user;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Disconnect WebSocket before logout
      webSocketService.disconnect();
      console.log('🔌 WebSocket disconnected before logout');
      
      await authService.logout();
      setCurrentUser(null);
    } catch (error) {
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  // Context value
  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;