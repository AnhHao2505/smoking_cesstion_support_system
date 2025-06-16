import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Table, 
  Avatar, 
  Tag, 
  Progress, 
  List, 
  Button, 
  Space, 
  Tabs,
  Badge,
  Alert,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  Modal,
  Checkbox,
  Tooltip,
  message
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  BellOutlined, 
  CalendarOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import * as coachScheduleService from '../../services/coachScheduleService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const CoachScheduleManagement = () => {
  const [supportedMembers, setSupportedMembers] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [importantNotifications, setImportantNotifications] = useState([]);
  const [availableSchedule, setAvailableSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false);
  const [appointmentForm] = Form.useForm();
  
  // In a real app, this would come from authentication context
  const coachId = 1;

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Fetch all data in parallel
        const members = coachScheduleService.getSupportedMembers(coachId);
        const appointments = coachScheduleService.getUpcomingAppointments(coachId);
        const notifications = coachScheduleService.getImportantNotifications(coachId);
        const schedule = coachScheduleService.getAvailableScheduleSlots(coachId);
        
        setSupportedMembers(members);
        setUpcomingAppointments(appointments);
        setImportantNotifications(notifications);
        setAvailableSchedule(schedule);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schedule data:", error);
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [coachId]);

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Column configuration for members table
  const memberColumns = [
    {
      title: 'Member',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Current Phase',
      dataIndex: 'current_phase',
      key: 'current_phase',
      render: (phase) => {
        let color = 'blue';
        if (phase === 'Preparation') color = 'orange';
        if (phase === 'Action') color = 'green';
        if (phase === 'Maintenance') color = 'purple';
        
        return <Tag color={color}>{phase}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    },
    {
      title: 'Days Smoke-Free',
      dataIndex: 'days_smoke_free',
      key: 'days_smoke_free',
    },
    {
      title: 'Next Appointment',
      dataIndex: 'next_appointment',
      key: 'next_appointment',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small">
            <CalendarOutlined /> Schedule
          </Button>
          <Button type="default" size="small">
            <UserOutlined /> Profile
          </Button>
        </Space>
      )
    }
  ];

  // Column configuration for appointments table
  const appointmentColumns = [
    {
      title: 'Member',
      dataIndex: 'member_name',
      key: 'member_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag icon={type === 'Video Call' ? <VideoCameraOutlined /> : null} color={type === 'Video Call' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'confirmed' ? 
          <Badge status="success" text="Confirmed" /> : 
          <Badge status="warning" text="Pending" />
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small">
            <EditOutlined /> Edit
          </Button>
          {record.type === 'Video Call' && (
            <Button type="default" size="small">
              <VideoCameraOutlined /> Join
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Handle availability toggle
  const handleAvailabilityToggle = (dayOfWeek, slotIndex, currentValue) => {
    const newValue = !currentValue;
    
    // Update the state optimistically
    const updatedSchedule = [...availableSchedule];
    const dayIndex = updatedSchedule.findIndex(day => day.day_of_week === dayOfWeek);
    
    if (dayIndex !== -1) {
      updatedSchedule[dayIndex].slots[slotIndex].is_available = newValue;
      setAvailableSchedule(updatedSchedule);
      
      // Call the service to update
      coachScheduleService.updateAvailabilityStatus(coachId, dayOfWeek, slotIndex, newValue)
        .then(response => {
          if (!response.success) {
            // Revert if failed
            updatedSchedule[dayIndex].slots[slotIndex].is_available = currentValue;
            setAvailableSchedule(updatedSchedule);
            message.error("Failed to update availability");
          } else {
            message.success("Availability updated successfully");
          }
        })
        .catch(error => {
          // Revert on error
          updatedSchedule[dayIndex].slots[slotIndex].is_available = currentValue;
          setAvailableSchedule(updatedSchedule);
          message.error("Error updating availability");
          console.error(error);
        });
    }
  };

  // Show new appointment modal
  const showNewAppointmentModal = () => {
    appointmentForm.resetFields();
    setIsAppointmentModalVisible(true);
  };

  // Handle new appointment submission
  const handleNewAppointmentSubmit = () => {
    appointmentForm.validateFields()
      .then(values => {
        const appointmentData = {
          coach_id: coachId,
          member_id: values.member_id,
          date: values.date.format('YYYY-MM-DD'),
          start_time: values.time[0].format('HH:mm'),
          end_time: values.time[1].format('HH:mm'),
          type: values.type,
          notes: values.notes
        };
        
        // Call the service to create appointment
        coachScheduleService.createAppointment(appointmentData)
          .then(response => {
            if (response.success) {
              message.success(response.message);
              setIsAppointmentModalVisible(false);
              
              // In a real app, you would fetch the updated appointments
              // For now, we'll just add a mock entry to the state
              const mockMember = supportedMembers.find(m => m.user_id === values.member_id);
              const newAppointment = {
                appointment_id: response.appointment_id,
                member_id: values.member_id,
                member_name: mockMember ? mockMember.full_name : "Unknown Member",
                photo_url: mockMember ? mockMember.photo_url : "",
                date: values.date.format('YYYY-MM-DD'),
                time: `${values.time[0].format('HH:mm')} - ${values.time[1].format('HH:mm')}`,
                type: values.type,
                status: "pending",
                notes: values.notes
              };
              
              setUpcomingAppointments([...upcomingAppointments, newAppointment]);
            } else {
              message.error("Failed to create appointment");
            }
          })
          .catch(error => {
            message.error("Error creating appointment");
            console.error(error);
          });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = importantNotifications.map(notification => 
      notification.notification_id === notificationId 
        ? { ...notification, is_read: true }
        : notification
    );
    
    setImportantNotifications(updatedNotifications);
    message.success("Notification marked as read");
  };

  return (
    <div className="dashboard coach-dashboard">
      <div className="container py-4">
        <Title level={2}>
          <ScheduleOutlined /> Schedule Management
        </Title>
        
        {/* Unread Notifications Alert */}
        {importantNotifications.filter(n => !n.is_read).length > 0 && (
          <Alert
            message="Important Notifications"
            description={`You have ${importantNotifications.filter(n => !n.is_read).length} unread notifications`}
            type="warning"
            showIcon
            closable
            className="mb-4"
          />
        )}
        
        {/* Main Dashboard Content */}
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          {/* Members Overview */}
          <TabPane tab={<span><TeamOutlined /> Supported Members</span>} key="1">
            <Card>
              <div className="table-header">
                <Title level={4}>Members Overview</Title>
                <Button type="primary" icon={<PlusOutlined />}>
                  Add New Member
                </Button>
              </div>
              <Table 
                dataSource={supportedMembers} 
                columns={memberColumns} 
                rowKey="user_id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          {/* Appointments */}
          <TabPane tab={<span><CalendarOutlined /> Appointments</span>} key="2">
            <Card>
              <div className="table-header">
                <Title level={4}>Upcoming Appointments</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={showNewAppointmentModal}
                >
                  Schedule New Appointment
                </Button>
              </div>
              <Table 
                dataSource={upcomingAppointments} 
                columns={appointmentColumns} 
                rowKey="appointment_id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          {/* Notifications */}
          <TabPane tab={<span><BellOutlined /> Notifications</span>} key="3">
            <Card>
              <Title level={4}>Important Notifications</Title>
              <List
                itemLayout="horizontal"
                dataSource={importantNotifications}
                renderItem={notification => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        onClick={() => markNotificationAsRead(notification.notification_id)}
                        disabled={notification.is_read}
                      >
                        Mark as read
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            notification.type === 'warning' ? <WarningOutlined /> : 
                            notification.type === 'alert' ? <BellOutlined /> : 
                            <InfoCircleOutlined />
                          } 
                          style={{ 
                            backgroundColor: 
                              notification.type === 'warning' ? '#fa8c16' : 
                              notification.type === 'alert' ? '#f5222d' : 
                              '#1890ff' 
                          }} 
                        />
                      }
                      title={
                        <Space>
                          {notification.content}
                          {!notification.is_read && <Badge dot status="processing" />}
                        </Space>
                      }
                      description={
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">{notification.sent_at}</Text>
                          <Tag color={
                            notification.type === 'warning' ? 'orange' : 
                            notification.type === 'alert' ? 'red' : 
                            'blue'
                          }>
                            {notification.type}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
          
          {/* Schedule Management */}
          <TabPane tab={<span><ScheduleOutlined /> Availability</span>} key="4">
            <Card>
              <Title level={4}>Your Weekly Availability</Title>
              <Paragraph>
                Toggle the checkboxes to update your availability for appointments.
              </Paragraph>
              
              <div className="schedule-grid">
                <Row gutter={[16, 16]} className="schedule-header">
                  <Col span={4}><Text strong>Day</Text></Col>
                  <Col span={20}>
                    <Row>
                      <Col span={6}><Text strong>Morning</Text></Col>
                      <Col span={6}><Text strong>Late Morning</Text></Col>
                      <Col span={6}><Text strong>Afternoon</Text></Col>
                      <Col span={6}><Text strong>Late Afternoon</Text></Col>
                    </Row>
                  </Col>
                </Row>
                
                {availableSchedule.map((day, dayIndex) => (
                  <Row gutter={[16, 16]} key={dayIndex} className="schedule-row">
                    <Col span={4}><Text strong>{day.day_of_week}</Text></Col>
                    <Col span={20}>
                      <Row>
                        {day.slots.map((slot, slotIndex) => (
                          <Col span={6} key={slotIndex}>
                            <Checkbox 
                              checked={slot.is_available}
                              onChange={() => handleAvailabilityToggle(day.day_of_week, slotIndex, slot.is_available)}
                            >
                              <Tooltip title={`${slot.start_time} - ${slot.end_time}`}>
                                {slot.start_time} - {slot.end_time}
                              </Tooltip>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                  </Row>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>
        
        {/* New Appointment Modal */}
        <Modal
          title="Schedule New Appointment"
          visible={isAppointmentModalVisible}
          onOk={handleNewAppointmentSubmit}
          onCancel={() => setIsAppointmentModalVisible(false)}
          okText="Create Appointment"
          cancelText="Cancel"
        >
          <Form
            form={appointmentForm}
            layout="vertical"
          >
            <Form.Item
              name="member_id"
              label="Select Member"
              rules={[{ required: true, message: 'Please select a member' }]}
            >
              <Select placeholder="Select a member">
                {supportedMembers.map(member => (
                  <Option key={member.user_id} value={member.user_id}>
                    <Space>
                      <Avatar size="small" src={member.photo_url} icon={<UserOutlined />} />
                      {member.full_name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="date"
              label="Appointment Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="time"
              label="Appointment Time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="Appointment Type"
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select placeholder="Select appointment type">
                <Option value="Video Call">Video Call</Option>
                <Option value="In-person">In-person</Option>
                <Option value="Phone Call">Phone Call</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea rows={4} placeholder="Enter any notes or details about this appointment" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CoachScheduleManagement;