import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Form, Button, Slider, Input, 
  Select, TimePicker, Rate, Space, Tag, message, Alert,
  Progress, Statistic, DatePicker, Switch, InputNumber,
  Divider, Tooltip, Badge, Empty, Spin
} from 'antd';
import {
  SaveOutlined, ClockCircleOutlined, HeartOutlined, 
  FireOutlined, SmileOutlined, FrownOutlined, 
  MehOutlined, CheckCircleOutlined, WarningOutlined,
  TrophyOutlined, CalendarOutlined, LineChartOutlined,
  EditOutlined, EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createDailyLog, 
  getMemberDailyLogByDate, 
  updateDailyLog 
} from '../../services/dailylogService';
import { getQuitPlanData } from '../../services/memberDashboardService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DailyLog = () => {
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [existingLog, setExistingLog] = useState(null);
  const [quitPlan, setQuitPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [todayStats, setTodayStats] = useState(null);

  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId) {
      fetchDailyData();
    }
  }, [userId, selectedDate]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      
      const [quitPlanData, existingLogData] = await Promise.all([
        getQuitPlanData(userId),
        getMemberDailyLogByDate(userId, selectedDate.format('YYYY-MM-DD'))
      ]);

      setQuitPlan(quitPlanData);
      
      if (existingLogData && existingLogData.data) {
        setExistingLog(existingLogData.data);
        form.setFieldsValue({
          ...existingLogData.data,
          log_time: existingLogData.data.log_time ? moment(existingLogData.data.log_time) : moment()
        });
        setEditMode(true);
      } else {
        setExistingLog(null);
        form.resetFields();
        setEditMode(false);
      }

      // Calculate today's stats
      if (quitPlanData) {
        const statsData = {
          daysSmokeFree: quitPlanData.days_smoke_free || 0,
          currentPhase: quitPlanData.current_phase?.phase_name || 'Preparation',
          progressPercentage: quitPlanData.overall_progress || 0,
          moneySaved: quitPlanData.money_saved || 0
        };
        setTodayStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const logData = {
        member_id: userId,
        log_date: selectedDate.format('YYYY-MM-DD'),
        log_time: values.log_time ? values.log_time.format('HH:mm:ss') : moment().format('HH:mm:ss'),
        cigarettes_smoked: values.cigarettes_smoked || 0,
        stress_level: values.stress_level,
        mood_level: values.mood_level,
        craving_intensity: values.craving_intensity,
        sleep_hours: values.sleep_hours,
        sleep_quality: values.sleep_quality,
        physical_activity: values.physical_activity,
        water_intake: values.water_intake,
        triggers_experienced: values.triggers_experienced ? values.triggers_experienced.join(',') : '',
        coping_strategies_used: values.coping_strategies_used ? values.coping_strategies_used.join(',') : '',
        notes: values.notes || '',
        overall_health: values.overall_health,
        withdrawal_symptoms: values.withdrawal_symptoms ? values.withdrawal_symptoms.join(',') : '',
        support_received: values.support_received || false,
        challenges_faced: values.challenges_faced || '',
        victories_achieved: values.victories_achieved || ''
      };

      let response;
      if (existingLog) {
        response = await updateDailyLog(existingLog.log_id, logData);
        message.success('Daily log updated successfully!');
      } else {
        response = await createDailyLog(logData);
        message.success('Daily log created successfully!');
      }

      if (response.success) {
        // Refresh the data
        await fetchDailyData();
      }

    } catch (error) {
      console.error('Error submitting daily log:', error);
      message.error('Failed to save daily log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodIcon = (mood) => {
    if (mood <= 3) return <FrownOutlined style={{ color: '#ff4d4f' }} />;
    if (mood <= 6) return <MehOutlined style={{ color: '#faad14' }} />;
    return <SmileOutlined style={{ color: '#52c41a' }} />;
  };

  const getHealthColor = (level) => {
    if (level <= 3) return '#ff4d4f';
    if (level <= 6) return '#faad14';
    return '#52c41a';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading daily log...</div>
      </div>
    );
  }

  const isToday = selectedDate.isSame(moment(), 'day');
  const isFuture = selectedDate.isAfter(moment(), 'day');

  return (
    <div className="daily-log">
      <div className="container py-4">
        {/* Header */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    <CalendarOutlined /> Daily Health Log
                  </Title>
                  <Text type="secondary">
                    Track your daily progress and wellness metrics
                  </Text>
                </div>
                <Space direction="vertical" size="small">
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    disabledDate={(date) => date.isAfter(moment(), 'day')}
                    format="DD/MM/YYYY"
                  />
                  {existingLog && (
                    <Badge 
                      status="success" 
                      text={editMode ? "Editing existing log" : "Log completed"} 
                    />
                  )}
                </Space>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Stats */}
        {todayStats && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Days Smoke-Free"
                  value={todayStats.daysSmokeFree}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Current Phase"
                  value={todayStats.currentPhase}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Progress"
                  value={todayStats.progressPercentage}
                  suffix="%"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Money Saved"
                  value={todayStats.moneySaved}
                  prefix="$"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Alerts */}
        {isFuture && (
          <Alert
            message="Future Date Selected"
            description="You cannot log data for future dates. Please select today or a past date."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {!isFuture && (
          <Row gutter={[16, 16]}>
            {/* Main Logging Form */}
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <Space>
                    {existingLog ? <EditOutlined /> : <SaveOutlined />}
                    {existingLog ? `Edit Log for ${selectedDate.format('DD/MM/YYYY')}` : `Log for ${selectedDate.format('DD/MM/YYYY')}`}
                  </Space>
                }
                extra={
                  existingLog && (
                    <Tag color="green">
                      <CheckCircleOutlined /> Completed
                    </Tag>
                  )
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    log_time: moment(),
                    cigarettes_smoked: 0,
                    stress_level: 5,
                    mood_level: 5,
                    craving_intensity: 5,
                    sleep_hours: 8,
                    sleep_quality: 'good',
                    physical_activity: 'moderate',
                    water_intake: 8,
                    overall_health: 'good',
                    support_received: false
                  }}
                >
                  {/* Basic Metrics */}
                  <Divider orientation="left">Basic Health Metrics</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="log_time"
                        label="Log Time"
                      >
                        <TimePicker 
                          format="HH:mm"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="cigarettes_smoked"
                        label="Cigarettes Smoked Today"
                        rules={[{ required: true, message: 'Please enter number of cigarettes' }]}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                          prefix={<FireOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="overall_health"
                        label="Overall Health Today"
                        rules={[{ required: true, message: 'Please select your overall health' }]}
                      >
                        <Select>
                          <Option value="excellent">Excellent</Option>
                          <Option value="good">Good</Option>
                          <Option value="fair">Fair</Option>
                          <Option value="poor">Poor</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Emotional State */}
                  <Divider orientation="left">Emotional State</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="stress_level"
                        label={
                          <span>
                            Stress Level (1-10) 
                            <Tooltip title="1 = Very relaxed, 10 = Extremely stressed">
                              <WarningOutlined style={{ marginLeft: 8, color: '#faad14' }} />
                            </Tooltip>
                          </span>
                        }
                        rules={[{ required: true, message: 'Please rate your stress level' }]}
                      >
                        <Slider
                          min={1}
                          max={10}
                          marks={{
                            1: '1',
                            5: '5',
                            10: '10'
                          }}
                          tooltip={{ formatter: (value) => `${value}/10` }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="mood_level"
                        label={
                          <span>
                            Mood Level (1-10)
                            <Tooltip title="1 = Very low mood, 10 = Excellent mood">
                              <HeartOutlined style={{ marginLeft: 8, color: '#52c41a' }} />
                            </Tooltip>
                          </span>
                        }
                        rules={[{ required: true, message: 'Please rate your mood' }]}
                      >
                        <Slider
                          min={1}
                          max={10}
                          marks={{
                            1: '😢',
                            5: '😐',
                            10: '😊'
                          }}
                          tooltip={{ formatter: (value) => `${value}/10` }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="craving_intensity"
                        label={
                          <span>
                            Craving Intensity (1-10)
                            <Tooltip title="1 = No cravings, 10 = Extremely strong cravings">
                              <FireOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />
                            </Tooltip>
                          </span>
                        }
                        rules={[{ required: true, message: 'Please rate your cravings' }]}
                      >
                        <Slider
                          min={1}
                          max={10}
                          marks={{
                            1: '1',
                            5: '5',
                            10: '10'
                          }}
                          tooltip={{ formatter: (value) => `${value}/10` }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Physical Wellness */}
                  <Divider orientation="left">Physical Wellness</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="sleep_hours"
                        label="Hours of Sleep"
                        rules={[{ required: true, message: 'Please enter sleep hours' }]}
                      >
                        <InputNumber
                          min={0}
                          max={24}
                          step={0.5}
                          style={{ width: '100%' }}
                          formatter={value => `${value} hrs`}
                          parser={value => value.replace(' hrs', '')}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="sleep_quality"
                        label="Sleep Quality"
                      >
                        <Select>
                          <Option value="excellent">Excellent</Option>
                          <Option value="good">Good</Option>
                          <Option value="fair">Fair</Option>
                          <Option value="poor">Poor</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="water_intake"
                        label="Water Intake (glasses)"
                      >
                        <InputNumber
                          min={0}
                          max={20}
                          style={{ width: '100%' }}
                          formatter={value => `${value} glasses`}
                          parser={value => value.replace(' glasses', '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="physical_activity"
                        label="Physical Activity Level"
                      >
                        <Select>
                          <Option value="none">None</Option>
                          <Option value="light">Light (Walking, stretching)</Option>
                          <Option value="moderate">Moderate (Jogging, cycling)</Option>
                          <Option value="intense">Intense (Gym, sports)</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="support_received"
                        label="Received Support Today"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Yes"
                          unCheckedChildren="No"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Triggers and Coping */}
                  <Divider orientation="left">Triggers & Coping Strategies</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="triggers_experienced"
                        label="Triggers Experienced Today"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select triggers you experienced"
                          allowClear
                        >
                          <Option value="stress">Stress</Option>
                          <Option value="boredom">Boredom</Option>
                          <Option value="social_situations">Social Situations</Option>
                          <Option value="after_meals">After Meals</Option>
                          <Option value="alcohol">Alcohol</Option>
                          <Option value="coffee">Coffee/Tea</Option>
                          <Option value="work_pressure">Work Pressure</Option>
                          <Option value="loneliness">Loneliness</Option>
                          <Option value="anxiety">Anxiety</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="coping_strategies_used"
                        label="Coping Strategies Used"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select strategies you used"
                          allowClear
                        >
                          <Option value="deep_breathing">Deep Breathing</Option>
                          <Option value="exercise">Exercise</Option>
                          <Option value="meditation">Meditation</Option>
                          <Option value="distraction">Distraction Activities</Option>
                          <Option value="support_call">Called Support Person</Option>
                          <Option value="nicotine_replacement">Nicotine Replacement</Option>
                          <Option value="journaling">Journaling</Option>
                          <Option value="music">Music/Entertainment</Option>
                          <Option value="hobby">Hobby Activities</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="withdrawal_symptoms"
                        label="Withdrawal Symptoms Experienced"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select symptoms you experienced"
                          allowClear
                        >
                          <Option value="irritability">Irritability</Option>
                          <Option value="anxiety">Anxiety</Option>
                          <Option value="restlessness">Restlessness</Option>
                          <Option value="difficulty_concentrating">Difficulty Concentrating</Option>
                          <Option value="headache">Headache</Option>
                          <Option value="fatigue">Fatigue</Option>
                          <Option value="insomnia">Insomnia</Option>
                          <Option value="increased_appetite">Increased Appetite</Option>
                          <Option value="depression">Depression</Option>
                          <Option value="none">None</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Reflections */}
                  <Divider orientation="left">Daily Reflections</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="challenges_faced"
                        label="Challenges Faced Today"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Describe any challenges you faced today..."
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="victories_achieved"
                        label="Victories & Achievements"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Share your victories and achievements today..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="notes"
                    label="Additional Notes"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Any additional thoughts, feelings, or observations about your day..."
                    />
                  </Form.Item>

                  {/* Submit Button */}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={existingLog ? <EditOutlined /> : <SaveOutlined />}
                      loading={submitting}
                      size="large"
                      block
                    >
                      {existingLog ? 'Update Daily Log' : 'Save Daily Log'}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              {/* Today's Summary */}
              {existingLog && (
                <Card title="Today's Summary" className="mb-4">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Cigarettes Smoked: </Text>
                      <Tag color={existingLog.cigarettes_smoked === 0 ? 'green' : 'red'}>
                        {existingLog.cigarettes_smoked}
                      </Tag>
                    </div>
                    
                    <div>
                      <Text strong>Mood: </Text>
                      <Space>
                        {getMoodIcon(existingLog.mood_level)}
                        <span>{existingLog.mood_level}/10</span>
                      </Space>
                    </div>

                    <div>
                      <Text strong>Stress Level: </Text>
                      <Progress 
                        percent={existingLog.stress_level * 10} 
                        size="small"
                        strokeColor={getHealthColor(existingLog.stress_level)}
                        format={() => `${existingLog.stress_level}/10`}
                      />
                    </div>

                    <div>
                      <Text strong>Cravings: </Text>
                      <Progress 
                        percent={existingLog.craving_intensity * 10} 
                        size="small"
                        strokeColor={getHealthColor(10 - existingLog.craving_intensity)}
                        format={() => `${existingLog.craving_intensity}/10`}
                      />
                    </div>

                    <div>
                      <Text strong>Sleep: </Text>
                      <span>{existingLog.sleep_hours} hours ({existingLog.sleep_quality})</span>
                    </div>
                  </Space>
                </Card>
              )}

              {/* Quick Tips */}
              <Card title="Daily Logging Tips" size="small">
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  <li>Be honest about your cigarette consumption</li>
                  <li>Rate your mood and stress levels accurately</li>
                  <li>Note any triggers you experienced</li>
                  <li>Celebrate small victories</li>
                  <li>Track your sleep and physical activity</li>
                  <li>Use the notes section for detailed reflections</li>
                </ul>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default DailyLog;
