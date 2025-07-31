import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

/**
 * Comprehensive Status Service - Tích hợp từ Dashboard API + Member data
 * Sử dụng /api/dashboard/stats để lấy thống kê tổng quan + member specific data
 */

// =====================
// DASHBOARD STATISTICS API
// =====================

// Lấy thống kê tổng quan từ Dashboard API (for admin/overview)
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return handleApiResponse(response);
  } catch (error) {
    console.warn('Dashboard stats not available (may require admin permission):', error);
    return null;
  }
};

// =====================
// MEMBER SPECIFIC APIs  
// =====================

// Get current smoking status (Latest assessment)
export const getCurrentSmokingStatus = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/latest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get smoking status history
export const getSmokingStatusHistory = async (memberId, limit = 20) => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/history', {
      params: { memberId, limit }
    });
    return handleApiResponse(response) || [];
  } catch (error) {
    console.warn('Could not fetch status history:', error);
    return [];
  }
};

// Get quit plan data for statistics
export const getQuitPlanStatistics = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/quit-plans/newest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.warn('Could not fetch quit plan:', error);
    return null;
  }
};

// Get daily records for trend analysis  
export const getDailyRecordsForAnalysis = async (memberId, days = 30) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member', {
      params: { memberId, limit: days }
    });
    return handleApiResponse(response) || [];
  } catch (error) {
    console.warn('Could not fetch daily records:', error);
    return [];
  }
};

// =====================
// COMPREHENSIVE DATA INTEGRATION
// =====================

// Lấy dữ liệu comprehensive cho member (tích hợp tất cả)
export const getComprehensiveSmokingData = async (memberId) => {
  try {
    // Parallel fetch multiple APIs
    const [
      currentStatus,
      statusHistory,
      quitPlanData,
      dailyRecords,
      dashboardStats
    ] = await Promise.all([
      getCurrentSmokingStatus(memberId),
      getSmokingStatusHistory(memberId, 20),
      getQuitPlanStatistics(memberId),
      getDailyRecordsForAnalysis(memberId, 30),
      getDashboardStats() // Dashboard overview (optional)
    ]);

    // Calculate quit plan statistics
    const quitPlanStatistics = calculateQuitPlanStats(quitPlanData);
    
    // Calculate daily records trends - ENHANCED with more metrics
    const dailyRecordsTrend = calculateEnhancedDailyTrends(dailyRecords);
    
    // Calculate assessment trend
    const assessmentTrend = calculateAssessmentTrend(statusHistory);
    
    // Generate health milestones
    const healthMilestones = generateHealthMilestones(quitPlanStatistics.days_smoke_free);
    
    // Generate recommendations
    const recommendations = generateRecommendations(
      currentStatus,
      dailyRecordsTrend,
      quitPlanStatistics
    );

    return {
      currentStatus,
      statusHistory,
      quitPlanData: quitPlanStatistics,
      dailyRecords,
      statistics: {
        totalAssessments: statusHistory.length,
        averageScore: calculateAverageScore(statusHistory),
        assessmentFrequency: calculateAssessmentFrequency(statusHistory),
        levelDistribution: calculateLevelDistribution(statusHistory),
        assessmentTrend,
        dailyRecordsTrend,
        healthMilestones,
        dashboardStats // Include dashboard overview if available
      },
      recommendations
    };
  } catch (error) {
    console.error('Error fetching comprehensive smoking data:', error);
    throw handleApiError(error);
  }
};

// =====================
// ENHANCED CALCULATION FUNCTIONS
// =====================

// Calculate quit plan statistics with money saved and progress
const calculateQuitPlanStats = (quitPlan) => {
  if (!quitPlan) {
    return {
      days_smoke_free: 0,
      overall_progress: 0,
      money_saved: 0,
      current_phase: { phase_name: 'Chưa có kế hoạch' },
      cigarettes_avoided: 0,
      health_score: 0
    };
  }

  const startDate = new Date(quitPlan.startDate);
  const today = new Date();
  const daysDiff = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
  
  const endDate = new Date(quitPlan.endDate);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(Math.max((daysDiff / totalDays) * 100, 0), 100);

  // Enhanced calculations
  const cigarettesPerDay = quitPlan.originalCigarettesPerDay || 10;
  const pricePerCigarette = 1250; // 25,000 VND per pack / 20 cigarettes
  const moneySaved = Math.round(daysDiff * cigarettesPerDay * pricePerCigarette);
  const cigarettesAvoided = daysDiff * cigarettesPerDay;
  
  // Health score based on days smoke-free
  const healthScore = Math.min(Math.round((daysDiff / 365) * 100), 100);

  return {
    days_smoke_free: quitPlan.quitPlanStatus === 'IN_PROGRESS' ? daysDiff : 0,
    overall_progress: Math.round(progressPercent),
    money_saved: moneySaved,
    cigarettes_avoided: cigarettesAvoided,
    health_score: healthScore,
    current_phase: {
      phase_name: getPhaseByProgress(progressPercent)
    },
    totalDays,
    startDate: quitPlan.startDate,
    endDate: quitPlan.endDate,
    status: quitPlan.quitPlanStatus
  };
};

// Enhanced daily records trend analysis
const calculateEnhancedDailyTrends = (records) => {
  if (!records || records.length === 0) return null;

  const recentRecords = records.slice(-7); // Last 7 days
  const previousRecords = records.slice(-14, -7); // Previous 7 days
  const monthlyRecords = records.slice(-30); // Last 30 days

  // Cigarettes consumption trends
  const recentAvgCigarettes = recentRecords.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / recentRecords.length;
  const previousAvgCigarettes = previousRecords.length > 0 ? 
    previousRecords.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0) / previousRecords.length : recentAvgCigarettes;

  // Health metrics
  const avgStress = recentRecords.reduce((sum, r) => sum + (r.stressLevel || 5), 0) / recentRecords.length;
  const avgCraving = recentRecords.reduce((sum, r) => sum + (r.cravingIntensity || 5), 0) / recentRecords.length;
  const avgMood = recentRecords.reduce((sum, r) => sum + (r.moodLevel || 5), 0) / recentRecords.length;
  const avgSleep = recentRecords.reduce((sum, r) => sum + (r.sleepQuality || 5), 0) / recentRecords.length;
  const avgEnergy = recentRecords.reduce((sum, r) => sum + (r.energyLevel || 5), 0) / recentRecords.length;

  // Success metrics
  const smokeFreeRate = recentRecords.filter(r => (r.cigarettesConsumed || 0) === 0).length / recentRecords.length * 100;
  const smokeFreeStreak = calculateSmokeFreeStreak(recentRecords);
  const longestStreak = calculateLongestStreak(monthlyRecords);

  // Weekly patterns
  const weeklyPattern = analyzeWeeklyPattern(monthlyRecords);
  
  // Trigger analysis
  const triggerAnalysis = analyzeTriggers(recentRecords);

  return {
    // Consumption metrics
    recentAvgCigarettes: Math.round(recentAvgCigarettes * 10) / 10,
    previousAvgCigarettes: Math.round(previousAvgCigarettes * 10) / 10,
    changeInCigarettes: Math.round((recentAvgCigarettes - previousAvgCigarettes) * 10) / 10,
    
    // Health metrics (1-10 scale)
    avgStress: Math.round(avgStress * 10) / 10,
    avgCraving: Math.round(avgCraving * 10) / 10,
    avgMood: Math.round(avgMood * 10) / 10,
    avgSleep: Math.round(avgSleep * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    
    // Success metrics
    smokeFreeRate: Math.round(smokeFreeRate),
    smokeFreeStreak,
    longestStreak,
    
    // Pattern analysis
    weeklyPattern,
    triggerAnalysis,
    
    // Data volume
    totalRecords: records.length
  };
};

// Calculate smoke-free streak
const calculateSmokeFreeStreak = (records) => {
  let streak = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if ((records[i].cigarettesConsumed || 0) === 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Calculate longest smoke-free streak
const calculateLongestStreak = (records) => {
  let maxStreak = 0;
  let currentStreak = 0;
  
  records.forEach(record => {
    if ((record.cigarettesConsumed || 0) === 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
};

// Analyze weekly patterns
const analyzeWeeklyPattern = (records) => {
  const weekdayData = Array(7).fill().map(() => ({ total: 0, count: 0 }));
  
  records.forEach(record => {
    const date = new Date(record.date || record.createAt);
    const weekday = date.getDay(); // 0 = Sunday
    weekdayData[weekday].total += record.cigarettesConsumed || 0;
    weekdayData[weekday].count += 1;
  });
  
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  return weekdayData.map((data, index) => ({
    day: weekdays[index],
    avgCigarettes: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0
  }));
};

// Analyze smoking triggers
const analyzeTriggers = (records) => {
  const triggers = {
    highStress: 0, // stress >= 7
    highCraving: 0, // craving >= 7
    poorSleep: 0, // sleep <= 4
    lowMood: 0 // mood <= 4
  };
  
  records.forEach(record => {
    if (record.cigarettesConsumed > 0) {
      if ((record.stressLevel || 0) >= 7) triggers.highStress++;
      if ((record.cravingIntensity || 0) >= 7) triggers.highCraving++;
      if ((record.sleepQuality || 5) <= 4) triggers.poorSleep++;
      if ((record.moodLevel || 5) <= 4) triggers.lowMood++;
    }
  });
  
  return triggers;
};

// Calculate assessment trend
const calculateAssessmentTrend = (statusHistory) => {
  if (statusHistory.length < 2) {
    return {
      trend: 'stable',
      change: 0,
      message: 'Cần thêm dữ liệu để phân tích xu hướng'
    };
  }

  const recent = statusHistory.slice(-3);
  const previous = statusHistory.slice(-6, -3);

  const recentAvg = recent.reduce((sum, s) => sum + s.point, 0) / recent.length;
  const previousAvg = previous.length > 0 ? 
    previous.reduce((sum, s) => sum + s.point, 0) / previous.length : recentAvg;

  const change = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);

  let trend = 'stable';
  let message = 'Mức độ nghiện ổn định';

  if (change < -10) {
    trend = 'improving';
    message = 'Mức độ nghiện đang giảm - bạn đang cải thiện!';
  } else if (change > 10) {
    trend = 'worsening';
    message = 'Mức độ nghiện đang tăng - cần chú ý hơn';
  }

  return { trend, change, message };
};

// Generate health milestones based on smoke-free days
const generateHealthMilestones = (daysSmokeRree) => {
  const milestones = [
    { day: 1, title: 'Nồng độ nicotine trong máu giảm đáng kể', achieved: daysSmokeRree >= 1 },
    { day: 3, title: 'Hơi thở trở nên trong lành, vị giác cải thiện', achieved: daysSmokeRree >= 3 },
    { day: 7, title: 'Nguy cơ đau tim giảm, khứu giác phục hồi', achieved: daysSmokeRree >= 7 },
    { day: 14, title: 'Tuần hoàn máu cải thiện, phổi hoạt động tốt hơn', achieved: daysSmokeRree >= 14 },
    { day: 30, title: 'Phổi bắt đầu tự làm sạch, giảm ho và đờm', achieved: daysSmokeRree >= 30 },
    { day: 90, title: 'Nguy cơ nhiễm trùng hô hấp giảm đáng kể', achieved: daysSmokeRree >= 90 },
    { day: 180, title: 'Sức khỏe tim mạch cải thiện rõ rệt', achieved: daysSmokeRree >= 180 },
    { day: 365, title: 'Nguy cơ bệnh tim giảm 50% so với người hút thuốc', achieved: daysSmokeRree >= 365 }
  ];

  return milestones;
};

// Generate personalized recommendations based on comprehensive data
const generateRecommendations = (currentStatus, dailyTrend, quitPlan) => {
  const recommendations = [];

  if (!currentStatus) {
    recommendations.push('Thực hiện đánh giá mức độ nghiện để bắt đầu hành trình cai thuốc');
    return recommendations;
  }

  // Based on addiction level
  if (currentStatus.point <= 7) {
    recommendations.push('Mức độ nghiện thấp - đây là thời điểm tuyệt vời để bỏ thuốc hoàn toàn');
  } else if (currentStatus.point <= 15) {
    recommendations.push('Giảm dần số lượng thuốc và tìm hoạt động thay thế tích cực');
  } else if (currentStatus.point <= 25) {
    recommendations.push('Cần kế hoạch cai thuốc có cấu trúc và hỗ trợ từ chuyên gia');
  } else {
    recommendations.push('Nghiện nặng - nên tham khảo ý kiến bác sĩ về liệu pháp thay thế nicotine');
  }

  // Based on daily trends
  if (dailyTrend) {
    if (dailyTrend.avgStress >= 7) {
      recommendations.push('Học kỹ thuật quản lý stress: thiền, yoga, hít thở sâu để giảm thèm thuốc');
    }
    
    if (dailyTrend.avgCraving >= 7) {
      recommendations.push('Chuẩn bị chiến lược đối phó cơn thèm: nhai kẹo, uống nước, tập thể dục');
    }
    
    if (dailyTrend.smokeFreeRate >= 80) {
      recommendations.push('Tuyệt vời! Duy trì momentum này và tự thưởng cho bản thân');
    } else if (dailyTrend.smokeFreeRate <= 30) {
      recommendations.push('Xác định và tránh các trigger khiến bạn hút thuốc');
    }
    
    if (dailyTrend.avgSleep <= 5) {
      recommendations.push('Cải thiện giấc ngủ sẽ giúp giảm cơn thèm và tăng ý chí');
    }
    
    if (dailyTrend.avgMood <= 4) {
      recommendations.push('Tìm hoạt động tích cực để cải thiện tâm trạng thay vì hút thuốc');
    }

    // Pattern-based recommendations
    if (dailyTrend.triggerAnalysis) {
      if (dailyTrend.triggerAnalysis.highStress > 3) {
        recommendations.push('Stress là trigger chính - học các kỹ thuật thư giãn');
      }
      if (dailyTrend.triggerAnalysis.poorSleep > 2) {
        recommendations.push('Thiết lập thói quen ngủ nghỉ tốt để hỗ trợ cai thuốc');
      }
    }
  }

  // Based on quit plan progress
  if (quitPlan && quitPlan.days_smoke_free > 0) {
    if (quitPlan.days_smoke_free < 7) {
      recommendations.push('Tuần đầu khó khăn nhất đã qua - hãy kiên trí thêm!');
    } else if (quitPlan.days_smoke_free < 30) {
      recommendations.push('Bạn đã vượt qua giai đoạn cai nghiện cấp tính. Tiếp tục!');
    } else if (quitPlan.days_smoke_free < 90) {
      recommendations.push('Hình thành thói quen mới để thay thế việc hút thuốc');
    } else {
      recommendations.push('Thành tựu tuyệt vời! Bạn đã thay đổi lối sống tích cực');
    }
  }

  return recommendations.slice(0, 6); // Limit to 6 recommendations
};

// =====================
// HELPER FUNCTIONS
// =====================

const getPhaseByProgress = (progress) => {
  if (progress < 10) return 'Chuẩn bị';
  if (progress < 30) return 'Bắt đầu';
  if (progress < 70) return 'Hành động';
  if (progress < 90) return 'Duy trì';
  return 'Hoàn thành';
};

const calculateAverageScore = (statusHistory) => {
  if (statusHistory.length === 0) return 0;
  const total = statusHistory.reduce((sum, status) => sum + status.point, 0);
  return Math.round((total / statusHistory.length) * 10) / 10;
};

const calculateAssessmentFrequency = (statusHistory) => {
  if (statusHistory.length < 2) return 0;
  
  const firstDate = new Date(statusHistory[0].createAt);
  const lastDate = new Date(statusHistory[statusHistory.length - 1].createAt);
  const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  return Math.round(daysDiff / statusHistory.length) || 0;
};

const calculateLevelDistribution = (statusHistory) => {
  const distribution = {
    'Không nghiện': 0,
    'Nghiện nhẹ': 0,
    'Nghiện trung bình': 0,
    'Nghiện nặng': 0
  };

  statusHistory.forEach(status => {
    if (status.point <= 7) distribution['Không nghiện']++;
    else if (status.point <= 15) distribution['Nghiện nhẹ']++;
    else if (status.point <= 25) distribution['Nghiện trung bình']++;
    else distribution['Nghiện nặng']++;
  });

  return distribution;
};

// Format status for display
export const formatStatusForDisplay = (currentStatus) => {
  if (!currentStatus) return null;

  const level = currentStatus.point <= 7 ? 'Không nghiện' : 
                currentStatus.point <= 15 ? 'Nghiện nhẹ' : 
                currentStatus.point <= 25 ? 'Nghiện trung bình' : 'Nghiện nặng';
  
  const color = currentStatus.point <= 7 ? 'green' : 
                currentStatus.point <= 15 ? 'orange' : 
                currentStatus.point <= 25 ? 'red' : 'volcano';

  return {
    level,
    color,
    score: currentStatus.point,
    dailySmoking: currentStatus.dailySmoking || 0,
    reasonToQuit: currentStatus.reasonToQuit || '',
    goal: currentStatus.goal || '',
    assessmentDate: new Date(currentStatus.createAt).toLocaleDateString('vi-VN')
  };
};

// =====================
// COMPREHENSIVE DATA AGGREGATION
// =====================

// Get all data needed for smoking status page
export const getComprehensiveSmokingData = async (memberId) => {
  try {
    console.log('Fetching comprehensive smoking data for member:', memberId);
    
    // Execute all API calls in parallel
    const [
      currentStatus,
      quitPlanData,  
      dailyRecords,
      statusHistory
    ] = await Promise.all([
      getCurrentSmokingStatus(memberId).catch(() => null),
      getQuitPlanStatistics(memberId).catch(() => null),
      getDailyRecordsForAnalysis(memberId, 30).catch(() => []),
      getSmokingStatusHistory(memberId).catch(() => [])
    ]);

    console.log('Comprehensive data fetched:', {
      currentStatus: !!currentStatus,
      quitPlanData: !!quitPlanData,
      dailyRecords: dailyRecords?.length || 0,
      statusHistory: statusHistory?.length || 0
    });

    // Calculate comprehensive statistics
    const comprehensiveStats = calculateComprehensiveStatistics({
      currentStatus,
      quitPlanData,
      dailyRecords,
      statusHistory
    });

    return {
      currentStatus,
      quitPlanData,
      dailyRecords,
      statusHistory,
      statistics: comprehensiveStats,
      recommendations: getPersonalizedRecommendations(currentStatus, quitPlanData, dailyRecords)
    };

  } catch (error) {
    console.error('Error fetching comprehensive smoking data:', error);
    throw error;
  }
};

// =====================
// STATISTICS CALCULATION
// =====================

// Calculate comprehensive statistics from all data sources
const calculateComprehensiveStatistics = ({ currentStatus, quitPlanData, dailyRecords, statusHistory }) => {
  const stats = {
    // Basic addiction status
    currentAddictionLevel: currentStatus ? getAddictionLevelFromScore(currentStatus.point || 0) : 'Chưa đánh giá',
    currentScore: currentStatus?.point || 0,
    currentDailySmoking: currentStatus?.dailySmoking || 0,
    
    // Assessment history
    totalAssessments: statusHistory?.length || 0,
    assessmentTrend: calculateAssessmentTrend(statusHistory),
    
    // Quit plan progress
    daysSmokeFree: quitPlanData?.days_smoke_free || 0,
    quitProgress: quitPlanData?.overall_progress || 0,
    currentPhase: quitPlanData?.current_phase?.phase_name || 'Chưa có kế hoạch',
    moneySaved: quitPlanData?.money_saved || 0,
    
    // Daily records analysis
    dailyRecordsTrend: calculateDailyRecordsTrend(dailyRecords),
    recentPerformance: calculateRecentPerformance(dailyRecords),
    
    // Health improvements
    healthMilestones: calculateHealthMilestones(quitPlanData?.days_smoke_free || 0)
  };

  return stats;
};

// Calculate trend from assessment history
const calculateAssessmentTrend = (history) => {
  if (!history || history.length < 2) {
    return { trend: 'stable', change: 0, message: 'Chưa đủ dữ liệu' };
  }

  const sortedHistory = [...history].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];
  
  const change = (latest.point || 0) - (previous.point || 0);
  const changePercent = previous.point > 0 ? Math.round((change / previous.point) * 100) : 0;
  
  let trend = 'stable';
  let message = '';
  
  if (change > 2) {
    trend = 'worsening';
    message = `Mức độ nghiện tăng ${changePercent}% so với lần trước`;
  } else if (change < -2) {
    trend = 'improving';
    message = `Mức độ nghiện giảm ${Math.abs(changePercent)}% so với lần trước`;
  } else {
    trend = 'stable';
    message = 'Mức độ nghiện ổn định';
  }
  
  return { trend, change: changePercent, message };
};

// Calculate trends from daily records
const calculateDailyRecordsTrend = (records) => {
  if (!records || records.length === 0) return null;

  const recentRecords = records.slice(-7); // Last 7 days
  const totalCigarettes = recentRecords.reduce((sum, r) => sum + (r.cigarettesConsumed || 0), 0);
  const smokeFreedays = recentRecords.filter(r => (r.cigarettesConsumed || 0) === 0).length;
  const avgStress = recentRecords.reduce((sum, r) => sum + (r.stressLevel || 0), 0) / recentRecords.length;
  
  return {
    avgDailyCigarettes: Math.round((totalCigarettes / recentRecords.length) * 10) / 10,
    smokeFreeRate: Math.round((smokeFreedays / recentRecords.length) * 100),
    avgStressLevel: Math.round(avgStress * 10) / 10,
    totalRecords: records.length,
    recentRecords: recentRecords.length
  };
};

// Calculate recent performance metrics
const calculateRecentPerformance = (records) => {
  if (!records || records.length === 0) return null;

  const last7Days = records.slice(-7);
  const last30Days = records.slice(-30);
  
  // Weekly metrics
  const weeklySmokeFree = last7Days.filter(r => (r.cigarettesConsumed || 0) === 0).length;
  const weeklyAvgCraving = last7Days.reduce((sum, r) => sum + (r.cravingIntensity || 0), 0) / last7Days.length;
  
  // Monthly metrics  
  const monthlySmokeFree = last30Days.filter(r => (r.cigarettesConsumed || 0) === 0).length;
  const monthlyAvgCraving = last30Days.reduce((sum, r) => sum + (r.cravingIntensity || 0), 0) / last30Days.length;
  
  return {
    weekly: {
      smokeFreeRate: Math.round((weeklySmokeFree / last7Days.length) * 100),
      avgCraving: Math.round(weeklyAvgCraving * 10) / 10
    },
    monthly: {
      smokeFreeRate: Math.round((monthlySmokeFree / last30Days.length) * 100),
      avgCraving: Math.round(monthlyAvgCraving * 10) / 10
    }
  };
};

// Calculate health milestones based on days smoke-free
const calculateHealthMilestones = (daysSmokeeFree) => {
  const milestones = [
    { day: 1, title: 'CO trong máu bình thường', achieved: daysSmokeeFree >= 1 },
    { day: 3, title: 'Vị giác, khứu giác cải thiện', achieved: daysSmokeeFree >= 3 },
    { day: 7, title: 'Hơi thở trong lành', achieved: daysSmokeeFree >= 7 },
    { day: 14, title: 'Tuần hoàn máu tốt hơn', achieved: daysSmokeeFree >= 14 },
    { day: 30, title: 'Chức năng phổi tăng 30%', achieved: daysSmokeeFree >= 30 },
    { day: 90, title: 'Giảm nguy cơ đột quỵ', achieved: daysSmokeeFree >= 90 },
    { day: 365, title: 'Giảm 50% nguy cơ tim mạch', achieved: daysSmokeeFree >= 365 }
  ];
  
  return milestones;
};

// =====================
// HELPER FUNCTIONS
// =====================

// Convert addiction score to level
const getAddictionLevelFromScore = (score) => {
  if (score <= 7) return 'Không nghiện';
  if (score <= 15) return 'Nghiện nhẹ';
  if (score <= 25) return 'Nghiện trung bình';
  return 'Nghiện nặng';
};

// Get smoking status history (mock implementation for now)
const getSmokingStatusHistory = async (memberId) => {
  // TODO: Implement actual API call when backend provides history endpoint
  // For now, return mock data
  return [
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
    }
  ];
};

// Get personalized recommendations based on all data
const getPersonalizedRecommendations = (currentStatus, quitPlanData, dailyRecords) => {
  const recommendations = [];
  
  // Based on addiction level
  if (currentStatus) {
    const score = currentStatus.point || 0;
    if (score <= 7) {
      recommendations.push('Chúc mừng! Hãy duy trì lối sống không thuốc lá');
      recommendations.push('Chia sẻ kinh nghiệm tích cực với người khác');
    } else if (score <= 15) {
      recommendations.push('Giảm dần số lượng thuốc lá mỗi ngày');
      recommendations.push('Tập thở sâu khi có cơn thèm thuốc');
    } else if (score <= 25) {
      recommendations.push('Xây dựng kế hoạch cai thuốc có hệ thống');
      recommendations.push('Tham khảo ý kiến bác sĩ về thuốc hỗ trợ');
    } else {
      recommendations.push('Cần sự hỗ trợ chuyên nghiệp từ bác sĩ');
      recommendations.push('Cân nhậc liệu pháp thay thế nicotine');
    }
  }
  
  // Based on quit plan progress
  if (quitPlanData) {
    const progress = quitPlanData.overall_progress || 0;
    if (progress < 25) {
      recommendations.push('Tập trung vào giai đoạn chuẩn bị tâm lý');
    } else if (progress < 75) {
      recommendations.push('Duy trì động lực và thực hiện đúng kế hoạch');
    } else {
      recommendations.push('Chuẩn bị cho giai đoạn duy trì kết quả');
    }
  }
  
  // Based on daily records
  if (dailyRecords && dailyRecords.length > 0) {
    const recentRecords = dailyRecords.slice(-7);
    const smokeFreedays = recentRecords.filter(r => (r.cigarettesConsumed || 0) === 0).length;
    const smokeFreeRate = smokeFreedays / recentRecords.length;
    
    if (smokeFreeRate >= 0.8) {
      recommendations.push('Kết quả tuyệt vời! Tiếp tục duy trì');
    } else if (smokeFreeRate >= 0.5) {
      recommendations.push('Tìm hiểu các yếu tố kích thích hút thuốc');
    } else {
      recommendations.push('Cần điều chỉnh chiến lược cai thuốc');
    }
  }
  
  return recommendations;
};

// Format data for display
export const formatStatusForDisplay = (statusData) => {
  if (!statusData) return null;
  
  return {
    level: getAddictionLevelFromScore(statusData.point || 0),
    score: statusData.point || 0,
    dailySmoking: statusData.dailySmoking || 0,
    reasonToQuit: statusData.reasonToQuit || '',
    goal: statusData.goal || '',
    assessmentDate: statusData.createAt ? new Date(statusData.createAt).toLocaleDateString('vi-VN') : '',
    color: getAddictionLevelColor(statusData.point || 0)
  };
};

// Get color for addiction level
const getAddictionLevelColor = (score) => {
  if (score <= 7) return 'green';
  if (score <= 15) return 'orange';
  if (score <= 25) return 'red';
  return 'volcano';
};

export default {
  getComprehensiveSmokingData,
  getCurrentSmokingStatus,
  getQuitPlanStatistics,
  getDailyRecordsForAnalysis,
  formatStatusForDisplay
};
