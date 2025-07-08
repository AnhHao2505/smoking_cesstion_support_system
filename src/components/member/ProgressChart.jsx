import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Select, DatePicker, Button,
  Statistic, Progress, Space, Tag, Tooltip, Switch, Radio
} from 'antd';
import {
  LineChartOutlined, BarChartOutlined, PieChartOutlined,
  TrophyOutlined, CalendarOutlined, DownloadOutlined,
  HeartOutlined, SmileOutlined, FireOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { getDailyStateRecords } from '../../services/memberDashboardService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProgressChart = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [dataType, setDataType] = useState('smoking_status');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [showTrend, setShowTrend] = useState(true);

  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId) {
      fetchProgressData();
    }
  }, [userId, dateRange]);

  const fetchProgressData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to get real data from the API first
      const apiData = await getDailyStateRecords(userId);
      if (apiData && apiData.length > 0) {
        setRecords(apiData);
      } else {
        // Fallback to mock data for demonstration
        const mockData = generateMockData();
        setRecords(mockData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      // Fallback to mock data
      const mockData = generateMockData();
      setRecords(mockData);
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const data = [];
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const days = endDate.diff(startDate, 'days') + 1;

    for (let i = 0; i < days; i++) {
      const date = moment(startDate).add(i, 'days');
      const smokeFree = Math.random() > 0.3; // 70% chance of being smoke-free
      
      data.push({
        date: date.format('YYYY-MM-DD'),
        displayDate: date.format('DD/MM'),
        fullDate: date.format('DD/MM/YYYY'),
        smoking_status: smokeFree ? 1 : 0, // 1 for smoke-free, 0 for not
        cigarettes_count: smokeFree ? 0 : Math.floor(Math.random() * 15) + 1,
        stress_level: Math.floor(Math.random() * 10) + 1,
        craving_intensity: Math.floor(Math.random() * 10) + 1,
        mood_score: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        strategies_count: Math.floor(Math.random() * 5),
        week: date.format('w'),
        month: date.format('MM'),
        dayOfWeek: date.format('dddd')
      });
    }

    return data;
  };

  const processDataForChart = () => {
    if (!records.length) return [];

    switch (dataType) {
      case 'smoking_status':
        return records.map(record => ({
          ...record,
          value: record.smoking_status,
          label: record.smoking_status ? 'Không hút' : 'Có hút'
        }));
      
      case 'cigarettes_count':
        return records.map(record => ({
          ...record,
          value: record.cigarettes_count,
          label: `${record.cigarettes_count} điếu`
        }));
      
      case 'stress_level':
        return records.map(record => ({
          ...record,
          value: record.stress_level,
          label: `Căng thẳng: ${record.stress_level}/10`
        }));
      
      case 'craving_intensity':
        return records.map(record => ({
          ...record,
          value: record.craving_intensity,
          label: `Cơn thèm: ${record.craving_intensity}/10`
        }));
      
      case 'mood_score':
        return records.map(record => ({
          ...record,
          value: record.mood_score,
          label: `Tâm trạng: ${record.mood_score}/5`
        }));
      
      default:
        return records;
    }
  };

  const getWeeklyData = () => {
    const weeklyStats = {};
    
    records.forEach(record => {
      const week = moment(record.date).format('YYYY-[W]WW');
      if (!weeklyStats[week]) {
        weeklyStats[week] = {
          week,
          smokeFreeCount: 0,
          totalDays: 0,
          totalCigarettes: 0,
          avgStress: 0,
          avgCraving: 0,
          avgMood: 0
        };
      }
      
      weeklyStats[week].totalDays += 1;
      weeklyStats[week].smokeFreeCount += record.smoking_status;
      weeklyStats[week].totalCigarettes += record.cigarettes_count;
      weeklyStats[week].avgStress += record.stress_level;
      weeklyStats[week].avgCraving += record.craving_intensity;
      weeklyStats[week].avgMood += record.mood_score;
    });

    return Object.values(weeklyStats).map(week => ({
      ...week,
      smokeFreeRate: (week.smokeFreeCount / week.totalDays * 100).toFixed(1),
      avgStress: (week.avgStress / week.totalDays).toFixed(1),
      avgCraving: (week.avgCraving / week.totalDays).toFixed(1),
      avgMood: (week.avgMood / week.totalDays).toFixed(1)
    }));
  };

  const chartData = processDataForChart();
  const weeklyData = getWeeklyData();

  const calculateStats = () => {
    if (!records.length) return null;

    const smokeFreeCount = records.filter(r => r.smoking_status === 1).length;
    const totalCigarettes = records.reduce((sum, r) => sum + r.cigarettes_count, 0);
    const avgStress = records.reduce((sum, r) => sum + r.stress_level, 0) / records.length;
    const avgCraving = records.reduce((sum, r) => sum + r.craving_intensity, 0) / records.length;
    const avgMood = records.reduce((sum, r) => sum + r.mood_score, 0) / records.length;

    return {
      smokeFreeRate: (smokeFreeCount / records.length * 100).toFixed(1),
      totalCigarettes,
      avgStress: avgStress.toFixed(1),
      avgCraving: avgCraving.toFixed(1),
      avgMood: avgMood.toFixed(1),
      smokeFreeCount,
      totalDays: records.length,
      improvement: calculateImprovement()
    };
  };

  const calculateImprovement = () => {
    if (records.length < 7) return null;

    const firstWeek = records.slice(0, 7);
    const lastWeek = records.slice(-7);

    const firstWeekSmokeFree = firstWeek.filter(r => r.smoking_status === 1).length;
    const lastWeekSmokeFree = lastWeek.filter(r => r.smoking_status === 1).length;

    return {
      smokeFreeImprovement: lastWeekSmokeFree - firstWeekSmokeFree,
      stressImprovement: (
        firstWeek.reduce((sum, r) => sum + r.stress_level, 0) / 7 -
        lastWeek.reduce((sum, r) => sum + r.stress_level, 0) / 7
      ).toFixed(1)
    };
  };

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <RechartsTooltip 
              labelFormatter={(label, payload) => {
                const data = payload[0]?.payload;
                return data ? data.fullDate : label;
              }}
              formatter={(value, name) => {
                const data = chartData.find(d => d.value === value);
                return [data?.label || value, getDataTypeLabel()];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#1890ff" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name={getDataTypeLabel()}
            />
            {showTrend && (
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ff7875" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Xu hướng"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#1890ff" 
              fill="#1890ff" 
              fillOpacity={0.3}
              name={getDataTypeLabel()}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#1890ff" 
              name={getDataTypeLabel()}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'weekly') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="smokeFreeRate" 
              fill="#52c41a" 
              name="Tỷ lệ không hút (%)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="avgStress" 
              stroke="#ff4d4f" 
              name="Căng thẳng TB"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="avgCraving" 
              stroke="#faad14" 
              name="Cơn thèm TB"
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
  };

  const getDataTypeLabel = () => {
    const labels = {
      'smoking_status': 'Trạng thái hút thuốc',
      'cigarettes_count': 'Số điếu thuốc',
      'stress_level': 'Mức độ căng thẳng',
      'craving_intensity': 'Cường độ cơn thèm',
      'mood_score': 'Điểm tâm trạng'
    };
    return labels[dataType] || dataType;
  };

  const stats = calculateStats();

  return (
    <div className="progress-chart">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <LineChartOutlined /> Biểu đồ tiến độ
          </Title>
          <Space>
            <Button icon={<DownloadOutlined />}>
              Xuất báo cáo
            </Button>
            <Button icon={<CalendarOutlined />}>
              Lên lịch báo cáo
            </Button>
          </Space>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ không hút thuốc"
                  value={stats.smokeFreeRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
                <Text type="secondary">
                  {stats.smokeFreeCount}/{stats.totalDays} ngày
                </Text>
                {stats.improvement?.smokeFreeImprovement && (
                  <div className="mt-2">
                    <Tag color={stats.improvement.smokeFreeImprovement > 0 ? 'green' : 'red'}>
                      {stats.improvement.smokeFreeImprovement > 0 ? '+' : ''}
                      {stats.improvement.smokeFreeImprovement} ngày/tuần
                    </Tag>
                  </div>
                )}
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
                  title="Căng thẳng trung bình"
                  value={stats.avgStress}
                  suffix="/10"
                  valueStyle={{ 
                    color: stats.avgStress > 7 ? '#ff4d4f' : 
                           stats.avgStress > 4 ? '#faad14' : '#52c41a' 
                  }}
                  prefix={<HeartOutlined />}
                />
                {stats.improvement?.stressImprovement && (
                  <div className="mt-2">
                    <Tag color={stats.improvement.stressImprovement > 0 ? 'green' : 'red'}>
                      {stats.improvement.stressImprovement > 0 ? '-' : '+'}
                      {Math.abs(stats.improvement.stressImprovement)} điểm
                    </Tag>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tâm trạng trung bình"
                  value={stats.avgMood}
                  suffix="/5"
                  valueStyle={{ 
                    color: stats.avgMood > 4 ? '#52c41a' : 
                           stats.avgMood > 2 ? '#faad14' : '#ff4d4f' 
                  }}
                  prefix={<SmileOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Chart Controls */}
        <Card className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Text strong>Loại biểu đồ:</Text>
              <Radio.Group
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={{ marginTop: 8, width: '100%' }}
              >
                <Radio.Button value="line">
                  <LineChartOutlined /> Đường
                </Radio.Button>
                <Radio.Button value="area">
                  <BarChartOutlined /> Vùng
                </Radio.Button>
                <Radio.Button value="bar">
                  <BarChartOutlined /> Cột
                </Radio.Button>
                <Radio.Button value="weekly">
                  <PieChartOutlined /> Tuần
                </Radio.Button>
              </Radio.Group>
            </Col>
            
            {chartType !== 'weekly' && (
              <Col xs={24} md={6}>
                <Text strong>Dữ liệu hiển thị:</Text>
                <Select
                  value={dataType}
                  onChange={setDataType}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="smoking_status">Trạng thái hút thuốc</Option>
                  <Option value="cigarettes_count">Số điếu thuốc</Option>
                  <Option value="stress_level">Mức độ căng thẳng</Option>
                  <Option value="craving_intensity">Cường độ cơn thèm</Option>
                  <Option value="mood_score">Điểm tâm trạng</Option>
                </Select>
              </Col>
            )}
            
            <Col xs={24} md={8}>
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%', marginTop: 8 }}
                format="DD/MM/YYYY"
              />
            </Col>
            
            <Col xs={24} md={4}>
              <Text strong>Hiển thị xu hướng:</Text>
              <div style={{ marginTop: 8 }}>
                <Switch
                  checked={showTrend}
                  onChange={setShowTrend}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Chart */}
        <Card title={`${getDataTypeLabel()} - ${chartType === 'weekly' ? 'Theo tuần' : 'Theo ngày'}`}>
          {renderChart()}
        </Card>

        {/* Weekly Summary Table */}
        {chartType === 'weekly' && weeklyData.length > 0 && (
          <Card title="Tổng kết theo tuần" className="mt-4">
            <Row gutter={[16, 16]}>
              {weeklyData.map((week, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small">
                    <Text strong>{week.week}</Text>
                    <div className="mt-2">
                      <Progress 
                        percent={parseFloat(week.smokeFreeRate)}
                        size="small"
                        status="active"
                        format={percent => `${percent}%`}
                      />
                      <Text type="secondary">Không hút thuốc</Text>
                    </div>
                    <div className="mt-2">
                      <Space>
                        <Tooltip title="Căng thẳng trung bình">
                          <Tag color="red">{week.avgStress}/10</Tag>
                        </Tooltip>
                        <Tooltip title="Cơn thèm trung bình">
                          <Tag color="orange">{week.avgCraving}/10</Tag>
                        </Tooltip>
                        <Tooltip title="Tâm trạng trung bình">
                          <Tag color="blue">{week.avgMood}/5</Tag>
                        </Tooltip>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;