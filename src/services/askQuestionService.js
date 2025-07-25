import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Ask a question (member) - Updated to match new API
export const askQuestion = async (question) => {
  try {
    const response = await axiosInstance.post('/api/qna/ask', null, {
      params: { question }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Answer a question (coach) - Updated to match new API
export const answerQuestion = async (qnaId, answer) => {
  try {
    const response = await axiosInstance.post('/api/qna/answer', null, {
      params: { qnaId, answer }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get unanswered questions (coach) - Updated to match new API
export const getUnansweredQna = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/qna/unanswered', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get my questions (member) - Updated to match new API
export const getMyQna = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/qna/mine', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get questions of a member - Using getMyQna as alias
export const getQnaOfMember = getMyQna;

// Get questions by coach - Using getUnansweredQna as alias
export const getQnaByCoach = async (coachId) => {
  throw new Error('Coach-specific QnA endpoint not available, use unanswered questions');
};

// Get all QnA - Using getUnansweredQna as alias (since only unanswered endpoint is available)
export const getAllQna = async () => {
  throw new Error('Admin all QnA endpoint not available, use unanswered questions');
};

// Helper function for backward compatibility
const getAnsweredQuestions = () => {
  throw new Error('getAnsweredQuestions is not available in API');
};

// Helper function for backward compatibility  
const getUnansweredQuestions = getUnansweredQna;