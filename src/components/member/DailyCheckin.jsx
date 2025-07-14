import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Typography, Row, Col, Input, message,
  Steps, Progress, Tag, Modal, Radio, Space, Divider
} from 'antd';
import {
  CheckCircleOutlined, HeartOutlined, SmileOutlined,
  ClockCircleOutlined, TrophyOutlined, QuestionCircleOutlined
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
          // navigate('/member/smoking-status');
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
      title: 'Câu hỏi 1-3',
      icon: <QuestionCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Thông tin cơ bản về hút thuốc</Title>
          
          <Form.Item
            name="startSmokingAge"
            label="1. Bạn bắt đầu hút thuốc từ độ tuổi nào?"
            extra="(Điều này giúp đánh giá thời gian bạn đã tiếp xúc với thuốc lá)"
            rules={[{ required: true, message: 'Vui lòng chọn độ tuổi bắt đầu hút thuốc' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={3}>Dưới 15 tuổi (Điểm: 3)</Radio>
                <Radio value={2}>15 - 18 tuổi (Điểm: 2)</Radio>
                <Radio value={1}>18 - 25 tuổi (Điểm: 1)</Radio>
                <Radio value={0}>Trên 25 tuổi (Điểm: 0)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="dailySmoking"
            label="2. Bạn hút bao nhiêu điếu thuốc mỗi ngày?"
            extra="(Số lượng thuốc lá hàng ngày ảnh hưởng lớn đến mức độ nghiện)"
            rules={[{ required: true, message: 'Vui lòng chọn số điếu thuốc' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={1}>Dưới 5 điếu (Điểm: 1)</Radio>
                <Radio value={2}>5 - 10 điếu (Điểm: 2)</Radio>
                <Radio value={3}>11 - 20 điếu (Điểm: 3)</Radio>
                <Radio value={4}>Trên 20 điếu (Điểm: 4)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="yearsSmoking"
            label="3. Bạn đã hút thuốc được bao nhiêu năm?"
            extra="(Thời gian hút thuốc càng lâu, mức độ nghiện càng cao)"
            rules={[{ required: true, message: 'Vui lòng chọn số năm hút thuốc' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={0}>Dưới 1 năm (Điểm: 0)</Radio>
                <Radio value={1}>1 - 5 năm (Điểm: 1)</Radio>
                <Radio value={2}>6 - 10 năm (Điểm: 2)</Radio>
                <Radio value={3}>Trên 10 năm (Điểm: 3)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Câu hỏi 4-6',
      icon: <HeartOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Đánh giá triệu chứng và cảm nhận</Title>
          
          <Form.Item
            name="withdrawalSymptoms"
            label="4. Bạn có cảm thấy khó chịu khi không hút thuốc trong một thời gian ngắn (ví dụ 1 - 2 giờ)?"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ khó chịu' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={0}>Không có vấn đề gì (Điểm: 0)</Radio>
                <Radio value={2}>Thèm thuốc và cảm thấy khó chịu (Điểm: 2)</Radio>
                <Radio value={3}>Cảm thấy bồn chồn và lo âu (Điểm: 3)</Radio>
                <Radio value={4}>Cảm thấy mệt mỏi và khó tập trung (Điểm: 4)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="stressSmoking"
            label="5. Bạn có hút thuốc khi đang gặp căng thẳng hoặc lo âu không?"
            extra="(Hút thuốc để giảm căng thẳng có thể là dấu hiệu của nghiện)"
            rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={0}>Không bao giờ (Điểm: 0)</Radio>
                <Radio value={1}>Hiếm khi (Điểm: 1)</Radio>
                <Radio value={2}>Thỉnh thoảng (Điểm: 2)</Radio>
                <Radio value={3}>Thường xuyên (Điểm: 3)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="addictionFeeling"
            label="6. Bạn có cảm thấy nghiện thuốc lá không?"
            extra="(Dưới đây là câu hỏi trực tiếp về cảm nhận nghiện thuốc)"
            rules={[{ required: true, message: 'Vui lòng chọn cảm nhận của bạn' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={0}>Không (Điểm: 0)</Radio>
                <Radio value={3}>Có (Điểm: 3)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Câu hỏi 7-10',
      icon: <ClockCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Thói quen và mong muốn thay đổi</Title>
          
          <Form.Item
            name="smokingTime"
            label="7. Bạn có hút thuốc vào các thời điểm nào trong ngày?"
            rules={[{ required: true, message: 'Vui lòng chọn thời điểm hút thuốc' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={1}>Chỉ vào buổi sáng (Điểm: 1)</Radio>
                <Radio value={2}>Chỉ vào buổi chiều (Điểm: 2)</Radio>
                <Radio value={3}>Hút suốt cả ngày (Điểm: 3)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="healthProblems"
            label="8. Bạn có gặp vấn đề sức khỏe nào do hút thuốc không?"
            extra="(Một số bệnh lý có thể chỉ ra mức độ nghiện nặng)"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng sức khỏe' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={0}>Không (Điểm: 0)</Radio>
                <Radio value={1}>Có nhưng chưa ảnh hưởng nhiều (Điểm: 1)</Radio>
                <Radio value={3}>Có và ảnh hưởng tới sức khỏe (Điểm: 3)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="previousAttempts"
            label="9. Bạn đã thử cai thuốc trước đây chưa?"
            rules={[{ required: true, message: 'Vui lòng chọn lịch sử cai thuốc' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={3}>Có, nhưng thất bại (Điểm: 3)</Radio>
                <Radio value={1}>Có, và thành công (Điểm: 1)</Radio>
                <Radio value={0}>Không bao giờ thử (Điểm: 0)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="desireToQuit"
            label="10. Mức độ bạn muốn bỏ thuốc lá là bao nhiêu?"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ mong muốn' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={1}>Rất muốn (Điểm: 1)</Radio>
                <Radio value={2}>Muốn nhưng chưa chắc chắn (Điểm: 2)</Radio>
                <Radio value={3}>Chưa quyết định (Điểm: 3)</Radio>
                <Radio value={4}>Không muốn bỏ (Điểm: 4)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Lý do & Mục tiêu',
      icon: <SmileOutlined />,
      content: (
        <div className="step-content">
          <Title level={4}>Lý do và mục tiêu cai thuốc</Title>
          
          <Form.Item
            name="reasonToQuit"
            label="Lý do cai thuốc:"
            rules={[{ required: true, message: 'Vui lòng nhập lý do cai thuốc' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả lý do tại sao bạn muốn cai thuốc..."
            />
          </Form.Item>

          <Form.Item
            name="goal"
            label="Mục tiêu:"
            rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
          >
            <TextArea
              rows={3}
              placeholder="Đặt mục tiêu cụ thể cho việc cai thuốc..."
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
        return ['startSmokingAge', 'dailySmoking', 'yearsSmoking'];
      case 1:
        return ['withdrawalSymptoms', 'stressSmoking', 'addictionFeeling'];
      case 2:
        return ['smokingTime', 'healthProblems', 'previousAttempts', 'desireToQuit'];
      case 3:
        return ['reasonToQuit', 'goal'];
      default:
        return [];
    }
  };

  const calculateTotalPoints = (values) => {
    const points = [
      values.startSmokingAge || 0,
      values.dailySmoking || 0,
      values.yearsSmoking || 0,
      values.withdrawalSymptoms || 0,
      values.stressSmoking || 0,
      values.addictionFeeling || 0,
      values.smokingTime || 0,
      values.healthProblems || 0,
      values.previousAttempts || 0,
      values.desireToQuit || 0
    ];
    return points.reduce((sum, point) => sum + point, 0);
  };

  const getAddictionLevel = (totalPoints) => {
    if (totalPoints <= 7) return 'Không nghiện';
    if (totalPoints <= 15) return 'Nghiện nhẹ';
    if (totalPoints <= 25) return 'Nghiện trung bình';
    return 'Nghiện nặng';
  };

  const handleSubmit = async () => {
    try {
      // Validate all fields
      await form.validateFields();
      setSubmitting(true);
      // Lấy toàn bộ giá trị form (kể cả các trường không thuộc step hiện tại)
      const values = form.getFieldsValue(true);
      console.log('Form values:', values);

      // Calculate total points based on new scoring system
      const totalPoints = calculateTotalPoints(values);
      const addictionLevel = getAddictionLevel(totalPoints);

      const statusData = {
        point: totalPoints,
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
        // Show congratulations based on addiction level and desire to quit
        if (values.desireToQuit === 1 || totalPoints <= 15) {
          setShowCongrats(true);
        }
        
        message.success(`Cập nhật đánh giá thành công! Tổng điểm: ${totalPoints} - ${addictionLevel}`);
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
              Đánh giá mức độ nghiện thuốc lá
            </Title>
            <Text type="secondary">
              Ngày {moment().format('DD/MM/YYYY')} - Khảo sát 10 câu hỏi để đánh giá mức độ nghiện thuốc
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
              Chúc mừng! Bạn có động lực mạnh mẽ để cai thuốc hoặc mức độ nghiện của bạn không cao. Hãy tiếp tục nỗ lực!
            </Paragraph>
            <Tag color="success" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Kết quả tích cực
            </Tag>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DailyCheckIn;