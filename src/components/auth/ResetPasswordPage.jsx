import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card, Alert } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form] = Form.useForm();
  
  // Get email and OTP from navigation state
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    // Redirect to forgot password if no email or OTP provided
    if (!email || !otp) {
      navigate('/forgot-password');
      return;
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { newPassword } = values;
      
      // Call reset password API
      const response = await authService.resetPassword(email, otp, newPassword);
      
      if (response) {
        setSuccess('Password reset successfully! Redirecting to login page...');
        
        // Clear form and redirect to login
        form.resetFields();
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully. Please login with your new password.' 
            }
          });
        }, 2000);
      }
      
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters long!'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    const newPassword = form.getFieldValue('newPassword');
    if (value !== newPassword) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  if (!email || !otp) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Reset Password</Title>
            <Text className="text-center block mb-4" type="secondary">
              Enter your new password for<br />
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
                icon={<CheckCircleOutlined />}
                className="mb-4" 
              />
            )}
            
            <Form
              form={form}
              name="reset-password"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { validator: validatePassword }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Enter new password" 
                  size="large"
                  disabled={isLoading || !!success}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { validator: validateConfirmPassword }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm new password" 
                  size="large"
                  disabled={isLoading || !!success}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="mb-4">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Password requirements:
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                  </ul>
                </Text>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  size="large"
                  block
                  disabled={!!success}
                >
                  {success ? 'Password Reset Successfully' : 'Reset Password'}
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

export default ResetPasswordPage;
