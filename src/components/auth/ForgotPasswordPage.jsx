import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const { email } = values;
      
      // Send reset OTP
      const response = await authService.sendResetOtp(email);
      
      // Check if response is successful
      if (response && response.success) {
        // Navigate to OTP verification page with email and timestamp for countdown
        navigate('/reset-password-otp', { 
          state: { 
            email,
            otpSentAt: Date.now() // Add timestamp for countdown calculation
          } 
        });
      }
      
    } catch (error) {
      // Error will be handled by popup/notification system
      console.log('Send OTP failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <div className="text-center mb-4">
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/login')}
                className="back-button"
              >
                Quay lại đăng nhập
              </Button>
            </div>
            
            <Title level={2} className="text-center">Quên mật khẩu</Title>
            <Text className="text-center block mb-4" type="secondary">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </Text>
            
            <Form
              form={form}
              name="forgot-password"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email của bạn!' },
                  { type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Nhập địa chỉ email của bạn" 
                  size="large"
                  disabled={isLoading}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  size="large"
                  block
                >
                  Gửi OTP Đặt Lại
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Nhớ mật khẩu của bạn?{' '}
                <Link to="/login" className="text-primary">
                  Quay lại đăng nhập
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPasswordPage;
