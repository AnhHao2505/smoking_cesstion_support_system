import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, InputNumber, DatePicker, 
  Typography, Row, Col, Slider, Input, message,
  Steps, Progress, Tag, Space, Alert, Modal
} from 'antd';
import {
  CheckCircleOutlined, HeartOutlined, SmileOutlined,
  ClockCircleOutlined, TrophyOutlined
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
        
        // Check if already submitted assessment today
        if (statusData && moment(statusData.record_date).isSame(moment(), 'day')) {
          message.info('Bạn đã hoàn thành đánh giá hôm nay rồi!');
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
      title: 'Thông tin hút thuốc',
      icon: <HeartOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Thông tin về thói quen hút thuốc</Title>
          
          <Form.Item
            name="dailySmoking"
            label="Số điếu thuốc hút mỗi ngày"
            rules={[{ required: true, message: 'Vui lòng nhập số điếu thuốc' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Nhập số điếu thuốc hút mỗi ngày"
            />
          </Form.Item>

          <Form.Item
            name="startSmokingAge"
            label="Tuổi bắt đầu hút thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi bắt đầu hút thuốc' }]}
          >
            <InputNumber
              min={1}
              max={100}
              style={{ width: '100%' }}
              placeholder="Nhập tuổi bắt đầu hút thuốc"
            />
          </Form.Item>

          <Form.Item
            name="yearsSmoking"
            label="Số năm đã hút thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập số năm đã hút thuốc' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Nhập số năm đã hút thuốc"
            />
          </Form.Item>

          <Form.Item
            name="smokingTime"
            label="Thời gian hút thuốc trong ngày (điểm số 0-10)"
            rules={[{ required: true, message: 'Vui lòng chọn điểm số' }]}
          >
            <Slider
              min={0}
              max={10}
              marks={{
                0: '0',
                5: '5',
                10: '10'
              }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Đánh giá tình trạng',
      icon: <ClockCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Đánh giá các yếu tố</Title>
          
          <Form.Item
            name="desireToQuit"
            label="Mức độ mong muốn bỏ thuốc (0-10)"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ mong muốn' }]}
          >
            <Slider
              min={0}
              max={10}
              marks={{
                0: 'Không muốn',
                5: 'Trung bình',
                10: 'Rất muốn'
              }}
            />
          </Form.Item>

          <Form.Item
            name="healthProblems"
            label="Vấn đề sức khỏe do hút thuốc (0-10)"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Slider
              min={0}
              max={10}
              marks={{
                0: 'Không có',
                5: 'Trung bình',
                10: 'Nghiêm trọng'
              }}
            />
          </Form.Item>

          <Form.Item
            name="stressSmoking"
            label="Hút thuốc khi căng thẳng (0-10)"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Slider
              min={0}
              max={10}
              marks={{
                0: 'Không bao giờ',
                5: 'Thỉnh thoảng',
                10: 'Luôn luôn'
              }}
            />
          </Form.Item>

          <Form.Item
            name="withdrawalSymptoms"
            label="Triệu chứng cai thuốc (0-10)"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Slider
              min={0}
              max={10}
              marks={{
                0: 'Không có',
                5: 'Trung bình',
                10: 'Rất nặng'
              }}
            />
          </Form.Item>

          <Form.Item
            name="previousAttempts"
            label="Số lần đã cố gắng bỏ thuốc trước đây"
            rules={[{ required: true, message: 'Vui lòng nhập số lần' }]}
          >
            <InputNumber
              min={0}
              max={50}
              style={{ width: '100%' }}
              placeholder="Nhập số lần đã cố gắng bỏ thuốc"
            />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Mục tiêu & Lý do',
      icon: <SmileOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Mục tiêu và lý do bỏ thuốc</Title>
          
          <Form.Item
            name="reasonToQuit"
            label="Lý do muốn bỏ thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả lý do tại sao bạn muốn bỏ thuốc..."
            />
          </Form.Item>

          <Form.Item
            name="goal"
            label="Mục tiêu cụ thể"
            rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
          >
            <TextArea
              rows={3}
              placeholder="Đặt mục tiêu cụ thể cho việc bỏ thuốc..."
            />
          </Form.Item>

          <Form.Item
            name="point"
            label="Điểm tự đánh giá tổng thể (0-100)"
            rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Tự đánh giá điểm từ 0-100"
            />
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
        return ['dailySmoking', 'startSmokingAge', 'yearsSmoking', 'smokingTime'];
      case 1:
        return ['desireToQuit', 'healthProblems', 'stressSmoking', 'withdrawalSymptoms', 'previousAttempts'];
      case 2:
        return ['reasonToQuit', 'goal', 'point'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const statusData = {
        point: values.point || 0,
        dailySmoking: values.dailySmoking || 0,
        desireToQuit: values.desireToQuit || 0,
        healthProblems: values.healthProblems || 0,
        previousAttempts: values.previousAttempts || 0,
        smokingTime: values.smokingTime || 0,
        startSmokingAge: values.startSmokingAge || 0,
        stressSmoking: values.stressSmoking || 0,
        withdrawalSymptoms: values.withdrawalSymptoms || 0,
        yearsSmoking: values.yearsSmoking || 0,
        reasonToQuit: values.reasonToQuit || '',
        goal: values.goal || ''
      };

      let response;
      if (latestStatus) {
        response = await updateLatestMemberSmokingStatus(statusData);
      } else {
        response = await createMemberSmokingStatus(statusData);
      }

      if (response.success) {
        // Show congratulations for high motivation to quit
        if (values.desireToQuit >= 7) {
          setShowCongrats(true);
        }
        
        message.success('Cập nhật đánh giá thành công!');
        setTimeout(() => {
          navigate('/member/smoking-status');
        }, 2000);
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting smoking assessment:', error);
      message.error('Có lỗi xảy ra khi cập nhật đánh giá');
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
              Đánh giá thói quen hút thuốc
            </Title>
            <Text type="secondary">
              Ngày {moment().format('DD/MM/YYYY')} - Đánh giá chi tiết về tình trạng hút thuốc
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
                  Hoàn thành đánh giá
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
              Tuyệt vời!
            </Title>
            <Paragraph>
              Bạn có động lực cao để bỏ thuốc! Hãy giữ vững quyết tâm này.
            </Paragraph>
            <Tag color="success" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Động lực cao để thay đổi
            </Tag>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DailyCheckIn;