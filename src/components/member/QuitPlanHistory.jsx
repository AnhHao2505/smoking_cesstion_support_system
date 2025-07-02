import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Avatar,
  Tooltip,
  Input,
  Select,
  DatePicker
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getOldPlansOfMember } from '../../services/quitPlanService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const QuitPlanHistory = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const user = getCurrentUser();
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchQuitPlanHistory();
    } else {
      setLoading(false);
      message.error('Please log in to access quit plan history');
    }
  }, [pagination.current, pagination.pageSize, userId]);

  useEffect(() => {
    filterPlans();
  }, [searchTerm, statusFilter, dateRange, plans]);

  const fetchQuitPlanHistory = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from API
      const mockPlans = [
        {
          quit_plan_id: 1,
          start_date: '2024-01-15',
          end_date: '2024-04-15',
          status: 'Completed',
          success_rate: 85,
          coach_name: 'Dr. Sarah Johnson',
          coach_photo: 'https://randomuser.me/api/portraits/women/45.jpg',
          strategies_used: 'Nicotine replacement therapy, Exercise',
          outcome: 'Successfully completed',
          days_completed: 90,
          total_days: 90,
          circumstances: 'Work stress',
          created_at: '2024-01-10'
        },
        {
          quit_plan_id: 2,
          start_date: '2023-06-01',
          end_date: '2023-08-30',
          status: 'Failed',
          success_rate: 45,
          coach_name: 'Dr. Michael Chen',
          coach_photo: 'https://randomuser.me/api/portraits/men/42.jpg',
          strategies_used: 'Cold turkey, Support groups',
          outcome: 'Relapsed after 45 days',
          days_completed: 45,
          total_days: 90,
          circumstances: 'Social activities',
          created_at: '2023-05-25'
        },
        {
          quit_plan_id: 3,
          start_date: '2023-01-01',
          end_date: '2023-03-31',
          status: 'Incomplete',
          success_rate: 30,
          coach_name: 'Nguyễn Thị Hương',
          coach_photo: 'https://randomuser.me/api/portraits/women/32.jpg',
          strategies_used: 'Gradual reduction, Meditation',
          outcome: 'Plan discontinued',
          days_completed: 30,
          total_days: 90,
          circumstances: 'After meals',
          created_at: '2022-12-20'
        }
      ];

      setPlans(mockPlans);
      setFilteredPlans(mockPlans);
      setPagination(prev => ({ ...prev, total: mockPlans.length }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quit plan history:', error);
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.coach_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.strategies_used.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.circumstances.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    if (dateRange.length === 2) {
      filtered = filtered.filter(plan => {
        const planDate = moment(plan.start_date);
        return planDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }

    setFilteredPlans(filtered);
  };

  const handleViewDetail = (plan) => {
    setSelectedPlan(plan);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'Failed': return 'red';
      case 'Incomplete': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleOutlined />;
      case 'Failed': return <CloseCircleOutlined />;
      case 'Incomplete': return <ClockCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const calculateDuration = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  };

  const columns = [
    {
      title: 'Plan Period',
      key: 'period',
      render: (_, record) => (
        <div>
          <Text strong>{formatDate(record.start_date)}</Text>
          <br />
          <Text type="secondary">to {formatDate(record.end_date)}</Text>
          <br />
          <Text type="secondary">
            ({calculateDuration(record.start_date, record.end_date)} days)
          </Text>
        </div>
      )
    },
    {
      title: 'Coach',
      key: 'coach',
      render: (_, record) => (
        <Space>
          <Avatar src={record.coach_photo} icon={<UserOutlined />} />
          <Text>{record.coach_name}</Text>
        </Space>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <div>
          <Progress 
            percent={Math.round((record.days_completed / record.total_days) * 100)}
            size="small"
            strokeColor={getStatusColor(record.status)}
          />
          <Text type="secondary">
            {record.days_completed}/{record.total_days} days
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
        >
          {status}
        </Tag>
      )
    },
    {
      title: 'Success Rate',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: (rate) => (
        <Statistic
          value={rate}
          suffix="%"
          valueStyle={{ 
            fontSize: '14px',
            color: rate >= 70 ? '#52c41a' : rate >= 40 ? '#faad14' : '#ff4d4f'
          }}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          View Details
        </Button>
      )
    }
  ];

  const overallStats = {
    totalPlans: plans.length,
    completedPlans: plans.filter(p => p.status === 'Completed').length,
    averageSuccessRate: plans.length > 0 
      ? Math.round(plans.reduce((sum, p) => sum + p.success_rate, 0) / plans.length)
      : 0,
    totalDaysAttempted: plans.reduce((sum, p) => sum + p.days_completed, 0)
  };

  return (
    <div className="quit-plan-history">
      <div className="container py-4">
        <Title level={2}>
          <HistoryOutlined /> Quit Plan History
        </Title>

        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Plans"
                value={overallStats.totalPlans}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Completed Plans"
                value={overallStats.completedPlans}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Average Success Rate"
                value={overallStats.averageSuccessRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Days Attempted"
                value={overallStats.totalDaysAttempted}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Search by coach, strategies, or circumstances..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">All Status</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Failed">Failed</Option>
                <Option value="Incomplete">Incomplete</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
          </Row>
        </Card>

        {/* Plans Table */}
        <Card>
          <Table
            dataSource={filteredPlans}
            columns={columns}
            rowKey="quit_plan_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} plans`
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              Plan Details - {selectedPlan && formatDate(selectedPlan.start_date)}
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedPlan && (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Plan Information">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Duration:</Text>
                      <br />
                      <Text>{formatDate(selectedPlan.start_date)} - {formatDate(selectedPlan.end_date)}</Text>
                    </div>
                    <div>
                      <Text strong>Coach:</Text>
                      <br />
                      <Space>
                        <Avatar src={selectedPlan.coach_photo} icon={<UserOutlined />} />
                        <Text>{selectedPlan.coach_name}</Text>
                      </Space>
                    </div>
                    <div>
                      <Text strong>Main Trigger:</Text>
                      <br />
                      <Tag color="blue">{selectedPlan.circumstances}</Tag>
                    </div>
                    <div>
                      <Text strong>Strategies Used:</Text>
                      <br />
                      <Text>{selectedPlan.strategies_used}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Results">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Final Status:</Text>
                      <br />
                      <Tag 
                        color={getStatusColor(selectedPlan.status)} 
                        icon={getStatusIcon(selectedPlan.status)}
                      >
                        {selectedPlan.status}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Progress:</Text>
                      <br />
                      <Progress 
                        percent={Math.round((selectedPlan.days_completed / selectedPlan.total_days) * 100)}
                        strokeColor={getStatusColor(selectedPlan.status)}
                      />
                      <Text type="secondary">
                        {selectedPlan.days_completed} out of {selectedPlan.total_days} days
                      </Text>
                    </div>
                    <div>
                      <Text strong>Success Rate:</Text>
                      <br />
                      <Statistic
                        value={selectedPlan.success_rate}
                        suffix="%"
                        valueStyle={{ 
                          fontSize: '24px',
                          color: selectedPlan.success_rate >= 70 ? '#52c41a' : 
                                selectedPlan.success_rate >= 40 ? '#faad14' : '#ff4d4f'
                        }}
                      />
                    </div>
                    <div>
                      <Text strong>Outcome:</Text>
                      <br />
                      <Text>{selectedPlan.outcome}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default QuitPlanHistory;