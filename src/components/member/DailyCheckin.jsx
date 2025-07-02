import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Select, InputNumber, DatePicker, 
  Typography, Row, Col, Slider, Radio, Input, message,
  Steps, Progress, Tag, Space, Alert, Modal
} from 'antd';
import {
  CheckCircleOutlined, HeartOutlined, SmileOutlined,
  FrownOutlined, MehOutlined, ClockCircleOutlined,
  TrophyOutlined, FireOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createMemberSmokingStatus, 
  updateLatestMemberSmokingStatus,
  getLatestMemberSmokingStatus 
} from '../../services/memberSmokingStatusService';
import { getQuitPlanData } from '../../services/memberDashboardService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Option } = Select;

const DailyCheckIn = () => {
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quitPlan, setQuitPlan] = useState(null);
  const [latestStatus, setLatestStatus] = useState(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const navigate = useNavigate();
  
  const userId = currentUser?.userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [planData, statusData] = await Promise.all([
          getQuitPlanData(userId),
          getLatestMemberSmokingStatus(userId)
        ]);
        
        setQuitPlan(planData);
        setLatestStatus(statusData);
        
        // Check if already checked in today
        if (statusData && moment(statusData.record_date).isSame(moment(), 'day')) {
          message.info('Bạn đã cập nhật tiến trình hôm nay rồi!');
          navigate('/member/smoking-status');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const checkInSteps = [
    {
      title: 'Tình trạng hôm nay',
      icon: <HeartOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Bạn cảm thấy thế nào hôm nay?</Title>
          
          <Form.Item
            name="smoking_status"
            label="Tình trạng hút thuốc hôm nay"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
          >
            <Radio.Group size="large">
              <Space direction="vertical">
                <Radio value="smoke_free">
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Không hút thuốc
                  </Space>
                </Radio>
                <Radio value="reduced">
                  <Space>
                    <FireOutlined style={{ color: '#faad14' }} />
                    Giảm lượng hút
                  </Space>
                </Radio>
                <Radio value="normal">
                  <Space>
                    <FrownOutlined style={{ color: '#ff4d4f' }} />
                    Hút như bình thường
                  </Space>
                </Radio>
                <Radio value="increased">
                  <Space>
                    <FrownOutlined style={{ color: '#ff4d4f' }} />
                    Hút nhiều hơn bình thường
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="cigarettes_count"
            label="Số điếu thuốc đã hút"
            rules={[{ required: true, message: 'Vui lòng nhập số điếu thuốc' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Nhập số điếu thuốc"
            />
          </Form.Item>

          <Form.Item
            name="mood"
            label="Tâm trạng chung"
            rules={[{ required: true, message: 'Vui lòng chọn tâm trạng' }]}
          >
            <Select placeholder="Chọn tâm trạng của bạn">
              <Option value="very_good">Rất tốt 😄</Option>
              <Option value="good">Tốt 😊</Option>
              <Option value="normal">Bình thường 😐</Option>
              <Option value="bad">Không tốt 😔</Option>
              <Option value="very_bad">Rất tệ 😢</Option>
            </Select>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Mức độ khó khăn',
      icon: <ClockCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Đánh giá mức độ khó khăn</Title>
          
          <Form.Item
            name="stress_level"
            label="Mức độ căng thẳng (1-10)"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ căng thẳng' }]}
          >
            <Slider
              min={1}
              max={10}
              marks={{
                1: 'Rất thấp',
                5: 'Trung bình',
                10: 'Rất cao'
              }}
              included={false}
            />
          </Form.Item>

          <Form.Item
            name="craving_intensity"
            label="Cường độ cơn thèm (1-10)"
            rules={[{ required: true, message: 'Vui lòng chọn cường độ cơn thèm' }]}
          >
            <Slider
              min={1}
              max={10}
              marks={{
                1: 'Rất nhẹ',
                5: 'Trung bình',
                10: 'Rất mạnh'
              }}
              included={false}
            />
          </Form.Item>

          <Form.Item
            name="craving_frequency"
            label="Tần suất cơn thèm"
            rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
          >
            <Select placeholder="Chọn tần suất cơn thèm">
              <Option value="none">Không có</Option>
              <Option value="rare">Hiếm khi (1-2 lần)</Option>
              <Option value="occasional">Thỉnh thoảng (3-5 lần)</Option>
              <Option value="frequent">Thường xuyên (6-10 lần)</Option>
              <Option value="constant">Liên tục (10 lần)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="triggers"
            label="Những yếu tố kích hoạt cơn thèm"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các yếu tố kích hoạt"
              allowClear
            >
              <Option value="stress">Căng thẳng</Option>
              <Option value="alcohol">Rượu bia</Option>
              <Option value="coffee">Cà phê</Option>
              <Option value="social">Hoạt động xã hội</Option>
              <Option value="after_meal">Sau bữa ăn</Option>
              <Option value="boredom">Buồn chán</Option>
              <Option value="work_pressure">Áp lực công việc</Option>
              <Option value="emotional">Cảm xúc tiêu cực</Option>
            </Select>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Ghi chú & Mục tiêu',
      icon: <SmileOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Chia sẻ thêm về ngày hôm nay</Title>
          
          <Form.Item
            name="notes"
            label="Ghi chú về ngày hôm nay"
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ cảm xúc, khó khăn hoặc thành công của bạn hôm nay..."
            />
          </Form.Item>

          <Form.Item
            name="strategies_used"
            label="Chiến lược đã sử dụng"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các chiến lược bạn đã áp dụng"
              allowClear
            >
              <Option value="deep_breathing">Thở sâu</Option>
              <Option value="exercise">Tập thể dục</Option>
              <Option value="meditation">Thiền</Option>
              <Option value="distraction">Chuyển hướng chú ý</Option>
              <Option value="support_group">Nhóm hỗ trợ</Option>
              <Option value="nicotine_replacement">Thay thế nicotine</Option>
              <Option value="healthy_snacks">Ăn vặt lành mạnh</Option>
              <Option value="positive_thinking">Suy nghĩ tích cực</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tomorrow_goal"
            label="Mục tiêu ngày mai"
          >
            <TextArea
              rows={2}
              placeholder="Đặt mục tiêu cho ngày mai..."
            />
          </Form.Item>

          <Form.Item
            name="physical_symptoms"
            label="Triệu chứng thể chất"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các triệu chứng bạn gặp phải"
              allowClear
            >
              <Option value="headache">Đau đầu</Option>
              <Option value="fatigue">Mệt mỏi</Option>
              <Option value="irritability">Cáu kỉnh</Option>
              <Option value="difficulty_concentrating">Khó tập trung</Option>
              <Option value="increased_appetite">Tăng cảm giác đói</Option>
              <Option value="sleep_problems">Khó ngủ</Option>
              <Option value="cough">Ho</Option>
              <Option value="none">Không có triệu chứng</Option>
            </Select>
          </Form.Item>
        </div>
      )
    }
  ];

  const next = async () => {
    try {
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['smoking_status', 'cigarettes_count', 'mood'];
      case 1:
        return ['stress_level', 'craving_intensity', 'craving_frequency'];
      case 2:
        return [];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const statusData = {
        member_id: userId,
        record_date: moment().format('YYYY-MM-DD'),
        smoking_status: values.smoking_status,
        cigarettes_count: values.cigarettes_count || 0,
        mood: values.mood,
        stress_level: values.stress_level,
        craving_intensity: values.craving_intensity,
        craving_frequency: values.craving_frequency,
        triggers: values.triggers ? values.triggers.join(',') : '',
        strategies_used: values.strategies_used ? values.strategies_used.join(',') : '',
        physical_symptoms: values.physical_symptoms ? values.physical_symptoms.join(',') : '',
        notes: values.notes || '',
        tomorrow_goal: values.tomorrow_goal || ''
      };

      let response;
      if (latestStatus) {
        response = await updateLatestMemberSmokingStatus(statusData);
      } else {
        response = await createMemberSmokingStatus(statusData);
      }

      if (response.success) {
        // Show congratulations if smoke-free
        if (values.smoking_status === 'smoke_free') {
          setShowCongrats(true);
        }
        
        message.success('Cập nhật tiến trình thành công!');
        setTimeout(() => {
          navigate('/member/smoking-status');
        }, 2000);
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting daily check-in:', error);
      message.error('Có lỗi xảy ra khi cập nhật tiến trình');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysSmokeFree = () => {
    return quitPlan?.days_smoke_free || 0;
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
    <div className="daily-checkin">
      <div className="container py-4">
        <Card className="checkin-card">
          <div className="text-center mb-4">
            <Title level={2}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              Cập nhật tiến trình hàng ngày
            </Title>
            <Text type="secondary">
              Ngày {moment().format('DD/MM/YYYY')} - Ngày thứ {getDaysSmokeFree() + 1} trong hành trình
            </Text>
          </div>

          {/* Progress indicator */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} md={8}>
              <Card size="small" className="stat-mini">
                <Text strong>Ngày không thuốc</Text>
                <br />
                <Text style={{ fontSize: '24px', color: '#52c41a' }}>
                  {getDaysSmokeFree()}
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="stat-mini">
                <Text strong>Giai đoạn hiện tại</Text>
                <br />
                <Tag color="blue">{quitPlan?.current_phase?.phase_name || 'Chuẩn bị'}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="stat-mini">
                <Text strong>Tiến độ tổng thể</Text>
                <br />
                <Progress 
                  percent={quitPlan?.progress || 0} 
                  size="small" 
                  format={percent => `${percent}%`}
                />
              </Card>
            </Col>
          </Row>

          <Steps current={currentStep} className="mb-4">
            {checkInSteps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
          >
            <div className="steps-content mb-4">
              {checkInSteps[currentStep].content}
            </div>

            <div className="steps-action text-center">
              {currentStep > 0 && (
                <Button 
                  style={{ marginRight: 8 }} 
                  onClick={prev}
                  disabled={submitting}
                >
                  Quay lại
                </Button>
              )}
              
              {currentStep < checkInSteps.length - 1 && (
                <Button type="primary" onClick={next}>
                  Tiếp theo
                </Button>
              )}
              
              {currentStep === checkInSteps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={submitting}
                  size="large"
                  icon={<CheckCircleOutlined />}
                >
                  Hoàn thành cập nhật
                </Button>
              )}
            </div>
          </Form>
        </Card>

        {/* Congratulations Modal */}
        <Modal
          open={showCongrats}
          onCancel={() => setShowCongrats(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setShowCongrats(false)}>
              Cảm ơn!
            </Button>
          ]}
          className="congrats-modal"
        >
          <div className="text-center py-4">
            <TrophyOutlined style={{ fontSize: '48px', color: '#faad14' }} />
            <Title level={3} style={{ color: '#52c41a' }}>
              Chúc mừng bạn!
            </Title>
            <Paragraph>
              Bạn đã có thêm một ngày không thuốc lá! Hãy tiếp tục duy trì tinh thần này.
            </Paragraph>
            <Tag color="success" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Ngày thứ {getDaysSmokeFree() + 1} không thuốc lá
            </Tag>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DailyCheckIn;