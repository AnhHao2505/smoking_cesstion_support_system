import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all users (admin function) - Using the correct API endpoint
export const getAllUsers = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.ALL, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all members (admin function) - Using the correct API endpoint
export const getAllMembers = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.MEMBERS, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get current assignment (member function)
export const getCurrentAssignment = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CURRENT_ASSIGNMENT);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upgrade to premium (member function)
export const upgradeToPremium = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.UPGRADE_PREMIUM);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable user (admin function)
export const disableUser = async (userId) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.DISABLE, { userId });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Note: The following functions are not available in the current API specification
// They have been removed to match the actual available endpoints:
// - getUserProfile, updateUserProfile, uploadAvatar
// - getUserById, updateUser, deleteUser, createUser
// 
// These operations should be handled through the Profile endpoints instead:
