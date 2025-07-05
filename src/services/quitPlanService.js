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

// Create a new quit plan
export const createQuitPlan = async (memberId, quitPlanData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.QUIT_PLANS.CREATE, quitPlanData, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update quit plan by coach
export const updateQuitPlanByCoach = async (planId, quitPlanData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.QUIT_PLANS.UPDATE, quitPlanData, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get newest quit plan of member
export const getNewestQuitPlan = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.NEWEST, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get old plans of member with pagination
export const getOldPlansOfMember = async (memberId, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.OLDS, {
      params: { memberId, page, size }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Coach finish a quit plan
export const finishQuitPlan = async (planId, note = '') => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.QUIT_PLANS.FINISH, null, {
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
    return getQuitPlanDetailMock(planId);
  } catch (error) {
    throw handleApiError(error);
  }
};

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

// Coach disables a quit plan
export const disableQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.QUIT_PLANS.DISABLE, null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member accepts a quit plan
export const acceptQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.QUIT_PLANS.ACCEPT, null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Member denies a quit plan
export const denyQuitPlan = async (planId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.QUIT_PLANS.DENY, null, {
      params: { planId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get quit plan by plan ID
export const getQuitPlanByPlanId = async (planId) => {
  try {
    // Note: This endpoint doesn't exist in the API specification
    // Using mock data as fallback
    console.warn('GET quit plan by ID is not available in the API specification');
    return getQuitPlanDetailMock(planId);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Note: GET quit plan by ID is not available in the API specification
// The available endpoints are only for getting newest and old plans