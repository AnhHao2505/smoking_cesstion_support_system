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
  getNewestQuitPlan,
  acceptQuitPlan, 
  denyQuitPlan,
  updateQuitPlanByCoach 
} from '../../services/quitPlanService';
import { getAssignedMembers } from '../../services/coachManagementService';
import { getLatestMemberSmokingStatus } from '../../services/memberSmokingStatusService';
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
  const coachId = user?.userId;

  useEffect(() => {
    if (coachId) {
      fetchAssignedMembersPlans();
    } else {
      setLoading(false);
      message.error('Please log in as a coach to access this feature');
    }
  }, [coachId]);

  const fetchAssignedMembersPlans = async () => {
    try {
      setLoading(true);
      
      // Get assigned members
      const membersResponse = await getAssignedMembers(coachId);
      console.log('Assigned members response:', membersResponse);
      
      const assignedMembers = membersResponse || [];
      console.log('Processing', assignedMembers.length, 'assigned members');
      const plansData = [];

      // For each member, get their quit plan and smoking status
      for (const member of assignedMembers) {
        console.log('Processing member:', member);
        if (member.planId) {
          console.log(`Fetching plan ${member.planId} for member ${member.memberId} (${member.name})`);
          try {
            // Get quit plan details
            const planResponse = await getNewestQuitPlan(member.memberId);
            console.log(`Plan response for member ${member.memberId}:`, planResponse);
            
            // Get smoking status
            let statusResponse = null;
            if (member.initialStatusId) {
              console.log(`Fetching smoking status for member ${member.memberId} with initialStatusId ${member.initialStatusId}`);
              statusResponse = await getLatestMemberSmokingStatus(member.memberId);
              console.log(`Smoking status response for member ${member.memberId}:`, statusResponse);
            } else {
              console.log(`Member ${member.memberId} has no initialStatusId - skipping smoking status fetch`);
            }

            if (planResponse) {
              const plan = planResponse;
              const planData = {
                // Map API response fields to component expected fields
                quit_plan_id: plan.id,
                member_id: member.memberId,
                member_name: member.name,
                member_email: member.email,
                start_date: plan.startDate,
                end_date: plan.endDate,
                status: plan.quitPlanStatus,
                created_at: plan.startDate, // Use startDate as fallback for created_at
                
                // Map quit plan content fields
                quit_reason: plan.motivation,
                circumstances: plan.smokingTriggersToAvoid,
                urgency_level: 'medium', // Default since not provided in API
                strategies_to_use: plan.copingStrategies,
                medications_to_use: plan.medicationsToUse,
                medication_instructions: plan.medicationInstructions,
                preparation_steps: plan.relapsePreventionStrategies,
                note: plan.additionalNotes,
                
                // Additional fields from API
                current_smoking_status: plan.currentSmokingStatus,
                support_resources: plan.supportResources,
                reward_plan: plan.rewardPlan,
                coach_id: plan.coachId,
                coach_name: plan.coachName,
                is_newest: plan.isNewest,
                
                initial_status: statusResponse,
                
                // Map status for approval display
                approval_status: plan.quitPlanStatus === 'PENDING_APPROVAL' ? 'pending' 
                               : plan.quitPlanStatus === 'ACTIVE' ? 'approved'
                               : plan.quitPlanStatus === 'DENIED' ? 'denied'
                               : plan.quitPlanStatus === 'COMPLETED' ? 'approved'
                               : 'pending'
              };
              
              console.log('Transformed plan data:', planData);
              plansData.push(planData);
            }
          } catch (error) {
            console.error(`Error fetching plan for member ${member.memberId}:`, error);
          }
        } else {
          console.log(`Member ${member.memberId} (${member.name}) has no planId - skipping`);
        }
      }

      console.log('Final plans data:', plansData);
      console.log(`Loaded ${plansData.length} plans for approval`);
      setPlans(plansData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned members plans:', error);
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

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'pending':
        return 'orange';
      case 'ACTIVE':
      case 'approved':
        return 'green';
      case 'DENIED':
      case 'denied':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'pending':
        return 'Pending Approval';
      case 'ACTIVE':
      case 'approved':
        return 'Approved';
      case 'DENIED':
      case 'denied':
        return 'Denied';
      default:
        return status;
    }
  };

  const submitApproval = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      const approvalData = {
        planId: selectedPlan.quit_plan_id || selectedPlan.id,
        coachId: coachId,
        feedback: values.feedback || '',
        action: actionType
      };

      let response;
      if (actionType === 'approve') {
        response = await acceptQuitPlan(selectedPlan.quit_plan_id || selectedPlan.id, approvalData);
        if (response.success) {
          message.success('Plan approved successfully! Member will be notified.');
          setPlans(plans.map(plan => 
            (plan.quit_plan_id || plan.id) === (selectedPlan.quit_plan_id || selectedPlan.id)
              ? { 
                  ...plan, 
                  status: 'ACTIVE', 
                  approval_status: 'approved',
                  approved_at: moment().toISOString(),
                  coach_feedback: values.feedback
                }
              : plan
          ));
        }
      } else if (actionType === 'deny') {
        response = await denyQuitPlan(selectedPlan.quit_plan_id || selectedPlan.id, approvalData);
        if (response.success) {
          message.success('Plan denied. Member will be notified.');
          setPlans(plans.map(plan => 
            (plan.quit_plan_id || plan.id) === (selectedPlan.quit_plan_id || selectedPlan.id)
              ? { 
                  ...plan, 
                  status: 'DENIED', 
                  approval_status: 'denied',
                  denied_at: moment().toISOString(),
                  coach_feedback: values.feedback
                }
              : plan
          ));
        }
      }

      if (!response.success) {
        message.error(response.message || `Failed to ${actionType} plan`);
      }

      setApprovalModalVisible(false);
    } catch (error) {
      console.error(`Error ${actionType} plan:`, error);
      message.error(`Failed to ${actionType} plan`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM DD, YYYY');
  };

  const formatDateTime = (dateString) => {
    return moment(dateString).format('MMM DD, YYYY [at] HH:mm');
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
            {record.initial_status?.dailySmoking || 'N/A'}/day
          </Tag>
        </div>
      )
    },
    {
      title: 'Addiction Level',
      key: 'addiction_level',
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <Tag color={
            record.initial_status?.addiction === 'SEVERE' ? 'red' :
            record.initial_status?.addiction === 'MODERATE' ? 'orange' : 
            record.initial_status?.addiction === 'MILD' ? 'yellow' :
            record.initial_status?.addiction === 'NONE' ? 'green' : 'default'
          } size="small">
            {record.initial_status?.addiction || 'Unknown'}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.initial_status?.previousAttempts || 0} prev attempts
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
            rowKey={(record) => record.quit_plan_id || record.id}
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
                      {selectedPlan.initial_status?.reasonToQuit && (
                        <Descriptions.Item label="Reason to Quit">
                          {selectedPlan.initial_status.reasonToQuit}
                        </Descriptions.Item>
                      )}
                      {selectedPlan.initial_status?.goal && (
                        <Descriptions.Item label="Goal">
                          {selectedPlan.initial_status.goal}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>
                  <Col xs={24} md={12}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Cigarettes per Day">
                        <Text strong>{selectedPlan.initial_status?.dailySmoking || 'N/A'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Addiction Level">
                        <Tag color={
                          selectedPlan.initial_status?.addiction === 'SEVERE' ? 'red' :
                          selectedPlan.initial_status?.addiction === 'MODERATE' ? 'orange' :
                          selectedPlan.initial_status?.addiction === 'MILD' ? 'yellow' :
                          selectedPlan.initial_status?.addiction === 'NONE' ? 'green' : 'default'
                        }>
                          {selectedPlan.initial_status?.addiction || 'Unknown'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Previous Attempts">
                        {selectedPlan.initial_status?.previousAttempts || 0}
                      </Descriptions.Item>
                      {selectedPlan.initial_status?.yearsSmoking > 0 && (
                        <Descriptions.Item label="Years Smoking">
                          {selectedPlan.initial_status.yearsSmoking} years
                        </Descriptions.Item>
                      )}
                      {selectedPlan.initial_status?.startSmokingAge > 0 && (
                        <Descriptions.Item label="Started Smoking Age">
                          {selectedPlan.initial_status.startSmokingAge} years old
                        </Descriptions.Item>
                      )}
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
                    <Text strong>Main Triggers to Avoid:</Text>
                    <br />
                    <Tag color="red">{selectedPlan.circumstances || selectedPlan.smokingTriggersToAvoid}</Tag>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Current Status:</Text>
                    <br />
                    <Tag color="green">
                      {selectedPlan.current_smoking_status || 'Unknown'}
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
                  <Card title={<><BulbOutlined /> Coping Strategies</>} size="small">
                    <Paragraph>{selectedPlan.strategies_to_use || selectedPlan.copingStrategies || 'No strategies specified'}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title={<><MedicineBoxOutlined /> Medications</>} size="small">
                    <Paragraph>
                      {selectedPlan.medications_to_use || selectedPlan.medicationsToUse || 'No medications specified'}
                    </Paragraph>
                    {(selectedPlan.medication_instructions || selectedPlan.medicationInstructions) && (
                      <div>
                        <Text strong>Instructions:</Text>
                        <br />
                        <Text>{selectedPlan.medication_instructions || selectedPlan.medicationInstructions}</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Support & Rewards */}
              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} md={12}>
                  <Card title="Support Resources" size="small">
                    <Paragraph>{selectedPlan.support_resources || selectedPlan.supportResources || 'No support resources specified'}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Reward Plan" size="small">
                    <Paragraph>{selectedPlan.reward_plan || selectedPlan.rewardPlan || 'No reward plan specified'}</Paragraph>
                  </Card>
                </Col>
              </Row>

              {/* Preparation Steps */}
              {(selectedPlan.preparation_steps || selectedPlan.relapsePreventionStrategies) && (
                <Card title="Relapse Prevention Strategies" size="small" className="mb-3">
                  <Paragraph>{selectedPlan.preparation_steps || selectedPlan.relapsePreventionStrategies}</Paragraph>
                </Card>
              )}

              {/* Coach Notes */}
              {(selectedPlan.note || selectedPlan.additionalNotes) && (
                <Card title="Additional Notes" size="small" className="mb-3">
                  <Paragraph>{selectedPlan.note || selectedPlan.additionalNotes}</Paragraph>
                </Card>
              )}

              {/* Coach Assignment */}
              {selectedPlan.coach_name && (
                <Card title="Assigned Coach" size="small" className="mb-3">
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Coach Name">
                      <Text strong>{selectedPlan.coach_name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Coach ID">
                      {selectedPlan.coach_id}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* Submission Information */}
              <Card title="Submission Information" size="small">
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Created">
                    {moment(selectedPlan.created_at).format('MMMM DD, YYYY [at] HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedPlan.approval_status)}>
                      {getStatusText(selectedPlan.approval_status)}
                    </Tag>
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