import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

/**
 * Daily Record Service - Độc lập cho trang daily-record
 * Chỉ xử lý ghi chép hàng ngày và thống kê liên quan
 */

// Tạo ghi chép hàng ngày
export const createDailyRecord = async (recordData) => {
  try {
    const response = await axiosInstance.post('/api/daily-logs', recordData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Cập nhật ghi chép hàng ngày
export const updateDailyRecord = async (recordId, recordData) => {
  try {
    const response = await axiosInstance.put(`/api/daily-logs/${recordId}`, recordData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy ghi chép theo ngày
export const getDailyRecordByDate = async (memberId, date) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member/date', {
      params: { memberId, date }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy danh sách ghi chép gần đây (độc lập cho daily-record)
export const getRecentDailyRecords = async (memberId, limit = 7) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member', {
      params: { limit }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy thống kê cho daily record (độc lập)
export const getDailyRecordStatistics = async (memberId, days = 7) => {
  try {
    const records = await getRecentDailyRecords(memberId, days);
    
    if (!records || records.length === 0) {
      return getDefaultStatistics();
    }

    return calculateRecordStatistics(records);
  } catch (error) {
    console.error('Error getting daily record statistics:', error);
    return getDefaultStatistics();
  }
};

// Tính toán thống kê từ ghi chép
const calculateRecordStatistics = (records) => {
  const totalRecords = records.length;
  
  if (totalRecords === 0) {
    return getDefaultStatistics();
  }

  // Tính toán các thống kê
  const totalCigarettes = records.reduce((sum, record) => sum + (record.cigarettesConsumed || 0), 0);
  const avgCigarettesPerDay = Math.round((totalCigarettes / totalRecords) * 10) / 10;
  
  const smokeFreeRecords = records.filter(record => (record.cigarettesConsumed || 0) === 0);
  const smokeFreeRate = Math.round((smokeFreeRecords.length / totalRecords) * 100);
  
  // Tính mức độ thèm thuốc trung bình
  const cravingLevels = records.map(record => {
    const morning = getCravingValue(record.morningCravingLevel) || 1;
    const evening = getCravingValue(record.eveningCravingLevel) || 1;
    return (morning + evening) / 2;
  });
  
  const avgCravingLevel = cravingLevels.reduce((sum, level) => sum + level, 0) / cravingLevels.length;
  
  // Xu hướng cải thiện
  const recentRecords = records.slice(0, 3);
  const olderRecords = records.slice(-3);
  
  const recentAvgCigarettes = recentRecords.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / recentRecords.length;
  const olderAvgCigarettes = olderRecords.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / olderRecords.length;
  
  const improvement = olderAvgCigarettes > recentAvgCigarettes;
  
  return {
    totalRecords,
    avgCigarettesPerDay,
    smokeFreeRate,
    avgCravingLevel: Math.round(avgCravingLevel * 10) / 10,
    improvement,
    smokeFreeStreak: calculateSmokeFreeStreak(records),
    weeklyTrend: calculateWeeklyTrend(records)
  };
};

// Tính streak không hút thuốc
const calculateSmokeFreeStreak = (records) => {
  let streak = 0;
  for (const record of records) {
    if ((record.cigarettesConsumed || 0) === 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Tính xu hướng tuần
const calculateWeeklyTrend = (records) => {
  if (records.length < 7) return 'Insufficient data';
  
  const firstHalf = records.slice(0, Math.floor(records.length / 2));
  const secondHalf = records.slice(Math.floor(records.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / secondHalf.length;
  
  if (firstHalfAvg > secondHalfAvg) return 'Improving';
  if (firstHalfAvg < secondHalfAvg) return 'Declining';
  return 'Stable';
};

// Chuyển đổi mức độ thèm thuốc từ text sang số
const getCravingValue = (level) => {
  const cravingMap = {
    'rất thấp': 1,
    'thấp': 2,
    'trung bình': 3,
    'cao': 4,
    'rất cao': 5
  };
  return cravingMap[level?.toLowerCase()] || 1;
};

// Thống kê mặc định
const getDefaultStatistics = () => ({
  totalRecords: 0,
  avgCigarettesPerDay: 0,
  smokeFreeRate: 0,
  avgCravingLevel: 0,
  improvement: false,
  smokeFreeStreak: 0,
  weeklyTrend: 'No data'
});

// Lấy thông tin giai đoạn hiện tại cho daily record
export const getCurrentPhaseForRecord = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/quit-plans/newest', {
      params: { memberId }
    });
    
    const quitPlan = handleApiResponse(response);
    
    if (!quitPlan) {
      return {
        phaseId: null,
        phaseName: 'Chưa có kế hoạch',
        phaseOrder: 0
      };
    }

    // Xác định giai đoạn dựa trên ngày hiện tại
    const today = new Date();
    const startDate = new Date(quitPlan.startDate);
    const endDate = new Date(quitPlan.endDate);
    
    if (today < startDate) {
      return {
        phaseId: 1,
        phaseName: 'Chuẩn bị',
        phaseOrder: 1
      };
    }
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const progress = (daysPassed / totalDays) * 100;
    
    if (progress < 25) {
      return {
        phaseId: 2,
        phaseName: 'Bắt đầu',
        phaseOrder: 2
      };
    } else if (progress < 75) {
      return {
        phaseId: 3,
        phaseName: 'Hành động',
        phaseOrder: 3
      };
    } else {
      return {
        phaseId: 4,
        phaseName: 'Duy trì',
        phaseOrder: 4
      };
    }
  } catch (error) {
    console.error('Error getting current phase:', error);
    return {
      phaseId: null,
      phaseName: 'Không xác định',
      phaseOrder: 0
    };
  }
};

// Validate dữ liệu daily record
export const validateDailyRecord = (recordData) => {
  const errors = {};
  
  if (!recordData.date) {
    errors.date = 'Ngày ghi chép là bắt buộc';
  }
  
  if (recordData.cigarettesConsumed < 0) {
    errors.cigarettesConsumed = 'Số điếu thuốc không thể âm';
  }
  
  if (!recordData.morningCravingLevel) {
    errors.morningCravingLevel = 'Mức độ thèm thuốc buổi sáng là bắt buộc';
  }
  
  if (!recordData.eveningCravingLevel) {
    errors.eveningCravingLevel = 'Mức độ thèm thuốc buổi tối là bắt buộc';
  }
  
  if (!recordData.noonEmotion) {
    errors.noonEmotion = 'Cảm xúc buổi trưa là bắt buộc';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
