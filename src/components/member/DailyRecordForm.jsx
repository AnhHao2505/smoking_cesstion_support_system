import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Radio, Slider, InputNumber, 
  Typography, message, Row, Col, Select, Switch, Alert
} from 'antd';
import { 
  SaveOutlined, BarChartOutlined, MedicineBoxOutlined, 
  SmileOutlined, FireOutlined, HeartOutlined
} from '@ant-design/icons';
import { createDailyLog } from '../../services/dailylogService';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../utils/auth';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DailyRecordForm = ({ onSuccess, phaseId }) => {
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Get userId from auth context
  const userId = currentUser?.userId || getCurrentUser()?.userId;

  const cravingLevelOptions = [
    { value: 'none', label: 'Không thèm' },
    { value: 'low', label: 'Thèm nhẹ' },
    { value: 'moderate', label: 'Thèm vừa' },
    { value: 'high', label: 'Thèm nhiều' },
    { value: 'very_high', label: 'Thèm rất nhiều' }
  ];

  const emotionOptions = [
    { value: 'very_happy', label: 'Rất vui' },
    { value: 'happy', label: 'Vui' },
    { value: 'neutral', label: 'Bình thường' },
    { value: 'sad', label: 'Buồn' },
    { value: 'anxious', label: 'Lo lắng' },
    { value: 'stressed', label: 'Căng thẳng' }
  ];

  // Custom validation functions
  const validateCigaretteCount = (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.reject(new Error('Số điếu thuốc không được để trống'));
    }
    if (value < 0) {
      return Promise.reject(new Error('Số điếu thuốc không thể âm'));
    }
    if (value > 100) {
      return Promise.reject(new Error('Số điếu thuốc không thể vượt quá 100'));
    }
    return Promise.resolve();
  };

  const validateTargetCount = (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.reject(new Error('Mục tiêu không được để trống'));
    }
    if (value < 0) {
      return Promise.reject(new Error('Mục tiêu không thể âm'));
    }
    const currentCigarettes = form.getFieldValue('cigarettesConsumed') || 0;
    if (value > currentCigarettes) {
      return Promise.reject(new Error('Mục tiêu ngày mai nên ít hơn hoặc bằng số điếu hôm nay'));
    }
    return Promise.resolve();
  };

  const validatePositiveAffirmation = (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject(new Error('Khẳng định tích cực không được để trống'));
    }
    if (value && value.length > 500) {
      return Promise.reject(new Error('Khẳng định tích cực không được vượt quá 500 ký tự'));
    }
    return Promise.resolve();
  };

  const validateAlternativeActivity = (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject(new Error('Hoạt động thay thế không được để trống'));
    }
    if (value && value.length > 300) {
      return Promise.reject(new Error('Hoạt động thay thế không được vượt quá 300 ký tự'));
    }
    return Promise.resolve();
  };

  const validatePrideToday = (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject(new Error('Chia sẻ điều tự hào không được để trống'));
    }
    if (value && value.length > 500) {
      return Promise.reject(new Error('Chia sẻ điều tự hào không được vượt quá 500 ký tự'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Additional frontend validation
      if (values.cigarettesConsumed > 50) {
        message.warning('Bạn đã hút quá nhiều thuốc lá hôm nay. Hãy cân nhắc tìm kiếm sự hỗ trợ chuyên nghiệp.');
      }

      if (values.cigarettesTomorrowTarget > values.cigarettesConsumed) {
        message.error('Mục tiêu ngày mai nên ít hơn hoặc bằng số điếu hôm nay để có tiến bộ tích cực.');
        setSubmitting(false);
        return;
      }

      // Check required fields
      if (!values.morningCravingLevel || values.morningCravingLevel === '') {
        message.error('Vui lòng chọn mức độ thèm thuốc buổi sáng');
        setSubmitting(false);
        return;
      }

      if (!values.noonEmotion || values.noonEmotion === '') {
        message.error('Vui lòng chọn cảm xúc buổi trưa');
        setSubmitting(false);
        return;
      }

      if (!values.eveningCravingLevel || values.eveningCravingLevel === '') {
        message.error('Vui lòng chọn mức độ thèm thuốc buổi tối');
        setSubmitting(false);
        return;
      }

      if (values.cigarettesConsumed === null || values.cigarettesConsumed === undefined) {
        message.error('Vui lòng nhập số điếu thuốc đã hút');
        setSubmitting(false);
        return;
      }

      if (values.cigarettesTomorrowTarget === null || values.cigarettesTomorrowTarget === undefined) {
        message.error('Vui lòng đặt mục tiêu cho ngày mai');
        setSubmitting(false);
        return;
      }

      const logData = {
        morningWaterDrinked: values.morningWaterDrinked || false,
        consumedMedicine: values.consumedMedicine || false,
        positiveAffirmation: values.positiveAffirmation || "",
        morningCravingLevel: values.morningCravingLevel || "none",
        noonEmotion: values.noonEmotion || "neutral",
        noonWaterDrinked: values.noonWaterDrinked || false,
        goOutsideForFreshAir: values.goOutsideForFreshAir || false,
        noonAlternativeActivity: values.noonAlternativeActivity || "",
        prideToday: values.prideToday || "",
        eveningCravingLevel: values.eveningCravingLevel || "none",
        cigarettesConsumed: values.cigarettesConsumed || 0,
        cigarettesTomorrowTarget: values.cigarettesTomorrowTarget || 0,
        phaseId: phaseId || 0
      };

      const response = await createDailyLog(logData);
      if (response.success) {
        message.success(response.message || "Daily log saved successfully");
        form.resetFields();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        message.error(response.message || "Failed to save daily log");
      }
    } catch (error) {
      console.error("Error submitting daily log:", error);
      message.error("An error occurred while saving your daily log");
    } finally {
      setSubmitting(false);
    }
  };

  // State to track warning for cigarettesConsumed
  const [showCigaretteWarning, setShowCigaretteWarning] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  // Handler for cigarettesConsumed change
  const handleCigarettesConsumedChange = (value) => {
    setShowCigaretteWarning(value >= 10);
    form.setFieldsValue({ cigarettesConsumed: value });
    
    // Auto-suggest target for tomorrow
    if (value > 0) {
      const suggestedTarget = Math.max(0, value - 1);
      form.setFieldsValue({ cigarettesTomorrowTarget: suggestedTarget });
    }
  };

  // Form validation errors handler
  const handleFormFinishFailed = (errorInfo) => {
    setFormErrors(errorInfo.errorFields.map(field => field.errors[0]));
    message.error('Vui lòng kiểm tra và sửa các lỗi trong form');
  };

  // Clear form errors when form changes
  useEffect(() => {
    const handleFormChange = () => {
      if (formErrors.length > 0) {
        setFormErrors([]);
      }
    };
    
    form.getFieldsError().forEach(field => {
      if (field.errors.length === 0 && formErrors.length > 0) {
        setFormErrors([]);
      }
    });
  }, [form, formErrors]);

  // Check if user is authenticated
  if (!userId) {
    return (
      <div className="daily-record-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card className="daily-record-form">
          <Title level={3}>Nhật ký sức khỏe hàng ngày</Title>
          <Paragraph type="warning">
            Vui lòng đăng nhập để truy cập nhật ký sức khỏe hàng ngày.
          </Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div className="daily-record-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card className="daily-record-form">
        <Title level={3}>Nhật ký sức khỏe hàng ngày</Title>
        <Paragraph>
          Theo dõi tiến trình của bạn và giúp chúng tôi hỗ trợ tốt hơn bằng cách hoàn thành bản kiểm tra sức khỏe hàng ngày này.
        </Paragraph>

        <Alert
          message="Hướng dẫn điền form"
          description="Vui lòng điền đầy đủ thông tin một cách trung thực để chúng tôi có thể hỗ trợ bạn tốt nhất. Các trường có dấu (*) là BẮT BUỘC và không được để trống."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={handleFormFinishFailed}
          validateTrigger={['onBlur', 'onChange']}
          scrollToFirstError
          initialValues={{
            morningWaterDrinked: false,
            consumedMedicine: false,
            positiveAffirmation: undefined, // Force user to enter
            morningCravingLevel: undefined, // Force user to select
            noonEmotion: undefined, // Force user to select
            noonWaterDrinked: false,
            goOutsideForFreshAir: false,
            noonAlternativeActivity: undefined, // Force user to enter
            prideToday: undefined, // Force user to enter
            eveningCravingLevel: undefined, // Force user to select
            cigarettesConsumed: undefined, // Force user to enter
            cigarettesTomorrowTarget: undefined // Force user to enter
          }}
        >

        {/* Error Summary */}
        {formErrors.length > 0 && (
          <Alert
            message="Form có lỗi"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {/* Morning Section */}
        <Card type="inner" title="Kiểm tra buổi sáng" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="morningWaterDrinked"
                label="Bạn có uống nước khi thức dậy không?"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Có" 
                  unCheckedChildren="Không" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="consumedMedicine"
                label="Bạn có uống thuốc không?"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Có" 
                  unCheckedChildren="Không" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="positiveAffirmation"
            label="Khẳng định tích cực cho ngày hôm nay *"
            rules={[
              { required: true, message: 'Vui lòng nhập khẳng định tích cực' },
              { validator: validatePositiveAffirmation }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Viết một lời khẳng định tích cực để bắt đầu ngày mới..."
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item
            name="morningCravingLevel"
            label="Mức độ thèm thuốc buổi sáng *"
            rules={[
              { required: true, message: 'Vui lòng chọn mức độ thèm thuốc buổi sáng' },
              { 
                validator: (_, value) => {
                  if (!value || value === '') {
                    return Promise.reject(new Error('Mức độ thèm thuốc buổi sáng không được để trống'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select placeholder="Chọn mức độ thèm thuốc buổi sáng">
              {cravingLevelOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        {/* Noon Section */}
        <Card type="inner" title="Kiểm tra buổi trưa" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="noonEmotion"
                label="Bạn cảm thấy thế nào vào buổi trưa? *"
                rules={[
                  { required: true, message: 'Vui lòng chọn cảm xúc buổi trưa' },
                  { 
                    validator: (_, value) => {
                      if (!value || value === '') {
                        return Promise.reject(new Error('Cảm xúc buổi trưa không được để trống'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Select placeholder="Chọn cảm xúc của bạn">
                  {emotionOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="noonWaterDrinked"
                label="Bạn có uống nước vào buổi trưa không?"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Có" 
                  unCheckedChildren="Không" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="goOutsideForFreshAir"
                label="Bạn có ra ngoài hít thở không khí trong lành không?"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Có" 
                  unCheckedChildren="Không" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="noonAlternativeActivity"
            label="Hoạt động thay thế (thay vì hút thuốc) *"
            rules={[
              { required: true, message: 'Vui lòng nhập hoạt động thay thế' },
              { validator: validateAlternativeActivity }
            ]}
          >
            <TextArea 
              rows={2} 
              placeholder="Bạn đã làm gì thay vì hút thuốc?"
              showCount
              maxLength={300}
            />
          </Form.Item>
        </Card>

        {/* Evening Section */}
        <Card type="inner" title="Suy ngẫm buổi tối" style={{ marginBottom: 16 }}>
          <Form.Item
            name="prideToday"
            label="Bạn tự hào về điều gì trong ngày hôm nay? *"
            rules={[
              { required: true, message: 'Vui lòng chia sẻ điều bạn tự hào hôm nay' },
              { validator: validatePrideToday }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Suy ngẫm về điều gì khiến bạn tự hào trong ngày hôm nay..."
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item
            name="eveningCravingLevel"
            label="Mức độ thèm thuốc buổi tối *"
            rules={[
              { required: true, message: 'Vui lòng chọn mức độ thèm thuốc buổi tối' },
              { 
                validator: (_, value) => {
                  if (!value || value === '') {
                    return Promise.reject(new Error('Mức độ thèm thuốc buổi tối không được để trống'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select placeholder="Chọn mức độ thèm thuốc buổi tối">
              {cravingLevelOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        {/* Daily Summary */}
        <Card type="inner" title="Tóm tắt ngày" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="cigarettesConsumed"
                label="Số điếu thuốc đã hút hôm nay *"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điếu thuốc đã hút' },
                  { validator: validateCigaretteCount },
                  { 
                    validator: (_, value) => {
                      if (value === null || value === undefined || value === '') {
                        return Promise.reject(new Error('Số điếu thuốc không được để trống'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%' }}
                  prefix={<FireOutlined />}
                  onChange={handleCigarettesConsumedChange}
                  placeholder="Nhập số điếu thuốc"
                />
              </Form.Item>
              {showCigaretteWarning && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  ⚠️ Bạn đang lạm dụng thuốc lá. Hãy tìm kiếm sự hỗ trợ!
                </Typography.Text>
              )}
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="cigarettesTomorrowTarget"
                label="Mục tiêu cho ngày mai *"
                rules={[
                  { required: true, message: 'Vui lòng đặt mục tiêu cho ngày mai' },
                  { validator: validateTargetCount },
                  { 
                    validator: (_, value) => {
                      if (value === null || value === undefined || value === '') {
                        return Promise.reject(new Error('Mục tiêu cho ngày mai không được để trống'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%' }}
                  placeholder="Mục tiêu cho ngày mai"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={submitting}
            size="large"
            style={{ width: '100%' }}
          >
            Lưu nhật ký hàng ngày
          </Button>
        </Form.Item>
      </Form>
    </Card>
    </div>
  );
};

export default DailyRecordForm;