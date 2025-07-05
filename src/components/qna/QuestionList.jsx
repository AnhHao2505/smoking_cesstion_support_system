import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Tag, Space, Avatar, Button, Empty, Spin, message } from 'antd';
import { 
  QuestionCircleOutlined, 
  CheckCircleFilled, 
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import { getAllQna, getQnaOfMember, getQnaByCoach } from '../../services/askQuestionService';
import { initResizeObserverErrorHandler } from '../../utils/resizeObserverErrorHandler';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Title, Text, Paragraph } = Typography;

// Initialize ResizeObserver error handling
initResizeObserverErrorHandler();

const QuestionList = ({ filterBy = 'all', onQuestionSelect, refreshTrigger }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [filterBy, refreshTrigger]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let response;
      switch (filterBy) {
        case 'member':
          // Get all questions from current member (MINE endpoint)
          console.log('Calling getQnaOfMember');
          response = await getQnaOfMember();
          break;
        case 'coach':
          // Get only unanswered questions for coach to answer (UNANSWERED endpoint)
          response = await getQnaByCoach();
          break;
        case 'unanswered':
          // Get all unanswered questions (UNANSWERED endpoint)
          response = await getAllQna();
          break;
        default:
          // Default to getting all unanswered questions
          response = await getAllQna();
      }
      
      // Handle different response structures
      let questionsData = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        questionsData = response;
      } else if (response?.content && Array.isArray(response.content)) {
        // Paginated response with content field
        questionsData = response.content;
      } else if (response?.data) {
        // Response with data field
        if (Array.isArray(response.data)) {
          questionsData = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          questionsData = response.data.content;
        }
      }
      
      setQuestions(questionsData);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách câu hỏi: ' + error.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (question) => {
    if (question.answer) {
      return <Tag color="success" icon={<CheckCircleFilled />}>Đã trả lời</Tag>;
    }
    return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ trả lời</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const renderQuestionItem = (item) => {
    const actions = [];
    
    // Only show action button if onQuestionSelect is provided and filterBy is not 'member'
    if (onQuestionSelect && filterBy !== 'member') {
      actions.push(
        <Button 
          key="action"
          type={item.answer ? "default" : "primary"} 
          onClick={() => onQuestionSelect(item)}
        >
          {item.answer ? 'Xem chi tiết' : 'Trả lời'}
        </Button>
      );
    }

    return (
      <List.Item actions={actions}>
        <List.Item.Meta
          avatar={
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
          }
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Text strong>{item.memberName || 'Thành viên'}</Text>
                {getStatusTag(item)}
              </Space>
              <Space size={4}>
                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatDate(item.createdAt)}
                </Text>
              </Space>
            </Space>
          }
          description={
            <div>
            <Paragraph 
              ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
              style={{ marginBottom: 8 }}
            >
              <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {item.question}
            </Paragraph>
            {item.answer && (
              <Paragraph 
                ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
                style={{ 
                  backgroundColor: '#f6ffed', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  borderLeft: '3px solid #52c41a',
                  marginTop: 8 
                }}
              >
                <Text strong style={{ color: '#52c41a' }}>Trả lời: </Text>
                {item.answer}
              </Paragraph>
            )}
            {item.answeredAt && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Trả lời lúc: {formatDate(item.answeredAt)}
              </Text>
            )}
          </div>
        }
      />
    </List.Item>
    );
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>
            Đang tải danh sách câu hỏi...
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <QuestionCircleOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {filterBy === 'member' ? 'Câu hỏi của tôi' : 
             filterBy === 'coach' ? 'Câu hỏi cần trả lời' : 
             filterBy === 'unanswered' ? 'Câu hỏi chưa trả lời' :
             'Danh sách câu hỏi'}
            {Array.isArray(questions) && questions.length > 0 && (
              <Text type="secondary" style={{ fontWeight: 'normal' }}>
                {' '}({questions.length} câu hỏi)
              </Text>
            )}
          </Title>
        </Space>
      }
      extra={
        <Button onClick={fetchQuestions} loading={loading}>
          Làm mới
        </Button>
      }
    >
      {!Array.isArray(questions) || questions.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {filterBy === 'member' 
                ? 'Bạn chưa có câu hỏi nào'
                : filterBy === 'coach'
                ? 'Chưa có câu hỏi nào để trả lời'
                : filterBy === 'unanswered'
                ? 'Chưa có câu hỏi nào chưa được trả lời'
                : 'Chưa có câu hỏi nào trong hệ thống'
              }
            </span>
          }
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={Array.isArray(questions) ? questions : []}
          renderItem={renderQuestionItem}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} câu hỏi`,
          }}
        />
      )}
    </Card>
  );
};

export default QuestionList;
