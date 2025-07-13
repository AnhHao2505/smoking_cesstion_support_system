import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Progress,
  TimePicker,
  Spin
} from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  StarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  getAllCoaches,
  createCoach,
  getCoachSpecialties,
  getCoachProfile
} from '../../services/coachManagementService';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [form] = Form.useForm();
  const [workingHoursForm] = Form.useForm();
  const [specialties, setSpecialties] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  useEffect(() => {
    fetchCoaches();
    fetchSpecialties();
  }, [pagination.current, pagination.pageSize]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(pagination.current - 1, pagination.pageSize);
      
      if (response && response.content) {
        // Ensure each coach has the expected structure from API:
        // coachId, name, email, certificates, contact_number, workingHours, currentMemberAssignedCount, full
        setCoaches(response.content);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements,
          pageNo: response.pageNo,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          last: response.last
        }));
      } else {
        setCoaches([]);
        message.warning('No coaches found');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error("Failed to load coaches. Please try again later.");
      setCoaches([]);
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const specialtiesData = await getCoachSpecialties();
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total
    });
  };

  const showCreateModal = () => {
    form.resetFields();
    workingHoursForm.resetFields();
    setWorkingHours([]);
    setModalVisible(true);
  };

  const showProfileModal = (coach) => {
    setSelectedCoach(coach);
    setProfileModalVisible(true);
  };

  const addWorkingHour = () => {
    workingHoursForm.validateFields()
      .then(values => {
        const newWorkingHour = {
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime.format('HH:mm'),
          endTime: values.endTime.format('HH:mm')
        };
        
        setWorkingHours([...workingHours, newWorkingHour]);
        workingHoursForm.resetFields();
        message.success('Working hour added successfully');
      })
      .catch(error => {
        console.error('Working hours validation failed:', error);
      });
  };

  const removeWorkingHour = (index) => {
    const newWorkingHours = workingHours.filter((_, i) => i !== index);
    setWorkingHours(newWorkingHours);
  };

  const handleSubmit = async () => {
    try {
      setCreating(true);
      const values = await form.validateFields();
      
      // Format data according to API spec for POST /coach/create
      // Expected format: { name, email, password, contact_number, certificates, bio, specialty, workingHours }
      const formattedData = {
        name: values.name,
        email: values.email,
        password: values.password,
        contact_number: values.contact_number,
        certificates: values.certificates,
        bio: values.bio,
        specialty: values.specialty,
        workingHours: workingHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime,
          endTime: hour.endTime
        }))
      };

      const response = await createCoach(formattedData);
      
      if (response) {
        message.success('Coach created successfully!');
        setModalVisible(false);
        form.resetFields();
        workingHoursForm.resetFields();
        setWorkingHours([]);
        
        // Refresh coaches list
        fetchCoaches();
      }
    } catch (error) {
      console.error("Error creating coach:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Failed to create coach. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  const fetchCoachProfile = async (coachId) => {
    try {
      setProfileLoading(true);
      const response = await getCoachProfile(coachId);
      const profileData = response.data || response; // Handle both response formats
      
      // Populate the form with coach profile data
      form.setFieldsValue({
        name: profileData.name,
        email: profileData.email,
        contact_number: profileData.contactNumber || profileData.contact_number,
        certificates: profileData.certificates,
        bio: profileData.bio,
        specialty: profileData.specialty
      });
      
      setWorkingHours(profileData.workingHour || profileData.workingHours || []);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      message.error("Failed to load coach profile. Please try again later.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewProfile = async (coachId) => {
    try {
      setProfileLoading(true);
      setProfileModalVisible(true);
      
      const response = await getCoachProfile(coachId);
      const profileData = response.data || response; // Handle both response formats
      
      // Map API response to expected format
      const mappedProfile = {
        ...profileData,
        contact_number: profileData.contactNumber || profileData.contact_number,
        workingHours: profileData.workingHour || profileData.workingHours || [],
        currentMemberAssignedCount: profileData.currentMemberAssignedCount || 0,
        full: profileData.full || false
      };
      
      setSelectedCoach(mappedProfile);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      message.error("Failed to load coach profile. Please try again.");
      setProfileModalVisible(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setSelectedCoach(null);
  };

  const getWorkingHoursDisplay = (workingHours) => {
    if (!workingHours || workingHours.length === 0) {
      return "No schedule available";
    }
    
    return workingHours.map(schedule => 
      `${schedule.dayOfWeek}: ${schedule.startTime} - ${schedule.endTime}`
    ).join(', ');
  };

  const getAvailabilityStatus = (coach) => {
    if (coach.full) {
      return { color: 'red', text: 'Full' };
    }
    
    const availableSlots = 20 - coach.currentMemberAssignedCount;
    if (availableSlots > 10) {
      return { color: 'green', text: 'Available' };
    } else if (availableSlots > 5) {
      return { color: 'orange', text: 'Limited' };
    } else {
      return { color: 'red', text: 'Almost Full' };
    }
  };

  const columns = [
    {
      title: 'Coach',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: '16px' }}>{text}</Text>
            <br />
            <Text type="secondary"><MailOutlined /> {record.email}</Text>
          </div>
        </Space>
      ),
      width: 250
    },
    {
      title: 'Contact',
      dataIndex: 'contact_number',
      key: 'contact_number',
      render: (contact) => (
        <Text><PhoneOutlined /> {contact}</Text>
      )
    },
    {
      title: 'Certificates',
      dataIndex: 'certificates',
      key: 'certificates',
      render: (certificates) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {certificates || 'Not specified'}
        </Text>
      ),
      ellipsis: true
    },
    {
      title: 'Working Hours',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (workingHours) => (
        <div>
          {workingHours && workingHours.length > 0 ? (
            workingHours.slice(0, 2).map((schedule, index) => (
              <div key={index} style={{ fontSize: '12px' }}>
                <Text><ClockCircleOutlined /> {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}</Text>
              </div>
            ))
          ) : (
            <Text type="secondary">No schedule</Text>
          )}
          {workingHours && workingHours.length > 2 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              +{workingHours.length - 2} more...
            </Text>
          )}
        </div>
      ),
      width: 200
    },
    {
      title: 'Current Members',
      dataIndex: 'currentMemberAssignedCount',
      key: 'currentMemberAssignedCount',
      render: (count, record) => {
        const maxMembers = 20;
        const percentage = (count / maxMembers) * 100;
        return (
          <div>
            <Progress 
              percent={percentage} 
              size="small" 
              strokeColor={percentage >= 90 ? '#ff4d4f' : percentage >= 70 ? '#faad14' : '#52c41a'}
              showInfo={false}
            />
            <Text style={{ fontSize: '12px' }}>{count}/{maxMembers}</Text>
          </div>
        );
      },
      sorter: (a, b) => a.currentMemberAssignedCount - b.currentMemberAssignedCount,
      width: 120
    },
    {
      title: 'Status',
      key: 'availability',
      render: (_, record) => {
        const status = getAvailabilityStatus(record);
        return (
          <Badge 
            status={status.color === 'green' ? 'success' : status.color === 'orange' ? 'warning' : 'error'} 
            text={status.text} 
          />
        );
      },
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Limited', value: 'limited' },
        { text: 'Full', value: 'full' }
      ],
      onFilter: (value, record) => {
        const status = getAvailabilityStatus(record);
        return status.text.toLowerCase().includes(value);
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record.coachId)}
          >
            View Profile
          </Button>
        </Space>
      ),
      width: 120
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Calculate summary statistics
  const totalCoaches = coaches.length;
  const availableCoaches = coaches.filter(coach => !coach.full).length;
  const fullCoaches = coaches.filter(coach => coach.full).length;
  const averageMembers = coaches.length > 0 
    ? (coaches.reduce((sum, coach) => sum + coach.currentMemberAssignedCount, 0) / coaches.length).toFixed(1)
    : 0;

  return (
    <div className="coach-management">
      <div className="container py-4">
        <Title level={2}>
          <TeamOutlined /> Coach Management
        </Title>

        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Coaches"
                value={totalCoaches}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Available Coaches"
                value={availableCoaches}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Coaches at Capacity"
                value={fullCoaches}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg. Members per Coach"
                value={averageMembers}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="All Coaches" 
          extra={
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={showCreateModal}
            >
              Create New Coach
            </Button>
          }
        >
          <Table 
            dataSource={coaches} 
            columns={columns} 
            rowKey="coachId"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} coaches`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1320 }}
          />
        </Card>
        
        {/* Create Coach Modal */}
        <Modal
          title="Create New Coach"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={creating}
              onClick={handleSubmit}
            >
              Create Coach
            </Button>,
          ]}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter full name' }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact_number"
                  label="Contact Number"
                  rules={[{ required: true, message: 'Please enter contact number' }]}
                >
                  <Input placeholder="Enter contact number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="specialty"
                  label="Specialty"
                  rules={[{ required: true, message: 'Please select specialty' }]}
                >
                  <Select placeholder="Select specialty">
                    {specialties.map(specialty => (
                      <Option key={specialty} value={specialty}>{specialty}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="certificates"
                  label="Certificates"
                  rules={[{ required: true, message: 'Please enter certificates' }]}
                >
                  <Input placeholder="Enter certificates" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bio"
              label="Biography"
              rules={[{ required: true, message: 'Please enter biography' }]}
            >
              <TextArea rows={4} placeholder="Enter coach biography" />
            </Form.Item>

            {/* Working Hours Section */}
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Working Hours</Title>
              
              <Form form={workingHoursForm} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item
                  name="dayOfWeek"
                  rules={[{ required: true, message: 'Please select day' }]}
                >
                  <Select placeholder="Select day" style={{ width: 120 }}>
                    <Option value="Monday">Monday</Option>
                    <Option value="Tuesday">Tuesday</Option>
                    <Option value="Wednesday">Wednesday</Option>
                    <Option value="Thursday">Thursday</Option>
                    <Option value="Friday">Friday</Option>
                    <Option value="Saturday">Saturday</Option>
                    <Option value="Sunday">Sunday</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker format="HH:mm" placeholder="Start time" />
                </Form.Item>
                
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Please select end time' }]}
                >
                  <TimePicker format="HH:mm" placeholder="End time" />
                </Form.Item>
                
                <Form.Item>
                  <Button type="dashed" onClick={addWorkingHour} icon={<PlusOutlined />}>
                    Add Working Hour
                  </Button>
                </Form.Item>
              </Form>

              {/* Display Added Working Hours */}
              {workingHours.length > 0 && (
                <div>
                  <Text strong>Added Working Hours:</Text>
                  {workingHours.map((hour, index) => (
                    <div key={index} style={{ marginTop: 8, padding: 8, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                      <Space>
                        <CalendarOutlined />
                        <Text>{hour.dayOfWeek}: {hour.startTime} - {hour.endTime}</Text>
                        <Button 
                          size="small" 
                          type="text" 
                          danger 
                          onClick={() => removeWorkingHour(index)}
                        >
                          Remove
                        </Button>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form>
        </Modal>

        {/* Coach Profile View Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Coach Profile Details
            </div>
          }
          visible={profileModalVisible}
          onCancel={closeProfileModal}
          footer={[
            <Button key="close" onClick={closeProfileModal}>
              Close
            </Button>
          ]}
          width={800}
        >
          {profileLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : selectedCoach ? (
            <div>
              {/* Coach Header */}
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Avatar size={80} icon={<UserOutlined />} />
                </Col>
                <Col span={18}>
                  <Title level={3} style={{ marginBottom: 8 }}>{selectedCoach.name}</Title>
                  <Space direction="vertical" size={4}>
                    <Text><MailOutlined /> {selectedCoach.email}</Text>
                    <Text><PhoneOutlined /> {selectedCoach.contactNumber || selectedCoach.contact_number}</Text>
                    <Tag color="blue">{selectedCoach.specialty}</Tag>
                  </Space>
                </Col>
              </Row>

              {/* Coach Details */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card size="small" title="Professional Information">
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div>
                        <Text strong>Certificates:</Text>
                        <br />
                        <Text>{selectedCoach.certificates || 'Not specified'}</Text>
                      </div>
                      <div>
                        <Text strong>Specialty:</Text>
                        <br />
                        <Text>{selectedCoach.specialty}</Text>
                      </div>
                      <div>
                        <Text strong>Current Members:</Text>
                        <br />
                        <Text>{selectedCoach.currentMemberAssignedCount || 0}/20</Text>
                      </div>
                      <div>
                        <Text strong>Status:</Text>
                        <br />
                        <Badge 
                          status={selectedCoach.full ? 'error' : 'success'} 
                          text={selectedCoach.full ? 'At Capacity' : 'Available'} 
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Working Hours">
                    {selectedCoach.workingHours && selectedCoach.workingHours.length > 0 ? (
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {selectedCoach.workingHours.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (selectedCoach.workingHour && selectedCoach.workingHour.length > 0 ? (
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {selectedCoach.workingHour.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No working hours specified</Text>
                    ))}
                  </Card>
                </Col>
              </Row>

              {/* Biography */}
              {selectedCoach.bio && (
                <Card size="small" title="Biography" style={{ marginTop: 16 }}>
                  <Text>{selectedCoach.bio}</Text>
                </Card>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">No coach profile data available</Text>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CoachManagement;