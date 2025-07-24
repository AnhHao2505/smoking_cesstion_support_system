import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Select, Checkbox, Typography, Row, Col, Card, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
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
      // Extract only the required fields for the API
      const { name, email, password } = values;
      
      const response = await authService.register(name, email, password);
      setIsLoading(false);
      setRegisterSuccess(response.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      
      form.resetFields();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      setRegisterError(error.message || 'Có lỗi xảy ra trong quá trình đăng ký');
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle">
        <Col xs={22} sm={22} md={20} lg={16} xl={14}>
          <Card className="auth-card" bordered={false}>
            <Title level={2} className="text-center">Tạo tài khoản</Title>
            
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
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' },
                  { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Nhập họ và tên của bạn"
                  size="large" 
                />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Nhập email của bạn"
                  size="large" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                ]}
                hasFeedback
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Tạo mật khẩu"
                  size="large" 
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Xác nhận mật khẩu"
                  size="large" 
                />
              </Form.Item>

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với các điều khoản và điều kiện')),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đồng ý với <Link to="/terms">Điều khoản & Điều kiện</Link> và <Link to="/privacy">Chính sách bảo mật</Link>
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
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary">
                  Đăng nhập tại đây
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