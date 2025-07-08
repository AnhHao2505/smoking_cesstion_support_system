import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Table,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Select,
  Space,
  Avatar,
  Tag,
  Progress,
  message,
  Spin,
  Statistic,
  Tooltip,
  Popconfirm,
  Input,
  DatePicker,
  Alert
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { getAllCoaches, getAssignedMembers, chooseCoach, disableCoachForMember } from '../../services/coachManagementService';
import moment from 'moment';
import '../../styles/Dashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const CoachAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applySearch();
  }, [assignments, searchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch coaches
      const coachesResponse = await getAllCoaches();
      const activeCoaches = coachesResponse.data.filter(coach => coach.status === 'Active');
      setCoaches(activeCoaches);

      // Fetch assignments for all coaches
      const allAssignments = [];
      for (const coach of activeCoaches) {
        try {
          const membersResponse = await getAssignedMembers(coach.id);
          if (membersResponse.data && membersResponse.data.length > 0) {
            membersResponse.data.forEach(member => {
              allAssignments.push({
                id: `${coach.id}-${member.user_id}`,
                coach_id: coach.id,
                coach_name: coach.name,
                coach_specialty: coach.specialty,
                coach_rating: coach.rating,
                member_id: member.user_id,
                member_name: member.full_name,
                member_photo: member.photo_url,
                assignment_date: member.assignment_date || moment().format('YYYY-MM-DD'),
                progress: member.progress || 0,
                current_phase: member.current_phase || 'Preparation',
                days_smoke_free: member.days_smoke_free || 0,
                status: member.status ? 'Active' : 'Completed'
              });
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch members for coach ${coach.id}`);
        }
      }

      setAssignments(allAssignments);
      
      // Mock unassigned members (in real app, this would come from an API)
      setUnassignedMembers([
        {
          user_id: 201,
          full_name: "Nguyễn Văn X",
          email: "nguyenvanx@email.com",
          photo_url: "https://randomuser.me/api/portraits/men/45.jpg",
          joined_date: "2025-06-01"
        },
        {
          user_id: 202,
          full_name: "Trần Thị Y",
          email: "tranthiy@email.com",
          photo_url: "https://randomuser.me/api/portraits/women/46.jpg",
          joined_date: "2025-06-02"
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      message.error('Failed to load assignment data');
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredAssignments(assignments);
      return;
    }

    const filtered = assignments.filter(assignment =>
      assignment.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.coach_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.coach_specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssignments(filtered);
  };

  const handleAssignCoach = async () => {
    try {
      const values = await form.validateFields();
      
      // Mock assignment (in real app, call API)
      const coach = coaches.find(c => c.id === values.coach_id);
      const member = unassignedMembers.find(m => m.user_id === values.member_id);
      
      const newAssignment = {
        id: `${values.coach_id}-${values.member_id}`,
        coach_id: values.coach_id,
        coach_name: coach.name,
        coach_specialty: coach.specialty,
        coach_rating: coach.rating,
        member_id: values.member_id,
        member_name: member.full_name,
        member_photo: member.photo_url,
        assignment_date: values.assignment_date.format('YYYY-MM-DD'),
        progress: 0,
        current_phase: 'Preparation',
        days_smoke_free: 0,
        status: 'Active'
      };

      setAssignments([...assignments, newAssignment]);
      setUnassignedMembers(unassignedMembers.filter(m => m.user_id !== values.member_id));
      
      message.success(`Successfully assigned ${member.full_name} to ${coach.name}`);
      setAssignModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Assignment error:', error);
      message.error('Failed to assign coach');
    }
  };

  const handleReassignCoach = async () => {
    try {
      const values = await form.validateFields();
      
      const coach = coaches.find(c => c.id === values.new_coach_id);
      
      // Update assignment
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.id === selectedMember.id) {
          return {
            ...assignment,
            coach_id: values.new_coach_id,
            coach_name: coach.name,
            coach_specialty: coach.specialty,
            coach_rating: coach.rating,
            assignment_date: values.reassignment_date.format('YYYY-MM-DD')
          };
        }
        return assignment;
      });

      setAssignments(updatedAssignments);
      message.success(`Successfully reassigned ${selectedMember.member_name} to ${coach.name}`);
      setReassignModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Reassignment error:', error);
      message.error('Failed to reassign coach');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      
      // Remove assignment
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      
      // Add member back to unassigned list
      setUnassignedMembers([...unassignedMembers, {
        user_id: assignment.member_id,
        full_name: assignment.member_name,
        photo_url: assignment.member_photo
      }]);
      
      message.success(`Removed assignment for ${assignment.member_name}`);
    } catch (error) {
      console.error('Remove assignment error:', error);
      message.error('Failed to remove assignment');
    }
  };

  const showReassignModal = (assignment) => {
    setSelectedMember(assignment);
    form.setFieldsValue({
      current_coach: assignment.coach_name,
      reassignment_date: moment()
    });
    setReassignModalVisible(true);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#faad14';
    if (progress >= 25) return '#1890ff';
    return '#ff4d4f';
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'Preparation': 'orange',
      'Action': 'blue',
      'Maintenance': 'green',
      'Completed': 'purple'
    };
    return colors[phase] || 'default';
  };

  const assignmentColumns = [
    {
      title: 'Member',
      dataIndex: 'member_name',
      key: 'member_name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.member_photo} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Coach',
      key: 'coach_info',
      render: (_, record) => (
        <div>
          <Text strong>{record.coach_name}</Text>
          <br />
          <Tag color="blue">{record.coach_specialty}</Tag>
        </div>
      )
    },
    {
      title: 'Assignment Date',
      dataIndex: 'assignment_date',
      key: 'assignment_date',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: progress => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={getProgressColor(progress)}
        />
      )
    },
    {
      title: 'Current Phase',
      dataIndex: 'current_phase',
      key: 'current_phase',
      render: phase => <Tag color={getPhaseColor(phase)}>{phase}</Tag>
    },
    {
      title: 'Days Smoke-Free',
      dataIndex: 'days_smoke_free',
      key: 'days_smoke_free',
      render: days => <Text strong style={{ color: '#52c41a' }}>{days}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Reassign Coach">
            <Button
              icon={<SwapOutlined />}
              size="small"
              onClick={() => showReassignModal(record)}
            />
          </Tooltip>
          
          <Tooltip title="Remove Assignment">
            <Popconfirm
              title="Are you sure you want to remove this assignment?"
              onConfirm={() => handleRemoveAssignment(record.id)}
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
      )
    }
  ];

  // Calculate statistics
  const stats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter(a => a.status === 'Active').length,
    avgProgress: assignments.length ? 
      Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length) : 0,
    unassignedCount: unassignedMembers.length
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="coach-assignment">
      <div className="container py-4">
        <Title level={2}>
          <TeamOutlined /> Coach Assignment Management
        </Title>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Assignments"
                value={stats.totalAssignments}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Active Assignments"
                value={stats.activeAssignments}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Average Progress"
                value={`${stats.avgProgress}%`}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Unassigned Members"
                value={stats.unassignedCount}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: stats.unassignedCount > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Unassigned Members Alert */}
        {unassignedMembers.length > 0 && (
          <Alert
            message="Unassigned Members"
            description={`There are ${unassignedMembers.length} members without assigned coaches. Please assign coaches to them.`}
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                size="small"
                onClick={() => setAssignModalVisible(true)}
              >
                Assign Coach
              </Button>
            }
            className="mb-4"
          />
        )}

        {/* Search and Actions */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Search
                placeholder="Search by member name, coach name, or specialty..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAssignModalVisible(true)}
                disabled={unassignedMembers.length === 0}
              >
                Assign Coach
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Assignments Table */}
        <Card>
          <Table
            dataSource={filteredAssignments}
            columns={assignmentColumns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} assignments`
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Assign Coach Modal */}
        <Modal
          title="Assign Coach to Member"
          visible={assignModalVisible}
          onOk={handleAssignCoach}
          onCancel={() => setAssignModalVisible(false)}
          okText="Assign"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="member_id"
              label="Select Member"
              rules={[{ required: true, message: 'Please select a member' }]}
            >
              <Select placeholder="Choose a member">
                {unassignedMembers.map(member => (
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
              name="coach_id"
              label="Select Coach"
              rules={[{ required: true, message: 'Please select a coach' }]}
            >
              <Select placeholder="Choose a coach">
                {coaches.map(coach => (
                  <Option key={coach.id} value={coach.id}>
                    <div>
                      <Text strong>{coach.name}</Text>
                      <br />
                      <Text type="secondary">{coach.specialty} • {coach.active_members} members</Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="assignment_date"
              label="Assignment Date"
              rules={[{ required: true, message: 'Please select assignment date' }]}
              initialValue={moment()}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Reassign Coach Modal */}
        <Modal
          title="Reassign Coach"
          visible={reassignModalVisible}
          onOk={handleReassignCoach}
          onCancel={() => setReassignModalVisible(false)}
          okText="Reassign"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="current_coach"
              label="Current Coach"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="new_coach_id"
              label="New Coach"
              rules={[{ required: true, message: 'Please select a new coach' }]}
            >
              <Select placeholder="Choose a new coach">
                {coaches.filter(coach => selectedMember && coach.id !== selectedMember.coach_id).map(coach => (
                  <Option key={coach.id} value={coach.id}>
                    <div>
                      <Text strong>{coach.name}</Text>
                      <br />
                      <Text type="secondary">{coach.specialty} • {coach.active_members} members</Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="reassignment_date"
              label="Reassignment Date"
              rules={[{ required: true, message: 'Please select reassignment date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CoachAssignment;