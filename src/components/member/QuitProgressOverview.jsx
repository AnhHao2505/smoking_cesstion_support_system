import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Timeline, 
  List, 
  Typography, 
  Tag, 
  Space, 
  Divider,
  Steps,
  Badge,
  Alert,
  Button,
  Tooltip,
  Avatar
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  DollarOutlined, 
  TrophyOutlined,
  HeartOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  StarOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import * as quitProgressService from '../../services/quitProgressService';
import '../../styles/QuitProgress.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const QuitProgressOverview = () => {
  const [smokeFreeStats, setSmokeFreeStats] = useState(null);
  const [quitPhases, setQuitPhases] = useState(null);
  const [dailyRecords, setDailyRecords] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [badges, setBadges] = useState([]);
  const [healthImprovements, setHealthImprovements] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const userId = 101; // In a real app, this would come from authentication context

  useEffect(() => {
    const fetchQuitProgressData = async () => {
      try {
        // Fetch all data in parallel
        const stats = quitProgressService.getSmokeFreeSummary(userId);
        const phases = quitProgressService.getQuitPlanPhases(userId);
        const records = quitProgressService.getRecentDailyRecordsSummary(userId);
        const notifs = quitProgressService.getRecentNotifications(userId);
        const upcoming = quitProgressService.getUpcomingReminders(userId);
        const earnedBadges = quitProgressService.getQuitProgressBadges(userId);
        const improvements = quitProgressService.getHealthImprovementsTimeline(userId);
        
        setSmokeFreeStats(stats);
        setQuitPhases(phases);
        setDailyRecords(records);
        setNotifications(notifs);
        setReminders(upcoming);
        setBadges(earnedBadges);
        setHealthImprovements(improvements);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quit progress data:", error);
        setLoading(false);
      }
    };

    fetchQuitProgressData();
  }, [userId]);

  if (loading || !smokeFreeStats) {
    return (
      <div className="quit-progress loading-container">
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
    return quitPhases.phases.findIndex(phase => 
      phase.phase_name === quitPhases.current_phase
    );
  };

  // Generate color for notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'green';
      case 'badge':
        return 'gold';
      case 'health_milestone':
        return 'blue';
      case 'coach_response':
        return 'purple';
      case 'reminder':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Generate icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <CheckCircleOutlined />;
      case 'badge':
        return <TrophyOutlined />;
      case 'health_milestone':
        return <HeartOutlined />;
      case 'coach_response':
        return <InfoCircleOutlined />;
      case 'reminder':
        return <BellOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  // Get icon for reminder type
  const getReminderIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'medication':
        return <WarningOutlined style={{ color: '#722ed1' }} />;
      case 'support':
        return <HeartOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <div className="quit-progress-overview">
      <div className="container py-4">
        <Title level={1} className="page-title">Tổng quan tiến trình cai thuốc</Title>
        
        {/* Main Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Ngày không hút thuốc"
                value={smokeFreeStats.days_smoke_free}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div className="streak-info">
                <Badge count={`${smokeFreeStats.current_streak} ngày liên tiếp`} style={{ backgroundColor: '#52c41a' }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Điếu thuốc không hút"
                value={smokeFreeStats.cigarettes_avoided}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
              <Text type="secondary">Dựa trên mức hút trước đây</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Tiền tiết kiệm (VNĐ)"
                value={smokeFreeStats.money_saved * 23000}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={value => `${new Intl.NumberFormat('vi-VN').format(value)}`}
              />
              <Text type="secondary">Tương đương {smokeFreeStats.money_saved}$</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Tiến trình sức khỏe"
                value={smokeFreeStats.health_progress_percentage}
                suffix="%"
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
              <Tooltip title={smokeFreeStats.next_health_milestone.description}>
                <Text type="secondary">
                  {smokeFreeStats.next_health_milestone.name} (còn {smokeFreeStats.next_health_milestone.days_remaining} ngày)
                </Text>
              </Tooltip>
            </Card>
          </Col>
        </Row>
        
        {/* Important Alerts */}
        {notifications.filter(n => !n.is_read).length > 0 && (
          <Alert
            message="Thông báo mới"
            description={`Bạn có ${notifications.filter(n => !n.is_read).length} thông báo chưa đọc`}
            type="info"
            showIcon
            action={
              <Button size="small" type="primary">
                Xem tất cả
              </Button>
            }
            className="mb-4"
          />
        )}
        
        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Quit Phase Progress */}
            <Card title="Tiến trình các giai đoạn cai thuốc" className="mb-4">
              <Steps current={getCurrentPhaseIndex()} direction="vertical">
                {quitPhases.phases.map((phase) => (
                  <Step 
                    key={phase.phase_id}
                    title={phase.phase_name}
                    description={
                      <div>
                        <Paragraph>{phase.objective}</Paragraph>
                        <Text type="secondary">
                          {phase.is_completed 
                            ? `Hoàn thành ngày ${formatDate(phase.end_date)}` 
                            : phase.phase_name === quitPhases.current_phase
                              ? `Bắt đầu ngày ${formatDate(phase.start_date)}`
                              : `Dự kiến bắt đầu ngày ${formatDate(phase.start_date)}`}
                        </Text>
                        {!phase.is_completed && phase.phase_name === quitPhases.current_phase && (
                          <Progress percent={phase.completion_percentage} size="small" />
                        )}
                      </div>
                    }
                    status={
                      phase.is_completed 
                        ? 'finish' 
                        : phase.phase_name === quitPhases.current_phase 
                          ? 'process' 
                          : 'wait'
                    }
                  />
                ))}
              </Steps>
            </Card>
            
            {/* Weekly Progress Summary */}
            <Card title="Tổng kết tuần qua" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Mức độ căng thẳng trung bình"
                    value={dailyRecords.weeklyAverages.avg_stress}
                    suffix="/10"
                    valueStyle={{ color: dailyRecords.weeklyAverages.avg_stress > 5 ? '#cf1322' : '#3f8600' }}
                  />
                  <Progress 
                    percent={dailyRecords.weeklyAverages.avg_stress * 10} 
                    strokeColor={dailyRecords.weeklyAverages.avg_stress > 5 ? '#cf1322' : '#3f8600'}
                    showInfo={false}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Mức độ thèm thuốc trung bình"
                    value={dailyRecords.weeklyAverages.avg_cravings}
                    suffix="/10"
                    valueStyle={{ color: dailyRecords.weeklyAverages.avg_cravings > 5 ? '#cf1322' : '#3f8600' }}
                  />
                  <Progress 
                    percent={dailyRecords.weeklyAverages.avg_cravings * 10} 
                    strokeColor={dailyRecords.weeklyAverages.avg_cravings > 5 ? '#cf1322' : '#3f8600'}
                    showInfo={false}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Ngày không hút thuốc"
                    value={dailyRecords.cigarette_free_days}
                    suffix="/{dailyRecords.records.length}"
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Progress 
                    percent={(dailyRecords.cigarette_free_days / dailyRecords.records.length) * 100} 
                    strokeColor="#3f8600"
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={5}>Phân bố tình trạng sức khỏe trong tuần</Title>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Badge color="green" text="Tốt" /> {dailyRecords.weeklyAverages.health_distribution.good} ngày
                </Col>
                <Col span={6}>
                  <Badge color="blue" text="Bình thường" /> {dailyRecords.weeklyAverages.health_distribution.normal} ngày
                </Col>
                <Col span={6}>
                  <Badge color="orange" text="Kém" /> {dailyRecords.weeklyAverages.health_distribution.poor} ngày
                </Col>
                <Col span={6}>
                  <Badge color="red" text="Rất kém" /> {dailyRecords.weeklyAverages.health_distribution.very_poor} ngày
                </Col>
              </Row>
              
              <Divider />
              
              <div className="text-center">
                <Button type="primary" icon={<LineChartOutlined />}>Xem báo cáo chi tiết</Button>
              </div>
            </Card>
            
            {/* Health Improvements Timeline */}
            <Card title="Lộ trình cải thiện sức khỏe" className="mb-4">
              <Paragraph className="health-intro">
                Dưới đây là những cải thiện sức khỏe bạn đã đạt được kể từ ngày bắt đầu cai thuốc 
                ({formatDate(healthImprovements.quit_date)}). Hiện tại bạn đã không hút thuốc được 
                <Text strong> {healthImprovements.days_since_quit} ngày</Text>.
              </Paragraph>
              
              <Timeline mode="left">
                {healthImprovements.improvements.map((improvement, index) => (
                  <Timeline.Item 
                    key={index} 
                    color={improvement.achieved ? 'green' : 'blue'}
                    label={
                      improvement.achieved 
                        ? formatDate(improvement.achieved_date)
                        : `Dự kiến sau ${improvement.days_from_quit - healthImprovements.days_since_quit} ngày nữa`
                    }
                  >
                    <Text strong>{improvement.title}</Text>
                    <Paragraph>{improvement.description}</Paragraph>
                    {improvement.achieved && (
                      <Tag color="success">Đã đạt được</Tag>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
          
          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Recent Notifications */}
            <Card title="Thông báo gần đây" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={notification => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getNotificationIcon(notification.type)} 
                          style={{ backgroundColor: notification.is_read ? '#d9d9d9' : getNotificationColor(notification.type) }} 
                        />
                      }
                      title={
                        <Space>
                          {notification.content}
                          {!notification.is_read && <Badge dot />}
                        </Space>
                      }
                      description={
                        <Space>
                          <CalendarOutlined />
                          <Text type="secondary">{formatDate(notification.sent_at)}</Text>
                          <Tag color={getNotificationColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div className="text-center mt-3">
                <Button type="default">Xem tất cả thông báo</Button>
              </div>
            </Card>
            
            {/* Upcoming Reminders */}
            <Card title="Nhắc nhở sắp tới" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={reminders}
                renderItem={reminder => (
                  <List.Item
                    actions={[
                      <Button type="text" size="small">Xong</Button>,
                      <Button type="text" size="small">Hoãn</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getReminderIcon(reminder.reminder_type)}
                      title={reminder.message}
                      description={formatDate(reminder.nextDate)}
                    />
                  </List.Item>
                )}
              />
              <div className="text-center mt-3">
                <Button type="primary">Thêm nhắc nhở mới</Button>
              </div>
            </Card>
            
            {/* Achievement Badges */}
            <Card title="Huy hiệu thành tựu" className="mb-4">
              <Row gutter={[16, 16]}>
                {badges.map(badge => (
                  <Col xs={12} key={badge.badge_id}>
                    <Card className="badge-card">
                      <div className="text-center">
                        <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                        <Title level={5}>{badge.badge_name}</Title>
                        <Text type="secondary">Đạt được: {formatDate(badge.earned_date)}</Text>
                        <Tooltip title={badge.badge_description}>
                          <InfoCircleOutlined className="badge-info-icon" />
                        </Tooltip>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="text-center mt-3">
                <Button type="default">Xem tất cả huy hiệu</Button>
              </div>
            </Card>
            
            {/* Daily Check-in Reminder */}
            <Card className="smoking-quiz-card">
              <Space direction="vertical" style={{ width: '100%' }} align="center">
                <Title level={4}>Bạn đã cập nhật tiến trình hôm nay chưa?</Title>
                <Paragraph>
                  Việc cập nhật tiến trình hàng ngày giúp bạn theo dõi và duy trì hành trình cai thuốc hiệu quả hơn.
                </Paragraph>
                <Button type="primary" size="large">
                  Cập nhật tiến trình hôm nay
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default QuitProgressOverview;