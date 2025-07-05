import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Rate, Button, Space, Tag, 
  DatePicker, Select, Timeline, Modal, Form, Input,
  Slider, Progress, Statistic, Alert, Tooltip, Empty, Spin
} from 'antd';
import {
  SmileOutlined, FrownOutlined, MehOutlined, HeartOutlined,
  PlusOutlined, LineChartOutlined, CalendarOutlined,
  TrendingUpOutlined, TrendingDownOutlined, MinusOutlined,
  SaveOutlined, EditOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { getMoodTrackingData, createDailyLog, updateDailyLog } from '../../services/dailylogService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MoodTracker = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState([]);
  const [moodSummary, setMoodSummary] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [quickLogModalVisible, setQuickLogModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId) {
      fetchMoodData();
    }
  }, [userId, selectedPeriod]);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      
      const response = await getMoodTrackingData(userId, selectedPeriod);
      
      if (response.success) {
        setMoodData(response.data || []);
        setMoodSummary(response.summary);
      } else {
        setMoodData([]);
        setMoodSummary(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setLoading(false);
    }
  };

  const handleQuickMoodLog = async (values) => {
    try {
      setSubmitting(true);
      
      const logData = {
        member_id: userId,
        log_date: moment().format('YYYY-MM-DD'),
        log_time: moment().format('HH:mm:ss'),
        mood_level: values.mood_level,
        stress_level: values.stress_level || 5,
        craving_intensity: values.craving_intensity || 5,
        notes: values.mood_note || '',
        cigarettes_smoked: 0, // Default for quick mood log
        sleep_hours: 8, // Default values
        physical_activity: 'moderate',
        overall_health: 'good'
      };

      await createDailyLog(logData);
      
      setQuickLogModalVisible(false);
      form.resetFields();
      await fetchMoodData(); // Refresh data
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error saving mood log:', error);
      setSubmitting(false);
    }
  };

  const getMoodIcon = (mood) => {
    if (mood <= 3) return { icon: <FrownOutlined />, color: '#ff4d4f', text: 'Low' };
    if (mood <= 6) return { icon: <MehOutlined />, color: '#faad14', text: 'Neutral' };
    return { icon: <SmileOutlined />, color: '#52c41a', text: 'Good' };
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '😆', '🤩'];
    return emojis[Math.min(Math.floor(mood) - 1, 9)] || '😐';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpOutlined style={{ color: '#52c41a' }} />;
      case 'declining':
        return <TrendingDownOutlined style={{ color: '#ff4d4f' }} />;
      case 'stable':
        return <MinusOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getChartData = () => {
    return moodData.map(item => ({
      date: moment(item.date).format('MM/DD'),
      mood: item.mood,
      stress: item.stress,
      cravings: item.craving,
      cigarettes: item.cigarettes
    }));
  };

  const getMoodDistribution = () => {
    const distribution = { low: 0, neutral: 0, good: 0 };
    
    moodData.forEach(item => {
      if (item.mood <= 3) distribution.low++;
      else if (item.mood <= 6) distribution.neutral++;
      else distribution.good++;
    });

    return distribution;
  };

  const getCorrelationInsights = () => {
    if (moodData.length < 7) return [];

    const insights = [];
    
    // Mood vs Cigarettes correlation
    const highCigaretteDays = moodData.filter(d => d.cigarettes > 0);
    const smokeFreedays = moodData.filter(d => d.cigarettes === 0);
    
    if (highCigaretteDays.length > 0 && smokeFreedays.length > 0) {
      const avgMoodCigarettes = highCigaretteDays.reduce((sum, d) => sum + d.mood, 0) / highCigaretteDays.length;
      const avgMoodSmokeFree = smokeFreedays.reduce((sum, d) => sum + d.mood, 0) / smokeFreedays.length;
      
      if (avgMoodSmokeFree > avgMoodCigarettes + 1) {
        insights.push({
          type: 'success',
          title: 'Positive Pattern',
          message: `Your mood is significantly better on smoke-free days (${avgMoodSmokeFree.toFixed(1)}/10) vs days with cigarettes (${avgMoodCigarettes.toFixed(1)}/10).`
        });
      }
    }

    // Stress vs Mood correlation
    const highStressDays = moodData.filter(d => d.stress >= 7);
    const lowStressDays = moodData.filter(d => d.stress <= 4);
    
    if (highStressDays.length > 0 && lowStressDays.length > 0) {
      const avgMoodHighStress = highStressDays.reduce((sum, d) => sum + d.mood, 0) / highStressDays.length;
      const avgMoodLowStress = lowStressDays.reduce((sum, d) => sum + d.mood, 0) / lowStressDays.length;
      
      if (avgMoodLowStress > avgMoodHighStress + 1) {
        insights.push({
          type: 'info',
          title: 'Stress Impact',
          message: `Your mood drops significantly during high-stress periods. Consider stress management techniques.`
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading mood data...</div>
      </div>
    );
  }

  const chartData = getChartData();
  const moodDistribution = getMoodDistribution();
  const correlationInsights = getCorrelationInsights();

  return (
    <div className="mood-tracker">
      <div className="container py-4">
        {/* Header */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <HeartOutlined /> Mood Tracker
                  </Title>
                  <Text type="secondary">
                    Track and analyze your daily mood patterns
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setQuickLogModalVisible(true)}
                    >
                      Quick Mood Log
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={8}>
            <Card size="small">
              <Space>
                <Text strong>Time Period:</Text>
                <Select
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  style={{ width: 120 }}
                >
                  <Option value={7}>7 days</Option>
                  <Option value={14}>14 days</Option>
                  <Option value={30}>30 days</Option>
                  <Option value={90}>90 days</Option>
                </Select>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Summary Statistics */}
        {moodSummary && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Average Mood"
                  value={`${moodSummary.avgMood}/10`}
                  prefix={getMoodIcon(parseFloat(moodSummary.avgMood)).icon}
                  valueStyle={{ color: getMoodIcon(parseFloat(moodSummary.avgMood)).color }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Average Stress"
                  value={`${moodSummary.avgStress}/10`}
                  prefix={<InfoCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Space direction="vertical" size="small">
                  <Text strong>Mood Trend</Text>
                  <Space>
                    {getTrendIcon(moodSummary.moodTrend)}
                    <Text>{moodSummary.moodTrend}</Text>
                  </Space>
                </Space>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Space direction="vertical" size="small">
                  <Text strong>Stress Trend</Text>
                  <Space>
                    {getTrendIcon(moodSummary.stressTrend)}
                    <Text>{moodSummary.stressTrend}</Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Mood Chart */}
          <Col xs={24} lg={16}>
            <Card title="Mood Trends Over Time">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#52c41a" 
                      strokeWidth={3}
                      name="Mood" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress" 
                      stroke="#ff4d4f" 
                      name="Stress" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cravings" 
                      stroke="#722ed1" 
                      name="Cravings" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No mood data available" />
              )}
            </Card>
          </Col>

          {/* Mood Distribution */}
          <Col xs={24} lg={8}>
            <Card title="Mood Distribution" className="mb-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Good Days ({moodDistribution.good})</Text>
                  <Progress 
                    percent={moodData.length > 0 ? (moodDistribution.good / moodData.length * 100) : 0} 
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </div>
                <div>
                  <Text strong>Neutral Days ({moodDistribution.neutral})</Text>
                  <Progress 
                    percent={moodData.length > 0 ? (moodDistribution.neutral / moodData.length * 100) : 0} 
                    strokeColor="#faad14"
                    showInfo={false}
                  />
                </div>
                <div>
                  <Text strong>Low Days ({moodDistribution.low})</Text>
                  <Progress 
                    percent={moodData.length > 0 ? (moodDistribution.low / moodData.length * 100) : 0} 
                    strokeColor="#ff4d4f"
                    showInfo={false}
                  />
                </div>
              </Space>
            </Card>

            {/* Recent Mood Entries */}
            <Card title="Recent Entries" size="small">
              <Timeline size="small">
                {moodData.slice(0, 5).map((entry, index) => {
                  const moodInfo = getMoodIcon(entry.mood);
                  return (
                    <Timeline.Item
                      key={index}
                      dot={moodInfo.icon}
                      color={moodInfo.color}
                    >
                      <Space direction="vertical" size="small">
                        <Text strong>{moment(entry.date).format('DD/MM/YYYY')}</Text>
                        <Space>
                          <span style={{ fontSize: '18px' }}>{getMoodEmoji(entry.mood)}</span>
                          <Text>Mood: {entry.mood}/10</Text>
                        </Space>
                        <Text type="secondary">Stress: {entry.stress}/10</Text>
                      </Space>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Card>
          </Col>
        </Row>

        {/* Insights */}
        {correlationInsights.length > 0 && (
          <Row gutter={[16, 16]} className="mt-4">
            <Col xs={24}>
              <Card title="Mood Insights">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {correlationInsights.map((insight, index) => (
                    <Alert
                      key={index}
                      message={insight.title}
                      description={insight.message}
                      type={insight.type}
                      showIcon
                    />
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tips */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <Card title="Mood Improvement Tips" size="small">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Alert
                    message="Physical Activity"
                    description="Regular exercise can significantly boost your mood and reduce stress levels."
                    type="info"
                    showIcon
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Alert
                    message="Sleep Quality"
                    description="Aim for 7-9 hours of quality sleep to maintain stable mood levels."
                    type="info"
                    showIcon
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Alert
                    message="Social Support"
                    description="Connect with friends, family, or support groups when feeling low."
                    type="info"
                    showIcon
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Quick Mood Log Modal */}
        <Modal
          title={
            <Space>
              <HeartOutlined />
              Quick Mood Log
            </Space>
          }
          open={quickLogModalVisible}
          onCancel={() => setQuickLogModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleQuickMoodLog}
            initialValues={{
              mood_level: 5,
              stress_level: 5,
              craving_intensity: 5
            }}
          >
            <Form.Item
              name="mood_level"
              label="How are you feeling right now?"
              rules={[{ required: true, message: 'Please rate your mood' }]}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Slider
                  min={1}
                  max={10}
                  marks={{
                    1: '😢',
                    3: '😕',
                    5: '😐',
                    7: '🙂',
                    10: '😊'
                  }}
                  tooltip={{ 
                    formatter: (value) => `${value}/10 - ${getMoodIcon(value).text}` 
                  }}
                />
              </div>
            </Form.Item>

            <Form.Item
              name="stress_level"
              label="Current Stress Level"
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: 'Relaxed',
                  5: 'Moderate',
                  10: 'High'
                }}
                tooltip={{ formatter: (value) => `${value}/10` }}
              />
            </Form.Item>

            <Form.Item
              name="craving_intensity"
              label="Smoking Cravings"
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: 'None',
                  5: 'Moderate',
                  10: 'Intense'
                }}
                tooltip={{ formatter: (value) => `${value}/10` }}
              />
            </Form.Item>

            <Form.Item
              name="mood_note"
              label="What's affecting your mood? (Optional)"
            >
              <TextArea
                rows={3}
                placeholder="Share what's making you feel this way..."
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setQuickLogModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  Save Mood Log
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MoodTracker;
