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
      
      // Navigate to reset password page with email and OTP
      navigate('/reset-password', { 
        state: { 
          email, 
          otp: otp.replace(/\s/g, '') // Remove any spaces
        } 
      });
      
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
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
      setSuccess('New OTP has been sent to your email.');
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
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
                Back
              </Button>
            </div>
            
            <Title level={2} className="text-center">Verify OTP</Title>
            <Text className="text-center block mb-4" type="secondary">
              We've sent a 6-digit verification code to<br />
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
                label="Verification Code"
                rules={[
                  { required: true, message: 'Please input the OTP!' },
                  { 
                    pattern: /^[0-9\s]{6,7}$/, 
                    message: 'Please enter a valid 6-digit OTP!' 
                  }
                ]}
              >
                <Input 
                  prefix={<SafetyOutlined />} 
                  placeholder="Enter 6-digit code" 
                  size="large"
                  maxLength={7} // Allow for spaces
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
                  Verify & Continue
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text type="secondary">Didn't receive the code?</Text>
              <br />
              <Button 
                type="link" 
                icon={<ReloadOutlined />}
                onClick={handleResendOtp}
                loading={isResending}
                disabled={countdown > 0}
                className="mt-2"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Text>
                <Link to="/login" className="text-primary">
                  Back to Login
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
