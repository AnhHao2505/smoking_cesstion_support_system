import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Divider, 
  List, 
  Tag, 
  Alert,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin
} from 'antd';
import { 
  CrownOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { upgradeToPremium } from '../../services/userManagementService';
import { getCurrentUser } from '../../services/authService';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PremiumUpgrade = () => {
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const premiumFeatures = [
    {
      icon: <CustomerServiceOutlined style={{ color: '#1890ff' }} />,
      title: 'Tư vấn 1-1 với Coach chuyên nghiệp',
      description: 'Nhận hỗ trợ cá nhân hóa từ các chuyên gia cai thuốc'
    },
    {
      icon: <TrophyOutlined style={{ color: '#faad14' }} />,
      title: 'Theo dõi tiến trình chi tiết',
      description: 'Báo cáo và phân tích sâu về quá trình cai thuốc'
    },
    {
      icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
      title: 'Kế hoạch cai thuốc cá nhân hóa',
      description: 'Thiết kế riêng phù hợp với hoàn cảnh và mục tiêu của bạn'
    },
    {
      icon: <StarOutlined style={{ color: '#eb2f96' }} />,
      title: 'Truy cập không giới hạn',
      description: 'Sử dụng tất cả tính năng cao cấp mà không bị hạn chế'
    }
  ];

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Gói tháng',
      price: '299,000',
      period: 'tháng',
      popular: false,
      features: [
        'Tư vấn 1-1 với Coach',
        'Kế hoạch cá nhân hóa',
        'Theo dõi tiến trình',
        'Hỗ trợ 24/7'
      ]
    },
    {
      id: 'quarterly',
      name: 'Gói 3 tháng',
      price: '699,000',
      period: '3 tháng',
      popular: true,
      originalPrice: '897,000',
      features: [
        'Tất cả tính năng gói tháng',
        'Tiết kiệm 22%',
        'Ưu tiên hỗ trợ',
        'Tài liệu độc quyền'
      ]
    },
    {
      id: 'yearly',
      name: 'Gói năm',
      price: '2,299,000',
      period: 'năm',
      popular: false,
      originalPrice: '3,588,000',
      features: [
        'Tất cả tính năng gói 3 tháng',
        'Tiết kiệm 36%',
        'Tư vấn không giới hạn',
        'Chương trình VIP'
      ]
    }
  ];

  const handleUpgrade = (planId) => {
    const selectedPlan = pricingPlans.find(plan => plan.id === planId);
    form.setFieldsValue({ planId, planName: selectedPlan.name });
    setModalVisible(true);
  };

  const handleSubmitUpgrade = async () => {
    try {
      const values = await form.validateFields();
      setUpgrading(true);

      const response = await upgradeToPremium();
      
      if (response.success) {
        message.success('Nâng cấp Premium thành công!');
        setModalVisible(false);
        // Redirect to success page or dashboard
        navigate('/member/membership-status');
      } else {
        message.error('Không thể nâng cấp Premium. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="premium-upgrade">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Title level={2}>
              <CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Nâng cấp Premium
            </Title>
            <Paragraph>
              Mở khóa tất cả tính năng cao cấp để có trải nghiệm cai thuốc tốt nhất
            </Paragraph>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>

        {/* Current Status Alert */}
        {currentUser && !currentUser.premiumMembership && (
          <Alert
            message="Tài khoản Miễn phí"
            description="Bạn đang sử dụng tài khoản miễn phí. Nâng cấp Premium để trải nghiệm đầy đủ tính năng."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Premium Features */}
        <Card title="Tính năng Premium" className="mb-4">
          <Row gutter={[16, 16]}>
            {premiumFeatures.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                <div className="feature-item">
                  <Space align="start">
                    <div className="feature-icon">{feature.icon}</div>
                    <div>
                      <Title level={5}>{feature.title}</Title>
                      <Paragraph>{feature.description}</Paragraph>
                    </div>
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Pricing Plans */}
        <Card title="Chọn gói Premium phù hợp">
          <Row gutter={[16, 16]}>
            {pricingPlans.map((plan) => (
              <Col xs={24} md={8} key={plan.id}>
                <Card 
                  className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                  actions={[
                    <Button 
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Chọn gói này
                    </Button>
                  ]}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <Tag color="gold">Phổ biến nhất</Tag>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Title level={4}>{plan.name}</Title>
                    <div className="price">
                      <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                        {plan.price}đ
                      </Text>
                      <Text type="secondary">/{plan.period}</Text>
                    </div>
                    
                    {plan.originalPrice && (
                      <div className="original-price">
                        <Text delete type="secondary">
                          {plan.originalPrice}đ
                        </Text>
                      </div>
                    )}
                  </div>
                  
                  <Divider />
                  
                  <List
                    size="small"
                    dataSource={plan.features}
                    renderItem={feature => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {feature}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Testimonials */}
        <Card title="Khách hàng nói gì về Premium">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Tư vấn từ Coach giúp tôi vượt qua những thời điểm khó khăn nhất. 
                  Tôi đã cai thuốc thành công sau 3 tháng."
                </Paragraph>
                <Text strong>Nguyễn Văn A</Text>
                <br />
                <Text type="secondary">Thành viên Premium</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Kế hoạch cá nhân hóa rất phù hợp với tình hình của tôi. 
                  Tôi cảm thấy được hỗ trợ tận tâm."
                </Paragraph>
                <Text strong>Trần Thị B</Text>
                <br />
                <Text type="secondary">Thành viên Premium</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="testimonial-card">
                <Paragraph>
                  "Báo cáo chi tiết giúp tôi hiểu rõ tiến trình của mình. 
                  Động lực để tiếp tục rất lớn."
                </Paragraph>
                <Text strong>Lê Văn C</Text>
                <br />
                <Text type="secondary">Thành viên Premium</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Upgrade Modal */}
        <Modal
          title="Xác nhận nâng cấp Premium"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalVisible(false)}>
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={upgrading}
              onClick={handleSubmitUpgrade}
              icon={<CreditCardOutlined />}
            >
              Thanh toán
            </Button>
          ]}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="planName"
              label="Gói đã chọn"
            >
              <Input disabled />
            </Form.Item>
            
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              initialValue="credit_card"
            >
              <Select placeholder="Chọn phương thức thanh toán">
                <Option value="credit_card">Thẻ tín dụng</Option>
                <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
                <Option value="momo">Ví MoMo</Option>
                <Option value="zalopay">ZaloPay</Option>
              </Select>
            </Form.Item>

            <Alert
              message="Thông tin thanh toán"
              description="Sau khi thanh toán thành công, tài khoản của bạn sẽ được nâng cấp ngay lập tức và bạn có thể sử dụng tất cả tính năng Premium."
              type="info"
              showIcon
            />
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PremiumUpgrade;