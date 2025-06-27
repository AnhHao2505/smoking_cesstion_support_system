// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login', // Updated to match new API endpoint
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    VERIFY_TOKEN: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // User Management
  USERS: {
    GET_ALL: '/api/users',
    GET_BY_ID: (id) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    GET_PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    UPLOAD_AVATAR: '/api/users/upload-avatar',
  },

  // Coach Management
  COACHES: {
    GET_ALL: '/api/coaches',
    GET_BY_ID: (id) => `/api/coaches/${id}`,
    CREATE: '/api/coaches',
    UPDATE: (id) => `/api/coaches/${id}`,
    DELETE: (id) => `/api/coaches/${id}`,
    GET_SPECIALTIES: '/api/coaches/specialties',
    GET_AVAILABLE: '/api/coaches/available',
    GET_DASHBOARD: (id) => `/api/coaches/${id}/dashboard`,
    GET_SCHEDULE: (id) => `/api/coaches/${id}/schedule`,
    UPDATE_AVAILABILITY: (id) => `/api/coaches/${id}/availability`,
    GET_PERFORMANCE: (id) => `/api/coaches/${id}/performance`,
  },

  // Member Management
  MEMBERS: {
    GET_ALL: '/api/members',
    GET_BY_ID: (id) => `/api/members/${id}`,
    GET_DASHBOARD: (id) => `/api/members/${id}/dashboard`,
    GET_PROFILE: (id) => `/profile/member/${id}`, // Updated endpoint for new API
    UPDATE_PROFILE: (id) => `/api/members/${id}/profile`,
    CREATE_QUIT_PLAN: '/api/members/quit-plan',
    GET_QUIT_PLAN: (id) => `/api/members/${id}/quit-plan`,
    UPDATE_QUIT_PLAN: (id) => `/api/members/${id}/quit-plan`,
    GET_DAILY_RECORDS: (id) => `/api/members/${id}/daily-records`,
    CREATE_DAILY_RECORD: (id) => `/api/members/${id}/daily-records`,
    GET_BADGES: (id) => `/api/members/${id}/badges`,
    GET_HEALTH_IMPROVEMENTS: (id) => `/api/members/${id}/health-improvements`,
  },

  // Quit Plans
  QUIT_PLANS: {
    GET_ALL: '/api/quit-plans',
    GET_BY_ID: (id) => `/api/quit-plans/${id}`,
    CREATE: '/api/quit-plans',
    UPDATE: (id) => `/api/quit-plans/${id}`,
    DELETE: (id) => `/api/quit-plans/${id}`,
    GET_BY_MEMBER: (memberId) => `/api/quit-plans/member/${memberId}`,
    GET_BY_COACH: (coachId) => `/api/quit-plans/coach/${coachId}`,
    UPDATE_PROGRESS: (id) => `/api/quit-plans/${id}/progress`,
    GET_PHASES: (id) => `/api/quit-plans/${id}/phases`,
    UPDATE_PHASE: (id, phaseId) => `/api/quit-plans/${id}/phases/${phaseId}`,
  },

  // Appointments
  APPOINTMENTS: {
    GET_ALL: '/api/appointments',
    GET_BY_ID: (id) => `/api/appointments/${id}`,
    CREATE: '/api/appointments',
    UPDATE: (id) => `/api/appointments/${id}`,
    DELETE: (id) => `/api/appointments/${id}`,
    GET_BY_MEMBER: (memberId) => `/api/appointments/member/${memberId}`,
    GET_BY_COACH: (coachId) => `/api/appointments/coach/${coachId}`,
    CANCEL: (id) => `/api/appointments/${id}/cancel`,
    RESCHEDULE: (id) => `/api/appointments/${id}/reschedule`,
    GET_AVAILABILITY: (coachId) => `/api/appointments/availability/${coachId}`,
  },

  // Daily Records
  DAILY_RECORDS: {
    GET_ALL: '/api/daily-records',
    GET_BY_ID: (id) => `/api/daily-records/${id}`,
    CREATE: '/api/daily-records',
    UPDATE: (id) => `/api/daily-records/${id}`,
    DELETE: (id) => `/api/daily-records/${id}`,
    GET_BY_MEMBER: (memberId) => `/api/daily-records/member/${memberId}`,
    GET_BY_DATE_RANGE: (memberId) => `/api/daily-records/member/${memberId}/range`,
  },

  // Blog Posts
  BLOG: {
    GET_ALL: '/api/blog/posts',
    GET_BY_ID: (id) => `/api/blog/posts/${id}`,
    CREATE: '/api/blog/posts',
    UPDATE: (id) => `/api/blog/posts/${id}`,
    DELETE: (id) => `/api/blog/posts/${id}`,
    GET_FEATURED: '/api/blog/posts/featured',
    GET_POPULAR: '/api/blog/posts/popular',
    GET_RELATED: (id) => `/api/blog/posts/${id}/related`,
    GET_BY_CATEGORY: (categoryId) => `/api/blog/posts/category/${categoryId}`,
    GET_BY_AUTHOR: (authorId) => `/api/blog/posts/author/${authorId}`,
    SEARCH: '/api/blog/posts/search',
  },

  // Blog Categories
  BLOG_CATEGORIES: {
    GET_ALL: '/api/blog/categories',
    GET_BY_ID: (id) => `/api/blog/categories/${id}`,
    CREATE: '/api/blog/categories',
    UPDATE: (id) => `/api/blog/categories/${id}`,
    DELETE: (id) => `/api/blog/categories/${id}`,
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    SYSTEM_OVERVIEW: '/api/admin/system-overview',
    USER_STATISTICS: '/api/admin/user-statistics',
    QUIT_PLAN_STATISTICS: '/api/admin/quit-plan-statistics',
    CONTENT_STATISTICS: '/api/admin/content-statistics',
    COACH_PERFORMANCE: '/api/admin/coach-performance',
    SYSTEM_ALERTS: '/api/admin/system-alerts',
    MEMBERSHIP_REVENUE: '/api/admin/membership-revenue',
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
    AVATAR: '/api/upload/avatar',
  },

  // Notifications
  NOTIFICATIONS: {
    GET_ALL: '/api/notifications',
    GET_BY_USER: (userId) => `/api/notifications/user/${userId}`,
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: (userId) => `/api/notifications/user/${userId}/read-all`,
    DELETE: (id) => `/api/notifications/${id}`,
  },

  // Progress & Analytics
  ANALYTICS: {
    MEMBER_PROGRESS: (memberId) => `/api/analytics/member/${memberId}/progress`,
    COACH_ANALYTICS: (coachId) => `/api/analytics/coach/${coachId}`,
    SYSTEM_ANALYTICS: '/api/analytics/system',
    SUCCESS_RATES: '/api/analytics/success-rates',
    USAGE_STATISTICS: '/api/analytics/usage',
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
  if (error.response && error.response.data) {
    throw error.response.data;
  }
  throw error;
};
