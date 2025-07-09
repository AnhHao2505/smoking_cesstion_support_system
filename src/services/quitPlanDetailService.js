// Quit Plan Detail Service
import { getPhasesOfPlan, getMockPhasesOfPlan } from './quitPhaseService';

export const getQuitPlanDetail = (quitPlanId) => {
  // In a real app, this would call the API
  // For now, using mock data with phases from quit phase service
  const phases = getMockPhasesOfPlan(quitPlanId);
  
  return {
    quit_plan_id: 201,
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
    quit_phases: phases,
    current_phase: phases.find(phase => !phase.is_completed) || phases[0]
  };
};

export const updateQuitPlanDetail = (quitPlanId, updateData) => {
  console.log("Updating quit plan", quitPlanId, "with data:", updateData);
  
  // In a real app, this would call an API
  return {
    success: true,
    message: "Quit plan updated successfully"
  };
};