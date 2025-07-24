import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card, Alert } from 'antd';
import { SafetyOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ResetPasswordOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  
  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    // Redirect to forgot password if no email provided
    if (!email) {
      navigate('/forgot-password');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { otp } = values;
      const cleanOtp = otp.replace(/\s/g, ''); // Remove any spaces
      
      // Validate OTP with backend before navigation
      const response = await authService.validateOtp(email, cleanOtp);
      
      if (response && response.success) {
        // Navigate to reset password page with email and OTP
        navigate('/reset-password', { 
          state: { 
            email, 
            otp: cleanOtp
          } 
        });
      } else {
        setError('OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');
      }
      
    } catch (error) {
      setError(error.message || 'OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.sendResetOtp(email);
      setSuccess('OTP mới đã được gửi đến email của bạn.');
      setCountdown(30); // 30 seconds countdown
    } catch (error) {
      // Check if it's a rate limiting error (429)
      if (error.status === 429) {
        setError('Vui lòng chờ 30 giây trước khi yêu cầu OTP mới.');
      } else {
        setError(error.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
      }
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
            
            {error && (
              <Alert 
                message={error} 
                type="error" 
                showIcon 
                className="mb-4" 
              />
            )}
            
            {success && (
              <Alert 
                message={success} 
                type="success" 
                showIcon 
                className="mb-4" 
              />
            )}
            
            <Form
              form={form}
              name="verify-otp"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="otp"
                label="Mã xác minh"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã OTP!' },
                  { 
                    pattern: /^[0-9]{6}$/, 
                    message: 'Vui lòng nhập đúng mã OTP 6 chữ số!' 
                  }
                ]}
              >
                <Input 
                  prefix={<SafetyOutlined />} 
                  placeholder="Nhập mã 6 chữ số" 
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
