import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Rate,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Spin,
  Input,
  Select,
  Divider,
  List,
  Badge
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  HeartOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { getAllCoaches, chooseCoach } from '../../services/coachManagementService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const CoachSelection = () => {
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    specialty: 'all',
    rating: 'all',
    availability: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchAvailableCoaches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coaches, filters, searchTerm]);

  const fetchAvailableCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches();
      // Filter only active coaches
      const activeCoaches = response.data.filter(coach => coach.status === 'Active');
      setCoaches(activeCoaches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      message.error('Failed to load coaches');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...coaches];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(coach =>
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (filters.specialty !== 'all') {
      filtered = filtered.filter(coach => coach.specialty === filters.specialty);
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(coach => coach.rating >= minRating);
    }

    // Availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'available') {
        filtered = filtered.filter(coach => coach.active_members < 20); // Assuming max 20 members per coach
      }
    }

    setFilteredCoaches(filtered);
  };

  const handleCoachSelect = async (coach) => {
    try {
      setSelecting(true);
      const response = await chooseCoach(coach.id);
      if (response.success) {
        message.success(`You have successfully selected ${coach.name} as your coach!`);
        // Navigate to dashboard or plan creation
        window.location.href = '/member/create-quit-plan';
      } else {
        message.error(response.message || 'Failed to select coach');
      }
    } catch (error) {
      console.error('Error selecting coach:', error);
      message.error('Failed to select coach. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  const showCoachDetails = (coach) => {
    setSelectedCoach(coach);
    setDetailModalVisible(true);
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Behavioral Therapy': 'blue',
      'Medical Support': 'green',
      'Nutritional Counseling': 'orange',
      'Stress Management': 'purple',
      'General Support': 'cyan'
    };
    return colors[specialty] || 'default';
  };

  const getAvailabilityStatus = (activeMembersCount) => {
    if (activeMembersCount < 10) return { status: 'success', text: 'Available' };
    if (activeMembersCount < 18) return { status: 'warning', text: 'Limited' };
    return { status: 'error', text: 'Full' };
  };

  if (loading) {
    return (
      <div className="dashboard loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading available coaches...</div>
      </div>
    );
  }

  return (
    <div className="coach-selection">
      <div className="container py-4">
        <Title level={2}>
          <UserOutlined /> Choose Your Coach
        </Title>
        <Paragraph>
          Select a qualified coach to guide you through your smoking cessation journey. 
          Each coach brings unique expertise and approaches to help you succeed.
        </Paragraph>

        {/* Search and Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Search coaches by name, specialty..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={5}>
              <Select
                placeholder="Specialty"
                style={{ width: '100%' }}
                value={filters.specialty}
                onChange={(value) => setFilters({ ...filters, specialty: value })}
              >
                <Option value="all">All Specialties</Option>
                <Option value="Behavioral Therapy">Behavioral Therapy</Option>
                <Option value="Medical Support">Medical Support</Option>
                <Option value="Nutritional Counseling">Nutritional Counseling</Option>
                <Option value="Stress Management">Stress Management</Option>
              </Select>
            </Col>
            <Col xs={24} md={5}>
              <Select
                placeholder="Rating"
                style={{ width: '100%' }}
                value={filters.rating}
                onChange={(value) => setFilters({ ...filters, rating: value })}
              >
                <Option value="all">All Ratings</Option>
                <Option value="4.5">4.5+ Stars</Option>
                <Option value="4.0">4.0+ Stars</Option>
                <Option value="3.5">3.5+ Stars</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Availability"
                style={{ width: '100%' }}
                value={filters.availability}
                onChange={(value) => setFilters({ ...filters, availability: value })}
              >
                <Option value="all">All Coaches</Option>
                <Option value="available">Available Now</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Coach Cards */}
        <Row gutter={[16, 16]}>
          {filteredCoaches.map(coach => {
            const availability = getAvailabilityStatus(coach.active_members);
            return (
              <Col xs={24} md={12} lg={8} key={coach.id}>
                <Card
                  className="coach-card"
                  hoverable
                  actions={[
                    <Button
                      type="text"
                      icon={<MessageOutlined />}
                      onClick={() => showCoachDetails(coach)}
                    >
                      View Details
                    </Button>,
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={selecting}
                      disabled={availability.status === 'error'}
                      onClick={() => handleCoachSelect(coach)}
                    >
                      Select Coach
                    </Button>
                  ]}
                >
                  <div className="text-center mb-3">
                    <Avatar
                      size={80}
                      src={coach.photo_url}
                      icon={<UserOutlined />}
                    />
                    <div className="mt-2">
                      <Title level={4} style={{ margin: 0 }}>{coach.name}</Title>
                      <Space>
                        <Rate disabled value={coach.rating} allowHalf style={{ fontSize: '14px' }} />
                        <Text strong>{coach.rating}</Text>
                      </Space>
                    </div>
                  </div>

                  <div className="coach-info">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Tag color={getSpecialtyColor(coach.specialty)}>
                          {coach.specialty}
                        </Tag>
                      </div>
                      
                      <div>
                        <Text type="secondary">
                          <TeamOutlined /> {coach.active_members} active members
                        </Text>
                        <Badge
                          status={availability.status}
                          text={availability.text}
                          style={{ float: 'right' }}
                        />
                      </div>

                      <div>
                        <Text type="secondary">Success Rate:</Text>
                        <Text strong style={{ color: '#52c41a', marginLeft: 8 }}>
                          {coach.success_rate}%
                        </Text>
                      </div>

                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ marginBottom: 0 }}
                      >
                        {coach.bio}
                      </Paragraph>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {filteredCoaches.length === 0 && (
          <div className="text-center py-5">
            <Title level={4}>No coaches found</Title>
            <Paragraph>Try adjusting your filters to see more coaches.</Paragraph>
          </div>
        )}

        {/* Coach Detail Modal */}
        <Modal
          title="Coach Details"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>,
            <Button
              key="select"
              type="primary"
              loading={selecting}
              onClick={() => {
                setDetailModalVisible(false);
                handleCoachSelect(selectedCoach);
              }}
            >
              Select This Coach
            </Button>
          ]}
          width={700}
        >
          {selectedCoach && (
            <div>
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
                  <Tag color={getSpecialtyColor(selectedCoach.specialty)}>
                    {selectedCoach.specialty}
                  </Tag>
                  
                  <div className="mt-3">
                    <Text strong>Qualifications:</Text>
                    <br />
                    <Text>{selectedCoach.qualification}</Text>
                  </div>

                  <div className="mt-3">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text type="secondary">Active Members:</Text>
                        <br />
                        <Text strong>{selectedCoach.active_members}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Success Rate:</Text>
                        <br />
                        <Text strong style={{ color: '#52c41a' }}>
                          {selectedCoach.success_rate}%
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div>
                <Title level={5}>About</Title>
                <Paragraph>{selectedCoach.bio}</Paragraph>
              </div>

              <div>
                <Title level={5}>Approach & Methods</Title>
                <Paragraph>
                  This coach specializes in {selectedCoach.specialty.toLowerCase()} and has helped 
                  {selectedCoach.active_members} members achieve their smoking cessation goals with a 
                  {selectedCoach.success_rate}% success rate.
                </Paragraph>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CoachSelection;