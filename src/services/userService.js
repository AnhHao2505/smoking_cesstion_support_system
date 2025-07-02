import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_PROFILE);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upload user avatar
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get user by ID (admin function)
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all users (admin function)
export const getAllUsers = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user (admin function)
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE(userId), userData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete user (admin function)
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(userId));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create user (admin function)
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, userData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upgrade to premium (member function)
export const upgradeToPremium = async () => {
  try {
    const response = await axiosInstance.post('/users/upgrade-premium');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
