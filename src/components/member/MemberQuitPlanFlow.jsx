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
  ExclamationCircleOutlined,
  FlagOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getMemberQuitPlanWithActions,
  processMemberQuitPlanAction,
  getOldPlansOfMember,
  getQuitPlanNotification,
  quitPlanWorkflow
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
      
      // Fetch current plan with action availability
      const currentPlanResponse = await getMemberQuitPlanWithActions(memberId);
      console.log('API Response:', currentPlanResponse);
      
        // Map API response to component expected format
        const planData = currentPlanResponse;
        const mappedPlan = {
          quit_plan_id: planData.id,
          status: planData.quitPlanStatus,
          start_date: planData.startDate,
          end_date: planData.endDate,
          coach_name: planData.coachName,
          coach_id: planData.coachId,
          member_name: planData.memberName,
          member_id: planData.memberId,
          strategies_to_use: planData.copingStrategies,
          medications_to_use: planData.medicationsToUse,
          preparation_steps: planData.relapsePreventionStrategies,
          medication_instructions: planData.medicationInstructions,
          note: planData.additionalNotes,
          motivation: planData.motivation,
          reward_plan: planData.rewardPlan,
          support_resources: planData.supportResources,
          smoking_triggers_to_avoid: planData.smokingTriggersToAvoid,
          current_smoking_status: planData.currentSmokingStatus,
          // Add action availability based on status
          canAccept: planData.quitPlanStatus === 'PENDING',
          canDeny: planData.quitPlanStatus === 'PENDING'
        };
        
        setCurrentPlan(mappedPlan);
        
        // Fetch plan phases if plan has ID
        const planId = planData.id;
        if (planId) {
          try {
            const phasesResponse = await getPhasesOfPlan(planId);
            console.log('Phases Response:', phasesResponse);
            // Handle single phase object or array of phases
            const phases = Array.isArray(phasesResponse) ? phasesResponse : [phasesResponse];
            // Sort phases by order if multiple phases exist
            const sortedPhases = phases.sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
            setPlanPhases(sortedPhases);
          } catch (phaseError) {
            console.warn('Could not fetch phases:', phaseError);
            setPlanPhases([]);
          }
        }

      // Fetch plan history
      try {
        const historyResponse = await getOldPlansOfMember(memberId, 0, 5);
        if (historyResponse.success) {
          setPlanHistory(historyResponse.data.content || []);
        }
      } catch (historyError) {
        console.warn('Could not fetch plan history:', historyError);
        setPlanHistory([]);
      }
    } catch (error) {
      console.error('Error fetching member quit plan data:', error);
      message.error('Failed to load quit plan data');
      setCurrentPlan(null);
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

      // Use the enhanced workflow function
      const response = await processMemberQuitPlanAction(planId, actionType);
      
      if (response.success) {
        // Update local state immediately
        const newStatus = actionType === 'accept' ? 'ACTIVE' : 'DENIED';
        setCurrentPlan({ 
          ...currentPlan, 
          status: newStatus, 
          canAccept: false, 
          canDeny: false 
        });
        
        // Show appropriate success message
        const actionMessage = actionType === 'accept' 
          ? 'Plan accepted successfully! Your quit journey has begun.' 
          : 'Plan declined. Your coach will create a new plan for you.';
        message.success(actionMessage);
        
        // Refresh data to get latest state
        await fetchMemberQuitPlanData();
      } else {
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
    return quitPlanWorkflow.getQuitPlanStatusColor(status);
  };

  const getStatusText = (status) => {
    return quitPlanWorkflow.getQuitPlanStatusText(status);
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const getCurrentPhaseIndex = () => {
    if (!planPhases.length) return 0;
    // Since we may only have one phase currently, return 0 for active phase
    // or find the current phase based on order
    const currentPhase = planPhases.find(phase => phase.phaseOrder === 1);
    return currentPhase ? 0 : 0;
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
            <HeartOutlined /> Hành trình cai thuốc của tôi
          </Title>
          <Space>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => setHistoryModalVisible(true)}
            >
              Lịch sử kế hoạch
            </Button>
          </Space>
        </div>

        {!currentPlan ? (
          // No current plan
          <Card>
            <div className="text-center py-5">
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />
              <Title level={3}>Chưa có kế hoạch cai thuốc</Title>
              <Paragraph>
                Bạn chưa có kế hoạch cai thuốc nào. Huấn luyện viên được phân công sẽ tạo kế hoạch cá nhân hóa cho bạn trong thời gian sớm nhất.
              </Paragraph>
              <Paragraph type="secondary">
                Trong lúc chờ đợi, bạn có thể liên hệ với huấn luyện viên để được tư vấn và hỗ trợ.
              </Paragraph>
              <Button type="primary" size="large" icon={<MessageOutlined />}>
                Liên hệ huấn luyện viên
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
                    Kế hoạch cai thuốc hiện tại
                    <Tag color={getStatusColor(currentPlan.status)}>
                      {getStatusText(currentPlan.status)}
                    </Tag>
                  </Space>
                }
                extra={
                  currentPlan.canAccept || currentPlan.canDeny ? (
                    <Space>
                      {currentPlan.canDeny && (
                        <Button
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handlePlanAction('deny')}
                        >
                          Từ chối
                        </Button>
                      )}
                      {currentPlan.canAccept && (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handlePlanAction('accept')}
                        >
                          Chấp nhận kế hoạch
                        </Button>
                      )}
                    </Space>
                  ) : null
                }
              >
                {(currentPlan.canAccept || currentPlan.canDeny) && (
                  <Alert
                    message="Kế hoạch đang chờ phê duyệt"
                    description={
                      <div>
                        <p>Huấn luyện viên <strong>{currentPlan.coach_name}</strong> đã tạo kế hoạch cai thuốc cá nhân hóa cho bạn.</p>
                        <p>Thời gian thực hiện: <strong>{formatDate(currentPlan.start_date)}</strong> đến <strong>{formatDate(currentPlan.end_date)}</strong> ({moment(currentPlan.end_date).diff(moment(currentPlan.start_date), 'days')} ngày)</p>
                        <p>Vui lòng xem xét chi tiết bên dưới và quyết định chấp nhận hoặc yêu cầu thay đổi.</p>
                      </div>
                    }
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Ngày bắt đầu">
                        {formatDate(currentPlan.start_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày kết thúc dự kiến">
                        {formatDate(currentPlan.end_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian thực hiện">
                        {moment(currentPlan.end_date).diff(moment(currentPlan.start_date), 'days')} ngày
                      </Descriptions.Item>
                      <Descriptions.Item label="Huấn luyện viên">
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
                        <Title level={4}>Tiến độ</Title>
                        <Progress
                          type="circle"
                          percent={Math.round(calculateProgress())}
                          strokeColor="#52c41a"
                          width={120}
                        />
                        <div className="mt-3">
                          <Statistic
                            title="Số ngày đã hoàn thành"
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
              <Card title="Chi tiết kế hoạch">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Chiến lược đối phó">
                    {currentPlan.strategies_to_use}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thuốc hỗ trợ">
                    {currentPlan.medications_to_use || 'Không có thuốc được kê toa'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hướng dẫn sử dụng thuốc">
                    {currentPlan.medication_instructions}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình huống kích thích hút thuốc cần tránh">
                    {currentPlan.smoking_triggers_to_avoid}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiến lược phòng ngừa tái nghiện">
                    {currentPlan.preparation_steps}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nguồn hỗ trợ">
                    {currentPlan.support_resources}
                  </Descriptions.Item>
                  <Descriptions.Item label="Động lực">
                    {currentPlan.motivation}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kế hoạch thưởng">
                    {currentPlan.reward_plan}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình trạng hút thuốc hiện tại">
                    <Tag color={currentPlan.current_smoking_status === 'NONE' ? 'green' : 'orange'}>
                      {currentPlan.current_smoking_status === 'NONE' ? 'Không hút thuốc' : currentPlan.current_smoking_status || 'Chưa xác định'}
                    </Tag>
                  </Descriptions.Item>
                  {currentPlan.note && (
                    <Descriptions.Item label="Ghi chú bổ sung">
                      {currentPlan.note}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {planPhases.length > 0 && (
                  <>
                    <Divider />
                    <Title level={4}>
                      <FlagOutlined /> Các giai đoạn thực hiện
                    </Title>
                    <div className="phases-container">
                      {planPhases.map((phase, index) => (
                        <Card 
                          key={phase.id} 
                          size="small" 
                          className="mb-3"
                          title={
                            <Space>
                              <Tag color="blue">Giai đoạn {phase.phaseOrder}</Tag>
                              {phase.name}
                            </Space>
                          }
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                              <div>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{phase.duration}</Text>
                              </div>
                              <Divider type="vertical" style={{ height: 'auto', margin: '8px 0' }} />
                              <div>
                                <Text strong>Mục tiêu khuyến nghị:</Text>
                                <br />
                                <Text>{phase.recommendGoal}</Text>
                              </div>
                            </Col>
                            <Col xs={24} md={12}>
                              <div>
                                <Text strong>Mục tiêu cụ thể:</Text>
                                {phase.goals && Array.isArray(phase.goals) && phase.goals.length > 0 ? (
                                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                                    {phase.goals.map((goal, goalIndex) => (
                                      <li key={goalIndex}>
                                        <Text>{goal}</Text>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" italic>Chưa có mục tiêu cụ thể</Text>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={8}>
              <Card title="Thao tác nhanh">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<CheckCircleOutlined />}>
                    Báo cáo hàng ngày
                  </Button>
                  <Button block icon={<MessageOutlined />}>
                    Nhắn tin với huấn luyện viên
                  </Button>
                  <Button block icon={<MedicineBoxOutlined />}>
                    Nhắc nhở uống thuốc
                  </Button>
                  <Button block icon={<TrophyOutlined />}>
                    Xem tiến độ
                  </Button>
                  <Button block icon={<CalendarOutlined />}>
                    Đặt lịch hẹn
                  </Button>
                </Space>
              </Card>

              {currentPlan.status === 'ACTIVE' && (
                <Card title="Động lực" className="mt-4">
                  <div className="text-center">
                    <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                    <Title level={4}>Tiếp tục cố gắng!</Title>
                    <Paragraph>
                      Mỗi ngày không hút thuốc là một chiến thắng. Bạn đang làm rất tốt!
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
