import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get dashboard statistics from API - Updated to match new API
export const getDashboardStatistics = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

