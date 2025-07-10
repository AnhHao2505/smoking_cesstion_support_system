import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Table, Tag, Button, Select,
  DatePicker, Statistic, Progress, Timeline, Space, Tooltip,
  Badge, Alert, Empty, Spin, message
} from 'antd';
import {
  LineChartOutlined, CalendarOutlined, TrophyOutlined,
  HeartOutlined, SmileOutlined, FrownOutlined, MehOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  FireOutlined, ClockCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { getLatestMemberSmokingStatus } from '../../services/memberSmokingStatusService';
import { getDailyStateRecords } from '../../services/memberDashboardService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SmokingStatusTracker = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [latestStatus, setLatestStatus] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('week');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const navigate = useNavigate();

  const user = getCurrentUser();
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchSmokingData();
    } else {
      setLoading(false);
      message.error('Please log in to access smoking status tracker');
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [records, filterPeriod, filterStatus, dateRange]);

  // Transform API data to match component's expected structure
  const transformApiDataToRecords = (apiData) => {
    return apiData.map(record => {
      const date = moment(record.date);
      
      // Map craving levels to numeric values (1-10)
      const getCravingLevel = (level) => {
        switch(level?.toLowerCase()) {
          case 'thấp': return 2;
          case 'trung bình': return 5;
          case 'cao': return 8;
          default: return 3;
        }
      };

      // Map emotions to mood scores
      const getMoodFromEmotion = (emotion) => {
        switch(emotion?.toLowerCase()) {
          case 'rất tốt': return 'very_good';
          case 'tốt': return 'good';
          case 'bình thường': return 'normal';
          case 'không tốt': return 'bad';
          case 'rất không tốt': return 'very_bad';
          default: return 'normal';
        }
      };

      // Calculate average craving intensity from morning and evening levels
      const morningCraving = getCravingLevel(record.morningCravingLevel);
      const eveningCraving = getCravingLevel(record.eveningCravingLevel);
      const avgCraving = Math.round((morningCraving + eveningCraving) / 2);

      // Determine smoking status based on cigarettes consumed
      const smokingStatus = (record.cigarettesConsumed || 0) === 0 ? 'smoke_free' : 
                           (record.cigarettesConsumed <= 5) ? 'reduced' : 'normal';

      // Calculate stress level based on craving and cigarette consumption
      let stressLevel = avgCraving;
      if (record.cigarettesConsumed > 0) {
        stressLevel = Math.min(10, stressLevel + 2); // Higher stress if smoking
      }

      // Count strategies used
      const strategiesUsed = [
        record.morningWaterDrinked && 'water_drinking',
        record.consumedMedicine && 'medication',
        record.goOutsideForFreshAir && 'fresh_air',
        record.noonAlternativeActivity && 'alternative_activity'
      ].filter(Boolean);

      // Determine craving frequency based on craving intensity
      const cravingFrequency = avgCraving <= 3 ? 'rare' : 
                              avgCraving <= 6 ? 'occasional' : 'frequent';

      // Create notes from available data
      const notes = [
        record.positiveAffirmation && `Khẳng định: ${record.positiveAffirmation}`,
        record.prideToday && `Tự hào: ${record.prideToday}`,
        record.noonAlternativeActivity && `Hoạt động thay thế: ${record.noonAlternativeActivity}`
      ].filter(Boolean).join(' | ') || 'Không có ghi chú';

      return {
        id: record.id,
        record_date: record.date,
        smoking_status: smokingStatus,
        cigarettes_count: record.cigarettesConsumed || 0,
        mood: getMoodFromEmotion(record.noonEmotion),
        stress_level: stressLevel,
        craving_intensity: avgCraving,
        craving_frequency: cravingFrequency,
        strategies_used: strategiesUsed.join(','),
        notes: notes,
        // Additional fields from API
        morningCravingLevel: record.morningCravingLevel,
        eveningCravingLevel: record.eveningCravingLevel,
        noonEmotion: record.noonEmotion,
        morningWaterDrinked: record.morningWaterDrinked,
        consumedMedicine: record.consumedMedicine,
        goOutsideForFreshAir: record.goOutsideForFreshAir,
        noonAlternativeActivity: record.noonAlternativeActivity,
        positiveAffirmation: record.positiveAffirmation,
        prideToday: record.prideToday,
        cigarettesTomorrowTarget: record.cigarettesTomorrowTarget,
        phaseId: record.phaseId,
        phaseName: record.phaseName
      };
    });
  };

  const fetchSmokingData = async () => {
    try {
      setLoading(true);
      const [recordsData, latestData] = await Promise.all([
        getDailyStateRecords(userId, 30), // Get last 30 days
        getLatestMemberSmokingStatus(userId)
      ]);
      
      console.log('API Response:', recordsData);
      
      // Use real records data if available, otherwise use mock data
      let finalRecords = [];
      
      if (recordsData && Array.isArray(recordsData) && recordsData.length > 0) {
        // Transform API data to match component expectations
        finalRecords = transformApiDataToRecords(recordsData);
        console.log('Transformed records:', finalRecords);
      } else {
        // Mock data structure to match the expected format (for demonstration)
        const mockRecords = [
          {
            id: 1,
            record_date: moment().subtract(1, 'day').format('YYYY-MM-DD'),
            smoking_status: 'smoke_free',
            cigarettes_count: 0,
            mood: 'good',
            stress_level: 3,
            craving_intensity: 2,
            craving_frequency: 'rare',
            strategies_used: 'deep_breathing,exercise',
            notes: 'Ngày tốt, không có cơn thèm mạnh'
          },
          {
            id: 2,
            record_date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
            smoking_status: 'reduced',
            cigarettes_count: 3,
            mood: 'normal',
            stress_level: 6,
            craving_intensity: 7,
            craving_frequency: 'frequent',
            strategies_used: 'meditation,distraction',
            notes: 'Ngày khó khăn, có stress từ công việc'
          },
          {
            id: 3,
            record_date: moment().subtract(3, 'days').format('YYYY-MM-DD'),
            smoking_status: 'smoke_free',
            cigarettes_count: 0,
            mood: 'very_good',
            stress_level: 2,
            craving_intensity: 1,
            craving_frequency: 'none',
            strategies_used: 'exercise,positive_thinking',
            notes: 'Ngày tuyệt vời, cảm thấy tự tin'
          }
        ];
        finalRecords = mockRecords;
      }

      setRecords(finalRecords);

      // Handle latestData - it contains initial status info, not daily records
      if (latestData) {
        // Create a status summary from the initial status data
        const statusSummary = {
          memberName: latestData.memberName,
          addiction: latestData.addiction,
          dailySmoking: latestData.dailySmoking,
          initialStatusId: latestData.initialStatusId,
          goal: latestData.goal,
          reasonToQuit: latestData.reasonToQuit
        };
        setLatestStatus(statusSummary);
      } else {
        // Fallback to the latest record if no status data
        setLatestStatus(finalRecords[0] || null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching smoking data:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filter by period
    if (filterPeriod !== 'all') {
      const days = {
        'week': 7,
        'month': 30,
        '3months': 90
      }[filterPeriod] || 7;
      
      const cutoffDate = moment().subtract(days, 'days');
      filtered = filtered.filter(record => 
        moment(record.record_date).isAfter(cutoffDate)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.smoking_status === filterStatus);
    }

    // Filter by date range
    if (dateRange.length === 2) {
      filtered = filtered.filter(record => 
        moment(record.record_date).isBetween(dateRange[0], dateRange[1], 'day', '[]')
      );
    }

    setFilteredRecords(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'smoke_free':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'reduced':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'normal':
        return <FireOutlined style={{ color: '#ff7a45' }} />;
      case 'increased':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <MehOutlined />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'smoke_free': 'Không hút thuốc',
      'reduced': 'Giảm lượng hút',
      'normal': 'Hút bình thường',
      'increased': 'Hút nhiều hơn'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'smoke_free': 'success',
      'reduced': 'warning',
      'normal': 'error',
      'increased': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'very_good':
        return <SmileOutlined style={{ color: '#52c41a' }} />;
      case 'good':
        return <SmileOutlined style={{ color: '#7cb305' }} />;
      case 'normal':
        return <MehOutlined style={{ color: '#faad14' }} />;
      case 'bad':
        return <FrownOutlined style={{ color: '#ff7a45' }} />;
      case 'very_bad':
        return <FrownOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <MehOutlined />;
    }
  };

  const calculateStats = () => {
    if (filteredRecords.length === 0) return null;

    const smokeFreeCount = filteredRecords.filter(r => r.smoking_status === 'smoke_free').length;
    const totalCigarettes = filteredRecords.reduce((sum, r) => sum + (r.cigarettes_count || 0), 0);
    const avgStress = filteredRecords.reduce((sum, r) => sum + (r.stress_level || 0), 0) / filteredRecords.length;
    const avgCraving = filteredRecords.reduce((sum, r) => sum + (r.craving_intensity || 0), 0) / filteredRecords.length;

    return {
      smokeFreeRate: (smokeFreeCount / filteredRecords.length * 100).toFixed(1),
      totalCigarettes,
      avgStress: avgStress.toFixed(1),
      avgCraving: avgCraving.toFixed(1),
      smokeFreeCount,
      totalDays: filteredRecords.length
    };
  };

  const stats = calculateStats();

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'record_date',
      key: 'record_date',
      render: date => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.record_date).unix() - moment(b.record_date).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'smoking_status',
      key: 'smoking_status',
      render: status => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        </Space>
      ),
      filters: [
        { text: 'Không hút thuốc', value: 'smoke_free' },
        { text: 'Giảm lượng hút', value: 'reduced' },
        { text: 'Hút bình thường', value: 'normal' },
        { text: 'Hút nhiều hơn', value: 'increased' }
      ],
      onFilter: (value, record) => record.smoking_status === value
    },
    {
      title: 'Số điếu',
      dataIndex: 'cigarettes_count',
      key: 'cigarettes_count',
      render: count => (
        <Text style={{ color: count === 0 ? '#52c41a' : '#ff4d4f' }}>
          {count || 0}
        </Text>
      ),
      sorter: (a, b) => (a.cigarettes_count || 0) - (b.cigarettes_count || 0)
    },
    {
      title: 'Tâm trạng',
      dataIndex: 'mood',
      key: 'mood',
      render: mood => (
        <Space>
          {getMoodIcon(mood)}
          <Text>{mood}</Text>
        </Space>
      )
    },
    {
      title: 'Căng thẳng',
      dataIndex: 'stress_level',
      key: 'stress_level',
      render: level => (
        <Progress 
          percent={level * 10} 
          size="small" 
          strokeColor={level > 7 ? '#ff4d4f' : level > 4 ? '#faad14' : '#52c41a'}
          format={() => `${level}/10`}
        />
      )
    },
    {
      title: 'Cơn thèm',
      dataIndex: 'craving_intensity',
      key: 'craving_intensity',
      render: intensity => (
        <Progress 
          percent={intensity * 10} 
          size="small" 
          strokeColor={intensity > 7 ? '#ff4d4f' : intensity > 4 ? '#faad14' : '#52c41a'}
          format={() => `${intensity}/10`}
        />
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: notes => (
        <Tooltip title={notes}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {notes || 'Không có ghi chú'}
          </Text>
        </Tooltip>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <Spin size="large" />
        <div className="mt-3">Đang tải dữ liệu theo dõi...</div>
      </div>
    );
  }

  return (
    <div className="smoking-status-tracker">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <LineChartOutlined /> Theo dõi trạng thái hút thuốc
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/member/daily-checkin')}
            >
              Cập nhật hôm nay
            </Button>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => navigate('/member/craving-logger')}
            >
              Ghi nhận cơn thèm
            </Button>
          </Space>
        </div>

        {/* Today's Status Alert */}
        {latestStatus && (
          <Alert
            message={latestStatus.memberName ? `Thông tin của ${latestStatus.memberName}` : "Trạng thái hôm nay"}
            description={
              latestStatus.addiction ? (
                <Space direction="vertical">
                  <Space>
                    <Text strong>Mức độ nghiện:</Text>
                    <Tag color={latestStatus.addiction === 'SEVERE' ? 'red' : latestStatus.addiction === 'MODERATE' ? 'orange' : 'green'}>
                      {latestStatus.addiction === 'SEVERE' ? 'Nghiêm trọng' : 
                       latestStatus.addiction === 'MODERATE' ? 'Trung bình' : 'Nhẹ'}
                    </Tag>
                  </Space>
                  <Space>
                    <Text strong>Số điếu/ngày:</Text>
                    <Text>{latestStatus.dailySmoking || 0}</Text>
                  </Space>
                  {latestStatus.goal && (
                    <Space>
                      <Text strong>Mục tiêu:</Text>
                      <Text>{latestStatus.goal}</Text>
                    </Space>
                  )}
                  {latestStatus.reasonToQuit && (
                    <Space>
                      <Text strong>Lý do bỏ thuốc:</Text>
                      <Text>{latestStatus.reasonToQuit}</Text>
                    </Space>
                  )}
                </Space>
              ) : (
                <Space>
                  {getStatusIcon(latestStatus.smoking_status)}
                  <Text strong>{getStatusText(latestStatus.smoking_status)}</Text>
                  {latestStatus.cigarettes_count > 0 && (
                    <Text>- {latestStatus.cigarettes_count} điếu thuốc</Text>
                  )}
                </Space>
              )
            }
            type={latestStatus.addiction === 'SEVERE' ? 'error' : latestStatus.addiction ? 'warning' : 
                  latestStatus.smoking_status === 'smoke_free' ? 'success' : 'warning'}
            showIcon
            className="mb-4"
          />
        )}

        {/* Statistics Cards */}
        {stats && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ không hút thuốc"
                  value={stats.smokeFreeRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
                <Text type="secondary">
                  {stats.smokeFreeCount}/{stats.totalDays} ngày
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng điếu thuốc"
                  value={stats.totalCigarettes}
                  valueStyle={{ color: stats.totalCigarettes > 0 ? '#ff4d4f' : '#52c41a' }}
                  prefix={<FireOutlined />}
                />
                <Text type="secondary">Trong khoảng thời gian</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Căng thẳng TB"
                  value={stats.avgStress}
                  suffix="/10"
                  valueStyle={{ 
                    color: stats.avgStress > 7 ? '#ff4d4f' : 
                           stats.avgStress > 4 ? '#faad14' : '#52c41a' 
                  }}
                  prefix={<HeartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Cơn thèm TB"
                  value={stats.avgCraving}
                  suffix="/10"
                  valueStyle={{ 
                    color: stats.avgCraving > 7 ? '#ff4d4f' : 
                           stats.avgCraving > 4 ? '#faad14' : '#52c41a' 
                  }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Text strong>Khoảng thời gian:</Text>
              <Select
                value={filterPeriod}
                onChange={setFilterPeriod}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="week">7 ngày qua</Option>
                <Option value="month">30 ngày qua</Option>
                <Option value="3months">3 tháng qua</Option>
                <Option value="all">Tất cả</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Text strong>Trạng thái:</Text>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="smoke_free">Không hút thuốc</Option>
                <Option value="reduced">Giảm lượng hút</Option>
                <Option value="normal">Hút bình thường</Option>
                <Option value="increased">Hút nhiều hơn</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Chọn ngày cụ thể:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%', marginTop: 8 }}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={4}>
              <Button 
                onClick={() => {
                  setFilterPeriod('week');
                  setFilterStatus('all');
                  setDateRange([]);
                }}
                style={{ marginTop: 24 }}
              >
                Đặt lại bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Records Table */}
        <Card title="Lịch sử theo dõi">
          {filteredRecords.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bản ghi`
              }}
              scroll={{ x: 800 }}
            />
          ) : (
            <Empty
              description="Không có dữ liệu theo dõi"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                onClick={() => navigate('/member/daily-checkin')}
              >
                Bắt đầu theo dõi
              </Button>
            </Empty>
          )}
        </Card>

        {/* Recent Timeline */}
        {filteredRecords.length > 0 && (
          <Card title="Timeline gần đây" className="mt-4">
            <Timeline mode="left">
              {filteredRecords.slice(0, 5).map(record => (
                <Timeline.Item
                  key={record.id}
                  color={getStatusColor(record.smoking_status)}
                  label={moment(record.record_date).format('DD/MM')}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      {getStatusIcon(record.smoking_status)}
                      <Text strong>{getStatusText(record.smoking_status)}</Text>
                      {record.cigarettes_count > 0 && (
                        <Badge count={record.cigarettes_count} />
                      )}
                    </Space>
                    {record.notes && (
                      <Text type="secondary" italic>{record.notes}</Text>
                    )}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmokingStatusTracker;