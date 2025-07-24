import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { SafetyOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ResetPasswordOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  
  // Get email and OTP sent timestamp from navigation state
  const email = location.state?.email;
  const otpSentAt = location.state?.otpSentAt;

  useEffect(() => {
    // Redirect to forgot password if no email provided
    if (!email) {
      navigate('/forgot-password');
      return;
    }
    
    // Auto start countdown if OTP was just sent (from email page)
    if (otpSentAt) {
      const timeSinceOtpSent = Math.floor((Date.now() - otpSentAt) / 1000);
      const remainingTime = Math.max(0, 30 - timeSinceOtpSent);
      setCountdown(remainingTime);
    }
  }, [email, otpSentAt, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const { otp } = values;
      
      // Check if OTP is provided
      if (!otp || otp.trim() === '') {
        return;
      }
      
      const cleanOtp = otp.replace(/\s/g, ''); // Remove any spaces
      
      // Frontend validation for OTP format
      if (!/^[0-9]{6}$/.test(cleanOtp)) {
        return;
      }
      
      // Validate OTP with backend
      const response = await authService.validateOtp(email, cleanOtp);
      
      // Check if response is successful
      if (response && response.success) {
        // Navigate to reset password page with email only (OTP already consumed)
        navigate('/reset-password', { 
          state: { 
            email,
            otpValidated: true // Flag to indicate OTP was validated
          } 
        });
      }
      
    } catch (error) {
      // Error will be handled by popup/notification system
      console.log('OTP validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      const response = await authService.sendResetOtp(email);
      
      // Check if response is successful
      if (response && response.success) {
        setCountdown(30); // 30 seconds countdown
      }
      
    } catch (error) {
      // Error will be handled by popup/notification system
      console.log('Resend OTP failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <div className="text-center mb-4">
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/forgot-password')}
                className="back-button"
              >
                Quay lại
              </Button>
            </div>
            
            <Title level={2} className="text-center">Xác minh OTP</Title>
            <Text className="text-center block mb-4" type="secondary">
              Chúng tôi đã gửi mã xác minh 6 chữ số đến<br />
              <strong>{email}</strong>
            </Text>
                       
            <Form
              form={form}
              name="verify-otp"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="otp"
                label="Mã xác minh"
              >
                <Input 
                  prefix={<SafetyOutlined />} 
                  placeholder="Nhập đúng 6 chữ số (ví dụ: 123456)" 
                  size="large"
                  maxLength={6}
                  disabled={isLoading}
                  style={{ 
                    fontSize: '18px', 
                    textAlign: 'center',
                    letterSpacing: '0.2em'
                  }}
                />
              </Form.Item>

              <div className="text-center mb-3" style={{
                background: '#f6f8fa',
                border: '1px solid #e1e4e8',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '16px 0'
              }}>
                <Text type="secondary" style={{ 
                  fontSize: '13px', 
                  color: '#586069',
                  fontWeight: '500',
                  display: 'block',
                  lineHeight: '1.5'
                }}>
                  ⚠️ Mã OTP chỉ có hiệu lực trong 15 phút và chỉ chứa 6 chữ số
                </Text>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  size="large"
                  block
                >
                  Xác minh & Tiếp tục
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text type="secondary">Không nhận được mã?</Text>
              <br />
              <Button 
                type="link" 
                icon={<ReloadOutlined />}
                onClick={handleResendOtp}
                loading={isResending}
                disabled={countdown > 0}
                className="mt-2"
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Text>
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

export default ResetPasswordOtpPage;
