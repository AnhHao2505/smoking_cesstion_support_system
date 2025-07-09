// Quit Phase Service
import axiosInstance from '../utils/axiosConfig';

/**
 * Get default phases based on addiction level
 * Coach lấy danh sách phase mặc định dựa trên AddictionLevel giúp hỗ trợ tạo phases
 */
export const getDefaultPhases = async (addictionLevel) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/default', {
      params: { addictionLevel }
    });
    console.log('API response for getDefaultPhases:', response);
    
    // Handle various response formats
    if (response && response.data) {
      // If response.data is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If response.data has a nested data array
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // If response.data is a success wrapper
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    
    // Fallback to mock data if response format is unexpected
    console.log('Using mock data for default phases due to unexpected response format');
    return getMockDefaultPhases(addictionLevel);
  } catch (error) {
    console.error('Error getting default phases:', error);
    // Fallback to mock data for development
    console.log('Using mock data for default phases');
    return getMockDefaultPhases(addictionLevel);
  }
};

/**
 * Get phases of a specific quit plan
 * Member / Coach lấy danh sách phases của một plan
 */
export const getPhasesOfPlan = async (quitPlanId) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/from-plan', {
      params: { quitPlanId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting phases of plan:', error);
    throw error;
  }
};

/**
 * Create goals for phases
 * Coach nhập goal vào cái template tạo phases lấy từ /api/quit-phases/default
 */
export const createGoalsOfPhases = async (quitPlanId, phasesData) => {
  try {
    console.log('Calling createGoalsOfPhases with planId:', quitPlanId);
    console.log('Phases data:', phasesData);
    
    const response = await axiosInstance.post('/api/quit-phases/default/create-goals', phasesData, {
      params: { quitPlanId }
    });
    
    console.log('createGoalsOfPhases API response:', response);
    
    // Handle various response formats
    if (response && response.data) {
      return response.data;
    } else if (response) {
      return response;
    }
    
    return 'Goals created successfully';
  } catch (error) {
    console.error('Error creating goals of phases:', error);
    
    // Check if the error is specifically about quitPlanId not found
    if (error.response && error.response.data && 
        (error.response.data.includes && error.response.data.includes('quitPlanId not found'))) {
      throw new Error('quitPlanId not found');
    }
    
    // Throw the original error to preserve error information
    throw error;
  }
};

// Mock data for development - will be removed when API is ready
export const getMockDefaultPhases = (addictionLevel) => {
  // Return the format expected by the user interface
  return [
    {
      "id": null,
      "name": "Chuẩn bị bỏ thuốc",
      "duration": "Ngày 1–5",
      "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
      "goal": null,
      "phaseOrder": 1
    },
    {
      "id": null,
      "name": "Bắt đầu bỏ thuốc",
      "duration": "Ngày 6–20",
      "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
      "goal": null,
      "phaseOrder": 2
    },
    {
      "id": null,
      "name": "Duy trì",
      "duration": "Ngày 21–90",
      "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
      "goal": null,
      "phaseOrder": 3
    }
  ];
};

export const getMockPhasesOfPlan = (quitPlanId) => {
  return [
    {
      quit_phase_id: 1,
      phase_name: "Preparation",
      phase_order: 1,
      start_date: "2024-01-01",
      end_date: "2024-01-14",
      is_completed: true,
      objective: "Prepare for quit day and gather necessary resources",
      goals: [
        "Set a quit date",
        "Remove all smoking triggers from environment",
        "Inform family and friends about quit plan"
      ]
    },
    {
      quit_phase_id: 2,
      phase_name: "Action",
      phase_order: 2,
      start_date: "2024-01-15",
      end_date: "2024-02-14",
      is_completed: false,
      objective: "Implement strategies to manage cravings and maintain abstinence",
      goals: [
        "Use nicotine replacement therapy as prescribed",
        "Practice stress management techniques",
        "Avoid smoking triggers"
      ]
    },
    {
      quit_phase_id: 3,
      phase_name: "Maintenance",
      phase_order: 3,
      start_date: "2024-02-15",
      end_date: "2024-04-14",
      is_completed: false,
      objective: "Strengthen commitment and develop long-term strategies",
      goals: [
        "Continue healthy habits",
        "Build strong support network",
        "Develop long-term coping strategies"
      ]
    }
  ];
};
