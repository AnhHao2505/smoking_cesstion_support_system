import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create member smoking initial status - Updated to match new API
export const createMemberSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.post('/api/member-smoking-status', statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get latest member smoking status - Updated to match new API
export const getLatestMemberSmokingStatus = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/latest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update latest member smoking status - Updated to match new API
export const updateLatestMemberSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.put('/api/member-smoking-status/latest', statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};