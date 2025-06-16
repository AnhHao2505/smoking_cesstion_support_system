// Mock data for admin dashboard

// Get system overview stats
export const getSystemOverview = () => {
  return {
    totalUsers: 1350,
    activeUsers: 1120,
    totalCoaches: 45,
    activePlans: 870,
    completedPlans: 230,
    totalRevenue: 28750,
    revenueGrowth: 12.5,
    newUsersThisMonth: 87,
    userGrowth: 8.3,
    averageRating: 4.6
  };
};

// Get user statistics
export const getUserStatistics = () => {
  return {
    usersByRole: [
      { role: 'Member', count: 1250, color: '#1890ff' },
      { role: 'Coach', count: 45, color: '#52c41a' },
      { role: 'Admin', count: 5, color: '#722ed1' },
      { role: 'Guest', count: 50, color: '#faad14' }
    ],
    userGrowth: [
      { day: 'Mon', activeUsers: 620 },
      { day: 'Tue', activeUsers: 650 },
      { day: 'Wed', activeUsers: 680 },
      { day: 'Thu', activeUsers: 700 },
      { day: 'Fri', activeUsers: 750 },
      { day: 'Sat', activeUsers: 580 },
      { day: 'Sun', activeUsers: 520 }
    ]
  };
};

// Get quit plan statistics
export const getQuitPlanStatistics = () => {
  return {
    plansByStatus: [
      { status: 'Active', count: 870 },
      { status: 'Completed', count: 230 },
      { status: 'Abandoned', count: 150 }
    ],
    successRate: [
      { month: 'Jan', rate: 72 },
      { month: 'Feb', rate: 75 },
      { month: 'Mar', rate: 78 },
      { month: 'Apr', rate: 80 },
      { month: 'May', rate: 83 },
      { month: 'Jun', rate: 85 }
    ],
    phaseDistribution: [
      { phase: 'Preparation', count: 250 },
      { phase: 'Action', count: 320 },
      { phase: 'Maintenance', count: 200 },
      { phase: 'Completed', count: 230 }
    ],
    avgCompletionTime: 75 // days
  };
};

// Get content statistics
export const getContentStatistics = () => {
  return {
    totalBlogs: 157,
    totalBadges: 25,
    totalResources: 63,
    topBlogs: [
      { id: 1, title: 'First Week of Quitting: What to Expect', views: 1250, likes: 320 },
      { id: 2, title: '10 Strategies for Managing Cravings', views: 980, likes: 275 },
      { id: 3, title: 'The Benefits of Quitting: Month by Month', views: 870, likes: 230 }
    ],
    topBadges: [
      { id: 1, name: '1-Week Milestone', count: 450 },
      { id: 2, name: '1-Month Milestone', count: 320 },
      { id: 3, name: 'Craving Fighter', count: 280 },
      { id: 4, name: 'Health Improver', count: 230 },
      { id: 5, name: '3-Month Milestone', count: 180 }
    ]
  };
};

// Get recent users (for table)
export const getRecentUsers = () => {
  return [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'Member', status: 'Active', joined: '2025-06-10' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'Member', status: 'Active', joined: '2025-06-09' },
    { id: 3, name: 'Dr. James Wilson', email: 'james.wilson@example.com', role: 'Coach', status: 'Active', joined: '2025-06-08' },
    { id: 4, name: 'Lê Văn C', email: 'levanc@example.com', role: 'Member', status: 'Inactive', joined: '2025-06-07' },
    { id: 5, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'Member', status: 'Active', joined: '2025-06-05' }
  ];
};

// Get coach performance data
export const getCoachPerformance = () => {
  return [
    { id: 1, name: 'Dr. Sarah Johnson', rating: 4.9, members: 28, successRate: 92 },
    { id: 2, name: 'Dr. Michael Chen', rating: 4.7, members: 22, successRate: 86 },
    { id: 3, name: 'Dr. James Wilson', rating: 4.8, members: 24, successRate: 90 },
    { id: 4, name: 'Dr. Emily Davis', rating: 4.6, members: 18, successRate: 83 },
    { id: 5, name: 'Dr. Robert Lee', rating: 4.5, members: 16, successRate: 80 }
  ];
};

// Get system alerts
export const getSystemAlerts = () => {
  return [
    { id: 1, message: 'Server load is high (85%)', level: 'medium', date: '2025-06-16' },
    { id: 2, message: 'Database backup completed successfully', level: 'low', date: '2025-06-16' },
    { id: 3, message: '5 failed login attempts detected from IP 192.168.1.105', level: 'high', date: '2025-06-15' }
  ];
};

// Get detailed user stats
export const getDetailedUserStats = () => {
  return {
    totalUsers: 1350,
    activeUsers: 1120,
    inactiveUsers: 230,
    usersByRole: [
      { role: 'Member', count: 1250, color: '#1890ff' },
      { role: 'Coach', count: 45, color: '#52c41a' },
      { role: 'Admin', count: 5, color: '#722ed1' },
      { role: 'Guest', count: 50, color: '#faad14' }
    ],
    registrationsByMonth: [
      { month: 'Jan', users: 75 },
      { month: 'Feb', users: 85 },
      { month: 'Mar', users: 92 },
      { month: 'Apr', users: 78 },
      { month: 'May', users: 120 },
      { month: 'Jun', users: 87 }
    ],
    membershipStats: {
      premium: 380,
      standard: 720,
      free: 250
    }
  };
};

// Get membership revenue data
export const getMembershipRevenue = () => {
  return {
    revenueByMonth: [
      { month: 'Jan', revenue: 4250 },
      { month: 'Feb', revenue: 4820 },
      { month: 'Mar', revenue: 5340 },
      { month: 'Apr', revenue: 4750 },
      { month: 'May', revenue: 6280 },
      { month: 'Jun', revenue: 5120 }
    ],
    totalRevenue: 30560,
    averageMonthlyGrowth: 8.3,
    revenueByPlan: [
      { plan: 'Premium Monthly', revenue: 15200, percentage: 49.7 },
      { plan: 'Premium Annual', revenue: 9800, percentage: 32.1 },
      { plan: 'Standard Monthly', revenue: 5560, percentage: 18.2 }
    ]
  };
};