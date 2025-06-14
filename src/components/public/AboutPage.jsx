import React from 'react';
import { Layout, Typography, Row, Col, Card, Space, Divider, Image } from 'antd';
import styles from '../../styles/AboutPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  return (
    <Layout className={styles.aboutPage}>
      <Content className={styles.aboutContent}>
        <Row justify="center">
          <Col xs={22} sm={20} md={18} lg={16} xl={14}>
            <Typography>
              <Title level={1} className={styles.pageTitle}>Hệ thống hỗ trợ cai thuốc lá</Title>
              <Paragraph className={styles.introText}>
                Sứ mệnh của chúng tôi là giúp mọi người thành công trong việc cai thuốc lá thông qua 
                hỗ trợ cá nhân hóa, chiến lược dựa trên bằng chứng khoa học và cộng đồng đồng hành.
              </Paragraph>
              
              <Divider />
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="Tầm nhìn" className={styles.aboutCard} hoverable>
                    <Paragraph>
                      Chúng tôi hướng tới một thế giới nơi mọi người đều có thể tiếp cận với 
                      nguồn tài nguyên hiệu quả và sự hỗ trợ để vượt qua cơn nghiện thuốc lá, 
                      cải thiện sức khỏe và chất lượng cuộc sống.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Phương pháp" className={styles.aboutCard} hoverable>
                    <Paragraph>
                      Chúng tôi kết hợp chuyên môn y tế, khoa học hành vi và công nghệ để tạo ra
                      một hệ thống hỗ trợ toàn diện, phù hợp với từng giai đoạn trong hành trình cai thuốc
                      của mỗi người.
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
              
              <Title level={2} className={styles.sectionTitle}>Cách hoạt động</Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <Card className={styles.featureCard} hoverable>
                    <Title level={4}>Kế hoạch cá nhân hóa</Title>
                    <Paragraph>
                      Nhận kế hoạch cai thuốc tùy chỉnh dựa trên thói quen hút thuốc, sở thích
                      và mục tiêu cai thuốc của bạn.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card className={styles.featureCard} hoverable>
                    <Title level={4}>Theo dõi hàng ngày</Title>
                    <Paragraph>
                      Giám sát tiến độ, theo dõi cơn thèm thuốc và kỷ niệm các cột mốc trên
                      hành trình để trở thành người không hút thuốc.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card className={styles.featureCard} hoverable>
                    <Title level={4}>Hỗ trợ cộng đồng</Title>
                    <Paragraph>
                      Kết nối với những người đang có cùng hành trình và tiếp cận hỗ trợ chuyên nghiệp
                      khi bạn cần nhất.
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={2} className={styles.sectionTitle}>Đội ngũ của chúng tôi</Title>
              <Paragraph>
                Đội ngũ của chúng tôi bao gồm các chuyên gia y tế, nhà khoa học hành vi và
                chuyên gia công nghệ tận tâm giúp mọi người cai thuốc lá thành công.
              </Paragraph>
              
              <Space direction="vertical" size="large" className={styles.contactSection}>
                <Title level={3}>Liên hệ với chúng tôi</Title>
                <Paragraph>
                  Có câu hỏi hoặc phản hồi? Chúng tôi rất mong được nghe từ bạn!
                </Paragraph>
                <Paragraph>
                  <Text strong>Email:</Text> support@smokingcessation.com<br />
                  <Text strong>Điện thoại:</Text> (024) 3825-xxxx
                </Paragraph>
              </Space>
            </Typography>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AboutPage;