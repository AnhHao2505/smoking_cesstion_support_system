import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Select, Checkbox, Typography, Row, Col, Card, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/global.css';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setRegisterError('');
    setRegisterSuccess('');
    
    try {
      // Remove confirmPassword and agreeTerms before sending to API
      const { confirmPassword, agreeTerms, ...userData } = values;
      
      const response = await authService.register(userData);
      
      setIsLoading(false);
      setRegisterSuccess(response.message || 'Registration successful! You can now log in.');
      
      form.resetFields();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      setRegisterError(error.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={22} md={20} lg={16} xl={14}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Create an Account</Title>
            
            {registerError && (
              <Alert 
                message={registerError} 
                type="error" 
                showIcon 
                className="mb-4" 
              />
            )}
            
            {registerSuccess && (
              <Alert 
                message={registerSuccess} 
                type="success" 
                showIcon 
                className="mb-4" 
              />
            )}
            
            <Form
              form={form}
              name="register"
              layout="vertical"
              onFinish={handleSubmit}
              scrollToFirstError
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[
                      { required: true, message: 'Please input your full name!' },
                      { min: 2, message: 'Name must be at least 2 characters' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter your full name"
                      size="large" 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
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
                      placeholder="Enter your email"
                      size="large" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: 'Please input your password!' },
                      { min: 8, message: 'Password must be at least 8 characters' },
                      { 
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    ]}
                    hasFeedback
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Create a password"
                      size="large" 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Confirm your password"
                      size="large" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactNumber"
                    label="Contact Number"
                    rules={[
                      { required: true, message: 'Please input your phone number!' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="Enter your phone number"
                      size="large" 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="role"
                    label="I want to register as"
                    initialValue="member"
                    rules={[
                      { required: true, message: 'Please select your role!' }
                    ]}
                  >
                    <Select size="large">
                      <Option value="member">Member (I want to quit smoking)</Option>
                      <Option value="coach">Coach (I want to help others quit)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms and conditions')),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  size="large"
                  block
                >
                  Register
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Login here
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;