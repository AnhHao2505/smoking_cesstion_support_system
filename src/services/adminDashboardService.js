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
      { month: 'Jan', count: 980 },
      { month: 'Feb', count: 1030 },
      { month: 'Mar', count: 1120 },
      { month: 'Apr', count: 1190 },
      { month: 'May', count: 1260 },
      { month: 'Jun', count: 1350 }
    ],
    membershipDistribution: [
      { type: 'Free', count: 750, percentage: 60 },
      { type: 'Basic', count: 312, percentage: 25 },
      { type: 'Premium', count: 188, percentage: 15 }
    ],
    userActivity: [
      { day: 'Mon', activeUsers: 720 },
      { day: 'Tue', activeUsers: 820 },
      { day: 'Wed', activeUsers: 920 },
      { day: 'Thu', activeUsers: 820 },
      { day: 'Fri', activeUsers: 720 },
      { day: 'Sat', activeUsers: 620 },
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
    totalBlogs: 145,
    totalBadges: 32,
    mostPopularBlogs: [
      { id: 1, title: '10 Tips for Quitting Smoking', views: 4520, author: 'Dr. Sarah Johnson' },
      { id: 2, title: 'Understanding Nicotine Withdrawal', views: 3820, author: 'Dr. Michael Chen' },
      { id: 3, title: 'The Benefits of Quitting Smoking', views: 3650, author: 'Nguyễn Thị Hương' },
      { id: 4, title: 'Mindfulness Techniques for Cravings', views: 3120, author: 'Dr. Sarah Johnson' },
      { id: 5, title: 'How to Support Someone Quitting', views: 2870, author: 'Lê Văn C' }
    ],
    mostEarnedBadges: [
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
    { id: 3, name: 'Nguyễn Thị Hương', rating: 4.8, members: 25, successRate: 88 },
    { id: 4, name: 'Dr. James Wilson', rating: 4.6, members: 18, successRate: 83 },
    { id: 5, name: 'Emma Davis', rating: 4.5, members: 15, successRate: 80 }
  ];
};

// Get system alerts and issues
export const getSystemAlerts = () => {
  return [
    { id: 1, type: 'warning', message: '3 coaches have not logged in for over 7 days', timestamp: '2025-06-15T10:30:00' },
    { id: 2, type: 'error', message: 'Payment processing system reported errors on 2025-06-14', timestamp: '2025-06-15T09:15:00' },
    { id: 3, type: 'info', message: 'System maintenance scheduled for 2025-06-18', timestamp: '2025-06-14T14:45:00' },
    { id: 4, type: 'warning', message: '15 user reports require moderation', timestamp: '2025-06-14T11:20:00' },
    { id: 5, type: 'success', message: 'Database backup completed successfully', timestamp: '2025-06-14T01:00:00' }
  ];
};