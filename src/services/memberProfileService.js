import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get current user's profile - Updated to match new API
export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get('/profile/me');
    // Store user profile in localStorage
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get member profile by ID - Updated to match new API
export const getMemberProfile = async (memberId) => {
  try {
    const response = await axiosInstance.get('/profile/member', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update member profile (member only) - Updated to match new API
export const updateMemberProfile = async (name) => {
  try {
    const response = await axiosInstance.patch('/profile/me', null, {
      params: { name }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get coach profile by ID - Updated to match new API
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

// Legacy functions for backward compatibility
export const updateMyProfile = updateMemberProfile;