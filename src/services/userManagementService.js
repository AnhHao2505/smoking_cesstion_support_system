import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all users (admin only) - Updated to match new API
export const getAllUsers = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/user', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable a user (admin only) - New API endpoint
export const disableUser = async (userId) => {
  try {
    const response = await axiosInstance.patch('/user/disable', null, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get current member's coach assignment
export const getCurrentAssignment = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CURRENT_ASSIGNMENT);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
