import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create VNPay payment - Updated to match new API
export const createVNPayPayment = async (amount, language = 'vn') => {
  try {
    const response = await axiosInstance.post('/vn-pay/create-payment', null, {
      params: { amount, language }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Handle VNPay return callback - Updated to match new API
export const handleVNPayReturn = async (params) => {
  try {
    const response = await axiosInstance.get('/vn-pay/return', {
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