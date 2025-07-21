import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

/**
 * Comprehensive Profile Service
 * Based on API specification for profile management
 */

// ========================
// PROFILE MANAGEMENT
// ========================

/**
 * Get current user's profile
 * Endpoint: GET /profile/me
 * Summary: Member / Coach get their profile
 */
export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get('/profile/me');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update current user's profile (member only)
 * Endpoint: PATCH /profile/me
 * Summary: Member updates his/her profile
 * Description: Only name can be changed
 */
export const updateMyProfile = async (name) => {
  try {
    const response = await axiosInstance.patch('/profile/me', null, {
      params: { name }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get coach profile by ID
 * Endpoint: GET /profile/coach
 * Summary: Admin & Coach & Member view coach profile
 */
export const getCoachProfile = async (coachId) => {
  try {
    const response = await axiosInstance.get('/profile/coach', {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update coach profile (admin only)
 * Endpoint: PUT /profile/coach
 * Summary: Admin updates coach profile
 * Description: Only name, contact number, certificates, bio, specialty, working hours can be changed
 */
export const updateCoachProfile = async (coachId, profileData) => {
  try {
    const response = await axiosInstance.put('/profile/coach', profileData, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// COACH MANAGEMENT
// ========================

/**
 * Get all coaches with pagination
 * Endpoint: GET /coach/all
 * Summary: Admin view all coaches / Member view all available coaches to consult
 */
export const getAllCoaches = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/coach/all', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new coach (admin only)
 * Endpoint: POST /coach/create
 * Summary: Admin Create a new coach
 */
export const createCoach = async (coachData) => {
  try {
    const response = await axiosInstance.post('/coach/create', coachData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Member chooses a coach for consulting
 * Endpoint: POST /coach/choose
 * Summary: Member chooses a coach for consulting
 * Description: A user can only have 1 current coach, and creates a private chat room
 */
export const chooseCoach = async (coachId) => {
  try {
    const response = await axiosInstance.post('/coach/choose', null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get assigned members for a coach
 * Endpoint: GET /coach/assigned-members
 * Summary: Member view coach's member list / Coach view their assigned member list / Admin view coach's assigned member list
 * Description: At most 10 members
 */
export const getAssignedMembers = async (coachId) => {
  try {
    const response = await axiosInstance.get('/coach/assigned-members', {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Member cancels their coach
 * Endpoint: PUT /coach/member/cancel
 * Summary: Member cancel Consultation with this coach
 * Description: Member disables their current coach's assignment and chat room
 */
export const cancelCoach = async (coachId) => {
  try {
    const response = await axiosInstance.put('/coach/member/cancel', null, {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// USER MANAGEMENT
// ========================

/**
 * Get all users (coach & member) (admin only)
 * Endpoint: GET /user
 * Summary: Get all users (coach & member) (admin only)
 */
export const getAllUsers = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/user', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Disable a user (admin only)
 * Endpoint: PATCH /user/disable
 * Summary: Admin disable a user
 */
export const disableUser = async (userId) => {
  try {
    const response = await axiosInstance.patch('/user/disable', null, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Re-enable a user (admin only)
 * Endpoint: PATCH /user/re-enable
 */
export const reEnableUser = async (userId) => {
  try {
    const response = await axiosInstance.patch('/user/re-enable', null, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Admin reports a coach's absence
 * Endpoint: POST /user/coach/absent-report
 * Summary: Admin reports a coach's absence
 * Description: Sends a notification to all members managed by this coach, informing them of the coach's absence
 */
export const reportCoachAbsent = async (coachAbsentData) => {
  try {
    const response = await axiosInstance.post('/user/coach/absent-report', coachAbsentData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// MEMBER SMOKING STATUS
// ========================

/**
 * Member submits their initial smoking status
 * Endpoint: POST /api/member-smoking-status
 * Summary: Member submits their initial smoking status
 */
export const createMemberSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.post('/api/member-smoking-status', statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get latest initial status of member
 * Endpoint: GET /api/member-smoking-status/latest
 * Summary: Coach retrieves this to support plan creation / Member fetches latest details
 */
export const getLatestMemberSmokingStatus = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/member-smoking-status/latest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update latest smoking status
 * Endpoint: PUT /api/member-smoking-status/latest
 * Summary: Member updates their initial smoking status
 */
export const updateLatestSmokingStatus = async (statusData) => {
  try {
    const response = await axiosInstance.put('/api/member-smoking-status/latest', statusData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// PAYMENT MANAGEMENT
// ========================

/**
 * Create VNPAY Payment
 * Endpoint: POST /vn-pay/create-payment
 * Summary: Create VNPAY Payment
 * Description: Generates a VNPAY payment URL and stores a PENDING transaction for the current user
 */
export const createVnPayPayment = async (amount, language = 'vn') => {
  try {
    const response = await axiosInstance.post('/vn-pay/create-payment', null, {
      params: { amount, language }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Handle VNPAY Return
 * Endpoint: GET /vn-pay/return
 * Summary: Handle VNPAY Return, used when VnPay callback
 * Description: Verifies and processes the return callback from VNPAY after a payment
 */
export const handleVnPayReturn = async (params) => {
  try {
    const response = await axiosInstance.get('/vn-pay/return', {
      params
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get my transactions
 * Endpoint: GET /my-transactions
 */
export const getMyTransactions = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/my-transactions', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// REMINDER MANAGEMENT
// ========================

/**
 * Get all reminders (paginated) (admin only)
 * Endpoint: GET /api/reminders
 * Summary: (Paginated)Admin Get all reminder
 */
export const getAllReminders = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/reminders', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new reminder (admin only)
 * Endpoint: POST /api/reminders
 * Summary: Admin Create a new reminder
 */
export const createReminder = async (content, category) => {
  try {
    const response = await axiosInstance.post('/api/reminders', null, {
      params: { content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update an existing reminder (admin only)
 * Endpoint: PUT /api/reminders/update
 * Summary: Admin Update an existing reminder
 */
export const updateReminder = async (reminderId, content, category) => {
  try {
    const response = await axiosInstance.put('/api/reminders/update', null, {
      params: { reminderId, content, category }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Disable a reminder (admin only)
 * Endpoint: PATCH /api/reminders/disable
 * Summary: Admin Disable a reminder
 */
export const disableReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.patch('/api/reminders/disable', null, {
      params: { reminderId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Re-enable a reminder (admin only)
 * Endpoint: PATCH /api/reminders/re-enable
 */
export const reEnableReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.patch('/api/reminders/re-enable', null, {
      params: { reminderId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// QUIT PLAN MANAGEMENT
// ========================

/**
 * Coach creates a new quit plan
 * Endpoint: POST /api/quit-plans/create
 * Summary: Coach creates a new quit plan
 */
export const createQuitPlan = async (memberId, planData) => {
  try {
    const response = await axiosInstance.post('/api/quit-plans/create', planData, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach updates a quit plan
 * Endpoint: PUT /api/quit-plans/update
 * Summary: Coach updates a quit plan using the newest plan
 */
export const updateQuitPlan = async (planId, planData) => {
  try {
    const response = await axiosInstance.put('/api/quit-plans/update', planData, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get member's newest quit plan
 * Endpoint: GET /api/quit-plans/newest
 * Summary: Coach / Member get the member's newest quit plan
 */
export const getNewestQuitPlan = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/quit-plans/newest', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get member's old quit plans (paginated)
 * Endpoint: GET /api/quit-plans/olds
 * Summary: Member / Coach get the member's old quit plans
 */
export const getOldQuitPlans = async (memberId, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/api/quit-plans/olds', {
      params: { memberId, page, size }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Member accepts a quit plan
 * Endpoint: PATCH /api/quit-plans/accept
 * Summary: Member accept quit plan after coach creates it
 */
export const acceptQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch('/api/quit-plans/accept', null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Member denies a quit plan
 * Endpoint: PATCH /api/quit-plans/deny
 * Summary: Member deny quit plan after coach creates it
 */
export const denyQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch('/api/quit-plans/deny', null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach disables a quit plan
 * Endpoint: PATCH /api/quit-plans/disable
 * Summary: Coach disables the quit plan when member finds it unsuitable
 */
export const disableQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch('/api/quit-plans/disable', null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach marks quit plan as completed
 * Endpoint: PATCH /api/quit-plans/finish
 * Summary: Coach marks the quit plan as completed with final note
 */
export const finishQuitPlan = async (planId, note = '') => {
  try {
    const response = await axiosInstance.patch('/api/quit-plans/finish', null, {
      params: { planId, note }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// QUIT PHASES MANAGEMENT
// ========================

/**
 * Get default phases based on addiction level
 * Endpoint: GET /api/quit-phases/default
 * Summary: Coach retrieves default phase list based on AddictionLevel
 */
export const getDefaultPhases = async (addictionLevel) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/default', {
      params: { addictionLevel }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get phases from a specific quit plan
 * Endpoint: GET /api/quit-phases/from-plan
 * Summary: Member / Coach retrieves the list of phases from a specific quit plan
 */
export const getPhasesFromPlan = async (quitPlanId) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/from-plan', {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach creates goals for phases
 * Endpoint: POST /api/quit-phases/default/create-goals
 * Summary: Coach enters goals into phase templates
 */
export const createPhaseGoals = async (quitPlanId, phasesData) => {
  try {
    const response = await axiosInstance.post('/api/quit-phases/default/create-goals', phasesData, {
      params: { quitPlanId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// QNA MANAGEMENT
// ========================

/**
 * Member asks a question
 * Endpoint: POST /api/qna/ask
 * Summary: Member Ask a question
 */
export const askQuestion = async (question) => {
  try {
    const response = await axiosInstance.post('/api/qna/ask', null, {
      params: { question }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach answers a question
 * Endpoint: POST /api/qna/answer
 * Summary: Coach Answer a question
 */
export const answerQuestion = async (qnaId, answer) => {
  try {
    const response = await axiosInstance.post('/api/qna/answer', null, {
      params: { qnaId, answer }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get unanswered Q&A (paginated)
 * Endpoint: GET /api/qna/unanswered
 * Summary: Coach get all unanswered QnA
 */
export const getUnansweredQna = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/qna/unanswered', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Member gets their Q&As (paginated)
 * Endpoint: GET /api/qna/mine
 * Summary: Member gets 'my' Q&As
 */
export const getMyQna = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/qna/mine', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// NOTIFICATION MANAGEMENT
// ========================

/**
 * Get all notifications (paginated)
 * Endpoint: GET /api/notifications/all
 * Summary: Get all notifications for a user
 */
export const getAllNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/all', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get unread notifications (paginated)
 * Endpoint: GET /api/notifications/unread
 * Summary: Get unread notifications for a user
 */
export const getUnreadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/unread', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get read notifications (paginated)
 * Endpoint: GET /api/notifications/read
 * Summary: Get read notifications for a user
 */
export const getReadNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/read', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get important notifications (paginated)
 * Endpoint: GET /api/notifications/important
 * Summary: Get important notifications for a user
 */
export const getImportantNotifications = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await axiosInstance.get('/api/notifications/important', {
      params: { pageNo, pageSize }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark notification as read
 * Endpoint: PATCH /api/notifications/mark-read
 * Summary: Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch('/api/notifications/mark-read', null, {
      params: { notificationId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// FEEDBACK MANAGEMENT
// ========================

/**
 * Submit feedback to coach
 * Endpoint: POST /api/feedbacks/submit/my-coach
 * Summary: Member submits feedback to their coach
 */
export const submitFeedbackToCoach = async (feedbackData) => {
  try {
    const response = await axiosInstance.post('/api/feedbacks/submit/my-coach', feedbackData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Submit feedback to platform
 * Endpoint: POST /api/feedbacks/submit/platform
 * Summary: Member submits feedback to the platform
 */
export const submitFeedbackToPlatform = async (feedbackData) => {
  try {
    const response = await axiosInstance.post('/api/feedbacks/submit/platform', feedbackData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get published feedbacks
 * Endpoint: GET /api/feedbacks/published
 * Summary: Retrieve feedback that has been approved and published
 */
export const getPublishedFeedbacks = async () => {
  try {
    const response = await axiosInstance.get('/api/feedbacks/published');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get feedbacks for a coach
 * Endpoint: GET /api/feedbacks/of-a-coach
 * Summary: Member / Coach view all feedback of a coach
 */
export const getFeedbacksForCoach = async (coachId) => {
  try {
    const response = await axiosInstance.get('/api/feedbacks/of-a-coach', {
      params: { coachId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all unreviewed feedbacks (admin only)
 * Endpoint: GET /api/feedbacks/all/unreviewed
 * Summary: Admin retrieves all unreviewed feedbacks for approval
 */
export const getAllUnreviewedFeedbacks = async () => {
  try {
    const response = await axiosInstance.get('/api/feedbacks/all/unreviewed');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Approve and publish feedback (admin only)
 * Endpoint: PATCH /api/feedbacks/approve-publish
 * Summary: Admin approves and publishes feedback
 */
export const approveFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch('/api/feedbacks/approve-publish', null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Hide feedback (admin only)
 * Endpoint: PATCH /api/feedbacks/hide
 * Summary: Admin hides feedback from public display
 */
export const hideFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch('/api/feedbacks/hide', null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark feedback as reviewed (admin only)
 * Endpoint: PATCH /api/feedbacks/reviewed
 * Summary: Admin marks feedback as reviewed
 */
export const markFeedbackReviewed = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch('/api/feedbacks/reviewed', null, {
      params: { feedbackId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// DAILY LOG MANAGEMENT
// ========================

/**
 * Create a daily log
 * Endpoint: POST /api/daily-logs
 * Summary: Member Create a daily log
 */
export const createDailyLog = async (logData) => {
  try {
    const response = await axiosInstance.post('/api/daily-logs', logData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get member daily logs
 * Endpoint: GET /api/daily-logs/member
 * Summary: Member get all / Coach get all daily logs of the assigned member
 */
export const getMemberDailyLogs = async (memberId) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member', {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get member daily log by date
 * Endpoint: GET /api/daily-logs/member/date
 * Summary: Member / Coach get assigned member's daily log by date
 */
export const getMemberDailyLogByDate = async (memberId, date) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/member/date', {
      params: { memberId, date }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get daily logs by phase
 * Endpoint: GET /api/daily-logs/byPhase
 * Summary: Member / Coach view list daily logs by phase
 */
export const getDailyLogsByPhase = async (phaseId) => {
  try {
    const response = await axiosInstance.get('/api/daily-logs/byPhase', {
      params: { phaseId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// DASHBOARD STATISTICS
// ========================

/**
 * Get dashboard statistics
 * Endpoint: GET /api/dashboard/stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// CHAT ROOM MANAGEMENT
// ========================

/**
 * Get all private chat rooms
 * Endpoint: GET /chat/rooms/private
 * Summary: Coach / Member get all their private rooms
 */
export const getAllPrivateChatRooms = async () => {
  try {
    const response = await axiosInstance.get('/chat/rooms/private');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get chat room messages
 * Endpoint: GET /chat/rooms/{roomId}/messages
 * Summary: Open chat room --> Get all messages
 */
export const getChatRoomMessages = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete chat message
 * Endpoint: DELETE /chat/delete/message
 * Summary: Coach / Member delete a chat message
 */
export const deleteChatMessage = async (senderId, messageId) => {
  try {
    const response = await axiosInstance.delete('/chat/delete/message', {
      params: { senderId, messageId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get WebSocket channels documentation
 * Endpoint: GET /chat/ws-channels
 * Summary: WebSocket Channels Documentation
 */
export const getWebSocketChannelsDoc = async () => {
  try {
    const response = await axiosInstance.get('/chat/ws-channels');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// AUTHENTICATION
// ========================

/**
 * Send password reset OTP
 * Endpoint: GET /auth/send-reset-otp
 * Summary: Send password reset OTP
 */
export const sendResetOtp = async (email) => {
  try {
    const response = await axiosInstance.get('/auth/send-reset-otp', {
      params: { email }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Reset password with OTP
 * Endpoint: PATCH /auth/reset-password
 * Summary: Reset password using OTP
 */
export const resetPassword = async (email, otpInput, newPassword) => {
  try {
    const response = await axiosInstance.patch('/auth/reset-password', null, {
      params: { email, otpInput, newPassword }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get tester accounts
 * Endpoint: GET /auth/get-testers
 * Summary: Get tester accounts for admin, coach, and members
 */
export const getTesters = async () => {
  try {
    const response = await axiosInstance.get('/auth/get-testers');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * User login
 * Endpoint: POST /auth/login
 * Summary: Login and return JWT token
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * User registration
 * Endpoint: POST /auth/register
 * Summary: Register a new user (member only)
 */
export const register = async (registrationData) => {
  try {
    const response = await axiosInstance.post('/auth/register', registrationData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get profile image by user ID
 * Endpoint: GET /profile/image
 * Summary: Retrieve profile image for a user
 */
export const getProfileImage = async (userId) => {
  try {
    const response = await axiosInstance.get('/profile/image', {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload profile image for a user
 * Endpoint: POST /profile/image
 * Params: userId, image (multipart file)
 */
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('image', imageFile);

    const response = await axiosInstance.patch('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * User logout
 * Endpoint: POST /auth/logout
 * Summary: Logout current user
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// LEGACY COMPATIBILITY
// ========================

// Alias for backward compatibility
export const getMemberProfile = getMyProfile;
export const updateMemberProfile = updateMyProfile;
export const upgradeToPremium = () => {
  console.warn('upgradeToPremium: Use payment service for premium upgrade functionality');
  throw new Error('Use payment service for premium upgrade functionality');
};

// Export all functions as default for easy importing
export default {
  // Profile Management
  getMyProfile,
  updateMyProfile,
  getCoachProfile,
  updateCoachProfile,
  
  // Coach Management
  getAllCoaches,
  createCoach,
  chooseCoach,
  getAssignedMembers,
  cancelCoach,
  
  // User Management
  getAllUsers,
  disableUser,
  reEnableUser,
  reportCoachAbsent,
  
  // Member Smoking Status
  createMemberSmokingStatus,
  getLatestMemberSmokingStatus,
  updateLatestSmokingStatus,
  
  // Payment Management
  createVnPayPayment,
  handleVnPayReturn,
  getMyTransactions,
  
  // Reminder Management
  getAllReminders,
  createReminder,
  updateReminder,
  disableReminder,
  reEnableReminder,
  
  // Quit Plan Management
  createQuitPlan,
  updateQuitPlan,
  getNewestQuitPlan,
  getOldQuitPlans,
  acceptQuitPlan,
  denyQuitPlan,
  disableQuitPlan,
  finishQuitPlan,
  
  // Quit Phases Management
  getDefaultPhases,
  getPhasesFromPlan,
  createPhaseGoals,
  
  // QNA Management
  askQuestion,
  answerQuestion,
  getUnansweredQna,
  getMyQna,
  
  // Notification Management
  getAllNotifications,
  getUnreadNotifications,
  getReadNotifications,
  getImportantNotifications,
  markNotificationAsRead,
  
  // Feedback Management
  submitFeedbackToCoach,
  submitFeedbackToPlatform,
  getPublishedFeedbacks,
  getFeedbacksForCoach,
  getAllUnreviewedFeedbacks,
  approveFeedback,
  hideFeedback,
  markFeedbackReviewed,
  
  // Daily Log Management
  createDailyLog,
  getMemberDailyLogs,
  getMemberDailyLogByDate,
  getDailyLogsByPhase,
  
  // Dashboard Statistics
  getDashboardStats,
  
  // Chat Room Management
  getAllPrivateChatRooms,
  getChatRoomMessages,
  deleteChatMessage,
  getWebSocketChannelsDoc,
  
  // Authentication
  sendResetOtp,
  resetPassword,
  getTesters,
  login,
  register,
  logout,
  
  // Legacy compatibility
  getMemberProfile,
  updateMemberProfile
};
