import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  
  // Get email and OTP validation flag from navigation state
  const email = location.state?.email;
  const otpValidated = location.state?.otpValidated;

  useEffect(() => {
    // Redirect to forgot password if no email or OTP not validated
    if (!email || !otpValidated) {
      navigate('/forgot-password');
      return;
    }
  }, [email, otpValidated, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const { newPassword } = values;
      
      // Frontend validation for password length
      if (newPassword.length < 8) {
        return;
      }
      
      // Call reset password API (OTP already validated in previous step)
      const response = await authService.resetPassword(email, newPassword);
      
      // Check if response is successful
      if (response && response.success) {
        setSuccess(true);
        
        // Clear form and redirect to login
        form.resetFields();
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' 
            }
          });
        }, 2000);
      }
      
    } catch (error) {
      // Error will be handled by popup/notification system
      console.log('Reset password failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng xác nhận mật khẩu!'));
    }
    const newPassword = form.getFieldValue('newPassword');
    if (value !== newPassword) {
      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
    }
    return Promise.resolve();
  };

  if (!email || !otpValidated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Đặt lại mật khẩu</Title>
            <Text className="text-center block mb-4" type="secondary">
              Nhập mật khẩu mới cho<br />
              <strong>{email}</strong>
            </Text>
            
            <Form
              form={form}
              name="reset-password"
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { validator: validatePassword }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Nhập mật khẩu mới" 
                  size="large"
                  disabled={isLoading || !!success}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { validator: validateConfirmPassword }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Xác nhận mật khẩu mới" 
                  size="large"
                  disabled={isLoading || !!success}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="mb-4">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Yêu cầu mật khẩu:
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Ít nhất 8 ký tự</li>
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
                  {success ? 'Mật khẩu đã được đặt lại thành công' : 'Đặt lại mật khẩu'}
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

export default ResetPasswordPage;
