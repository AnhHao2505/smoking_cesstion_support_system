import React, { useEffect } from 'react';
import { Layout, Typography, Button, Row, Col, Card, Divider, Space } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
// import heroImage from '../assets/images/hero-image.png';
import '../../styles/LandingPage.css'; // Ensure you have the appropriate CSS file

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
  useEffect(() => {
    console.log('LandingPage mounted successfully');
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

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <Title level={2} className="section-title">Phản hồi từ người dùng</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Ứng dụng này đã giúp tôi cai thuốc lá thành công sau nhiều lần thất bại. Cảm ơn đội ngũ phát triển!"
                </Paragraph>
                <Text strong>Nguyễn Văn A</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Cộng đồng hỗ trợ tuyệt vời và các tính năng theo dõi giúp tôi có động lực mỗi ngày."
                </Paragraph>
                <Text strong>Trần Thị B</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Sau 10 năm hút thuốc, tôi đã cai được nhờ vào hệ thống này. Thật sự khuyến khích mọi người thử!"
                </Paragraph>
                <Text strong>Lê Văn C</Text>
              </Card>
            </Col>
          </Row>
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
              Email: contact@caithoucla.com<br />
              Điện thoại: 123-456-7890
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
        <Text>© 2025 Hệ thống hỗ trợ cai thuốc lá. All rights reserved.</Text>
      </Footer>
    </Layout>
  );
};

export default LandingPage;