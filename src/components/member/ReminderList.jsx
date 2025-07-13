import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  List,
  Tag,
  Switch,
  Modal,
  message,
  Input,
  Select,
  Tooltip,
  Badge,
  Avatar,
  Popconfirm,
  Dropdown,
  Menu,
  Empty,
  Pagination
} from 'antd';
import {
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getAllReminders,
  updateReminder,
  deleteReminder,
  toggleReminder 
} from '../../services/reminderService';
import { getCurrentUser } from '../../services/authService';
import * as authService from '../../services/authService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ReminderList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loginReminder, setLoginReminder] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);

        // Load login reminder if exists
        const reminder = authService.getLoginReminder();
        if (reminder) {
          setLoginReminder(reminder);
        }

        const response = await getAllReminders(user.user_id);
        if (response.success) {
          setReminders(response.data);
          setFilteredReminders(response.data);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
        message.error('Không thể tải danh sách nhắc nhở');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [reminders, searchText, filterCategory, filterStatus]);

  const filterReminders = () => {
    let filtered = [...reminders];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(reminder =>
        reminder.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(reminder => reminder.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reminder => {
        if (filterStatus === 'active') return reminder.enabled;
        if (filterStatus === 'inactive') return !reminder.enabled;
        return true;
      });
    }

    setFilteredReminders(filtered);
    setCurrentPage(1);
  };

  const handleToggleReminder = async (reminderId, enabled) => {
    try {
      const response = await toggleReminder(reminderId, enabled);
      if (response.success) {
        setReminders(prev => prev.map(reminder =>
          reminder.id === reminderId ? { ...reminder, enabled } : reminder
        ));
        message.success(enabled ? 'Bật nhắc nhở thành công' : 'Tắt nhắc nhở thành công');
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      message.error('Không thể thay đổi trạng thái nhắc nhở');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const response = await deleteReminder(reminderId);
      if (response.success) {
        setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
        message.success('Xóa nhắc nhở thành công');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      message.error('Không thể xóa nhắc nhở');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'HEALTH_BENEFITS': '💚',
      'MOTIVATIONAL_QUOTES': '💪',
      'TIPS_AND_TRICKS': '💡',
      'MILESTONE_CELEBRATIONS': '🏆',
      'SMOKING_FACTS': '📊'
    };
    return icons[category] || '🔔';
  };

  const getCategoryName = (category) => {
    const names = {
      'HEALTH_BENEFITS': 'Lợi ích sức khỏe',
      'MOTIVATIONAL_QUOTES': 'Động lực',
      'TIPS_AND_TRICKS': 'Mẹo và thủ thuật',
      'MILESTONE_CELEBRATIONS': 'Kỷ niệm cột mốc',
      'SMOKING_FACTS': 'Thông tin về thuốc lá'
    };
    return names[category] || category;
  };

  const getFrequencyText = (frequency) => {
    const texts = {
      'once': 'Một lần',
      'daily': 'Hàng ngày',
      'weekly': 'Hàng tuần',
      'monthly': 'Hàng tháng',
      'multiple_daily': 'Nhiều lần/ngày',
      'hourly': 'Mỗi giờ',
      'custom': 'Tùy chỉnh'
    };
    return texts[frequency] || frequency;
  };

  const reminderActionMenu = (reminder) => (
    <Menu>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => navigate(`/member/reminders/edit/${reminder.id}`)}
      >
        Chỉnh sửa
      </Menu.Item>
      <Menu.Item 
        key="toggle" 
        icon={reminder.enabled ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={() => handleToggleReminder(reminder.id, !reminder.enabled)}
      >
        {reminder.enabled ? 'Tạm dừng' : 'Kích hoạt'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          Modal.confirm({
            title: 'Xóa nhắc nhở',
            content: 'Bạn có chắc muốn xóa nhắc nhở này?',
            onOk: () => handleDeleteReminder(reminder.id)
          });
        }}
      >
        Xóa
      </Menu.Item>
    </Menu>
  );

  // Clear login reminder
  const clearLoginReminder = () => {
    authService.clearLoginReminder();
    setLoginReminder(null);
    message.success('Đã xóa nhắc nhở đăng nhập');
  };

  const paginatedData = filteredReminders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="reminder-list">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <BellOutlined /> Danh sách nhắc nhở
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/member/reminders/create')}
            >
              Tạo nhắc nhở
            </Button>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => navigate('/member/reminders/calendar')}
            >
              Lịch
            </Button>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => navigate('/member/reminders/settings')}
            >
              Cài đặt
            </Button>
          </Space>
        </div>

        {/* Login Reminder Section */}
        {loginReminder && (
          <Card 
            title={
              <span>
                <BellOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Nhắc nhở từ hệ thống
              </span>
            }
            style={{ marginBottom: '16px' }}
            extra={
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={clearLoginReminder}
                size="small"
              >
                Xóa
              </Button>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                  {loginReminder}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Nhắc nhở từ lần đăng nhập gần nhất
                </Text>
              </div>
              <Tag color="blue">Hệ thống</Tag>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm kiếm nhắc nhở..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: '100%' }}
                placeholder="Danh mục"
              >
                <Option value="all">Tất cả danh mục</Option>
                <Option value="HEALTH_BENEFITS">Lợi ích sức khỏe</Option>
                <Option value="MOTIVATIONAL_QUOTES">Động lực</Option>
                <Option value="TIPS_AND_TRICKS">Mẹo và thủ thuật</Option>
                <Option value="MILESTONE_CELEBRATIONS">Kỷ niệm cột mốc</Option>
                <Option value="SMOKING_FACTS">Thông tin về thuốc lá</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                placeholder="Trạng thái"
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Đang hoạt động</Option>
                <Option value="inactive">Đã tắt</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Text type="secondary">
                {filteredReminders.length} nhắc nhở
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Reminder List */}
        <Card>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredReminders.length === 0 ? (
            <Empty 
              description="Chưa có nhắc nhở nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/member/reminders/create')}
              >
                Tạo nhắc nhở đầu tiên
              </Button>
            </Empty>
          ) : (
            <>
              <List
                dataSource={paginatedData}
                renderItem={reminder => (
                  <List.Item
                    actions={[
                      <Switch
                        checked={reminder.enabled}
                        onChange={(checked) => handleToggleReminder(reminder.id, checked)}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                      />,
                      <Dropdown overlay={reminderActionMenu(reminder)} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!reminder.enabled} color="red">
                          <Avatar 
                            style={{ 
                              backgroundColor: reminder.enabled ? '#52c41a' : '#d9d9d9',
                              fontSize: '18px'
                            }}
                          >
                            {getCategoryIcon(reminder.category)}
                          </Avatar>
                        </Badge>
                      }
                      title={
                        <div>
                          <Space>
                            <Text strong={reminder.enabled}>{reminder.title}</Text>
                            {!reminder.enabled && <Tag color="red">Đã tắt</Tag>}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">{reminder.description}</Text>
                          <br />
                          <Space size="small" className="mt-2">
                            <Tag color="blue">{getCategoryName(reminder.category)}</Tag>
                            <Tag color="green">{getFrequencyText(reminder.frequency)}</Tag>
                            {reminder.scheduledTime && (
                              <Tag color="orange">
                                <ClockCircleOutlined /> {reminder.scheduledTime}
                              </Tag>
                            )}
                            {reminder.nextReminder && (
                              <Text type="secondary">
                                Tiếp theo: {moment(reminder.nextReminder).format('DD/MM HH:mm')}
                              </Text>
                            )}
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              {filteredReminders.length > pageSize && (
                <div className="text-center mt-4">
                  <Pagination
                    current={currentPage}
                    total={filteredReminders.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} nhắc nhở`
                    }
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReminderList;