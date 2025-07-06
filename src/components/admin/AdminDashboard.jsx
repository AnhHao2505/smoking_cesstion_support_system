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
  Tooltip
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
  BellOutlined
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
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchUsersData(0, pageSize)
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
          <Button type="link" size="small">View</Button>
          {record.role !== 'ADMIN' && (
            <Button 
              type="link" 
              size="small" 
              danger={record.status}
              onClick={() => handleUserDisableToggle(record)}
            >
              {record.status ? 'Disable' : 'Enable'}
            </Button>
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
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Avg Phases per Plan"
                value={dashboardStats.averagePhasesPerQuitPlan || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Per quit plan
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
          
          <TabPane tab="User Analytics" key="2">
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
          
          <TabPane tab="Quit Plan Analytics" key="3">
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
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Active Plans"
                        value={dashboardStats.activeQuitPlans || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Completed Plans"
                        value={dashboardStats.completedQuitPlans || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Coach Performance" key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Coach Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="Total Coaches"
                        value={dashboardStats.totalCoaches || 0}
                        prefix={<MedicineBoxOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Active Coaches"
                        value={dashboardStats.activeCoaches || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={24}>
                      <Statistic 
                        title="Overall Average Rating"
                        value={dashboardStats.averageStarAll || 0}
                        precision={1}
                        prefix={<StarOutlined style={{ color: '#faad14' }} />}
                        suffix="/ 5.0"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Coach Engagement">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic 
                        title="Coaches with Active Members"
                        value={dashboardStats.coachesWithActiveMembers || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <Progress 
                        percent={dashboardStats.totalCoaches ? 
                          Math.round((dashboardStats.coachesWithActiveMembers / dashboardStats.totalCoaches) * 100) : 0
                        } 
                        strokeColor="#1890ff"
                      />
                    </Col>
                    <Col span={24}>
                      <Statistic 
                        title="Members with Assigned Coach"
                        value={dashboardStats.membersWithAssignedCoach || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress 
                        percent={dashboardStats.totalMembers ? 
                          Math.round((dashboardStats.membersWithAssignedCoach / dashboardStats.totalMembers) * 100) : 0
                        } 
                        strokeColor="#52c41a"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;