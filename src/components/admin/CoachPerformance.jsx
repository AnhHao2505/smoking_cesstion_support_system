import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Table,
  Statistic,
  Progress,
  Rate,
  Avatar,
  Tag,
  Space,
  Select,
  DatePicker,
  Button,
  Spin,
  Divider,
  List,
  Badge,
  Tooltip,
  message
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DownloadOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { getCoachPerformanceMetrics } from '../../services/coachDashboardService';
import { getAllCoaches } from '../../services/coachManagementService';
import moment from 'moment';
import '../../styles/Dashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CoachPerformance = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    moment().subtract(3, 'months'),
    moment()
  ]);

  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    if (selectedCoach) {
      fetchPerformanceData(selectedCoach.id);
    }
  }, [selectedCoach, dateRange]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches();
      const activeCoaches = response.data.filter(coach => coach.status === 'Active');
      setCoaches(activeCoaches);
      if (activeCoaches.length > 0) {
        setSelectedCoach(activeCoaches[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      message.error('Failed to load coaches');
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (coachId) => {
    try {
      setPerformanceLoading(true);
      // Mock performance data - in real app, this would come from API
      const mockPerformance = {
        coach_id: coachId,
        total_members: 24,
        active_members: 18,
        completed_successfully: 15,
        average_rating: 4.8,
        success_rate: 85,
        avg_days_to_quit: 45,
        response_time: 2.5, // hours
        monthly_stats: [
          { month: 'Jan', members: 20, success_rate: 80, new_members: 5, completed: 3 },
          { month: 'Feb', members: 22, success_rate: 82, new_members: 4, completed: 4 },
          { month: 'Mar', members: 24, success_rate: 85, new_members: 6, completed: 5 },
          { month: 'Apr', members: 23, success_rate: 87, new_members: 3, completed: 6 },
          { month: 'May', members: 21, success_rate: 89, new_members: 2, completed: 4 },
          { month: 'Jun', members: 18, success_rate: 85, new_members: 1, completed: 3 }
        ],
        top_strategies: [
          { strategy: 'Behavioral Modification', success_rate: 92 },
          { strategy: 'Gradual Reduction', success_rate: 88 },
          { strategy: 'Nicotine Replacement', success_rate: 85 },
          { strategy: 'Support Groups', success_rate: 83 }
        ],
        member_feedback: [
          {
            member_name: "Nguyễn Văn A",
            rating: 5,
            feedback: "Excellent support throughout my journey",
            date: "2025-05-15"
          },
          {
            member_name: "Trần Thị B",
            rating: 4.5,
            feedback: "Very helpful and understanding",
            date: "2025-05-10"
          },
          {
            member_name: "Lê Văn C",
            rating: 4.8,
            feedback: "Professional and caring approach",
            date: "2025-05-08"
          }
        ],
        performance_trends: {
          success_rate_trend: 5, // +5% compared to previous period
          member_satisfaction_trend: 3, // +3% compared to previous period
          response_time_trend: -10 // -10% (improvement) in response time
        }
      };
      
      setPerformanceData(mockPerformance);
      setPerformanceLoading(false);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      message.error('Failed to load performance data');
      setPerformanceLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (trend < 0) return <FallOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#52c41a';
    if (trend < 0) return '#ff4d4f';
    return '#666';
  };

  const handleExportReport = () => {
    if (!performanceData || !selectedCoach) {
      message.warning('No data to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Coach Performance Report'],
      ['Coach Name:', selectedCoach.name],
      ['Specialty:', selectedCoach.specialty],
      ['Date Range:', `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`],
      [''],
      ['Metrics', 'Value'],
      ['Total Members', performanceData.total_members],
      ['Active Members', performanceData.active_members],
      ['Success Rate', `${performanceData.success_rate}%`],
      ['Average Rating', performanceData.average_rating],
      ['Average Days to Quit', performanceData.avg_days_to_quit],
      [''],
      ['Monthly Performance'],
      ['Month', 'Members', 'Success Rate', 'New Members', 'Completed'],
      ...performanceData.monthly_stats.map(stat => [
        stat.month, stat.members, `${stat.success_rate}%`, stat.new_members, stat.completed
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `coach-performance-${selectedCoach.name}-${moment().format('YYYY-MM-DD')}.csv`;
    link.click();
    
    message.success('Performance report exported successfully');
  };

  const performanceColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month'
    },
    {
      title: 'Total Members',
      dataIndex: 'members',
      key: 'members',
      align: 'center'
    },
    {
      title: 'New Members',
      dataIndex: 'new_members',
      key: 'new_members',
      render: count => <Tag color="blue">{count}</Tag>,
      align: 'center'
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      render: count => <Tag color="green">{count}</Tag>,
      align: 'center'
    },
    {
      title: 'Success Rate',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: rate => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f'}
          showInfo={true}
        />
      ),
      align: 'center'
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading coaches...</div>
      </div>
    );
  }

  return (
    <div className="coach-performance">
      <div className="container py-4">
        <Title level={2}>
          <BarChartOutlined /> Coach Performance Analytics
        </Title>

        {/* Controls */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Text strong>Select Coach:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={selectedCoach?.id}
                onChange={(value) => {
                  const coach = coaches.find(c => c.id === value);
                  setSelectedCoach(coach);
                }}
                placeholder="Choose a coach"
              >
                {coaches.map(coach => (
                  <Option key={coach.id} value={coach.id}>
                    <Space>
                      <Avatar size="small" src={coach.photo_url} icon={<UserOutlined />} />
                      {coach.name}
                      <Text type="secondary">({coach.specialty})</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <Text strong>Date Range:</Text>
              <RangePicker
                style={{ width: '100%', marginTop: 8 }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                allowClear={false}
              />
            </Col>

            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                disabled={!performanceData}
              >
                Export Report
              </Button>
            </Col>
          </Row>
        </Card>

        {performanceLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading performance data...</div>
          </div>
        ) : performanceData && selectedCoach ? (
          <>
            {/* Coach Overview */}
            <Card className="mb-4">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={6}>
                  <div className="text-center">
                    <Avatar
                      size={100}
                      src={selectedCoach?.photo_url}
                      icon={<UserOutlined />}
                    />
                    <div className="mt-2">
                      <Title level={4} style={{ margin: 0 }}>{selectedCoach?.name}</Title>
                      <Tag color="blue">{selectedCoach?.specialty}</Tag>
                      <div className="mt-1">
                        <Rate disabled value={performanceData.average_rating} allowHalf />
                        <Text style={{ marginLeft: 8 }}>{performanceData.average_rating}</Text>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={18}>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Total Members"
                        value={performanceData.total_members}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Active Members"
                        value={performanceData.active_members}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Success Rate"
                        value={performanceData.success_rate}
                        suffix="%"
                        prefix={
                          <Space>
                            <CheckCircleOutlined />
                            {getTrendIcon(performanceData.performance_trends.success_rate_trend)}
                          </Space>
                        }
                        valueStyle={{ color: getTrendColor(performanceData.performance_trends.success_rate_trend) }}
                      />
                      {performanceData.performance_trends.success_rate_trend !== 0 && (
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px',
                            color: getTrendColor(performanceData.performance_trends.success_rate_trend)
                          }}
                        >
                          {performanceData.performance_trends.success_rate_trend > 0 ? '+' : ''}
                          {performanceData.performance_trends.success_rate_trend}% vs last period
                        </Text>
                      )}
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Avg. Days to Quit"
                        value={performanceData.avg_days_to_quit}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              {/* Left Column */}
              <Col xs={24} lg={16}>
                {/* Monthly Performance */}
                <Card title="Monthly Performance" className="mb-4">
                  <Table
                    dataSource={performanceData.monthly_stats}
                    columns={performanceColumns}
                    pagination={false}
                    size="small"
                    scroll={{ x: 600 }}
                  />
                </Card>

                {/* Performance Trends */}
                <Card title="Performance Trends" className="mb-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Success Rate Trend"
                          value={`${Math.abs(performanceData.performance_trends.success_rate_trend)}%`}
                          prefix={getTrendIcon(performanceData.performance_trends.success_rate_trend)}
                          valueStyle={{ 
                            color: getTrendColor(performanceData.performance_trends.success_rate_trend),
                            fontSize: '20px'
                          }}
                        />
                        <Text type="secondary">vs previous period</Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Member Satisfaction"
                          value={`${Math.abs(performanceData.performance_trends.member_satisfaction_trend)}%`}
                          prefix={getTrendIcon(performanceData.performance_trends.member_satisfaction_trend)}
                          valueStyle={{ 
                            color: getTrendColor(performanceData.performance_trends.member_satisfaction_trend),
                            fontSize: '20px'
                          }}
                        />
                        <Text type="secondary">vs previous period</Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Response Time"
                          value={`${Math.abs(performanceData.performance_trends.response_time_trend)}%`}
                          prefix={getTrendIcon(-performanceData.performance_trends.response_time_trend)}
                          valueStyle={{ 
                            color: getTrendColor(-performanceData.performance_trends.response_time_trend),
                            fontSize: '20px'
                          }}
                        />
                        <Text type="secondary">improvement</Text>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Right Column */}
              <Col xs={24} lg={8}>
                {/* Top Strategies */}
                <Card title="Most Effective Strategies" className="mb-4">
                  <List
                    dataSource={performanceData.top_strategies}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                          title={item.strategy}
                          description={
                            <Progress 
                              percent={item.success_rate} 
                              size="small"
                              strokeColor={item.success_rate >= 90 ? '#52c41a' : item.success_rate >= 80 ? '#faad14' : '#ff4d4f'}
                              showInfo={true}
                            />
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>

                {/* Member Feedback */}
                <Card title="Recent Member Feedback" className="mb-4">
                  <List
                    dataSource={performanceData.member_feedback}
                    renderItem={feedback => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                          title={
                            <Space>
                              <Text strong>{feedback.member_name}</Text>
                              <Rate disabled value={feedback.rating} size="small" />
                            </Space>
                          }
                          description={
                            <div>
                              <Text>{feedback.feedback}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {moment(feedback.date).format('DD/MM/YYYY')}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>

                {/* Quick Stats */}
                <Card title="Quick Stats" className="mb-4">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic
                        title="Average Response Time"
                        value={performanceData.response_time}
                        suffix="hours"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={24}>
                      <Statistic
                        title="Completion Rate"
                        value={Math.round((performanceData.completed_successfully / performanceData.total_members) * 100)}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Text type="secondary">
                {coaches.length === 0 
                  ? 'No coaches available' 
                  : 'Select a coach to view performance data'
                }
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoachPerformance;