import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography, Row, Col, Card, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Extract email and password exactly as required by API
      const { email, password } = values;
      
      // Call login service with exact parameters
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user } = response;
        const role = user.role?.toLowerCase();
        
        // Redirect based on user role
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
    } catch (error) {
      setIsLoading(false);
      setLoginError(error.message || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Login</Title>
            
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
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter your email" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Enter your password" 
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between" align="middle">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password" className="text-primary">
                    Forgot Password?
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
                  Login
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary">
                  Register here
                </Link>
              </Text>
            </div>

            <Divider>Demo Accounts</Divider>
            
            <Alert
              message={
                <div>
                  <p><strong>Member:</strong> member@example.com / password123</p>
                  <p><strong>Coach:</strong> coach@example.com / password123</p>
                  <p style={{ marginBottom: 0 }}><strong>Admin:</strong> admin@example.com / password123</p>
                </div>
              }
              type="info"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;