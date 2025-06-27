import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get member profile details - Updated to match new API response
export const getMemberProfile = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_PROFILE(memberId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    // Return mock data for development - Updated structure to match API
    return {
      id: memberId,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com", 
      contactNumber: "0901234567",
      planName: "Premium Quit Plan",
      membershipExpiryDate: "2026-03-15",
      premiumMembership: true
    };
  }
};

export const updateMemberProfile = async (userId, profileData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.MEMBERS.UPDATE_PROFILE(userId), profileData);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error updating member profile:', error);
    return handleApiError(error);
  }
};

// Legacy function for backward compatibility - remove after full migration
export const getMemberDetails = (memberId) => {
  console.warn('getMemberDetails is deprecated, use getMemberProfile instead');
  return getMemberProfile(memberId);
};