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

// Create a new quit plan
export const createQuitPlan = async (memberId, planData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.QUIT_PLANS.CREATE, planData, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update quit plan by coach
export const updateQuitPlanByCoach = async (planId, planData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.QUIT_PLANS.UPDATE, planData, {
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
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.MEMBER_OLD, {
      params: { memberId, page, size }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all plans created by coach with pagination
export const getAllPlanCreatedByCoach = async (coachId, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.COACH_CREATED, {
      params: { coachId, page, size }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable quit plan (coach)
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

// Member denies quit plan
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

// Member accepts quit plan
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