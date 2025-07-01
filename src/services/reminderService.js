import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create a new reminder
export const createReminder = async (content, category) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.REMINDERS.CREATE, null, {
      params: { content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an existing reminder
export const updateReminder = async (reminderId, content, category) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.REMINDERS.UPDATE, null, {
      params: { reminderId, content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable a reminder
export const disableReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.REMINDERS.DISABLE, null, {
      params: { reminderId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Reminder categories enum
export const REMINDER_CATEGORIES = {
  HEALTH_BENEFITS: 'HEALTH_BENEFITS',
  MOTIVATIONAL_QUOTES: 'MOTIVATIONAL_QUOTES',
  TIPS_AND_TRICKS: 'TIPS_AND_TRICKS',
  MILESTONE_CELEBRATIONS: 'MILESTONE_CELEBRATIONS',
  SMOKING_FACTS: 'SMOKING_FACTS'
};