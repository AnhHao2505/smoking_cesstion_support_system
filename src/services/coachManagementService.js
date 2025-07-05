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

// Member cancels their coach
export const cancelCoach = async (coachId) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.COACHES.CANCEL_BY_MEMBER, null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach profile
export const getCoachProfile = async (coachId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.COACH, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update coach profile (admin only)
export const updateCoachProfile = async (coachId, profileData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.PROFILE.COACH, profileData, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach specialties - Mock function since not available in API
export const getCoachSpecialties = async () => {
  console.warn('Coach specialties endpoint not available, using mock data');
  return [
    'Behavioral Psychology',
    'Addiction Counseling',
    'Cognitive Behavioral Therapy',
    'Motivational Interviewing',
    'Mindfulness-Based Interventions',
    'Stress Management',
    'Nicotine Replacement Therapy'
  ];
};

// Alias for updateCoachProfile to match component expectations
export const updateCoach = updateCoachProfile;

// Delete coach - Not available in API, mock function
export const deleteCoach = async (coachId) => {
  console.warn('Delete coach endpoint not available in API specification');
  throw new Error('Delete coach functionality is not yet available - API endpoint missing');
};

// Additional function to help with coach assignment cancellation
export const disableCoachForMember = async (coachId) => {
  try {
    return await cancelCoach(coachId);
  } catch (error) {
    throw handleApiError(error);
  }
};