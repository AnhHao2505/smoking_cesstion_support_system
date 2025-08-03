export const API_BASE_URL = 'https://smokingcessationsupportswp391-production-137c.up.railway.app/';
// export const API_BASE_URL = 'http://localhost:8080';
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    // FE bỏ VERIFY_ACCOUNT, SEND_VERIFY_OTP, chỉ dùng các endpoint BE hỗ trợ
    SEND_RESET_OTP: '/auth/send-reset-otp',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // User Management
  USER: {
    ALL: '/user',
    DISABLE: '/user/disable',
    RE_ENABLE: '/user/re-enable',
    // mới: admin báo huấn luyện viên vắng mặt
    ABSENT_REPORT: '/user/coach/absent-report'
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
    // lấy và cập nhật hồ sơ thành viên
    ME: '/profile/me',
    UPDATE: '/profile/me',
    // hồ sơ huấn luyện viên
    COACH: '/profile/coach',
    // ảnh hồ sơ
    GET_IMAGE: '/profile/image',
    UPDATE_IMAGE: '/profile/image'
  },

  // Quit Plans
  QUIT_PLANS: {
    CREATE: '/api/quit-plans/create',
    REQUEST: '/api/quit-plans/request',
    NEWEST: '/api/quit-plans/newest',
    OLDS: '/api/quit-plans/olds',
    DENY: '/api/quit-plans/deny',
    ACCEPT: '/api/quit-plans/accept',
    FINAL_EVALUATION: '/api/quit-plans/final-evaluation',
    COACH_VIEW_NEWEST: '/api/quit-plans/coach/view/newest-of-member'
  },

  // Quit Phases
  QUIT_PHASES: {
    FROM_PLAN: '/api/quit-phases/from-plan',
    DEFAULT: '/api/quit-phases/default',
    CREATE_GOALS: '/api/quit-phases/default/create-goals',
  },

  // Daily Logs
  DAILY_LOGS: {
    CREATE: '/api/daily-logs',
    GET_BY_MEMBER: '/api/daily-logs/member',
    GET_BY_MEMBER_DATE: '/api/daily-logs/member/date'
  },

  // Member Smoking Status - Survey or a quiz to help coach create plan
  MEMBER_SMOKING_STATUS: {
    CREATE: '/api/member-smoking-status',
    LATEST: '/api/member-smoking-status/latest', // Cho member tự xem
    // coach view tình trạng ban đầu của member khác
    COACH_LATEST: '/api/member-smoking-status/coach/view-latest/to-create-plan'
  },

  // Feedbacks
  FEEDBACKS: {
    SUBMIT_TO_COACH: '/api/feedbacks/submit/my-coach',
    SUBMIT_TO_PLATFORM: '/api/feedbacks/submit/platform',
    PUBLISHED: '/api/feedbacks/published',
    OF_A_COACH: '/api/feedbacks/of-a-coach',
    ADMIN_ALL: '/api/feedbacks/all/unreviewed',
    APPROVE_PUBLISH: '/api/feedbacks/approve-publish',
    HIDE: '/api/feedbacks/hide'
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
    RE_ENABLE: '/api/reminders/re-enable'
  },

  // Chat Management
  CHAT: {
    // loại bỏ WS_CHANNELS, chỉ dùng các HTTP routes
    ROOM_MESSAGES: (roomId) => `/chat/rooms/${roomId}/messages`,
    PRIVATE_ROOMS: '/chat/rooms/private',
    DELETE_MESSAGE: '/chat/delete/message'
  },

  // Payment
  PAYMENT: {
    CREATE_PAYMENT: '/vn-pay/create-payment',
    VNPAY_RETURN: '/vn-pay/return',
    MY_TRANSACTIONS: '/my-transactions'
  }
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
  console.log('=== handleApiResponse called ===');
  console.log('Input response:', response);
  console.log('Response type:', typeof response);
  
  if (response === "") {
    console.log('Response is empty string, returning null');
    return null;
  }
  if (typeof response === 'string') {
    console.log('Response is string, returning as-is');
    return response;
  }
  if (response && response.data !== undefined) {
    console.log('Response has data property, extracting:', response.data);
    console.log('Data type:', typeof response.data);
    return response.data;
  }
  console.log('Returning response as-is');
  return response;
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  console.log(error)
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An error occurred');
};
