import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all users (admin only)
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

// Get all members (admin only)
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

// Get current member's coach assignment
export const getCurrentAssignment = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CURRENT_ASSIGNMENT);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upgrade current user to premium
export const upgradeToPremium = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.UPGRADE_PREMIUM);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};