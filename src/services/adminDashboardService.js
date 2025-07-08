import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get system overview stats from API
export const getSystemOverview = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

