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
  Rate
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
import * as coachDashboardService from '../../services/coachDashboardService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CoachDashboard = () => {
  const [coachProfile, setCoachProfile] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const coachId = 1; // In a real app, this would come from authentication context

  useEffect(() => {
    const fetchCoachDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const profile = coachDashboardService.getCoachProfile(coachId);
        const members = coachDashboardService.getAssignedMembers(coachId);
        const questions = coachDashboardService.getUnansweredQuestions(coachId);
        const feedback = coachDashboardService.getRecentFeedback(coachId);
        const metrics = coachDashboardService.getCoachPerformanceMetrics(coachId);
        
        setCoachProfile(profile);
        setAssignedMembers(members);
        setUnansweredQuestions(questions);
        setRecentFeedback(feedback);
        setPerformanceMetrics(metrics);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coach dashboard data:", error);
        setLoading(false);
      }
    };

    fetchCoachDashboardData();
  }, [coachId]);

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
        if (phase === 'Preparation') color = 'orange';
        if (phase === 'Action') color = 'green';
        if (phase === 'Maintenance') color = 'purple';
        if (phase === 'Completed') color = 'gold';
        
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
          <Badge status="default" text="Completed" />
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
                  src={coachProfile.photo_url} 
                  icon={<UserOutlined />} 
                />
                <div className="mt-3">
                  <Rate disabled defaultValue={coachProfile.rating} allowHalf />
                  <div><Text strong>{coachProfile.rating}</Text> / 5.0</div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2}>{coachProfile.full_name}</Title>
              <Text type="secondary">{coachProfile.specialty}</Text>
              <Paragraph>{coachProfile.bio}</Paragraph>
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
              <List
                itemLayout="vertical"
                dataSource={unansweredQuestions}
                pagination={{ pageSize: 5 }}
                renderItem={item => (
                  <List.Item
                    key={item.question_id}
                    extra={
                      <Space>
                        <Button type="primary">Answer</Button>
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<Text strong>{item.member_name}</Text>}
                      description={
                        <Space>
                          <CalendarOutlined />
                          <Text type="secondary">{item.date_asked}</Text>
                        </Space>
                      }
                    />
                    <Paragraph>{item.question}</Paragraph>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><StarOutlined /> Feedback</span>} key="3">
            <Card>
              <Title level={4}>Recent Feedback</Title>
              <List
                itemLayout="vertical"
                dataSource={recentFeedback}
                pagination={{ pageSize: 5 }}
                renderItem={item => (
                  <List.Item key={item.feedback_id}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<Text strong>{item.user_name}</Text>}
                      description={
                        <Space>
                          <Rate disabled defaultValue={item.rating} allowHalf />
                          <Text type="secondary">{item.date}</Text>
                        </Space>
                      }
                    />
                    <Paragraph>"{item.feedback_content}"</Paragraph>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
          
          <TabPane tab={<span><BarChartOutlined /> Performance</span>} key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Monthly Performance</Title>
                  <div className="bar-chart">
                    {performanceMetrics.monthly_stats.map((stat, index) => (
                      <div className="bar-container" key={index}>
                        <Text type="secondary">{stat.success_rate}%</Text>
                        <div 
                          className="bar" 
                          style={{ height: `${stat.success_rate * 1.5}px` }}
                        ></div>
                        <Text className="bar-label">{stat.month}</Text>
                        <Text type="secondary">{stat.members} members</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Top Effective Strategies</Title>
                  <List
                    dataSource={performanceMetrics.top_strategies}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<FireOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                          title={item.strategy}
                          description={<Progress percent={item.success_rate} />}
                        />
                      </List.Item>
                    )}
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

export default CoachDashboard;