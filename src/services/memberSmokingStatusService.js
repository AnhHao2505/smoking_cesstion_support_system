import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create member smoking initial status
export const createMemberSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.MEMBER_SMOKING_STATUS.CREATE, statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get latest member smoking status
export const getLatestMemberSmokingStatus = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBER_SMOKING_STATUS.LATEST, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update latest member smoking status
export const updateLatestMemberSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.MEMBER_SMOKING_STATUS.LATEST, statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};