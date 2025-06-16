// Mock data for member dashboard

// Get member profile data
export const getMemberProfile = (userId) => {
  return {
    user_id: 101,
    full_name: "Nguyễn Văn A",
    email_address: "nguyenvana@example.com",
    phone_number: "0901234567",
    photo_url: "https://randomuser.me/api/portraits/men/22.jpg",
    joined_date: "2025-03-15",
    membership_status: "Premium"
  };
};

// Get quit plan data
export const getQuitPlanData = (userId) => {
  return {
    quit_plan_id: 201,
    coach_id: 1,
    coach_name: "Dr. Sarah Johnson",
    coach_photo: "https://randomuser.me/api/portraits/women/45.jpg",
    start_date: "2025-04-01",
    end_date: "2025-07-01",
    days_smoke_free: 45,
    cigarettes_avoided: 450,
    money_saved: 225,
    status: true, // active
    current_phase: {
      quit_phase_id: 3,
      phase_name: "Action",
      phase_order: 2,
      start_date: "2025-04-15",
      is_completed: false,
      objective: "Implement strategies to manage cravings and maintain abstinence"
    },
    phases: [
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
    strategies_to_use: "Nicotine replacement therapy, daily exercise, mindfulness meditation",
    medications_to_use: "Nicotine patches, gum as needed",
    medication_instructions: "Apply patch every morning. Use gum when experiencing strong cravings (max 8 pieces per day)."
  };
};

// Get daily state records
export const getDailyStateRecords = (userId, limit = 7) => {
  return [
    {
      record_id: 501,
      date: "2025-05-15",
      daily_cigarette_consumed: 0,
      stress_level: 4,
      cravings_intensity: 3,
      overall_health: "good",
      physical_symptoms: "None reported",
      mental_wellbeing_score: 8
    },
    {
      record_id: 502,
      date: "2025-05-14",
      daily_cigarette_consumed: 0,
      stress_level: 5,
      cravings_intensity: 4,
      overall_health: "good",
      physical_symptoms: "Slight headache in the morning",
      mental_wellbeing_score: 7
    },
    {
      record_id: 503,
      date: "2025-05-13",
      daily_cigarette_consumed: 1,
      stress_level: 7,
      cravings_intensity: 8,
      overall_health: "normal",
      physical_symptoms: "Irritability, restlessness",
      mental_wellbeing_score: 5
    },
    {
      record_id: 504,
      date: "2025-05-12",
      daily_cigarette_consumed: 0,
      stress_level: 4,
      cravings_intensity: 5,
      overall_health: "good",
      physical_symptoms: "None reported",
      mental_wellbeing_score: 7
    },
    {
      record_id: 505,
      date: "2025-05-11",
      daily_cigarette_consumed: 0,
      stress_level: 3,
      cravings_intensity: 4,
      overall_health: "good",
      physical_symptoms: "None reported",
      mental_wellbeing_score: 8
    }
  ];
};

// Get earned badges
export const getEarnedBadges = (userId) => {
  return [
    {
      badge_id: 1,
      badge_name: "First Week Milestone",
      badge_description: "Successfully completed your first week smoke-free!",
      earned_date: "2025-04-08"
    },
    {
      badge_id: 3,
      badge_name: "One Month Milestone",
      badge_description: "Congratulations on one month of being smoke-free!",
      earned_date: "2025-05-01"
    },
    {
      badge_id: 5,
      badge_name: "Money Saver",
      badge_description: "Saved over $100 by not buying cigarettes",
      earned_date: "2025-04-22"
    }
  ];
};

// Get health improvements
export const getHealthImprovements = (userId) => {
  return [
    {
      improvement: "Blood pressure returning to normal",
      achieved_on: "2025-04-03",
      description: "Your circulation is improving as your blood pressure begins to drop."
    },
    {
      improvement: "Carbon monoxide levels normalized",
      achieved_on: "2025-04-02",
      description: "The carbon monoxide in your blood has returned to normal levels."
    },
    {
      improvement: "Improved sense of taste and smell",
      achieved_on: "2025-04-10",
      description: "Your nerve endings are regenerating, enhancing your senses of taste and smell."
    },
    {
      improvement: "Easier breathing",
      achieved_on: "2025-04-17",
      description: "Your lung function is beginning to improve, making breathing easier."
    },
    {
      improvement: "Improved circulation",
      achieved_on: "2025-04-30",
      description: "Your circulation has improved, making physical activities easier."
    }
  ];
};

// Get upcoming reminders
export const getUpcomingReminders = (userId) => {
  return [
    {
      message: "Schedule weekly check-in with Dr. Johnson",
      nextDate: "2025-05-18",
      reminder_type: "appointment",
      is_sent: false
    },
    {
      message: "Refill nicotine patches",
      nextDate: "2025-05-20",
      reminder_type: "medication",
      is_sent: false
    },
    {
      message: "Log your daily progress",
      nextDate: "2025-05-16",
      reminder_type: "activity",
      is_sent: false
    }
  ];
};

// Get recent questions and answers
export const getRecentQuestionsAnswers = (userId) => {
  return [
    {
      question_id: 301,
      question: "I've been experiencing increased cravings in the evening. Do you have any specific strategies?",
      date_asked: "2025-05-14",
      is_answered: true,
      answer: {
        answer_id: 401,
        answer: "Evening cravings are common as this may be when you used to smoke most. Try taking a walk after dinner, practicing deep breathing exercises, or having healthy snacks like carrot sticks or sugar-free gum handy. Also, consider changing your evening routine temporarily to break associations with smoking.",
        answered_date: "2025-05-15"
      }
    },
    {
      question_id: 302,
      question: "Is it normal to have vivid dreams about smoking?",
      date_asked: "2025-05-08",
      is_answered: true,
      answer: {
        answer_id: 402,
        answer: "Yes, this is completely normal during the quitting process. Many people report dreams about smoking or relapsing. These dreams often reflect your brain processing the significant change. They typically decrease over time and aren't an indication that you actually want to smoke.",
        answered_date: "2025-05-09"
      }
    }
  ];
};