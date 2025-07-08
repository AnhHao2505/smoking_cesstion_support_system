import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all notifications with pagination - Updated to match new API
export const getAllNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/all', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get unread notifications with pagination - Updated to match new API
export const getUnreadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/unread', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get read notifications with pagination - Updated to match new API
export const getReadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/read', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get important notifications with pagination - Updated to match new API
export const getImportantNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/important', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark notification as read - Updated to match new API
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch('/api/notifications/mark-read', null, {
      params: { notificationId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};