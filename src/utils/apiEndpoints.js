export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login', // Updated to match new API endpoint
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify-token',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_ACCOUNT: '/auth/verify-account',
    SEND_VERIFY_OTP: '/auth/send-verify-otp',
    SEND_RESET_OTP: '/auth/send-reset-otp',
    TEST_USERS: '/auth/get-testers'
  },

  // User Management
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/upload-avatar',
  },

  // Coach Management
  COACHES: {
    GET_ALL: '/coaches',
    GET_BY_ID: (id) => `/coaches/${id}`,
    CREATE: '/coaches',
    UPDATE: (id) => `/coaches/${id}`,
    DELETE: (id) => `/coaches/${id}`,
    GET_SPECIALTIES: '/coaches/specialties',
    GET_AVAILABLE: '/coaches/available',
    GET_DASHBOARD: (id) => `/coaches/${id}/dashboard`,
    GET_SCHEDULE: (id) => `/coaches/${id}/schedule`,
    UPDATE_AVAILABILITY: (id) => `/coaches/${id}/availability`,
    GET_PERFORMANCE: (id) => `/coaches/${id}/performance`,
  },

  // Member Management
  MEMBERS: {
    GET_ALL: '/members',
    GET_BY_ID: (id) => `/members/${id}`,
    GET_DASHBOARD: (id) => `/members/${id}/dashboard`,
    GET_PROFILE: (id) => `/profile/member/${id}`, // Updated endpoint for new API
    UPDATE_PROFILE: (id) => `/profile/member/${id}`,
    CREATE_QUIT_PLAN: '/members/quit-plan',
    GET_QUIT_PLAN: (id) => `/members/${id}/quit-plan`,
    UPDATE_QUIT_PLAN: (id) => `/members/${id}/quit-plan`,
    GET_DAILY_RECORDS: (id) => `/members/${id}/daily-records`,
    CREATE_DAILY_RECORD: (id) => `/members/${id}/daily-records`,
    GET_BADGES: (id) => `/members/${id}/badges`,
    GET_HEALTH_IMPROVEMENTS: (id) => `/members/${id}/health-improvements`,
  },

  // Quit Plans
  QUIT_PLANS: {
    GET_ALL: '/quit-plans',
    GET_BY_ID: (id) => `/quit-plans/${id}`,
    CREATE: '/quit-plans',
    UPDATE: (id) => `/quit-plans/${id}`,
    DELETE: (id) => `/quit-plans/${id}`,
    GET_BY_MEMBER: (memberId) => `/quit-plans/member/${memberId}`,
    GET_BY_COACH: (coachId) => `/quit-plans/coach/${coachId}`,
    UPDATE_PROGRESS: (id) => `/quit-plans/${id}/progress`,
    GET_PHASES: (id) => `/quit-plans/${id}/phases`,
    UPDATE_PHASE: (id, phaseId) => `/quit-plans/${id}/phases/${phaseId}`,
  },

  // Appointments
  APPOINTMENTS: {
    GET_ALL: '/appointments',
    GET_BY_ID: (id) => `/appointments/${id}`,
    CREATE: '/appointments',
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`,
    GET_BY_MEMBER: (memberId) => `/appointments/member/${memberId}`,
    GET_BY_COACH: (coachId) => `/appointments/coach/${coachId}`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id) => `/appointments/${id}/reschedule`,
    GET_AVAILABILITY: (coachId) => `/appointments/availability/${coachId}`,
  },

  // Daily Records
  DAILY_RECORDS: {
    GET_ALL: '/daily-records',
    GET_BY_ID: (id) => `/daily-records/${id}`,
    CREATE: '/daily-records',
    UPDATE: (id) => `/daily-records/${id}`,
    DELETE: (id) => `/daily-records/${id}`,
    GET_BY_MEMBER: (memberId) => `/daily-records/member/${memberId}`,
    GET_BY_DATE_RANGE: (memberId) => `/daily-records/member/${memberId}/range`,
  },

  // Blog Posts
  BLOG: {
    GET_ALL: '/blog/posts',
    GET_BY_ID: (id) => `/blog/posts/${id}`,
    CREATE: '/blog/posts',
    UPDATE: (id) => `/blog/posts/${id}`,
    DELETE: (id) => `/blog/posts/${id}`,
    GET_FEATURED: '/blog/posts/featured',
    GET_POPULAR: '/blog/posts/popular',
    GET_RELATED: (id) => `/blog/posts/${id}/related`,
    GET_BY_CATEGORY: (categoryId) => `/blog/posts/category/${categoryId}`,
    GET_BY_AUTHOR: (authorId) => `/blog/posts/author/${authorId}`,
    SEARCH: '/blog/posts/search',
  },

  // Blog Categories
  BLOG_CATEGORIES: {
    GET_ALL: '/blog/categories',
    GET_BY_ID: (id) => `/blog/categories/${id}`,
    CREATE: '/blog/categories',
    UPDATE: (id) => `/blog/categories/${id}`,
    DELETE: (id) => `/blog/categories/${id}`,
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SYSTEM_OVERVIEW: '/admin/system-overview',
    USER_STATISTICS: '/admin/user-statistics',
    QUIT_PLAN_STATISTICS: '/admin/quit-plan-statistics',
    CONTENT_STATISTICS: '/admin/content-statistics',
    COACH_PERFORMANCE: '/admin/coach-performance',
    SYSTEM_ALERTS: '/admin/system-alerts',
    MEMBERSHIP_REVENUE: '/admin/membership-revenue',
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
  },

  // Notifications
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    GET_BY_USER: (userId) => `/notifications/user/${userId}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: (userId) => `/notifications/user/${userId}/read-all`,
    DELETE: (id) => `/notifications/${id}`,
  },

  // Progress & Analytics
  ANALYTICS: {
    MEMBER_PROGRESS: (memberId) => `/analytics/member/${memberId}/progress`,
    COACH_ANALYTICS: (coachId) => `/analytics/coach/${coachId}`,
    SYSTEM_ANALYTICS: '/analytics/system',
    SUCCESS_RATES: '/analytics/success-rates',
    USAGE_STATISTICS: '/analytics/usage',
  },
};

// Helper function to build URL with query parameters
export const buildUrlWithParams = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.pathname + url.search;
};

// Helper function to handle API responses
export const handleApiResponse = (response) => {
  if (response.data) {
    return response.data;
  }
  return response;
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An error occurred');
};
