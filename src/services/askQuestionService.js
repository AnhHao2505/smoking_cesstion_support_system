import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Ask a question
export const askQuestion = async (question) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.QNA.ASK, null, {
      params: { question }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Answer a question
export const answerQuestion = async (qnaId, answer) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.QNA.ANSWER, null, {
      params: { qnaId, answer }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all QnA (admin)
export const getAllQna = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.ALL);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get QnA of member
export const getQnaOfMember = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.ALL_MEMBER, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get QnA by coach
export const getQnaByCoach = async (coachId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.ALL_COACH, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};