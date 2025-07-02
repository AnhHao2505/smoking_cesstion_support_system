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

// Get all reminders for a user
export const getAllReminders = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reminders/user/${userId}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    // Mock data for development
    return {
      success: true,
      data: [
        {
          id: 1,
          title: 'Daily Check-in',
          description: 'Record your daily progress',
          category: 'HEALTH_BENEFITS',
          frequency: 'daily',
          scheduledTime: '09:00',
          enabled: true,
          createdAt: '2024-06-01'
        },
        {
          id: 2,
          title: 'Motivational Quote',
          description: 'Get inspired with daily quotes',
          category: 'MOTIVATIONAL_QUOTES',
          frequency: 'daily',
          scheduledTime: '19:00',
          enabled: true,
          createdAt: '2024-06-01'
        }
      ]
    };
  }
};

// Toggle reminder on/off
export const toggleReminder = async (reminderId, enabled) => {
  try {
    const response = await axiosInstance.patch(`/reminders/${reminderId}/toggle`, {
      enabled
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error toggling reminder:', error);
    // Mock success for development
    return { success: true };
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.delete(`/reminders/${reminderId}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    // Mock success for development
    return { success: true };
  }
};

// Get reminder settings for a user
export const getReminderSettings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reminders/settings/${userId}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    // Mock data for development
    return {
      success: true,
      data: {
        enabled: true,
        defaultReminderTime: '09:00',
        snoozeMinutes: 5,
        maxSnoozeCount: 3,
        notificationMethods: ['push', 'sound'],
        soundType: 'default',
        vibration: true,
        enableQuietHours: false,
        quietHours: null,
        quietHoursBehavior: 'silent'
      }
    };
  }
};

// Update reminder settings
export const updateReminderSettings = async (userId, settings) => {
  try {
    const response = await axiosInstance.put(`/reminders/settings/${userId}`, settings);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    // Mock success for development
    return { success: true };
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