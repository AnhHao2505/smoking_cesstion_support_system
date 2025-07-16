import axiosInstance from "../utils/axiosConfig";
import {
  API_ENDPOINTS,
  handleApiResponse,
  handleApiError,
} from "../utils/apiEndpoints";

// Submit feedback for coach - Updated to match new API
export const submitFeedbackToCoach = async (feedbackData) => {
  try {
    const response = await axiosInstance.post(
      "/api/feedbacks/submit/my-coach",
      feedbackData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Submit feedback for any coach - Using correct API with coachId as query param
export const submitFeedbackToAnyCoach = async (feedbackData) => {
  try {
    const { coachId, ...requestBody } = feedbackData;
    const response = await axiosInstance.post(
      "/api/feedbacks/submit/my-coach",
      requestBody,
      {
        params: { coachId },
      }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Submit feedback for platform - New API endpoint
export const submitFeedbackToPlatform = async (feedbackData) => {
  try {
    const response = await axiosInstance.post(
      "/api/feedbacks/submit/platform",
      feedbackData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Legacy function for backward compatibility
export const submitFeedback = submitFeedbackToCoach;

// Get published feedbacks - Updated to match new API
export const getPublishedFeedbacks = async () => {
  try {
    const response = await axiosInstance.get("/api/feedbacks/published");
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get feedbacks for a coach - Updated to match new API
export const getFeedbacksForCoach = async (coachId) => {
  try {
    const response = await axiosInstance.get("/api/feedbacks/of-a-coach", {
      params: { coachId },
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all unreviewed feedbacks (admin only) - Updated to match new API
export const getAllFeedbacks = async () => {
  try {
    const response = await axiosInstance.get("/api/feedbacks/all/unreviewed");
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all unreviewed feedbacks (admin only) - Updated to match new API
export const getUnreviewedFeedbacks = async () => {
  try {
    const response = await axiosInstance.get("/api/feedbacks/all/unreviewed");
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Approve feedback for publishing (admin only) - Updated to match new API
export const approveFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(
      "/api/feedbacks/approve-publish",
      null,
      {
        params: { feedbackId },
      }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Hide feedback (admin only) - Updated to match new API
export const hideFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch("/api/feedbacks/hide", null, {
      params: { feedbackId },
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Mark feedback as reviewed (admin only) - Updated to match new API
export const markFeedbackReviewed = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(
      "/api/feedbacks/reviewed",
      null,
      {
        params: { feedbackId },
      }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Alias for backward compatibility
export const publishFeedback = approveFeedback;
