import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Row,
  Col,
  Card,
  Divider,
  Space,
  message,
  Rate,
  Spin,
} from "antd";
import { Link } from "react-router-dom";
import {
  ArrowRightOutlined,
  StarFilled,
  HeartOutlined,
  UserOutlined,
  TrophyOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import * as authService from "../../services/authService";
import { getPublishedFeedbacks } from "../../services/feebackService";
// import heroImage from '../assets/images/hero-image.png';
import "../../styles/LandingPage.css"; // Ensure you have the appropriate CSS file

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
    const styleElement = document.createElement("style");
    styleElement.innerHTML = toastStyles;
    document.head.appendChild(styleElement);

    console.log("LandingPage mounted successfully");

    // Check for login reminder and show it as toast
    const reminder = authService.getLoginReminder();
    if (reminder) {
      // Configure message settings
      message.config({
        top: 24,
        duration: 10, // Extended duration for better readability
        maxCount: 3,
      });

      const key = `reminder-${Date.now()}`;
      message.info({
        content: (
          <div
            style={{
              padding: "10px 0",
              lineHeight: "1.5",
            }}
          >
            <strong
              style={{
                fontSize: "16px",
                color: "#1890ff",
                display: "block",
                marginBottom: "6px",
              }}
            >
              🔔 Nhắc nhở từ hệ thống
            </strong>
            <span
              style={{
                fontSize: "14px",
                color: "rgba(0,0,0,0.85)",
                display: "block",
              }}
            >
              {reminder}
            </span>
            <Button
              type="link"
              size="small"
              style={{ padding: "4px 0", marginTop: "8px" }}
              onClick={() => {
                message.destroy(key);
              }}
            >
              Đã hiểu
            </Button>
          </div>
        ),
        key,
        duration: 0, // Set to 0 to require manual closing (with the added button)
        style: {
          position: "fixed",
          top: "75px",
          right: "24px",
          left: "auto",
          minWidth: "300px",
          maxWidth: "380px",
          zIndex: 1050,
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
          borderRadius: "8px",
          padding: "14px 18px",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(232, 232, 232, 0.8)",
        },
        className: "custom-reminder-toast",
        icon: (
          <span
            role="img"
            aria-label="info"
            style={{ fontSize: "18px", color: "#1890ff" }}
          >
            ℹ️
          </span>
        ),
      });
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
        console.log("Published feedbacks response:", response);

        if (response && Array.isArray(response)) {
          setFeedbacks(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setFeedbacks(response.data);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error("Error fetching published feedbacks:", error);
        message.error("Không thể tải phản hồi từ người dùng");
        setFeedbacks([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchPublishedFeedbacks();
  }, []);

  return (
    <Layout className="landing-page-modern">
      <Content>
        {/* Hero Section */}
        <section className="hero-section-enhanced">
          <div className="hero-background-overlay"></div>
          <div className="floating-elements">
            <div className="float-shape shape-1"></div>
            <div className="float-shape shape-2"></div>
            <div className="float-shape shape-3"></div>
          </div>

          <div className="hero-content-wrapper">
            <Row gutter={[24, 24]} align="middle" justify="center">
              <Col xs={22} sm={20} md={18} lg={16} xl={14}>
                <div
                  className="hero-text-content"
                  style={{ textAlign: "center", padding: "40px 20px" }}
                >
                  <Title
                    level={1}
                    className="hero-title-enhanced"
                    style={{ marginBottom: "32px" }}
                  >
                    Hỗ trợ cai thuốc lá{" "}
                    <span className="highlight-gradient">hiệu quả</span>
                  </Title>
                  <Paragraph
                    className="hero-description-enhanced"
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      lineHeight: "1.8",
                      marginBottom: "24px",
                      maxWidth: "100%",
                    }}
                  >
                    Trong bối cảnh tỷ lệ người hút thuốc ngày càng gia tăng, đặc
                    biệt ở giới trẻ, việc xây dựng một hệ thống công nghệ nhằm
                    hỗ trợ quá trình cai nghiện là vô cùng cần thiết. Hệ thống
                    của chúng em tập trung vào việc theo dõi hành vi người dùng,
                    cung cấp các gợi ý can thiệp phù hợp, đồng thời tạo ra một
                    môi trường hỗ trợ tích cực thông qua ứng dụng di động và nền
                    tảng trực tuyến.
                  </Paragraph>
                  <Paragraph
                    className="hero-description-enhanced"
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      lineHeight: "1.8",
                      marginBottom: "0",
                      maxWidth: "100%",
                    }}
                  >
                    Mục tiêu chính của đề tài là giúp người hút thuốc từng bước
                    giảm phụ thuộc, tiến tới từ bỏ hoàn toàn thuốc lá, góp phần
                    cải thiện sức khỏe cá nhân và cộng đồng.
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Quick Benefits Bar
        <section className="quick-benefits-bar">
          <div className="container-custom">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={12} sm={6}>
                <div className="quick-benefit-item">
                  <SafetyOutlined className="benefit-icon-quick" />
                  <Text strong>An toàn 100%</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="quick-benefit-item">
                  <TeamOutlined className="benefit-icon-quick" />
                  <Text strong>Cộng đồng</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="quick-benefit-item">
                  <TrophyOutlined className="benefit-icon-quick" />
                  <Text strong>Tỷ lệ cao</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="quick-benefit-item">
                  <UserOutlined className="benefit-icon-quick" />
                  <Text strong>Chuyên gia</Text>
                </div>
              </Col>
            </Row>
          </div>
        </section> */}

        <Divider className="section-divider" />

        {/* Features Section */}
        <section className="features-section-enhanced">
          <Title level={2} className="section-title-enhanced">
            Tính năng nổi bật
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={8}>
              <Link
                to="/member/smoking-status"
                style={{ textDecoration: "none" }}
              >
                <Card className="feature-card-enhanced" hoverable>
                  <div className="feature-icon-wrapper">
                    <CheckCircleOutlined className="feature-icon-large" />
                  </div>
                  <Title level={4} className="feature-title-enhanced">
                    Theo dõi tiến trình
                  </Title>
                  <Paragraph className="feature-description-enhanced">
                    Theo dõi quá trình cai thuốc lá của bạn với số liệu thống kê
                    trực quan và cập nhật liên tục.
                  </Paragraph>
                  <div className="feature-highlights">
                    <div className="highlight-item">✓ Biểu đồ trực quan</div>
                    <div className="highlight-item">✓ Thống kê chi tiết</div>
                    <div className="highlight-item">✓ Báo cáo tiến độ</div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Link to="/member/chat" style={{ textDecoration: "none" }}>
                <Card className="feature-card-enhanced" hoverable>
                  <div className="feature-icon-wrapper">
                    <TeamOutlined className="feature-icon-large" />
                  </div>
                  <Title level={4} className="feature-title-enhanced">
                    Hỗ trợ cộng đồng
                  </Title>
                  <Paragraph className="feature-description-enhanced">
                    Kết nối với cộng đồng người cai thuốc lá để chia sẻ kinh
                    nghiệm và nhận được sự động viên.
                  </Paragraph>
                  <div className="feature-highlights">
                    <div className="highlight-item">✓ Diễn đàn thảo luận</div>
                    <div className="highlight-item">✓ Nhóm hỗ trợ</div>
                    <div className="highlight-item">✓ Chia sẻ thành tựu</div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Link to="/qna" style={{ textDecoration: "none" }}>
                <Card className="feature-card-enhanced" hoverable>
                  <div className="feature-icon-wrapper">
                    <UserOutlined className="feature-icon-large" />
                  </div>
                  <Title level={4} className="feature-title-enhanced">
                    Tư vấn chuyên gia
                  </Title>
                  <Paragraph className="feature-description-enhanced">
                    Nhận tư vấn từ các chuyên gia y tế về phương pháp cai thuốc
                    lá phù hợp với bạn.
                  </Paragraph>
                  <div className="feature-highlights">
                    <div className="highlight-item">✓ Tư vấn 1-1</div>
                    <div className="highlight-item">✓ Lịch hẹn linh hoạt</div>
                    <div className="highlight-item">✓ Theo dõi sát sao</div>
                  </div>
                </Card>
              </Link>
            </Col>
          </Row>
        </section>

        {/* Testimonials Section - Dynamic Feedbacks */}
        <section className="testimonials-section-enhanced">
          <Title level={2} className="section-title-enhanced">
            Phản hồi từ người dùng
          </Title>

          {loadingFeedbacks ? (
            <div className="loading-wrapper">
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text className="loading-text">
                  Đang tải phản hồi từ người dùng...
                </Text>
              </div>
            </div>
          ) : feedbacks.length > 0 ? (
            <Row gutter={[24, 24]}>
              {feedbacks.slice(0, 6).map((feedback, index) => (
                <Col xs={24} md={12} lg={8} key={feedback.id || index}>
                  <Card
                    className="testimonial-card-enhanced"
                    style={{ height: "100%" }}
                  >
                    <div className="testimonial-header">
                      <div className="user-avatar-enhanced">
                        <UserOutlined />
                      </div>
                      <div className="user-info-enhanced">
                        <Text strong className="user-name-enhanced">
                          {feedback.memberName ||
                            feedback.user_name ||
                            feedback.authorName ||
                            "Người dùng ẩn danh"}
                        </Text>
                        {feedback.createdAt && (
                          <div className="user-date-enhanced">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(feedback.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="testimonial-rating-enhanced">
                      <Rate
                        disabled
                        defaultValue={feedback.star || 5}
                        style={{ fontSize: 16, color: "#faad14" }}
                      />
                    </div>

                    <Paragraph className="testimonial-content-enhanced">
                      "
                      {feedback.content ||
                        feedback.feedback_content ||
                        "Phản hồi tích cực từ người dùng"}
                      "
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="no-testimonials-wrapper">
              <Text className="no-testimonials-text">
                Chưa có phản hồi nào từ người dùng
              </Text>
            </div>
          )}
        </section>

        {/* CTA Section */}
        {/* <section className="cta-section-enhanced">
            <div className="cta-background"></div>
            <div className="cta-content-wrapper">
              <Title level={2} className="cta-title-enhanced">
                Sẵn sàng bắt đầu hành trình cai thuốc lá?
              </Title>
              <Paragraph className="cta-description-enhanced">
                Tham gia cùng hàng nghìn người đã thành công cai thuốc lá
              </Paragraph>
            </div>
          </section> */}
      </Content>

      <Footer className="landing-footer-enhanced">
        <div className="footer-content-wrapper">
          <Row gutter={[32, 32]} justify={"center"}>
            <Col xs={24} md={8}>
              <Title level={4} className="footer-title-enhanced">
                Về chúng tôi
              </Title>
              <Paragraph className="footer-text-enhanced">
                Hệ thống hỗ trợ cai thuốc lá - giúp mọi người có một cuộc sống
                khỏe mạnh hơn.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4} className="footer-title-enhanced">
                Liên hệ
              </Title>
              <div className="contact-info-enhanced">
                <Paragraph className="footer-text-enhanced">
                  📧 Email: hotro@caithoucla.com
                  <br />
                  📞 Điện thoại: (024) 3825-1234
                </Paragraph>
              </div>
            </Col>
          </Row>
          <Divider className="footer-divider" />
          <div className="footer-bottom">
            <Text className="copyright-text">
              © 2025 Hệ thống hỗ trợ cai thuốc lá. Bảo lưu mọi quyền.
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default LandingPage;
