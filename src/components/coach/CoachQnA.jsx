import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  message,
  Badge,
  Alert,
  Spin,
  Row,
  Col,
  Divider
} from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUnansweredQna, answerQuestion } from '../../services/askQuestionService';
import { useLocation } from 'react-router-dom';
import '../../styles/QnA.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CoachQnA = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Get questionId from URL params if available
  const urlParams = new URLSearchParams(location.search);
  const questionIdFromUrl = urlParams.get('questionId');

  useEffect(() => {
    fetchQuestions();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    // If questionId is provided in URL, find and open that question for answering
    if (questionIdFromUrl && questions.length > 0) {
      const question = questions.find(q => q.id === parseInt(questionIdFromUrl));
      if (question) {
        handleAnswerQuestion(question);
      }
    }
  }, [questionIdFromUrl, questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getUnansweredQna(pagination.current - 1, pagination.pageSize);
      
      if (response && response.content) {
        setQuestions(response.content);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswerModalVisible(true);
    form.resetFields();
  };

  const handleSubmitAnswer = async (values) => {
    if (!selectedQuestion) return;

    try {
      setSubmitting(true);
      await answerQuestion(selectedQuestion.id, values.answer);
      
      message.success('Answer submitted successfully!');
      setAnswerModalVisible(false);
      setSelectedQuestion(null);
      form.resetFields();
      
      // Refresh the questions list
      await fetchQuestions();
      
      // Clear URL params if question was answered from URL
      if (questionIdFromUrl) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      message.error('Failed to submit answer: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const columns = [
    {
      title: 'Thành viên hỏi',
      dataIndex: 'memberName',
      key: 'memberName',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text || 'Ẩn danh'}</Text>
            <br />
          </div>
        </Space>
      )
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (text) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {text}
        </Paragraph>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined />
            <Text type="secondary">{formatDate(date)}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Chưa trả lời
          </Tag>
          {isOverdue(record.deadline) && (
            <Tag color="red" icon={<ClockCircleOutlined />}>
              Quá hạn
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={() => handleAnswerQuestion(record)}
        >
          Trả lời
        </Button>
      )
    }
  ];

  return (
    <Layout.Content style={{ padding: '24px' }}>
      <div className="coach-qna-container">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <MessageOutlined /> Hỏi đáp thành viên
              </Title>
              <Text type="secondary">
                Quản lý và trả lời câu hỏi của thành viên
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchQuestions}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Tổng số chưa trả lời</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {pagination.total}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Câu hỏi quá hạn</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {questions.filter(q => isOverdue(q.deadline)).length}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Questions Table */}
          <Table
            columns={columns}
            dataSource={questions}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} trong ${total} câu hỏi`
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Answer Modal */}
        <Modal
          title={
            <Space>
              <MessageOutlined />
              <span>Trả lời câu hỏi</span>
              {selectedQuestion && isOverdue(selectedQuestion.deadline) && (
                <Tag color="red">Quá hạn</Tag>
              )}
            </Space>
          }
          open={answerModalVisible}
          onCancel={() => {
            setAnswerModalVisible(false);
            setSelectedQuestion(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
          destroyOnClose
        >
          {selectedQuestion && (
            <>
              {/* Question Details */}
              <Card 
                size="small" 
                style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{selectedQuestion.memberName || 'Ẩn danh'}</Text>
                    <Divider type="vertical" />
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">
                      {formatDate(selectedQuestion.createdAt)}
                    </Text>
                  </Space>
                  
                  <div>
                    <Text strong style={{ color: '#1890ff' }}>Câu hỏi:</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {selectedQuestion.question}
                    </Paragraph>
                  </div>
                </Space>
              </Card>

              {/* Priority Alert for Overdue */}
              {isOverdue(selectedQuestion.deadline) && (
                <Alert
                  message="Câu hỏi quá hạn"
                  description="Câu hỏi này đã quá hạn và cần được trả lời ngay."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Answer Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitAnswer}
                requiredMark={false}
              >
                <Form.Item
                  name="answer"
                  label="Câu trả lời của bạn"
                  rules={[
                    { required: true, message: 'Vui lòng nhập câu trả lời!' },
                    { min: 10, message: 'Câu trả lời phải có ít nhất 10 ký tự!' },
                    { max: 2000, message: 'Câu trả lời không vượt quá 2000 ký tự!' }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập câu trả lời chi tiết và hữu ích cho thành viên..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      icon={<SendOutlined />}
                      size="large"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                    </Button>
                    <Button 
                      size="large" 
                      onClick={() => {
                        setAnswerModalVisible(false);
                        setSelectedQuestion(null);
                        form.resetFields();
                      }}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>
      </div>
    </Layout.Content>
  );
};

export default CoachQnA;
