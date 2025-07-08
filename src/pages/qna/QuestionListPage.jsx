import React from 'react';
import { Layout, Breadcrumb, Typography } from 'antd';
import { HomeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import QuestionList from '../../components/qna/QuestionList';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/global.css';

const { Content } = Layout;
const { Title } = Typography;

const QuestionListPage = () => {
  const { currentUser } = useAuth();

  const getFilterBy = () => {
    if (currentUser?.role === 'MEMBER') {
      return 'member';
    } else if (currentUser?.role === 'COACH') {
      return 'coach';
    }
    return 'all';
  };

  const getPageTitle = () => {
    if (currentUser?.role === 'MEMBER') {
      return 'Câu hỏi của tôi';
    } else if (currentUser?.role === 'COACH') {
      return 'Câu hỏi cần trả lời';
    }
    return 'Tất cả câu hỏi';
  };

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
            <UnorderedListOutlined />
            <span>{getPageTitle()}</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            {getPageTitle()}
          </Title>
          
          <QuestionList 
            filterBy={getFilterBy()}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default QuestionListPage;
