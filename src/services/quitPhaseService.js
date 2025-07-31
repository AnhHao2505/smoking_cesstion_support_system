// Quit Phase Service
import axiosInstance from '../utils/axiosConfig';

/**
 * Get default phases based on addiction level
 * Coach lấy danh sách phase mặc định dựa trên AddictionLevel giúp hỗ trợ tạo phases
 * GET /api/quit-phases/default
 */
export const getDefaultPhases = async (addictionLevel) => {
  try {
    const response = await axiosInstance.get('/api/quit-phases/default', {
      params: { addictionLevel }
    });
    console.log('API response for getDefaultPhases:', response);
    
    // Backend returns List<QuitPhaseDTO> directly
    return response.data;
  } catch (error) {
    console.error('Error getting default phases:', error);
    throw error;
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
    
    // Backend returns ApiMessageResponse with {success: boolean, message: string}
    return response.data;
  } catch (error) {
    console.error('Error creating goals of phases:', error);
    throw error;
  }
};
