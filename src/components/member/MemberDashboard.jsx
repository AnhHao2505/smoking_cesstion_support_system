import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Steps, 
  List, 
  Avatar, 
  Tag, 
  Divider, 
  Space, 
  Badge, 
  Timeline,
  Button,
  Spin,
  message
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  FireOutlined,
  TrophyOutlined,
  HeartOutlined,
  RiseOutlined,
  CalendarOutlined,
  BellOutlined,
  QuestionOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { getMyProfile } from '../../services/memberProfileService';
import { getMemberDailyLogs } from '../../services/dailylogService';
import { getMyQna } from '../../services/askQuestionService';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../../utils/apiEndpoints';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MemberDashboard = () => {
  const { currentUser } = useAuth();
  const [memberProfile, setMemberProfile] = useState(null);
  const [quitPlan, setQuitPlan] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [questionsAnswers, setQuestionsAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = currentUser?.userId;

  // Helper function to get newest quit plan
  const getNewestQuitPlan = async (memberId) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PLANS.NEWEST, {
        params: { memberId }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  };

  // Helper function to get phases for a quit plan
  const getQuitPlanPhases = async (quitPlanId) => {
    try {
      if (!quitPlanId) {
        throw new Error('Quit plan ID is required');
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.QUIT_PHASES.FROM_PLAN, {
        params: { quitPlanId }
      });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching phases:', error);
      throw handleApiError(error);
    }
  };

  useEffect(() => {
    const fetchMemberDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch member profile
        const profile = await getMyProfile();
        setMemberProfile(profile);

        // Fetch newest quit plan
        const quitPlanData = await getNewestQuitPlan(userId);
        console.log('Quit plan data:', quitPlanData); // Debug log
        
        if (quitPlanData) {
          try {
            // Check for quit plan ID field - it might be named differently
            const quitPlanId = quitPlanData.quit_plan_id || quitPlanData.id || quitPlanData.quitPlanId;
            console.log('Quit plan ID:', quitPlanId); // Debug log
            
            if (quitPlanId) {
              // Fetch phases for the quit plan
              const phases = await getQuitPlanPhases(quitPlanId);
              setQuitPlan({
                ...quitPlanData,
                phases: phases || []
              });
            } else {
              console.warn("No quit plan ID found in data");
              // Use mock phases if we can't fetch real ones
              const mockPhases = [
                {
                  phase_name: "Preparation",
                  objective: "Prepare mentally and physically for quitting",
                  start_date: quitPlanData.start_date,
                  end_date: quitPlanData.end_date,
                  is_completed: false,
                  completion_percentage: 30
                }
              ];
              setQuitPlan({
                ...quitPlanData,
                phases: mockPhases
              });
            }
          } catch (phaseError) {
            console.warn("Could not fetch phases:", phaseError);
            // Use mock phases as fallback
            const mockPhases = [
              {
                phase_name: "Active Phase",
                objective: "Maintain smoke-free lifestyle",
                start_date: quitPlanData.start_date,
                end_date: quitPlanData.end_date,
                is_completed: false,
                completion_percentage: 50
              }
            ];
            setQuitPlan({
              ...quitPlanData,
              phases: mockPhases
            });
          }
        }

        // Fetch daily logs
        try {
          const records = await getMemberDailyLogs(userId);
          setDailyRecords(records || []);
        } catch (logError) {
          console.warn("Could not fetch daily logs:", logError);
          setDailyRecords([]);
        }

        // Fetch Q&A data
        try {
          const qaData = await getMyQna(0, 5);
          setQuestionsAnswers(qaData?.content || []);
        } catch (qaError) {
          console.warn("Could not fetch Q&A data:", qaError);
          setQuestionsAnswers([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching member dashboard data:", error);
        message.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchMemberDashboardData();
  }, [userId]);

  if (loading || !userId) {
    return (
      <div className="dashboard loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          {!userId ? 'Please log in to view dashboard' : 'Loading dashboard...'}
        </div>
      </div>
    );
  }

  if (!quitPlan) {
    return (
      <div className="dashboard member-dashboard">
        <div className="container py-4">
          <Card className="mb-4 profile-card">
            <Row gutter={[24, 24]} align="middle" justify="center">
              <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                <Avatar size={120} icon={<UserOutlined />} />
                <div className="mt-3">
                  <Title level={2}>{memberProfile?.name || 'Member'}</Title>
                  <Paragraph>
                    <Text type="secondary">
                      <strong>Email:</strong> {memberProfile?.email || 'N/A'}
                    </Text>
                  </Paragraph>
                  <div style={{ marginTop: '20px' }}>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      No quit plan found. Please create a quit plan to get started with your smoking cessation journey.
                    </Text>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Button type="primary" size="large">
                      Create Quit Plan
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get current phase index for the Steps component
  const getCurrentPhaseIndex = () => {
    if (!quitPlan || !quitPlan.phases || quitPlan.phases.length === 0) {
      return 0;
    }
    
    // Find the first incomplete phase or return the last phase if all are complete
    const incompletePhaseIndex = quitPlan.phases.findIndex(phase => !phase.is_completed);
    return incompletePhaseIndex >= 0 ? incompletePhaseIndex : quitPlan.phases.length - 1;
  };

  // Calculate statistics from quit plan and daily logs
  const calculateStatistics = () => {
    const stats = {
      daysSmokeeFree: 0,
      overallProgress: 0,
      moneySaved: 0,
      cigarettesAvoided: 0
    };

    if (quitPlan) {
      // Calculate days smoke-free from start date
      const startDate = new Date(quitPlan.start_date);
      const today = new Date();
      const timeDiff = today.getTime() - startDate.getTime();
      stats.daysSmokeeFree = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

      // Calculate overall progress based on phases
      if (quitPlan.phases && quitPlan.phases.length > 0) {
        const completedPhases = quitPlan.phases.filter(phase => phase.is_completed).length;
        stats.overallProgress = Math.round((completedPhases / quitPlan.phases.length) * 100);
      }

      // Calculate money saved (assuming $10 per pack, 20 cigarettes per pack)
      const cigarettesPerDay = quitPlan.cigarettes_per_day || 20;
      const costPerCigarette = 0.5; // $0.5 per cigarette
      stats.moneySaved = Math.round(stats.daysSmokeeFree * cigarettesPerDay * costPerCigarette);
      
      // Calculate cigarettes avoided
      stats.cigarettesAvoided = stats.daysSmokeeFree * cigarettesPerDay;
    }

    return stats;
  };

  const statistics = calculateStatistics();

  return (
    <div className="dashboard member-dashboard">
      <div className="container py-4">
        {/* Member Profile Overview */}
        <Card className="mb-4 profile-card">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6}>
              <div className="text-center">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                />
                <div className="mt-3">
                  <Tag color={memberProfile?.premium_membership || memberProfile?.premiumMembership ? "gold" : "blue"}>
                    {memberProfile?.premium_membership || memberProfile?.premiumMembership ? 'Premium' : 'Basic'} Member
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2}>{memberProfile?.name || 'Member'}</Title>
              <Paragraph>
                <Text type="secondary">
                  <strong>Email:</strong> {memberProfile?.email || 'N/A'}
                </Text>
                <br />
                <Text type="secondary">
                  <strong>Plan:</strong> {quitPlan?.plan_name || quitPlan?.name || 'N/A'}
                </Text>
                <br />
                <Text type="secondary">
                  <strong>Start Date:</strong> {formatDate(quitPlan?.start_date)}
                </Text>
                <br />
                <Text type="secondary">
                  <strong>Target Date:</strong> {formatDate(quitPlan?.end_date)}
                </Text>
              </Paragraph>
            </Col>
          </Row>
        </Card>

        {/* Progress Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Days Smoke-Free"
                value={statistics.daysSmokeeFree}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Progress"
                value={statistics.overallProgress}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress percent={statistics.overallProgress} showInfo={false} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Money Saved"
                value={statistics.moneySaved}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cigarettes Avoided"
                value={statistics.cigarettesAvoided}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Quit Phase Progress */}
            <Card title="Quit Plan Phases" className="mb-4">
              {quitPlan && quitPlan.phases && quitPlan.phases.length > 0 ? (
                <Steps current={getCurrentPhaseIndex()} direction="vertical">
                  {quitPlan.phases.map((phase, index) => (
                    <Step
                      key={index}
                      title={phase.phase_name}
                      description={
                        <div>
                          <Text>{phase.objective}</Text>
                          <br />
                          <Text type="secondary">
                            {formatDate(phase.start_date)} - {formatDate(phase.end_date)}
                          </Text>
                          {index === getCurrentPhaseIndex() && !phase.is_completed && (
                            <Progress 
                              percent={phase.completion_percentage || 0} 
                              size="small" 
                              style={{ marginTop: 8 }}
                            />
                          )}
                        </div>
                      }
                      status={
                        phase.is_completed 
                          ? 'finish' 
                          : index === getCurrentPhaseIndex()
                            ? 'process' 
                            : 'wait'
                      }
                    />
                  ))}
                </Steps>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No phases data available</Text>
                </div>
              )}
            </Card>

            {/* Health Improvements - Mock data since API not available */}
            <Card title="Health Improvements" className="mb-4">
              <Timeline>
                <Timeline.Item color="green">
                  <Text strong>Improved Blood Circulation</Text>
                  <br />
                  <Text type="secondary">Your circulation improves, making physical activities easier</Text>
                  <div>
                    <Tag color="success" style={{ marginTop: 4 }}>
                      Achieved after 2 weeks
                    </Tag>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text strong>Better Lung Function</Text>
                  <br />
                  <Text type="secondary">Your lung capacity increases and breathing becomes easier</Text>
                  <div>
                    <Tag color="success" style={{ marginTop: 4 }}>
                      Achieved after 1 month
                    </Tag>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <Text strong>Reduced Heart Disease Risk</Text>
                  <br />
                  <Text type="secondary">Your risk of heart disease drops significantly</Text>
                  <div>
                    <Tag color="processing" style={{ marginTop: 4 }}>
                      Expected after 1 year
                    </Tag>
                  </div>
                </Timeline.Item>
              </Timeline>
            </Card>

            {/* Recent Daily Records */}
            <Card title="Recent Daily Records" className="mb-4">
              {dailyRecords && dailyRecords.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={dailyRecords.slice(0, 3)}
                  renderItem={record => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={record.smoked_today ? <FireOutlined /> : <CheckCircleOutlined />}
                            style={{ 
                              backgroundColor: record.smoked_today ? '#ff4d4f' : '#52c41a' 
                            }}
                          />
                        }
                        title={formatDate(record.log_date || record.record_date)}
                        description={
                          <div>
                            <Text>Mood: {record.mood_level}/10</Text>
                            <Divider type="vertical" />
                            <Text>Stress: {record.stress_level}/10</Text>
                            <Divider type="vertical" />
                            <Text>
                              {record.smoked_today 
                                ? `Smoked ${record.cigarettes_smoked || 0} cigarettes` 
                                : 'Smoke-free day!'}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No daily records available</Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Recent Q&A */}
            <Card title="Recent Questions & Answers" className="mb-4">
              {questionsAnswers && questionsAnswers.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={questionsAnswers.slice(0, 3)}
                  renderItem={qa => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<QuestionOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                        title={qa.question}
                        description={
                          <div>
                            <Text type="secondary">{formatDate(qa.created_date)}</Text>
                            {qa.answer && (
                              <>
                                <br />
                                <Text>{qa.answer.substring(0, 100)}...</Text>
                              </>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No Q&A available</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MemberDashboard;