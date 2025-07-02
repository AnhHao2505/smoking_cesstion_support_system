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
import * as memberDashboardService from '../../services/memberDashboardService';
import { getMyProfile } from '../../services/memberProfileService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MemberDashboard = () => {
  const { currentUser } = useAuth();
  const [memberProfile, setMemberProfile] = useState(null);
  const [quitPlan, setQuitPlan] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [badges, setBadges] = useState([]);
  const [healthImprovements, setHealthImprovements] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [questionsAnswers, setQuestionsAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = currentUser?.userId;

  useEffect(() => {
    const fetchMemberDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use the new profile service
        const profile = await getMyProfile();
        const quitPlan = await memberDashboardService.getQuitPlanData(userId);
        const records = await memberDashboardService.getDailyStateRecords(userId);
        const earnedBadges = await memberDashboardService.getEarnedBadges(userId);
        const improvements = await memberDashboardService.getHealthImprovements(userId);
        const upcomingReminders = await memberDashboardService.getUpcomingReminders(userId);
        const recentQA = await memberDashboardService.getRecentQuestionsAnswers(userId);

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
      <div className="dashboard loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div>No quit plan found. Please create a quit plan first.</div>
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
    return quitPlan.phases.findIndex(phase => 
      phase.phase_name === quitPlan.current_phase.phase_name
    );
  };

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
                  <Tag color={memberProfile?.premiumMembership ? "gold" : "blue"}>
                    {memberProfile?.premiumMembership ? 'Premium' : 'Basic'} Member
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
                  <strong>Plan:</strong> {quitPlan.plan_name}
                </Text>
                <br />
                <Text type="secondary">
                  <strong>Start Date:</strong> {formatDate(quitPlan.start_date)}
                </Text>
                <br />
                <Text type="secondary">
                  <strong>Target Date:</strong> {formatDate(quitPlan.end_date)}
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
                value={quitPlan.days_smoke_free}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Progress"
                value={quitPlan.overall_progress}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress percent={quitPlan.overall_progress} showInfo={false} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Money Saved"
                value={quitPlan.money_saved}
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
                value={quitPlan.cigarettes_avoided}
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
                        {phase.phase_name === quitPlan.current_phase.phase_name && (
                          <Progress 
                            percent={phase.completion_percentage} 
                            size="small" 
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </div>
                    }
                    status={
                      phase.is_completed 
                        ? 'finish' 
                        : phase.phase_name === quitPlan.current_phase.phase_name 
                          ? 'process' 
                          : 'wait'
                    }
                  />
                ))}
              </Steps>
            </Card>

            {/* Health Improvements */}
            <Card title="Health Improvements" className="mb-4">
              <Timeline>
                {healthImprovements.slice(0, 3).map((improvement, index) => (
                  <Timeline.Item 
                    key={index}
                    color={improvement.achieved ? 'green' : 'blue'}
                  >
                    <Text strong>{improvement.title}</Text>
                    <br />
                    <Text type="secondary">{improvement.description}</Text>
                    {improvement.achieved && (
                      <div>
                        <Tag color="success" style={{ marginTop: 4 }}>
                          Achieved on {formatDate(improvement.achieved_date)}
                        </Tag>
                      </div>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {/* Recent Daily Records */}
            <Card title="Recent Daily Records" className="mb-4">
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
                      title={formatDate(record.record_date)}
                      description={
                        <div>
                          <Text>Mood: {record.mood_level}/10</Text>
                          <Divider type="vertical" />
                          <Text>Stress: {record.stress_level}/10</Text>
                          <Divider type="vertical" />
                          <Text>
                            {record.smoked_today 
                              ? `Smoked ${record.cigarettes_smoked} cigarettes` 
                              : 'Smoke-free day!'}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Achievements */}
            <Card title="Recent Achievements" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={badges.slice(0, 3)}
                renderItem={badge => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                      title={badge.badge_name}
                      description={formatDate(badge.earned_date)}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Upcoming Reminders */}
            <Card title="Upcoming Reminders" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={reminders.slice(0, 3)}
                renderItem={reminder => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                      title={reminder.message}
                      description={formatDate(reminder.nextDate)}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Recent Q&A */}
            <Card title="Recent Questions & Answers" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={questionsAnswers.slice(0, 2)}
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
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MemberDashboard;