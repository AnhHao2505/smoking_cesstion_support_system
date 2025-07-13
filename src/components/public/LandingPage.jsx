import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Row, Col, Card, Divider, Space, message, Rate, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, StarFilled } from '@ant-design/icons';
import * as authService from '../../services/authService';
import { getPublishedFeedbacks } from '../../services/feebackService';
// import heroImage from '../assets/images/hero-image.png';
import '../../styles/LandingPage.css'; // Ensure you have the appropriate CSS file

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

// Add custom CSS for toast positioning
const toastStyles = `
  .ant-message {
    position: fixed !important;
    top: 24px !important;
    right: 24px !important;
    left: auto !important;
    transform: none !important;
    z-index: 1050 !important;
  }
  
  .custom-reminder-toast .ant-message-notice {
    position: fixed !important;
    top: 24px !important;
    right: 24px !important;
    left: auto !important;
    transform: none !important;
  }
`;

const LandingPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  useEffect(() => {
    // Inject custom styles for toast positioning
    const styleElement = document.createElement('style');
    styleElement.innerHTML = toastStyles;
    document.head.appendChild(styleElement);

    console.log('LandingPage mounted successfully');
    
    // Check for login reminder and show it as toast
    const reminder = authService.getLoginReminder();
    if (reminder) {
      // Configure message position to top-right
      message.config({
        top: 24,
        duration: 8,
        maxCount: 3,
        rtl: false,
      });

      message.info({
        content: (
          <div style={{ padding: '8px 0' }}>
            <strong>🔔 Nhắc nhở từ hệ thống</strong>
            <br />
            {reminder}
          </div>
        ),
        duration: 8, // Show for 8 seconds
        style: {
          position: 'fixed',
          top: '24px',
          right: '24px',
          left: 'auto',
          transform: 'none',
          fontSize: '16px',
          minWidth: '320px',
          maxWidth: '400px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        className: 'custom-reminder-toast',
      });
      // Clear the reminder after showing it
      // authService.clearLoginReminder();
    }

    // Cleanup function
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  // Fetch published feedbacks
  useEffect(() => {
    const fetchPublishedFeedbacks = async () => {
      try {
        setLoadingFeedbacks(true);
        const response = await getPublishedFeedbacks();
        console.log('Published feedbacks response:', response);
        
        if (response && Array.isArray(response)) {
          setFeedbacks(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setFeedbacks(response.data);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error('Error fetching published feedbacks:', error);
        message.error('Không thể tải phản hồi từ người dùng');
        setFeedbacks([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchPublishedFeedbacks();
  }, []);

  return (
    <Layout className="landing-page">
      <Content>
        {/* Hero Section */}
        <section className="hero-section">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <Title level={1}>Hỗ trợ cai thuốc lá hiệu quả</Title>
              <Paragraph className="hero-description">
                Khám phá phương pháp cai thuốc lá khoa học, được hỗ trợ bởi cộng đồng và các chuyên gia y tế.
              </Paragraph>
              <Space>
                <Link to="/register">
                  <Button type="primary" size="large">
                    Bắt đầu ngay <ArrowRightOutlined />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="large">Tìm hiểu thêm</Button>
                </Link>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              {/* <img src={heroImage} alt="Cai thuốc lá" className="hero-image" /> */}
            </Col>
          </Row>
        </section>

        <Divider />

        {/* Features Section */}
        <section className="features-section">
          <Title level={2} className="section-title">Tính năng nổi bật</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card">
                <Title level={4}>Theo dõi tiến trình</Title>
                <Paragraph>
                  Theo dõi quá trình cai thuốc lá của bạn với số liệu thống kê trực quan và cập nhật liên tục.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card">
                <Title level={4}>Hỗ trợ cộng đồng</Title>
                <Paragraph>
                  Kết nối với cộng đồng người cai thuốc lá để chia sẻ kinh nghiệm và nhận được sự động viên.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card">
                <Title level={4}>Tư vấn chuyên gia</Title>
                <Paragraph>
                  Nhận tư vấn từ các chuyên gia y tế về phương pháp cai thuốc lá phù hợp với bạn.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Testimonials Section - Dynamic Feedbacks */}
        <section className="testimonials-section">
          <Title level={2} className="section-title">Phản hồi từ người dùng</Title>
          
          {loadingFeedbacks ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Đang tải phản hồi từ người dùng...</Text>
              </div>
            </div>
          ) : feedbacks.length > 0 ? (
            <Row gutter={[24, 24]}>
              {feedbacks.slice(0, 6).map((feedback, index) => (
                <Col xs={24} md={12} lg={8} key={feedback.id || index}>
                  <Card className="testimonial-card" style={{ height: '100%' }}>
                    <div style={{ marginBottom: 16 }}>
                      <Rate 
                        disabled 
                        defaultValue={feedback.star || 5} 
                        style={{ fontSize: 16, color: '#faad14' }}
                      />
                    </div>
                    <Paragraph 
                      style={{ 
                        minHeight: 80, 
                        marginBottom: 16,
                        fontSize: 14,
                        lineHeight: 1.6 
                      }}
                    >
                      "{feedback.content || feedback.feedback_content || 'Phản hồi tích cực từ người dùng'}"
                    </Paragraph>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                      <Text strong style={{ color: '#1890ff' }}>
                        {feedback.memberName || feedback.user_name || feedback.authorName || 'Người dùng ẩn danh'}
                      </Text>
                      {feedback.createdAt && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            // Fallback static testimonials when no API data
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card className="testimonial-card">
                  <div style={{ marginBottom: 16 }}>
                    <Rate disabled defaultValue={5} style={{ fontSize: 16, color: '#faad14' }} />
                  </div>
                  <Paragraph>
                    "Ứng dụng này đã giúp tôi cai thuốc lá thành công sau nhiều lần thất bại. Cảm ơn đội ngũ phát triển!"
                  </Paragraph>
                  <Text strong style={{ color: '#1890ff' }}>Nguyễn Văn A</Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="testimonial-card">
                  <div style={{ marginBottom: 16 }}>
                    <Rate disabled defaultValue={5} style={{ fontSize: 16, color: '#faad14' }} />
                  </div>
                  <Paragraph>
                    "Cộng đồng hỗ trợ tuyệt vời và các tính năng theo dõi giúp tôi có động lực mỗi ngày."
                  </Paragraph>
                  <Text strong style={{ color: '#1890ff' }}>Trần Thị B</Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="testimonial-card">
                  <div style={{ marginBottom: 16 }}>
                    <Rate disabled defaultValue={4} style={{ fontSize: 16, color: '#faad14' }} />
                  </div>
                  <Paragraph>
                    "Sau 10 năm hút thuốc, tôi đã cai được nhờ vào hệ thống này. Thật sự khuyến khích mọi người thử!"
                  </Paragraph>
                  <Text strong style={{ color: '#1890ff' }}>Lê Văn C</Text>
                </Card>
              </Col>
            </Row>
          )}
        </section>
      </Content>

      <Footer className="landing-footer" style={{ background: 'white' }}>
        <Row>
          <Col xs={24} md={8}>
            <Title level={4}>Về chúng tôi</Title>
            <Paragraph>
              Hệ thống hỗ trợ cai thuốc lá - giúp mọi người có một cuộc sống khỏe mạnh hơn.
            </Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Liên hệ</Title>
            <Paragraph>
              Email: hotro@caithoucla.com<br />
              Điện thoại: (024) 3825-1234
            </Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Theo dõi</Title>
            <Space>
              <Button type="text" icon={<i className="fab fa-facebook" />} />
              <Button type="text" icon={<i className="fab fa-twitter" />} />
              <Button type="text" icon={<i className="fab fa-instagram" />} />
            </Space>
          </Col>
        </Row>
        <Divider />
        <Text>© 2025 Hệ thống hỗ trợ cai thuốc lá. Bảo lưu mọi quyền.</Text>
      </Footer>
    </Layout>
  );
};

export default LandingPage;