import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { QuestionCircleOutlined, SendOutlined } from '@ant-design/icons';
import { askQuestion } from '../../services/askQuestionService';
import { initResizeObserverErrorHandler } from '../../utils/resizeObserverErrorHandler';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Initialize ResizeObserver error handling
initResizeObserverErrorHandler();

const AskQuestion = ({ onQuestionSubmitted }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await askQuestion(values.question);
      message.success('Câu hỏi của bạn đã được gửi thành công!');
      form.resetFields();
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi câu hỏi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <QuestionCircleOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Đặt câu hỏi
          </Title>
        </Space>
      }
      className="ask-question-card"
    >
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Bạn có thắc mắc gì về quá trình cai thuốc lá? Hãy đặt câu hỏi và chúng tôi sẽ hỗ trợ bạn!
      </Text>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="question"
          label="Câu hỏi của bạn"
          rules={[
            { required: true, message: 'Vui lòng nhập câu hỏi!' },
            { min: 10, message: 'Câu hỏi phải có ít nhất 10 ký tự!' },
            { max: 1000, message: 'Câu hỏi không được vượt quá 1000 ký tự!' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập câu hỏi của bạn tại đây..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            icon={<SendOutlined />}
            size="large"
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AskQuestion;
