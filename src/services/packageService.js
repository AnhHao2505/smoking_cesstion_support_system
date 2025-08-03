import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Lấy tất cả các gói
const getAll = async () => {
  try {
    const res = await axiosInstance.get('/view-feature-packages');
    const data = handleApiResponse(res);
    // Đảm bảo luôn trả về mảng cho FE, tránh lỗi .some is not a function
    return { data: Array.isArray(data) ? data : (data ? [data] : []) };
  } catch (e) {
    throw handleApiError(e);
  }
};

// Tạo mới gói
const create = async (data) => {
  try {
    const res = await axiosInstance.post('/package', data);
    return handleApiResponse(res);
  } catch (e) {
    throw handleApiError(e);
  }
};

// Sửa gói
const edit = async (id, data) => {
  try {
    const res = await axiosInstance.put(`/package/${id}`, data);
    return handleApiResponse(res);
  } catch (e) {
    throw handleApiError(e);
  }
};

// Vô hiệu hóa gói
const disable = async (id) => {
  try {
    const res = await axiosInstance.delete(`/package/${id}`);
    return handleApiResponse(res);
  } catch (e) {
    throw handleApiError(e);
  }
};

// Kích hoạt lại gói
const reEnable = async (id) => {
  try {
    const res = await axiosInstance.patch(`/re-enable/package/${id}`);
    return handleApiResponse(res);
  } catch (e) {
    throw handleApiError(e);
  }
};

export default {
  getAll,
  create,
  edit,
  disable,
  reEnable
};
