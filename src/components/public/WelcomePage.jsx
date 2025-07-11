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
            Chào mừng đến với Hệ thống hỗ trợ cai thuốc lá
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '30px' }}>
            Hành trình đến cuộc sống không khói thuốc của bạn bắt đầu từ đây. Tham gia cộng đồng 
            hỗ trợ của chúng tôi và nhận hướng dẫn chuyên nghiệp để giúp bạn cai thuốc lá thành công.
          </Paragraph>
          <Space size="large">
            <Link to="/login">
              <Button type="primary" size="large">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large">
                Đăng ký
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="large">
                Đọc bài viết
              </Button>
            </Link>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default WelcomePage;
