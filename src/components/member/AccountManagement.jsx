import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Descriptions,
  Tag,
  Alert,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

const AccountManagement = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching account data:', error);
        message.error('Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  const handleEditProfile = () => {
    form.setFieldsValue({
      name: currentUser?.name,
      contactNumber: currentUser?.contactNumber
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      
      // Here you would call API to update user profile
      // const response = await updateUserProfile(currentUser.user_id, values);
      
      setCurrentUser(prev => ({ ...prev, ...values }));
      message.success('Cập nhật thông tin thành công');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin');
    }
  };

  const handleDeleteAccount = () => {
    confirm({
      title: 'Xác nhận xóa tài khoản',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
      okText: 'Xóa tài khoản',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setDeleteModalVisible(true);
      },
    });
  };

  const handleConfirmDelete = async () => {
    try {
      // Here you would call API to delete account
      // const response = await deleteAccount(currentUser.user_id);
      
      message.success('Tài khoản đã được xóa thành công');
      // Redirect to login or home page
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      message.error('Không thể xóa tài khoản');
    }
  };

  const handleExportData = async () => {
    try {
      // Here you would call API to export user data
      // const response = await exportUserData(currentUser.user_id);
      
      message.success('Dữ liệu đã được xuất thành công');
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('Không thể xuất dữ liệu');
    }
  };

  // Mock activity data
  const recentActivities = [
    {
      id: 1,
      action: 'Cập nhật tiến trình hàng ngày',
      timestamp: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm'),
      type: 'update'
    },
    {
      id: 2,
      action: 'Hoàn thành nhiệm vụ "Không hút thuốc trong 24h"',
      timestamp: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm'),
      type: 'achievement'
    },
    {
      id: 3,
      action: 'Thay đổi mật khẩu',
      timestamp: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm'),
      type: 'security'
    },
    {
      id: 4,
      action: 'Tạo kế hoạch cai thuốc mới',
      timestamp: moment().subtract(1, 'weeks').format('YYYY-MM-DD HH:mm'),
      type: 'plan'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'update': return <EditOutlined style={{ color: '#1890ff' }} />;
      case 'achievement': return <CrownOutlined style={{ color: '#faad14' }} />;
      case 'security': return <SecurityScanOutlined style={{ color: '#52c41a' }} />;
      case 'plan': return <SettingOutlined style={{ color: '#722ed1' }} />;
      default: return <UserOutlined />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="account-management">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Title level={2}>
              <UserOutlined className="me-2" />
              Quản lý tài khoản
            </Title>
            <Paragraph>
              Xem và quản lý thông tin tài khoản của bạn
            </Paragraph>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {/* Account Information */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin tài khoản" className="mb-4">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Họ và tên">
                  {currentUser?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {currentUser?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {currentUser?.contactNumber || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Loại tài khoản">
                  {currentUser?.premiumMembership ? (
                    <Tag color="gold" icon={<CrownOutlined />}>Premium</Tag>
                  ) : (
                    <Tag color="blue">Miễn phí</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo tài khoản">
                  {currentUser?.createdAt ? 
                    moment(currentUser.createdAt).format('DD/MM/YYYY') : 
                    'Không xác định'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Lần đăng nhập cuối">
                  {currentUser?.lastLogin ? 
                    moment(currentUser.lastLogin).format('DD/MM/YYYY HH:mm') : 
                    'Không xác định'
                  }
                </Descriptions.Item>
              </Descriptions>
              
              <div className="text-center mt-4">
                <Space>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/member/user-settings')}
                  >
                    Cài đặt tài khoản
                  </Button>
                </Space>
              </div>
            </Card>

            {/* Account Statistics */}
            <Card title="Thống kê tài khoản">
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <div className="stat-item text-center">
                    <div className="stat-number">15</div>
                    <div className="stat-label">Ngày cai thuốc</div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="stat-item text-center">
                    <div className="stat-number">8</div>
                    <div className="stat-label">Nhiệm vụ hoàn thành</div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="stat-item text-center">
                    <div className="stat-number">3</div>
                    <div className="stat-label">Huy hiệu đạt được</div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="stat-item text-center">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Lần đăng nhập</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Quick Actions & Activity */}
          <Col xs={24} lg={8}>
            {/* Quick Actions */}
            <Card title="Hành động nhanh" className="mb-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block 
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/member/user-settings')}
                >
                  Cài đặt tài khoản
                </Button>
                <Button 
                  block 
                  icon={<CrownOutlined />}
                  onClick={() => navigate('/member/premium-upgrade')}
                  type={currentUser?.premiumMembership ? 'default' : 'primary'}
                >
                  {currentUser?.premiumMembership ? 'Quản lý Premium' : 'Nâng cấp Premium'}
                </Button>
                <Button 
                  block 
                  icon={<DownloadOutlined />}
                  onClick={handleExportData}
                >
                  Xuất dữ liệu
                </Button>
              </Space>
            </Card>

            {/* Recent Activity */}
            <Card title="Hoạt động gần đây">
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={activity => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={getActivityIcon(activity.type)} />}
                      title={activity.action}
                      description={activity.timestamp}
                    />
                  </List.Item>
                )}
              />
              <div className="text-center mt-3">
                <Button 
                  type="link" 
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/member/activity-history')}
                >
                  Xem tất cả hoạt động
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Danger Zone */}
        <Card title="Vùng nguy hiểm" className="danger-zone">
          <Alert
            message="Cảnh báo"
            description="Các hành động dưới đây có thể ảnh hưởng vĩnh viễn đến tài khoản của bạn."
            type="warning"
            showIcon
            className="mb-3"
          />
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDeleteAccount}
          >
            Xóa tài khoản
          </Button>
        </Card>

        {/* Edit Profile Modal */}
        <Modal
          title="Chỉnh sửa thông tin"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setEditModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveProfile}>
              Lưu thay đổi
            </Button>
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item
              name="contactNumber"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          title="Xác nhận xóa tài khoản"
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="delete" type="primary" danger onClick={handleConfirmDelete}>
              Xóa tài khoản
            </Button>
          ]}
        >
          <Alert
            message="Cảnh báo nghiêm trọng"
            description="Việc xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm kế hoạch cai thuốc, tiến trình và thông tin cá nhân. Hành động này không thể hoàn tác."
            type="error"
            showIcon
            className="mb-3"
          />
          <Paragraph>
            Để xác nhận xóa tài khoản, vui lòng nhập <Text strong>XÓA TÀI KHOẢN</Text> vào ô bên dưới:
          </Paragraph>
          <Input placeholder="Nhập 'XÓA TÀI KHOẢN' để xác nhận" />
        </Modal>
      </div>
    </div>
  );
};

export default AccountManagement;