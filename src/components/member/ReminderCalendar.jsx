import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Calendar,
  Badge,
  Button,
  Space,
  Modal,
  List,
  Tag,
  Tooltip,
  Select,
  Row,
  Col,
  Alert,
  Empty
} from 'antd';
import {
  CalendarOutlined,
  BellOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getAllReminders,
  getRemindersByDate 
} from '../../services/reminderService';
import { getCurrentUser } from '../../services/authService';

const { Title, Text } = Typography;

const ReminderCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);

        const response = await getAllReminders(user.user_id);
        if (response.success) {
          setReminders(response.data.filter(r => r.enabled));
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const getRemindersForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return reminders.filter(reminder => {
      // Check if reminder should appear on this date based on frequency
      switch (reminder.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          if (reminder.weekdays) {
            return reminder.weekdays.includes(date.day());
          }
          return true;
        case 'monthly':
          if (reminder.monthDay) {
            return date.date() === reminder.monthDay;
          }
          return date.date() === 1;
        case 'once':
          return reminder.scheduledDate === dateStr;
        default:
          return false;
      }
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dayReminders = getRemindersForDate(date);
    setSelectedDateReminders(dayReminders);
    setModalVisible(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'HEALTH_BENEFITS': 'green',
      'MOTIVATIONAL_QUOTES': 'blue',
      'TIPS_AND_TRICKS': 'orange',
      'MILESTONE_CELEBRATIONS': 'purple',
      'SMOKING_FACTS': 'red'
    };
    return colors[category] || 'default';
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

  const dateCellRender = (date) => {
    const dayReminders = getRemindersForDate(date);
    
    if (dayReminders.length === 0) return null;

    return (
      <div className="calendar-reminders">
        {dayReminders.slice(0, 3).map(reminder => (
          <Badge
            key={reminder.id}
            color={getCategoryColor(reminder.category)}
            text={
              <Tooltip title={reminder.description}>
                <span className="reminder-title">
                  {reminder.title.length > 15 
                    ? `${reminder.title.substring(0, 15)}...` 
                    : reminder.title}
                </span>
              </Tooltip>
            }
            style={{ 
              display: 'block',
              marginBottom: 2,
              fontSize: '11px'
            }}
          />
        ))}
        {dayReminders.length > 3 && (
          <Badge
            color="default"
            text={`+${dayReminders.length - 3} khác`}
            style={{ fontSize: '10px' }}
          />
        )}
      </div>
    );
  };

  const monthCellRender = (date) => {
    const monthReminders = reminders.filter(reminder => {
      const reminderDate = moment(reminder.scheduledDate);
      return reminderDate.isSame(date, 'month');
    });

    if (monthReminders.length === 0) return null;

    return (
      <div className="month-reminders">
        <Badge count={monthReminders.length} style={{ backgroundColor: '#52c41a' }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reminder-calendar">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <CalendarOutlined /> Lịch nhắc nhở
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
              icon={<BellOutlined />}
              onClick={() => navigate('/member/reminders')}
            >
              Danh sách
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/member/reminders')}
            >
              Quay lại
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Card>
              <div className="calendar-controls mb-3">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Select
                      value={viewMode}
                      onChange={setViewMode}
                      style={{ width: 120 }}
                    >
                      <Select.Option value="month">Tháng</Select.Option>
                      <Select.Option value="year">Năm</Select.Option>
                    </Select>
                  </Col>
                  <Col>
                    <Text strong>
                      {selectedDate.format('MMMM YYYY')}
                    </Text>
                  </Col>
                </Row>
              </div>

              <Calendar
                mode={viewMode}
                dateCellRender={dateCellRender}
                monthCellRender={monthCellRender}
                onSelect={handleDateSelect}
                onPanelChange={(date, mode) => {
                  setSelectedDate(date);
                  setViewMode(mode);
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            {/* Today's Reminders */}
            <Card title="Nhắc nhở hôm nay" className="mb-4">
              {(() => {
                const todayReminders = getRemindersForDate(moment());
                return todayReminders.length > 0 ? (
                  <List
                    size="small"
                    dataSource={todayReminders}
                    renderItem={reminder => (
                      <List.Item style={{ padding: '8px 0' }}>
                        <List.Item.Meta
                          avatar={
                            <span style={{ fontSize: '16px' }}>
                              {getCategoryIcon(reminder.category)}
                            </span>
                          }
                          title={
                            <Text style={{ fontSize: '13px' }}>
                              {reminder.title}
                            </Text>
                          }
                          description={
                            <Space size="small">
                              {reminder.scheduledTime && (
                                <Tag size="small" color="blue">
                                  <ClockCircleOutlined /> {reminder.scheduledTime}
                                </Tag>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có nhắc nhở nào"
                    style={{ margin: '20px 0' }}
                  />
                );
              })()}
            </Card>

            {/* Legend */}
            <Card title="Chú thích" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {[
                  { category: 'HEALTH_BENEFITS', name: 'Sức khỏe' },
                  { category: 'MOTIVATIONAL_QUOTES', name: 'Động lực' },
                  { category: 'TIPS_AND_TRICKS', name: 'Mẹo hay' },
                  { category: 'MILESTONE_CELEBRATIONS', name: 'Cột mốc' },
                  { category: 'SMOKING_FACTS', name: 'Thông tin' }
                ].map(item => (
                  <div key={item.category}>
                    <Badge 
                      color={getCategoryColor(item.category)} 
                      text={item.name}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Date Detail Modal */}
        <Modal
          title={
            <Space>
              <CalendarOutlined />
              Nhắc nhở ngày {selectedDate.format('DD/MM/YYYY')}
            </Space>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Đóng
            </Button>,
            <Button 
              key="add" 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setModalVisible(false);
                navigate('/member/reminders/create');
              }}
            >
              Thêm nhắc nhở
            </Button>
          ]}
          width={600}
        >
          {selectedDateReminders.length > 0 ? (
            <List
              dataSource={selectedDateReminders}
              renderItem={reminder => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <span style={{ fontSize: '20px' }}>
                        {getCategoryIcon(reminder.category)}
                      </span>
                    }
                    title={reminder.title}
                    description={
                      <div>
                        <Text type="secondary">{reminder.description}</Text>
                        <br />
                        <Space size="small" className="mt-2">
                          <Tag color={getCategoryColor(reminder.category)}>
                            {reminder.category}
                          </Tag>
                          {reminder.scheduledTime && (
                            <Tag color="blue">
                              <ClockCircleOutlined /> {reminder.scheduledTime}
                            </Tag>
                          )}
                          {reminder.frequency && (
                            <Tag color="green">
                              {reminder.frequency}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="Không có nhắc nhở nào trong ngày này"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  navigate('/member/reminders/create');
                }}
              >
                Tạo nhắc nhở
              </Button>
            </Empty>
          )}
        </Modal>
      </div>

      <style jsx>{`
        .calendar-reminders {
          max-height: 60px;
          overflow: hidden;
        }
        
        .reminder-title {
          font-size: 11px;
          line-height: 1.2;
        }
        
        .month-reminders {
          position: absolute;
          top: 4px;
          right: 4px;
        }
        
        .ant-picker-calendar .ant-picker-panel .ant-picker-calendar-date {
          position: relative;
        }
        
        .ant-picker-calendar .ant-picker-content {
          height: auto;
          min-height: 60px;
        }
      `}</style>
    </div>
  );
};

export default ReminderCalendar;