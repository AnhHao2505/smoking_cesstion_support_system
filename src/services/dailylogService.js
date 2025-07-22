import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Create a daily log - Updated to match new API
export const createDailyLog = async (logData) => {
  try {
    const response = await axiosInstance.post('/api/daily-logs', logData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get daily logs by phase - Updated to match new API
export const getLogsByPhase = async (phaseId) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/byPhase', {
      params: { phaseId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all daily logs of current authenticated member - Updated to match new API
export const getMemberDailyLogs = async () => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get member's daily log by date - Updated to match new API endpoint
export const getMemberDailyLogByDate = async (date) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member/date', {
      data: date // API expects date in request body as LocalDate
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an existing daily log
export const updateDailyLog = async (logId, logData) => {
  try {
    const response = await axiosInstance.put(`${API_ENDPOINTS.DAILY_LOGS.CREATE}/${logId}`, logData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a daily log
export const deleteDailyLog = async (logId) => {
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.DAILY_LOGS.CREATE}/${logId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get daily logs with analytics data
export const getDailyLogsWithAnalytics = async (memberId, startDate, endDate) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DAILY_LOGS.GET_BY_MEMBER, {
      params: { memberId, startDate, endDate, includeAnalytics: true }
    });
    return handleApiResponse(response);
  } catch (error) {
    // Fallback to mock data if API is not available
    console.warn('Analytics API not available, using mock data');
    return getMockAnalyticsData(memberId, startDate, endDate);
  }
};

// Mock analytics data for development
const getMockAnalyticsData = (memberId, startDate, endDate) => {
  const logs = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    logs.push({
      log_id: Math.random().toString(36).substr(2, 9),
      member_id: memberId,
      log_date: dateStr,
      cigarettes_smoked: Math.floor(Math.random() * 5),
      stress_level: Math.floor(Math.random() * 10) + 1,
      mood_level: Math.floor(Math.random() * 10) + 1,
      craving_intensity: Math.floor(Math.random() * 10) + 1,
      sleep_hours: Math.floor(Math.random() * 4) + 6,
      physical_activity: Math.floor(Math.random() * 3) + 1,
      notes: `Daily notes for ${dateStr}`,
      created_at: dateStr
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    success: true,
    data: logs,
    analytics: calculateAnalytics(logs)
  };
};

// Calculate analytics from daily logs
const calculateAnalytics = (logs) => {
  if (!logs.length) return null;

  const totalDays = logs.length;
  const smokeFreedays = logs.filter(log => log.cigarettes_smoked === 0).length;
  const totalCigarettes = logs.reduce((sum, log) => sum + log.cigarettes_smoked, 0);
  const avgStress = logs.reduce((sum, log) => sum + log.stress_level, 0) / totalDays;
  const avgMood = logs.reduce((sum, log) => sum + log.mood_level, 0) / totalDays;
  const avgCraving = logs.reduce((sum, log) => sum + log.craving_intensity, 0) / totalDays;
  const avgSleep = logs.reduce((sum, log) => sum + log.sleep_hours, 0) / totalDays;

  return {
    totalDays,
    smokeFreedays,
    smokeFreeRate: (smokeFreedays / totalDays * 100).toFixed(1),
    totalCigarettes,
    avgDailyCigarettes: (totalCigarettes / totalDays).toFixed(1),
    avgStressLevel: avgStress.toFixed(1),
    avgMoodLevel: avgMood.toFixed(1),
    avgCravingIntensity: avgCraving.toFixed(1),
    avgSleepHours: avgSleep.toFixed(1),
    trendData: calculateTrends(logs)
  };
};

// Calculate trend data for charts
const calculateTrends = (logs) => {
  const weeklyData = {};
  
  logs.forEach(log => {
    const week = new Date(log.log_date).toISOString().substr(0, 7); // YYYY-MM format
    if (!weeklyData[week]) {
      weeklyData[week] = {
        week,
        totalCigarettes: 0,
        totalStress: 0,
        totalMood: 0,
        totalCraving: 0,
        totalSleep: 0,
        count: 0
      };
    }
    
    weeklyData[week].totalCigarettes += log.cigarettes_smoked;
    weeklyData[week].totalStress += log.stress_level;
    weeklyData[week].totalMood += log.mood_level;
    weeklyData[week].totalCraving += log.craving_intensity;
    weeklyData[week].totalSleep += log.sleep_hours;
    weeklyData[week].count += 1;
  });

  return Object.values(weeklyData).map(week => ({
    week: week.week,
    avgCigarettes: (week.totalCigarettes / week.count).toFixed(1),
    avgStress: (week.totalStress / week.count).toFixed(1),
    avgMood: (week.totalMood / week.count).toFixed(1),
    avgCraving: (week.totalCraving / week.count).toFixed(1),
    avgSleep: (week.totalSleep / week.count).toFixed(1)
  }));
};

// Get mood tracking data
export const getMoodTrackingData = async (memberId, period = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const logs = await getMemberDailyLogs(memberId);
    
    // Filter logs by date range
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.log_date);
      return logDate >= startDate && logDate <= endDate;
    });

    return {
      success: true,
      data: filteredLogs.map(log => ({
        date: log.log_date,
        mood: log.mood_level,
        stress: log.stress_level,
        craving: log.craving_intensity,
        sleep: log.sleep_hours,
        cigarettes: log.cigarettes_smoked
      })),
      summary: {
        avgMood: (filteredLogs.reduce((sum, log) => sum + log.mood_level, 0) / filteredLogs.length).toFixed(1),
        avgStress: (filteredLogs.reduce((sum, log) => sum + log.stress_level, 0) / filteredLogs.length).toFixed(1),
        moodTrend: calculateMoodTrend(filteredLogs),
        stressTrend: calculateStressTrend(filteredLogs)
      }
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Calculate mood trend (improving/declining)
const calculateMoodTrend = (logs) => {
  if (logs.length < 7) return 'insufficient_data';
  
  const firstWeek = logs.slice(0, 7);
  const lastWeek = logs.slice(-7);
  
  const firstWeekAvg = firstWeek.reduce((sum, log) => sum + log.mood_level, 0) / firstWeek.length;
  const lastWeekAvg = lastWeek.reduce((sum, log) => sum + log.mood_level, 0) / lastWeek.length;
  
  const difference = lastWeekAvg - firstWeekAvg;
  
  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
};

// Calculate stress trend
const calculateStressTrend = (logs) => {
  if (logs.length < 7) return 'insufficient_data';
  
  const firstWeek = logs.slice(0, 7);
  const lastWeek = logs.slice(-7);
  
  const firstWeekAvg = firstWeek.reduce((sum, log) => sum + log.stress_level, 0) / firstWeek.length;
  const lastWeekAvg = lastWeek.reduce((sum, log) => sum + log.stress_level, 0) / lastWeek.length;
  
  const difference = lastWeekAvg - firstWeekAvg;
  
  if (difference > 1) return 'increasing';
  if (difference < -1) return 'decreasing';
  return 'stable';
};

// Export all functions
export {
  calculateAnalytics,
  calculateTrends,
  getMockAnalyticsData
};