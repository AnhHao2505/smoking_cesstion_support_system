import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import QAForum from '../../components/qna/QAForum';
import { initResizeObserverErrorHandler } from '../../utils/resizeObserverErrorHandler';
import '../../styles/global.css';
import '../../styles/QnA.css';

const { Content } = Layout;

// Initialize ResizeObserver error handling
initResizeObserverErrorHandler();

const QAForumPage = () => {
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
            <QuestionCircleOutlined />
            <span>Diễn đàn Q&A</span>
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
          <QAForum />
        </div>
      </Content>
    </Layout>
  );
};

export default QAForumPage;
