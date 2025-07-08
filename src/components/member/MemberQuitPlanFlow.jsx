import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Row,
  Col,
  Avatar,
  Descriptions,
  Steps,
  message,
  Alert,
  Progress,
  Timeline,
  Statistic,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  FireOutlined,
  TrophyOutlined,
  MessageOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getNewestQuitPlan,
  acceptQuitPlan, 
  denyQuitPlan,
  getOldPlansOfMember
} from '../../services/quitPlanService';
import { getPhasesOfPlan } from '../../services/phaseService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MemberQuitPlanFlow = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planPhases, setPlanPhases] = useState([]);
  const [planHistory, setPlanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(''); // 'accept' or 'deny'
  const [submitting, setSubmitting] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const user = getCurrentUser();
  const memberId = user?.userId;

  useEffect(() => {
    if (memberId) {
      fetchMemberQuitPlanData();
    } else {
      setLoading(false);
      message.error('Please log in as a member to access this feature');
    }
  }, [memberId]);

  const fetchMemberQuitPlanData = async () => {
    try {
      setLoading(true);
      
      // Fetch current plan
      const currentPlanResponse = await getNewestQuitPlan(memberId);
      if (currentPlanResponse.success && currentPlanResponse.data) {
        setCurrentPlan(currentPlanResponse.data);
        
        // Fetch plan phases
        const phasesResponse = await getPhasesOfPlan(currentPlanResponse.data.quit_plan_id);
        if (phasesResponse.success) {
          setPlanPhases(phasesResponse.data);
        }
      } else {
        setCurrentPlan(null);
        setPlanPhases([]);
      }

      // Fetch plan history
      const historyResponse = await getOldPlansOfMember(memberId, 0, 5);
      if (historyResponse.success) {
        setPlanHistory(historyResponse.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching member quit plan data:', error);
      message.error('Failed to load quit plan data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanAction = (action) => {
    setActionType(action);
    setActionModalVisible(true);
  };

  const submitPlanAction = async () => {
    try {
      setSubmitting(true);
      const planId = currentPlan.quit_plan_id;

      let response;
      if (actionType === 'accept') {
        response = await acceptQuitPlan(planId);
        if (response.success) {
          message.success('Plan accepted! Your quit journey begins now. Good luck!');
          setCurrentPlan({ ...currentPlan, status: 'ACTIVE' });
        }
      } else if (actionType === 'deny') {
        response = await denyQuitPlan(planId);
        if (response.success) {
          message.success('Plan denied. Your coach will be notified to create a new plan.');
          setCurrentPlan({ ...currentPlan, status: 'DENIED' });
        }
      }

      if (!response.success) {
        message.error(response.message || `Failed to ${actionType} plan`);
      }

      setActionModalVisible(false);
    } catch (error) {
      console.error(`Error ${actionType} plan:`, error);
      message.error(`Failed to ${actionType} plan`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'PENDING_APPROVAL': return 'orange';
      case 'DENIED': return 'red';
      case 'COMPLETED': return 'blue';
      case 'CANCELLED': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'Active';
      case 'PENDING_APPROVAL': return 'Waiting for Your Decision';
      case 'DENIED': return 'Denied';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const getCurrentPhaseIndex = () => {
    if (!planPhases.length || !currentPlan?.current_phase) return 0;
    return planPhases.findIndex(phase => 
      phase.phase_name === currentPlan.current_phase.phase_name
    );
  };

  const calculateProgress = () => {
    if (!currentPlan) return 0;
    const startDate = moment(currentPlan.start_date);
    const endDate = moment(currentPlan.end_date);
    const today = moment();
    
    const totalDays = endDate.diff(startDate, 'days');
    const passedDays = today.diff(startDate, 'days');
    
    return Math.max(0, Math.min(100, (passedDays / totalDays) * 100));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="member-quit-plan-flow">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <HeartOutlined /> My Quit Journey
          </Title>
          <Space>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => setHistoryModalVisible(true)}
            >
              Plan History
            </Button>
          </Space>
        </div>

        {!currentPlan ? (
          // No current plan
          <Card>
            <div className="text-center py-5">
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />
              <Title level={3}>No Active Quit Plan</Title>
              <Paragraph>
                You don't have an active quit plan yet. Your assigned coach will create a personalized plan for you soon.
              </Paragraph>
              <Button type="primary" size="large">
                Contact Your Coach
              </Button>
            </div>
          </Card>
        ) : (
          // Current plan exists
          <Row gutter={[16, 16]}>
            {/* Plan Status Card */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    Current Quit Plan
                    <Tag color={getStatusColor(currentPlan.status)}>
                      {getStatusText(currentPlan.status)}
                    </Tag>
                  </Space>
                }
                extra={
                  currentPlan.status === 'PENDING_APPROVAL' && (
                    <Space>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handlePlanAction('deny')}
                      >
                        Decline
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handlePlanAction('accept')}
                      >
                        Accept Plan
                      </Button>
                    </Space>
                  )
                }
              >
                {currentPlan.status === 'PENDING_APPROVAL' && (
                  <Alert
                    message="Plan Pending Your Approval"
                    description="Your coach has created a personalized quit plan for you. Please review the details below and decide whether to accept or request changes."
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Start Date">
                        {formatDate(currentPlan.start_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Target End Date">
                        {formatDate(currentPlan.end_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Duration">
                        {moment(currentPlan.end_date).diff(moment(currentPlan.start_date), 'days')} days
                      </Descriptions.Item>
                      <Descriptions.Item label="Coach">
                        <Space>
                          <Avatar src={currentPlan.coach_photo} icon={<UserOutlined />} />
                          {currentPlan.coach_name}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col xs={24} md={12}>
                    {currentPlan.status === 'ACTIVE' && (
                      <div>
                        <Title level={4}>Progress</Title>
                        <Progress
                          type="circle"
                          percent={Math.round(calculateProgress())}
                          strokeColor="#52c41a"
                          width={120}
                        />
                        <div className="mt-3">
                          <Statistic
                            title="Days Completed"
                            value={Math.max(0, moment().diff(moment(currentPlan.start_date), 'days'))}
                            suffix={`/ ${moment(currentPlan.end_date).diff(moment(currentPlan.start_date), 'days')}`}
                          />
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Plan Details */}
            <Col xs={24} lg={16}>
              <Card title="Plan Details">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Strategies">
                    {currentPlan.strategies_to_use}
                  </Descriptions.Item>
                  <Descriptions.Item label="Medications">
                    {currentPlan.medications_to_use || 'None prescribed'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Preparation Steps">
                    {currentPlan.preparation_steps}
                  </Descriptions.Item>
                  {currentPlan.medication_instructions && (
                    <Descriptions.Item label="Medication Instructions">
                      {currentPlan.medication_instructions}
                    </Descriptions.Item>
                  )}
                  {currentPlan.note && (
                    <Descriptions.Item label="Coach Notes">
                      {currentPlan.note}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {planPhases.length > 0 && (
                  <>
                    <Divider />
                    <Title level={4}>Phase Progress</Title>
                    <Steps
                      current={getCurrentPhaseIndex()}
                      direction="vertical"
                      size="small"
                    >
                      {planPhases.map((phase, index) => (
                        <Step
                          key={phase.quit_phase_id}
                          title={phase.phase_name}
                          description={phase.objective}
                          status={
                            phase.is_completed
                              ? 'finish'
                              : index === getCurrentPhaseIndex()
                              ? 'process'
                              : 'wait'
                          }
                        />
                      ))}
                    </Steps>
                  </>
                )}
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={8}>
              <Card title="Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<CheckCircleOutlined />}>
                    Daily Check-in
                  </Button>
                  <Button block icon={<MessageOutlined />}>
                    Message Coach
                  </Button>
                  <Button block icon={<MedicineBoxOutlined />}>
                    Medication Reminder
                  </Button>
                  <Button block icon={<TrophyOutlined />}>
                    View Progress
                  </Button>
                  <Button block icon={<CalendarOutlined />}>
                    Schedule Appointment
                  </Button>
                </Space>
              </Card>

              {currentPlan.status === 'ACTIVE' && (
                <Card title="Motivation" className="mt-4">
                  <div className="text-center">
                    <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                    <Title level={4}>Keep Going!</Title>
                    <Paragraph>
                      Every smoke-free day is a victory. You're doing great!
                    </Paragraph>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        )}

        {/* Action Modal */}
        <Modal
          title={
            <Space>
              {actionType === 'accept' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              {actionType === 'accept' ? 'Accept Quit Plan' : 'Decline Quit Plan'}
            </Space>
          }
          open={actionModalVisible}
          onCancel={() => setActionModalVisible(false)}
          onOk={submitPlanAction}
          confirmLoading={submitting}
          okText={actionType === 'accept' ? 'Accept Plan' : 'Decline Plan'}
          okButtonProps={{
            type: actionType === 'accept' ? 'primary' : 'danger'
          }}
        >
          <Alert
            message={
              actionType === 'accept'
                ? 'Confirm Plan Acceptance'
                : 'Confirm Plan Decline'
            }
            description={
              actionType === 'accept'
                ? 'By accepting this plan, you commit to following the strategies and timeline set by your coach. Are you ready to start your quit journey?'
                : 'Declining this plan will notify your coach to create a new plan for you. This may delay the start of your quit journey.'
            }
            type={actionType === 'accept' ? 'success' : 'warning'}
            showIcon
          />
        </Modal>

        {/* History Modal */}
        <Modal
          title="Quit Plan History"
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setHistoryModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          <Timeline>
            {planHistory.map((plan, index) => (
              <Timeline.Item
                key={plan.quit_plan_id}
                color={getStatusColor(plan.status)}
                dot={
                  plan.status === 'COMPLETED' ? <CheckCircleOutlined /> :
                  plan.status === 'DENIED' ? <CloseCircleOutlined /> :
                  <ClockCircleOutlined />
                }
              >
                <div>
                  <Text strong>
                    Plan #{plan.quit_plan_id} - {formatDate(plan.start_date)}
                  </Text>
                  <br />
                  <Tag color={getStatusColor(plan.status)}>
                    {getStatusText(plan.status)}
                  </Tag>
                  <br />
                  <Text type="secondary">
                    Duration: {moment(plan.end_date).diff(moment(plan.start_date), 'days')} days
                  </Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
          
          {planHistory.length === 0 && (
            <div className="text-center py-4">
              <Text type="secondary">No previous plans found</Text>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MemberQuitPlanFlow;
