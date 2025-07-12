import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { email } = values;
      
      // Send reset OTP
      const response = await authService.sendResetOtp(email);
      
      if (response) {
        setSuccess('OTP has been sent to your email. Please check your inbox and spam folder.');
        
        // Navigate to OTP verification page with email
        setTimeout(() => {
          navigate('/reset-password-otp', { state: { email } });
        }, 2000);
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset OTP. Please try again.');
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
                Back to Login
              </Button>
            </div>
            
            <Title level={2} className="text-center">Forgot Password</Title>
            <Text className="text-center block mb-4" type="secondary">
              Enter your email address and we'll send you an OTP to reset your password.
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
              name="forgot-password"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter your email address" 
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
                  disabled={!!success}
                >
                  {success ? 'OTP Sent' : 'Send Reset OTP'}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Remember your password?{' '}
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

export default ForgotPasswordPage;
