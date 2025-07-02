import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AnswerQuestion from '../../components/qna/AnswerQuestion';
import { getAllQna, getQnaByCoach } from '../../services/askQuestionService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/global.css';

const { Content } = Layout;
const { Title } = Typography;

const AnswerQuestionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      let questions = [];
      
      if (currentUser?.role === 'COACH') {
        questions = await getQnaByCoach(currentUser.id);
      } else {
        questions = await getAllQna();
      }

      const foundQuestion = questions.find(q => q.id === parseInt(questionId));
      
      if (foundQuestion) {
        setQuestion(foundQuestion);
      } else {
        message.error('Không tìm thấy câu hỏi');
        navigate('/qa-forum');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải câu hỏi: ' + error.message);
      navigate('/qa-forum');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmitted = () => {
    message.success('Câu trả lời đã được gửi thành công!');
    navigate('/qa-forum');
  };

  const handleCancel = () => {
    navigate('/qa-forum');
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={3}>Đang tải...</Title>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/qa-forum">
              <span>Diễn đàn Q&A</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <CheckCircleFilled />
            <span>Trả lời câu hỏi</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            Trả lời câu hỏi
          </Title>
          
          <AnswerQuestion
            question={question}
            onAnswerSubmitted={handleAnswerSubmitted}
            onCancel={handleCancel}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default AnswerQuestionPage;
