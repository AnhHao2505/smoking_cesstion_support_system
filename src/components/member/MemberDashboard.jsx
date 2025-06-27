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
  Button
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
import * as memberDashboardService from '../../services/memberDashboardService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MemberDashboard = () => {
  const [memberProfile, setMemberProfile] = useState(null);
  const [quitPlan, setQuitPlan] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [badges, setBadges] = useState([]);
  const [healthImprovements, setHealthImprovements] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [questionsAnswers, setQuestionsAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = 101; // In a real app, this would come from authentication context

  useEffect(() => {
    const fetchMemberDashboardData = async () => {
      try {
        setLoading(true);
        
        // Updated to use the new member profile structure
        const profile = await memberDashboardService.getMemberProfile(userId);
        const quitPlan = await memberDashboardService.getQuitPlanData(userId);
        const records = await memberDashboardService.getDailyStateRecords(userId);
        const earnedBadges = await memberDashboardService.getEarnedBadges(userId);
        const improvements = await memberDashboardService.getHealthImprovements(userId);
        const upcomingReminders = await memberDashboardService.getUpcomingReminders(userId);
        const recentQA = await memberDashboardService.getRecentQuestionsAnswers(userId); // Fixed function name

        setMemberProfile(profile);
        setQuitPlan(quitPlan);
        setDailyRecords(records);
        setBadges(earnedBadges);
        setHealthImprovements(improvements);
        setReminders(upcomingReminders);
        setQuestionsAnswers(recentQA);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching member dashboard data:", error);
        setLoading(false);
      }
    };

    fetchMemberDashboardData();
  }, [userId]);

  if (loading || !quitPlan) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get current phase index for the Steps component
  const getCurrentPhaseIndex = () => {
    return quitPlan.phases.findIndex(phase => 
      phase.phase_name === quitPlan.current_phase.phase_name
    );
  };

  return (
    <div className="dashboard member-dashboard">
      <div className="container py-4">
        {/* Member Profile Overview - Updated to use new field names */}
        <Card className="mb-4 profile-card">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6}>
              <div className="text-center">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                />
                <div className="mt-3">
                  <Tag color={memberProfile.premiumMembership ? "gold" : "blue"}>
                    {memberProfile.premiumMembership ? 'Premium' : 'Basic'} Member
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2}>{memberProfile.name}</Title>
              <Text type="secondary">Plan: {memberProfile.planName}</Text>
              
              <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Days Smoke Free" 
                    value={quitPlan.days_smoke_free}
                    suffix="days"
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Progress" 
                    value={quitPlan.progress}
                    suffix="%"
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Current Phase" 
                    value={quitPlan.current_phase?.phase_name || 'Not Started'}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        
        {/* Main Dashboard Content */}
        <Row gutter={[16, 16]}>
          {/* Quit Plan Progress */}
          <Col xs={24} lg={16}>
            <Card title="Your Quit Plan Progress" className="mb-4">
              <Steps current={getCurrentPhaseIndex()} direction="vertical">
                {quitPlan.phases.map((phase) => (
                  <Step 
                    key={phase.quit_phase_id}
                    title={phase.phase_name}
                    description={
                      <div>
                        <Paragraph>{phase.objective}</Paragraph>
                        <Text type="secondary">
                          {phase.is_completed 
                            ? `Completed on ${formatDate(phase.end_date)}` 
                            : `Started on ${formatDate(phase.start_date)}`}
                        </Text>
                      </div>
                    }
                    status={phase.is_completed ? 'finish' : phase.phase_name === quitPlan.current_phase.phase_name ? 'process' : 'wait'}
                  />
                ))}
              </Steps>
            </Card>
            
            {/* Strategies and Medications */}
            <Card title="Your Quit Plan Details" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Title level={5}>Strategies</Title>
                  <Paragraph>
                    {quitPlan.strategies_to_use}
                  </Paragraph>
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5}>Medications</Title>
                  <Paragraph>
                    {quitPlan.medications_to_use}
                  </Paragraph>
                  <Text type="secondary">{quitPlan.medication_instructions}</Text>
                </Col>
              </Row>
            </Card>
            
            {/* Daily Records */}
            <Card title="Your Recent Daily Records" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={dailyRecords}
                renderItem={record => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{formatDate(record.date)}</Text>}
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Row gutter={[16, 8]}>
                            <Col xs={12} md={6}>
                              <Text type="secondary">Cigarettes: </Text>
                              <Text>{record.daily_cigarette_consumed}</Text>
                            </Col>
                            <Col xs={12} md={6}>
                              <Text type="secondary">Stress Level: </Text>
                              <Progress percent={record.stress_level * 10} size="small" showInfo={false} />
                              <Text>{record.stress_level}/10</Text>
                            </Col>
                            <Col xs={12} md={6}>
                              <Text type="secondary">Cravings: </Text>
                              <Progress percent={record.cravings_intensity * 10} size="small" showInfo={false} />
                              <Text>{record.cravings_intensity}/10</Text>
                            </Col>
                            <Col xs={12} md={6}>
                              <Text type="secondary">Health: </Text>
                              <Tag color={
                                record.overall_health === 'good' ? 'green' : 
                                record.overall_health === 'normal' ? 'blue' : 
                                record.overall_health === 'poor' ? 'orange' : 'red'
                              }>{record.overall_health}</Tag>
                            </Col>
                          </Row>
                          {record.physical_symptoms && (
                            <Text type="secondary">Symptoms: {record.physical_symptoms}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div className="text-center mt-3">
                <Button type="primary">Log Today's Progress</Button>
              </div>
            </Card>
            
            {/* Coach Q&A */}
            <Card title="Your Questions & Answers" className="mb-4">
              <List
                itemLayout="vertical"
                dataSource={questionsAnswers}
                renderItem={qa => (
                  <List.Item>
                    <div className="qa-container">
                      <div className="question">
                        <Space align="start">
                          <Avatar icon={<QuestionOutlined />} style={{ backgroundColor: '#1890ff' }} />
                          <div>
                            <Text strong>You asked on {formatDate(qa.date_asked)}:</Text>
                            <Paragraph>{qa.question}</Paragraph>
                          </div>
                        </Space>
                      </div>
                      
                      {qa.is_answered && (
                        <div className="answer">
                          <Space align="start">
                            <Avatar 
                              src={quitPlan.coach_photo} 
                              icon={<UserOutlined />} 
                            />
                            <div>
                              <Text strong>{quitPlan.coach_name} answered on {formatDate(qa.answer.answered_date)}:</Text>
                              <Paragraph>{qa.answer.answer}</Paragraph>
                            </div>
                          </Space>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
              <div className="text-center mt-3">
                <Button type="primary">Ask a New Question</Button>
              </div>
            </Card>
          </Col>
          
          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Coach Information */}
            <Card title="Your Coach" className="mb-4">
              <div className="coach-card">
                <Avatar 
                  size={64} 
                  src={quitPlan.coach_photo} 
                  icon={<UserOutlined />} 
                />
                <Title level={4}>{quitPlan.coach_name}</Title>
                <Button type="primary">Message Coach</Button>
              </div>
            </Card>
            
            {/* Badges */}
            <Card title="Your Badges" className="mb-4">
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={badges}
                renderItem={badge => (
                  <List.Item>
                    <Card className="badge-card">
                      <div className="text-center">
                        <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                        <Title level={5}>{badge.badge_name}</Title>
                        <Text type="secondary">{formatDate(badge.earned_date)}</Text>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
            
            {/* Health Improvements */}
            <Card title="Your Health Improvements" className="mb-4">
              <Timeline mode="left">
                {healthImprovements.map((improvement, index) => (
                  <Timeline.Item 
                    key={index} 
                    dot={<HeartOutlined style={{ fontSize: '16px' }} />} 
                    color="red"
                  >
                    <Text strong>{improvement.improvement}</Text>
                    <br />
                    <Text type="secondary">{formatDate(improvement.achieved_on)}</Text>
                    <Paragraph>{improvement.description}</Paragraph>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
            
            {/* Upcoming Reminders */}
            <Card title="Upcoming Reminders" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={reminders}
                renderItem={reminder => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<BellOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title={reminder.message}
                      description={formatDate(reminder.nextDate)}
                    />
                    <Tag color={
                      reminder.reminder_type === 'appointment' ? 'blue' : 
                      reminder.reminder_type === 'medication' ? 'purple' : 
                      'green'
                    }>{reminder.reminder_type}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MemberDashboard;