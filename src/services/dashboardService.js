import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get dashboard statistics from API
export const getDashboardStatistics = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching dashboard stats from API, using mock data:', error);
    // Fall back to mock data
    return getDashboardStatisticsMock();
  }
};

// Mock data for the dashboard statistics (fallback)
const getDashboardStatisticsMock = () => {
  return {
    totalMembers: 1250,
    successfulQuits: 487,
    ongoingQuitters: 763,
    averageQuitTime: 34, // days
    totalCigarettesAvoided: 156843,
    moneySaved: 78421, // dollars
    healthImprovements: {
      improvedBreathing: 78, // percentage
      betterSleep: 65, // percentage
      reducedCravings: 82, // percentage
      improvedTaste: 91, // percentage
    },
    successRateByAge: [
      { ageGroup: '18-24', rate: 35 },
      { ageGroup: '25-34', rate: 42 },
      { ageGroup: '35-44', rate: 38 },
      { ageGroup: '45-54', rate: 45 },
      { ageGroup: '55+', rate: 51 },
    ],
    topChallenges: [
      { challenge: 'Stress', percentage: 67 },
      { challenge: 'Social situations', percentage: 58 },
      { challenge: 'Cravings', percentage: 51 },
      { challenge: 'Weight gain', percentage: 32 },
      { challenge: 'Withdrawal symptoms', percentage: 45 },
    ],
    recentSuccessStories: [
      {
        memberId: 1,
        name: 'John Smith',
        quitDuration: '3 months',
        story: 'After 15 years of smoking, I finally quit with the help of this platform!'
      },
      {
        memberId: 2,
        name: 'Sarah Johnson',
        quitDuration: '6 months',
        story: 'The support from my coach and partner made all the difference.'
      },
      {
        memberId: 3,
        name: 'Michael Wong',
        quitDuration: '1 year',
        story: 'I never thought I could do it, but here I am, smoke-free for a year!'
      },
    ],
    badgesAwarded: {
      '1-Week Milestone': 843,
      '1-Month Milestone': 562,
      '3-Month Milestone': 324,
      '6-Month Milestone': 187,
      '1-Year Milestone': 98,
    },
    monthlyCessationTrend: [
      { month: 'Jan', count: 42 },
      { month: 'Feb', count: 38 },
      { month: 'Mar', count: 56 },
      { month: 'Apr', count: 61 },
      { month: 'May', count: 49 },
      { month: 'Jun', count: 67 },
      { month: 'Jul', count: 72 },
      { month: 'Aug', count: 53 },
      { month: 'Sep', count: 48 },
      { month: 'Oct', count: 59 },
      { month: 'Nov', count: 47 },
      { month: 'Dec', count: 41 },
    ],
  };
};

// Get data about most recent successful quitters
export const getRecentSuccessfulQuitters = () => {
  return [
    {
      id: 1,
      name: 'Emma Davis',
      quitDate: '2025-05-01',
      cigarettesAvoided: 540,
      moneySaved: 270,
      badgesEarned: ['1-Month Milestone', 'No Cravings Week']
    },
    {
      id: 2,
      name: 'James Wilson',
      quitDate: '2025-04-15',
      cigarettesAvoided: 840,
      moneySaved: 420,
      badgesEarned: ['1-Month Milestone', 'Health Improver', 'Craving Fighter']
    },
    {
      id: 3,
      name: 'Sophia Martinez',
      quitDate: '2025-03-22',
      cigarettesAvoided: 1350,
      moneySaved: 675,
      badgesEarned: ['2-Month Milestone', 'Breathing Champion', 'Money Saver']
    },
    {
      id: 4,
      name: 'Liam Johnson',
      quitDate: '2025-05-10',
      cigarettesAvoided: 450,
      moneySaved: 225,
      badgesEarned: ['3-Week Milestone', 'Strong Start']
    },
    {
      id: 5,
      name: 'Olivia Brown',
      quitDate: '2025-02-28',
      cigarettesAvoided: 1890,
      moneySaved: 945,
      badgesEarned: ['3-Month Milestone', 'Health Master', 'Inspiration']
    }
  ];
};

// Get user progress data
export const getUserProgressData = (userId) => {
  // Mock data - in a real app, this would be filtered by userId
  return {
    startDate: '2025-03-15',
    daysSmokeFree: 62,
    cigarettesAvoided: 1240,
    moneySaved: 620,
    healthImprovements: [
      { improvement: 'Blood pressure normalized', achievedOn: '2025-03-28' },
      { improvement: 'Lung function improved by 30%', achievedOn: '2025-04-14' },
      { improvement: 'Carbon monoxide levels normal', achievedOn: '2025-03-16' },
      { improvement: 'Risk of heart attack decreased', achievedOn: '2025-04-30' }
    ],
    dailyTracking: [
      { date: '2025-05-14', cravings: 2, stressLevel: 3, overallHealth: 'good' },
      { date: '2025-05-13', cravings: 3, stressLevel: 4, overallHealth: 'normal' },
      { date: '2025-05-12', cravings: 1, stressLevel: 2, overallHealth: 'good' },
      { date: '2025-05-11', cravings: 4, stressLevel: 5, overallHealth: 'normal' },
      { date: '2025-05-10', cravings: 2, stressLevel: 3, overallHealth: 'good' },
      { date: '2025-05-09', cravings: 5, stressLevel: 6, overallHealth: 'poor' },
      { date: '2025-05-08', cravings: 3, stressLevel: 4, overallHealth: 'normal' }
    ]
  };
};

// Get community stats
export const getCommunityStats = () => {
  return {
    totalMembers: 1250,
    activeCoaches: 45,
    totalPosts: 3789,
    totalAppointments: 2156,
    successfulPartnerships: 387,
    averageRating: 4.7,
    topCoaches: [
      { id: 1, name: 'Dr. Jennifer Lee', rating: 4.9, successfulClients: 78 },
      { id: 2, name: 'Mark Thompson', rating: 4.8, successfulClients: 65 },
      { id: 3, name: 'Dr. Robert Chen', rating: 4.8, successfulClients: 62 }
    ]
  };
};