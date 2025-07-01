import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get all notifications with pagination
export const getAllNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.ALL, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get unread notifications with pagination
export const getUnreadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get read notifications with pagination
export const getReadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.READ, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get important notifications with pagination
export const getImportantNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.IMPORTANT, {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, null, {
      params: { notificationId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};