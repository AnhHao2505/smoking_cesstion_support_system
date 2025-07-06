import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get member profile data - Updated to use new API endpoint
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

// Get quit plan data
export const getQuitPlanData = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.NEWEST, {
      params: { memberId: userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
// Get daily state records
export const getDailyStateRecords = async (userId, limit = 7) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DAILY_LOGS.GET_BY_MEMBER, {
      params: { memberId: userId, limit }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get earned badges
export const getEarnedBadges = async (userId) => {
  try {
    throw new Error('MEMBERS.GET_BADGES endpoint is not available in API specification');
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get health improvements
export const getHealthImprovements = async (userId) => {
  try {
    throw new Error('MEMBERS.GET_HEALTH_IMPROVEMENTS endpoint is not available in API specification');
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get upcoming reminders
export const getUpcomingReminders = async (userId) => {
  try {
    throw new Error('MEMBERS.GET_REMINDERS endpoint is not available in API specification');
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get recent questions and answers
export const getRecentQuestionsAnswers = async (userId) => {
  try {
    // Note: This endpoint doesn't exist in the API specification
    // Using QNA endpoints instead
    throw new Error('MEMBERS.GET_QUESTIONS_ANSWERS endpoint not available, use QNA endpoints instead');
  } catch (error) {
    throw handleApiError(error);
  }
};