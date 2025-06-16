// Mock data for coach dashboard

// Get coach profile data
export const getCoachProfile = (coachId) => {
  // In a real app, this would fetch from API based on coachId
  return {
    coach_id: 1,
    user_id: 10,
    full_name: "Dr. Sarah Johnson",
    specialty: "Behavioral Psychology",
    qualification: "Ph.D in Clinical Psychology, Certified Smoking Cessation Specialist",
    bio: "Specializing in helping people overcome nicotine addiction through evidence-based behavioral approaches. Over 10 years of experience working with smokers of all backgrounds.",
    rating: 4.8,
    photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
    email_address: "sarah.johnson@example.com",
    phone_number: "+84901234567",
    created_at: "2023-01-15"
  };
};

// Get assigned members/quit plans
export const getAssignedMembers = (coachId) => {
  return [
    {
      user_id: 101,
      full_name: "Nguyen Van A",
      quit_plan_id: 201,
      start_date: "2025-05-01",
      end_date: "2025-08-01",
      status: true, // active
      progress: 35, // percentage
      days_smoke_free: 14,
      current_phase: "Preparation",
      last_checkin: "2025-05-15",
      photo_url: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      user_id: 102,
      full_name: "Tran Thi B",
      quit_plan_id: 202,
      start_date: "2025-04-15",
      end_date: "2025-07-15",
      status: true,
      progress: 42,
      days_smoke_free: 30,
      current_phase: "Action",
      last_checkin: "2025-05-14",
      photo_url: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      user_id: 103,
      full_name: "Le Van C",
      quit_plan_id: 203,
      start_date: "2025-03-10",
      end_date: "2025-06-10",
      status: true,
      progress: 75,
      days_smoke_free: 66,
      current_phase: "Maintenance",
      last_checkin: "2025-05-15",
      photo_url: "https://randomuser.me/api/portraits/men/43.jpg"
    },
    {
      user_id: 104,
      full_name: "Pham Thi D",
      quit_plan_id: 204,
      start_date: "2025-05-10",
      end_date: "2025-08-10",
      status: true,
      progress: 15,
      days_smoke_free: 5,
      current_phase: "Preparation",
      last_checkin: "2025-05-15",
      photo_url: "https://randomuser.me/api/portraits/women/55.jpg"
    },
    {
      user_id: 105,
      full_name: "Hoang Van E",
      quit_plan_id: 205,
      start_date: "2025-02-01",
      end_date: "2025-05-01",
      status: false, // completed
      progress: 100,
      days_smoke_free: 90,
      current_phase: "Completed",
      last_checkin: "2025-04-30",
      photo_url: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];
};

// Get unanswered questions
export const getUnansweredQuestions = (coachId) => {
  return [
    {
      question_id: 301,
      member_id: 101,
      member_name: "Nguyen Van A",
      question: "I've been experiencing increased cravings in the evening. Do you have any specific strategies for managing nighttime cravings?",
      date_asked: "2025-05-14",
      is_answered: false
    },
    {
      question_id: 302,
      member_id: 102,
      member_name: "Tran Thi B",
      question: "Is it normal to have vivid dreams about smoking when quitting? I keep dreaming that I've relapsed.",
      date_asked: "2025-05-15",
      is_answered: false
    },
    {
      question_id: 303,
      member_id: 104,
      member_name: "Pham Thi D",
      question: "What foods should I avoid during the first few weeks of quitting that might trigger cravings?",
      date_asked: "2025-05-15",
      is_answered: false
    }
  ];
};

// Get recent member feedback
export const getRecentFeedback = (coachId) => {
  return [
    {
      feedback_id: 401,
      user_id: 103,
      user_name: "Le Van C",
      rating: 5.0,
      feedback_content: "Dr. Johnson's techniques for managing stress without cigarettes have been life-changing. I'm so grateful for her support.",
      date: "2025-05-10"
    },
    {
      feedback_id: 402,
      user_id: 105,
      user_name: "Hoang Van E",
      rating: 4.5,
      feedback_content: "Very supportive and understanding. The customized plan made all the difference in my journey to quit smoking.",
      date: "2025-05-01"
    },
    {
      feedback_id: 403,
      user_id: 106,
      user_name: "Nguyen Thi F",
      rating: 5.0,
      feedback_content: "Excellent guidance through difficult withdrawal periods. Always responsive and helpful.",
      date: "2025-04-28"
    }
  ];
};

// Get coach performance metrics
export const getCoachPerformanceMetrics = (coachId) => {
  return {
    total_members: 24,
    active_members: 18,
    completed_successfully: 6,
    average_rating: 4.8,
    success_rate: 92, // percentage
    avg_days_to_quit: 28,
    monthly_stats: [
      { month: 'Jan', members: 3, success_rate: 90 },
      { month: 'Feb', members: 5, success_rate: 85 },
      { month: 'Mar', members: 4, success_rate: 100 },
      { month: 'Apr', members: 6, success_rate: 95 },
      { month: 'May', members: 6, success_rate: 85 }
    ],
    top_strategies: [
      { strategy: 'Mindfulness techniques', success_rate: 85 },
      { strategy: 'NRT + behavioral therapy', success_rate: 92 },
      { strategy: 'Exercise routine', success_rate: 78 },
      { strategy: 'Group support', success_rate: 82 }
    ]
  };
};

// Get member progress detail
export const getMemberProgressDetail = (userId) => {
  // In a real app, this would fetch based on userId
  const mockData = {
    101: {
      user_id: 101,
      full_name: "Nguyen Van A",
      quit_plan_id: 201,
      quit_date: "2025-05-01",
      days_smoke_free: 14,
      cigarettes_avoided: 280,
      money_saved: 140,
      health_improvements: [
        { improvement: 'Blood oxygen levels normalized', achieved_on: '2025-05-02' },
        { improvement: 'Carbon monoxide levels reduced', achieved_on: '2025-05-03' }
      ],
      daily_records: [
        { date: '2025-05-15', cigarettes: 0, stress_level: 4, cravings: 5, health: 'normal' },
        { date: '2025-05-14', cigarettes: 0, stress_level: 5, cravings: 6, health: 'normal' },
        { date: '2025-05-13', cigarettes: 0, stress_level: 4, cravings: 5, health: 'normal' },
        { date: '2025-05-12', cigarettes: 0, stress_level: 3, cravings: 4, health: 'good' },
        { date: '2025-05-11', cigarettes: 1, stress_level: 7, cravings: 8, health: 'poor' },
        { date: '2025-05-10', cigarettes: 0, stress_level: 5, cravings: 6, health: 'normal' },
        { date: '2025-05-09', cigarettes: 0, stress_level: 4, cravings: 5, health: 'normal' }
      ],
      phases: [
        { id: 1, name: 'Preparation', start_date: '2025-04-24', end_date: '2025-04-30', is_completed: true },
        { id: 2, name: 'Action', start_date: '2025-05-01', end_date: '2025-05-21', is_completed: false },
        { id: 3, name: 'Maintenance', start_date: '2025-05-22', end_date: '2025-07-01', is_completed: false },
        { id: 4, name: 'Termination', start_date: '2025-07-02', end_date: '2025-08-01', is_completed: false }
      ]
    }
  };
  
  return mockData[userId] || null;
};