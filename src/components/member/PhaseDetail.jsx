import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Avatar,
  Descriptions,
  Steps,
  Progress,
  Alert,
  List,
  Statistic,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Badge,
  Timeline
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  MessageOutlined,
  CalendarOutlined,
  AimOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getPhasesOfPlan, 
  getPhasesOfNewestPlan 
} from '../../services/phaseService';
import { 
  getQuitPlanByPlanId,
  updateQuitPlanByCoach
} from '../../services/quitPlanService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const PhaseDetail = () => {
  const { phaseId, planId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [quitPlan, setQuitPlan] = useState(null);
  const [allPhases, setAllPhases] = useState([]);
  const [phaseGoals, setPhaseGoals] = useState([]);
  const [phaseActivities, setPhaseActivities] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchPhaseDetail = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);

        // Get quit plan details
        const planResponse = await getQuitPlanByPlanId(planId);
        if (planResponse.success) {
          setQuitPlan(planResponse.data);
        }

        // Get all phases of the plan
        const phasesResponse = await getPhasesOfPlan(planId);
        if (phasesResponse.success) {
          setAllPhases(phasesResponse.data.phases || []);
          
          // Find the specific phase
          const currentPhase = phasesResponse.data.phases?.find(p => 
            p.quit_phase_id?.toString() === phaseId || 
            p.phase_id?.toString() === phaseId
          );
          
          if (currentPhase) {
            setPhase(currentPhase);
            
            // Mock phase goals and activities based on phase type
            setPhaseGoals(generatePhaseGoals(currentPhase));
            setPhaseActivities(generatePhaseActivities(currentPhase));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching phase details:", error);
        message.error("Không thể tải chi tiết giai đoạn");
        setLoading(false);
      }
    };

    if (phaseId && planId) {
      fetchPhaseDetail();
    }
  }, [phaseId, planId]);

  // Generate mock goals based on phase
  const generatePhaseGoals = (phase) => {
    const baseGoals = {
      'Chuẩn bị': [
        { id: 1, title: 'Xác định ngày bỏ thuốc', completed: true, description: 'Chọn một ngày cụ thể để bắt đầu cai thuốc' },
        { id: 2, title: 'Loại bỏ thuốc lá khỏi nhà', completed: true, description: 'Vứt bỏ tất cả thuốc lá và dụng cụ hút thuốc' },
        { id: 3, title: 'Thông báo cho gia đình và bạn bè', completed: false, description: 'Chia sẻ kế hoạch với những người thân để nhận được sự hỗ trợ' },
        { id: 4, title: 'Chuẩn bị các hoạt động thay thế', completed: false, description: 'Lên danh sách các hoạt động để làm khi có cơn thèm' }
      ],
      'Hành động': [
        { id: 1, title: 'Không hút thuốc trong 24h đầu', completed: true, description: 'Vượt qua ngày đầu tiên không thuốc lá' },
        { id: 2, title: 'Duy trì 1 tuần không thuốc', completed: true, description: 'Hoàn thành tuần đầu tiên của hành trình' },
        { id: 3, title: 'Xử lý cơn thèm hiệu quả', completed: false, description: 'Áp dụng các kỹ thuật để vượt qua cơn thèm thuốc' },
        { id: 4, title: 'Duy trì 1 tháng không thuốc', completed: false, description: 'Hoàn thành cột mốc 30 ngày' }
      ],
      'Duy trì': [
        { id: 1, title: 'Duy trì 3 tháng không thuốc', completed: false, description: 'Củng cố thói quen sống không thuốc lá' },
        { id: 2, title: 'Xây dựng lối sống lành mạnh', completed: false, description: 'Phát triển các thói quen tích cực thay thế' },
        { id: 3, title: 'Quản lý căng thẳng hiệu quả', completed: false, description: 'Học cách xử lý stress mà không cần thuốc lá' }
      ],
      'Kết thúc': [
        { id: 1, title: 'Hoàn thành 6 tháng không thuốc', completed: false, description: 'Đạt được cột mốc quan trọng 6 tháng' },
        { id: 2, title: 'Chia sẻ kinh nghiệm với cộng đồng', completed: false, description: 'Giúp đỡ những người khác trong hành trình cai thuốc' }
      ]
    };
    
    return baseGoals[phase.phase_name] || [];
  };

  // Generate mock activities based on phase
  const generatePhaseActivities = (phase) => {
    return [
      {
        id: 1,
        title: 'Kiểm tra tiến trình hàng ngày',
        description: 'Cập nhật tình trạng và cảm xúc mỗi ngày',
        type: 'daily',
        status: 'active',
        dueDate: moment().format('YYYY-MM-DD')
      },
      {
        id: 2,
        title: 'Tư vấn với chuyên gia',
        description: 'Buổi tư vấn định kỳ với coach',
        type: 'appointment',
        status: 'scheduled',
        dueDate: moment().add(2, 'days').format('YYYY-MM-DD')
      },
      {
        id: 3,
        title: 'Thực hành kỹ thuật thở sâu',
        description: 'Luyện tập kỹ thuật thở để giảm căng thẳng',
        type: 'exercise',
        status: 'pending',
        dueDate: moment().add(1, 'days').format('YYYY-MM-DD')
      }
    ];
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const getCurrentPhaseIndex = () => {
    return allPhases.findIndex(p => 
      p.quit_phase_id?.toString() === phaseId || 
      p.phase_id?.toString() === phaseId
    );
  };

  const getPhaseStatus = (phase) => {
    if (phase.is_completed) return 'finish';
    if (phase.phase_name === quitPlan?.current_phase?.phase_name) return 'process';
    return 'wait';
  };

  const getPhaseStatusColor = (phase) => {
    if (phase.is_completed) return 'success';
    if (phase.phase_name === quitPlan?.current_phase?.phase_name) return 'processing';
    return 'default';
  };

  const handleCompleteGoal = (goalId) => {
    setPhaseGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
    message.success('Cập nhật mục tiêu thành công');
  };

  const handleEditPhase = () => {
    form.setFieldsValue({
      objective: phase.objective,
      notes: phase.notes || ''
    });
    setEditModalVisible(true);
  };

  const handleSavePhase = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      // Update phase via quit plan service
      const updateData = {
        ...quitPlan,
        phases: allPhases.map(p => 
          p.quit_phase_id === phase.quit_phase_id 
            ? { ...p, objective: values.objective, notes: values.notes }
            : p
        )
      };
      
      const response = await updateQuitPlanByCoach(planId, updateData);
      
      if (response.success) {
        setPhase(prev => ({ ...prev, objective: values.objective, notes: values.notes }));
        setEditModalVisible(false);
        message.success('Cập nhật giai đoạn thành công');
      } else {
        message.error('Không thể cập nhật giai đoạn');
      }
    } catch (error) {
      console.error('Error updating phase:', error);
      message.error('Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const completedGoalsCount = phaseGoals.filter(goal => goal.completed).length;
  const completionPercentage = phaseGoals.length > 0 ? (completedGoalsCount / phaseGoals.length) * 100 : 0;

  if (loading || !phase) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-detail">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <AimOutlined /> Chi tiết giai đoạn: {phase.phase_name}
          </Title>
          <Space>
            {currentUser?.role === 'COACH' && (
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEditPhase}
              >
                Chỉnh sửa
              </Button>
            )}
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            {/* Phase Overview */}
            <Card className="mb-4">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      style={{ 
                        backgroundColor: getPhaseStatusColor(phase) === 'success' ? '#52c41a' : 
                                       getPhaseStatusColor(phase) === 'processing' ? '#1890ff' : '#d9d9d9'
                      }}
                      icon={
                        phase.is_completed ? <CheckCircleOutlined /> : 
                        phase.phase_name === quitPlan?.current_phase?.phase_name ? <PlayCircleOutlined /> :
                        <ClockCircleOutlined />
                      }
                    />
                    <Title level={4} className="mt-2">{phase.phase_name}</Title>
                    <Tag color={getPhaseStatusColor(phase)}>
                      {phase.is_completed ? 'Đã hoàn thành' : 
                       phase.phase_name === quitPlan?.current_phase?.phase_name ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Mục tiêu">
                      {phase.objective}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thứ tự">
                      Giai đoạn {phase.phase_order} / {allPhases.length}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                      {formatDate(phase.start_date)}
                    </Descriptions.Item>
                    {phase.end_date && (
                      <Descriptions.Item label="Ngày kết thúc">
                        {formatDate(phase.end_date)}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Tiến độ">
                      <Progress 
                        percent={phase.completion_percentage || completionPercentage} 
                        status={phase.is_completed ? 'success' : 'active'}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Phase Goals */}
            <Card title={<><AimOutlined /> Mục tiêu giai đoạn</>} className="mb-4">
              <div className="mb-3">
                <Space>
                  <Statistic 
                    title="Hoàn thành" 
                    value={completedGoalsCount} 
                    suffix={`/ ${phaseGoals.length}`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Progress 
                    type="circle" 
                    percent={completionPercentage} 
                    width={60}
                    status={completionPercentage === 100 ? 'success' : 'active'}
                  />
                </Space>
              </div>
              
              <List
                dataSource={phaseGoals}
                renderItem={goal => (
                  <List.Item
                    actions={[
                      <Button
                        type={goal.completed ? 'default' : 'primary'}
                        size="small"
                        icon={goal.completed ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleCompleteGoal(goal.id)}
                      >
                        {goal.completed ? 'Hủy' : 'Hoàn thành'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: goal.completed ? '#52c41a' : '#d9d9d9' 
                          }}
                          icon={goal.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <Text delete={goal.completed} strong>{goal.title}</Text>
                          {goal.completed && <Badge count="Xong" style={{ backgroundColor: '#52c41a' }} />}
                        </Space>
                      }
                      description={goal.description}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Phase Activities */}
            <Card title={<><CalendarOutlined /> Hoạt động giai đoạn</>} className="mb-4">
              <Timeline>
                {phaseActivities.map(activity => (
                  <Timeline.Item
                    key={activity.id}
                    color={
                      activity.status === 'completed' ? 'green' :
                      activity.status === 'active' ? 'blue' :
                      activity.status === 'scheduled' ? 'orange' : 'gray'
                    }
                  >
                    <div>
                      <Title level={5}>{activity.title}</Title>
                      <Paragraph>{activity.description}</Paragraph>
                      <Space>
                        <Tag color={
                          activity.type === 'daily' ? 'blue' :
                          activity.type === 'appointment' ? 'green' :
                          activity.type === 'exercise' ? 'orange' : 'default'
                        }>
                          {activity.type === 'daily' ? 'Hàng ngày' :
                           activity.type === 'appointment' ? 'Cuộc hẹn' :
                           activity.type === 'exercise' ? 'Bài tập' : 'Khác'}
                        </Tag>
                        <Text type="secondary">
                          <CalendarOutlined /> {formatDate(activity.dueDate)}
                        </Text>
                      </Space>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          {/* Right Column - Sidebar */}
          <Col xs={24} lg={8}>
            {/* Phase Navigation */}
            <Card title="Các giai đoạn" className="mb-4">
              <Steps 
                direction="vertical" 
                current={getCurrentPhaseIndex()}
                size="small"
              >
                {allPhases.map((p) => (
                  <Step 
                    key={p.quit_phase_id || p.phase_id}
                    title={
                      <Button 
                        type="link" 
                        style={{ padding: 0, height: 'auto' }}
                        onClick={() => navigate(`/member/phase/${p.quit_phase_id || p.phase_id}/${planId}`)}
                      >
                        {p.phase_name}
                      </Button>
                    }
                    description={`Thứ tự: ${p.phase_order}`}
                    status={getPhaseStatus(p)}
                  />
                ))}
              </Steps>
            </Card>

            {/* Quick Actions */}
            <Card title="Hành động nhanh" className="mb-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<FileTextOutlined />}>
                  Cập nhật tiến trình hôm nay
                </Button>
                <Button block icon={<MessageOutlined />}>
                  Nhắn tin với Coach
                </Button>
                <Button block icon={<CalendarOutlined />}>
                  Đặt lịch tư vấn
                </Button>
                <Button block icon={<BulbOutlined />}>
                  Xem gợi ý cho giai đoạn
                </Button>
              </Space>
            </Card>

            {/* Coach Information */}
            {quitPlan?.coach_name && (
              <Card title="Coach hỗ trợ">
                <div className="coach-card text-center">
                  <Avatar 
                    size={64} 
                    src={quitPlan.coach_photo} 
                    icon={<UserOutlined />} 
                  />
                  <Title level={5} className="mt-2">{quitPlan.coach_name}</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" icon={<MessageOutlined />} block>
                      Nhắn tin
                    </Button>
                    <Button type="default" icon={<CalendarOutlined />} block>
                      Đặt lịch hẹn
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          </Col>
        </Row>

        {/* Edit Phase Modal */}
        <Modal
          title="Chỉnh sửa giai đoạn"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setEditModalVisible(false)}>
              Hủy
            </Button>,
            <Button 
              key="save" 
              type="primary" 
              loading={saving}
              onClick={handleSavePhase}
            >
              Lưu thay đổi
            </Button>
          ]}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="objective"
              label="Mục tiêu giai đoạn"
              rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
            >
              <TextArea rows={3} placeholder="Nhập mục tiêu cho giai đoạn này" />
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea rows={4} placeholder="Nhập ghi chú bổ sung" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PhaseDetail;