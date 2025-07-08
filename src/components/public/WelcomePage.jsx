import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const WelcomePage = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={1} style={{ color: '#1890ff' }}>
            Welcome to Smoking Cessation Support System
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '30px' }}>
            Your journey to a smoke-free life starts here. Join our supportive community 
            and get professional guidance to help you quit smoking successfully.
          </Paragraph>
          <Space size="large">
            <Link to="/login">
              <Button type="primary" size="large">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large">
                Register
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="large">
                Read Articles
              </Button>
            </Link>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default WelcomePage;
