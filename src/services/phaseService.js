import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get phases of a specific plan
export const getPhasesOfPlan = async (quitPlanId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PHASES.FROM_PLAN, {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get default phases based on addiction level
export const getDefaultPhases = async (addictionLevel) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PHASES.DEFAULT, {
      params: { addictionLevel }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create goals for phases
export const createGoalsOfPhases = async (quitPlanId, phases) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.QUIT_PHASES.CREATE_GOALS, phases, {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};