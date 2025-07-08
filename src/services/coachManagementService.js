import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all coaches with pagination - Updated to match new API
export const getAllCoaches = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/coach/all', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new coach (admin only) - Updated to match new API
export const createCoach = async (coachData) => {
  try {
    const response = await axiosInstance.post('/coach/create', coachData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member chooses a coach - Updated to match new API
export const chooseCoach = async (coachId) => {
  try {
    const response = await axiosInstance.post('/coach/choose', null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get assigned members for a coach - Updated to match new API
export const getAssignedMembers = async (coachId) => {
  try {
    const response = await axiosInstance.get('/coach/assigned-members', {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member cancels their coach - Updated to match new API
export const cancelCoach = async (coachId) => {
  try {
    const response = await axiosInstance.put('/coach/member/cancel', null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach profile - Updated to match new API
export const getCoachProfile = async (coachId) => {
  try {
    const response = await axiosInstance.get('/profile/coach', {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update coach profile (admin only) - Updated to match new API
export const updateCoachProfile = async (coachId, profileData) => {
  try {
    const response = await axiosInstance.put('/profile/coach', profileData, {
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