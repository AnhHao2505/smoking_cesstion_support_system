import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Radio, Slider, InputNumber, 
  Typography, message, Row, Col, Select
} from 'antd';
import { 
  SaveOutlined, BarChartOutlined, MedicineBoxOutlined, 
  SmileOutlined, FireOutlined
} from '@ant-design/icons';
import { addDailyRecord } from '../../services/quitProgressService';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DailyRecordForm = ({ userId, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const healthOptions = [
    { value: 'good', label: 'Good', color: '#52c41a' },
    { value: 'normal', label: 'Normal', color: '#1890ff' },
    { value: 'poor', label: 'Poor', color: '#faad14' },
    { value: 'very_poor', label: 'Very Poor', color: '#f5222d' }
  ];

  const activityOptions = [
    { value: 'good', label: 'Good (30+ minutes)', color: '#52c41a' },
    { value: 'average', label: 'Average (10-30 minutes)', color: '#1890ff' },
    { value: 'poor', label: 'Poor (Less than 10 minutes)', color: '#faad14' }
  ];

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await addDailyRecord(userId, values);
      if (response.success) {
        message.success(response.message);
        form.resetFields();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        message.error(response.message || "Failed to save record");
      }
    } catch (error) {
      console.error("Error submitting daily record:", error);
      message.error("An error occurred while saving your record");
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
          daily_cigarette_consumed: 0,
          stress_level: 5,
          cravings_intensity: 5,
          overall_health: 'normal',
          mental_wellbeing_score: 5,
          physical_activity_duration: 'average',
          sleep_duration: 7
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="daily_cigarette_consumed"
              label="Cigarettes Smoked Today"
              rules={[{ required: true, message: 'Please enter number of cigarettes' }]}
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
              name="overall_health"
              label="Overall Health Today"
              rules={[{ required: true, message: 'Please select your overall health' }]}
            >
              <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                {healthOptions.map(option => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    style={{ width: '25%', textAlign: 'center' }}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="stress_level"
              label="Stress Level (1-10)"
              rules={[{ required: true, message: 'Please rate your stress level' }]}
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: '1',
                  5: '5',
                  10: '10'
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="cravings_intensity"
              label="Cravings Intensity (1-10)"
              rules={[{ required: true, message: 'Please rate your cravings' }]}
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: '1',
                  5: '5',
                  10: '10'
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="mental_wellbeing_score"
              label="Mental Wellbeing (1-10)"
              rules={[{ required: true, message: 'Please rate your mental wellbeing' }]}
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: '1',
                  5: '5',
                  10: '10'
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="physical_activity_duration"
              label="Physical Activity Today"
              rules={[{ required: true, message: 'Please select your activity level' }]}
            >
              <Select>
                {activityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="sleep_duration"
              label="Hours of Sleep Last Night"
              rules={[{ required: true, message: 'Please enter sleep duration' }]}
            >
              <InputNumber min={0} max={24} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="diet_quality"
              label="Diet Quality Today"
            >
              <Select placeholder="How was your diet today?">
                <Option value="healthy">Healthy</Option>
                <Option value="moderate">Moderate</Option>
                <Option value="poor">Poor</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="physical_symptoms"
          label="Physical Symptoms (if any)"
        >
          <Input placeholder="Headache, coughing, etc." prefix={<MedicineBoxOutlined />} />
        </Form.Item>

        <Form.Item
          name="self_reflection"
          label="Self-Reflection"
        >
          <TextArea 
            rows={4} 
            placeholder="How are you feeling about your quit journey today? Any challenges or victories to note?"
          />
        </Form.Item>

        <Form.Item
          name="additional_notes"
          label="Additional Notes"
        >
          <TextArea rows={2} placeholder="Any additional notes..." />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={submitting}
            block
          >
            Save Today's Record
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DailyRecordForm;