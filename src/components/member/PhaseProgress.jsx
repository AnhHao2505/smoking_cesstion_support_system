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
  Progress,
  Steps,
  List,
  Statistic,
  Timeline,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Table
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  AimOutlined,
  LineChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getPhasesOfPlan, 
  getPhasesOfNewestPlan 
} from '../../services/phaseService';
import { 
  getQuitPlanByPlanId 
} from '../../services/quitPlanService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PhaseProgress = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quitPlan, setQuitPlan] = useState(null);
  const [phases, setPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProgressData = async () => {
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
          const allPhases = phasesResponse.data.phases || [];
          setPhases(allPhases);
          
          // Find current phase
          const current = allPhases.find(p => !p.is_completed) || allPhases[allPhases.length - 1];
          setCurrentPhase(current);
          
          // Generate progress data
          setProgressData(generateProgressData(allPhases));
          setMilestones(generateMilestones(allPhases));
          setProgressHistory(generateProgressHistory());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        message.error("Không thể tải dữ liệu tiến độ");
        setLoading(false);
      }
    };

    if (planId) {
      fetchProgressData();
    }
  }, [planId]);

  // Generate progress data for phases
  const generateProgressData = (phases) => {
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.is_completed).length;
    const overallProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
    
    return {
      overallProgress,
      totalPhases,
      completedPhases,
      currentPhaseIndex: phases.findIndex(p => !p.is_completed),
      phaseDetails: phases.map((phase, index) => ({
        ...phase,
        progressPercentage: phase.is_completed ? 100 : 
          (index === phases.findIndex(p => !p.is_completed) ? phase.completion_percentage || 45 : 0)
      }))
    };
  };

  // Generate milestones
  const generateMilestones = (phases) => {
    return [
      {
        id: 1,
        title: 'Bắt đầu hành trình',
        description: 'Khởi tạo kế hoạch cai thuốc',
        date: quitPlan?.start_date,
        achieved: true,
        type: 'start'
      },
      ...phases.map((phase, index) => ({
        id: index + 2,
        title: `Hoàn thành ${phase.phase_name}`,
        description: phase.objective,
        date: phase.end_date || moment(quitPlan?.start_date).add((index + 1) * 30, 'days').format('YYYY-MM-DD'),
        achieved: phase.is_completed,
        type: 'phase',
        phaseId: phase.quit_phase_id || phase.phase_id
      })),
      {
        id: phases.length + 2,
        title: 'Hoàn thành toàn bộ chương trình',
        description: 'Kết thúc thành công hành trình cai thuốc',
        date: quitPlan?.end_date,
        achieved: phases.every(p => p.is_completed),
        type: 'completion'
      }
    ];
  };

  // Generate progress history
  const generateProgressHistory = () => {
    return [
      {
        date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        phase: 'Chuẩn bị',
        progress: 80,
        note: 'Hoàn thành các bước chuẩn bị cơ bản'
      },
      {
        date: moment().subtract(5, 'days').format('YYYY-MM-DD'),
        phase: 'Chuẩn bị',
        progress: 100,
        note: 'Kết thúc giai đoạn chuẩn bị'
      },
      {
        date: moment().subtract(3, 'days').format('YYYY-MM-DD'),
        phase: 'Hành động',
        progress: 20,
        note: 'Bắt đầu giai đoạn hành động'
      },
      {
        date: moment().format('YYYY-MM-DD'),
        phase: 'Hành động',
        progress: 45,
        note: 'Tiếp tục thực hiện các mục tiêu'
      }
    ];
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const getPhaseStatusColor = (phase) => {
    if (phase.is_completed) return 'success';
    if (phase === currentPhase) return 'processing';
    return 'default';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (current < previous) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    return <MinusOutlined style={{ color: '#d9d9d9' }} />;
  };

  const handleAddMilestone = async () => {
    try {
      const values = await form.validateFields();
      // Add milestone logic here
      message.success('Thêm cột mốc thành công');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  // Progress table columns
  const progressColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: date => formatDate(date)
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'phase',
      key: 'phase',
      render: phase => <Tag color="blue">{phase}</Tag>
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: progress => <Progress percent={progress} size="small" />
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note'
    }
  ];

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
    <div className="phase-progress">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <LineChartOutlined /> Theo dõi tiến độ các giai đoạn
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Thêm cột mốc
            </Button>
            <Button onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Space>
        </div>

        {/* Overall Progress */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Tiến độ tổng thể"
                value={progressData.overallProgress}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
                prefix={<AimOutlined />}
              />
              <Progress 
                percent={progressData.overallProgress} 
                strokeColor="#52c41a"
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Giai đoạn hoàn thành"
                value={progressData.completedPhases}
                suffix={`/ ${progressData.totalPhases}`}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Giai đoạn hiện tại"
                value={currentPhase?.phase_name || 'Hoàn thành'}
                valueStyle={{ color: '#722ed1' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Ngày trong chương trình"
                value={moment().diff(moment(quitPlan?.start_date), 'days') + 1}
                suffix="ngày"
                valueStyle={{ color: '#fa8c16' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Phase Progress Steps */}
            <Card title="Tiến độ theo giai đoạn" className="mb-4">
              <Steps direction="vertical" current={progressData.currentPhaseIndex}>
                {progressData.phaseDetails?.map((phase, index) => (
                  <Step
                    key={phase.quit_phase_id || phase.phase_id}
                    title={
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{phase.phase_name}</span>
                        <Tag color={getPhaseStatusColor(phase)}>
                          {phase.is_completed ? 'Hoàn thành' : 
                           phase === currentPhase ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph>{phase.objective}</Paragraph>
                        <Progress 
                          percent={phase.progressPercentage} 
                          size="small"
                          status={phase.is_completed ? 'success' : 'active'}
                        />
                        <Text type="secondary">
                          {phase.is_completed 
                            ? `Hoàn thành: ${formatDate(phase.end_date)}` 
                            : `Bắt đầu: ${formatDate(phase.start_date)}`}
                        </Text>
                        <div className="mt-2">
                          <Button 
                            size="small" 
                            type="link"
                            onClick={() => navigate(`/member/phase/${phase.quit_phase_id || phase.phase_id}/${planId}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    }
                    status={
                      phase.is_completed ? 'finish' : 
                      phase === currentPhase ? 'process' : 'wait'
                    }
                  />
                ))}
              </Steps>
            </Card>

            {/* Progress History */}
            <Card title="Lịch sử tiến độ" className="mb-4">
              <Table
                dataSource={progressHistory}
                columns={progressColumns}
                pagination={false}
                size="small"
                rowKey="date"
              />
            </Card>

            {/* Achievement Timeline */}
            <Card title="Cột mốc thành tựu">
              <Timeline mode="left">
                {milestones.map(milestone => (
                  <Timeline.Item
                    key={milestone.id}
                    color={milestone.achieved ? 'green' : 'blue'}
                    label={formatDate(milestone.date)}
                  >
                    <div>
                      <Title level={5}>
                        {milestone.achieved && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                        {milestone.title}
                      </Title>
                      <Paragraph>{milestone.description}</Paragraph>
                      {milestone.achieved && (
                        <Badge count="Đã đạt" style={{ backgroundColor: '#52c41a' }} />
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Current Phase Details */}
            {currentPhase && (
              <Card title="Giai đoạn hiện tại" className="mb-4">
                <div className="text-center">
                  <Avatar 
                    size={64} 
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<PlayCircleOutlined />}
                  />
                  <Title level={4} className="mt-2">{currentPhase.phase_name}</Title>
                  <Paragraph>{currentPhase.objective}</Paragraph>
                  
                  <Progress 
                    type="circle" 
                    percent={currentPhase.completion_percentage || 45}
                    width={80}
                  />
                  
                  <div className="mt-3">
                    <Button 
                      type="primary" 
                      block
                      onClick={() => navigate(`/member/phase/${currentPhase.quit_phase_id || currentPhase.phase_id}/${planId}`)}
                    >
                      Xem chi tiết giai đoạn
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Weekly Summary */}
            <Card title="Tóm tắt tuần này" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic
                    title="Mục tiêu hoàn thành"
                    value={75}
                    suffix="%"
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Progress percent={75} showInfo={false} />
                </Col>
                <Col span={24}>
                  <div className="d-flex justify-content-between">
                    <Text>So với tuần trước:</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {getTrendIcon(75, 60)} +15%
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Motivational Card */}
            <Card className="motivation-card">
              <div className="text-center">
                <TrophyOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                <Title level={4}>Tiếp tục cố gắng!</Title>
                <Paragraph>
                  Bạn đang làm rất tốt! Hãy duy trì động lực và tiếp tục 
                  thực hiện các mục tiêu trong giai đoạn hiện tại.
                </Paragraph>
                <Button type="primary" icon={<HeartOutlined />}>
                  Xem động lực hôm nay
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Add Milestone Modal */}
        <Modal
          title="Thêm cột mốc mới"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="save" type="primary" onClick={handleAddMilestone}>
              Thêm cột mốc
            </Button>
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề cột mốc"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề cột mốc" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <Input.TextArea rows={3} placeholder="Nhập mô tả cho cột mốc" />
            </Form.Item>
            
            <Form.Item
              name="targetDate"
              label="Ngày mục tiêu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày mục tiêu' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PhaseProgress;