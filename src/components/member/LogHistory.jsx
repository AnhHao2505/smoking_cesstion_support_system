import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Table, DatePicker, Select, 
  Button, Space, Tag, Modal, Tooltip, Empty, Spin,
  Statistic, Progress, Timeline, Alert, Badge, Divider
} from 'antd';
import {
  HistoryOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, FilterOutlined, DownloadOutlined,
  CheckCircleOutlined, WarningOutlined, TrophyOutlined,
  LineChartOutlined, FireOutlined, HeartOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMemberDailyLogs, 
  deleteDailyLog,
  getDailyLogsWithAnalytics 
} from '../../services/dailylogService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const LogHistory = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table, timeline
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId) {
      fetchLogHistory();
    }
  }, [userId, selectedDateRange]);

  useEffect(() => {
    applyFilters();
  }, [logs, filterType]);

  const fetchLogHistory = async () => {
    try {
      setLoading(true);
      
      const startDate = selectedDateRange[0].format('YYYY-MM-DD');
      const endDate = selectedDateRange[1].format('YYYY-MM-DD');
      
      const response = await getDailyLogsWithAnalytics(userId, startDate, endDate);
      
      if (response.success) {
        setLogs(response.data || []);
        setAnalytics(response.analytics);
      } else {
        setLogs([]);
        setAnalytics(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching log history:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    switch (filterType) {
      case 'smoke_free':
        filtered = logs.filter(log => log.cigarettes_smoked === 0);
        break;
      case 'with_cigarettes':
        filtered = logs.filter(log => log.cigarettes_smoked > 0);
        break;
      case 'high_stress':
        filtered = logs.filter(log => log.stress_level >= 7);
        break;
      case 'low_mood':
        filtered = logs.filter(log => log.mood_level <= 4);
        break;
      case 'high_cravings':
        filtered = logs.filter(log => log.craving_intensity >= 7);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredLogs(filtered);
  };

  const handleDeleteLog = async (logId) => {
    try {
      await deleteDailyLog(logId);
      await fetchLogHistory(); // Refresh the data
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const getMoodIcon = (mood) => {
    if (mood <= 3) return { icon: '😢', color: '#ff4d4f' };
    if (mood <= 6) return { icon: '😐', color: '#faad14' };
    return { icon: '😊', color: '#52c41a' };
  };

  const getHealthColor = (level, reverse = false) => {
    if (reverse) {
      if (level <= 3) return '#52c41a';
      if (level <= 6) return '#faad14';
      return '#ff4d4f';
    } else {
      if (level <= 3) return '#ff4d4f';
      if (level <= 6) return '#faad14';
      return '#52c41a';
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'log_date',
      key: 'log_date',
      render: (date) => (
        <Space direction="vertical" size="small">
          <span>{moment(date).format('DD/MM/YYYY')}</span>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).format('dddd')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => moment(a.log_date).unix() - moment(b.log_date).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Cigarettes',
      dataIndex: 'cigarettes_smoked',
      key: 'cigarettes_smoked',
      render: (count) => (
        <Badge
          count={count}
          style={{ 
            backgroundColor: count === 0 ? '#52c41a' : '#ff4d4f',
            color: 'white'
          }}
          showZero
        />
      ),
      sorter: (a, b) => a.cigarettes_smoked - b.cigarettes_smoked
    },
    {
      title: 'Mood',
      dataIndex: 'mood_level',
      key: 'mood_level',
      render: (mood) => {
        const moodData = getMoodIcon(mood);
        return (
          <Tooltip title={`Mood: ${mood}/10`}>
            <Space>
              <span style={{ fontSize: '16px' }}>{moodData.icon}</span>
              <span style={{ color: moodData.color }}>{mood}/10</span>
            </Space>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.mood_level - b.mood_level
    },
    {
      title: 'Stress',
      dataIndex: 'stress_level',
      key: 'stress_level',
      render: (stress) => (
        <Progress
          percent={stress * 10}
          size="small"
          strokeColor={getHealthColor(stress, true)}
          format={() => `${stress}/10`}
          style={{ width: '80px' }}
        />
      ),
      sorter: (a, b) => a.stress_level - b.stress_level
    },
    {
      title: 'Cravings',
      dataIndex: 'craving_intensity',
      key: 'craving_intensity',
      render: (cravings) => (
        <Progress
          percent={cravings * 10}
          size="small"
          strokeColor={getHealthColor(cravings, true)}
          format={() => `${cravings}/10`}
          style={{ width: '80px' }}
        />
      ),
      sorter: (a, b) => a.craving_intensity - b.craving_intensity
    },
    {
      title: 'Sleep',
      dataIndex: 'sleep_hours',
      key: 'sleep_hours',
      render: (hours, record) => (
        <Tooltip title={`Quality: ${record.sleep_quality || 'N/A'}`}>
          <Space>
            <ClockCircleOutlined />
            {hours}h
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => a.sleep_hours - b.sleep_hours
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedLog(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Log Entry',
                  content: 'Are you sure you want to delete this log entry?',
                  okText: 'Delete',
                  okType: 'danger',
                  onOk: () => handleDeleteLog(record.log_id)
                });
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const renderTimelineView = () => (
    <Timeline mode="left">
      {filteredLogs.map((log) => {
        const moodData = getMoodIcon(log.mood_level);
        const isSmokeFree = log.cigarettes_smoked === 0;
        
        return (
          <Timeline.Item
            key={log.log_id}
            color={isSmokeFree ? 'green' : 'red'}
            label={moment(log.log_date).format('DD/MM')}
          >
            <Card size="small" style={{ width: '100%' }}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Space>
                    <Text strong>{moment(log.log_date).format('dddd, DD/MM/YYYY')}</Text>
                    {isSmokeFree && <Badge status="success" text="Smoke-free" />}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space>
                    <FireOutlined style={{ color: isSmokeFree ? '#52c41a' : '#ff4d4f' }} />
                    <Text>Cigarettes: {log.cigarettes_smoked}</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space>
                    <span style={{ fontSize: '14px' }}>{moodData.icon}</span>
                    <Text>Mood: {log.mood_level}/10</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Text>Stress: {log.stress_level}/10</Text>
                </Col>
                <Col span={12}>
                  <Text>Sleep: {log.sleep_hours}h</Text>
                </Col>
                {log.notes && (
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      "{log.notes.substring(0, 50)}{log.notes.length > 50 ? '...' : ''}"
                    </Text>
                  </Col>
                )}
              </Row>
            </Card>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading log history...</div>
      </div>
    );
  }

  return (
    <div className="log-history">
      <div className="container py-4">
        {/* Header */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <HistoryOutlined /> Daily Log History
                  </Title>
                  <Text type="secondary">
                    View and analyze your daily wellness logs
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        // Export functionality would go here
                        console.log('Export logs');
                      }}
                    >
                      Export
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Analytics Summary */}
        {analytics && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Total Days Logged"
                  value={analytics.totalDays}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Smoke-Free Days"
                  value={`${analytics.smokeFreeRate}%`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Avg Daily Cigarettes"
                  value={analytics.avgDailyCigarettes}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: analytics.avgDailyCigarettes > 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Avg Mood Level"
                  value={`${analytics.avgMoodLevel}/10`}
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters and Controls */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <Space>
                    <Text strong>Date Range:</Text>
                    <RangePicker
                      value={selectedDateRange}
                      onChange={setSelectedDateRange}
                      format="DD/MM/YYYY"
                      allowClear={false}
                    />
                  </Space>
                </Col>
                <Col xs={24} md={6}>
                  <Space>
                    <Text strong>Filter:</Text>
                    <Select
                      value={filterType}
                      onChange={setFilterType}
                      style={{ width: 150 }}
                    >
                      <Option value="all">All Logs</Option>
                      <Option value="smoke_free">Smoke-Free Days</Option>
                      <Option value="with_cigarettes">Days with Cigarettes</Option>
                      <Option value="high_stress">High Stress Days</Option>
                      <Option value="low_mood">Low Mood Days</Option>
                      <Option value="high_cravings">High Craving Days</Option>
                    </Select>
                  </Space>
                </Col>
                <Col xs={24} md={6}>
                  <Space>
                    <Text strong>View:</Text>
                    <Select
                      value={viewMode}
                      onChange={setViewMode}
                      style={{ width: 120 }}
                    >
                      <Option value="table">Table</Option>
                      <Option value="timeline">Timeline</Option>
                    </Select>
                  </Space>
                </Col>
                <Col xs={24} md={4}>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={fetchLogHistory}
                  >
                    Apply Filters
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Results Summary */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Alert
              message={`Showing ${filteredLogs.length} of ${logs.length} log entries`}
              type="info"
              showIcon
            />
          </Col>
        </Row>

        {/* Log Data */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  {viewMode === 'table' ? 'Log History Table' : 'Log History Timeline'}
                </Space>
              }
            >
              {filteredLogs.length === 0 ? (
                <Empty
                  description="No log entries found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : viewMode === 'table' ? (
                <Table
                  columns={columns}
                  dataSource={filteredLogs}
                  rowKey="log_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} entries`
                  }}
                  scroll={{ x: 800 }}
                />
              ) : (
                renderTimelineView()
              )}
            </Card>
          </Col>
        </Row>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              Log Details - {selectedLog && moment(selectedLog.log_date).format('DD/MM/YYYY')}
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
          {selectedLog && (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Basic Metrics">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Log Time: </Text>
                        <span>{selectedLog.log_time || 'N/A'}</span>
                      </div>
                      <div>
                        <Text strong>Cigarettes Smoked: </Text>
                        <Tag color={selectedLog.cigarettes_smoked === 0 ? 'green' : 'red'}>
                          {selectedLog.cigarettes_smoked}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>Overall Health: </Text>
                        <span>{selectedLog.overall_health || 'N/A'}</span>
                      </div>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small" title="Emotional State">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Stress Level: </Text>
                        <Progress 
                          percent={selectedLog.stress_level * 10} 
                          size="small"
                          format={() => `${selectedLog.stress_level}/10`}
                        />
                      </div>
                      <div>
                        <Text strong>Mood Level: </Text>
                        <Progress 
                          percent={selectedLog.mood_level * 10} 
                          size="small"
                          format={() => `${selectedLog.mood_level}/10`}
                        />
                      </div>
                      <div>
                        <Text strong>Craving Intensity: </Text>
                        <Progress 
                          percent={selectedLog.craving_intensity * 10} 
                          size="small"
                          format={() => `${selectedLog.craving_intensity}/10`}
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Physical Wellness">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Sleep: </Text>
                        <span>{selectedLog.sleep_hours}h ({selectedLog.sleep_quality || 'N/A'})</span>
                      </div>
                      <div>
                        <Text strong>Physical Activity: </Text>
                        <span>{selectedLog.physical_activity || 'N/A'}</span>
                      </div>
                      <div>
                        <Text strong>Water Intake: </Text>
                        <span>{selectedLog.water_intake || 0} glasses</span>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Support & Strategies">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Support Received: </Text>
                        <Tag color={selectedLog.support_received ? 'green' : 'default'}>
                          {selectedLog.support_received ? 'Yes' : 'No'}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>Triggers: </Text>
                        <div>
                          {selectedLog.triggers_experienced ? 
                            selectedLog.triggers_experienced.split(',').map(trigger => (
                              <Tag key={trigger} style={{ margin: '2px' }}>{trigger}</Tag>
                            )) : 'None'
                          }
                        </div>
                      </div>
                      <div>
                        <Text strong>Coping Strategies: </Text>
                        <div>
                          {selectedLog.coping_strategies_used ? 
                            selectedLog.coping_strategies_used.split(',').map(strategy => (
                              <Tag key={strategy} color="blue" style={{ margin: '2px' }}>{strategy}</Tag>
                            )) : 'None'
                          }
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>

                {selectedLog.notes && (
                  <Col xs={24}>
                    <Card size="small" title="Notes">
                      <Text>{selectedLog.notes}</Text>
                    </Card>
                  </Col>
                )}

                {selectedLog.challenges_faced && (
                  <Col xs={24} md={12}>
                    <Card size="small" title="Challenges Faced">
                      <Text>{selectedLog.challenges_faced}</Text>
                    </Card>
                  </Col>
                )}

                {selectedLog.victories_achieved && (
                  <Col xs={24} md={12}>
                    <Card size="small" title="Victories Achieved">
                      <Text>{selectedLog.victories_achieved}</Text>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default LogHistory;
