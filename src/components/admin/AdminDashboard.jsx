import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Avatar, 
  Tag, 
  Progress, 
  List, 
  Button, 
  Space, 
  Divider,
  Badge,
  Tabs,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  RiseOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  MedicineBoxOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import * as adminDashboardService from '../../services/adminDashboardService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [systemOverview, setSystemOverview] = useState({});
  const [userStats, setUserStats] = useState({});
  const [quitPlanStats, setQuitPlanStats] = useState({});
  const [contentStats, setContentStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [coachPerformance, setCoachPerformance] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [detailedUserStats, setDetailedUserStats] = useState(null);
  const [membershipRevenue, setMembershipRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        // Only fetch system overview data as other endpoints are not available
        const overview = await adminDashboardService.getSystemOverview();
        
        // Set state with fetched data
        setSystemOverview(overview || {});
        
        // Set empty states for unavailable data
        setUserStats({});
        setQuitPlanStats({});
        setContentStats({});
        setRecentUsers([]);
        setCoachPerformance([]);
        setSystemAlerts([]);
        setDetailedUserStats(null);
        setMembershipRevenue(null);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        // Set empty states on error
        setSystemOverview({});
        setUserStats({});
        setQuitPlanStats({});
        setContentStats({});
        setRecentUsers([]);
        setCoachPerformance([]);
        setSystemAlerts([]);
        setDetailedUserStats(null);
        setMembershipRevenue(null);
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
      render: (role) => (
        <Tag color={role === 'Member' ? 'blue' : role === 'Coach' ? 'green' : 'purple'}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'Active' ? 'success' : 'default'} text={status} />
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
        <Space>
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
        <Space>
          <Button type="link" size="small">Details</Button>
          <Button type="link" size="small">Contact</Button>
        </Space>
      )
    }
  ];

  // Colors for pie chart
  const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#faad14'];

  return (
    <div className="dashboard admin-dashboard">
      <div className="container py-4">
        <Title level={2} className="page-title">System Dashboard</Title>
        
        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <Alert
            message={`You have ${systemAlerts.length} system alerts`}
            description={
              <List
                size="small"
                dataSource={systemAlerts.slice(0, 3)}
                renderItem={item => (
                  <List.Item>
                    <Text type={item.level === 'high' ? 'danger' : item.level === 'medium' ? 'warning' : 'secondary'}>
                      <BellOutlined style={{ marginRight: 8 }} />
                      {item.message}
                    </Text>
                  </List.Item>
                )}
              />
            }
            type="info"
            showIcon
            className="mb-4"
          />
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
                title="Total Coaches"
                value={systemOverview.totalCoaches}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Average rating: {systemOverview.averageRating}
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
                valueStyle={{ color: '#eb2f96' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  <RiseOutlined /> {systemOverview.revenueGrowth}% growth
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="1" className="dashboard-tabs mt-4">
          <TabPane tab="User Statistics" key="1">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="User Roles Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStats.usersByRole || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {userStats.usersByRole && userStats.usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="User Activity (Last 7 Days)">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={userStats.userGrowth || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="activeUsers" stroke="#1890ff" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Recent Users">
                  <Table 
                    dataSource={recentUsers} 
                    columns={userColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Quit Plan Statistics" key="2">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Quit Plan Status">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={quitPlanStats.plansByStatus || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Success Rate Trend">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={quitPlanStats.successRate || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rate" stroke="#52c41a" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Statistic
                    title="Average Plan Completion Time"
                    value={quitPlanStats.avgCompletionTime}
                    suffix="days"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Divider />
                  <Title level={5}>Phase Distribution</Title>
                  <div className="phase-distribution">
                    {quitPlanStats.phaseDistribution && quitPlanStats.phaseDistribution.map((phase, index) => (
                      <div key={index} className="phase-item">
                        <Text>{phase.phase}</Text>
                        <Progress 
                          percent={Math.round((phase.count / quitPlanStats.phaseDistribution.reduce((acc, curr) => acc + curr.count, 0)) * 100)} 
                          size="small" 
                          status={index === quitPlanStats.phaseDistribution.length - 1 ? "success" : "active"}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Top Badges Earned">
                  <List
                    dataSource={contentStats.topBadges || []}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                          title={item.name}
                          description={`Earned by ${item.count} users`}
                        />
                        <Progress 
                          percent={contentStats.topBadges ? 
                            Math.round((item.count / contentStats.topBadges.reduce((acc, curr) => acc + curr.count, 0)) * 100) : 0} 
                          size="small" 
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="User Analytics" key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="User Distribution by Role">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={detailedUserStats?.usersByRole || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="role"
                        label={({ role, count, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {detailedUserStats?.usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="New User Registrations">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={detailedUserStats?.registrationsByMonth || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" name="New Users" fill="#52c41a" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Membership Distribution">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic 
                        title="Premium"
                        value={detailedUserStats?.membershipStats.premium || 0}
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <Progress 
                        percent={detailedUserStats ? 
                          (detailedUserStats.membershipStats.premium / detailedUserStats.totalUsers * 100).toFixed(1) : 0
                        } 
                        strokeColor="#722ed1" 
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Standard"
                        value={detailedUserStats?.membershipStats.standard || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <Progress 
                        percent={detailedUserStats ? 
                          (detailedUserStats.membershipStats.standard / detailedUserStats.totalUsers * 100).toFixed(1) : 0
                        } 
                        strokeColor="#1890ff" 
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Free"
                        value={detailedUserStats?.membershipStats.free || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress 
                        percent={detailedUserStats ? 
                          (detailedUserStats.membershipStats.free / detailedUserStats.totalUsers * 100).toFixed(1) : 0
                        } 
                        strokeColor="#52c41a" 
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Revenue by Month">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={membershipRevenue?.revenueByMonth || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Monthly Revenue" stroke="#eb2f96" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Coach Performance" key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="Coach Performance Overview">
                  <Table 
                    dataSource={coachPerformance} 
                    columns={coachColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
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