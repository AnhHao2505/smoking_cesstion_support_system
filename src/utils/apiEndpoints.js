export const API_BASE_URL = 'https://smokingcessationsupportswp391-production.up.railway.app/';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_ACCOUNT: '/auth/verify-account',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_VERIFY_OTP: '/auth/send-verify-otp',
    SEND_RESET_OTP: '/auth/send-reset-otp',
    GET_TESTERS: '/auth/get-testers'
  },

  // User Management
  USER: {
    ALL: '/user',
    MEMBERS: '/user/members',
    CURRENT_ASSIGNMENT: '/user/member/current-assignment',
    UPGRADE_PREMIUM: '/user/upgrade-premium',
    DISABLE: '/user/disable',
  },

  // Coach Management
  COACHES: {
    GET_ALL: '/coach/all',
    CREATE: '/coach/create',
    CHOOSE: '/coach/choose',
    ASSIGNED_MEMBERS: '/coach/assigned-members',
    CANCEL_BY_MEMBER: '/coach/member/cancel',
  },

  // Profile Management
  PROFILE: {
    ME: '/profile/me',
    MEMBER: '/profile/member',
    COACH: '/profile/coach',
  },

  // Quit Plans
  QUIT_PLANS: {
    CREATE: '/api/quit-plans/create',
    UPDATE: '/api/quit-plans/update',
    NEWEST: '/api/quit-plans/newest',
    OLDS: '/api/quit-plans/olds',
    DISABLE: '/api/quit-plans/disable',
    DENY: '/api/quit-plans/deny',
    ACCEPT: '/api/quit-plans/accept',
    FINISH: '/api/quit-plans/finish',
  },

  // Quit Phases
  QUIT_PHASES: {
    FROM_PLAN: '/api/quit-phases/from-plan',
    DEFAULT: '/api/quit-phases/default',
    CREATE_GOALS: '/api/quit-phases/default/create-goals',
  },

  // Daily Logs
  DAILY_LOGS: {
    GET_BY_PHASE: '/api/daily-logs/byPhase',
    CREATE: '/api/daily-logs',
    GET_BY_MEMBER: '/api/daily-logs/member',
    GET_BY_MEMBER_DATE: '/api/daily-logs/member/date',
  },

  // Member Smoking Status
  MEMBER_SMOKING_STATUS: {
    CREATE: '/api/member-smoking-status',
    LATEST: '/api/member-smoking-status/latest',
  },

  // Feedbacks
  FEEDBACKS: {
    CREATE: '/api/feedbacks',
    PUBLISHED: '/api/feedbacks/published',
    COACH: '/api/feedbacks/coach',
    ADMIN_ALL: '/api/feedbacks/all/unreviewed',
    APPROVE_PUBLISH: '/api/feedbacks/approve-publish',
    HIDE: '/api/feedbacks/hide',
    REVIEWED: '/api/feedbacks/reviewed',
  },

  // QnA Management
  QNA: {
    ASK: '/api/qna/ask',
    ANSWER: '/api/qna/answer',
    MINE: '/api/qna/mine',
    UNANSWERED: '/api/qna/unanswered',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
  },

  // Notifications
  NOTIFICATIONS: {
    ALL: '/api/notifications/all',
    UNREAD: '/api/notifications/unread',
    READ: '/api/notifications/read',
    IMPORTANT: '/api/notifications/important',
    MARK_READ: '/api/notifications/mark-read',
  },

  // Reminders
  REMINDERS: {
    GET_ALL: '/api/reminders',
    CREATE: '/api/reminders',
    UPDATE: '/api/reminders/update',
    DISABLE: '/api/reminders/disable',
  },

  // Chat Management
  CHAT: {
    WS_CHANNELS: '/chat/ws-channels',
    ROOM_MESSAGES: (roomId) => `/chat/rooms/${roomId}/messages`,
    PRIVATE_ROOMS: '/chat/rooms/private',
    DELETE_MESSAGE: '/chat/delete/message',
  },

  // Payment
  PAYMENT: {
    CREATE_PAYMENT: '/vn-pay/create-payment',
    VNPAY_RETURN: '/vn-pay/return',
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
