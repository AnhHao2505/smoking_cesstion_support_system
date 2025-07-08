import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, DatePicker, Select, 
  Statistic, Progress, Spin, Empty, Alert, Space,
  Tag, Divider, Button, Tooltip
} from 'antd';
import {
  LineChartOutlined, BarChartOutlined, PieChartOutlined,
  TrendingUpOutlined, TrendingDownOutlined, MinusOutlined,
  CheckCircleOutlined, WarningOutlined, FireOutlined,
  HeartOutlined, ClockCircleOutlined, CalendarOutlined,
  ExportOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterPlot, Scatter
} from 'recharts';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { getDailyLogsWithAnalytics } from '../../services/dailylogService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const LogAnalytics = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [viewType, setViewType] = useState('overview'); // overview, trends, patterns, insights
  const [chartType, setChartType] = useState('line');

  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId) {
      fetchAnalyticsData();
    }
  }, [userId, selectedDateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const startDate = selectedDateRange[0].format('YYYY-MM-DD');
      const endDate = selectedDateRange[1].format('YYYY-MM-DD');
      
      const response = await getDailyLogsWithAnalytics(userId, startDate, endDate);
      
      if (response.success) {
        setLogs(response.data || []);
        setAnalytics(response.analytics);
      } else {
        setLogs([]);
        setAnalytics(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const getChartData = () => {
    return logs.map(log => ({
      date: moment(log.log_date).format('MM/DD'),
      cigarettes: log.cigarettes_smoked,
      stress: log.stress_level,
      mood: log.mood_level,
      cravings: log.craving_intensity,
      sleep: log.sleep_hours
    }));
  };

  const getPatternData = () => {
    const patterns = {
      byDayOfWeek: {},
      byStressLevel: { low: 0, medium: 0, high: 0 },
      byMoodLevel: { low: 0, medium: 0, high: 0 },
      byCravingLevel: { low: 0, medium: 0, high: 0 }
    };

    logs.forEach(log => {
      const dayOfWeek = moment(log.log_date).format('dddd');
      if (!patterns.byDayOfWeek[dayOfWeek]) {
        patterns.byDayOfWeek[dayOfWeek] = { 
          day: dayOfWeek, 
          totalCigarettes: 0, 
          avgStress: 0, 
          avgMood: 0, 
          count: 0 
        };
      }
      
      patterns.byDayOfWeek[dayOfWeek].totalCigarettes += log.cigarettes_smoked;
      patterns.byDayOfWeek[dayOfWeek].avgStress += log.stress_level;
      patterns.byDayOfWeek[dayOfWeek].avgMood += log.mood_level;
      patterns.byDayOfWeek[dayOfWeek].count += 1;

      // Categorize stress, mood, and cravings
      if (log.stress_level <= 3) patterns.byStressLevel.low++;
      else if (log.stress_level <= 6) patterns.byStressLevel.medium++;
      else patterns.byStressLevel.high++;

      if (log.mood_level <= 3) patterns.byMoodLevel.low++;
      else if (log.mood_level <= 6) patterns.byMoodLevel.medium++;
      else patterns.byMoodLevel.high++;

      if (log.craving_intensity <= 3) patterns.byCravingLevel.low++;
      else if (log.craving_intensity <= 6) patterns.byCravingLevel.medium++;
      else patterns.byCravingLevel.high++;
    });

    // Calculate averages for day of week data
    Object.keys(patterns.byDayOfWeek).forEach(day => {
      const dayData = patterns.byDayOfWeek[day];
      dayData.avgStress = (dayData.avgStress / dayData.count).toFixed(1);
      dayData.avgMood = (dayData.avgMood / dayData.count).toFixed(1);
      dayData.avgCigarettes = (dayData.totalCigarettes / dayData.count).toFixed(1);
    });

    return patterns;
  };

  const getTrendAnalysis = () => {
    if (logs.length < 7) return null;

    const recentWeek = logs.slice(-7);
    const previousWeek = logs.slice(-14, -7);

    const calculateAverage = (data, field) => 
      data.reduce((sum, item) => sum + item[field], 0) / data.length;

    const recentAvgs = {
      cigarettes: calculateAverage(recentWeek, 'cigarettes_smoked'),
      stress: calculateAverage(recentWeek, 'stress_level'),
      mood: calculateAverage(recentWeek, 'mood_level'),
      cravings: calculateAverage(recentWeek, 'craving_intensity')
    };

    const previousAvgs = {
      cigarettes: calculateAverage(previousWeek, 'cigarettes_smoked'),
      stress: calculateAverage(previousWeek, 'stress_level'),
      mood: calculateAverage(previousWeek, 'mood_level'),
      cravings: calculateAverage(previousWeek, 'craving_intensity')
    };

    const getTrend = (current, previous) => {
      const diff = current - previous;
      if (Math.abs(diff) < 0.5) return 'stable';
      return diff > 0 ? 'increasing' : 'decreasing';
    };

    return {
      cigarettes: {
        trend: getTrend(recentAvgs.cigarettes, previousAvgs.cigarettes),
        change: (recentAvgs.cigarettes - previousAvgs.cigarettes).toFixed(1),
        current: recentAvgs.cigarettes.toFixed(1)
      },
      stress: {
        trend: getTrend(recentAvgs.stress, previousAvgs.stress),
        change: (recentAvgs.stress - previousAvgs.stress).toFixed(1),
        current: recentAvgs.stress.toFixed(1)
      },
      mood: {
        trend: getTrend(recentAvgs.mood, previousAvgs.mood),
        change: (recentAvgs.mood - previousAvgs.mood).toFixed(1),
        current: recentAvgs.mood.toFixed(1)
      },
      cravings: {
        trend: getTrend(recentAvgs.cravings, previousAvgs.cravings),
        change: (recentAvgs.cravings - previousAvgs.cravings).toFixed(1),
        current: recentAvgs.cravings.toFixed(1)
      }
    };
  };

  const getInsights = () => {
    if (!analytics || logs.length === 0) return [];

    const insights = [];
    const patterns = getPatternData();

    // Smoke-free insights
    if (analytics.smokeFreeRate > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Progress!',
        message: `You've been smoke-free ${analytics.smokeFreeRate}% of the time. Keep up the great work!`,
        icon: <CheckCircleOutlined />
      });
    } else if (analytics.smokeFreeRate > 50) {
      insights.push({
        type: 'warning',
        title: 'Good Progress',
        message: `You're smoke-free ${analytics.smokeFreeRate}% of the time. You're on the right track!`,
        icon: <TrendingUpOutlined />
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Room for Improvement',
        message: `Focus on reducing cigarette consumption. You're currently smoke-free ${analytics.smokeFreeRate}% of the time.`,
        icon: <WarningOutlined />
      });
    }

    // Stress level insights
    if (parseFloat(analytics.avgStressLevel) > 7) {
      insights.push({
        type: 'warning',
        title: 'High Stress Levels',
        message: `Your average stress level is ${analytics.avgStressLevel}/10. Consider stress management techniques.`,
        icon: <WarningOutlined />
      });
    }

    // Mood insights
    if (parseFloat(analytics.avgMoodLevel) < 5) {
      insights.push({
        type: 'info',
        title: 'Mood Support',
        message: `Your average mood is ${analytics.avgMoodLevel}/10. Consider mood-boosting activities.`,
        icon: <HeartOutlined />
      });
    }

    // Sleep insights
    if (parseFloat(analytics.avgSleepHours) < 7) {
      insights.push({
        type: 'warning',
        title: 'Sleep Quality',
        message: `You're averaging ${analytics.avgSleepHours} hours of sleep. Aim for 7-9 hours for better recovery.`,
        icon: <ClockCircleOutlined />
      });
    }

    return insights;
  };

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpOutlined style={{ color: '#ff4d4f' }} />;
      case 'decreasing':
        return <TrendingDownOutlined style={{ color: '#52c41a' }} />;
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />;
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics || logs.length === 0) {
    return (
      <div className="log-analytics">
        <div className="container py-4">
          <Empty
            description="No data available for analytics"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const patterns = getPatternData();
  const trends = getTrendAnalysis();
  const insights = getInsights();

  return (
    <div className="log-analytics">
      <div className="container py-4">
        {/* Header */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <LineChartOutlined /> Daily Log Analytics
                  </Title>
                  <Text type="secondary">
                    Analyze your wellness patterns and trends
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Button icon={<ExportOutlined />}>
                      Export Report
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <Space>
                    <Text strong>Date Range:</Text>
                    <RangePicker
                      value={selectedDateRange}
                      onChange={setSelectedDateRange}
                      format="DD/MM/YYYY"
                      allowClear={false}
                    />
                  </Space>
                </Col>
                <Col xs={24} md={6}>
                  <Space>
                    <Text strong>View:</Text>
                    <Select
                      value={viewType}
                      onChange={setViewType}
                      style={{ width: 120 }}
                    >
                      <Option value="overview">Overview</Option>
                      <Option value="trends">Trends</Option>
                      <Option value="patterns">Patterns</Option>
                      <Option value="insights">Insights</Option>
                    </Select>
                  </Space>
                </Col>
                <Col xs={24} md={6}>
                  <Space>
                    <Text strong>Chart:</Text>
                    <Select
                      value={chartType}
                      onChange={setChartType}
                      style={{ width: 120 }}
                    >
                      <Option value="line">Line</Option>
                      <Option value="bar">Bar</Option>
                      <Option value="area">Area</Option>
                    </Select>
                  </Space>
                </Col>
                <Col xs={24} md={4}>
                  <Button
                    type="primary"
                    onClick={fetchAnalyticsData}
                  >
                    Refresh
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Overview Section */}
        {viewType === 'overview' && (
          <>
            {/* Summary Statistics */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Days Tracked"
                    value={analytics.totalDays}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Smoke-Free Rate"
                    value={`${analytics.smokeFreeRate}%`}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Avg Daily Cigarettes"
                    value={analytics.avgDailyCigarettes}
                    prefix={<FireOutlined />}
                    valueStyle={{ 
                      color: parseFloat(analytics.avgDailyCigarettes) > 0 ? '#ff4d4f' : '#52c41a' 
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Avg Mood Level"
                    value={`${analytics.avgMoodLevel}/10`}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Main Chart */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24}>
                <Card title="Daily Metrics Over Time">
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' && (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cigarettes" stroke="#ff4d4f" name="Cigarettes" />
                        <Line type="monotone" dataKey="stress" stroke="#faad14" name="Stress" />
                        <Line type="monotone" dataKey="mood" stroke="#52c41a" name="Mood" />
                        <Line type="monotone" dataKey="cravings" stroke="#722ed1" name="Cravings" />
                      </LineChart>
                    )}
                    {chartType === 'bar' && (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="cigarettes" fill="#ff4d4f" name="Cigarettes" />
                        <Bar dataKey="stress" fill="#faad14" name="Stress" />
                        <Bar dataKey="mood" fill="#52c41a" name="Mood" />
                        <Bar dataKey="cravings" fill="#722ed1" name="Cravings" />
                      </BarChart>
                    )}
                    {chartType === 'area' && (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="cigarettes" stackId="1" stroke="#ff4d4f" fill="#ff4d4f" name="Cigarettes" />
                        <Area type="monotone" dataKey="stress" stackId="1" stroke="#faad14" fill="#faad14" name="Stress" />
                        <Area type="monotone" dataKey="mood" stackId="1" stroke="#52c41a" fill="#52c41a" name="Mood" />
                        <Area type="monotone" dataKey="cravings" stackId="1" stroke="#722ed1" fill="#722ed1" name="Cravings" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Trends Section */}
        {viewType === 'trends' && trends && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24}>
              <Card title="Weekly Trend Analysis">
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={6}>
                    <Card size="small">
                      <Space>
                        {renderTrendIcon(trends.cigarettes.trend)}
                        <div>
                          <Text strong>Cigarettes</Text>
                          <br />
                          <Text type="secondary">{trends.cigarettes.current} avg</Text>
                          <br />
                          <Text style={{ 
                            color: trends.cigarettes.trend === 'decreasing' ? '#52c41a' : '#ff4d4f' 
                          }}>
                            {trends.cigarettes.change > 0 ? '+' : ''}{trends.cigarettes.change}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card size="small">
                      <Space>
                        {renderTrendIcon(trends.stress.trend)}
                        <div>
                          <Text strong>Stress</Text>
                          <br />
                          <Text type="secondary">{trends.stress.current}/10 avg</Text>
                          <br />
                          <Text style={{ 
                            color: trends.stress.trend === 'decreasing' ? '#52c41a' : '#ff4d4f' 
                          }}>
                            {trends.stress.change > 0 ? '+' : ''}{trends.stress.change}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card size="small">
                      <Space>
                        {renderTrendIcon(trends.mood.trend)}
                        <div>
                          <Text strong>Mood</Text>
                          <br />
                          <Text type="secondary">{trends.mood.current}/10 avg</Text>
                          <br />
                          <Text style={{ 
                            color: trends.mood.trend === 'increasing' ? '#52c41a' : '#ff4d4f' 
                          }}>
                            {trends.mood.change > 0 ? '+' : ''}{trends.mood.change}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card size="small">
                      <Space>
                        {renderTrendIcon(trends.cravings.trend)}
                        <div>
                          <Text strong>Cravings</Text>
                          <br />
                          <Text type="secondary">{trends.cravings.current}/10 avg</Text>
                          <br />
                          <Text style={{ 
                            color: trends.cravings.trend === 'decreasing' ? '#52c41a' : '#ff4d4f' 
                          }}>
                            {trends.cravings.change > 0 ? '+' : ''}{trends.cravings.change}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        {/* Patterns Section */}
        {viewType === 'patterns' && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} md={12}>
              <Card title="Patterns by Day of Week">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.values(patterns.byDayOfWeek)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="avgCigarettes" fill="#ff4d4f" name="Avg Cigarettes" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Stress Level Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Low (1-3)', value: patterns.byStressLevel.low },
                        { name: 'Medium (4-6)', value: patterns.byStressLevel.medium },
                        { name: 'High (7-10)', value: patterns.byStressLevel.high }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {[
                        { name: 'Low (1-3)', value: patterns.byStressLevel.low },
                        { name: 'Medium (4-6)', value: patterns.byStressLevel.medium },
                        { name: 'High (7-10)', value: patterns.byStressLevel.high }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* Insights Section */}
        {viewType === 'insights' && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24}>
              <Card title="Personalized Insights">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {insights.map((insight, index) => (
                    <Alert
                      key={index}
                      message={insight.title}
                      description={insight.message}
                      type={insight.type}
                      showIcon
                      icon={insight.icon}
                    />
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default LogAnalytics;
