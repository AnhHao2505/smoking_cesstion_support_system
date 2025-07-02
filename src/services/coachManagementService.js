import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all coaches with pagination
export const getAllCoaches = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.COACHES.GET_ALL, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new coach (admin only)
export const createCoach = async (coachData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.COACHES.CREATE, coachData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member chooses a coach
export const chooseCoach = async (coachId) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.COACHES.CHOOSE, null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get assigned members for a coach
export const getAssignedMembers = async (coachId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.COACHES.ASSIGNED_MEMBERS, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member disables their coach
export const disableCoachForMember = async (coachId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.COACHES.DISABLE_BY_MEMBER, null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Admin disables a coach
export const disableCoachByAdmin = async (coachId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.COACHES.DISABLE_BY_ADMIN, coachId);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach specialties
export const getCoachSpecialties = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.COACHES.SPECIALTIES);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update coach information (admin only)
export const updateCoach = async (coachId, coachData) => {
  try {
    const response = await axiosInstance.put(`${API_ENDPOINTS.COACHES.UPDATE}/${coachId}`, coachData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete coach (admin only)
export const deleteCoach = async (coachId) => {
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.COACHES.DELETE}/${coachId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};