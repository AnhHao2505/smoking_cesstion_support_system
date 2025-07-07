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
  Rate,
  message,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  StarOutlined,
  TeamOutlined,
  RiseOutlined,
  MessageOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/authService';
import { getCoachDashboardData } from '../../services/coachDashboardServiceReal';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CoachDashboard = () => {
  const { currentUser } = useAuth();
  const [coachProfile, setCoachProfile] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    total_members: 0,
    active_members: 0,
    completed_successfully: 0,
    average_rating: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  
  const coachId = currentUser?.userId;

  useEffect(() => {
    const fetchCoachDashboardData = async () => {
      if (!coachId) {
        setLoading(false);
        message.error('Please log in as a coach to access this dashboard');
        return;
      }

      try {
        setLoading(true);
        
        const dashboardResponse = await getCoachDashboardData(coachId);
        
        if (dashboardResponse.success) {
          const { profile, members, questions, feedback, metrics } = dashboardResponse.data;
          
          setCoachProfile(profile);
          setAssignedMembers(members);
          setUnansweredQuestions(questions);
          setRecentFeedback(feedback);
          setPerformanceMetrics({
            ...metrics,
            average_rating: profile?.rating || 0
          });
        } else {
          message.error('Failed to load dashboard data');
        }

      } catch (error) {
        console.error("Error fetching coach dashboard data:", error);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachDashboardData();
  }, [coachId]);

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // Fallback for missing coach profile data
  const profileData = coachProfile || {
    full_name: currentUser?.name || 'Coach',
    specialty: 'Smoking Cessation Specialist',
    bio: 'Dedicated to helping people quit smoking successfully',
    rating: 0,
    photo_url: null
  };

  // Column configuration for member table
  const memberColumns = [
    {
      title: 'Member',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Current Phase',
      dataIndex: 'current_phase',
      key: 'current_phase',
      render: (phase) => {
        let color = 'blue';
        if (phase === 'PENDING_APPROVAL') color = 'orange';
        if (phase === 'ACTIVE') color = 'green';
        if (phase === 'COMPLETED') color = 'purple';
        if (phase === 'DENIED') color = 'red';
        if (phase === 'No Plan') color = 'default';
        
        return <Tag color={color}>{phase}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    },
    {
      title: 'Days Smoke-Free',
      dataIndex: 'days_smoke_free',
      key: 'days_smoke_free',
    },
    {
      title: 'Last Check-in',
      dataIndex: 'last_checkin',
      key: 'last_checkin',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="default" text="Inactive" />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">View Details</Button>
          <Button type="link" size="small">Contact</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard coach-dashboard">
      <div className="container py-4">
        {/* Coach Profile Overview */}
        <Card className="mb-4 coach-profile-card">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6}>
              <div className="text-center">
                <Avatar 
                  size={120} 
                  src={profileData.photo_url} 
                  icon={<UserOutlined />} 
                />
                <div className="mt-3">
                  <Rate disabled defaultValue={profileData.rating} allowHalf />
                  <div><Text strong>{profileData.rating}</Text> / 5.0</div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2}>{profileData.full_name}</Title>
              <Text type="secondary">{profileData.specialty}</Text>
              <Paragraph>{profileData.bio}</Paragraph>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Total Members"
                    value={performanceMetrics.total_members}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Success Rate"
                    value={performanceMetrics.success_rate}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Average Rating"
                    value={performanceMetrics.average_rating}
                    prefix={<StarOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        
        {/* Main Dashboard Content */}
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab={<span><TeamOutlined /> Assigned Members</span>} key="1">
            <Card>
              <Title level={4}>Member Progress</Title>
              <Table 
                dataSource={assignedMembers} 
                columns={memberColumns} 
                rowKey="user_id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><MessageOutlined /> Questions ({unansweredQuestions.length})</span>} key="2">
            <Card>
              <Title level={4}>Unanswered Questions</Title>
              {unansweredQuestions.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={unansweredQuestions}
                  pagination={{ pageSize: 5 }}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      extra={
                        <Space>
                          <Button type="primary">Answer</Button>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.askerName || 'Member'}</Text>}
                        description={
                          <Space>
                            <CalendarOutlined />
                            <Text type="secondary">{new Date(item.createdAt).toLocaleDateString()}</Text>
                          </Space>
                        }
                      />
                      <Paragraph>{item.question}</Paragraph>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">No unanswered questions at the moment</Text>
                </div>
              )}
            </Card>
          </TabPane>
          
          <TabPane tab={<span><StarOutlined /> Feedback</span>} key="3">
            <Card>
              <Title level={4}>Recent Feedback</Title>
              {recentFeedback.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={recentFeedback}
                  pagination={{ pageSize: 5 }}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.memberName || 'Member'}</Text>}
                        description={
                          <Space>
                            <Rate disabled defaultValue={item.rating} allowHalf />
                            <Text type="secondary">{new Date(item.createdAt).toLocaleDateString()}</Text>
                          </Space>
                        }
                      />
                      <Paragraph>"{item.content}"</Paragraph>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">No feedback received yet</Text>
                </div>
              )}
            </Card>
          </TabPane>
          
          <TabPane tab={<span><BarChartOutlined /> Performance</span>} key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Performance Overview</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={12}>
                      <Statistic
                        title="Active Members"
                        value={performanceMetrics.active_members}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={12}>
                      <Statistic
                        title="Completed Plans"
                        value={performanceMetrics.completed_successfully}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <div className="text-center">
                    <Progress
                      type="circle"
                      percent={performanceMetrics.success_rate}
                      format={percent => `${percent}% Success Rate`}
                    />
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Member Status Distribution</Title>
                  <div className="member-status-chart">
                    {assignedMembers.length > 0 ? (
                      <List
                        dataSource={[
                          { 
                            status: 'Active Plans', 
                            count: assignedMembers.filter(m => m.status).length,
                            color: '#52c41a' 
                          },
                          { 
                            status: 'Completed Plans', 
                            count: assignedMembers.filter(m => m.current_phase === 'COMPLETED').length,
                            color: '#1890ff' 
                          },
                          { 
                            status: 'No Plans', 
                            count: assignedMembers.filter(m => m.current_phase === 'No Plan').length,
                            color: '#faad14' 
                          }
                        ]}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Avatar 
                                  style={{ backgroundColor: item.color }} 
                                  icon={<FireOutlined />} 
                                />
                              }
                              title={item.status}
                              description={`${item.count} members`}
                            />
                            <Progress 
                              percent={assignedMembers.length > 0 ? Math.round((item.count / assignedMembers.length) * 100) : 0} 
                              strokeColor={item.color}
                              size="small"
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <div className="text-center py-4">
                        <Text type="secondary">No member data available</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default CoachDashboard;