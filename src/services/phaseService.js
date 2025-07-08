import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get phases of a specific plan - Updated to match new API
export const getPhasesOfPlan = async (quitPlanId) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/from-plan', {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get default phases based on addiction level - Updated to match new API
export const getDefaultPhases = async (addictionLevel) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/default', {
      params: { addictionLevel }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create goals for phases - Updated to match new API
export const createGoalsOfPhases = async (quitPlanId, phases) => {
  try {
    const response = await axiosInstance.post('/api/quit-phases/default/create-goals', phases, {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};