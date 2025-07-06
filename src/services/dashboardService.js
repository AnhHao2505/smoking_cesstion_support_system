import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get dashboard statistics from API
export const getDashboardStatistics = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

