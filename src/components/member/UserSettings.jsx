import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message,
  Upload,
  Avatar,
  TimePicker,
  Spin
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getCurrentUser } from '../../services/authService';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const UserSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Pre-fill form with user data
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          // Default settings
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          quietHours: [moment('22:00', 'HH:mm'), moment('08:00', 'HH:mm')],
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh'
        });
      } catch (error) {
        console.error('Error fetching user settings:', error);
        message.error('Không thể tải cài đặt người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [form]);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      // Process form values
      const settingsData = {
        ...values,
        quietHours: values.quietHours ? {
          start: values.quietHours[0].format('HH:mm'),
          end: values.quietHours[1].format('HH:mm')
        } : null
      };

      // Here you would call the API to update user settings
      // const response = await updateUserSettings(currentUser.user_id, settingsData);
      
      // Mock successful response
      message.success('Cập nhật cài đặt thành công');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Không thể cập nhật cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setSaving(true);
      
      // Here you would call the API to change password
      // const response = await changePassword(values.currentPassword, values.newPassword);
      
      message.success('Đổi mật khẩu thành công');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Cập nhật ảnh đại diện thành công');
    } else if (info.file.status === 'error') {
      message.error('Không thể tải lên ảnh đại diện');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  const renderProfileSettings = () => (
    <Card title="Thông tin cá nhân">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="text-center">
            <Avatar 
              size={120} 
              src={currentUser?.avatar} 
              icon={<UserOutlined />}
              className="mb-3"
            />
            <br />
            <Upload
              accept="image/*"
              showUploadList={false}
              onChange={handleAvatarUpload}
            >
              <Button icon={<UploadOutlined />}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
          </div>
        </Col>
        
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
              >
                <Input placeholder="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="bio"
                label="Giới thiệu bản thân"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Chia sẻ một chút về bản thân..."
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card title="Cài đặt thông báo">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            name="emailNotifications"
            label="Thông báo email"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Paragraph type="secondary">
            Nhận thông báo về tiến trình và nhắc nhở qua email
          </Paragraph>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="pushNotifications"
            label="Thông báo đẩy"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Paragraph type="secondary">
            Nhận thông báo đẩy trên trình duyệt
          </Paragraph>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="smsNotifications"
            label="Thông báo SMS"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Paragraph type="secondary">
            Nhận thông báo quan trọng qua SMS
          </Paragraph>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="quietHours"
            label="Giờ im lặng"
          >
            <TimePicker.RangePicker 
              format="HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
            />
          </Form.Item>
          <Paragraph type="secondary">
            Không nhận thông báo trong khoảng thời gian này
          </Paragraph>
        </Col>
      </Row>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card title="Bảo mật">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu hiện tại"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu mới"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Xác nhận mật khẩu mới"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button 
            type="primary" 
            onClick={() => form.validateFields(['currentPassword', 'newPassword', 'confirmPassword']).then(handleChangePassword)}
            loading={saving}
          >
            Đổi mật khẩu
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderPreferenceSettings = () => (
    <Card title="Tùy chọn">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name="language"
            label="Ngôn ngữ"
          >
            <Select placeholder="Chọn ngôn ngữ">
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="timezone"
            label="Múi giờ"
          >
            <Select placeholder="Chọn múi giờ">
              <Option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</Option>
              <Option value="Asia/Bangkok">GMT+7 (Bangkok)</Option>
              <Option value="Asia/Singapore">GMT+8 (Singapore)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const tabItems = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
    { key: 'notifications', label: 'Thông báo', icon: <BellOutlined /> },
    { key: 'security', label: 'Bảo mật', icon: <SecurityScanOutlined /> },
    { key: 'preferences', label: 'Tùy chọn', icon: <SettingOutlined /> }
  ];

  return (
    <div className="user-settings">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Title level={2}>
              <SettingOutlined className="me-2" />
              Cài đặt tài khoản
            </Title>
            <Paragraph>
              Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
            </Paragraph>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>

        {/* Settings Navigation */}
        <Card className="mb-4">
          <Space wrap>
            {tabItems.map(tab => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? 'primary' : 'default'}
                icon={tab.icon}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </Space>
        </Card>

        {/* Settings Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'preferences' && renderPreferenceSettings()}

          <Divider />

          <div className="text-center">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                size="large"
              >
                Lưu thay đổi
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Hủy bỏ
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserSettings;