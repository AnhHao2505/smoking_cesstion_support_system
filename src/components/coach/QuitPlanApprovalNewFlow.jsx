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
      console.log('Fetching assigned members for coach:', coachId);
      
      const response = await getAssignedMembers(coachId);
      console.log('Assigned members response:', response);
      
      const members = response || [];
      console.log('Processing', members.length, 'assigned members');
      
      // Transform member data to match UI expectations
      const transformedMembers = members.map(member => ({
        memberId: member.memberId,
        memberName: member.name,
        memberEmail: member.email,
        latestPlanId: member.planId,
        latestInitialStatusId: member.initialStatusId,
        planStatus: member.planId ? 'UNKNOWN' : null, // Will be updated when we fetch individual plans
        hasInitialStatus: !!member.initialStatusId
      }));
      
      console.log('Transformed members:', transformedMembers);
      setAssignedMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching assigned members:', error);
      message.error('Failed to load assigned members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPlan = async (memberId) => {
    try {
      console.log('Fetching plan and status for member:', memberId);
      
      // Fetch quit plan if member has a planId
      let planData = null;
      const member = assignedMembers.find(m => m.memberId === memberId);
      
      if (member?.latestPlanId) {
        console.log('Fetching plan details for planId:', member.latestPlanId);
        const planResponse = await getNewestQuitPlan(memberId);
        console.log('Plan response:', planResponse);
        
          const plan = planResponse;
          planData = {
            quit_plan_id: plan.id,
            status: plan.quitPlanStatus,
            start_date: plan.startDate,
            end_date: plan.endDate,
            motivation: plan.motivation,
            smokingTriggersToAvoid: plan.smokingTriggersToAvoid,
            copingStrategies: plan.copingStrategies,
            medicationsToUse: plan.medicationsToUse,
            medicationInstructions: plan.medicationInstructions,
            relapsePreventionStrategies: plan.relapsePreventionStrategies,
            supportResources: plan.supportResources,
            rewardPlan: plan.rewardPlan,
            additionalNotes: plan.additionalNotes,
            currentSmokingStatus: plan.currentSmokingStatus,
            coachId: plan.coachId,
            coachName: plan.coachName,
            memberName: plan.memberName,
            // Legacy field mappings for compatibility
            strategies_to_use: plan.copingStrategies,
            medications_to_use: plan.medicationsToUse,
            medication_instructions: plan.medicationInstructions,
            preparation_steps: plan.relapsePreventionStrategies,
            note: plan.additionalNotes
          };
      }
      
      // Fetch smoking status if member has initialStatusId
      let statusData = null;
      if (member?.latestInitialStatusId) {
        console.log('Fetching smoking status for member:', memberId);
        const statusResponse = await getLatestMemberSmokingStatus(memberId);
        console.log('Status response:', statusResponse);
        
        statusData = statusResponse;
      }

      setMemberPlan(planData);
      setMemberStatus(statusData);
      
      console.log('Final member plan:', planData);
      console.log('Final member status:', statusData);
    } catch (error) {
      console.error('Error fetching member data:', error);
      message.error('Failed to load member plan data');
    }
  };

  const handleViewMember = async (member) => {
    setSelectedMember(member);
    setMemberPlan(null);
    setMemberStatus(null);
    
    await fetchMemberPlan(member.memberId);

    if (member.latestPlanId) {
      setViewPlanModalVisible(true);
    } else {
      setCreatePlanModalVisible(true);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const values = await createForm.validateFields();
      setSubmitting(true);
      console.log('Creating plan with values:', values);

      // Get default phases based on addiction level
      const addictionLevel = memberStatus?.addiction || 'MODERATE';
      console.log('Getting default phases for addiction level:', addictionLevel);
      
      const defaultPhasesResponse = await getDefaultPhases(addictionLevel);
      console.log('Default phases response:', defaultPhasesResponse);

      if (!defaultPhasesResponse.success) {
        message.error('Failed to get default phases');
        return;
      }

      const planData = {
        motivation: values.motivation || 'Health and family',
        smokingTriggersToAvoid: values.triggers || 'Coffee, stress',
        copingStrategies: Array.isArray(values.strategies_to_use) ? values.strategies_to_use.join(', ') : values.strategies_to_use,
        medicationsToUse: Array.isArray(values.medications_to_use) ? values.medications_to_use.join(', ') : (values.medications_to_use || ''),
        medicationInstructions: values.medication_instructions || '',
        relapsePreventionStrategies: values.preparation_steps,
        supportResources: values.support_resources || 'Family, friends, coach',
        rewardPlan: values.reward_plan || 'Celebrate milestones',
        additionalNotes: values.note || '',
        startDate: values.start_date.format('YYYY-MM-DD'),
        endDate: values.end_date.format('YYYY-MM-DD')
      };

      console.log('Plan data to create:', planData);

      // Create the quit plan
      const createResponse = await createQuitPlan(selectedMember.memberId, planData);
      console.log('Create plan response:', createResponse);

      if (createResponse.success) {
        // Create goals for phases
        const phasesWithGoals = defaultPhasesResponse.data.map((phase, index) => ({
          ...phase,
          goals: values.phase_goals?.[index] || phase.defaultGoal || 'Complete this phase successfully'
        }));

        console.log('Creating phase goals:', phasesWithGoals);
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
      console.log(`Performing ${actionType} action with values:`, values);

      let response;
      const planId = memberPlan.quit_plan_id;

      switch (actionType) {
        case 'accept':
          response = await acceptQuitPlan(planId);
          console.log('Accept plan response:', response);
          if (response.success) {
            message.success('Plan approved! Member can now start their quit journey.');
            setMemberPlan({ ...memberPlan, status: 'ACTIVE' });
          }
          break;

        case 'deny':
          response = await denyQuitPlan(planId, { feedback: values.feedback });
          console.log('Deny plan response:', response);
          if (response.success) {
            message.success('Plan denied. Member will be notified to create a new plan.');
            setMemberPlan({ ...memberPlan, status: 'DENIED' });
          }
          break;

        case 'finish':
          response = await finishQuitPlan(planId, values.note);
          console.log('Finish plan response:', response);
          if (response.success) {
            message.success('Plan marked as completed!');
            setMemberPlan({ ...memberPlan, status: 'COMPLETED' });
          }
          break;

        case 'update':
          const updateData = {
            copingStrategies: Array.isArray(values.strategies_to_use) ? values.strategies_to_use.join(', ') : values.strategies_to_use,
            medicationsToUse: Array.isArray(values.medications_to_use) ? values.medications_to_use.join(', ') : values.medications_to_use,
            additionalNotes: values.note,
            endDate: values.end_date?.format('YYYY-MM-DD')
          };
          console.log('Update plan data:', updateData);
          response = await updateQuitPlanByCoach(planId, updateData);
          console.log('Update plan response:', response);
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
      default: return status || 'Unknown';
    }
  };

  const getAddictionColor = (addiction) => {
    switch (addiction?.toUpperCase()) {
      case 'SEVERE': return 'red';
      case 'MODERATE': return 'orange';
      case 'MILD': return 'yellow';
      case 'NONE': return 'green';
      default: return 'default';
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
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.memberEmail}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Plan Status',
      key: 'planStatus',
      render: (_, record) => (
        <div>
          {record.latestPlanId ? (
            <>
              <Tag color={getStatusColor(record.planStatus)}>
                {getStatusText(record.planStatus)}
              </Tag>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Plan ID: {record.latestPlanId}
              </Text>
            </>
          ) : (
            <Tag color="volcano" icon={<ExclamationCircleOutlined />}>
              No Plan Created
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Initial Assessment',
      key: 'initialStatus',
      render: (_, record) => (
        <div>
          {record.latestInitialStatusId ? (
            <>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Completed
              </Tag>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Status ID: {record.latestInitialStatusId}
              </Text>
            </>
          ) : (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Pending Assessment
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewMember(record)}
            block
          >
            {record.latestPlanId ? 'View Plan' : 'Create Plan'}
          </Button>
          {!record.latestInitialStatusId && (
            <Button
              size="small"
              type="dashed"
              icon={<ExclamationCircleOutlined />}
              disabled
              block
            >
              Awaiting Assessment
            </Button>
          )}
        </Space>
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
          width={900}
          okText="Create Plan"
        >
          <Form form={createForm} layout="vertical">
            {memberStatus ? (
              <Alert
                message="Member Smoking Assessment"
                description={
                  <div>
                    <Space wrap>
                      <Text strong>Addiction Level:</Text>
                      <Tag color={getAddictionColor(memberStatus.addiction)}>
                        {memberStatus.addiction || 'Unknown'}
                      </Tag>
                      <Text strong>Daily Cigarettes:</Text>
                      <Text>{memberStatus.dailySmoking || 0}</Text>
                      <Text strong>Previous Attempts:</Text>
                      <Text>{memberStatus.previousAttempts || 0}</Text>
                    </Space>
                    {memberStatus.reasonToQuit && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Reason to Quit:</Text> {memberStatus.reasonToQuit}
                      </div>
                    )}
                    {memberStatus.goal && (
                      <div style={{ marginTop: 4 }}>
                        <Text strong>Goal:</Text> {memberStatus.goal}
                      </div>
                    )}
                  </div>
                }
                type="info"
                showIcon
                className="mb-3"
              />
            ) : (
              <Alert
                message="No Assessment Data"
                description="Member hasn't completed initial smoking assessment yet."
                type="warning"
                showIcon
                className="mb-3"
              />
            )}

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[{ required: true, message: 'Please select start date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="end_date"
                  label="Target End Date"
                  rules={[{ required: true, message: 'Please select end date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="motivation"
              label="Motivation for Quitting"
              rules={[{ required: true, message: 'Please enter motivation' }]}
              initialValue={memberStatus?.reasonToQuit || ''}
            >
              <TextArea 
                rows={2} 
                placeholder="Why does the member want to quit smoking?"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="triggers"
              label="Smoking Triggers to Avoid"
              rules={[{ required: true, message: 'Please enter triggers' }]}
            >
              <TextArea 
                rows={2} 
                placeholder="What situations trigger the member to smoke?"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="strategies_to_use"
              label="Coping Strategies"
              rules={[{ required: true, message: 'Please select strategies' }]}
            >
              <Select mode="multiple" placeholder="Select coping strategies">
                <Option value="Deep breathing exercises">Deep breathing exercises</Option>
                <Option value="Physical exercise">Physical exercise</Option>
                <Option value="Drink water">Drink water</Option>
                <Option value="Meditation">Meditation</Option>
                <Option value="Call support person">Call support person</Option>
                <Option value="Chew gum">Chew gum</Option>
                <Option value="Keep hands busy">Keep hands busy</Option>
                <Option value="Change routine">Change routine</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="medications_to_use"
              label="Recommended Medications (Optional)"
            >
              <Select mode="multiple" placeholder="Select medications if needed">
                <Option value="Nicotine patches">Nicotine patches</Option>
                <Option value="Nicotine gum">Nicotine gum</Option>
                <Option value="Nicotine lozenges">Nicotine lozenges</Option>
                <Option value="Varenicline">Varenicline</Option>
                <Option value="Bupropion">Bupropion</Option>
                <Option value="Vitamin C supplements">Vitamin C supplements</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="medication_instructions"
              label="Medication Instructions"
            >
              <TextArea 
                rows={2} 
                placeholder="Instructions for medication usage..."
                showCount
                maxLength={300}
              />
            </Form.Item>

            <Form.Item
              name="preparation_steps"
              label="Relapse Prevention Strategies"
              rules={[{ required: true, message: 'Please enter prevention strategies' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="What should the member do to prevent relapse?"
                showCount
                maxLength={400}
              />
            </Form.Item>

            <Form.Item
              name="support_resources"
              label="Support Resources"
            >
              <TextArea 
                rows={2} 
                placeholder="Family, friends, support groups, etc."
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="reward_plan"
              label="Reward Plan"
            >
              <TextArea 
                rows={2} 
                placeholder="How will the member reward themselves for progress?"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="note"
              label="Additional Coach Notes"
            >
              <TextArea 
                rows={2} 
                placeholder="Any additional guidance or notes..."
                showCount
                maxLength={300}
              />
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
                <Tag color={getStatusColor(memberPlan.status)} style={{ marginLeft: 8 }}>
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
          width={1000}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {memberPlan && (
            <div>
              {/* Plan Overview */}
              <Card title="Plan Overview" size="small" className="mb-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Start Date"
                      value={formatDate(memberPlan.start_date)}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Target End Date"
                      value={formatDate(memberPlan.end_date)}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title="Duration"
                      value={moment(memberPlan.end_date).diff(moment(memberPlan.start_date), 'days')}
                      suffix="days"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Member Status */}
              {memberStatus && (
                <Card title="Member Assessment" size="small" className="mb-3">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Daily Smoking">
                          <Text strong>{memberStatus.dailySmoking || 0} cigarettes/day</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Addiction Level">
                          <Tag color={getAddictionColor(memberStatus.addiction)}>
                            {memberStatus.addiction || 'Unknown'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Previous Attempts">
                          {memberStatus.previousAttempts || 0}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                      <Descriptions size="small" column={1}>
                        {memberStatus.yearsSmoking > 0 && (
                          <Descriptions.Item label="Years Smoking">
                            {memberStatus.yearsSmoking} years
                          </Descriptions.Item>
                        )}
                        {memberStatus.startSmokingAge > 0 && (
                          <Descriptions.Item label="Started Age">
                            {memberStatus.startSmokingAge} years old
                          </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Current Status">
                          <Tag color="green">{memberPlan.currentSmokingStatus || 'Unknown'}</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Plan Details */}
              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} md={12}>
                  <Card title={<><BulbOutlined /> Motivation</>} size="small">
                    <Paragraph>{memberPlan.motivation || 'Not specified'}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Triggers to Avoid" size="small">
                    <Paragraph>{memberPlan.smokingTriggersToAvoid || 'Not specified'}</Paragraph>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} md={12}>
                  <Card title="Coping Strategies" size="small">
                    <Paragraph>{memberPlan.copingStrategies || memberPlan.strategies_to_use || 'Not specified'}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title={<><MedicineBoxOutlined /> Medications</>} size="small">
                    <Paragraph>{memberPlan.medicationsToUse || memberPlan.medications_to_use || 'None specified'}</Paragraph>
                    {(memberPlan.medicationInstructions || memberPlan.medication_instructions) && (
                      <div>
                        <Text strong>Instructions:</Text>
                        <br />
                        <Text>{memberPlan.medicationInstructions || memberPlan.medication_instructions}</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} md={12}>
                  <Card title="Relapse Prevention" size="small">
                    <Paragraph>{memberPlan.relapsePreventionStrategies || memberPlan.preparation_steps || 'Not specified'}</Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Support Resources" size="small">
                    <Paragraph>{memberPlan.supportResources || 'Not specified'}</Paragraph>
                  </Card>
                </Col>
              </Row>

              {memberPlan.rewardPlan && (
                <Card title="Reward Plan" size="small" className="mb-3">
                  <Paragraph>{memberPlan.rewardPlan}</Paragraph>
                </Card>
              )}

              {(memberPlan.additionalNotes || memberPlan.note) && (
                <Card title="Additional Notes" size="small" className="mb-3">
                  <Paragraph>{memberPlan.additionalNotes || memberPlan.note}</Paragraph>
                </Card>
              )}

              {/* Coach Information */}
              {memberPlan.coachName && (
                <Card title="Coach Assignment" size="small">
                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Assigned Coach">
                      <Text strong>{memberPlan.coachName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Coach ID">
                      {memberPlan.coachId}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
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
