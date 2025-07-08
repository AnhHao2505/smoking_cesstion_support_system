import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Tabs, 
  Button, 
  Space, 
  Typography, 
  Card,
  Statistic,
  Badge 
} from 'antd';
import { 
  QuestionCircleOutlined, 
  PlusOutlined, 
  CheckCircleFilled,
  ClockCircleOutlined
} from '@ant-design/icons';
import AskQuestion from './AskQuestion';
import QuestionList from './QuestionList';
import AnswerQuestion from './AnswerQuestion';
import { getAllQna, getQnaOfMember, getQnaByCoach } from '../../services/askQuestionService';
import { useAuth } from '../../contexts/AuthContext';
import { initResizeObserverErrorHandler } from '../../utils/resizeObserverErrorHandler';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Title } = Typography;
const { TabPane } = Tabs;

// Initialize ResizeObserver error handling
initResizeObserverErrorHandler();

const QAForum = () => {
  const { currentUser } = useAuth();
  
  // Set default tab based on user role
  const getDefaultTab = () => {
    if (!currentUser) return 'my-questions';
    return currentUser.role === 'COACH' ? 'to-answer' : 'my-questions';
  };
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('my-questions');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    answered: 0,
    pending: 0
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchStats();
      // Update active tab based on user role
      setActiveTab(currentUser.role === 'COACH' ? 'to-answer' : 'my-questions');
    }
  }, [currentUser]);

  const fetchStats = async () => {
    console.log('QAForum fetchStats called', { currentUserId: currentUser?.id, role: currentUser?.role });
    
    if (!currentUser?.id) {
      console.log('No currentUser.id in fetchStats, skipping');
      return;
    }
    
    try {
      let response;
      
      // Fetch stats based on user role
      if (currentUser?.role === 'MEMBER') {
        // For members, get their own questions (both answered and unanswered)
        console.log('Fetching member questions for stats');
        response = await getQnaOfMember();
      } else if (currentUser?.role === 'COACH') {
        // For coaches, get unanswered questions assigned to them
        console.log('Fetching coach questions for stats');
        response = await getQnaByCoach();
      } else {
        // For others, get all unanswered questions (admin)
        console.log('Fetching all questions for stats');
        response = await getAllQna();
      }
      
      console.log('QAForum stats API response:', response);
      
      // Handle paginated response structure
      let questions = [];
      if (Array.isArray(response)) {
        questions = response;
      } else if (response?.content && Array.isArray(response.content)) {
        questions = response.content;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          questions = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          questions = response.data.content;
        }
      }
      
      console.log('QAForum processed questions for stats:', questions);
      
      // Calculate stats based on context
      if (currentUser?.role === 'MEMBER') {
        // For members: count their own questions
        const answered = questions.filter(q => q.answer).length;
        setStats({
          total: questions.length,
          answered: answered,
          pending: questions.length - answered
        });
      } else if (currentUser?.role === 'COACH') {
        // For coaches: all returned questions are unanswered (pending)
        setStats({
          total: questions.length,
          answered: 0, // API only returns unanswered questions
          pending: questions.length
        });
      } else {
        // For admin: all returned questions are unanswered
        setStats({
          total: questions.length,
          answered: 0,
          pending: questions.length
        });
      }
    } catch (error) {
      console.error('Error fetching stats in QAForum:', error);
      // Reset stats on error
      setStats({
        total: 0,
        answered: 0,
        pending: 0
      });
    }
  };

  const handleQuestionSubmitted = () => {
    setShowAskForm(false);
    fetchStats();
    // Trigger refresh for QuestionList
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAnswerSubmitted = () => {
    setSelectedQuestion(null);
    fetchStats();
    // Trigger refresh for QuestionList
    setRefreshTrigger(prev => prev + 1);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    if (currentUser?.role === 'COACH' && !question.answer) {
      setActiveTab('answer');
    } else if (question.answer) {
      // Just show the question details for answered questions
      setActiveTab('my-questions');
    }
  };

  const renderStatsCards = () => {
    const isMember = currentUser?.role === 'MEMBER';
    const isCoach = currentUser?.role === 'COACH';
    
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={isMember ? "Câu hỏi của tôi" : isCoach ? "Cần trả lời" : "Tổng câu hỏi"}
              value={stats.total}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        {isMember && (
          <>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đã trả lời"
                  value={stats.answered}
                  prefix={<CheckCircleFilled />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Chờ trả lời"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </>
        )}
        {isCoach && (
          <>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đã xử lý hôm nay"
                  value={0} // Would need separate API to track this
                  prefix={<CheckCircleFilled />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Ưu tiên cao"
                  value={stats.pending} // Assuming all pending are high priority
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    );
  };

  const getTabItems = () => {
    const items = [];

    // Only show "My Questions" tab for members, all questions for coaches
    if (currentUser?.role === 'MEMBER') {
      items.push({
        key: 'my-questions',
        label: (
          <span>
            <QuestionCircleOutlined />
            Câu hỏi của tôi
          </span>
        ),
        children: (
          <div>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
              <Title level={3} style={{ margin: 0 }}>
                Câu hỏi của tôi
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAskForm(true)}
              >
                Đặt câu hỏi mới
              </Button>
            </Space>
            
            {showAskForm ? (
              <div style={{ marginBottom: 24 }}>
                <AskQuestion 
                  onQuestionSubmitted={handleQuestionSubmitted}
                />
                <Button 
                  style={{ marginTop: 8 }}
                  onClick={() => setShowAskForm(false)}
                >
                  Hủy
                </Button>
              </div>
            ) : null}

            <QuestionList 
              filterBy="member" 
              onQuestionSelect={handleQuestionSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )
      });
    }

    // Add coach-specific tab
    if (currentUser?.role === 'COACH') {
      items.push({
        key: 'to-answer',
        label: (
          <span>
            <Badge count={stats.pending} size="small">
              <ClockCircleOutlined />
              Cần trả lời
            </Badge>
          </span>
        ),
        children: (
          <div>
            <Title level={3} style={{ marginBottom: 16 }}>
              Câu hỏi cần trả lời
            </Title>
            <QuestionList 
              filterBy="coach" 
              onQuestionSelect={handleQuestionSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )
      });

      items.push({
        key: 'answer',
        label: (
          <span>
            <CheckCircleFilled />
            Trả lời
          </span>
        ),
        children: (
          <AnswerQuestion
            question={selectedQuestion}
            onAnswerSubmitted={handleAnswerSubmitted}
            onCancel={() => {
              setSelectedQuestion(null);
              setActiveTab(currentUser?.role === 'COACH' ? 'to-answer' : 'my-questions');
            }}
          />
        )
      });
    }

    return items;
  };

  return (
    <div className="qa-forum-container">
      {renderStatsCards()}
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={getTabItems()}
        size="large"
      />
    </div>
  );
};

export default QAForum;
