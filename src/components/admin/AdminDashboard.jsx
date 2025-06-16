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
  List, 
  Button, 
  Space, 
  Divider,
  Badge,
  Tabs,
  Alert,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  RiseOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  TrophyOutlined,
  WarningOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import * as adminDashboardService from '../../services/adminDashboardService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [systemOverview, setSystemOverview] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [quitPlanStats, setQuitPlanStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [coachPerformance, setCoachPerformance] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        // Get all dashboard data
        const overview = adminDashboardService.getSystemOverview();
        const users = adminDashboardService.getUserStatistics();
        const quitPlans = adminDashboardService.getQuitPlanStatistics();
        const content = adminDashboardService.getContentStatistics();
        const users_recent = adminDashboardService.getRecentUsers();
        const coaches = adminDashboardService.getCoachPerformance();
        const alerts = adminDashboardService.getSystemAlerts();
        
        // Set state with fetched data
        setSystemOverview(overview);
        setUserStats(users);
        setQuitPlanStats(quitPlans);
        setContentStats(content);
        setRecentUsers(users_recent);
        setCoachPerformance(coaches);
        setSystemAlerts(alerts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Table columns for recent users
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
      render: (role) => {
        let color = 'blue';
        if (role === 'Admin') color = 'purple';
        if (role === 'Coach') color = 'green';
        if (role === 'Guest') color = 'orange';
        
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'Active' ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="default" text="Inactive" />
      )
    },
    {
      title: 'Joined',
      dataIndex: 'joined',
      key: 'joined',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Edit</Button>
        </Space>
      )
    }
  ];

  // Table columns for coach performance
  const coachColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{rating}/5.0</span>
        </Space>
      )
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => <Progress percent={rate} size="small" />
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">View Details</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard admin-dashboard">
      <div className="container py-4">
        <Title level={2} className="dashboard-title">Admin Dashboard</Title>
        
        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="system-alerts mb-4">
            {systemAlerts.slice(0, 3).map(alert => (
              <Alert
                key={alert.id}
                message={alert.message}
                type={alert.type}
                showIcon
                className="mb-2"
                action={
                  <Button size="small" type="text">
                    Details
                  </Button>
                }
              />
            ))}
            {systemAlerts.length > 3 && (
              <Button type="link">View all {systemAlerts.length} alerts</Button>
            )}
          </div>
        )}
        
        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="stats-overview">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Total Users"
                value={systemOverview.totalUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  <RiseOutlined /> {systemOverview.userGrowth}% from last month
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Active Quit Plans"
                value={systemOverview.activePlans}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {systemOverview.completedPlans} completed
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Total Revenue"
                value={systemOverview.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  <RiseOutlined /> {systemOverview.revenueGrowth}% growth
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Coaches"
                value={systemOverview.totalCoaches}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {systemOverview.averageRating}/5.0 avg rating
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Main Dashboard Content */}
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab={<span><TeamOutlined /> User Analytics</span>} key="1">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="User Growth" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userStats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#1890ff" activeDot={{ r: 8 }} name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Users by Role" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStats.usersByRole}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="role"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userStats.usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="User Activity (Daily)" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userStats.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="activeUsers" fill="#1890ff" name="Active Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Membership Distribution" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStats.membershipDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="cell-1" fill="#1890ff" />
                        <Cell key="cell-2" fill="#52c41a" />
                        <Cell key="cell-3" fill="#722ed1" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            
            <Card title="Recent Users" className="mb-4 mt-4">
              <Table 
                dataSource={recentUsers} 
                columns={userColumns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><BarChartOutlined /> Quit Plan Analytics</span>} key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Success Rate Trend" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={quitPlanStats.successRate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rate" stroke="#52c41a" activeDot={{ r: 8 }} name="Success Rate (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Plans by Status" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={quitPlanStats.plansByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="cell-1" fill="#52c41a" />
                        <Cell key="cell-2" fill="#1890ff" />
                        <Cell key="cell-3" fill="#faad14" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Phase Distribution" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quitPlanStats.phaseDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="phase" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#722ed1" name="Users in Phase" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card className="stat-card" style={{ height: '100%' }}>
                  <div className="text-center" style={{ padding: '40px 0' }}>
                    <Statistic 
                      title="Average Plan Completion Time"
                      value={quitPlanStats.avgCompletionTime}
                      suffix="days"
                      valueStyle={{ color: '#1890ff', fontSize: '32px' }}
                      prefix={<ClockCircleOutlined />}
                    />
                    <div className="mt-4">
                      <Progress percent={85} status="active" />
                      <Text type="secondary">Program Effectiveness Score</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Card title="Coach Performance" className="mb-4 mt-4">
              <Table 
                dataSource={coachPerformance} 
                columns={coachColumns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><FileTextOutlined /> Content Management</span>} key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Most Popular Blog Posts" className="chart-card">
                  <List
                    itemLayout="horizontal"
                    dataSource={contentStats.mostPopularBlogs}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.title}
                          description={
                            <Space>
                              <Text type="secondary">By {item.author}</Text>
                              <Tag color="blue">{item.views} views</Tag>
                            </Space>
                          }
                        />
                        <Space>
                          <Button type="text" size="small">View</Button>
                          <Button type="text" size="small">Edit</Button>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Most Earned Badges" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentStats.mostEarnedBadges} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#faad14" name="Users Earned" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card title="Content Overview" className="mb-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Statistic 
                        title="Total Blog Posts"
                        value={contentStats.totalBlogs}
                        prefix={<FileTextOutlined />}
                      />
                      <Button type="link">Manage Blogs</Button>
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic 
                        title="Total Badges"
                        value={contentStats.totalBadges}
                        prefix={<TrophyOutlined />}
                      />
                      <Button type="link">Manage Badges</Button>
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic 
                        title="User Generated Content"
                        value={contentStats.totalBlogs + 320}
                        prefix={<TeamOutlined />}
                      />
                      <Button type="link">Moderation Queue</Button>
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