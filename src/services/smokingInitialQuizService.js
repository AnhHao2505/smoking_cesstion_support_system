import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

/**
 * Smoking Initial Quiz Service - Độc lập cho trang smoking-initial-quiz
 * Chỉ xử lý đánh giá ban đầu về mức độ nghiện thuốc và thống kê cơ bản
 */

// Tạo hoặc cập nhật đánh giá nghiện thuốc
export const submitAddictionAssessment = async (assessmentData) => {
  try {
    const response = await axiosInstance.post('/api/member-smoking-status', assessmentData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Cập nhật đánh giá nghiện thuốc mới nhất
export const updateAddictionAssessment = async (assessmentData) => {
  try {
    const response = await axiosInstance.put('/api/member-smoking-status/latest', assessmentData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy đánh giá nghiện thuốc mới nhất (chỉ cho smoking initial quiz)
export const getLatestAssessment = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/latest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy thống kê cơ bản cho smoking initial quiz (độc lập)
export const getBasicProgress = async (memberId) => {
  try {
    // Chỉ lấy thông tin cơ bản cần thiết cho quiz ban đầu
    const response = await axiosInstance.get('/api/quit-plans/newest', {
      params: { memberId }
    });
    
    const quitPlan = handleApiResponse(response);
    
    if (!quitPlan) {
      return {
        days_smoke_free: 0,
        current_phase: { phase_name: 'Chuẩn bị' },
        progress: 0
      };
    }

    // Tính toán độc lập cho smoking initial quiz
    const startDate = new Date(quitPlan.startDate);
    const today = new Date();
    const daysDiff = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    
    const endDate = new Date(quitPlan.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(Math.max((daysDiff / totalDays) * 100, 0), 100);

    return {
      days_smoke_free: quitPlan.quitPlanStatus === 'IN_PROGRESS' ? daysDiff : 0,
      current_phase: {
        phase_name: getPhaseByProgress(progressPercent)
      },
      progress: Math.round(progressPercent)
    };
  } catch (error) {
    console.error('Error getting basic progress:', error);
    // Trả về giá trị mặc định nếu có lỗi
    return {
      days_smoke_free: 0,
      current_phase: { phase_name: 'Chuẩn bị' },
      progress: 0
    };
  }
};

// Hàm hỗ trợ xác định giai đoạn dựa trên tiến độ
const getPhaseByProgress = (progress) => {
  if (progress < 10) return 'Chuẩn bị';
  if (progress < 40) return 'Bắt đầu';
  if (progress < 80) return 'Hành động';
  return 'Duy trì';
};

// Tính toán điểm nghiện từ form data
export const calculateAddictionScore = (formData) => {
  const scores = [
    formData.startSmokingAge || 0,
    formData.dailySmoking || 0,
    formData.yearsSmoking || 0,
    formData.withdrawalSymptoms || 0,
    formData.stressSmoking || 0,
    formData.addictionFeeling || 0,
    formData.smokingTime || 0,
    formData.healthProblems || 0,
    formData.previousAttempts || 0,
    formData.desireToQuit || 0
  ];
  
  return scores.reduce((sum, score) => sum + score, 0);
};

// Xác định mức độ nghiện từ điểm số
export const getAddictionLevel = (totalPoints) => {
  if (totalPoints <= 7) return 'Không nghiện';
  if (totalPoints <= 15) return 'Nghiện nhẹ';
  if (totalPoints <= 25) return 'Nghiện trung bình';
  return 'Nghiện nặng';
};

// Kiểm tra xem có nên hiển thị congratulations không
export const shouldShowCongratulations = (formData, totalPoints) => {
  return formData.desireToQuit === 1 || totalPoints <= 15;
};
