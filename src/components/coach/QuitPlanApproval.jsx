import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Descriptions,
  Steps,
  message,
  Badge,
  Alert,
  Tooltip,
  Statistic,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EditOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BulbOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getAllPlanCreatedByCoach, 
  acceptQuitPlan, 
  denyQuitPlan,
  updateQuitPlanByCoach 
} from '../../services/quitPlanService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const QuitPlanApproval = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'deny'
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const user = getCurrentUser();
  const coachId = user?.userId || 1;

  useEffect(() => {
    fetchPendingPlans();
  }, []);

  const fetchPendingPlans = async () => {
    try {
      setLoading(true);
      // In real app, use: const response = await getAllPlanCreatedByCoach(coachId);
      // Mock data for demonstration
      const mockPlans = [
        {
          quit_plan_id: 101,
          member_id: 201,
          member_name: "Nguyễn Văn A",
          member_email: "nguyenvana@email.com",
          member_phone: "0901234567",
          start_date: "2025-01-15",
          end_date: "2025-04-15",
          created_at: "2025-01-10T08:30:00",
          status: "Pending Approval",
          approval_status: "pending",
          circumstances: "Work stress",
          strategies_requested: "Nicotine replacement therapy, Exercise, Meditation",
          medications_requested: "Nicotine patches, Lozenges",
          preparation_steps: "Remove all cigarettes from home and office, inform family and friends, stock healthy snacks",
          quit_reason: "Health concerns and family pressure",
          previous_attempts: 2,
          cigarettes_per_day: 15,
          urgency_level: "high",
          smoking_duration: "10 years",
          triggers: ["Work stress", "After meals", "Social events"],
          support_system: "Family and close friends",
          health_conditions: "High blood pressure",
          motivations: ["Better health", "Save money", "Family"]
        },
        {
          quit_plan_id: 102,
          member_id: 202,
          member_name: "Trần Thị B",
          member_email: "tranthib@email.com",
          member_phone: "0907654321",
          start_date: "2025-01-20",
          end_date: "2025-05-20",
          created_at: "2025-01-12T14:20:00",
          status: "Pending Approval",
          approval_status: "pending",
          circumstances: "Social activities",
          strategies_requested: "Cold turkey, Support groups",
          medications_requested: "None",
          preparation_steps: "Avoid social drinking, find new hobbies, join online support groups",
          quit_reason: "Want to set good example for children",
          previous_attempts: 1,
          cigarettes_per_day: 10,
          urgency_level: "medium",
          smoking_duration: "5 years",
          triggers: ["Social drinking", "Stress"],
          support_system: "Spouse and children",
          health_conditions: "None",
          motivations: ["Children's health", "Personal example"]
        },
        {
          quit_plan_id: 103,
          member_id: 203,
          member_name: "Lê Văn C",
          member_email: "levanc@email.com",
          member_phone: "0912345678",
          start_date: "2025-01-25",
          end_date: "2025-04-25",
          created_at: "2025-01-14T10:15:00",
          status: "Approved",
          approval_status: "approved",
          approved_at: "2025-01-15T09:00:00",
          circumstances: "After meals",
          strategies_requested: "Gradual reduction, Behavioral therapy",
          medications_requested: "Varenicline",
          preparation_steps: "Change eating habits, practice mindful eating",
          quit_reason: "Doctor's recommendation due to health issues",
          previous_attempts: 0,
          cigarettes_per_day: 20,
          urgency_level: "high",
          smoking_duration: "15 years",
          triggers: ["After meals", "Coffee breaks"],
          support_system: "Family doctor and wife",
          health_conditions: "COPD early stage",
          motivations: ["Health recovery", "Doctor's advice"]
        }
      ];

      setPlans(mockPlans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending plans:', error);
      message.error('Failed to load plans');
      setLoading(false);
    }
  };

  const handleViewDetail = (plan) => {
    setSelectedPlan(plan);
    setDetailModalVisible(true);
  };

  const handleApprovalAction = (plan, action) => {
    setSelectedPlan(plan);
    setActionType(action);
    form.resetFields();
    setApprovalModalVisible(true);
  };

  const submitApproval = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      const approvalData = {
        planId: selectedPlan.quit_plan_id,
        coachId: coachId,
        feedback: values.feedback || '',
        action: actionType
      };

      let response;
      if (actionType === 'approve') {
        response = await acceptQuitPlan(selectedPlan.quit_plan_id, approvalData);
        if (response.success) {
          message.success('Plan approved successfully! Member will be notified.');
          setPlans(plans.map(plan => 
            plan.quit_plan_id === selectedPlan.quit_plan_id 
              ? { 
                  ...plan, 
                  status: 'Approved', 
                  approval_status: 'approved',
                  approved_at: moment().toISOString(),
                  coach_feedback: values.feedback
                }
              : plan
          ));
        } else {
          message.error(response.message || 'Failed to approve plan');
        }
      } else {
        response = await denyQuitPlan(selectedPlan.quit_plan_id, approvalData);
        if (response.success) {
          message.success('Plan denied. Member will be notified to revise their plan.');
          setPlans(plans.map(plan => 
            plan.quit_plan_id === selectedPlan.quit_plan_id 
              ? { 
                  ...plan, 
                  status: 'Needs Revision', 
                  approval_status: 'denied',
                  denied_at: moment().toISOString(),
                  denial_reason: values.feedback
                }
              : plan
          ));
        } else {
          message.error(response.message || 'Failed to deny plan');
        }
      }
      
      setApprovalModalVisible(false);
      setSelectedPlan(null);
      setSubmitting(false);
    } catch (error) {
      console.error('Error processing approval:', error);
      message.error('Failed to process approval');
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Approval': return 'orange';
      case 'Approved': return 'green';
      case 'Denied': 
      case 'Needs Revision': return 'red';
      case 'In Progress': return 'blue';
      case 'Completed': return 'purple';
      default: return 'default';
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const formatDateTime = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getDuration = (startDate, endDate) => {
    return moment(endDate).diff(moment(startDate), 'days');
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.member_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.member_email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Plan Details',
      key: 'details',
      width: 220,
      render: (_, record) => (
        <div>
          <Text strong>Start: {formatDate(record.start_date)}</Text>
          <br />
          <Text type="secondary">End: {formatDate(record.end_date)}</Text>
          <br />
          <Tag color="blue" size="small">
            {getDuration(record.start_date, record.end_date)} days
          </Tag>
          <Tag color="cyan" size="small">
            {record.cigarettes_per_day}/day
          </Tag>
        </div>
      )
    },
    {
      title: 'Priority',
      key: 'priority',
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <Tag color={getUrgencyColor(record.urgency_level)} size="small">
            {record.urgency_level.toUpperCase()}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.previous_attempts} prev attempts
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: '11px' }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => (
        <Tooltip title={formatDateTime(date)}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).fromNow()}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
          {record.approval_status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprovalAction(record, 'approve')}
              >
                Approve
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleApprovalAction(record, 'deny')}
              >
                Deny
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const pendingCount = plans.filter(p => p.approval_status === 'pending').length;
  const approvedCount = plans.filter(p => p.approval_status === 'approved').length;
  const deniedCount = plans.filter(p => p.approval_status === 'denied').length;
  const totalPlans = plans.length;

  return (
    <div className="quit-plan-approval">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <FileTextOutlined /> Plan Approval Queue
          </Title>
          <Badge count={pendingCount} offset={[10, 0]}>
            <Button icon={<ClockCircleOutlined />} type="dashed">
              {pendingCount} Pending Approvals
            </Button>
          </Badge>
        </div>

        {/* Summary Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Pending"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Approved"
                value={approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Denied"
                value={deniedCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Plans"
                value={totalPlans}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {pendingCount > 0 && (
          <Alert
            message="Pending Approvals Required"
            description={`You have ${pendingCount} quit plan${pendingCount > 1 ? 's' : ''} waiting for your review and approval. Please review them to help members start their quit journey.`}
            type="warning"
            showIcon
            className="mb-4"
            action={
              <Button size="small" type="primary">
                Review Now
              </Button>
            }
          />
        )}

        {/* Plans Table */}
        <Card>
          <Table
            dataSource={plans}
            columns={columns}
            rowKey="quit_plan_id"
            loading={loading}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} plans`
            }}
            scroll={{ x: 1000 }}
            size="small"
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <UserOutlined />
              {selectedPlan && `${selectedPlan.member_name}'s Quit Plan`}
              {selectedPlan && (
                <Tag color={getStatusColor(selectedPlan.status)} style={{ marginLeft: 8 }}>
                  {selectedPlan.status}
                </Tag>
              )}
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>,
            selectedPlan?.approval_status === 'pending' && (
              <Space key="actions">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleApprovalAction(selectedPlan, 'deny');
                  }}
                >
                  Deny Plan
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleApprovalAction(selectedPlan, 'approve');
                  }}
                >
                  Approve Plan
                </Button>
              </Space>
            )
          ]}
          width={900}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {selectedPlan && (
            <div>
              {/* Member Information */}
              <Card title="Member Information" size="small" className="mb-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Name">
                        <Text strong>{selectedPlan.member_name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedPlan.member_email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {selectedPlan.member_phone || 'Not provided'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col xs={24} md={12}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Cigarettes per Day">
                        <Text strong>{selectedPlan.cigarettes_per_day}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Smoking Duration">
                        {selectedPlan.smoking_duration}
                      </Descriptions.Item>
                      <Descriptions.Item label="Previous Attempts">
                        {selectedPlan.previous_attempts}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>

              {/* Plan Details */}
              <Card title={<><CalendarOutlined /> Plan Timeline</>} size="small" className="mb-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Text strong>Start Date:</Text>
                    <br />
                    <Text>{formatDate(selectedPlan.start_date)}</Text>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong>End Date:</Text>
                    <br />
                    <Text>{formatDate(selectedPlan.end_date)}</Text>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong>Duration:</Text>
                    <br />
                    <Text>{getDuration(selectedPlan.start_date, selectedPlan.end_date)} days</Text>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Text strong>Main Trigger:</Text>
                    <br />
                    <Tag color="blue">{selectedPlan.circumstances}</Tag>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Urgency Level:</Text>
                    <br />
                    <Tag color={getUrgencyColor(selectedPlan.urgency_level)}>
                      {selectedPlan.urgency_level.toUpperCase()}
                    </Tag>
                  </Col>
                </Row>
              </Card>

              {/* Quit Reason & Motivation */}
              <Card title="Motivation & Goals" size="small" className="mb-3">
                <Paragraph>
                  <Text strong>Reason for Quitting:</Text>
                  <br />
                  {selectedPlan.quit_reason}
                </Paragraph>
                {selectedPlan.motivations && (
                  <div>
                    <Text strong>Key Motivations:</Text>
                    <br />
                    <Space wrap>
                      {selectedPlan.motivations.map((motivation, index) => (
                        <Tag key={index} color="green">{motivation}</Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </Card>

              {/* Strategies & Support */}
              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} md={12}>
                  <Card title={<><BulbOutlined /> Requested Strategies</>} size="small">
                    <Paragraph>{selectedPlan.strategies_requested}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title={<><MedicineBoxOutlined /> Medications</>} size="small">
                    <Paragraph>
                      {selectedPlan.medications_requested || 'No medications requested'}
                    </Paragraph>
                  </Card>
                </Col>
              </Row>

              {/* Preparation Steps */}
              <Card title="Preparation Steps" size="small" className="mb-3">
                <Paragraph>{selectedPlan.preparation_steps}</Paragraph>
              </Card>

              {/* Additional Information */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Triggers" size="small">
                    {selectedPlan.triggers ? (
                      <Space wrap>
                        {selectedPlan.triggers.map((trigger, index) => (
                          <Tag key={index} color="orange">{trigger}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No specific triggers identified</Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Support System" size="small">
                    <Text>{selectedPlan.support_system || 'Not specified'}</Text>
                    {selectedPlan.health_conditions && selectedPlan.health_conditions !== 'None' && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Health Conditions:</Text>
                        <br />
                        <Tag color="red">{selectedPlan.health_conditions}</Tag>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Submission Info */}
              <Card title="Submission Details" size="small" style={{ marginTop: 16 }}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Submitted">
                    {formatDateTime(selectedPlan.created_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Time Pending">
                    {moment(selectedPlan.created_at).fromNow()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </Modal>

        {/* Approval/Denial Modal */}
        <Modal
          title={
            <Space>
              {actionType === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              {actionType === 'approve' ? 'Approve Quit Plan' : 'Deny Quit Plan'}
            </Space>
          }
          open={approvalModalVisible}
          onCancel={() => setApprovalModalVisible(false)}
          onOk={submitApproval}
          confirmLoading={submitting}
          okText={actionType === 'approve' ? 'Approve Plan' : 'Deny Plan'}
          okButtonProps={{ 
            type: actionType === 'approve' ? 'primary' : 'danger',
            icon: actionType === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Alert
              message={
                actionType === 'approve' 
                  ? 'Confirm Plan Approval'
                  : 'Plan Denial Requires Feedback'
              }
              description={
                actionType === 'approve' 
                  ? 'Approving this plan will allow the member to start their quit journey. The member will receive a notification and can begin following their personalized plan.'
                  : 'Please provide detailed feedback explaining why this plan needs to be revised. This will help the member create a better plan.'
              }
              type={actionType === 'approve' ? 'info' : 'warning'}
              showIcon
              className="mb-3"
            />

            {selectedPlan && (
              <Card size="small" className="mb-3">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{selectedPlan.member_name}</Text>
                    <br />
                    <Text type="secondary">
                      {getDuration(selectedPlan.start_date, selectedPlan.end_date)} day plan • 
                      {selectedPlan.cigarettes_per_day} cigarettes/day
                    </Text>
                  </div>
                </Space>
              </Card>
            )}

            <Form.Item
              name="feedback"
              label={
                actionType === 'approve' 
                  ? 'Approval Message & Guidance (Optional)' 
                  : 'Detailed Feedback for Revision (Required)'
              }
              rules={
                actionType === 'deny' 
                  ? [
                      { required: true, message: 'Please provide feedback for denial' },
                      { min: 20, message: 'Please provide detailed feedback (at least 20 characters)' }
                    ]
                  : []
              }
            >
              <TextArea
                rows={5}
                placeholder={
                  actionType === 'approve'
                    ? 'Add any additional guidance, encouragement, or specific recommendations for this member...'
                    : 'Explain specifically what needs to be improved in this plan. Be constructive and provide clear guidance for revision...'
                }
                showCount
                maxLength={500}
              />
            </Form.Item>

            {actionType === 'approve' && (
              <Alert
                message="Next Steps"
                description="After approval, the member will be able to start their quit plan immediately. They will receive notifications for daily check-ins and progress tracking."
                type="success"
                showIcon
              />
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default QuitPlanApproval;