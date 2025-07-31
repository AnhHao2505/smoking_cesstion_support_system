import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

/**
 * Smoking Status Service - Độc lập cho trang smoking-status
 * Chỉ xử lý hiển thị trạng thái nghiện thuốc và lịch sử đánh giá
 */

// Lấy trạng thái nghiện hiện tại (cho smoking-status display)
export const getCurrentSmokingStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/latest');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Lấy lịch sử tất cả đánh giá nghiện thuốc (mock data vì backend chưa có API)
export const getSmokingStatusHistory = async (limit = 10) => {
  try {
    // Vì backend chưa có API history, sử dụng current status để tạo mock history
    const currentStatus = await getCurrentSmokingStatus();
    if (currentStatus) {
      return [
        {
          id: 1,
          createAt: new Date().toISOString(),
          point: getScoreFromAddictionLevel(currentStatus.addiction),
          dailySmoking: currentStatus.dailySmoking || 0
        }
      ];
    }
    return [];
  } catch (error) {
    console.error('Error getting smoking status history:', error);
    return [];
  }
};

// Convert AddictionLevel enum to score (for history data)
const getScoreFromAddictionLevel = (addictionLevel) => {
  switch (addictionLevel) {
    case 'NONE': return 5;
    case 'LIGHT': return 10;
    case 'MEDIUM': return 20;
    case 'SEVERE': return 30;
    default: return 0;
  }
};

// Lấy xu hướng thay đổi mức độ nghiện
export const getAddictionTrend = async (days = 30) => {
  try {
    const history = await getSmokingStatusHistory(10);
    
    if (!history || history.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        message: 'Chưa đủ dữ liệu để phân tích xu hướng'
      };
    }

    return calculateAddictionTrend(history);
  } catch (error) {
    console.error('Error getting addiction trend:', error);
    return {
      trend: 'unknown',
      change: 0,
      message: 'Không thể tính toán xu hướng'
    };
  }
};

// Tính toán xu hướng từ lịch sử
const calculateAddictionTrend = (history) => {
  // Sắp xếp theo ngày tạo (mới nhất trước)
  const sortedHistory = [...history].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
  
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];
  
  const latestScore = latest.point || 0;
  const previousScore = previous.point || 0;
  
  const change = latestScore - previousScore;
  const changePercent = previousScore > 0 ? Math.round((change / previousScore) * 100) : 0;
  
  let trend = 'stable';
  let message = '';
  
  if (change > 2) {
    trend = 'worsening';
    message = `Mức độ nghiện tăng ${changePercent}% so với lần đánh giá trước`;
  } else if (change < -2) {
    trend = 'improving';
    message = `Mức độ nghiện giảm ${Math.abs(changePercent)}% so với lần đánh giá trước`;
  } else {
    trend = 'stable';
    message = 'Mức độ nghiện ổn định so với lần đánh giá trước';
  }
  
  return {
    trend,
    change: changePercent,
    message,
    latestScore,
    previousScore
  };
};

// Lấy thống kê tổng quan cho smoking-status (độc lập)
export const getSmokingStatusStatistics = async (memberId) => {
  try {
    const [currentStatus, history] = await Promise.all([
      getCurrentSmokingStatus(memberId),
      getSmokingStatusHistory(memberId, 20)
    ]);

    if (!currentStatus) {
      return getDefaultStatusStatistics();
    }

    return calculateStatusStatistics(currentStatus, history);
  } catch (error) {
    console.error('Error getting smoking status statistics:', error);
    return getDefaultStatusStatistics();
  }
};

// Tính toán thống kê trạng thái
const calculateStatusStatistics = (currentStatus, history) => {
  const totalAssessments = history.length;
  const addictionLevels = history.map(h => getAddictionLevelFromScore(h.point || 0));
  
  // Đếm số lần mỗi mức độ nghiện
  const levelCounts = addictionLevels.reduce((counts, level) => {
    counts[level] = (counts[level] || 0) + 1;
    return counts;
  }, {});
  
  // Tính số ngày từ đánh giá đầu tiên
  const firstAssessment = history[history.length - 1];
  const daysSinceFirst = firstAssessment ? 
    Math.ceil((new Date() - new Date(firstAssessment.createAt)) / (1000 * 60 * 60 * 24)) : 0;
  
  // Tính tần suất đánh giá
  const assessmentFrequency = totalAssessments > 1 ? 
    Math.round(daysSinceFirst / totalAssessments) : 0;
  
  return {
    currentLevel: getAddictionLevelFromScore(currentStatus.point || 0),
    currentScore: currentStatus.point || 0,
    totalAssessments,
    daysSinceFirst,
    assessmentFrequency,
    levelDistribution: levelCounts,
    averageScore: history.length > 0 ? 
      Math.round(history.reduce((sum, h) => sum + (h.point || 0), 0) / history.length) : 0,
    lastAssessmentDate: currentStatus.createAt
  };
};

// Chuyển đổi điểm sang mức độ nghiện
const getAddictionLevelFromScore = (score) => {
  if (score <= 7) return 'Không nghiện';
  if (score <= 15) return 'Nghiện nhẹ';
  if (score <= 25) return 'Nghiện trung bình';
  return 'Nghiện nặng';
};

// Thống kê mặc định
const getDefaultStatusStatistics = () => ({
  currentLevel: 'Chưa đánh giá',
  currentScore: 0,
  totalAssessments: 0,
  daysSinceFirst: 0,
  assessmentFrequency: 0,
  levelDistribution: {},
  averageScore: 0,
  lastAssessmentDate: null
});

// Lấy gợi ý dựa trên trạng thái hiện tại
export const getStatusRecommendations = (statusData) => {
  if (!statusData) {
    return [
      'Hãy thực hiện đánh giá mức độ nghiện thuốc để nhận được gợi ý phù hợp',
      'Tìm hiểu về các phương pháp cai thuốc hiệu quả',
      'Tham khảo ý kiến bác sĩ chuyên khoa'
    ];
  }

  const score = statusData.point || 0;
  const level = getAddictionLevelFromScore(score);
  
  const recommendations = {
    'Không nghiện': [
      'Chúc mừng! Hãy duy trì lối sống không thuốc lá',
      'Tránh xa các yếu tố kích thích hút thuốc',
      'Chia sẻ kinh nghiệm tích cực với người khác'
    ],
    'Nghiện nhẹ': [
      'Bắt đầu giảm dần số lượng thuốc lá mỗi ngày',
      'Tập thở sâu khi có cơn thèm thuốc',
      'Tìm hoạt động thay thế tích cực',
      'Cân nhắc sử dụng kẹo cao su không đường'
    ],
    'Nghiện trung bình': [
      'Xây dựng kế hoạch cai thuốc có hệ thống',
      'Tham khảo ý kiến bác sĩ về thuốc hỗ trợ cai thuốc',
      'Tránh các tình huống kích thích hút thuốc',
      'Tham gia nhóm hỗ trợ cai thuốc',
      'Tăng cường hoạt động thể chất'
    ],
    'Nghiện nặng': [
      'Cần sự hỗ trợ chuyên nghiệp từ bác sĩ',
      'Cân nhậc sử dụng liệu pháp thay thế nicotine',
      'Tham gia chương trình cai thuốc có giám sát',
      'Xây dựng mạng lưới hỗ trợ gia đình và bạn bè',
      'Tập trung vào động lực cai thuốc mạnh mẽ',
      'Chuẩn bị tâm lý cho quá trình cai thuốc dài hạn'
    ]
  };
  
  return recommendations[level] || recommendations['Nghiện nhẹ'];
};

// Mock data cho lịch sử đánh giá (tạm thời)
const getMockStatusHistory = () => [
  {
    id: 1,
    point: 18,
    addiction: 'MEDIUM',
    createAt: '2024-12-01T10:00:00Z',
    dailySmoking: 15,
    reasonToQuit: 'Vì sức khỏe gia đình',
    goal: 'Cai thuốc hoàn toàn trong 6 tháng'
  },
  {
    id: 2,
    point: 22,
    addiction: 'MEDIUM',
    createAt: '2024-11-15T10:00:00Z',
    dailySmoking: 18,
    reasonToQuit: 'Vì sức khỏe',
    goal: 'Giảm xuống 10 điếu/ngày'
  },
  {
    id: 3,
    point: 25,
    addiction: 'SEVERE',
    createAt: '2024-11-01T10:00:00Z',
    dailySmoking: 20,
    reasonToQuit: 'Tiết kiệm tiền',
    goal: 'Cai thuốc dần dần'
  }
];

// Format dữ liệu cho hiển thị
export const formatStatusForDisplay = (statusData) => {
  if (!statusData) return null;
  
  // Convert addiction enum to score and level
  const score = getScoreFromAddictionLevel(statusData.addiction);
  const level = getAddictionLevelFromEnum(statusData.addiction);
  
  return {
    level: level,
    score: score,
    dailySmoking: statusData.dailySmoking || 0,
    reasonToQuit: statusData.reasonToQuit || '',
    goal: statusData.goal || '',
    assessmentDate: statusData.createAt ? new Date(statusData.createAt).toLocaleDateString('vi-VN') : '',
    color: getAddictionLevelColor(score)
  };
};

// Convert AddictionLevel enum to Vietnamese text
const getAddictionLevelFromEnum = (addictionLevel) => {
  switch (addictionLevel) {
    case 'NONE': return 'Không nghiện';
    case 'LIGHT': return 'Nghiện nhẹ';
    case 'MEDIUM': return 'Nghiện trung bình';
    case 'SEVERE': return 'Nghiện nặng';
    default: return 'Chưa xác định';
  }
};

// Lấy màu cho mức độ nghiện
const getAddictionLevelColor = (score) => {
  if (score <= 7) return 'green';
  if (score <= 15) return 'orange';
  if (score <= 25) return 'red';
  return 'volcano';
};
