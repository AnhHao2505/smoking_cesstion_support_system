import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Steps,
  Row,
  Col,
  Space,
  Divider,
  message,
  Checkbox,
  Tag,
  Avatar,
  Alert
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getQuitPlanByPlanId, updateQuitPlanByCoach } from '../../services/quitPlanService';
import { getSuggestedStrategies, getSuggestedMedications } from '../../services/quitPlanService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const QuitPlanEdit = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [quitPlan, setQuitPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestedStrategies, setSuggestedStrategies] = useState([]);
  const [suggestedMedications, setSuggestedMedications] = useState([]);

  useEffect(() => {
    fetchQuitPlanData();
    fetchSuggestions();
  }, [planId]);

  const fetchQuitPlanData = async () => {
    try {
      setLoading(true);
      const response = await getQuitPlanByPlanId(planId);
      if (response.success) {
        const planData = response.data;
        setQuitPlan(planData);
        
        // Set form values
        form.setFieldsValue({
          strategies_to_use: planData.strategies_to_use?.split(', ') || [],
          medications_to_use: planData.medications_to_use?.split(', ') || [],
          medication_instructions: planData.medication_instructions,
          preparation_steps: planData.preparation_steps,
          end_date: moment(planData.end_date),
          note: planData.note,
          coach_recommendations: planData.coach_recommendations || ''
        });
      } else {
        console.error('Failed to fetch quit plan:', response.message);
        message.error('Failed to load quit plan');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quit plan:', error);
      message.error('Failed to load quit plan');
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const strategies = getSuggestedStrategies();
      const medications = getSuggestedMedications();
      setSuggestedStrategies(strategies);
      setSuggestedMedications(medications);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updateData = {
        strategies_to_use: values.strategies_to_use?.join(', ') || '',
        medications_to_use: values.medications_to_use?.join(', ') || '',
        medication_instructions: values.medication_instructions,
        preparation_steps: values.preparation_steps,
        end_date: values.end_date.format('YYYY-MM-DD'),
        note: values.note,
        coach_recommendations: values.coach_recommendations,
        updated_by_coach: true,
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      const response = await updateQuitPlanByCoach(planId, updateData);
      
      if (response.success) {
        message.success('Quit plan updated successfully');
        navigate('/coach/dashboard');
      } else {
        message.error(response.message || 'Failed to update quit plan');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error updating quit plan:', error);
      message.error('Failed to update quit plan');
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  return (
    <div className="quit-plan-edit">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <EditOutlined /> Edit Quit Plan
          </Title>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/coach/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Member Information */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Space>
                <Avatar size={64} icon={<UserOutlined />} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>Member Information</Title>
                  <Text>Plan ID: {quitPlan.quit_plan_id}</Text>
                  <br />
                  <Text type="secondary">Created: {formatDate(quitPlan.start_date)}</Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8}>
                  <div>
                    <Text strong>Status:</Text>
                    <br />
                    <Tag color={quitPlan.status ? 'green' : 'red'}>
                      {quitPlan.status ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div>
                    <Text strong>Current Phase:</Text>
                    <br />
                    <Tag color="blue">{quitPlan.current_phase.phase_name}</Tag>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div>
                    <Text strong>Trigger:</Text>
                    <br />
                    <Text>{quitPlan.circumstance_name}</Text>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Alert
          message="Coach Instructions"
          description="As a coach, you can modify the strategies, medications, and add professional recommendations to help your member succeed in their quit journey."
          type="info"
          showIcon
          className="mb-4"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={[24, 24]}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              <Card title="Plan Details" className="mb-4">
                <Form.Item
                  name="preparation_steps"
                  label="Preparation Steps"
                  rules={[{ required: true, message: 'Please enter preparation steps' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Enter detailed preparation steps for the member..."
                  />
                </Form.Item>

                <Form.Item
                  name="strategies_to_use"
                  label="Recommended Strategies"
                  rules={[{ required: true, message: 'Please select at least one strategy' }]}
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Row gutter={[16, 8]}>
                      {suggestedStrategies.map((strategy, index) => (
                        <Col span={12} key={index}>
                          <Checkbox value={strategy}>{strategy}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Divider />

                <Form.Item
                  name="medications_to_use"
                  label="Recommended Medications"
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Row gutter={[16, 8]}>
                      {suggestedMedications.map((medication, index) => (
                        <Col span={12} key={index}>
                          <Checkbox value={medication}>{medication}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  name="medication_instructions"
                  label="Medication Instructions"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Enter detailed medication usage instructions..."
                  />
                </Form.Item>

                <Form.Item
                  name="end_date"
                  label="Target End Date"
                  rules={[{ required: true, message: 'Please select target end date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    disabledDate={(current) => {
                      return current && current < moment().startOf('day');
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="coach_recommendations"
                  label="Professional Recommendations"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Add your professional recommendations and guidance for this member..."
                  />
                </Form.Item>

                <Form.Item
                  name="note"
                  label="Additional Notes"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Any additional notes or observations..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              <Card title="Current Phase Progress" className="mb-4">
                <Steps 
                  direction="vertical" 
                  size="small"
                  current={quitPlan.quit_phases.findIndex(p => 
                    p.phase_name === quitPlan.current_phase.phase_name
                  )}
                >
                  {quitPlan.quit_phases.map((phase) => (
                    <Step 
                      key={phase.quit_phase_id}
                      title={phase.phase_name}
                      description={phase.objective}
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

              <Card title="Coach Actions" className="mb-4">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    loading={saving}
                    onClick={handleSave}
                    block
                  >
                    Save Changes
                  </Button>
                  
                  <Button 
                    icon={<CheckCircleOutlined />} 
                    block
                  >
                    Mark Phase Complete
                  </Button>
                  
                  <Button 
                    icon={<MedicineBoxOutlined />} 
                    block
                  >
                    Add Medication Alert
                  </Button>
                  
                  <Button 
                    icon={<SolutionOutlined />} 
                    block
                  >
                    Schedule Follow-up
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default QuitPlanEdit;