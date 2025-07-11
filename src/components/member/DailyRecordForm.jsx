import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Radio, Slider, InputNumber, 
  Typography, message, Row, Col, Select, Switch
} from 'antd';
import { 
  SaveOutlined, BarChartOutlined, MedicineBoxOutlined, 
  SmileOutlined, FireOutlined, HeartOutlined
} from '@ant-design/icons';
import { createDailyLog } from '../../services/dailylogService';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DailyRecordForm = ({ userId, onSuccess, phaseId }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const cravingLevelOptions = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' }
  ];

  const emotionOptions = [
    { value: 'very_happy', label: 'Very Happy' },
    { value: 'happy', label: 'Happy' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'sad', label: 'Sad' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'stressed', label: 'Stressed' }
  ];

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
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

  return (
    <Card className="daily-record-form">
      <Title level={3}>Daily Wellness Check-in</Title>
      <Paragraph>
        Track your progress and help us provide better support by completing this daily check-in.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          morningWaterDrinked: false,
          consumedMedicine: false,
          positiveAffirmation: '',
          morningCravingLevel: 'none',
          noonEmotion: 'neutral',
          noonWaterDrinked: false,
          goOutsideForFreshAir: false,
          noonAlternativeActivity: '',
          prideToday: '',
          eveningCravingLevel: 'none',
          cigarettesConsumed: 0,
          cigarettesTomorrowTarget: 0
        }}
      >
        {/* Morning Section */}
        <Card type="inner" title="Morning Check-in" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="morningWaterDrinked"
                label="Did you drink water this morning?"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="consumedMedicine"
                label="Did you take your medicine?"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="positiveAffirmation"
                label="Positive Affirmation for Today"
                rules={[{ required: true, message: 'Please enter your positive affirmation' }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Write a positive affirmation to start your day..."
                  prefix={<HeartOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="morningCravingLevel"
                label="Morning Craving Level"
                rules={[{ required: true, message: 'Please select your morning craving level' }]}
              >
                <Select placeholder="How strong are your cravings this morning?">
                  {cravingLevelOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Noon Section */}
        <Card type="inner" title="Noon Check-in" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="noonEmotion"
                label="How are you feeling at noon?"
                rules={[{ required: true, message: 'Please select your noon emotion' }]}
              >
                <Select placeholder="Select your emotion">
                  {emotionOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="noonWaterDrinked"
                label="Did you drink water at noon?"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="goOutsideForFreshAir"
                label="Did you go outside for fresh air?"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="noonAlternativeActivity"
                label="Alternative Activity at Noon"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="What alternative activity did you do instead of smoking?"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Evening Section */}
        <Card type="inner" title="Evening Reflection" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="prideToday"
                label="What are you proud of today?"
                rules={[{ required: true, message: 'Please share what you are proud of today' }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Reflect on your achievements today..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="eveningCravingLevel"
                label="Evening Craving Level"
                rules={[{ required: true, message: 'Please select your evening craving level' }]}
              >
                <Select placeholder="How strong are your cravings this evening?">
                  {cravingLevelOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Daily Summary */}
        <Card type="inner" title="Daily Summary" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="cigarettesConsumed"
                label="Cigarettes Consumed Today"
                rules={[{ required: true, message: 'Please enter number of cigarettes consumed' }]}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%' }}
                  prefix={<FireOutlined />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="cigarettesTomorrowTarget"
                label="Target for Tomorrow"
                rules={[{ required: true, message: 'Please set your target for tomorrow' }]}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%' }}
                  placeholder="Goal for tomorrow"
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
            block
            size="large"
          >
            Save Today's Daily Log
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DailyRecordForm;