import React from 'react';
import { Layout, Breadcrumb, Typography } from 'antd';
import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AskQuestion from '../../components/qna/AskQuestion';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Content } = Layout;
const { Title } = Typography;

const AskQuestionPage = () => {
  const handleQuestionSubmitted = () => {
    // Could redirect to Q&A forum or show success message
    window.location.href = '/qa-forum';
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
            <PlusOutlined />
            <span>Đặt câu hỏi</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            Đặt câu hỏi về cai thuốc lá
          </Title>
          
          <AskQuestion 
            onQuestionSubmitted={handleQuestionSubmitted}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default AskQuestionPage;
