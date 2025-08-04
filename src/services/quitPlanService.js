import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get common smoking circumstances for UI selection
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

// Get suggested strategies for UI selection
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

// Get common medications for UI selection
export const getSuggestedMedications = () => {
  return [
    "Miếng dán nicotine",
    "Kẹo cao su nicotine",
    "Xịt mũi nicotine",
    "Thuốc Bupropion (Zyban)",
    "Thuốc Varenicline (Champix/Chantix)"
  ];
};

// ========================
// REAL API FUNCTIONS - ALIGNED WITH BACKEND
// ========================

// Notes: Tui đã bỏ phần deny plan + final evaluation vì không cần thiết show đên mức độ hoàn thành của plan 
// Nhớ fix nút "Xem kế hoạch hiện tại" trong CoachDashboard nha

/*
/
/ Normal Flow:
/ Steps:
/   1. Member tự tạo kế hoạch cai thuốc lá (/api/quit-plans/create-by-member)
/   2. Member tiến hành kế hoạch cai thuốc của chính mình đến kết thúc
/   3. Member kiểm tra lại plan mới NEWEST hoặc OLDs. (/api/quit-plans/olds) && (/api/quit-plans/newest)
/ 
/ Alternative Flow:
/ A. Member không tự tạo kế hoạch (COACH tạo kế hoạch) (nguồn gốc: step 1 của normal flow)
/   Steps:
/     1. Member yêu cầu coach tạo kế hoạch cai thuốc lá (/api/quit-plans/request)
/     2. Coach tạo kế hoạch cai thuốc lá cho member (/api/quit-plans/coach/create)
/     3. Member chấp nhận và xác định ngày bắt đầu (/api/quit-plans/accept-plan)
/     4. Back to step 2 of normal flow
/ B. Member edit kế hoạch cai thuốc lá của chính mình (nguồn gốc: step 2 của normal flow)
/   Steps:
/     1. Member kiểm tra xem mình có thể chỉnh sửa kế hoạch cai thuốc hay không (/api/quit-plans/can-self-adjust)
/     2. Member chỉnh sửa kế hoạch cai thuốc lá của chính mình (/api/quit-plans/self-adjust)
/     3. Back to step 2 of normal flow
/
*/

// Missing "Thành viên tự tạo kế hoạch cai thuốc" endpoint --> /api/quit-plans/create-by-member
// Missing "Kiểm tra thành viên còn có thể edit kế hoạch cai thuốc hay không" endpoint 
// --> /api/quit-plans/can-self-adjust
// Missing "Thành viên edit kế hoạch cai thuốc" endpoint --> /api/quit-plans/self-adjust

/**
 * Coach creates quit plan for member
 * POST /api/quit-plans/coach/create
 */
export const createQuitPlan = async (memberId, quitPlanData) => {
  try {
    console.log('Creating quit plan for member:', memberId, 'Data:', quitPlanData);
    const response = await axiosInstance.post('/api/quit-plans/coach/create', quitPlanData, {
      params: { memberId }
    });
    console.log('Create quit plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error creating quit plan:', error);
    throw handleApiError(error);
  }
};

/**
 * Member requests quit plan creation from coach
 * POST /api/quit-plans/request
 */
export const requestQuitPlan = async () => {
  try {
    console.log('Member requesting quit plan creation');
    const response = await axiosInstance.post('/api/quit-plans/request');
    console.log('Request quit plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error requesting quit plan:', error);
    throw handleApiError(error);
  }
};

/**
 * Get newest quit plan (for authenticated user)
 * GET /api/quit-plans/newest
 */
export const getNewestQuitPlan = async () => {
  try {
    console.log('Getting newest quit plan');
    const response = await axiosInstance.get('/api/quit-plans/newest');
    console.log('Get newest quit plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error getting newest quit plan:', error);
    throw handleApiError(error);
  }
};

/**
 * Get old plans of authenticated member (paginated)
 * GET /api/quit-plans/olds
 */
export const getOldPlansOfMember = async (page = 0, size = 10) => {
  try {
    console.log('Getting old plans, page:', page, 'size:', size);
    const response = await axiosInstance.get('/api/quit-plans/olds', {
      params: { page, size }
    });
    console.log('Get old plans response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error getting old plans:', error);
    throw handleApiError(error);
  }
};

/**
 * Member accepts a quit plan
 * PATCH /api/quit-plans/accept-plan
 */
export const acceptQuitPlan = async (planId, startDate) => {
  try {
    console.log('Accepting quit plan:', planId, 'Start date:', startDate);
    const response = await axiosInstance.patch('/api/quit-plans/accept-plan', startDate, {
      params: { planId }
    });
    console.log('Accept quit plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error accepting quit plan:', error);
    throw handleApiError(error);
  }
};

/**
 * Member denies a quit plan
 * PATCH /api/quit-plans/deny
 */
export const denyQuitPlan = async (planId) => {
  try {
    console.log('Denying quit plan:', planId);
    const response = await axiosInstance.patch('/api/quit-plans/deny', null, {
      params: { planId }
    });
    console.log('Deny quit plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error denying quit plan:', error);
    throw handleApiError(error);
  }
};

/**
 * Coach adds final evaluation to completed plan
 * PATCH /api/quit-plans/final-evaluation
 */
export const addFinalEvaluation = async (planId, finalEvaluation) => {
  try {
    console.log('Adding final evaluation to plan:', planId, 'Evaluation:', finalEvaluation);
    const response = await axiosInstance.patch('/api/quit-plans/final-evaluation', finalEvaluation, {
      params: { planId }
    });
    console.log('Final evaluation response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error adding final evaluation:', error);
    throw handleApiError(error);
  }
};

/**
 * Coach views member's newest plan for final evaluation
 * GET /quit-plans/coach/view/newest-of-member
 */
export const viewMemberNewestPlan = async (memberId) => {
  try {
    console.log('Coach viewing member newest plan:', memberId);
    const response = await axiosInstance.get('/api/quit-plans/coach/view/newest-of-member', {
      params: { memberId }
    });
    console.log('View member plan response:', response.data);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error viewing member plan:', error);
    
    // Return an error object instead of throwing
    return {
      success: false,
      error: error.message || 'UNKNOWN_ERROR',
      message: 'Có lỗi xảy ra khi tải kế hoạch'
    };
  }
};

// ========================
// UTILITY FUNCTIONS - STATUS AND FORMATTING
// ========================

/**
 * Get user-friendly status text for quit plan
 */
export const getQuitPlanStatusText = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'CREATED':
      return 'Chờ phê duyệt';
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'Đang hoạt động';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'REJECTED':
    case 'DENIED':
      return 'Từ chối';
    case 'FAILED':
    case 'CANCELLED':
    case 'DISABLED':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

/**
 * Get status color for UI display
 */
export const getQuitPlanStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'CREATED':
      return 'orange';
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'green';
    case 'COMPLETED':
      return 'blue';
    case 'REJECTED':
    case 'DENIED':
      return 'red';
    case 'FAILED':
    case 'CANCELLED':
    case 'DISABLED':
      return 'gray';
    default:
      return 'default';
  }
};

/**
 * Check if a quit plan can be accepted/denied by member
 */
export const checkPlanActionAvailability = (quitPlan) => {
  if (!quitPlan) return { canAccept: false, canDeny: false };
  
  const status = quitPlan.quitPlanStatus || quitPlan.status;
  const isPendingApproval = status === 'PENDING' || status === 'PENDING_APPROVAL' || status === 'CREATED' || status === 'pending';
  
  return {
    canAccept: isPendingApproval,
    canDeny: isPendingApproval,
    status: status
  };
};

/**
 * Validate quit plan data before creation
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

// Export workflow constants
export const QUIT_PLAN_STATUS = {
  PENDING: 'PENDING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  IN_PROGRESS: 'IN_PROGRESS',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  DENIED: 'DENIED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  DISABLED: 'DISABLED'
};

export const QUIT_PLAN_ACTIONS = {
  ACCEPT: 'accept',
  DENY: 'deny',
  REQUEST: 'request',
  CREATE: 'create',
  FINAL_EVALUATION: 'final_evaluation'
};