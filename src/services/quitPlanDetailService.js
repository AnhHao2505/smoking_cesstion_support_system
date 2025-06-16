// Quit Plan Detail Service

export const getQuitPlanDetail = (quitPlanId) => {
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

export const updateQuitPlanDetail = (quitPlanId, updateData) => {
  console.log("Updating quit plan", quitPlanId, "with data:", updateData);
  
  // In a real app, this would call an API
  return {
    success: true,
    message: "Quit plan updated successfully"
  };
};