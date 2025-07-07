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
import { getAssignedMembers, getCoachProfile } from '../../services/coachManagementService';
import { getFeedbacksForCoach } from '../../services/feebackService';
import { getUnansweredQna } from '../../services/askQuestionService';
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
  const [membersLoading, setMembersLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
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
        
        // Fetch coach profile using updated API
        const profileResponse = await getCoachProfile(coachId);
        if (profileResponse.success) {
          setCoachProfile(profileResponse.data);
        }

        // Fetch assigned members using updated API
        const membersResponse = await getAssignedMembers(coachId);
        if (membersResponse.success) {
          const members = membersResponse.data || [];
          
          // Transform member data to match table structure
          const transformedMembers = members.map((member, index) => ({
            user_id: member.memberId || index,
            full_name: member.memberName || 'Unknown Member',
            photo_url: member.photoUrl,
            current_phase: member.planStatus || 'No Plan',
            progress: Math.floor(Math.random() * 100), // Placeholder until real progress API
            days_smoke_free: member.daysSmokeFree || 0,
            last_checkin: member.lastCheckin ? new Date(member.lastCheckin).toLocaleDateString() : 'N/A',
            status: member.isActive !== undefined ? member.isActive : true
          }));
          
          setAssignedMembers(transformedMembers);
          
          // Calculate performance metrics
          const totalMembers = members.length;
          const activeMembers = members.filter(m => m.isActive).length;
          const completedPlans = members.filter(m => m.planStatus === 'COMPLETED').length;
          const successRate = totalMembers > 0 ? Math.round((completedPlans / totalMembers) * 100) : 0;
          
          setPerformanceMetrics({
            total_members: totalMembers,
            active_members: activeMembers,
            completed_successfully: completedPlans,
            average_rating: profileResponse.data?.rating || 0,
            success_rate: successRate
          });
        }

        // Fetch unanswered questions using updated API
        const questionsResponse = await getUnansweredQna(0, 10);
        if (questionsResponse.success) {
          setUnansweredQuestions(questionsResponse.data.content || []);
        }

        // Fetch feedback using updated API
        const feedbackResponse = await getFeedbacksForCoach(coachId);
        if (feedbackResponse.success) {
          // Handle both array and object response formats
          const feedbacks = Array.isArray(feedbackResponse.data) 
            ? feedbackResponse.data 
            : feedbackResponse.data?.content || [];
          setRecentFeedback(feedbacks.slice(0, 10)); // Show recent 10 feedbacks
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

  // Individual refresh functions
  const refreshMembers = async () => {
    if (!coachId) return;
    
    try {
      setMembersLoading(true);
      const membersResponse = await getAssignedMembers(coachId);
      if (membersResponse.success) {
        const members = membersResponse.data || [];
        const transformedMembers = members.map((member, index) => ({
          user_id: member.memberId || index,
          full_name: member.memberName || 'Unknown Member',
          photo_url: member.photoUrl,
          current_phase: member.planStatus || 'No Plan',
          progress: Math.floor(Math.random() * 100),
          days_smoke_free: member.daysSmokeFree || 0,
          last_checkin: member.lastCheckin ? new Date(member.lastCheckin).toLocaleDateString() : 'N/A',
          status: member.isActive !== undefined ? member.isActive : true
        }));
        setAssignedMembers(transformedMembers);
        message.success('Member list refreshed');
      }
    } catch (error) {
      console.error('Error refreshing members:', error);
      message.error('Failed to refresh member list');
    } finally {
      setMembersLoading(false);
    }
  };

  const refreshQuestions = async () => {
    if (!coachId) return;
    
    try {
      setQuestionsLoading(true);
      const questionsResponse = await getUnansweredQna(0, 10);
      if (questionsResponse.success) {
        setUnansweredQuestions(questionsResponse.data.content || []);
        message.success('Questions refreshed');
      }
    } catch (error) {
      console.error('Error refreshing questions:', error);
      message.error('Failed to refresh questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const refreshFeedback = async () => {
    if (!coachId) return;
    
    try {
      setFeedbackLoading(true);
      const feedbackResponse = await getFeedbacksForCoach(coachId);
      if (feedbackResponse.success) {
        const feedbacks = Array.isArray(feedbackResponse.data) 
          ? feedbackResponse.data 
          : feedbackResponse.data?.content || [];
        setRecentFeedback(feedbacks.slice(0, 10));
        message.success('Feedback refreshed');
      }
    } catch (error) {
      console.error('Error refreshing feedback:', error);
      message.error('Failed to refresh feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

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
    photo_url: null,
    certificates: [],
    workingHours: 'Monday - Friday, 9:00 AM - 5:00 PM',
    contactNumber: 'Not available'
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
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              // Navigate to member details page
              window.location.href = `/coach/member-details/${record.user_id}`;
            }}
          >
            View Details
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              // Navigate to chat with member
              window.location.href = `/coach/chat?memberId=${record.user_id}`;
            }}
          >
            Contact
          </Button>
          {record.current_phase === 'No Plan' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                // Navigate to create quit plan
                window.location.href = `/coach/create-plan?memberId=${record.user_id}`;
              }}
            >
              Create Plan
            </Button>
          )}
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
              
              {/* Additional coach information */}
              {profileData.certificates && profileData.certificates.length > 0 && (
                <div className="mb-3">
                  <Text strong>Certificates: </Text>
                  {profileData.certificates.map((cert, index) => (
                    <Tag key={index} color="blue">{cert}</Tag>
                  ))}
                </div>
              )}
              
              {profileData.workingHours && (
                <div className="mb-3">
                  <Text strong>Working Hours: </Text>
                  <Text>{profileData.workingHours}</Text>
                </div>
              )}
              
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
            <Card
              title="Member Progress"
              extra={
                <Button 
                  size="small"
                  onClick={refreshMembers} 
                  loading={membersLoading}
                >
                  Refresh
                </Button>
              }
            >
              <Table 
                dataSource={assignedMembers} 
                columns={memberColumns} 
                rowKey="user_id"
                pagination={{ pageSize: 5 }}
                loading={membersLoading}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><MessageOutlined /> Questions ({unansweredQuestions.length})</span>} key="2">
            <Card>
              <Title level={4}>Unanswered Questions</Title>
              <Button 
                type="primary" 
                onClick={refreshQuestions} 
                loading={questionsLoading}
                style={{ marginBottom: 16 }}
              >
                Refresh Questions
              </Button>
              {unansweredQuestions.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={unansweredQuestions}
                  pagination={{ pageSize: 5 }}
                  renderItem={item => (
                    <List.Item
                      key={item.qnaId || item.id}
                      extra={
                        <Space>
                          <Button 
                            type="primary"
                            onClick={() => {
                              // Navigate to Q&A page to answer
                              window.location.href = `/coach/qna?questionId=${item.qnaId || item.id}`;
                            }}
                          >
                            Answer
                          </Button>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.askerName || item.memberName || 'Anonymous Member'}</Text>}
                        description={
                          <Space>
                            <CalendarOutlined />
                            <Text type="secondary">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                            </Text>
                            {item.category && <Tag>{item.category}</Tag>}
                          </Space>
                        }
                      />
                      <Paragraph>{item.question || item.questionContent}</Paragraph>
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
              <Button 
                type="primary" 
                onClick={refreshFeedback} 
                loading={feedbackLoading}
                style={{ marginBottom: 16 }}
              >
                Refresh Feedback
              </Button>
              {recentFeedback.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={recentFeedback}
                  pagination={{ pageSize: 5 }}
                  renderItem={item => (
                    <List.Item key={item.feedbackId || item.id}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.memberName || 'Anonymous Member'}</Text>}
                        description={
                          <Space>
                            <Rate disabled defaultValue={item.rating || item.star} allowHalf />
                            <Text type="secondary">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                            </Text>
                            {item.reviewStatus && (
                              <Tag color={item.reviewStatus === 'REVIEWED' ? 'green' : 'orange'}>
                                {item.reviewStatus}
                              </Tag>
                            )}
                          </Space>
                        }
                      />
                      <Paragraph>"{item.content || item.feedbackContent}"</Paragraph>
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