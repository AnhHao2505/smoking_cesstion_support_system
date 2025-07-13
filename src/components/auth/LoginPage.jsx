import React, { use, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography, Row, Col, Card, Alert, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [testUsers, setTestUsers] = useState({});
  
  useEffect(() => {
    const fetchTestUsers = async () => {
      const response = await authService.getTesters();
      console.log(response)
      setTestUsers(response || {});
    };
    
    fetchTestUsers();
  }, [])

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
      setLoginError(error.message || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={20} md={16} lg={12} xl={8}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Login</Title>
            
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
            
            {Object.keys(testUsers).length > 0 ? (
              <Alert
                message={
                  <div>
                    {testUsers.admin && (
                      <p><strong>Admin:</strong> {testUsers.admin.email} / {testUsers.admin.password}</p>
                    )}
                    {testUsers.coach && (
                      <p><strong>Coach:</strong> {testUsers.coach.email} / {testUsers.coach.password}</p>
                    )}
                    {testUsers.member_free && (
                      <p><strong>Member (Free):</strong> {testUsers.member_free.email} / {testUsers.member_free.password}</p>
                    )}
                    {testUsers.member_premium && (
                      <p style={{ marginBottom: 0 }}><strong>Member (Premium):</strong> {testUsers.member_premium.email} / {testUsers.member_premium.password}</p>
                    )}
                  </div>
                }
                type="info"
              />
            ) : (
              <Alert message="Loading demo accounts..." type="info" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;