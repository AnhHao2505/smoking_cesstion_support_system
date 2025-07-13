import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Spin,
  Modal,
  Form,
  Input,
  Alert,
  Descriptions
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
  FireOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import { getCoachDashboardData } from '../../services/coachDashboardServiceReal';
import { getAssignedMembers, getCoachProfile } from '../../services/coachManagementService';
import { getFeedbacksForCoach } from '../../services/feebackService';
import { getUnansweredQna, answerQuestion } from '../../services/askQuestionService';
import { getNewestQuitPlan } from '../../services/quitPlanService';
import { getPhasesOfPlan } from '../../services/quitPhaseService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const CoachDashboard = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
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
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [viewPlanModalVisible, setViewPlanModalVisible] = useState(false);
  const [selectedMemberPlan, setSelectedMemberPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planPhases, setPlanPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);

  const [answerForm] = Form.useForm();

  // Get coachId from URL params or current user
  const urlCoachId = searchParams.get('coachId');
  const [actualCoachId, setActualCoachId] = useState(null);
  const coachId = urlCoachId || actualCoachId;
  
  // Check if viewing own profile or another coach's profile
  const isViewingOwnProfile = !urlCoachId || urlCoachId === actualCoachId?.toString();

  // Fetch actual coachId for the current user when not provided in URL
  useEffect(() => {
    const fetchActualCoachId = async () => {
      if (!urlCoachId && currentUser?.role === 'COACH') {
        try {
          console.log('Fetching coach profile to get actual coachId...');
          const myProfile = await getMyProfile();
          console.log('My profile response:', myProfile);
          
          if (myProfile.success && myProfile.data) {
            // For coaches, the profile should contain their coachId
            const coachIdFromProfile = myProfile.data.coachId || myProfile.data.id;
            console.log('Coach ID from profile:', coachIdFromProfile);
            setActualCoachId(coachIdFromProfile);
          } else {
            console.warn('Failed to get coach profile, using userId as fallback');
            setActualCoachId(currentUser?.userId);
          }
        } catch (error) {
          console.error('Error fetching coach profile for ID:', error);
          // Fallback to userId if profile fetch fails
          setActualCoachId(currentUser?.userId);
        }
      }
    };

    fetchActualCoachId();
  }, [urlCoachId, currentUser?.role, currentUser?.userId]);

  useEffect(() => {
    const fetchCoachDashboardData = async () => {
      // Wait for coachId to be determined
      if (!coachId) {
        return; // Don't show error yet, still determining coachId
      }

      try {
        setLoading(true);

        // Fetch coach profile using updated API
        const profileResponse = await getCoachProfile(coachId);
        if (profileResponse.success) {
          setCoachProfile(profileResponse.data);
        }

        // Only fetch detailed data if viewing own profile or if user has admin role
        if (isViewingOwnProfile || currentUser?.role === 'ADMIN') {
          // Fetch assigned members using updated API
          console.log('Fetching assigned members for coachId:', coachId);
          const membersResponse = await getAssignedMembers(coachId);
          console.log('Full assigned members response:', membersResponse);

          const members = membersResponse || [];
          console.log('Assigned Members API Response:', members);
          console.log('Number of assigned members:', members.length);

          // Transform member data to match table structure based on new API response
          const transformedMembers = members.map((member, index) => ({
            user_id: member.memberId || index,
            full_name: member.name || 'Unknown Member',
            email: member.email,
            photo_url: null, // Not provided in API response
            current_phase: member.planId ? 'ACTIVE' : 'No Plan', // Based on whether planId exists
            progress: Math.floor(Math.random() * 100), // Placeholder until real progress API
            days_smoke_free: 0, // Not provided in API response
            last_checkin: 'N/A', // Not provided in API response
            status: member.planId ? true : false, // Active if has plan
            planId: member.planId,
            initialStatusId: member.initialStatusId
          }));

          console.log('Transformed members for table:', transformedMembers);
          setAssignedMembers(transformedMembers);

          // Calculate performance metrics based on new data structure
          const totalMembers = members.length;
          const activeMembers = members.filter(m => m.planId).length; // Members with plans
          const completedPlans = 0; // Cannot determine from current API response
          const successRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

          setPerformanceMetrics({
            total_members: totalMembers,
            active_members: activeMembers,
            completed_successfully: completedPlans,
            average_rating: profileResponse.data?.rating || 0,
            success_rate: successRate
          });

          // Fetch unanswered questions using updated API
          const questionsResponse = await getUnansweredQna(0, 10);
          setUnansweredQuestions(questionsResponse.content || []);

          // Fetch feedback using updated API
          const feedbackResponse = await getFeedbacksForCoach(coachId);
          // Handle both array and object response formats
          const feedbacks = feedbackResponse;
          if(feedbacks.length > 0) {
            setRecentFeedback(feedbacks.slice(0, 10)); // Show recent 10 feedbacks
          }
        } else {
          // If viewing another coach's profile, only show basic profile info
          setAssignedMembers([]);
          setUnansweredQuestions([]);
          setRecentFeedback([]);
          setPerformanceMetrics({
            total_members: 0,
            active_members: 0,
            completed_successfully: 0,
            average_rating: profileResponse.data?.rating || 0,
            success_rate: 0
          });
        }

      } catch (error) {
        console.error("Error fetching coach dashboard data:", error);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachDashboardData();
  }, [coachId, isViewingOwnProfile, currentUser?.role]);

  // Show different loading state while determining coachId
  if (!urlCoachId && !actualCoachId && currentUser?.role === 'COACH') {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary">Loading coach profile...</Text>
        </div>
      </div>
    );
  }

  // Individual refresh functions
  const refreshMembers = async () => {
    if (!coachId || !isViewingOwnProfile) return;

    try {
      setMembersLoading(true);
      const membersResponse = await getAssignedMembers(coachId);
      console.log(membersResponse)
      const members = membersResponse || [];

      // Transform member data based on new API response structure
      const transformedMembers = members.map((member, index) => ({
        user_id: member.memberId || index,
        full_name: member.name || 'Unknown Member',
        email: member.email,
        photo_url: null, // Not provided in API response
        current_phase: member.planId ? 'ACTIVE' : 'No Plan',
        progress: Math.floor(Math.random() * 100),
        days_smoke_free: 0, // Not provided in API response
        last_checkin: 'N/A', // Not provided in API response
        status: member.planId ? true : false,
        planId: member.planId,
        initialStatusId: member.initialStatusId
      }));

      setAssignedMembers(transformedMembers);

      // Update performance metrics
      const totalMembers = members.length;
      const activeMembers = members.filter(m => m.planId).length;
      setPerformanceMetrics(prev => ({
        ...prev,
        total_members: totalMembers,
        active_members: activeMembers,
        success_rate: totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0
      }));

      message.success('Member list refreshed');
    } catch (error) {
      console.error('Error refreshing members:', error);
      message.error('Failed to refresh member list');
    } finally {
      setMembersLoading(false);
    }
  };

  const refreshQuestions = async () => {
    if (!coachId || !isViewingOwnProfile) return;

    try {
      setQuestionsLoading(true);
      const questionsResponse = await getUnansweredQna(0, 10);
      setUnansweredQuestions(questionsResponse.content || []);
      message.success('Questions refreshed');
    } catch (error) {
      console.error('Error refreshing questions:', error);
      message.error('Failed to refresh questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const refreshFeedback = async () => {
    if (!coachId || !isViewingOwnProfile) return;

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

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswerModalVisible(true);
    answerForm.resetFields();
  };

  const handleSubmitAnswer = async (values) => {
    if (!selectedQuestion) return;

    try {
      setSubmittingAnswer(true);
      await answerQuestion(selectedQuestion.id, values.answer);
      
      message.success('Answer submitted successfully!');
      setAnswerModalVisible(false);
      setSelectedQuestion(null);
      answerForm.resetFields();
      
      // Refresh the questions list
      await refreshQuestions();
    } catch (error) {
      console.error('Error submitting answer:', error);
      message.error('Failed to submit answer: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleViewPlan = async (member) => {
    if (!member.user_id) {
      message.error('Member ID not found');
      return;
    }

    try {
      setLoadingPlan(true);
      setViewPlanModalVisible(true);
      setPlanPhases([]); // Reset phases
      
      console.log('Fetching newest quit plan for member:', member.user_id);
      const response = await getNewestQuitPlan(member.user_id);
      console.log('Newest quit plan response:', response);
      
      if (response && (response.success || response.data || response.id)) {
        // Handle different response formats
        let planData = null;
        if (response.success && response.data) {
          planData = response.data;
        } else if (response.data) {
          planData = response.data;
        } else if (response.id) {
          planData = response;
        }
        
        if (planData) {
          const planWithMemberInfo = {
            ...planData,
            memberName: member.full_name,
            memberEmail: member.email
          };
          
          setSelectedMemberPlan(planWithMemberInfo);
          
          // Fetch phases for this plan
          const planId = planData.id || planData.planId || planData.quit_plan_id;
          if (planId) {
            await fetchPlanPhases(planId);
          }
        } else {
          message.warning('No quit plan data found for this member');
          setSelectedMemberPlan(null);
        }
      } else {
        message.info('This member does not have any quit plans yet');
        setSelectedMemberPlan(null);
      }
    } catch (error) {
      console.error('Error fetching member quit plan:', error);
      message.error('Failed to load quit plan: ' + (error.message || 'Unknown error'));
      setSelectedMemberPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchPlanPhases = async (planId) => {
    try {
      setLoadingPhases(true);
      console.log('Fetching phases for plan ID:', planId);
      
      const phasesResponse = await getPhasesOfPlan(planId);
      console.log('Phases response:', phasesResponse);
      
      if (phasesResponse && phasesResponse.data && Array.isArray(phasesResponse.data)) {
        setPlanPhases(phasesResponse.data);
      } else if (phasesResponse && Array.isArray(phasesResponse)) {
        setPlanPhases(phasesResponse);
      } else {
        console.log('No phases found or unexpected response format');
        setPlanPhases([]);
      }
    } catch (error) {
      console.error('Error fetching plan phases:', error);
      message.warning('Failed to load quit phases for this plan');
      setPlanPhases([]);
    } finally {
      setLoadingPhases(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // Show error if we still can't determine coachId after loading
  if (!coachId && currentUser?.role === 'COACH') {
    return (
      <div className="dashboard loading-container">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="danger">Unable to load coach dashboard. Please try logging in again.</Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => window.location.href = '/auth/login'}>
              Go to Login
            </Button>
          </div>
        </div>
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
        <Space direction="vertical" size="small">
          <Space>
            <Avatar src={record.photo_url} icon={<UserOutlined />} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      )
    },
    {
      title: 'Plan Status',
      dataIndex: 'current_phase',
      key: 'current_phase',
      render: (phase, record) => {
        let color = 'blue';
        let text = phase;

        if (phase === 'ACTIVE' && record.planId) {
          color = 'green';
          text = `Plan #${record.planId}`;
        } else if (phase === 'No Plan') {
          color = 'default';
          text = 'No Plan';
        }

        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Initial Status',
      dataIndex: 'initialStatusId',
      key: 'initialStatusId',
      render: (statusId) => (
        statusId ? <Tag color="blue">Status #{statusId}</Tag> : <Text type="secondary">N/A</Text>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
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
        <Space size="small" direction="vertical">
          {/* <Space size="small">
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
          </Space> */}
          {record.current_phase === 'No Plan' && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                // Navigate to create quit plan
                window.location.href = `/coach/create-quit-plan?memberId=${record.user_id}`;
              }}
            >
              Create Plan
            </Button>
          )}
          {record.planId && (
            <Button
              type="link"
              size="small"
              onClick={() => handleViewPlan(record)}
            >
              View Plan
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard coach-dashboard">
      <div className="container py-4">
        {/* Alert when viewing another coach's profile */}
        {!isViewingOwnProfile && (
          <Alert
            message="Viewing Another Coach's Profile"
            description={`You are viewing the profile of coach ID ${coachId}. Some functions are restricted to protect privacy.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button 
                size="small" 
                onClick={() => window.location.href = '/coach/dashboard'}
              >
                Back to My Dashboard
              </Button>
            }
          />
        )}
        
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
        {isViewingOwnProfile ? (
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

          <TabPane tab={
            <span>
              <MessageOutlined />
              Questions ({unansweredQuestions.length})
              {unansweredQuestions.filter(q => q.overdue).length > 0 && (
                <Badge
                  count={unansweredQuestions.filter(q => q.overdue).length}
                  style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }}
                />
              )}
            </span>
          } key="2">
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Unanswered Questions
                    {unansweredQuestions.filter(q => q.overdue).length > 0 && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        {unansweredQuestions.filter(q => q.overdue).length} Overdue
                      </Tag>
                    )}
                  </Title>
                </div>
                <Space>
                  <Button
                    type="primary"
                    onClick={refreshQuestions}
                    loading={questionsLoading}
                  >
                    Refresh Questions
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/coach/qna'}
                  >
                    View All Questions
                  </Button>
                </Space>
              </div>
              {unansweredQuestions.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={unansweredQuestions}
                  pagination={{ pageSize: 5 }}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      extra={
                        <Space direction="vertical" size="small">
                          <Button
                            type="primary"
                            onClick={() => handleAnswerQuestion(item)}
                          >
                            Answer
                          </Button>
                          {item.overdue && (
                            <Tag color="red">Overdue</Tag>
                          )}
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.memberName || 'Anonymous Member'}</Text>}
                        description={
                          <Space wrap>
                            <Space>
                              <CalendarOutlined />
                              <Text type="secondary">
                                Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                              </Text>
                            </Space>
                            <Space>
                              <ClockCircleOutlined />
                              <Text type={item.overdue ? "danger" : "secondary"}>
                                Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Unknown'}
                              </Text>
                            </Space>
                            {item.overdue && (
                              <Tag color="volcano" icon={<ClockCircleOutlined />}>
                                Overdue
                              </Tag>
                            )}
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
                            status: 'Members with Plans',
                            count: assignedMembers.filter(m => m.planId).length,
                            color: '#52c41a'
                          },
                          {
                            status: 'Members without Plans',
                            count: assignedMembers.filter(m => !m.planId).length,
                            color: '#faad14'
                          },
                          {
                            status: 'Active Members',
                            count: assignedMembers.filter(m => m.status).length,
                            color: '#1890ff'
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
        ) : (
          // Limited view for other coaches' profiles
          <Card title="Coach Profile View" style={{ marginTop: 16 }}>
            <Alert
              message="Limited Information"
              description="You can only view basic profile information for other coaches. Member data and sensitive information are not available."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div className="text-center py-4">
              <Text type="secondary">Profile information is displayed above. Additional details are restricted.</Text>
            </div>
          </Card>
        )}
      </div>

      {/* Answer Question Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            <span>Answer Question</span>
            {selectedQuestion && isOverdue(selectedQuestion.deadline) && (
              <Tag color="red">Overdue</Tag>
            )}
          </Space>
        }
        open={answerModalVisible}
        onCancel={() => {
          setAnswerModalVisible(false);
          setSelectedQuestion(null);
          answerForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedQuestion && (
          <>
            {/* Question Details */}
            <Card 
              size="small" 
              style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{selectedQuestion.memberName || 'Anonymous Member'}</Text>
                  <Divider type="vertical" />
                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">
                    {formatDate(selectedQuestion.createdAt)}
                  </Text>
                </Space>
                
                <div>
                  <Text strong style={{ color: '#1890ff' }}>Question:</Text>
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                    {selectedQuestion.question}
                  </Paragraph>
                </div>
              </Space>
            </Card>

            {/* Priority Alert for Overdue */}
            {isOverdue(selectedQuestion.deadline) && (
              <Alert
                message="Overdue Question"
                description="This question is overdue and requires immediate attention."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Answer Form */}
            <Form
              form={answerForm}
              layout="vertical"
              onFinish={handleSubmitAnswer}
              requiredMark={false}
            >
              <Form.Item
                name="answer"
                label="Your Answer"
                rules={[
                  { required: true, message: 'Please provide an answer!' },
                  { min: 10, message: 'Answer must be at least 10 characters!' },
                  { max: 2000, message: 'Answer cannot exceed 2000 characters!' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Provide a detailed and helpful answer for the member..."
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingAnswer}
                    icon={<SendOutlined />}
                    size="large"
                  >
                    {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => {
                      setAnswerModalVisible(false);
                      setSelectedQuestion(null);
                      answerForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* View Plan Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            <span>Quit Plan Details</span>
            {selectedMemberPlan && (
              <Tag color="blue">
                {selectedMemberPlan.memberName}
              </Tag>
            )}
          </Space>
        }
        open={viewPlanModalVisible}
        onCancel={() => {
          setViewPlanModalVisible(false);
          setSelectedMemberPlan(null);
          setPlanPhases([]);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setViewPlanModalVisible(false);
              setSelectedMemberPlan(null);
              setPlanPhases([]);
            }}
          >
            Close
          </Button>,
          selectedMemberPlan && (
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                // Navigate to edit plan page
                window.location.href = `/coach/quit-plan/${selectedMemberPlan.id || selectedMemberPlan.planId}?memberId=${selectedMemberPlan.memberId}`;
              }}
            >
              Edit Plan
            </Button>
          )
        ]}
        width={800}
        destroyOnClose
      >
        {loadingPlan ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading quit plan...</div>
          </div>
        ) : selectedMemberPlan ? (
          <>
            {/* Plan Overview */}
            <Card 
              size="small" 
              style={{ marginBottom: 16 }}
              title="Plan Overview"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Member: </Text>
                      <Text>{selectedMemberPlan.memberName}</Text>
                    </div>
                    <div>
                      <Text strong>Email: </Text>
                      <Text>{selectedMemberPlan.memberEmail}</Text>
                    </div>
                    <div>
                      <Text strong>Plan Status: </Text>
                      <Tag color={
                        selectedMemberPlan.quitPlanStatus === 'ACTIVE' ? 'green' :
                        selectedMemberPlan.quitPlanStatus === 'PENDING_APPROVAL' ? 'orange' :
                        selectedMemberPlan.quitPlanStatus === 'COMPLETED' ? 'blue' :
                        selectedMemberPlan.quitPlanStatus === 'DENIED' ? 'red' : 'default'
                      }>
                        {selectedMemberPlan.quitPlanStatus || selectedMemberPlan.status || 'Unknown'}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Smoking Status: </Text>
                      <Text>{selectedMemberPlan.currentSmokingStatus || 'Not specified'}</Text>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Start Date: </Text>
                      <Text>{selectedMemberPlan.startDate ? new Date(selectedMemberPlan.startDate).toLocaleDateString() : 'Not set'}</Text>
                    </div>
                    <div>
                      <Text strong>End Date: </Text>
                      <Text>{selectedMemberPlan.endDate ? new Date(selectedMemberPlan.endDate).toLocaleDateString() : 'Not set'}</Text>
                    </div>
                    <div>
                      <Text strong>Coach: </Text>
                      <Text>{selectedMemberPlan.coachName || 'Not assigned'}</Text>
                    </div>
                    <div>
                      <Text strong>Is Newest: </Text>
                      <Tag color={selectedMemberPlan.isNewest ? 'green' : 'default'}>
                        {selectedMemberPlan.isNewest ? 'Yes' : 'No'}
                      </Tag>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Plan Details */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Motivation & Goals" style={{ height: '100%' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Motivation:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>
                        {selectedMemberPlan.motivation || 'Not specified'}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong>Reward Plan:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                        {selectedMemberPlan.rewardPlan || 'Not specified'}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Strategies & Support" style={{ height: '100%' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Coping Strategies:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>
                        {selectedMemberPlan.copingStrategies || 'Not specified'}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong>Support Resources:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                        {selectedMemberPlan.supportResources || 'Not specified'}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Medications" style={{ height: '100%' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Medications to Use:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>
                        {selectedMemberPlan.medicationsToUse || 'None specified'}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong>Instructions:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                        {selectedMemberPlan.medicationInstructions || 'No instructions'}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Prevention & Triggers" style={{ height: '100%' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Triggers to Avoid:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>
                        {selectedMemberPlan.smokingTriggersToAvoid || 'Not specified'}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong>Relapse Prevention:</Text>
                      <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                        {selectedMemberPlan.relapsePreventionStrategies || 'Not specified'}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Quit Phases Section */}
            <Card size="small" title="Quit Phases" style={{ marginTop: 16 }}>
              {loadingPhases ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin size="small" />
                  <div style={{ marginTop: 8 }}>Loading phases...</div>
                </div>
              ) : planPhases && planPhases.length > 0 ? (
                <div>
                  {planPhases
                    .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0))
                    .map((phase, index) => (
                    <Card 
                      key={phase.id || index}
                      size="small" 
                      style={{ 
                        marginBottom: index < planPhases.length - 1 ? 12 : 0,
                        backgroundColor: '#fafafa'
                      }}
                      title={
                        <Space>
                          <span>Phase {phase.phaseOrder || index + 1}</span>
                          {phase.name && <span>- {phase.name}</span>}
                        </Space>
                      }
                    >
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div>
                              <Text strong>Duration: </Text>
                              <Text>{phase.duration || 'Not specified'}</Text>
                            </div>
                            <div>
                              <Text strong>Phase Order: </Text>
                              <Tag color="blue">{phase.phaseOrder || index + 1}</Tag>
                            </div>
                          </Space>
                        </Col>
                        <Col xs={24} md={12}>
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            {phase.startDate && (
                              <div>
                                <Text strong>Start Date: </Text>
                                <Text>
                                  {new Date(phase.startDate).toLocaleDateString()}
                                </Text>
                              </div>
                            )}
                            {phase.endDate && (
                              <div>
                                <Text strong>End Date: </Text>
                                <Text>
                                  {new Date(phase.endDate).toLocaleDateString()}
                                </Text>
                              </div>
                            )}
                            {phase.status && (
                              <div>
                                <Text strong>Status: </Text>
                                <Tag color={
                                  phase.status === 'COMPLETED' ? 'green' :
                                  phase.status === 'IN_PROGRESS' ? 'blue' :
                                  phase.status === 'PENDING' ? 'orange' :
                                  'default'
                                }>
                                  {phase.status}
                                </Tag>
                              </div>
                            )}
                          </Space>
                        </Col>
                      </Row>
                      
                      {phase.recommendGoal && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong>Recommended Goal:</Text>
                          <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                            {phase.recommendGoal}
                          </Paragraph>
                        </div>
                      )}
                      
                      {phase.goal && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong>Custom Goal:</Text>
                          <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                            {phase.goal}
                          </Paragraph>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">No phases found for this quit plan</Text>
                </div>
              )}
            </Card>

            {selectedMemberPlan.additionalNotes && (
              <Card size="small" title="Additional Notes" style={{ marginTop: 16 }}>
                <Paragraph>{selectedMemberPlan.additionalNotes}</Paragraph>
              </Card>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No quit plan found for this member</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoachDashboard;