import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  Divider,
  Alert 
} from 'antd';
import { 
  QuestionCircleOutlined, 
  SendOutlined, 
  UserOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import { answerQuestion } from '../../services/askQuestionService';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AnswerQuestion = ({ question, onAnswerSubmitted, onCancel }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await answerQuestion(question.id, values.answer);
      message.success('Câu trả lời đã được gửi thành công!');
      form.resetFields();
      if (onAnswerSubmitted) {
        onAnswerSubmitted();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi câu trả lời: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!question) {
    return (
      <Card>
        <Alert
          message="Không có câu hỏi"
          description="Vui lòng chọn một câu hỏi để trả lời."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <QuestionCircleOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Trả lời câu hỏi
          </Title>
        </Space>
      }
      extra={
        onCancel && (
          <Button onClick={onCancel}>
            Đóng
          </Button>
        )
      }
    >
      {/* Question Details */}
      <Card 
        size="small" 
        style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong>{question.memberName || 'Thành viên'}</Text>
            <Divider type="vertical" />
            <CalendarOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary">
              {formatDate(question.createdAt)}
            </Text>
          </Space>
          
          <div>
            <Text strong style={{ color: '#1890ff' }}>Câu hỏi:</Text>
            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
              {question.question}
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Existing Answer (if any) */}
      {question.answer && (
        <Alert
          message="Câu hỏi này đã được trả lời"
          description={
            <div>
              <Text strong>Câu trả lời hiện tại:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 8 }}>
                {question.answer}
              </Paragraph>
              <Text type="secondary">
                Trả lời lúc: {formatDate(question.answeredAt)}
              </Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Answer Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="answer"
          label={question.answer ? "Cập nhật câu trả lời" : "Câu trả lời của bạn"}
          rules={[
            { required: true, message: 'Vui lòng nhập câu trả lời!' },
            { min: 10, message: 'Câu trả lời phải có ít nhất 10 ký tự!' },
            { max: 2000, message: 'Câu trả lời không được vượt quá 2000 ký tự!' }
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập câu trả lời chi tiết và hữu ích cho thành viên..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              icon={<SendOutlined />}
              size="large"
            >
              {isSubmitting 
                ? 'Đang gửi...' 
                : question.answer 
                  ? 'Cập nhật câu trả lời' 
                  : 'Gửi câu trả lời'
              }
            </Button>
            {onCancel && (
              <Button size="large" onClick={onCancel}>
                Hủy
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AnswerQuestion;
