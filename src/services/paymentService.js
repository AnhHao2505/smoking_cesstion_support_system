import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create VNPay payment
export const createVNPayPayment = async (amount, language = 'vn') => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT.CREATE_PAYMENT, null, {
      params: { amount, language }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Handle VNPay return callback
export const handleVNPayReturn = async (params) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENT.VNPAY_RETURN, {
      params
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upgrade user to premium (after successful payment)
export const upgradeToPremium = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.UPGRADE_PREMIUM);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};