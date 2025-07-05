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
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.UNANSWERED);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get QnA of member
export const getQnaOfMember = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.MINE);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get QnA by coach
export const getQnaByCoach = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QNA.UNANSWERED);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};