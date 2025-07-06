import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Tag, Space, Avatar, Typography, 
  Modal, Form, Input, Spin, message, Badge, Progress,
  Row, Col, Statistic, Tooltip, Alert
} from 'antd';
import { 
  UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  StarOutlined, TeamOutlined, ExclamationCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getAllCoaches,
  chooseCoach
} from '../../services/coachManagementService';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const AppointmentManagement = () => {
  const { currentUser } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const userId = currentUser?.userId;

  useEffect(() => {
    fetchCoaches();
  }, [pagination.current, pagination.pageSize]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(pagination.current - 1, pagination.pageSize);
      
      if (response && response.content) {
        setCoaches(response.content);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements
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

  const handleChooseCoach = (coach) => {
    setSelectedCoach(coach);
    setConfirmModalVisible(true);
  };

  const confirmChooseCoach = async () => {
    try {
      setSelecting(true);
      const response = await chooseCoach(selectedCoach.coachId);
      
      if (response) {
        message.success(`Successfully selected ${selectedCoach.name} as your coach!`);
        setConfirmModalVisible(false);
        
        // Refresh coaches list to update their current member counts
        fetchCoaches();
        
        // Optionally redirect to dashboard or appointment booking page
        // navigate('/member/dashboard');
      }
    } catch (error) {
      console.error("Error choosing coach:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Failed to select coach. Please try again.");
      }
    } finally {
      setSelecting(false);
    }
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
    
    const availableSlots = 20 - coach.currentMemberAssignedCount; // Assuming max 20 members per coach
    if (availableSlots > 10) {
      return { color: 'green', text: 'Available' };
    } else if (availableSlots > 5) {
      return { color: 'orange', text: 'Limited' };
    } else {
      return { color: 'red', text: 'Almost Full' };
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total
    });
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
            <Text type="secondary">{record.email}</Text>
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
        <Text><CalendarOutlined /> {contact}</Text>
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
        const maxMembers = 20; // Assuming max capacity
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
      title: 'Availability',
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
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const canSelect = !record.full && record.workingHours && record.workingHours.length > 0;
        
        return (
          <Space size="small">
            {canSelect ? (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleChooseCoach(record)}
                size="small"
              >
                Choose Coach
              </Button>
            ) : (
              <Tooltip title={record.full ? "Coach is at full capacity" : "No working hours available"}>
                <Button 
                  disabled 
                  icon={<ExclamationCircleOutlined />}
                  size="small"
                >
                  Unavailable
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
      width: 150
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
    <div className="coach-selection">
      <div className="container py-4">
        <Title level={2}>
          <TeamOutlined /> Choose Your Coach
        </Title>
        
        <Paragraph>
          Select a qualified coach to guide you through your smoking cessation journey. 
          Each coach has their own specialties and schedule to support your quit plan.
        </Paragraph>

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
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg. Members per Coach"
                value={averageMembers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Available Coaches">
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
            scroll={{ x: 1200 }}
          />
        </Card>
        
        {/* Confirmation Modal */}
        <Modal
          title="Confirm Coach Selection"
          visible={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setConfirmModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={selecting}
              onClick={confirmChooseCoach}
            >
              Confirm Selection
            </Button>,
          ]}
        >
          {selectedCoach && (
            <div>
              <Alert
                message="You are about to select your coach"
                description="Once you select a coach, they will guide you through your smoking cessation journey. You can change your coach later if needed."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Card size="small">
                <Space>
                  <Avatar size="large" icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>{selectedCoach.name}</Text>
                    <br />
                    <Text type="secondary">{selectedCoach.email}</Text>
                    <br />
                    <Text type="secondary">Contact: {selectedCoach.contact_number}</Text>
                  </div>
                </Space>
                
                <div style={{ marginTop: 12 }}>
                  <Text strong>Certificates:</Text>
                  <br />
                  <Text>{selectedCoach.certificates || 'Not specified'}</Text>
                </div>
                
                <div style={{ marginTop: 12 }}>
                  <Text strong>Working Hours:</Text>
                  <br />
                  {selectedCoach.workingHours && selectedCoach.workingHours.length > 0 ? (
                    selectedCoach.workingHours.map((schedule, index) => (
                      <div key={index}>
                        <Text>{schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}</Text>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">No schedule available</Text>
                  )}
                </div>
                
                <div style={{ marginTop: 12 }}>
                  <Text strong>Current Members: </Text>
                  <Text>{selectedCoach.currentMemberAssignedCount}/20</Text>
                </div>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentManagement;

// Add some custom styling
const styles = `
  .coach-selection .ant-table-tbody > tr:hover > td {
    background-color: #f5f5f5;
  }
  
  .coach-selection .ant-progress-text {
    font-size: 10px !important;
  }
  
  .coach-selection .ant-statistic-content {
    font-size: 20px;
  }
  
  .coach-selection .ant-card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .coach-selection .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}