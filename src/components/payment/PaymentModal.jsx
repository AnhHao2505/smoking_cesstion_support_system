import React, { useState } from 'react';
import { Modal, Button, Form, InputNumber, Select, Card, Alert, Spin, Typography, Space } from 'antd';
import { CreditCardOutlined, DollarOutlined, CrownOutlined } from '@ant-design/icons';
import { createVNPayPayment } from '../../services/paymentService';
import { upgradeToPremium } from '../../services/userService';
import '../../styles/Payment.css';

const { Title, Text } = Typography;
const { Option } = Select;

const PaymentModal = ({ visible, onClose, onPaymentSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('premium_package');

  // Premium packages
  const premiumPackages = [
    {
      id: 'premium_package',
      name: 'Premium',
      price: 100000,
      duration: 'trọn đời',
      description: 'Truy cập đầy đủ tính năng premium',
      popular: true,
      features: [
        'Tư vấn 1-1 với Coach chuyên nghiệp',
        'Kế hoạch cai thuốc cá nhân hóa',
        'Theo dõi tiến trình chi tiết',
        'Hỗ trợ 24/7',
        'Tài liệu độc quyền',
        'Tư vấn không giới hạn'
      ]
    }
  ];

  const handlePayment = async (values) => {
    try {
      setLoading(true);
      
      const selectedPkg = premiumPackages.find(pkg => pkg.id === values.package);
      if (!selectedPkg) {
        throw new Error('Không tìm thấy gói được chọn');
      }

      // Create VNPay payment
      const paymentResponse = await createVNPayPayment(
        selectedPkg.price,
        values.language || 'vn'
      );

      if (paymentResponse && paymentResponse.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('Không thể tạo liên kết thanh toán');
      }

    } catch (error) {
      console.error('Payment error:', error);
      Modal.error({
        title: 'Lỗi thanh toán',
        content: error.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderPackageCard = (pkg) => (
    <Card
      key={pkg.id}
      className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
      onClick={() => {
        setSelectedPackage(pkg.id);
        form.setFieldsValue({ package: pkg.id });
      }}
      style={{
        cursor: 'pointer',
        border: selectedPackage === pkg.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
        position: 'relative',
        marginBottom: '16px'
      }}
    >
      {pkg.popular && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '16px',
            background: '#ff4d4f',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          PHỔ BIẾN
        </div>
      )}
      
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <Title level={4} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
          <CrownOutlined /> {pkg.name}
        </Title>
        
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
            {formatPrice(pkg.price)}
          </Text>
          {pkg.originalPrice && (
            <div>
              <Text delete style={{ color: '#999', fontSize: '14px' }}>
                {formatPrice(pkg.originalPrice)}
              </Text>
            </div>
          )}
          <div>
            <Text type="secondary">/{pkg.duration}</Text>
          </div>
        </div>

        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          {pkg.description}
        </Text>

        <div style={{ textAlign: 'left' }}>
          {pkg.features.map((feature, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <Text>
                ✓ {feature}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CrownOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Nâng cấp Premium</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      style={{ top: 20 }}
      className="payment-modal"
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Alert
          message="Nâng cấp ngay hôm nay!"
          description="Trải nghiệm đầy đủ tính năng premium để có hành trình cai thuốc hiệu quả nhất."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePayment}
          initialValues={{
            package: 'premium_package',
            language: 'vn'
          }}
        >
          <Form.Item
            name="package"
            label="Chọn gói Premium"
            rules={[{ required: true, message: 'Vui lòng chọn gói Premium' }]}
          >
            <div>
              {premiumPackages.map(pkg => renderPackageCard(pkg))}
            </div>
          </Form.Item>

          <Form.Item
            name="language"
            label="Ngôn ngữ thanh toán"
          >
            <Select>
              <Option value="vn">Tiếng Việt</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space>
              <Button onClick={onClose} size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<CreditCardOutlined />}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </Button>
            </Space>
          </div>
        </Form>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <Title level={5}>Lưu ý về thanh toán:</Title>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Thanh toán qua VNPay an toàn và bảo mật</li>
            <li>Tài khoản sẽ được nâng cấp ngay sau khi thanh toán thành công</li>
            <li>Bạn có thể hủy đăng ký bất kỳ lúc nào</li>
            <li>Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình thanh toán</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
