import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Submit feedback for coach
export const submitFeedback = async (coachId, content, star) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.FEEDBACKS.CREATE, null, {
      params: { coachId, content, star }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get published feedbacks
export const getPublishedFeedbacks = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.PUBLISHED);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get feedbacks for a coach
export const getFeedbacksForCoach = async (coachId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.COACH, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all feedbacks (admin)
export const getAllFeedbacks = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.ADMIN_ALL);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark feedback as reviewed
export const markFeedbackReviewed = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.FEEDBACKS.REVIEWED, null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Hide feedback
export const hideFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.FEEDBACKS.HIDE, null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Approve and publish feedback (admin)
export const publishFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.FEEDBACKS.APPROVE_PUBLISH, null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};