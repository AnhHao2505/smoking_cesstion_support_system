import React, { use, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography, Row, Col, Card, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';
import { getMyProfile } from '../../services/memberProfileService';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    // Check for success message from password reset
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state after showing the message
      navigate('/login', { replace: true });
    }
  }, [location.state, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Extract email and password exactly as required by API
      const { email, password } = values;
      
      // Call login service with exact parameters
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user, reminder } = response;
        const role = user.role?.toLowerCase();
        const userId = user.userId;
        if(role === 'member' ) {
          const me = await getMyProfile(userId);
          console.log(me)
          localStorage.setItem('me', JSON.stringify(me));
        }
        
        // If there's a reminder, show it as a toast and navigate to home
        if (reminder) {
          navigate('/home');
        } else {
          // Redirect based on user role if no reminder
          if (role === 'member') {
            navigate('/member/dashboard');
          } else if (role === 'coach') {
            navigate('/coach/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
      setLoginError(error.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Đăng nhập</Title>
            
            {successMessage && (
              <Alert 
                message={successMessage} 
                type="success" 
                showIcon 
                className="mb-4" 
                closable
                onClose={() => setSuccessMessage('')}
              />
            )}
            
            {loginError && (
              <Alert 
                message={loginError} 
                type="error" 
                showIcon 
                className="mb-4" 
              />
            )}
            
            <Form
              form={form}
              name="login"
              layout="vertical"
              initialValues={{ remember: true }}
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
                  prefix={<UserOutlined />} 
                  placeholder="Nhập email của bạn" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Nhập mật khẩu của bạn" 
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between" align="middle">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password" className="text-primary">
                    Quên mật khẩu?
                  </Link>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  size="large"
                  block
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary">
                  Đăng ký tại đây
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;