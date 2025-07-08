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
      title: 'Member',
      dataIndex: 'memberName',
      key: 'memberName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text || 'Anonymous Member'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.memberId || 'N/A'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Question',
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
      title: 'Created',
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
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Unanswered
          </Tag>
          {isOverdue(record.deadline) && (
            <Tag color="red" icon={<ClockCircleOutlined />}>
              Overdue
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={() => handleAnswerQuestion(record)}
        >
          Answer
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
                <MessageOutlined /> Questions & Answers
              </Title>
              <Text type="secondary">
                Manage and respond to member questions
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchQuestions}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Total Unanswered</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {pagination.total}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Overdue Questions</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {questions.filter(q => isOverdue(q.deadline)).length}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Response Rate</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    85%
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
                `${range[0]}-${range[1]} of ${total} questions`
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
              <span>Answer Question</span>
              {selectedQuestion && isOverdue(selectedQuestion.deadline) && (
                <Tag color="red">Overdue</Tag>
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
                    <Text strong>{selectedQuestion.memberName || 'Anonymous Member'}</Text>
                    <Divider type="vertical" />
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">
                      {formatDate(selectedQuestion.createdAt)}
                    </Text>
                  </Space>
                  
                  <div>
                    <Text strong style={{ color: '#1890ff' }}>Question:</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {selectedQuestion.question}
                    </Paragraph>
                  </div>
                </Space>
              </Card>

              {/* Priority Alert for Overdue */}
              {isOverdue(selectedQuestion.deadline) && (
                <Alert
                  message="Overdue Question"
                  description="This question is overdue and requires immediate attention."
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
                  label="Your Answer"
                  rules={[
                    { required: true, message: 'Please provide an answer!' },
                    { min: 10, message: 'Answer must be at least 10 characters!' },
                    { max: 2000, message: 'Answer cannot exceed 2000 characters!' }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Provide a detailed and helpful answer for the member..."
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
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                    <Button 
                      size="large" 
                      onClick={() => {
                        setAnswerModalVisible(false);
                        setSelectedQuestion(null);
                        form.resetFields();
                      }}
                    >
                      Cancel
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
