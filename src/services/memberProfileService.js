import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get current user's profile
export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.ME);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get member profile by ID
export const getMemberProfile = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.MEMBER, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update member profile (member only) - Updated to use correct function name
export const updateMemberProfile = async (name) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.PROFILE.ME, null, {
      params: { name }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach profile by ID
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

// Legacy functions for backward compatibility
export const updateMyProfile = updateMemberProfile;