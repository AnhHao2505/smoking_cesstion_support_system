import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Mock data for quit plan creation

// Get available coaches
export const getAvailableCoaches = () => {
  return [
    {
      coach_id: 1,
      user_id: 10,
      full_name: "Dr. Sarah Johnson",
      specialty: "Behavioral Psychology",
      qualification: "Ph.D in Clinical Psychology",
      bio: "Specialized in smoking cessation using cognitive-behavioral techniques",
      rating: 4.8,
      photo_url: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      coach_id: 2,
      user_id: 11,
      full_name: "Dr. Michael Chen",
      specialty: "Addiction Medicine",
      qualification: "MD, Certified in Addiction Medicine",
      bio: "Focused on medical approaches to nicotine withdrawal management",
      rating: 4.6,
      photo_url: "https://randomuser.me/api/portraits/men/42.jpg"
    },
    {
      coach_id: 3,
      user_id: 12,
      full_name: "Nguyễn Thị Hương",
      specialty: "Health Psychology",
      qualification: "M.Sc in Health Psychology",
      bio: "Specialized in lifestyle modifications and stress management techniques",
      rating: 4.7,
      photo_url: "https://randomuser.me/api/portraits/women/32.jpg"
    }
  ];
};

// Get default phases for a quit plan
export const getDefaultQuitPhases = () => {
  return [
    {
      phase_name: "Chuẩn bị",
      phase_order: 1,
      objective: "Chuẩn bị tâm lý và thể chất cho ngày bỏ thuốc",
      is_completed: false
    },
    {
      phase_name: "Hành động",
      phase_order: 2,
      objective: "Thực hiện các chiến lược để duy trì không hút thuốc",
      is_completed: false
    },
    {
      phase_name: "Duy trì",
      phase_order: 3,
      objective: "Củng cố cam kết và phòng ngừa tái nghiện",
      is_completed: false
    },
    {
      phase_name: "Kết thúc",
      phase_order: 4,
      objective: "Hoàn thành quá trình cai thuốc, xây dựng lối sống không thuốc lá",
      is_completed: false
    }
  ];
};

// Get common smoking circumstances
export const getSmokingCircumstances = () => {
  return [
    { id: 1, name: "Stress và lo âu" },
    { id: 2, name: "Hoạt động xã hội" },
    { id: 3, name: "Sau ăn" },
    { id: 4, name: "Uống cà phê hoặc rượu" },
    { id: 5, name: "Thói quen buổi sáng" },
    { id: 6, name: "Khi lái xe" },
    { id: 7, name: "Giải lao công việc" }
  ];
};

// Get suggested strategies
export const getSuggestedStrategies = () => {
  return [
    "Liệu pháp thay thế nicotine (NRT)",
    "Kỹ thuật thư giãn và giảm căng thẳng",
    "Tập thể dục thường xuyên",
    "Tránh các tác nhân kích thích",
    "Kỹ thuật thiền chánh niệm",
    "Tham gia nhóm hỗ trợ",
    "Thay đổi thói quen hàng ngày"
  ];
};

// Get common medications
export const getSuggestedMedications = () => {
  return [
    "Miếng dán nicotine",
    "Kẹo cao su nicotine",
    "Xịt mũi nicotine",
    "Thuốc Bupropion (Zyban)",
    "Thuốc Varenicline (Champix/Chantix)"
  ];
};

// Real API functions for quit plan operations

// Create a new quit plan - Updated to match new API
export const createQuitPlan = async (memberId, quitPlanData) => {
  try {
    const response = await axiosInstance.post('/api/quit-plans/create', quitPlanData, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update quit plan by coach - Updated to match new API
export const updateQuitPlanByCoach = async (planId, quitPlanData) => {
  try {
    const response = await axiosInstance.put('/api/quit-plans/update', quitPlanData, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get newest quit plan of member - Updated to match new API
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
 * Get old plans of a member (paginated)
 * Member / Coach lấy danh sách kế hoạch cũ của member
 */
export const getOldPlansOfMember = async (memberId, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/api/quit-plans/olds', {
      params: { memberId, page, size }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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

// Get quit plan detail - using newest plan as there's no direct endpoint for plan by ID
export const getQuitPlanDetail = async (planId) => {
  try {
    // Since there's no direct endpoint for plan by ID in the API spec, 
    // we'll need to use the newest plan or implement a workaround
    console.warn('No direct endpoint for plan by ID, this would need to be implemented based on business logic');
    return {
      success: true,
      data: getQuitPlanDetailMock(planId)
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Alias for backward compatibility
export const getQuitPlanByPlanId = getQuitPlanDetail;

// Mock function for quit plan detail (keeping for backward compatibility)
const getQuitPlanDetailMock = (planId) => {
  return {
    quit_plan_id: planId,
    user_id: 101,
    coach_id: 1,
    coach_name: "Dr. Sarah Johnson",
    coach_photo: "https://randomuser.me/api/portraits/women/45.jpg",
    circumstance_id: 2,
    circumstance_name: "Social Activities",
    start_date: "2025-04-01",
    end_date: "2025-07-01",
    strategies_to_use: "Nicotine replacement therapy, daily exercise, mindfulness meditation",
    medications_to_use: "Nicotine patches, gum as needed",
    medication_instructions: "Apply patch every morning. Use gum when experiencing strong cravings (max 8 pieces per day).",
    preparation_steps: "Remove all cigarettes and smoking accessories from home and workplace. Inform friends and family about quit date and ask for support. Stock up on healthy snacks and water.",
    note: "This plan was created after previous attempt failed due to stress at work. Special focus on stress management techniques.",
    status: true,
    quit_phases: [
      {
        quit_phase_id: 2,
        phase_name: "Preparation",
        phase_order: 1,
        start_date: "2025-04-01",
        end_date: "2025-04-14",
        is_completed: true,
        objective: "Prepare for quit day and gather necessary resources"
      },
      {
        quit_phase_id: 3,
        phase_name: "Action",
        phase_order: 2,
        start_date: "2025-04-15",
        end_date: "2025-05-30",
        is_completed: false,
        objective: "Implement strategies to manage cravings and maintain abstinence"
      },
      {
        quit_phase_id: 4,
        phase_name: "Maintenance",
        phase_order: 3,
        start_date: "2025-06-01",
        end_date: "2025-07-01",
        is_completed: false,
        objective: "Strengthen commitment and develop long-term strategies"
      }
    ],
    current_phase: {
      quit_phase_id: 3,
      phase_name: "Action",
      phase_order: 2,
      start_date: "2025-04-15",
      is_completed: false,
      objective: "Implement strategies to manage cravings and maintain abstinence"
    }
  };
};

// Coach disables a quit plan - Updated to match new API
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

// Member accepts a quit plan - Updated to match new API
export const acceptQuitPlan = async (planId) => {
  try {
    console.log('Accepting quit plan with ID:', planId);
    const response = await axiosInstance.patch('/api/quit-plans/accept', null, {
      params: { planId }
    });
    console.log('Accept quit plan response:', response);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error accepting quit plan:', error);
    throw handleApiError(error);
  }
};

// Member denies a quit plan - Updated to match new API with feedback support
export const denyQuitPlan = async (planId, feedbackData = null) => {
  try {
    console.log('Denying quit plan with ID:', planId, 'Feedback:', feedbackData);
    
    let requestBody = null;
    let requestParams = { planId };
    
    // If feedback is provided, include it in the request
    if (feedbackData && feedbackData.feedback) {
      // Try sending feedback as request body first
      requestBody = { feedback: feedbackData.feedback };
      // Also try as query parameter in case API expects it there
      requestParams.feedback = feedbackData.feedback;
    }
    
    const response = await axiosInstance.patch('/api/quit-plans/deny', requestBody, {
      params: requestParams
    });
    console.log('Deny quit plan response:', response);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error denying quit plan:', error);
    throw handleApiError(error);
  }
};

// Get all plans created by coach - NOT AVAILABLE IN API, using mock
export const getAllPlanCreatedByCoach = async (coachId) => {
  try {
    console.warn('Coach plans endpoint not available in API specification');
    // Return mock data for development
    return {
      success: true,
      data: []
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// ========================
// WORKFLOW HELPER FUNCTIONS
// ========================

/**
 * Check if a quit plan can be accepted/denied by member
 * @param {Object} quitPlan - The quit plan object
 * @returns {Object} - Object with canAccept and canDeny flags
 */
export const checkPlanActionAvailability = (quitPlan) => {
  if (!quitPlan) return { canAccept: false, canDeny: false };
  
  const status = quitPlan.quitPlanStatus || quitPlan.status;
  const isPendingApproval = status === 'PENDING_APPROVAL' || status === 'CREATED' || status === 'pending';
  
  return {
    canAccept: isPendingApproval,
    canDeny: isPendingApproval,
    status: status
  };
};

/**
 * Get user-friendly status text for quit plan
 * @param {string} status - The plan status
 * @returns {string} - User-friendly status text
 */
export const getQuitPlanStatusText = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING_APPROVAL':
    case 'CREATED':
      return 'Chờ phê duyệt';
    case 'ACTIVE':
      return 'Đang hoạt động';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'DENIED':
      return 'Từ chối';
    case 'CANCELLED':
    case 'DISABLED':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

/**
 * Get status color for UI display
 * @param {string} status - The plan status
 * @returns {string} - Ant Design color name
 */
export const getQuitPlanStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING_APPROVAL':
    case 'CREATED':
      return 'orange';
    case 'ACTIVE':
      return 'green';
    case 'COMPLETED':
      return 'blue';
    case 'DENIED':
      return 'red';
    case 'CANCELLED':
    case 'DISABLED':
      return 'gray';
    default:
      return 'default';
  }
};

/**
 * Format quit plan data for display in member workflow
 * @param {Object} planData - Raw plan data from API
 * @returns {Object} - Formatted plan data
 */
export const formatQuitPlanForMember = (planData) => {
  if (!planData) return null;
  
  return {
    ...planData,
    quit_plan_id: planData.id || planData.quit_plan_id,
    member_id: planData.memberId || planData.member_id,
    coach_id: planData.coachId || planData.coach_id,
    coach_name: planData.coachName || planData.coach_name,
    status: planData.quitPlanStatus || planData.status,
    start_date: planData.startDate || planData.start_date,
    end_date: planData.endDate || planData.end_date,
    created_at: planData.startDate || planData.created_at,
    
    // Content fields
    motivation: planData.motivation,
    triggers: planData.smokingTriggersToAvoid || planData.triggers,
    strategies: planData.copingStrategies || planData.strategies_to_use,
    medications: planData.medicationsToUse || planData.medications_to_use,
    medication_instructions: planData.medicationInstructions || planData.medication_instructions,
    preparation_steps: planData.relapsePreventionStrategies || planData.preparation_steps,
    support_resources: planData.supportResources || planData.support_resources,
    reward_plan: planData.rewardPlan || planData.reward_plan,
    notes: planData.additionalNotes || planData.note || planData.notes,
    
    // Status helpers
    ...checkPlanActionAvailability(planData),
    statusText: getQuitPlanStatusText(planData.quitPlanStatus || planData.status),
    statusColor: getQuitPlanStatusColor(planData.quitPlanStatus || planData.status)
  };
};

/**
 * Get member's quit plan with action availability check
 * @param {string} memberId - Member ID
 * @returns {Object} - Formatted quit plan with action flags
 */
export const getMemberQuitPlanWithActions = async (memberId) => {
  try {
    console.log('Getting member quit plan with actions for member:', memberId);
    const response = await getNewestQuitPlan(memberId);
    return handleApiResponse(response)
  } catch (error) {
    console.error('Error getting member quit plan with actions:', error);
    throw handleApiError(error);
  }
};

/**
 * Process member action on quit plan (accept/deny)
 * @param {string} planId - Plan ID
 * @param {string} action - 'accept' or 'deny'
 * @param {Object} options - Additional options (feedback for deny)
 * @returns {Object} - Action result
 */
export const processMemberQuitPlanAction = async (planId, action, options = {}) => {
  try {
    console.log(`Processing member action: ${action} on plan:`, planId, 'Options:', options);
    
    let response;
    switch (action.toLowerCase()) {
      case 'accept':
        response = await acceptQuitPlan(planId);
        break;
      case 'deny':
        response = await denyQuitPlan(planId, options);
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }
    
    console.log(`${action} action result:`, response);
    return response;
  } catch (error) {
    console.error(`Error processing ${action} action:`, error);
    throw handleApiError(error);
  }
};

// ========================
// COACH WORKFLOW FUNCTIONS
// ========================

/**
 * Coach creates quit plan for member with validation
 * @param {string} memberId - Member ID
 * @param {Object} planData - Plan data
 * @param {Object} phaseData - Phase goals data (optional)
 * @returns {Object} - Creation result
 */
export const createQuitPlanForMember = async (memberId, planData, phaseData = null) => {
  try {
    console.log('Coach creating quit plan for member:', memberId, 'Plan data:', planData);
    
    // Validate required fields
    const requiredFields = ['motivation', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !planData[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    // Create the quit plan
    const createResponse = await createQuitPlan(memberId, planData);
    console.log('Create quit plan response:', createResponse);
    
    if (createResponse.success && phaseData && createResponse.data?.planId) {
      // If phase data is provided, create phase goals
      try {
        const { createGoalsOfPhases } = await import('./phaseService');
        await createGoalsOfPhases(createResponse.data.planId, phaseData);
        console.log('Phase goals created successfully');
      } catch (phaseError) {
        console.warn('Failed to create phase goals:', phaseError);
        // Don't fail the entire operation if phase creation fails
      }
    }
    
    return createResponse;
  } catch (error) {
    console.error('Error creating quit plan for member:', error);
    throw handleApiError(error);
  }
};

/**
 * Get formatted quit plan data for coach view
 * @param {Object} planData - Raw plan data
 * @returns {Object} - Formatted plan data for coach
 */
export const formatQuitPlanForCoach = (planData) => {
  if (!planData) return null;
  
  const formatted = formatQuitPlanForMember(planData);
  
  return {
    ...formatted,
    // Add coach-specific fields
    canEdit: formatted.status === 'PENDING_APPROVAL' || formatted.status === 'ACTIVE',
    canFinish: formatted.status === 'ACTIVE',
    canDisable: formatted.status === 'ACTIVE' || formatted.status === 'PENDING_APPROVAL',
    
    // Coach action helpers
    isWaitingForMemberResponse: formatted.status === 'PENDING_APPROVAL' || formatted.status === 'CREATED',
    isMemberApproved: formatted.status === 'ACTIVE',
    isMemberDenied: formatted.status === 'DENIED'
  };
};

/**
 * Get notification message for plan status
 * @param {string} status - Plan status
 * @param {boolean} isCoach - Whether the user is a coach
 * @returns {Object} - Notification object with type and message
 */
export const getQuitPlanNotification = (status, isCoach = false) => {
  const notifications = {
    coach: {
      'PENDING_APPROVAL': {
        type: 'info',
        message: 'Kế hoạch đã được tạo và đang chờ thành viên phê duyệt'
      },
      'ACTIVE': {
        type: 'success',
        message: 'Thành viên đã chấp nhận kế hoạch và bắt đầu hành trình cai thuốc'
      },
      'DENIED': {
        type: 'warning',
        message: 'Thành viên đã từ chối kế hoạch này. Vui lòng tạo kế hoạch mới.'
      },
      'COMPLETED': {
        type: 'success',
        message: 'Kế hoạch đã hoàn thành thành công!'
      }
    },
    member: {
      'PENDING_APPROVAL': {
        type: 'info',
        message: 'Huấn luyện viên đã tạo kế hoạch mới cho bạn. Vui lòng xem xét và phê duyệt.'
      },
      'ACTIVE': {
        type: 'success',
        message: 'Bạn đã chấp nhận kế hoạch. Hãy bắt đầu hành trình cai thuốc!'
      },
      'DENIED': {
        type: 'info',
        message: 'Bạn đã từ chối kế hoạch này. Huấn luyện viên sẽ tạo kế hoạch mới.'
      },
      'COMPLETED': {
        type: 'success',
        message: 'Chúc mừng! Bạn đã hoàn thành kế hoạch cai thuốc!'
      }
    }
  };
  
  const userType = isCoach ? 'coach' : 'member';
  return notifications[userType][status] || {
    type: 'default',
    message: 'Trạng thái kế hoạch: ' + getQuitPlanStatusText(status)
  };
};

// ========================
// VALIDATION & UTILITY FUNCTIONS
// ========================

/**
 * Validate quit plan data before creation
 * @param {Object} planData - Plan data to validate
 * @returns {Object} - Validation result
 */
export const validateQuitPlanData = (planData) => {
  const errors = [];
  const warnings = [];
  
  // Required field validation
  if (!planData.motivation || planData.motivation.trim().length < 10) {
    errors.push('Động lực cai thuốc phải có ít nhất 10 ký tự');
  }
  
  if (!planData.startDate) {
    errors.push('Ngày bắt đầu là bắt buộc');
  }
  
  if (!planData.endDate) {
    errors.push('Ngày kết thúc là bắt buộc');
  }
  
  // Date validation
  if (planData.startDate && planData.endDate) {
    const startDate = new Date(planData.startDate);
    const endDate = new Date(planData.endDate);
    const today = new Date();
    
    if (startDate < today) {
      warnings.push('Ngày bắt đầu nên là ngày hôm nay hoặc trong tương lai');
    }
    
    if (endDate <= startDate) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu');
    }
    
    const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (durationDays < 7) {
      warnings.push('Kế hoạch quá ngắn (dưới 1 tuần). Khuyến nghị ít nhất 4-12 tuần.');
    } else if (durationDays > 365) {
      warnings.push('Kế hoạch quá dài (trên 1 năm). Khuyến nghị từ 4-12 tuần.');
    }
  }
  
  // Content validation
  if (!planData.copingStrategies && !planData.strategies_to_use) {
    warnings.push('Nên có ít nhất một chiến lược đối phó với cơn thèm');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generate summary for quit plan
 * @param {Object} quitPlan - The quit plan object
 * @returns {Object} - Plan summary
 */
export const generateQuitPlanSummary = (quitPlan) => {
  if (!quitPlan) return null;
  
  const startDate = new Date(quitPlan.start_date || quitPlan.startDate);
  const endDate = new Date(quitPlan.end_date || quitPlan.endDate);
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  return {
    planId: quitPlan.quit_plan_id || quitPlan.id,
    memberName: quitPlan.memberName || quitPlan.member_name,
    coachName: quitPlan.coachName || quitPlan.coach_name,
    status: quitPlan.status || quitPlan.quitPlanStatus,
    statusText: getQuitPlanStatusText(quitPlan.status || quitPlan.quitPlanStatus),
    statusColor: getQuitPlanStatusColor(quitPlan.status || quitPlan.quitPlanStatus),
    duration: {
      days: durationDays,
      weeks: Math.ceil(durationDays / 7),
      text: durationDays <= 7 ? `${durationDays} ngày` : `${Math.ceil(durationDays / 7)} tuần`
    },
    startDate: startDate.toLocaleDateString('vi-VN'),
    endDate: endDate.toLocaleDateString('vi-VN'),
    hasStrategies: !!(quitPlan.copingStrategies || quitPlan.strategies_to_use),
    hasMedications: !!(quitPlan.medicationsToUse || quitPlan.medications_to_use),
    hasPreparationSteps: !!(quitPlan.relapsePreventionStrategies || quitPlan.preparation_steps)
  };
};

/**
 * Check if user has permission to perform action on quit plan
 * @param {Object} quitPlan - The quit plan
 * @param {Object} user - Current user
 * @param {string} action - Action to perform
 * @returns {boolean} - Whether user has permission
 */
export const checkQuitPlanPermission = (quitPlan, user, action) => {
  if (!quitPlan || !user) return false;
  
  const userRole = user.role?.toLowerCase();
  const userId = user.userId || user.id;
  const isOwner = userId === (quitPlan.member_id || quitPlan.memberId);
  const isAssignedCoach = userId === (quitPlan.coach_id || quitPlan.coachId);
  
  switch (action.toLowerCase()) {
    case 'accept':
    case 'deny':
      return userRole === 'member' && isOwner;
    
    case 'create':
    case 'update':
    case 'finish':
    case 'disable':
      return userRole === 'coach' && isAssignedCoach;
    
    case 'view':
      return isOwner || isAssignedCoach || userRole === 'admin';
    
    default:
      return false;
  }
};

// Export workflow constants
export const QUIT_PLAN_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DENIED: 'DENIED',
  CANCELLED: 'CANCELLED',
  DISABLED: 'DISABLED'
};

export const QUIT_PLAN_ACTIONS = {
  ACCEPT: 'accept',
  DENY: 'deny',
  UPDATE: 'update',
  FINISH: 'finish',
  DISABLE: 'disable'
};

// Export all functions for easy access
export const quitPlanWorkflow = {
  // Core API functions
  createQuitPlan,
  updateQuitPlanByCoach,
  getNewestQuitPlan,
  acceptQuitPlan,
  denyQuitPlan,
  finishQuitPlan,
  disableQuitPlan,
  
  // Enhanced workflow functions
  createQuitPlanForMember,
  getMemberQuitPlanWithActions,
  processMemberQuitPlanAction,
  
  // Formatting and utility
  formatQuitPlanForMember,
  formatQuitPlanForCoach,
  generateQuitPlanSummary,
  
  // Validation and permissions
  validateQuitPlanData,
  checkQuitPlanPermission,
  checkPlanActionAvailability,
  
  // UI helpers
  getQuitPlanStatusText,
  getQuitPlanStatusColor,
  getQuitPlanNotification,
  
  // Constants
  STATUS: QUIT_PLAN_STATUS,
  ACTIONS: QUIT_PLAN_ACTIONS
};