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
  message,
  Badge,
  Alert,
  Tooltip,
  Statistic,
  Divider,
  Steps,
  DatePicker,
  Select
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
  updateQuitPlanByCoach,
  createQuitPlan,
  finishQuitPlan
} from '../../services/quitPlanService';
import { getAssignedMembers } from '../../services/coachManagementService';
import { getLatestMemberSmokingStatus } from '../../services/memberSmokingStatusService';
import { getDefaultPhases, createGoalsOfPhases } from '../../services/phaseService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Option } = Select;

const QuitPlanApprovalNewFlow = () => {
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPlan, setMemberPlan] = useState(null);
  const [memberStatus, setMemberStatus] = useState(null);
  const [createPlanModalVisible, setCreatePlanModalVisible] = useState(false);
  const [viewPlanModalVisible, setViewPlanModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(''); // 'accept', 'deny', 'finish', 'disable'
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  const user = getCurrentUser();
  const coachId = user?.userId;

  useEffect(() => {
    if (coachId) {
      fetchAssignedMembers();
    } else {
      setLoading(false);
      message.error('Please log in as a coach to access this feature');
    }
  }, [coachId]);

  const fetchAssignedMembers = async () => {
    try {
      setLoading(true);
      const response = await getAssignedMembers(coachId);
      if (response.success) {
        setAssignedMembers(response.data.members || []);
      } else {
        message.error('Failed to load assigned members');
      }
    } catch (error) {
      console.error('Error fetching assigned members:', error);
      message.error('Failed to load assigned members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPlan = async (memberId) => {
    try {
      const planResponse = await getNewestQuitPlan(memberId);
      const statusResponse = await getLatestMemberSmokingStatus(memberId);
      
      if (planResponse.success) {
        setMemberPlan(planResponse.data);
      } else {
        setMemberPlan(null);
      }
      
      if (statusResponse.success) {
        setMemberStatus(statusResponse.data);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      message.error('Failed to load member plan data');
    }
  };

  const handleViewMember = async (member) => {
    setSelectedMember(member);
    await fetchMemberPlan(member.memberId);
    
    if (memberPlan) {
      setViewPlanModalVisible(true);
    } else {
      setCreatePlanModalVisible(true);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const values = await createForm.validateFields();
      setSubmitting(true);

      // Get default phases based on addiction level
      const defaultPhasesResponse = await getDefaultPhases(memberStatus?.addictionLevel || 'MEDIUM');
      
      if (!defaultPhasesResponse.success) {
        message.error('Failed to get default phases');
        return;
      }

      const planData = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
        strategies_to_use: values.strategies_to_use.join(', '),
        medications_to_use: values.medications_to_use?.join(', ') || '',
        status: 'PENDING_APPROVAL'
      };

      // Create the quit plan
      const createResponse = await createQuitPlan(selectedMember.memberId, planData);
      
      if (createResponse.success) {
        // Create goals for phases
        const phasesWithGoals = defaultPhasesResponse.data.map((phase, index) => ({
          ...phase,
          goals: values.phase_goals?.[index] || phase.defaultGoal || 'Complete this phase successfully'
        }));

        await createGoalsOfPhases(createResponse.data.planId, phasesWithGoals);
        
        message.success('Quit plan created successfully! Member will be notified.');
        setCreatePlanModalVisible(false);
        fetchAssignedMembers();
      } else {
        message.error(createResponse.message || 'Failed to create quit plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      message.error('Failed to create quit plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanAction = (action) => {
    setActionType(action);
    form.resetFields();
    setActionModalVisible(true);
  };

  const submitPlanAction = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let response;
      const planId = memberPlan.quit_plan_id;

      switch (actionType) {
        case 'accept':
          response = await acceptQuitPlan(planId);
          if (response.success) {
            message.success('Plan approved! Member can now start their quit journey.');
            setMemberPlan({ ...memberPlan, status: 'ACTIVE' });
          }
          break;
          
        case 'deny':
          response = await denyQuitPlan(planId);
          if (response.success) {
            message.success('Plan denied. Member will be notified to create a new plan.');
            setMemberPlan({ ...memberPlan, status: 'DENIED' });
          }
          break;
          
        case 'finish':
          response = await finishQuitPlan(planId, values.note);
          if (response.success) {
            message.success('Plan marked as completed!');
            setMemberPlan({ ...memberPlan, status: 'COMPLETED' });
          }
          break;
          
        case 'update':
          const updateData = {
            ...values,
            end_date: values.end_date?.format('YYYY-MM-DD'),
            strategies_to_use: values.strategies_to_use?.join(', '),
            medications_to_use: values.medications_to_use?.join(', ')
          };
          response = await updateQuitPlanByCoach(planId, updateData);
          if (response.success) {
            message.success('Plan updated successfully!');
            await fetchMemberPlan(selectedMember.memberId);
          }
          break;
          
        default:
          throw new Error('Unknown action type');
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
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'DENIED': return 'Denied';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.memberName}</Text>
            <br />
            <Text type="secondary">{record.memberEmail}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Current Plan Status',
      key: 'planStatus',
      render: (_, record) => (
        <div>
          {record.latestPlanId ? (
            <Tag color={getStatusColor(record.planStatus)}>
              {getStatusText(record.planStatus)}
            </Tag>
          ) : (
            <Tag color="default">No Plan</Tag>
          )}
          <br />
          {record.latestPlanId && (
            <Text type="secondary">Plan ID: {record.latestPlanId}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Initial Status',
      key: 'initialStatus',
      render: (_, record) => (
        <div>
          {record.latestInitialStatusId ? (
            <Tag color="blue">Completed</Tag>
          ) : (
            <Tag color="orange">Pending</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewMember(record)}
        >
          {record.latestPlanId ? 'View Plan' : 'Create Plan'}
        </Button>
      )
    }
  ];

  return (
    <div className="quit-plan-approval-new-flow">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <FileTextOutlined /> Assigned Members & Plans
          </Title>
          <Badge count={assignedMembers.filter(m => !m.latestPlanId).length} offset={[10, 0]}>
            <Button icon={<ExclamationCircleOutlined />} type="dashed">
              Need Plans Created
            </Button>
          </Badge>
        </div>

        {/* Summary Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Members"
                value={assignedMembers.length}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Active Plans"
                value={assignedMembers.filter(m => m.planStatus === 'ACTIVE').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Pending Plans"
                value={assignedMembers.filter(m => m.planStatus === 'PENDING_APPROVAL').length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="No Plans"
                value={assignedMembers.filter(m => !m.latestPlanId).length}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Members Table */}
        <Card>
          <Table
            dataSource={assignedMembers}
            columns={columns}
            rowKey="memberId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} members`
            }}
          />
        </Card>

        {/* Create Plan Modal */}
        <Modal
          title={
            <Space>
              <FileTextOutlined />
              Create Quit Plan for {selectedMember?.memberName}
            </Space>
          }
          open={createPlanModalVisible}
          onCancel={() => setCreatePlanModalVisible(false)}
          onOk={handleCreatePlan}
          confirmLoading={submitting}
          width={800}
          okText="Create Plan"
        >
          <Form form={createForm} layout="vertical">
            <Alert
              message="Member Initial Status"
              description={memberStatus ? 
                `Addiction Level: ${memberStatus.addictionLevel}, Daily Cigarettes: ${memberStatus.dailyCigarettes}, Duration: ${memberStatus.smokingDuration}` :
                'Loading member status...'
              }
              type="info"
              showIcon
              className="mb-3"
            />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[{ required: true, message: 'Please select start date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="end_date"
                  label="Target End Date"
                  rules={[{ required: true, message: 'Please select end date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="strategies_to_use"
              label="Recommended Strategies"
              rules={[{ required: true, message: 'Please select strategies' }]}
            >
              <Select mode="multiple" placeholder="Select strategies">
                <Option value="Nicotine Replacement Therapy">Nicotine Replacement Therapy</Option>
                <Option value="Behavioral Therapy">Behavioral Therapy</Option>
                <Option value="Exercise Program">Exercise Program</Option>
                <Option value="Meditation">Meditation</Option>
                <Option value="Support Groups">Support Groups</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="medications_to_use"
              label="Recommended Medications (Optional)"
            >
              <Select mode="multiple" placeholder="Select medications if needed">
                <Option value="Nicotine Patches">Nicotine Patches</Option>
                <Option value="Nicotine Gum">Nicotine Gum</Option>
                <Option value="Varenicline">Varenicline</Option>
                <Option value="Bupropion">Bupropion</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="preparation_steps"
              label="Preparation Steps"
              rules={[{ required: true, message: 'Please enter preparation steps' }]}
            >
              <TextArea rows={3} placeholder="Enter preparation steps for the member..." />
            </Form.Item>

            <Form.Item
              name="note"
              label="Additional Notes"
            >
              <TextArea rows={2} placeholder="Any additional guidance or notes..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* View Plan Modal */}
        <Modal
          title={
            <Space>
              <FileTextOutlined />
              {selectedMember?.memberName}'s Quit Plan
              {memberPlan && (
                <Tag color={getStatusColor(memberPlan.status)}>
                  {getStatusText(memberPlan.status)}
                </Tag>
              )}
            </Space>
          }
          open={viewPlanModalVisible}
          onCancel={() => setViewPlanModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewPlanModalVisible(false)}>
              Close
            </Button>,
            memberPlan?.status === 'PENDING_APPROVAL' && (
              <Space key="approval-actions">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handlePlanAction('deny')}
                >
                  Deny
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handlePlanAction('accept')}
                >
                  Approve
                </Button>
              </Space>
            ),
            memberPlan?.status === 'ACTIVE' && (
              <Space key="active-actions">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handlePlanAction('update')}
                >
                  Update
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handlePlanAction('finish')}
                >
                  Mark Complete
                </Button>
              </Space>
            )
          ]}
          width={900}
        >
          {memberPlan && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Start Date">
                  {formatDate(memberPlan.start_date)}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {formatDate(memberPlan.end_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Strategies">
                  {memberPlan.strategies_to_use}
                </Descriptions.Item>
                <Descriptions.Item label="Medications">
                  {memberPlan.medications_to_use || 'None'}
                </Descriptions.Item>
                <Descriptions.Item label="Preparation Steps" span={2}>
                  {memberPlan.preparation_steps}
                </Descriptions.Item>
                {memberPlan.note && (
                  <Descriptions.Item label="Notes" span={2}>
                    {memberPlan.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>

        {/* Action Modal */}
        <Modal
          title={
            <Space>
              {actionType === 'accept' && <CheckCircleOutlined />}
              {actionType === 'deny' && <CloseCircleOutlined />}
              {actionType === 'finish' && <CheckCircleOutlined />}
              {actionType === 'update' && <EditOutlined />}
              {actionType === 'accept' && 'Approve Plan'}
              {actionType === 'deny' && 'Deny Plan'}
              {actionType === 'finish' && 'Complete Plan'}
              {actionType === 'update' && 'Update Plan'}
            </Space>
          }
          open={actionModalVisible}
          onCancel={() => setActionModalVisible(false)}
          onOk={submitPlanAction}
          confirmLoading={submitting}
          okText={
            actionType === 'accept' ? 'Approve' :
            actionType === 'deny' ? 'Deny' :
            actionType === 'finish' ? 'Mark Complete' :
            'Update'
          }
          okButtonProps={{
            type: actionType === 'deny' ? 'danger' : 'primary'
          }}
        >
          <Form form={form} layout="vertical">
            {actionType === 'deny' && (
              <Form.Item
                name="feedback"
                label="Reason for Denial"
                rules={[{ required: true, message: 'Please provide reason for denial' }]}
              >
                <TextArea rows={4} placeholder="Explain why this plan needs to be revised..." />
              </Form.Item>
            )}

            {actionType === 'finish' && (
              <Form.Item
                name="note"
                label="Completion Notes"
              >
                <TextArea rows={3} placeholder="Add any final notes about the completed plan..." />
              </Form.Item>
            )}

            {actionType === 'update' && (
              <>
                <Form.Item
                  name="strategies_to_use"
                  label="Update Strategies"
                >
                  <Select mode="multiple" placeholder="Update strategies">
                    <Option value="Nicotine Replacement Therapy">Nicotine Replacement Therapy</Option>
                    <Option value="Behavioral Therapy">Behavioral Therapy</Option>
                    <Option value="Exercise Program">Exercise Program</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="note"
                  label="Update Notes"
                >
                  <TextArea rows={3} placeholder="Add notes about the update..." />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default QuitPlanApprovalNewFlow;
