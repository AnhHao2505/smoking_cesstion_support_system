import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Tag, Space, Avatar, Typography, 
  Modal, Form, DatePicker, Select, TimePicker, Input, 
  Tabs, Empty, message, Badge
} from 'antd';
import { 
  UserOutlined, VideoCameraOutlined, CalendarOutlined, 
  ClockCircleOutlined, PlusOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getMemberAppointments, 
  getCoachAvailability, 
  bookAppointment, 
  cancelAppointment 
} from '../../services/appointmentService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();
  const [cancelForm] = Form.useForm();
  
  // In a real app, this would come from authentication context
  const userId = 101;
  const coachId = 1;

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const appointmentsData = getMemberAppointments(userId);
        setAppointments(appointmentsData);
        
        // Get coach availability for next 7 days
        const startDate = moment().format('YYYY-MM-DD');
        const endDate = moment().add(7, 'days').format('YYYY-MM-DD');
        const availabilitySlots = getCoachAvailability(coachId, startDate, endDate);
        setAvailabilityData(availabilitySlots);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [userId, coachId]);

  const handleBookAppointment = () => {
    form.resetFields();
    setBookModalVisible(true);
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    cancelForm.resetFields();
    setCancelModalVisible(true);
  };

  const submitBookAppointment = async () => {
    try {
      const values = await form.validateFields();
      const appointmentData = {
        user_id: userId,
        coach_id: coachId,
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.time[0].format('HH:mm'),
        end_time: values.time[1].format('HH:mm'),
        type: values.type,
        notes: values.notes || ''
      };
      
      const response = await bookAppointment(appointmentData);
      
      if (response.success) {
        message.success(response.message);
        setBookModalVisible(false);
        
        // Add the new appointment to the list
        const newAppointment = {
          appointment_id: response.appointment_id,
          coach_id: coachId,
          coach_name: "Dr. Sarah Johnson", // This would be fetched from API in a real app
          photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
          date: appointmentData.date,
          start_time: appointmentData.start_time,
          end_time: appointmentData.end_time,
          type: appointmentData.type,
          status: "pending",
          notes: appointmentData.notes
        };
        
        setAppointments([...appointments, newAppointment]);
      } else {
        message.error(response.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const submitCancelAppointment = async () => {
    try {
      const values = await cancelForm.validateFields();
      const response = await cancelAppointment(selectedAppointment.appointment_id, values.reason);
      
      if (response.success) {
        message.success(response.message);
        setCancelModalVisible(false);
        
        // Update the appointment status in the list
        const updatedAppointments = appointments.map(appointment => {
          if (appointment.appointment_id === selectedAppointment.appointment_id) {
            return { ...appointment, status: "cancelled" };
          }
          return appointment;
        });
        
        setAppointments(updatedAppointments);
      } else {
        message.error(response.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  const columns = [
    {
      title: 'Coach',
      dataIndex: 'coach_name',
      key: 'coach_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text><CalendarOutlined /> {record.date}</Text>
          <Text><ClockCircleOutlined /> {record.start_time} - {record.end_time}</Text>
        </Space>
      )
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
      render: (status) => {
        let color, text;
        switch (status) {
          case 'confirmed':
            color = 'success';
            text = 'Confirmed';
            break;
          case 'pending':
            color = 'warning';
            text = 'Pending';
            break;
          case 'cancelled':
            color = 'error';
            text = 'Cancelled';
            break;
          case 'completed':
            color = 'default';
            text = 'Completed';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Badge status={color} text={text} />;
      }
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
      render: (_, record) => {
        // Don't show cancel button for completed or already cancelled appointments
        if (record.status === 'completed' || record.status === 'cancelled') {
          return null;
        }
        
        return (
          <Space size="small">
            {record.type === 'Video Call' && record.status === 'confirmed' && 
              moment(record.date).isSame(moment(), 'day') && (
              <Button type="primary" size="small">
                <VideoCameraOutlined /> Join
              </Button>
            )}
            <Button 
              type="danger" 
              size="small" 
              onClick={() => handleCancelAppointment(record)}
            >
              <CloseCircleOutlined /> Cancel
            </Button>
          </Space>
        );
      }
    }
  ];

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
    <div className="appointment-management">
      <div className="container py-4">
        <Title level={2}>Appointment Management</Title>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="My Appointments" key="1">
            <Card
              title="Your Appointments"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleBookAppointment}
                >
                  Book New Appointment
                </Button>
              }
            >
              <Table 
                dataSource={appointments} 
                columns={columns} 
                rowKey="appointment_id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab="Book Appointment" key="2">
            <Card title="Available Slots">
              <Paragraph>
                Select a date to view available appointment slots with your coach.
              </Paragraph>
              
              <DatePicker 
                onChange={onDateSelect} 
                style={{ marginBottom: 16 }}
                disabledDate={(current) => {
                  // Can't select days before today
                  return current && current < moment().startOf('day');
                }}
              />
              
              {selectedDate ? (
                <div>
                  <Title level={4}>Available slots for {selectedDate.format('MMMM D, YYYY')}</Title>
                  
                  {availabilityData
                    .filter(item => moment(item.date).isSame(selectedDate, 'day'))
                    .map(dateSlots => (
                      <div key={dateSlots.date} className="time-slots">
                        {dateSlots.slots
                          .filter(slot => slot.is_available)
                          .map((slot, index) => (
                            <Button 
                              key={index}
                              className="time-slot-button"
                              onClick={() => {
                                form.setFieldsValue({
                                  date: selectedDate,
                                  time: [
                                    moment(slot.start_time, 'HH:mm'),
                                    moment(slot.end_time, 'HH:mm')
                                  ]
                                });
                                setBookModalVisible(true);
                              }}
                            >
                              {slot.start_time} - {slot.end_time}
                            </Button>
                          ))}
                        
                        {dateSlots.slots.filter(slot => slot.is_available).length === 0 && (
                          <Empty description="No available slots for this date" />
                        )}
                      </div>
                    ))}
                  
                  {availabilityData.filter(item => moment(item.date).isSame(selectedDate, 'day')).length === 0 && (
                    <Empty description="No availability information for this date" />
                  )}
                </div>
              ) : (
                <Empty description="Please select a date to view available slots" />
              )}
            </Card>
          </TabPane>
        </Tabs>
        
        {/* Book Appointment Modal */}
        <Modal
          title="Book New Appointment"
          visible={bookModalVisible}
          onCancel={() => setBookModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setBookModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={submitBookAppointment}
            >
              Book Appointment
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  return current && current < moment().startOf('day');
                }}
              />
            </Form.Item>
            
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <TimePicker.RangePicker 
                format="HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="Appointment Type"
              rules={[{ required: true, message: 'Please select appointment type' }]}
            >
              <Select>
                <Option value="Video Call">Video Call</Option>
                <Option value="In-person">In-person</Option>
                <Option value="Phone Call">Phone Call</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="Notes (Optional)"
            >
              <TextArea rows={4} placeholder="Any specific topics you'd like to discuss?" />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Cancel Appointment Modal */}
        <Modal
          title="Cancel Appointment"
          visible={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setCancelModalVisible(false)}>
              Go Back
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              danger
              onClick={submitCancelAppointment}
            >
              Confirm Cancellation
            </Button>,
          ]}
        >
          {selectedAppointment && (
            <>
              <Paragraph>
                Are you sure you want to cancel your appointment with {selectedAppointment.coach_name} on {selectedAppointment.date} at {selectedAppointment.start_time}?
              </Paragraph>
              
              <Form
                form={cancelForm}
                layout="vertical"
              >
                <Form.Item
                  name="reason"
                  label="Reason for Cancellation"
                  rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                  <TextArea rows={4} placeholder="Please provide a reason for cancellation" />
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentManagement;