import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get member profile data - Updated to use new API endpoint
export const getMemberProfile = async (memberId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_PROFILE(memberId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    // Return mock data for development - Updated structure to match new API
    return {
      id: 101,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com", 
      contactNumber: "0901234567",
      planName: "Premium Quit Plan",
      membershipExpiryDate: "2026-03-15",
      premiumMembership: true
    };
  }
};

// Get quit plan data
export const getQuitPlanData = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_QUIT_PLAN(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching quit plan data:', error);
    // Mock data
    return {
      quit_plan_id: 1,
      start_date: "2024-01-15",
      target_quit_date: "2024-02-01",
      days_smoke_free: 147,
      progress: 85,
      current_phase: {
        phase_id: 3,
        phase_name: "Maintenance Phase",
        description: "Focus on maintaining smoke-free lifestyle"
      },
      next_milestone: {
        milestone_name: "6 Months Smoke Free",
        days_remaining: 33
      }
    };
  }
};
// Get daily state records
export const getDailyStateRecords = async (userId, limit = 7) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DAILY_RECORDS.GET_BY_MEMBER(userId),
      { params: { limit } }
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching daily state records:', error);
    // Mock data
    return [
      {
        record_id: 1,
        date: "2024-06-26",
        smoking_urge_level: 2,
        mood_level: 4,
        stress_level: 3,
        notes: "Feeling good today, minor cravings after lunch"
      },
      {
        record_id: 2, 
        date: "2024-06-25",
        smoking_urge_level: 3,
        mood_level: 3,
        stress_level: 4,
        notes: "Stressful day at work, but managed without smoking"
      }
    ];
  }
};

// Get earned badges
export const getEarnedBadges = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_BADGES(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching earned badges:', error);
    // Mock data
    return [
      {
        badge_id: 1,
        name: "Week Warrior",
        description: "1 week smoke-free",
        icon_url: "/images/badges/week-warrior.png",
        earned_date: "2024-01-22"
      },
      {
        badge_id: 2,
        name: "Month Master", 
        description: "1 month smoke-free",
        icon_url: "/images/badges/month-master.png",
        earned_date: "2024-02-15"
      }
    ];
  }
};

// Get health improvements
export const getHealthImprovements = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_HEALTH_IMPROVEMENTS(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching health improvements:', error);
    // Mock data
    return [
      {
        improvement_id: 1,
        title: "Lung Function Improvement",
        description: "Your lung capacity has improved by 15%",
        improvement_date: "2024-06-20",
        category: "respiratory"
      },
      {
        improvement_id: 2,
        title: "Better Sleep Quality",
        description: "Sleep quality improved significantly", 
        improvement_date: "2024-06-15",
        category: "sleep"
      }
    ];
  }
};

// Get upcoming reminders
export const getUpcomingReminders = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_REMINDERS(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    // Mock data
    return [
      {
        reminder_id: 1,
        title: "Daily Check-in",
        description: "Record your daily smoking urges and mood",
        scheduled_time: "2024-06-27T09:00:00Z",
        reminder_type: "daily_record"
      },
      {
        reminder_id: 2,
        title: "Coach Appointment",
        description: "Weekly coaching session with Dr. Smith",
        scheduled_time: "2024-06-28T14:00:00Z", 
        reminder_type: "appointment"
      }
    ];
  }
};

// Get recent questions and answers
export const getRecentQuestionsAnswers = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MEMBERS.GET_QUESTIONS_ANSWERS(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching recent questions and answers:', error);
    // Mock data
    return [
      {
        qa_id: 1,
        question: "How to deal with smoking cravings during social events?",
        answer: "Try to focus on conversations, keep your hands busy with a drink or snack, and consider stepping away briefly if cravings become strong.",
        asked_date: "2024-06-25",
        answered_by: "Dr. Sarah Johnson"
      },
      {
        qa_id: 2,
        question: "Is it normal to feel anxious after quitting smoking?",
        answer: "Yes, anxiety is a common withdrawal symptom. It typically improves within 2-4 weeks. Practice deep breathing and consider talking to your coach.",
        asked_date: "2024-06-23", 
        answered_by: "Dr. Michael Chen"
      }
    ];
  }
};