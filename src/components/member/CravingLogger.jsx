import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Form, Button, Select, Slider,
  Input, DatePicker, TimePicker, Rate, Space, Tag, Table,
  message, Modal, Statistic, Progress, Timeline, Alert,
  Tooltip, Badge, Empty, Spin
} from 'antd';
import {
  PlusOutlined, ClockCircleOutlined, FireOutlined, 
  HeartOutlined, EnvironmentOutlined, SmileOutlined,
  FrownOutlined, SaveOutlined, HistoryOutlined,
  TrophyOutlined, WarningOutlined, CheckCircleOutlined,
  LineChartOutlined, CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { 
  getLatestMemberSmokingStatus, 
  updateLatestMemberSmokingStatus 
} from '../../services/memberSmokingStatusService';
import { getDailyStateRecords } from '../../services/memberDashboardService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CravingLogger = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cravingHistory, setCravingHistory] = useState([]);
  const [todayCravings, setTodayCravings] = useState([]);
  const [cravingStats, setCravingStats] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const navigate = useNavigate();

  const user = getCurrentUser();
  const userId = user?.userId || 101;

  useEffect(() => {
    fetchCravingData();
  }, [userId]);

  const fetchCravingData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent records and latest status
      const [records, latestStatus] = await Promise.all([
        getDailyStateRecords(userId, 30),
        getLatestMemberSmokingStatus(userId)
      ]);

      // Generate mock craving history
      const mockCravings = generateMockCravingHistory();
      setCravingHistory(mockCravings);
      
      const todaysCravings = mockCravings.filter(c => 
        moment(c.timestamp).isSame(moment(), 'day')
      );
      setTodayCravings(todaysCravings);

      // Calculate stats
      const stats = calculateCravingStats(mockCravings);
      setCravingStats(stats);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching craving data:', error);
      setLoading(false);
    }
  };

  const generateMockCravingHistory = () => {
    const cravings = [];
    const triggers = [
      'stress', 'boredom', 'social', 'after_meal', 'break_time',
      'alcohol', 'coffee', 'driving', 'phone_call', 'anxiety'
    ];
    const locations = [
      'home', 'office', 'car', 'restaurant', 'bar', 'street', 'park'
    ];
    const strategies = [
      'deep_breathing', 'exercise', 'distraction', 'meditation',
      'call_friend', 'chew_gum', 'drink_water', 'walk'
    ];

    for (let i = 0; i < 50; i++) {
      const timestamp = moment().subtract(Math.floor(Math.random() * 30), 'days')
        .subtract(Math.floor(Math.random() * 24), 'hours')
        .subtract(Math.floor(Math.random() * 60), 'minutes');

      cravings.push({
        id: i + 1,
        timestamp: timestamp.format(),
        intensity: Math.floor(Math.random() * 10) + 1,
        duration: Math.floor(Math.random() * 30) + 1, // minutes
        trigger: triggers[Math.floor(Math.random() * triggers.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        mood_before: Math.floor(Math.random() * 5) + 1,
        mood_after: Math.floor(Math.random() * 5) + 1,
        strategies_used: [strategies[Math.floor(Math.random() * strategies.length)]],
        successfully_resisted: Math.random() > 0.3,
        notes: Math.random() > 0.5 ? 'Ghi chú về cơn thèm này' : ''
      });
    }

    return cravings.sort((a, b) => moment(b.timestamp).unix() - moment(a.timestamp).unix());
  };

  const calculateCravingStats = (cravings) => {
    if (!cravings.length) return null;

    const today = cravings.filter(c => moment(c.timestamp).isSame(moment(), 'day'));
    const thisWeek = cravings.filter(c => moment(c.timestamp).isAfter(moment().subtract(7, 'days')));
    const lastWeek = cravings.filter(c => 
      moment(c.timestamp).isBetween(
        moment().subtract(14, 'days'),
        moment().subtract(7, 'days')
      )
    );

    const avgIntensity = cravings.reduce((sum, c) => sum + c.intensity, 0) / cravings.length;
    const avgDuration = cravings.reduce((sum, c) => sum + c.duration, 0) / cravings.length;
    const resistanceRate = cravings.filter(c => c.successfully_resisted).length / cravings.length * 100;

    // Most common triggers
    const triggerCounts = {};
    cravings.forEach(c => {
      triggerCounts[c.trigger] = (triggerCounts[c.trigger] || 0) + 1;
    });
    const mostCommonTrigger = Object.keys(triggerCounts).reduce((a, b) => 
      triggerCounts[a] > triggerCounts[b] ? a : b
    );

    return {
      todayCount: today.length,
      weeklyCount: thisWeek.length,
      weeklyChange: thisWeek.length - lastWeek.length,
      avgIntensity: avgIntensity.toFixed(1),
      avgDuration: avgDuration.toFixed(0),
      resistanceRate: resistanceRate.toFixed(1),
      mostCommonTrigger,
      peakHours: calculatePeakHours(cravings),
      improvementTrend: calculateTrend(cravings)
    };
  };

  const calculatePeakHours = (cravings) => {
    const hourCounts = {};
    cravings.forEach(c => {
      const hour = moment(c.timestamp).hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
    
    return `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`;
  };

  const calculateTrend = (cravings) => {
    const recentWeek = cravings.filter(c => 
      moment(c.timestamp).isAfter(moment().subtract(7, 'days'))
    );
    const previousWeek = cravings.filter(c => 
      moment(c.timestamp).isBetween(
        moment().subtract(14, 'days'),
        moment().subtract(7, 'days')
      )
    );

    const recentAvgIntensity = recentWeek.reduce((sum, c) => sum + c.intensity, 0) / recentWeek.length;
    const previousAvgIntensity = previousWeek.reduce((sum, c) => sum + c.intensity, 0) / previousWeek.length;

    return {
      intensityChange: (recentAvgIntensity - previousAvgIntensity).toFixed(1),
      frequencyChange: recentWeek.length - previousWeek.length
    };
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const cravingData = {
        ...values,
        timestamp: moment().format(),
        user_id: userId
      };

      // Here you would call the API to save the craving log
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Đã ghi nhận cơn thèm thành công!');
      form.resetFields();
      
      // Refresh data
      await fetchCravingData();
      
    } catch (error) {
      console.error('Error logging craving:', error);
      message.error('Có lỗi xảy ra khi ghi nhận cơn thèm');
    } finally {
      setSubmitting(false);
    }
  };

  const getTriggerText = (trigger) => {
    const triggerMap = {
      'stress': 'Căng thẳng',
      'boredom': 'Buồn chán',
      'social': 'Xã hội',
      'after_meal': 'Sau bữa ăn',
      'break_time': 'Giờ nghỉ',
      'alcohol': 'Uống rượu',
      'coffee': 'Uống cà phê',
      'driving': 'Lái xe',
      'phone_call': 'Gọi điện',
      'anxiety': 'Lo lắng'
    };
    return triggerMap[trigger] || trigger;
  };

  const getLocationText = (location) => {
    const locationMap = {
      'home': 'Nhà',
      'office': 'Văn phòng',
      'car': 'Xe hơi',
      'restaurant': 'Nhà hàng',
      'bar': 'Quán bar',
      'street': 'Đường phố',
      'park': 'Công viên'
    };
    return locationMap[location] || location;
  };

  const getStrategyText = (strategy) => {
    const strategyMap = {
      'deep_breathing': 'Hít thở sâu',
      'exercise': 'Tập thể dục',
      'distraction': 'Làm việc khác',
      'meditation': 'Thiền',
      'call_friend': 'Gọi bạn bè',
      'chew_gum': 'Nhai kẹo cao su',
      'drink_water': 'Uống nước',
      'walk': 'Đi bộ'
    };
    return strategyMap[strategy] || strategy;
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: timestamp => (
        <div>
          <div>{moment(timestamp).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(timestamp).format('HH:mm')}
          </Text>
        </div>
      ),
      sorter: (a, b) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Cường độ',
      dataIndex: 'intensity',
      key: 'intensity',
      render: intensity => (
        <div>
          <Progress 
            percent={intensity * 10} 
            size="small" 
            strokeColor={intensity > 7 ? '#ff4d4f' : intensity > 4 ? '#faad14' : '#52c41a'}
            format={() => `${intensity}/10`}
          />
        </div>
      ),
      sorter: (a, b) => a.intensity - b.intensity
    },
    {
      title: 'Nguyên nhân',
      dataIndex: 'trigger',
      key: 'trigger',
      render: trigger => (
        <Tag color="blue">{getTriggerText(trigger)}</Tag>
      )
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      render: location => (
        <Tag color="green">{getLocationText(location)}</Tag>
      )
    },
    {
      title: 'Thời gian (phút)',
      dataIndex: 'duration',
      key: 'duration',
      render: duration => `${duration} phút`,
      sorter: (a, b) => a.duration - b.duration
    },
    {
      title: 'Kết quả',
      dataIndex: 'successfully_resisted',
      key: 'successfully_resisted',
      render: resisted => (
        <Badge 
          status={resisted ? 'success' : 'error'} 
          text={resisted ? 'Chống chọi thành công' : 'Không chống chọi được'}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <Spin size="large" />
        <div className="mt-3">Đang tải dữ liệu cơn thèm...</div>
      </div>
    );
  }

  return (
    <div className="craving-logger">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <FireOutlined /> Ghi nhận cơn thèm
          </Title>
          <Space>
            <Button 
              icon={<HistoryOutlined />}
              onClick={() => setHistoryModalVisible(true)}
            >
              Lịch sử cơn thèm
            </Button>
            <Button 
              icon={<LineChartOutlined />}
              onClick={() => navigate('/member/progress-chart')}
            >
              Xem biểu đồ
            </Button>
          </Space>
        </div>

        {/* Today's Alert */}
        {todayCravings.length > 0 && (
          <Alert
            message={`Hôm nay bạn đã có ${todayCravings.length} cơn thèm`}
            description={`Cơn thèm gần nhất: ${moment(todayCravings[0].timestamp).format('HH:mm')} với cường độ ${todayCravings[0].intensity}/10`}
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Statistics */}
        {cravingStats && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hôm nay"
                  value={cravingStats.todayCount}
                  suffix="cơn thèm"
                  valueStyle={{ color: cravingStats.todayCount > 5 ? '#ff4d4f' : '#52c41a' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tuần này"
                  value={cravingStats.weeklyCount}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<CalendarOutlined />}
                />
                {cravingStats.weeklyChange !== 0 && (
                  <div className="mt-2">
                    <Tag color={cravingStats.weeklyChange < 0 ? 'green' : 'red'}>
                      {cravingStats.weeklyChange > 0 ? '+' : ''}
                      {cravingStats.weeklyChange} so với tuần trước
                    </Tag>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ chống chọi"
                  value={cravingStats.resistanceRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
                <Progress 
                  percent={parseFloat(cravingStats.resistanceRate)} 
                  size="small" 
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Cường độ TB"
                  value={cravingStats.avgIntensity}
                  suffix="/10"
                  valueStyle={{ 
                    color: cravingStats.avgIntensity > 7 ? '#ff4d4f' : 
                           cravingStats.avgIntensity > 4 ? '#faad14' : '#52c41a' 
                  }}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Insights */}
        {cravingStats && (
          <Card className="mb-4" title="Thông tin chi tiết">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Nguyên nhân thường gặp nhất:</Text>
                    <Tag color="orange" className="ml-2">
                      {getTriggerText(cravingStats.mostCommonTrigger)}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Thời gian hay có cơn thèm:</Text>
                    <Tag color="purple" className="ml-2">
                      {cravingStats.peakHours}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Thời gian trung bình:</Text>
                    <Tag color="blue" className="ml-2">
                      {cravingStats.avgDuration} phút
                    </Tag>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                {cravingStats.improvementTrend && (
                  <div>
                    <Text strong>Xu hướng cải thiện:</Text>
                    <div className="mt-2">
                      <Space direction="vertical">
                        <div>
                          <Text>Cường độ: </Text>
                          <Tag color={cravingStats.improvementTrend.intensityChange < 0 ? 'green' : 'red'}>
                            {cravingStats.improvementTrend.intensityChange > 0 ? '+' : ''}
                            {cravingStats.improvementTrend.intensityChange} điểm
                          </Tag>
                        </div>
                        <div>
                          <Text>Tần suất: </Text>
                          <Tag color={cravingStats.improvementTrend.frequencyChange < 0 ? 'green' : 'red'}>
                            {cravingStats.improvementTrend.frequencyChange > 0 ? '+' : ''}
                            {cravingStats.improvementTrend.frequencyChange} cơn/tuần
                          </Tag>
                        </div>
                      </Space>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        )}

        {/* Craving Log Form */}
        <Card title="Ghi nhận cơn thèm mới" className="mb-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="intensity"
                  label="Cường độ cơn thèm (1-10)"
                  rules={[{ required: true, message: 'Vui lòng chọn cường độ' }]}
                >
                  <Slider
                    min={1}
                    max={10}
                    marks={{
                      1: 'Nhẹ',
                      5: 'Trung bình',
                      10: 'Rất mạnh'
                    }}
                    tooltip={{ formatter: value => `${value}/10` }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="duration"
                  label="Thời gian kéo dài (phút)"
                  rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                >
                  <Slider
                    min={1}
                    max={60}
                    marks={{
                      1: '1p',
                      15: '15p',
                      30: '30p',
                      60: '1h'
                    }}
                    tooltip={{ formatter: value => `${value} phút` }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="trigger"
                  label="Nguyên nhân gây ra cơn thèm"
                  rules={[{ required: true, message: 'Vui lòng chọn nguyên nhân' }]}
                >
                  <Select placeholder="Chọn nguyên nhân">
                    <Option value="stress">Căng thẳng</Option>
                    <Option value="boredom">Buồn chán</Option>
                    <Option value="social">Xã hội</Option>
                    <Option value="after_meal">Sau bữa ăn</Option>
                    <Option value="break_time">Giờ nghỉ</Option>
                    <Option value="alcohol">Uống rượu</Option>
                    <Option value="coffee">Uống cà phê</Option>
                    <Option value="driving">Lái xe</Option>
                    <Option value="phone_call">Gọi điện</Option>
                    <Option value="anxiety">Lo lắng</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="location"
                  label="Địa điểm"
                  rules={[{ required: true, message: 'Vui lòng chọn địa điểm' }]}
                >
                  <Select placeholder="Chọn địa điểm">
                    <Option value="home">Nhà</Option>
                    <Option value="office">Văn phòng</Option>
                    <Option value="car">Xe hơi</Option>
                    <Option value="restaurant">Nhà hàng</Option>
                    <Option value="bar">Quán bar</Option>
                    <Option value="street">Đường phố</Option>
                    <Option value="park">Công viên</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="mood_before"
                  label="Tâm trạng trước cơn thèm"
                  rules={[{ required: true, message: 'Vui lòng đánh giá tâm trạng' }]}
                >
                  <Rate 
                    character={({ index }) => {
                      const icons = [<FrownOutlined />, <FrownOutlined />, <SmileOutlined />, <SmileOutlined />, <SmileOutlined />];
                      return icons[index];
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="strategies_used"
                  label="Biện pháp đã sử dụng"
                >
                  <Select 
                    mode="multiple" 
                    placeholder="Chọn biện pháp đã sử dụng"
                    allowClear
                  >
                    <Option value="deep_breathing">Hít thở sâu</Option>
                    <Option value="exercise">Tập thể dục</Option>
                    <Option value="distraction">Làm việc khác</Option>
                    <Option value="meditation">Thiền</Option>
                    <Option value="call_friend">Gọi bạn bè</Option>
                    <Option value="chew_gum">Nhai kẹo cao su</Option>
                    <Option value="drink_water">Uống nước</Option>
                    <Option value="walk">Đi bộ</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="successfully_resisted"
                  label="Kết quả"
                  rules={[{ required: true, message: 'Vui lòng chọn kết quả' }]}
                >
                  <Select placeholder="Bạn có chống chọi được cơn thèm không?">
                    <Option value={true}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> Chống chọi thành công
                    </Option>
                    <Option value={false}>
                      <WarningOutlined style={{ color: '#ff4d4f' }} /> Không chống chọi được
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="mood_after"
                  label="Tâm trạng sau cơn thèm"
                >
                  <Rate 
                    character={({ index }) => {
                      const icons = [<FrownOutlined />, <FrownOutlined />, <SmileOutlined />, <SmileOutlined />, <SmileOutlined />];
                      return icons[index];
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="notes"
                  label="Ghi chú thêm"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Mô tả chi tiết về cơn thèm, cảm giác, hoặc bất kỳ điều gì bạn muốn ghi nhận..."
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={submitting}
                    size="large"
                    block
                  >
                    Ghi nhận cơn thèm
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Recent Cravings */}
        <Card title="Cơn thèm gần đây">
          {cravingHistory.length > 0 ? (
            <Table
              columns={columns}
              dataSource={cravingHistory.slice(0, 10)}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
            />
          ) : (
            <Empty description="Chưa có dữ liệu cơn thèm" />
          )}
          
          {cravingHistory.length > 10 && (
            <div className="text-center mt-3">
              <Button 
                type="link" 
                onClick={() => setHistoryModalVisible(true)}
              >
                Xem tất cả lịch sử cơn thèm
              </Button>
            </div>
          )}
        </Card>

        {/* History Modal */}
        <Modal
          title="Lịch sử cơn thèm"
          visible={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          width={1000}
          footer={null}
        >
          <Table
            columns={columns}
            dataSource={cravingHistory}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} cơn thèm`
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </Modal>
      </div>
    </div>
  );
};

export default CravingLogger;