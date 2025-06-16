import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Popconfirm,
  Rate,
  Progress,
  Tabs,
  Upload,
  Divider
} from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  StarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  UploadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import {
  getAllCoaches,
  getCoachSpecialties,
  createCoach,
  updateCoach,
  deleteCoach
} from '../../services/coachManagementService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: 'All',
    specialty: 'All'
  });
  const [specialties, setSpecialties] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  
  // Fetch coach data
  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllCoaches(searchParams);
      setCoaches(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error("Failed to load coaches");
      setLoading(false);
    }
  }, [searchParams]);
  
  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      const specialtiesData = await getCoachSpecialties();
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };
  
  useEffect(() => {
    fetchCoaches();
    fetchSpecialties();
  }, [fetchCoaches]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      search: e.target.value
    });
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setSearchParams({
      ...searchParams,
      status: value
    });
  };
  
  // Handle specialty filter change
  const handleSpecialtyFilterChange = (value) => {
    setSearchParams({
      ...searchParams,
      specialty: value
    });
  };
  
  // Show modal for creating a new coach
  const showCreateModal = () => {
    setEditingCoach(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Show modal for editing a coach
  const showEditModal = (record) => {
    setEditingCoach(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      specialty: record.specialty,
      qualification: record.qualification,
      bio: record.bio,
      status: record.status
    });
    setModalVisible(true);
  };
  
  // Show coach details
  const showCoachDetails = (coach) => {
    setSelectedCoach(coach);
    setDetailModalVisible(true);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCoach) {
        // Update existing coach
        const response = await updateCoach(editingCoach.id, values);
        if (response.success) {
          message.success(response.message);
          setModalVisible(false);
          fetchCoaches();
        }
      } else {
        // Create new coach
        const response = await createCoach(values);
        if (response.success) {
          message.success(response.message);
          setModalVisible(false);
          fetchCoaches();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  
  // Handle coach deletion
  const handleDelete = async (coachId) => {
    try {
      const response = await deleteCoach(coachId);
      if (response.success) {
        message.success(response.message);
        fetchCoaches();
      }
    } catch (error) {
      console.error("Error deleting coach:", error);
      message.error("Failed to delete coach");
    }
  };
  
  // Handle toggling coach status
  const handleToggleStatus = async (record) => {
    try {
      const newStatus = record.status === 'Active' ? 'Inactive' : 'Active';
      const response = await updateCoach(record.id, { ...record, status: newStatus });
      if (response.success) {
        message.success(`Coach ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
        fetchCoaches();
      }
    } catch (error) {
      console.error("Error toggling coach status:", error);
      message.error("Failed to update coach status");
    }
  };
  
  // Coach table columns definition
  const coachColumns = [
    {
      title: 'Coach',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      render: specialty => <Tag color="blue">{specialty}</Tag>
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: rating => (
        <Space>
          <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: '12px' }} />
          <Text>{rating}</Text>
        </Space>
      ),
      sorter: (a, b) => a.rating - b.rating
    },
    {
      title: 'Active Members',
      dataIndex: 'active_members',
      key: 'active_members',
      sorter: (a, b) => a.active_members - b.active_members
    },
    {
      title: 'Success Rate',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: rate => <Progress percent={rate} size="small" />,
      sorter: (a, b) => a.success_rate - b.success_rate
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<BarChartOutlined />} 
              size="small"
              onClick={() => showCoachDetails(record)}
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.status === 'Active' ? "Deactivate" : "Activate"}>
            <Button 
              icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />} 
              size="small" 
              type={record.status === 'Active' ? 'default' : 'primary'}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this coach?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Coach statistics
  const coachStats = {
    totalCoaches: coaches.length,
    activeCoaches: coaches.filter(c => c.status === 'Active').length,
    averageRating: coaches.length ? (coaches.reduce((sum, coach) => sum + coach.rating, 0) / coaches.length).toFixed(1) : 0,
    totalMembers: coaches.reduce((sum, coach) => sum + coach.active_members, 0)
  };
  
  return (
    <div className="coach-management">
      <div className="container py-4">
        <Title level={2}>
          <MedicineBoxOutlined /> Coach Management
        </Title>
        
        {/* Coach Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Coaches"
                value={coachStats.totalCoaches}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Coaches"
                value={coachStats.activeCoaches}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Average Rating"
                value={coachStats.averageRating}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Supported Members"
                value={coachStats.totalMembers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><MedicineBoxOutlined /> Coaches</span>} key="1">
            {/* Search and Filters */}
            <div className="table-toolbar mb-3">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input.Search
                    placeholder="Search by name, specialty or email"
                    allowClear
                    value={searchParams.search}
                    onChange={handleSearchChange}
                    onSearch={fetchCoaches}
                  />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    placeholder="Filter by specialty"
                    style={{ width: '100%' }}
                    value={searchParams.specialty}
                    onChange={handleSpecialtyFilterChange}
                    onSelect={fetchCoaches}
                  >
                    <Option value="All">All Specialties</Option>
                    {specialties.map(specialty => (
                      <Option key={specialty} value={specialty}>{specialty}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    placeholder="Filter by status"
                    style={{ width: '100%' }}
                    value={searchParams.status}
                    onChange={handleStatusFilterChange}
                    onSelect={fetchCoaches}
                  >
                    <Option value="All">All Status</Option>
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={8} className="text-right">
                  <Button 
                    type="primary" 
                    icon={<UserAddOutlined />}
                    onClick={showCreateModal}
                  >
                    Add Coach
                  </Button>
                </Col>
              </Row>
            </div>
            
            {/* Coaches Table */}
            <Table
              loading={loading}
              dataSource={coaches}
              columns={coachColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
        
        {/* Coach Create/Edit Modal */}
        <Modal
          title={editingCoach ? "Edit Coach" : "Add New Coach"}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              {editingCoach ? "Update" : "Create"}
            </Button>
          ]}
          width={700}
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
                  rules={[{ required: true, message: 'Please enter the full name' }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter the email' },
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
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter the phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="specialty"
                  label="Specialty"
                  rules={[{ required: true, message: 'Please select a specialty' }]}
                >
                  <Select placeholder="Select specialty">
                    {specialties.map(specialty => (
                      <Option key={specialty} value={specialty}>{specialty}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="qualification"
              label="Qualifications"
              rules={[{ required: true, message: 'Please enter qualifications' }]}
            >
              <Input placeholder="Enter qualifications (e.g., Ph.D in Psychology)" />
            </Form.Item>
            
            <Form.Item
              name="bio"
              label="Biography"
              rules={[{ required: true, message: 'Please enter a biography' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter coach biography" />
            </Form.Item>
            
            {editingCoach && (
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            )}
            
            {!editingCoach && (
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter a password' }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            )}
            
            <Form.Item
              name="photo"
              label="Profile Photo"
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Photo</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Coach Details Modal */}
        {selectedCoach && (
          <Modal
            title="Coach Details"
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setDetailModalVisible(false)}>
                Close
              </Button>
            ]}
            width={800}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <Avatar 
                    size={120} 
                    src={selectedCoach.photo_url} 
                    icon={<UserOutlined />}
                  />
                  <div className="mt-3">
                    <Rate disabled value={selectedCoach.rating} allowHalf />
                    <div><Text strong>{selectedCoach.rating}</Text> / 5.0</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <Title level={3}>{selectedCoach.name}</Title>
                <Tag color="blue">{selectedCoach.specialty}</Tag>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                  {selectedCoach.qualification}
                </Text>
                
                <div className="mt-4">
                  <Title level={5}>Contact Information</Title>
                  <p><strong>Email:</strong> {selectedCoach.email}</p>
                  <p><strong>Phone:</strong> {selectedCoach.phone}</p>
                  <p><strong>Joined:</strong> {selectedCoach.joined}</p>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Active Members"
                    value={selectedCoach.active_members}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Success Rate"
                    value={`${selectedCoach.success_rate}%`}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Status"
                    value={selectedCoach.status}
                    valueStyle={{ 
                      color: selectedCoach.status === 'Active' ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Card>
              </Col>
            </Row>
            
            <div className="mt-4">
              <Title level={5}>Biography</Title>
              <Text>{selectedCoach.bio || 'No biography available.'}</Text>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default CoachManagement;