import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Steps, Avatar, Tag, 
  Button, Descriptions, Space, Divider, Modal,
  message, Form, Input, DatePicker, Select
} from 'antd';
import { 
  UserOutlined, EditOutlined, MedicineBoxOutlined,
  CheckCircleOutlined, CalendarOutlined, MessageOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getQuitPlanDetail, updateQuitPlanDetail } from '../../services/quitPlanDetailService';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const QuitPlanDetail = ({ quitPlanId = 201 }) => {
  const [quitPlan, setQuitPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    const fetchQuitPlanDetail = async () => {
      try {
        const quitPlanData = getQuitPlanDetail(quitPlanId);
        setQuitPlan(quitPlanData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quit plan details:", error);
        setLoading(false);
      }
    };

    fetchQuitPlanDetail();
  }, [quitPlanId]);

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
        message.success(response.message);
        setEditModalVisible(false);
        
        // Update the state
        setQuitPlan({
          ...quitPlan,
          ...updateData
        });
      } else {
        message.error(response.message || "Failed to update quit plan");
      }
    } catch (error) {
      console.error("Error updating quit plan:", error);
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

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get current phase index for the Steps component
  const getCurrentPhaseIndex = () => {
    return quitPlan.quit_phases.findIndex(phase => 
      phase.phase_name === quitPlan.current_phase.phase_name
    );
  };

  return (
    <div className="quit-plan-detail">
      <div className="container py-4">
        <Title level={2}>Your Quit Plan</Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Main Plan Details */}
            <Card 
              title="Quit Plan Overview" 
              extra={
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEditPlan}
                >
                  Edit Plan
                </Button>
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
              <div className="coach-card">
                <Avatar 
                  size={80} 
                  src={quitPlan.coach_photo} 
                  icon={<UserOutlined />} 
                />
                <Title level={4}>{quitPlan.coach_name}</Title>
                <Space direction="vertical" align="center">
                  <Button type="primary" icon={<MessageOutlined />}>
                    Message Coach
                  </Button>
                  <Button type="default" icon={<CalendarOutlined />}>
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
          visible={editModalVisible}
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
          <Form
            form={form}
            layout="vertical"
          >
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