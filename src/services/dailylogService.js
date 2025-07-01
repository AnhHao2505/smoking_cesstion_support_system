import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create a daily log
export const createDailyLog = async (logData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.DAILY_LOGS.CREATE, logData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get daily logs by phase
export const getLogsByPhase = async (phaseId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DAILY_LOGS.BY_PHASE, {
      params: { phaseId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all daily logs of a member
export const getMemberDailyLogs = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DAILY_LOGS.MEMBER, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get member's daily log by date
export const getMemberDailyLogByDate = async (memberId, date) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DAILY_LOGS.MEMBER_BY_DATE, {
      params: { memberId, date }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};