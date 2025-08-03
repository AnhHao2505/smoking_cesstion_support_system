import * as authService from "../services/authService";

// Helper function to get current user
export const getCurrentUser = () => {
  return authService.getCurrentUser();
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return authService.isAuthenticated();
};

// Helper function to get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Helper function to check if user has specific role
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

// Helper function to get auth token
export const getToken = () => {
  return authService.getToken();
};

// Helper function to logout
export const logout = () => {
  return authService.logout();
};

// ✅ Export default object – Đã gán tên rõ ràng
const authUtils = {
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  hasRole,
  getToken,
  logout,
};

export default authUtils;
