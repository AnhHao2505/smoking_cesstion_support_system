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

// Get current assignment (member function)
export const getCurrentAssignment = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CURRENT_ASSIGNMENT);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable user (admin function)
export const disableUser = async (userId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.USER.DISABLE, null, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Re-enable user (admin function)
export const reEnableUser = async (userId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.USER.RE_ENABLE, null, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

