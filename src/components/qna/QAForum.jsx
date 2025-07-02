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
  ClockCircleOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import AskQuestion from './AskQuestion';
import QuestionList from './QuestionList';
import AnswerQuestion from './AnswerQuestion';
import { getAllQna, getQnaOfMember, getQnaByCoach } from '../../services/askQuestionService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const QAForum = () => {
  const [activeTab, setActiveTab] = useState('forum');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    answered: 0,
    pending: 0
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getAllQna();
      const questions = response || [];
      const answered = questions.filter(q => q.answer).length;
      setStats({
        total: questions.length,
        answered: answered,
        pending: questions.length - answered
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleQuestionSubmitted = () => {
    setShowAskForm(false);
    fetchStats();
  };

  const handleAnswerSubmitted = () => {
    setSelectedQuestion(null);
    fetchStats();
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    if (currentUser?.role === 'COACH' && !question.answer) {
      setActiveTab('answer');
    } else if (question.answer) {
      // Just show the question details for answered questions
      setActiveTab('forum');
    }
  };

  const renderStatsCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Tổng câu hỏi"
            value={stats.total}
            prefix={<QuestionCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
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
    </Row>
  );

  const getTabItems = () => {
    const items = [
      {
        key: 'forum',
        label: (
          <span>
            <TeamOutlined />
            Diễn đàn Q&A
          </span>
        ),
        children: (
          <div>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
              <Title level={3} style={{ margin: 0 }}>
                Diễn đàn hỏi đáp
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAskForm(true)}
              >
                Đặt câu hỏi
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
              filterBy="all" 
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        )
      }
    ];

    // Add member-specific tab
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
              setActiveTab('forum');
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
