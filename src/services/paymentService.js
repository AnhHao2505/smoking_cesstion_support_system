import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create VNPay payment - Updated to match new API
export const createVNPayPayment = async (amount, language = 'vn') => {
  try {
    // Validate input
    const validAmount = Math.floor(Number(amount));
    if (!validAmount || validAmount <= 0) {
      throw new Error('Số tiền không hợp lệ');
    }

    console.log('Creating VNPay payment:', { amount: validAmount, language });

    const response = await axiosInstance.post('/vn-pay/create-payment', null, {
      params: { 
        amount: validAmount, 
        language,
        // Add return URL for proper callback handling
        returnUrl: `${window.location.origin}/payment/callback`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('VNPay payment created successfully:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('VNPay payment creation failed:', error);
    
    // Handle specific timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Kết nối tới VNPay bị timeout. Vui lòng thử lại.');
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
    }
    
    // Handle API errors
    if (error.response?.status === 400) {
      throw new Error('Thông tin thanh toán không hợp lệ.');
    } else if (error.response?.status === 500) {
      throw new Error('Lỗi server. Vui lòng thử lại sau.');
    }
    
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

// Get user transaction history with pagination
export const getMyTransactions = async (page = 1, size = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENT.MY_TRANSACTIONS, {
      params: { 
        pageNo: page - 1, // Convert to 0-based indexing for backend
        pageSize: size 
      }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};