import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Progress, 
  Button, 
  Space, 
  Badge,
  Tabs,
  Pagination,
  message,
  Tooltip,
  Form,
  Modal,
  Input,
  Select
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  RiseOutlined,
  FileTextOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import * as adminDashboardService from '../../services/adminDashboardService';
import * as userService from '../../services/userService';
import * as feedbackService from '../../services/feebackService';
import * as reminderService from '../../services/reminderService';
import '../../styles/Dashboard.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({});
  
  // Users data state
  const [usersData, setUsersData] = useState({
    content: [],
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false
  });
  
  // Feedback data state
  const [feedbackData, setFeedbackData] = useState([]);
  const [publishedFeedbacks, setPublishedFeedbacks] = useState([]);
  
  // Reminder data state
  const [reminderData, setReminderData] = useState([]);
  const [reminderPagination, setReminderPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states for reminder management
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderForm] = Form.useForm();

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const stats = await adminDashboardService.getSystemOverview();
      setDashboardStats(stats || {});
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      message.error("Failed to load dashboard statistics");
      setDashboardStats({});
    }
  };

  // Fetch users data
  const fetchUsersData = async (page = 0, size = 10) => {
    try {
      setUsersLoading(true);
      const users = await userService.getAllUsers(page, size);
      setUsersData(users || {
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false
      });
    } catch (error) {
      console.error("Error fetching users data:", error);
      message.error("Failed to load users data");
      setUsersData({
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch feedback data
  const fetchFeedbackData = async () => {
    try {
      setFeedbackLoading(true);
      const [allFeedbacks, published] = await Promise.all([
        feedbackService.getAllFeedbacks(),
        feedbackService.getPublishedFeedbacks()
      ]);
      setFeedbackData(allFeedbacks || []);
      setPublishedFeedbacks(published || []);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      message.error("Failed to load feedback data");
      setFeedbackData([]);
      setPublishedFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fetch reminder data
  const fetchReminderData = async (page = 0, size = 10) => {
    try {
      setReminderLoading(true);
      const response = await reminderService.getAllReminders(page, size);
      console.log('Reminder response:', response); // Debug log
      
      if (response) {
        // Check if response has success property (from catch block with mock data)
        if (response.success === true && Array.isArray(response.data)) {
          // Mock data format
          setReminderData(response.data);
          setReminderPagination({
            current: page + 1,
            pageSize: size,
            total: response.data.length
          });
        } else if (response.content) {
          // Real API data format (after handleApiResponse)
          setReminderData(response.content || []);
          setReminderPagination({
            current: (response.pageNo || 0) + 1,
            pageSize: response.pageSize || size,
            total: response.totalElements || 0
          });
        } else {
          // Fallback
          setReminderData([]);
          setReminderPagination({
            current: 1,
            pageSize: size,
            total: 0
          });
        }
      } else {
        setReminderData([]);
        setReminderPagination({
          current: 1,
          pageSize: size,
          total: 0
        });
      }
    } catch (error) {
      console.error("Error fetching reminder data:", error);
      message.error("Failed to load reminder data");
      setReminderData([]);
      setReminderPagination({
        current: 1,
        pageSize: size,
        total: 0
      });
    } finally {
      setReminderLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchUsersData(0, pageSize),
        fetchFeedbackData(),
        fetchReminderData(0, pageSize)
      ]);
      setLoading(false);
    };

    fetchInitialData();
  }, [pageSize]);

  // Handle pagination change
  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchUsersData(page - 1, size); // API uses 0-based pagination
  };

  // Handle user disable/enable
  const handleUserDisableToggle = async (record) => {
    console.log(record)
    try {
      if (record.role === 'ADMIN') {
        message.warning('Admin users cannot be disabled');
        return;
      }

      const action = record.status ? 'disable' : 'enable';
      const response = await userService.disableUser(record.id);
      
      if (response.success) {
        message.success(`User ${action}d successfully`);
        // Refresh users data to show updated status
        fetchUsersData(currentPage - 1, pageSize);
      } else {
        message.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${record.status ? 'disabling' : 'enabling'} user:`, error);
      message.error(`Failed to ${record.status ? 'disable' : 'enable'} user`);
    }
  };

  // Handle user re-enable
  const handleUserReEnable = async (record) => {
    try {
      if (record.role === 'ADMIN') {
        message.warning('Admin users cannot be re-enabled');
        return;
      }

      const response = await userService.reEnableUser(record.id);
      
        message.success('User re-enabled successfully');
        // Refresh users data to show updated status
        fetchUsersData(currentPage - 1, pageSize);
    } catch (error) {
      console.error('Error re-enabling user:', error);
      message.error('Failed to re-enable user');
    }
  };

  // Handle feedback approval
  const handleFeedbackApproval = async (feedbackId) => {
    try {
      const response = await feedbackService.approveFeedback(feedbackId);
      if (response.success) {
        message.success('Feedback approved and published successfully');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Failed to approve feedback');
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      message.error('Failed to approve feedback');
    }
  };

  // Handle feedback hiding
  const handleFeedbackHide = async (feedbackId) => {
    try {
      const response = await feedbackService.hideFeedback(feedbackId);
      if (response.success) {
        message.success('Feedback hidden successfully');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Failed to hide feedback');
      }
    } catch (error) {
      console.error('Error hiding feedback:', error);
      message.error('Failed to hide feedback');
    }
  };

  // Handle marking feedback as reviewed
  const handleFeedbackReviewed = async (feedbackId) => {
    try {
      const response = await feedbackService.markFeedbackReviewed(feedbackId);
      if (response.success) {
        message.success('Feedback marked as reviewed');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Failed to mark feedback as reviewed');
      }
    } catch (error) {
      console.error('Error marking feedback as reviewed:', error);
      message.error('Failed to mark feedback as reviewed');
    }
  };

  // Create new reminder
  const handleCreateReminder = async (content, category) => {
    try {
      const response = await reminderService.createReminder(content, category);
      if (response.success) {
        message.success('Reminder created successfully');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Failed to create reminder');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      message.error('Failed to create reminder');
    }
  };

  // Update existing reminder
  const handleUpdateReminder = async (reminderId, content, category) => {
    try {
      const response = await reminderService.updateReminder(reminderId, content, category);
      if (response.success) {
        message.success('Reminder updated successfully');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Failed to update reminder');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      message.error('Failed to update reminder');
    }
  };

  // Disable reminder
  const handleDisableReminder = async (reminderId) => {
    try {
      const response = await reminderService.disableReminder(reminderId);
      if (response.success) {
        message.success('Reminder disabled successfully');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Failed to disable reminder');
      }
    } catch (error) {
      console.error('Error disabling reminder:', error);
      message.error('Failed to disable reminder');
    }
  };

  // Handle reminder pagination change
  const handleReminderPaginationChange = (page, size) => {
    setReminderPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }));
    fetchReminderData(page - 1, size);
  };

  // Handle edit reminder
  const handleEditReminder = (record) => {
    setEditingReminder(record);
    reminderForm.setFieldsValue({
      content: record.content,
      category: record.category
    });
    setReminderModalVisible(true);
  };

  // Handle reminder modal submission
  const handleReminderModalSubmit = async () => {
    try {
      const values = await reminderForm.validateFields();
      
      if (editingReminder) {
        // Update existing reminder
        await handleUpdateReminder(editingReminder.id, values.content, values.category);
      } else {
        // Create new reminder
        await handleCreateReminder(values.content, values.category);
      }
      
      setReminderModalVisible(false);
      setEditingReminder(null);
      reminderForm.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle reminder modal cancel
  const handleReminderModalCancel = () => {
    setReminderModalVisible(false);
    setEditingReminder(null);
    reminderForm.resetFields();
  };

  // Table columns for users
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'MEMBER' ? 'blue' : role === 'COACH' ? 'green' : 'purple'}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status ? 'success' : 'error'} 
          text={status ? 'Active' : 'Inactive'} 
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.role !== 'ADMIN' && record.status && (
            <Button 
              type="link" 
              size="small" 
              danger
              onClick={() => handleUserDisableToggle(record)}
            >
              Disable
            </Button>
          )}
          {record.role !== 'ADMIN' && !record.status && (
            <>
              <Button 
                type="link" 
                size="small" 
                onClick={() => handleUserDisableToggle(record)}
              >
                Enable
              </Button>
              <Button 
                type="link" 
                size="small" 
                style={{ color: '#52c41a' }}
                onClick={() => handleUserReEnable(record)}
              >
                Re-enable
              </Button>
            </>
          )}
          {record.role === 'ADMIN' && (
            <Tooltip title="Admin users cannot be disabled">
              <Button type="link" size="small" disabled>
                Protected
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Table columns for feedbacks
  const feedbackColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: '#faad14' }} /> {star}/5
        </div>
      )
    },
    {
      title: 'Coach',
      dataIndex: ['coach', 'name'],
      key: 'coachName',
      render: (name, record) => name || record.coachName || 'N/A'
    },
    {
      title: 'Member',
      dataIndex: ['member', 'name'],
      key: 'memberName',
      render: (name, record) => name || record.memberName || 'N/A'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isPublished = record.published || record.isPublished;
        const isReviewed = record.reviewed || record.isReviewed;
        
        if (isPublished) {
          return <Tag color="green">Published</Tag>;
        } else if (isReviewed) {
          return <Tag color="blue">Reviewed</Tag>;
        } else {
          return <Tag color="orange">Unreviewed</Tag>;
        }
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isPublished = record.published || record.isPublished;
        const isReviewed = record.reviewed || record.isReviewed;
        
        return (
          <Space>
            {!isReviewed && (
              <Button 
                type="link" 
                size="small"
                onClick={() => handleFeedbackReviewed(record.id)}
              >
                Mark Reviewed
              </Button>
            )}
            {!isPublished && isReviewed && (
              <Button 
                type="link" 
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleFeedbackApproval(record.id)}
              >
                Approve & Publish
              </Button>
            )}
            {isPublished && (
              <Button 
                type="link" 
                size="small"
                danger
                onClick={() => handleFeedbackHide(record.id)}
              >
                Hide
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  // Table columns for reminders
  const reminderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const colors = {
          'HEALTH_BENEFITS': 'green',
          'MOTIVATIONAL_QUOTES': 'blue',
          'TIPS_AND_TRICKS': 'orange',
          'MILESTONE_CELEBRATIONS': 'purple',
          'SMOKING_FACTS': 'red'
        };
        return (
          <Tag color={colors[category] || 'default'}>
            {category?.replace(/_/g, ' ') || 'General'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Active' : 'Inactive'} 
        />
      )
    },
    {
      title: 'Created Date',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Updated Date',
      dataIndex: 'updateAt',
      key: 'updateAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleEditReminder(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            size="small"
            danger={record.active}
            onClick={() => handleDisableReminder(record.id)}
          >
            {record.active ? 'Disable' : 'Enable'}
          </Button>
        </Space>
      )
    }
  ];

  // Prepare chart data from dashboard stats
  const prepareUserRoleData = () => {
    const { totalMembers = 0, totalCoaches = 0, totalUsers = 0 } = dashboardStats;
    const admins = totalUsers - totalMembers - totalCoaches;
    
    return [
      { name: 'Members', value: totalMembers, color: '#1890ff' },
      { name: 'Coaches', value: totalCoaches, color: '#52c41a' },
      { name: 'Admins', value: Math.max(0, admins), color: '#722ed1' }
    ].filter(item => item.value > 0);
  };

  const prepareFeedbackData = () => {
    const { 
      totalFeedback = 0, 
      reviewedFeedback = 0, 
      unreviewedFeedback = 0, 
      publishedFeedback = 0, 
      unpublishedFeedback = 0 
    } = dashboardStats;
    
    return [
      { name: 'Reviewed', value: reviewedFeedback, color: '#52c41a' },
      { name: 'Unreviewed', value: unreviewedFeedback, color: '#faad14' },
      { name: 'Published', value: publishedFeedback, color: '#1890ff' },
      { name: 'Unpublished', value: unpublishedFeedback, color: '#ff4d4f' }
    ].filter(item => item.value > 0);
  };

  const prepareQuitPlanData = () => {
    const { 
      totalQuitPlans = 0,
      activeQuitPlans = 0, 
      completedQuitPlans = 0, 
      cancelledQuitPlans = 0, 
      rejectedQuitPlans = 0 
    } = dashboardStats;
    
    return [
      { name: 'Active', value: activeQuitPlans, color: '#1890ff' },
      { name: 'Completed', value: completedQuitPlans, color: '#52c41a' },
      { name: 'Cancelled', value: cancelledQuitPlans, color: '#faad14' },
      { name: 'Rejected', value: rejectedQuitPlans, color: '#ff4d4f' }
    ].filter(item => item.value > 0);
  };

  // Prepare feedback rating distribution
  const prepareFeedbackRatingData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    feedbackData.forEach(feedback => {
      const rating = feedback.star || feedback.rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    return [
      { name: '1 Star', value: ratingCounts[1], color: '#ff4d4f' },
      { name: '2 Stars', value: ratingCounts[2], color: '#ff7a45' },
      { name: '3 Stars', value: ratingCounts[3], color: '#faad14' },
      { name: '4 Stars', value: ratingCounts[4], color: '#a0d911' },
      { name: '5 Stars', value: ratingCounts[5], color: '#52c41a' }
    ].filter(item => item.value > 0);
  };

  // Calculate feedback status statistics
  const getFeedbackStatusStats = () => {
    const total = feedbackData.length;
    const published = feedbackData.filter(f => f.published || f.isPublished).length;
    const reviewed = feedbackData.filter(f => f.reviewed || f.isReviewed).length;
    const unreviewed = total - reviewed;
    
    return {
      total,
      published,
      reviewed,
      unreviewed,
      publishedRate: total > 0 ? Math.round((published / total) * 100) : 0,
      reviewedRate: total > 0 ? Math.round((reviewed / total) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="container py-4">
        <Title level={2} className="page-title">Admin Dashboard</Title>
        
        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Total Users"
                value={dashboardStats.totalUsers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.totalMembers || 0} Members, {dashboardStats.totalCoaches || 0} Coaches
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Active Members"
                value={dashboardStats.activeMembers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.inactiveMembers || 0} Inactive
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Active Coaches"
                value={dashboardStats.activeCoaches || 0}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.coachesWithActiveMembers || 0} with active members
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Total Feedback"
                value={dashboardStats.totalFeedback || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Average: {dashboardStats.averageStarAll || 0} stars
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Secondary Statistics */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Quit Plans"
                value={dashboardStats.totalQuitPlans || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Success Rate: {dashboardStats.successRateOfQuitPlans || 0}%
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Daily Logs"
                value={dashboardStats.totalDailyLogs || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.membersWithAnyLog || 0} active loggers
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Members with Coach"
                value={dashboardStats.membersWithAssignedCoach || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Coach assignment rate
                </Text>
              </div>
            </Card>
          </Col>
          
        </Row>
        
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab="User Management" key="1">
            <Card title={`All Users (${usersData.totalElements || 0} total)`}>
              <Table 
                dataSource={usersData.content || []} 
                columns={userColumns} 
                rowKey="id"
                loading={usersLoading}
                pagination={false}
              />
              <div className="mt-4 text-center">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={usersData.totalElements || 0}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} users`
                  }
                />
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="Feedback Management" key="2.5">
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Total Feedback"
                    value={feedbackData.length || 0}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Published Feedback"
                    value={getFeedbackStatusStats().published || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">
                      {getFeedbackStatusStats().publishedRate}% published rate
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Reviewed Feedback"
                    value={getFeedbackStatusStats().reviewed || 0}
                    prefix={<BellOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">
                      {getFeedbackStatusStats().reviewedRate}% reviewed rate
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Average Rating"
                    value={dashboardStats.averageStarAll || 0}
                    precision={1}
                    prefix={<StarOutlined />}
                    suffix="/ 5.0"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={12}>
                <Card title="Feedback Rating Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareFeedbackRatingData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {prepareFeedbackRatingData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Feedback Status Overview">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="Unreviewed"
                        value={getFeedbackStatusStats().unreviewed}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                      <Progress 
                        percent={100 - getFeedbackStatusStats().reviewedRate} 
                        strokeColor="#ff4d4f"
                        showInfo={false}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Reviewed"
                        value={getFeedbackStatusStats().reviewed}
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress 
                        percent={getFeedbackStatusStats().reviewedRate} 
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Card title={`All Feedback (${feedbackData.length || 0} total)`}>
              <Table 
                dataSource={feedbackData || []} 
                columns={feedbackColumns} 
                rowKey="id"
                loading={feedbackLoading}
                scroll={{ x: 1200 }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} feedback entries`
                }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab="User Analytics" key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="User Distribution by Role">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareUserRoleData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareUserRoleData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Feedback Status Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareFeedbackData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareFeedbackData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Quit Plan Analytics" key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Quit Plan Status Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareQuitPlanData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareQuitPlanData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Quit Plan Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic 
                        title="Success Rate"
                        value={dashboardStats.successRateOfQuitPlans || 0}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress 
                        percent={dashboardStats.successRateOfQuitPlans || 0}
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Reminders" key="5">
            <Card 
              title={`All Reminders (${reminderPagination.total} total)`}
              extra={
                <Button 
                  type="primary" 
                  onClick={() => setReminderModalVisible(true)}
                  icon={<PlusOutlined />}
                >
                  Create Reminder
                </Button>
              }
            >
              <Table 
                dataSource={reminderData} 
                columns={reminderColumns} 
                rowKey="id"
                loading={reminderLoading}
                pagination={false}
              />
              <div className="mt-4 text-center">
                <Pagination
                  current={reminderPagination.current}
                  pageSize={reminderPagination.pageSize}
                  total={reminderPagination.total}
                  onChange={handleReminderPaginationChange}
                  onShowSizeChange={handleReminderPaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} reminders`
                  }
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>

        {/* Reminder Management Modal */}
        <Modal
          title={editingReminder ? 'Edit Reminder' : 'Create Reminder'}
          visible={reminderModalVisible}
          onCancel={handleReminderModalCancel}
          footer={null}
          destroyOnClose
        >
          <Form
            form={reminderForm}
            layout="vertical"
            onFinish={handleReminderModalSubmit}
          >
            <Form.Item
              name="content"
              label="Content"
              rules={[
                { required: true, message: 'Please enter reminder content' }
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter reminder content..." />
            </Form.Item>
            
            <Form.Item
              name="category"
              label="Category"
              rules={[
                { required: true, message: 'Please select reminder category' }
              ]}
            >
              <Select placeholder="Select category">
                <Select.Option value="HEALTH_BENEFITS">Health Benefits</Select.Option>
                <Select.Option value="MOTIVATIONAL_QUOTES">Motivational Quotes</Select.Option>
                <Select.Option value="TIPS_AND_TRICKS">Tips and Tricks</Select.Option>
                <Select.Option value="SMOKING_FACTS">Smoking Facts</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={reminderLoading}>
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </Button>
                <Button onClick={handleReminderModalCancel}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
