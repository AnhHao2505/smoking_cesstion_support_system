import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Table, Tag,
  Timeline, Alert, Statistic, Button, message, Empty,
  Tabs, Select, Space, DatePicker
} from 'antd';
import {
  TrophyOutlined, HistoryOutlined, LineChartOutlined,
  HeartOutlined, BulbOutlined, WarningOutlined,
  CheckCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Services
import { 
  getCurrentSmokingStatus,
  formatStatusForDisplay
} from '../../services/smokingStatusService';
import { calculateAddictionScore } from '../../services/smokingInitialQuizService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SmokingStatusComprehensive = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Filter states for history tab
  const [activeTab, setActiveTab] = useState('overview');
  const [historyFilter, setHistoryFilter] = useState('30days');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Chỉ fetch current status từ API thực tế (không cần truyền userId)
        const currentStatus = await getCurrentSmokingStatus().catch(() => null);
        console.log('Current status from API:', currentStatus); // Debug log
        setCurrentStatus(currentStatus);
        
        // Tạo mock data cho lịch sử (vì backend chưa có API history)
        const mockHistory = currentStatus ? [
          {
            id: 1,
            createAt: new Date().toISOString(),
            point: currentStatus ? getScoreFromResponse(currentStatus) : 0,
            dailySmoking: currentStatus.dailySmoking || 0
          }
        ] : [];
        setStatusHistory(mockHistory);
        
        // Tính toán statistics từ current data
        const calculatedStats = calculateStatisticsFromCurrentStatus(currentStatus, mockHistory);
        setRecommendations(calculatedStats.recommendations);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching smoking status data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán statistics đơn giản từ current status
  const calculateStatisticsFromCurrentStatus = (currentStatus) => {
    console.log('calculateStatisticsFromCurrentStatus input:', currentStatus); // Debug log
    
    // Convert addiction enum to score for processing
    const score = currentStatus ? getScoreFromResponse(currentStatus) : 0;
    console.log('Calculated score:', score); // Debug log
    
    // Statistics cơ bản dựa trên current status
    const statistics = {
      hasAssessment: !!currentStatus,
      currentScore: score,
      currentLevel: getCurrentLevel(score),
      dailySmoking: currentStatus?.dailySmoking || 0,
      assessmentDate: currentStatus?.createAt ? moment(currentStatus.createAt).format('DD/MM/YYYY') : 'Chưa có'
    };
    
    // Recommendations đơn giản dựa trên current status
    const recommendations = generateSimpleRecommendations(currentStatus, score);
    
    return {
      statistics,
      recommendations
    };
  };

  // Calculate actual score using SmokingInitialQuiz service
  const getScoreFromResponse = (statusData) => {
    if (!statusData) return 0;
    
    // Use the same calculation as SmokingInitialQuiz service
    return calculateAddictionScore(statusData);
  };

  // Helper function to get addiction level from calculated score
  const getCurrentLevel = (score) => {
    if (score <= 7) return 'Không nghiện';
    if (score <= 15) return 'Nghiện nhẹ';
    if (score <= 25) return 'Nghiện trung bình';
    return 'Nghiện nặng';
  };

  // Helper function to get addiction level color
  const getLevelColor = (score) => {
    if (score <= 7) return 'green';
    if (score <= 15) return 'gold';
    if (score <= 25) return 'orange';
    return 'red';
  };

  // Recommendations đơn giản
  const generateSimpleRecommendations = (currentStatus, score) => {
    const recommendations = [];
    
    if (!currentStatus) {
      recommendations.push('Hãy bắt đầu bằng việc thực hiện đánh giá mức độ nghiện thuốc đầu tiên');
      return recommendations;
    }
    
    // Use calculated score instead of point
    if (score > 20) {
      recommendations.push('Mức độ nghiện cao - hãy tìm kiếm sự hỗ trợ từ coach chuyên nghiệp');
      recommendations.push('Tham gia nhóm hỗ trợ cai thuốc để có thêm động lực');
    } else if (score > 10) {
      recommendations.push('Đặt mục tiêu giảm dần số điếu thuốc mỗi tuần');
      recommendations.push('Tìm các hoạt động thay thế khi cảm thấy thèm thuốc');
    } else {
      recommendations.push('Bạn đang có kết quả tốt! Hãy duy trì và tiếp tục nỗ lực');
    }
    
    // Thêm recommendations chung
    recommendations.push('Tham khảo ý kiến bác sĩ về phương pháp cai thuốc phù hợp');
    recommendations.push('Tạo môi trường sống không khói thuốc');
    
    return recommendations;
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const currentStatus = await getCurrentSmokingStatus().catch(() => null);
      setCurrentStatus(currentStatus);
      
      const mockHistory = currentStatus ? [
        {
          id: 1,
          createAt: new Date().toISOString(),
          point: currentStatus ? getScoreFromResponse(currentStatus) : 0,
          dailySmoking: currentStatus.dailySmoking || 0
        }
      ] : [];
      setStatusHistory(mockHistory);
      
      const calculatedStats = calculateStatisticsFromCurrentStatus(currentStatus);
      setRecommendations(calculatedStats.recommendations);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAssessment = () => {
    navigate('/member/daily-record');
  };

  // Format current status for display
  const formattedStatus = formatStatusForDisplay(currentStatus);

  // Table columns for history
  const historyColumns = [
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createAt) - moment(b.createAt),
    },
    {
      title: 'Điểm số',
      dataIndex: 'point',
      key: 'point',
      render: (point) => (
        <Tag color={point <= 7 ? 'green' : point <= 15 ? 'orange' : point <= 25 ? 'red' : 'volcano'}>
          {point} điểm
        </Tag>
      ),
      sorter: (a, b) => a.point - b.point,
    },
    {
      title: 'Mức độ nghiện',
      dataIndex: 'point',
      key: 'addiction',
      render: (point) => {
        const level = point <= 7 ? 'Không nghiện' : 
                    point <= 15 ? 'Nghiện nhẹ' : 
                    point <= 25 ? 'Nghiện trung bình' : 'Nghiện nặng';
        const color = point <= 7 ? 'green' : 
                     point <= 15 ? 'orange' : 
                     point <= 25 ? 'red' : 'volcano';
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: 'Điếu/ngày',
      dataIndex: 'dailySmoking',
      key: 'dailySmoking',
      render: (count) => `${count || 0} điếu`,
    }
  ];

  if (loading && !currentStatus) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="smoking-status-comprehensive">
      <div className="container py-4">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>
            <HeartOutlined style={{ marginRight: 8 }} />
            Tổng quan trạng thái nghiện thuốc
          </Title>
          <div>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleNewAssessment}
            >
              Báo cáo hôm nay
            </Button>
          </div>
        </div>

        {/* Alert if no current status */}
        {!currentStatus && (
          <Alert
            message="Chưa có đánh giá nào"
            description="Bạn chưa thực hiện đánh giá mức độ nghiện thuốc. Hãy bắt đầu với một đánh giá để theo dõi tiến trình của mình."
            type="info"
            showIcon
            action={
              <Button type="primary" onClick={handleNewAssessment}>
                Bắt đầu báo cáo
              </Button>
            }
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Main Content Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          {/* Overview Tab */}
          <TabPane tab="Tổng quan" key="overview">
            {formattedStatus && (
              <>
                {/* Current Status Overview */}
                <Row gutter={[16, 16]} className="mb-4">
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Mức độ nghiện hiện tại"
                        value={formattedStatus.level}
                        valueStyle={{ 
                          color: formattedStatus.color === 'green' ? '#3f8600' : 
                                 formattedStatus.color === 'orange' ? '#fa8c16' : 
                                 formattedStatus.color === 'red' ? '#cf1322' : '#a8071a' 
                        }}
                        prefix={<HeartOutlined />}
                      />
                    </Card>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Điểm đánh giá"
                        value={formattedStatus.score}
                        prefix={<LineChartOutlined />}
                        suffix="/ 30"
                      />
                    </Card>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Điếu thuốc/ngày"
                        value={formattedStatus.dailySmoking}
                        prefix={<WarningOutlined />}
                        suffix="điếu"
                      />
                    </Card>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Số lần đánh giá"
                        value={statusHistory?.length || 0}
                        prefix={<HistoryOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Current Status Detail */}
                {formattedStatus && (
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} md={12}>
                      <Card title="Chi tiết đánh giá" extra={<LineChartOutlined />}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Lý do cai thuốc:</Text>
                            <Text strong>{formattedStatus.reasonToQuit || 'Chưa có'}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Mục tiêu:</Text>
                            <Text strong>{formattedStatus.goal || 'Chưa có'}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Ngày đánh giá:</Text>
                            <Text strong>{formattedStatus.assessmentDate}</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Card title="Thống kê đơn giản">
                        <div>
                          <Text strong>Điểm hiện tại: </Text>
                          <Text>{formattedStatus.score} điểm</Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Mức độ nghiện: </Text>
                          <Text>{formattedStatus.level}</Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Điếu thuốc mỗi ngày: </Text>
                          <Text>{formattedStatus.dailySmoking} điếu</Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Lần đánh giá gần nhất: </Text>
                          <Text>{formattedStatus.assessmentDate}</Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </TabPane>

          {/* History Tab with Date Filter */}
          <TabPane tab="Lịch sử đánh giá" key="history">
            <Card title="Lịch sử đánh giá" extra={<HistoryOutlined />}>
              {/* Filter Controls */}
              <div style={{ marginBottom: 16 }}>
                <Space wrap>
                  <span>Lọc theo:</span>
                  <Select
                    value={historyFilter}
                    onChange={setHistoryFilter}
                    style={{ width: 150 }}
                  >
                    <Option value="7days">7 ngày qua</Option>
                    <Option value="30days">30 ngày qua</Option>
                    <Option value="90days">90 ngày qua</Option>
                    <Option value="all">Tất cả</Option>
                  </Select>
                  
                  <span>Hoặc chọn ngày cụ thể:</span>
                  <DatePicker
                    placeholder="Chọn ngày"
                    value={selectedDate ? moment(selectedDate) : null}
                    onChange={(date) => {
                      setSelectedDate(date ? date.format('YYYY-MM-DD') : null);
                      if (date) {
                        setHistoryFilter('custom'); // Set to custom when date is selected
                      }
                    }}
                    format="DD/MM/YYYY"
                    allowClear
                  />
                  
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                      setHistoryFilter('30days');
                      setSelectedDate(null);
                      refreshData();
                    }}
                  >
                    Đặt lại
                  </Button>
                </Space>
              </div>
              
              {statusHistory.length > 0 ? (
                <Table
                  columns={historyColumns}
                  dataSource={statusHistory.filter(item => {
                    const itemDate = moment(item.createAt);
                    
                    // If specific date is selected, filter by exact date
                    if (selectedDate) {
                      return itemDate.format('YYYY-MM-DD') === selectedDate;
                    }
                    
                    // Otherwise filter by time range
                    if (historyFilter === 'all') return true;
                    
                    const now = moment();
                    switch (historyFilter) {
                      case '7days':
                        return itemDate.isAfter(now.clone().subtract(7, 'days'));
                      case '30days':
                        return itemDate.isAfter(now.clone().subtract(30, 'days'));
                      case '90days':
                        return itemDate.isAfter(now.clone().subtract(90, 'days'));
                      default:
                        return true;
                    }
                  })}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                  loading={loading}
                />
              ) : (
                <Empty description="Chưa có lịch sử đánh giá" />
              )}
            </Card>
          </TabPane>

          {/* Recommendations Tab */}
          <TabPane tab="Gợi ý cá nhân" key="recommendations">
            <Row gutter={[16, 16]}>
              {/* Personal Goals and Motivation */}
              <Col xs={24} md={12}>
                <Card title="Lý do cai thuốc" extra={<HeartOutlined />}>
                  <Paragraph>
                    {formattedStatus?.reasonToQuit || 'Chưa có lý do được ghi nhận'}
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Mục tiêu cá nhân" extra={<TrophyOutlined />}>
                  <Paragraph>
                    {formattedStatus?.goal || 'Chưa có mục tiêu được đặt ra'}
                  </Paragraph>
                </Card>
              </Col>

              {/* Recommendations */}
              <Col xs={24}>
                <Card title="Gợi ý dành cho bạn" extra={<BulbOutlined />}>
                  <Timeline>
                    {recommendations.map((recommendation, index) => (
                      <Timeline.Item key={index} color="blue">
                        {recommendation}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default SmokingStatusComprehensive;
