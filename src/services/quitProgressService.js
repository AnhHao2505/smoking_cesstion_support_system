// Mock data for quit progress overview

// Get smoke-free statistics
export const getSmokeFreeSummary = (userId) => {
  return {
    days_smoke_free: 42,
    current_streak: 23,
    longest_streak: 23,
    cigarettes_avoided: 840, // Assuming 20 cigarettes per day
    money_saved: 420, // Assuming $10 per pack (20 cigarettes)
    health_progress_percentage: 65,
    next_health_milestone: {
      name: "Improved blood circulation",
      description: "Your circulation improves, making physical activities easier",
      days_remaining: 3
    }
  };
};

// Get quit plan phases
export const getQuitPlanPhases = (userId) => {
  return {
    quit_plan_id: 101,
    start_date: "2025-04-05",
    current_phase: "Action",
    phases: [
      {
        phase_id: 1,
        phase_name: "Preparation",
        phase_order: 1,
        start_date: "2025-04-05",
        end_date: "2025-04-14",
        is_completed: true,
        completion_percentage: 100,
        objective: "Prepare mentally and physically for quitting"
      },
      {
        phase_id: 2,
        phase_name: "Action",
        phase_order: 2,
        start_date: "2025-04-15",
        end_date: "2025-05-29",
        is_completed: false,
        completion_percentage: 60,
        objective: "Implement strategies to maintain abstinence"
      },
      {
        phase_id: 3,
        phase_name: "Maintenance",
        phase_order: 3,
        start_date: "2025-05-30",
        end_date: "2025-07-01",
        is_completed: false,
        completion_percentage: 0,
        objective: "Strengthen commitment and prevent relapse"
      }
    ]
  };
};

// Get recent daily records summary
export const getRecentDailyRecordsSummary = (userId, days = 7) => {
  const records = [
    {
      date: "2025-05-16",
      cigarettes: 0,
      stress_level: 3,
      cravings_intensity: 4,
      overall_health: "good"
    },
    {
      date: "2025-05-15",
      cigarettes: 0,
      stress_level: 4,
      cravings_intensity: 5,
      overall_health: "good"
    },
    {
      date: "2025-05-14",
      cigarettes: 0,
      stress_level: 2,
      cravings_intensity: 3,
      overall_health: "good"
    },
    {
      date: "2025-05-13",
      cigarettes: 0,
      stress_level: 6,
      cravings_intensity: 7,
      overall_health: "normal"
    },
    {
      date: "2025-05-12",
      cigarettes: 0,
      stress_level: 5,
      cravings_intensity: 6,
      overall_health: "normal"
    },
    {
      date: "2025-05-11",
      cigarettes: 0,
      stress_level: 4,
      cravings_intensity: 5,
      overall_health: "good"
    },
    {
      date: "2025-05-10",
      cigarettes: 0,
      stress_level: 3,
      cravings_intensity: 4,
      overall_health: "good"
    }
  ];

  // Calculate weekly averages
  const weeklyAverages = {
    avg_stress: Math.round(records.reduce((sum, record) => sum + record.stress_level, 0) / records.length * 10) / 10,
    avg_cravings: Math.round(records.reduce((sum, record) => sum + record.cravings_intensity, 0) / records.length * 10) / 10,
    health_distribution: {
      good: records.filter(r => r.overall_health === "good").length,
      normal: records.filter(r => r.overall_health === "normal").length,
      poor: records.filter(r => r.overall_health === "poor").length,
      very_poor: records.filter(r => r.overall_health === "very poor").length
    }
  };

  return {
    records,
    weeklyAverages,
    cigarette_free_days: records.filter(r => r.cigarettes === 0).length
  };
};

// Get recent notifications
export const getRecentNotifications = (userId, limit = 5) => {
  return [
    {
      id: 201,
      content: "Congratulations! You've been smoke-free for 42 days!",
      type: "achievement",
      sent_at: "2025-05-16",
      is_read: false
    },
    {
      id: 202,
      content: "Your coach has answered your recent question about evening cravings",
      type: "coach_response",
      sent_at: "2025-05-15",
      is_read: true
    },
    {
      id: 203,
      content: "You've earned the 'Six Weeks Milestone' badge!",
      type: "badge",
      sent_at: "2025-05-16",
      is_read: false
    },
    {
      id: 204,
      content: "Your next health milestone 'Improved blood circulation' is coming in 3 days!",
      type: "health_milestone",
      sent_at: "2025-05-15",
      is_read: true
    },
    {
      id: 205,
      content: "Remember to complete your daily check-in for today",
      type: "reminder",
      sent_at: "2025-05-16",
      is_read: false
    }
  ];
};

// Get upcoming reminders
export const getUpcomingReminders = (userId, limit = 3) => {
  return [
    {
      id: 301,
      message: "Schedule weekly check-in with your coach",
      nextDate: "2025-05-18",
      reminder_type: "appointment",
      is_sent: false
    },
    {
      id: 302,
      message: "Refill your nicotine replacement supplies",
      nextDate: "2025-05-20",
      reminder_type: "medication",
      is_sent: false
    },
    {
      id: 303,
      message: "Attend support group meeting",
      nextDate: "2025-05-19",
      reminder_type: "support",
      is_sent: false
    }
  ];
};

// Get earned badges related to quit progress
export const getQuitProgressBadges = (userId) => {
  return [
    {
      badge_id: 101,
      badge_name: "First Week Milestone",
      badge_description: "Successfully completed your first week smoke-free",
      earned_date: "2025-04-22",
      image_url: "/badges/first-week.png"
    },
    {
      badge_id: 102,
      badge_name: "One Month Milestone",
      badge_description: "One full month without smoking",
      earned_date: "2025-05-14",
      image_url: "/badges/one-month.png"
    },
    {
      badge_id: 103,
      badge_name: "Craving Master",
      badge_description: "Successfully managed cravings for 20 consecutive days",
      earned_date: "2025-05-05",
      image_url: "/badges/craving-master.png"
    },
    {
      badge_id: 104,
      badge_name: "Money Saver",
      badge_description: "Saved over $300 by not buying cigarettes",
      earned_date: "2025-05-10",
      image_url: "/badges/money-saver.png"
    }
  ];
};

// Get health improvements timeline
export const getHealthImprovementsTimeline = (userId) => {
  const quitDate = new Date("2025-04-05");
  const now = new Date("2025-05-16");
  const daysSinceQuit = Math.floor((now - quitDate) / (1000 * 60 * 60 * 24));
  
  const improvements = [
    {
      title: "Blood oxygen levels normalize",
      description: "Your blood oxygen levels have returned to normal",
      days_from_quit: 1,
      achieved: true,
      achieved_date: "2025-04-06"
    },
    {
      title: "Carbon monoxide eliminated",
      description: "Carbon monoxide has been eliminated from your body",
      days_from_quit: 2,
      achieved: true,
      achieved_date: "2025-04-07"
    },
    {
      title: "Nicotine expelled",
      description: "Most nicotine has been expelled from your body",
      days_from_quit: 3,
      achieved: true,
      achieved_date: "2025-04-08"
    },
    {
      title: "Taste and smell improve",
      description: "Your senses of taste and smell have begun to improve",
      days_from_quit: 5,
      achieved: true,
      achieved_date: "2025-04-10"
    },
    {
      title: "Breathing easier",
      description: "Breathing becomes easier as bronchial tubes relax",
      days_from_quit: 14,
      achieved: true,
      achieved_date: "2025-04-19"
    },
    {
      title: "Circulation improves",
      description: "Your circulation improves, making physical activity easier",
      days_from_quit: 45,
      achieved: daysSinceQuit >= 45,
      achieved_date: daysSinceQuit >= 45 ? "2025-05-20" : null
    },
    {
      title: "Lung function increases",
      description: "Your lung function has increased by up to 30%",
      days_from_quit: 90,
      achieved: false,
      achieved_date: null
    }
  ];
  
  return {
    quit_date: "2025-04-05",
    days_since_quit: daysSinceQuit,
    improvements: improvements
  };
};