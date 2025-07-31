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

// Get latest member smoking status for coach - Updated to match new API
export const getLatestMemberSmokingStatus = async (memberId) => {
  try {
    // Sử dụng endpoint dành cho coach xem member khác
    const response = await axiosInstance.get('/api/member-smoking-status/coach/view-latest/to-create-plan', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get my latest smoking status (for member view) - Updated to match new API
export const getMyLatestSmokingStatus = async () => {
  try {
    // Endpoint dành cho member tự xem (không cần memberId param)
    const response = await axiosInstance.get('/api/member-smoking-status/latest');
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