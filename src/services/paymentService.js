import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create VN Pay payment
export const createPayment = async (amount, language = 'vn') => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT.CREATE, null, {
      params: { amount, language }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};