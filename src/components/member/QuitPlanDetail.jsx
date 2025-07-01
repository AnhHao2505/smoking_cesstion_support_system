import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Steps, Avatar, Tag, 
  Button, Descriptions, Space, Divider, Modal,
  message, Form, Input, DatePicker, Select, Progress,
  Timeline, List, Statistic, Alert, Tooltip
} from 'antd';
import { 
  UserOutlined, EditOutlined, MedicineBoxOutlined,
  CheckCircleOutlined, CalendarOutlined, MessageOutlined,
  ClockCircleOutlined, TrophyOutlined, HeartOutlined,
  FireOutlined, BarChartOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getQuitPlanDetail, updateQuitPlanDetail } from '../../services/quitPlanDetailService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const QuitPlanDetail = ({ quitPlanId, allowEdit = true }) => {
  const [quitPlan, setQuitPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [progressStats, setProgressStats] = useState(null);
  const [form] = Form.useForm();
  
  const user = getCurrentUser();
  const canEdit = allowEdit && (user?.role === 'MEMBER' || user?.role === 'COACH');
  
  useEffect(() => {
    fetchQuitPlanDetail();
    fetchProgressStats();
  }, [quitPlanId]);

  const fetchQuitPlanDetail = async () => {
    try {
      const quitPlanData = getQuitPlanDetail(quitPlanId);
      setQuitPlan(quitPlanData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quit plan details:", error);
      message.error("Failed to load quit plan details");
      setLoading(false);
    }
  };

  const fetchProgressStats = async () => {
    // Mock progress statistics
    const mockStats = {
      days_completed: 45,
      total_days: 90,
      completion_percentage: 50,
      current_streak: 12,
      milestones_achieved: 3,
      next_milestone: "2 Weeks Smoke Free",
      days_to_next_milestone: 2
    };
    setProgressStats(mockStats);
  };

  const handleEditPlan = () => {
    form.setFieldsValue({
      strategies_to_use: quitPlan.strategies_to_use,
      medications_to_use: quitPlan.medications_to_use,
      medication_instructions: quitPlan.medication_instructions,
      end_date: moment(quitPlan.end_date),
      note: quitPlan.note
    });
    setEditModalVisible(true);
  };

  const handleUpdatePlan = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        ...values,
        end_date: values.end_date.format('YYYY-MM-DD')
      };
      
      const response = await updateQuitPlanDetail(quitPlanId, updateData);
      
      if (response.success) {
        message.success("Quit plan updated successfully");
        setEditModalVisible(false);
        setQuitPlan({ ...quitPlan, ...updateData });
      } else {
        message.error(response.message || "Failed to update quit plan");
      }
    } catch (error) {
      console.error("Error updating quit plan:", error);
      message.error("Failed to update quit plan");
    }
  };

  if (loading || !quitPlan) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getCurrentPhaseIndex = () => {
    return quitPlan.quit_phases.findIndex(phase => 
      phase.phase_name === quitPlan.current_phase.phase_name
    );
  };

  return (
    <div className="quit-plan-detail">
      <div className="container py-4">
        <Title level={2}>
          <BarChartOutlined /> Quit Plan Details
        </Title>
        
        {/* Progress Overview */}
        {progressStats && (
          <Card className="mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Statistic
                  title="Days Completed"
                  value={progressStats.days_completed}
                  suffix={`/ ${progressStats.total_days}`}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={progressStats.completion_percentage} 
                  strokeColor="#1890ff"
                  size="small"
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="Current Streak"
                  value={progressStats.current_streak}
                  suffix="days"
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="Milestones Achieved"
                  value={progressStats.milestones_achieved}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={24} md={6}>
                <div>
                  <Text strong>Next Milestone:</Text>
                  <br />
                  <Text>{progressStats.next_milestone}</Text>
                  <br />
                  <Text type="secondary">
                    In {progressStats.days_to_next_milestone} days
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Main Plan Details */}
            <Card 
              title="Quit Plan Overview" 
              extra={
                canEdit && (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={handleEditPlan}
                  >
                    Edit Plan
                  </Button>
                )
              }
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Start Date">
                  {formatDate(quitPlan.start_date)}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {formatDate(quitPlan.end_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={quitPlan.status ? "green" : "red"}>
                    {quitPlan.status ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Common Trigger">
                  {quitPlan.circumstance_name}
                </Descriptions.Item>
                <Descriptions.Item label="Current Phase" span={2}>
                  <Tag color="blue">{quitPlan.current_phase.phase_name}</Tag>
                  <Text type="secondary"> (Started on {formatDate(quitPlan.current_phase.start_date)})</Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={4}>Preparation Steps</Title>
              <Paragraph>{quitPlan.preparation_steps}</Paragraph>

              <Divider />

              <Title level={4}>Strategies</Title>
              <Paragraph>{quitPlan.strategies_to_use}</Paragraph>

              <Divider />

              <Title level={4}>Medications</Title>
              {quitPlan.medications_to_use ? (
                <>
                  <Paragraph>{quitPlan.medications_to_use}</Paragraph>
                  <Text type="secondary">Instructions: {quitPlan.medication_instructions}</Text>
                </>
              ) : (
                <Paragraph>No medications prescribed for this plan.</Paragraph>
              )}

              {quitPlan.note && (
                <>
                  <Divider />
                  <Title level={4}>Notes</Title>
                  <Paragraph>{quitPlan.note}</Paragraph>
                </>
              )}
            </Card>

            {/* Phase Progress */}
            <Card title="Phase Progress" className="mt-4">
              <Steps current={getCurrentPhaseIndex()} direction="vertical">
                {quitPlan.quit_phases.map((phase) => (
                  <Step 
                    key={phase.quit_phase_id}
                    title={phase.phase_name}
                    description={
                      <div>
                        <Paragraph>{phase.objective}</Paragraph>
                        <Text type="secondary">
                          {phase.is_completed 
                            ? `Completed on ${formatDate(phase.end_date)}` 
                            : phase.phase_name === quitPlan.current_phase.phase_name 
                              ? `Started on ${formatDate(phase.start_date)}` 
                              : `Expected to start on ${formatDate(phase.start_date)}`}
                        </Text>
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
          </Col>
          
          <Col xs={24} lg={8}>
            {/* Coach Information */}
            <Card title="Your Coach">
              <div className="coach-card text-center">
                <Avatar 
                  size={80} 
                  src={quitPlan.coach_photo} 
                  icon={<UserOutlined />} 
                />
                <Title level={4} className="mt-2">{quitPlan.coach_name}</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" icon={<MessageOutlined />} block>
                    Message Coach
                  </Button>
                  <Button type="default" icon={<CalendarOutlined />} block>
                    Schedule Appointment
                  </Button>
                </Space>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" className="mt-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<CheckCircleOutlined />}>
                  Log Daily Progress
                </Button>
                <Button block icon={<MedicineBoxOutlined />}>
                  Medication Reminder
                </Button>
                <Button block icon={<CalendarOutlined />}>
                  View All Appointments
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
        
        {/* Edit Plan Modal */}
        <Modal
          title="Edit Quit Plan"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleUpdatePlan}
            >
              Update Plan
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="strategies_to_use"
              label="Strategies"
              rules={[{ required: true, message: 'Please enter your strategies' }]}
            >
              <TextArea rows={3} placeholder="Enter strategies to use..." />
            </Form.Item>
            
            <Form.Item
              name="medications_to_use"
              label="Medications"
            >
              <TextArea rows={2} placeholder="Enter medications to use..." />
            </Form.Item>
            
            <Form.Item
              name="medication_instructions"
              label="Medication Instructions"
            >
              <TextArea rows={2} placeholder="Enter medication instructions..." />
            </Form.Item>
            
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: 'Please select an end date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  return current && current < moment().startOf('day');
                }}
              />
            </Form.Item>
            
            <Form.Item
              name="note"
              label="Notes"
            >
              <TextArea rows={3} placeholder="Enter any additional notes..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default QuitPlanDetail;