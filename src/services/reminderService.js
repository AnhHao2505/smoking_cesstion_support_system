import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create a new reminder - Updated to match new API
export const createReminder = async (content, category) => {
  try {
    const response = await axiosInstance.post('/api/reminders', null, {
      params: { content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an existing reminder - Updated to match new API
export const updateReminder = async (reminderId, content, category) => {
  try {
    const response = await axiosInstance.put('/api/reminders/update', null, {
      params: { reminderId, content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable a reminder - Updated to match new API
export const disableReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.patch('/api/reminders/disable', null, {
      params: { reminderId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all reminders with pagination - Updated to match new API
export const getAllReminders = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/reminders', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.warn('Get all reminders endpoint failed, using mock data');
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

// Toggle reminder on/off - NOT AVAILABLE IN API
export const toggleReminder = async (reminderId, enabled) => {
  try {
    // Note: This endpoint doesn't exist in the API specification
    // Use disable endpoint instead
    console.warn('Toggle reminder endpoint not available, using disable endpoint');
    if (!enabled) {
      return await disableReminder(reminderId);
    } else {
      console.warn('Enable reminder functionality not available in API');
      return { success: false, message: 'Enable reminder not supported by API' };
    }
  } catch (error) {
    console.error('Error toggling reminder:', error);
    return { success: false };
  }
};

// Delete a reminder - NOT AVAILABLE IN API
export const deleteReminder = async (reminderId) => {
  try {
    // Note: Delete endpoint doesn't exist, use disable instead
    console.warn('Delete reminder endpoint not available, using disable endpoint');
    return await disableReminder(reminderId);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return { success: false };
  }
};

// Get reminder settings for a user - NOT AVAILABLE IN API
export const getReminderSettings = async (userId) => {
  try {
    // Note: This endpoint doesn't exist in the API specification
    console.warn('Reminder settings endpoint not available, using mock data');
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
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    return { success: false };
  }
};

// Update reminder settings - NOT AVAILABLE IN API
export const updateReminderSettings = async (userId, settings) => {
  try {
    // Note: This endpoint doesn't exist in the API specification
    console.warn('Update reminder settings endpoint not available');
    return { success: false, message: 'Update reminder settings not supported by API' };
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    return { success: false };
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