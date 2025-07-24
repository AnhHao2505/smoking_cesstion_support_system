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
  DatePicker,
  message
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
  UserOutlined,
  InfoCircleOutlined
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
      message.error('Vui lòng đăng nhập để xem lịch sử kế hoạch cai thuốc');
    }
  }, [pagination.current, pagination.pageSize, userId]);

  useEffect(() => {
    filterPlans();
  }, [searchTerm, statusFilter, dateRange, plans]);

  const fetchQuitPlanHistory = async () => {
    try {
      setLoading(true);
      const response = await getOldPlansOfMember(
        pagination.current - 1, 
        pagination.pageSize
      );
      
      // Ensure response is an array
      const plansArray = Array.isArray(response.content) ? response.content : [];
      setPlans(plansArray);
      console.log('Loaded plans:', plansArray);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements || plansArray.length
      }));
    } catch (error) {
      console.error('Error fetching quit plan history:', error);
      message.error('Không thể tải lịch sử kế hoạch cai thuốc');
      setPlans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    // Ensure plans is an array before filtering
    if (!Array.isArray(plans)) {
      setFilteredPlans([]);
      return;
    }

    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        (plan.coachName && plan.coachName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.copingStrategies && plan.copingStrategies.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.smokingTriggersToAvoid && plan.smokingTriggersToAvoid.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.motivation && plan.motivation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.quitPlanStatus === statusFilter);
    }

    if (dateRange.length === 2) {
      filtered = filtered.filter(plan => {
        const planDate = moment(plan.startDate);
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
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'green';
      case 'FAILED': return 'red';
      case 'PENDING': return 'orange';
      case 'REJECTED': return 'red';
      case 'IN_PROGRESS': return 'blue';
      case 'ACTIVE': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ phê duyệt';
      case 'IN_PROGRESS': return 'Đang hoạt động';
      case 'COMPLETED': return 'Hoàn thành';
      case 'REJECTED': return 'Từ chối';
      case 'FAILED': return 'Thất bại';
      case 'ACTIVE': return 'Đang hoạt động';
      default: return status || 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircleOutlined />;
      case 'FAILED': return <CloseCircleOutlined />;
      case 'REJECTED': return <CloseCircleOutlined />;
      case 'PENDING': return <ClockCircleOutlined />;
      case 'IN_PROGRESS': return <ClockCircleOutlined />;
      case 'ACTIVE': return <ClockCircleOutlined />;
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

  const calculateProgress = (plan) => {
    const now = moment();
    const start = moment(plan.startDate);
    const end = moment(plan.endDate);
    
    // Ensure totalDays is valid
    const totalDays = end.diff(start, 'days');
    if (isNaN(totalDays) || totalDays <= 0) {
      return 0;
    }
    
    if (plan.quitPlanStatus === 'COMPLETED') {
      return 100;
    }
    
    if (now.isBefore(start)) {
      return 0;
    }
    
    if (now.isAfter(end)) {
      return 100;
    }
    
    const daysPassed = now.diff(start, 'days');
    if (isNaN(daysPassed) || daysPassed < 0) {
      return 0;
    }
    
    return Math.round((daysPassed / totalDays) * 100);
  };

  const columns = [
    {
      title: 'Thời gian kế hoạch',
      key: 'period',
      render: (_, record) => (
        <div>
          <Text strong>{formatDate(record.startDate)}</Text>
          <br />
          <Text type="secondary">đến {formatDate(record.endDate)}</Text>
          <br />
          <Text type="secondary">
            ({calculateDuration(record.startDate, record.endDate)} ngày)
          </Text>
        </div>
      )
    },
    {
      title: 'Huấn luyện viên',
      key: 'coach',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{record.coachName}</Text>
        </Space>
      )
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_, record) => {
        // Nếu kế hoạch bị từ chối, hiển thị thông báo đặc biệt
        if (record.quitPlanStatus?.toUpperCase() === 'REJECTED') {
          return (
            <div>
              <Tag color="red" style={{ marginBottom: '8px' }}>
                <CloseCircleOutlined /> Kế hoạch bị từ chối
              </Tag>
              <Text type="secondary" style={{ display: 'block' }}>
                Kế hoạch này đã bị từ chối và không được thực hiện
              </Text>
            </div>
          );
        }
        
        // Kiểm tra dữ liệu đầu vào hợp lệ
        const isValidProgress = !isNaN(record.progressInDay) && record.progressInDay !== null && record.progressInDay !== undefined;
        const isValidDuration = !isNaN(record.durationInDays) && record.durationInDays !== null && record.durationInDays !== undefined && record.durationInDays >= 0; // Cho phép 0
        
        // Nếu cả progressInDay và durationInDays đều là 0, hiển thị 0% thay vì tính toán
        let completionPercent = 0;
        let totalDays = 0;
        let daysPassed = 0;
        
        if (isValidProgress && isValidDuration) {
          // Sử dụng dữ liệu từ backend
          totalDays = record.durationInDays;
          daysPassed = record.progressInDay;
          
          if (totalDays > 0) {
            completionPercent = Math.round((daysPassed / totalDays) * 100);
          } else {
            // Nếu duration = 0, hiển thị 0%
            completionPercent = 0;
          }
        } else {
          // Fallback: tính toán dựa trên ngày tháng
          totalDays = calculateDuration(record.startDate, record.endDate);
          completionPercent = calculateProgress(record);
          daysPassed = Math.max(0, Math.min(moment().diff(moment(record.startDate), 'days'), totalDays));
        }
        
        // Đảm bảo completionPercent trong khoảng 0-100
        const safeCompletionPercent = isNaN(completionPercent) ? 0 : Math.min(100, Math.max(0, completionPercent));
        
        // Xác định status và màu sắc cho thanh tiến độ dựa trên phần trăm hoàn thành
        let progressStatus = 'normal';
        let strokeColor = '';
        // Sử dụng completionQuality từ backend nếu có
        let completionLevel = record.completionQuality || '';
        
        if (record.quitPlanStatus?.toUpperCase() === 'COMPLETED') {
          progressStatus = 'success';
          
          // Sử dụng completionQuality từ backend nếu có, nếu không thì tính theo phần trăm
          if (completionLevel) {
            // Dựa vào completionQuality từ backend để xác định màu sắc
            const qualityLower = completionLevel.toLowerCase();
            if (qualityLower.includes('xuất sắc')) {
              strokeColor = '#52c41a'; // Xanh lá đậm
            } else if (qualityLower.includes('tốt')) {
              strokeColor = '#73d13d'; // Xanh lá
            } else if (qualityLower.includes('khá')) {
              strokeColor = '#bae637'; // Xanh vàng
            } else {
              strokeColor = '#faad14'; // Cam
            }
          } else {
            // Fallback: quyết định màu sắc dựa trên phần trăm hoàn thành
            if (completionPercent >= 90) {
              strokeColor = '#52c41a'; // Xanh lá đậm
              completionLevel = 'xuất sắc';
            } else if (completionPercent >= 75) {
              strokeColor = '#73d13d'; // Xanh lá
              completionLevel = 'tốt';
            } else if (completionPercent >= 50) {
              strokeColor = '#bae637'; // Xanh vàng
              completionLevel = 'khá';
            } else {
              strokeColor = '#faad14'; // Cam
              completionLevel = 'cần cải thiện';
            }
          }
        } else if (['FAILED', 'REJECTED'].includes(record.quitPlanStatus?.toUpperCase())) {
          progressStatus = 'exception';
          strokeColor = '#f5222d'; // Đỏ
          // Nếu là FAILED, sử dụng completionQuality từ backend nếu có
          if (record.quitPlanStatus?.toUpperCase() === 'FAILED') {
            if (!completionLevel) {
              completionLevel = 'thất bại'; // Fallback nếu không có completionQuality
            }
          }
          // Nếu là REJECTED, hiển thị "từ chối"
          if (record.quitPlanStatus?.toUpperCase() === 'REJECTED') {
            completionLevel = 'từ chối';
          }
        } else {
          strokeColor = getStatusColor(record.quitPlanStatus);
        }
        
        // Viết hoa chữ cái đầu cho hiển thị
        completionLevel = completionLevel ? completionLevel.charAt(0).toUpperCase() + completionLevel.slice(1) : '';
        
        return (
          <div>
            <Progress 
              percent={safeCompletionPercent}
              size="small"
              status={progressStatus}
              strokeColor={strokeColor}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <Text type="secondary">
                <b>{!isNaN(daysPassed) && daysPassed !== null ? daysPassed : 0}/{!isNaN(totalDays) && totalDays !== null ? totalDays : 0}</b> ngày ({safeCompletionPercent}%)
              </Text>
              {record.quitPlanStatus?.toUpperCase() === 'COMPLETED' && completionLevel && (
                <Tag 
                  color="green" 
                  style={{ 
                    fontSize: '11px', 
                    marginLeft: '8px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    border: '1px solid #52c41a',
                    backgroundColor: '#52c41a',
                    color: 'white',
                    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                    boxShadow: '0 1px 2px rgba(82,196,26,0.2)'
                  }}
                >
                  ✓ {record.completionQuality ? record.completionQuality.charAt(0).toUpperCase() + record.completionQuality.slice(1) : completionLevel}
                </Tag>
              )}
              {record.quitPlanStatus?.toUpperCase() === 'FAILED' && (
                <Tag 
                  color="red" 
                  style={{ 
                    fontSize: '11px', 
                    marginLeft: '8px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    border: '1px solid #ff4d4f',
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                    boxShadow: '0 1px 2px rgba(255,77,79,0.2)'
                  }}
                >
                  ⚠️ {record.completionQuality ? record.completionQuality.toUpperCase() : 'THẤT BẠI'}
                </Tag>
              )}
              {record.quitPlanStatus?.toUpperCase() === 'REJECTED' && (
                <Tag color="volcano" style={{ fontSize: '11px', marginLeft: '8px' }}>
                  Từ chối
                </Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'quitPlanStatus',
      key: 'quitPlanStatus',
      render: (status, record) => {
        if (status?.toUpperCase() === 'FAILED') {
          return (
            <Tag 
              color="red"
              icon={getStatusIcon(status)}
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                padding: '6px 12px',
                border: '2px solid #ff4d4f',
                backgroundColor: '#ff4d4f',
                color: 'white',
                textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                boxShadow: '0 2px 4px rgba(255,77,79,0.3)'
              }}
            >
              ⚠️ THẤT BẠI
            </Tag>
          );
        }
        
        if (status?.toUpperCase() === 'COMPLETED') {
          return (
            <Tag 
              color="green"
              icon={getStatusIcon(status)}
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                padding: '6px 12px',
                border: '2px solid #52c41a',
                backgroundColor: '#52c41a',
                color: 'white',
                textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                boxShadow: '0 2px 4px rgba(82,196,26,0.3)'
              }}
            >
              ✓ HOÀN THÀNH
            </Tag>
          );
        }
        
        return (
          <Tag 
            color={getStatusColor(status)} 
            icon={getStatusIcon(status)}
          >
            {getStatusText(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Mức độ nghiện thuốc',
      dataIndex: 'currentSmokingStatus',
      key: 'currentSmokingStatus',
      render: (status) => {
        const getSmokingStatusColor = (status) => {
          switch (status) {
            case 'NONE': return 'green';
            case 'LIGHT': return 'orange';
            case 'MEDIUM': return 'red';
            case 'SEVERE': return 'volcano';
            default: return 'default';
          }
        };
        
        const getSmokingStatusText = (status) => {
          switch (status) {
            case 'NONE': return 'Không hút';
            case 'LIGHT': return 'Nhẹ';
            case 'MEDIUM': return 'Trung bình';
            case 'SEVERE': return 'Nặng';
            default: return status || 'Không xác định';
          }
        };
        
        return (
          <Tag color={getSmokingStatusColor(status)}>
            {getSmokingStatusText(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  const overallStats = {
    totalPlans: Array.isArray(plans) ? plans.length : 0,
    completedPlans: Array.isArray(plans) ? plans.filter(p => p.quitPlanStatus?.toUpperCase() === 'COMPLETED').length : 0,
    activePlans: Array.isArray(plans) ? plans.filter(p => ['IN_PROGRESS', 'ACTIVE'].includes(p.quitPlanStatus?.toUpperCase())).length : 0
  };

  return (
    <div className="quit-plan-history">
      <div className="container py-4">
        <Title level={2}>
          <HistoryOutlined /> Lịch sử kế hoạch cai thuốc
        </Title>

        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số kế hoạch"
                value={overallStats.totalPlans}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Kế hoạch hoàn thành"
                value={overallStats.completedPlans}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Kế hoạch đang thực hiện"
                value={overallStats.activePlans}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm theo huấn luyện viên, chiến lược, kích thích..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="FAILED">Thất bại</Option>
                <Option value="REJECTED">Từ chối</Option>
                <Option value="IN_PROGRESS">Đang thực hiện</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
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
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} kế hoạch`
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              Chi tiết kế hoạch - {selectedPlan && formatDate(selectedPlan.startDate)}
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {selectedPlan && (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Thông tin kế hoạch">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Thời gian:</Text>
                      <br />
                      <Text>{formatDate(selectedPlan.startDate)} - {formatDate(selectedPlan.endDate)}</Text>
                    </div>
                    <div>
                      <Text strong>Huấn luyện viên:</Text>
                      <br />
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text>{selectedPlan.coachName}</Text>
                      </Space>
                    </div>
                    <div>
                      <Text strong>Mức độ hút thuốc hiện tại:</Text>
                      <br />
                      <Tag color="blue">
                        {selectedPlan.currentSmokingStatus === 'NONE' ? 'Không hút' :
                         selectedPlan.currentSmokingStatus === 'LIGHT' ? 'Nhẹ' :
                         selectedPlan.currentSmokingStatus === 'MEDIUM' ? 'Trung bình' :
                         selectedPlan.currentSmokingStatus === 'SEVERE' ? 'Nặng' :
                         selectedPlan.currentSmokingStatus}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Các tác nhân kích thích cần tránh:</Text>
                      <br />
                      <Text>{selectedPlan.smokingTriggersToAvoid}</Text>
                    </div>
                    <div>
                      <Text strong>Chiến lược đối phó:</Text>
                      <br />
                      <Text>{selectedPlan.copingStrategies}</Text>
                    </div>
                    <div>
                      <Text strong>Thuốc sử dụng:</Text>
                      <br />
                      <Text>{selectedPlan.medicationsToUse}</Text>
                    </div>
                    <div>
                      <Text strong>Hướng dẫn sử dụng thuốc:</Text>
                      <br />
                      <Text>{selectedPlan.medicationInstructions}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Kết quả & Động lực">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Trạng thái:</Text>
                      <br />
                      {selectedPlan.quitPlanStatus?.toUpperCase() === 'FAILED' ? (
                        <Tag 
                          color="red"
                          icon={getStatusIcon(selectedPlan.quitPlanStatus)}
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            padding: '8px 16px',
                            border: '2px solid #ff4d4f',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                            boxShadow: '0 2px 6px rgba(255,77,79,0.4)'
                          }}
                        >
                          ⚠️ {selectedPlan.completionQuality ? selectedPlan.completionQuality.toUpperCase() : 'THẤT BẠI'}
                        </Tag>
                      ) : (
                        <Tag 
                          color={getStatusColor(selectedPlan.quitPlanStatus)} 
                          icon={getStatusIcon(selectedPlan.quitPlanStatus)}
                          style={{ fontSize: '14px', padding: '4px 8px' }}
                        >
                          {getStatusText(selectedPlan.quitPlanStatus)}
                        </Tag>
                      )}
                    </div>
                    
                    {/* Phần trăm hoàn thành - Hiển thị nổi bật */}
                    {selectedPlan.quitPlanStatus?.toUpperCase() !== 'REJECTED' && (
                      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                        {/* Tiêu đề phần hoàn thành */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '18px' }}>Mức độ hoàn thành:</Text>
                          <Text 
                            style={{ 
                              fontSize: '16px', 
                              fontWeight: 'bold',
                              color: selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED' ? '#52c41a' : 
                                    selectedPlan.quitPlanStatus?.toUpperCase() === 'FAILED' ? '#f5222d' : '#1890ff'
                            }}
                          >
                            {!isNaN(selectedPlan.progressInDay) && selectedPlan.progressInDay !== null ? selectedPlan.progressInDay : 0} / {!isNaN(selectedPlan.durationInDays) && selectedPlan.durationInDays !== null && selectedPlan.durationInDays >= 0 ? selectedPlan.durationInDays : calculateDuration(selectedPlan.startDate, selectedPlan.endDate) || 0} ngày
                          </Text>
                        </div>
                        
                        {/* Thanh tiến độ */}
                        <div style={{ marginBottom: '12px' }}>
                        {(() => {
                          // Kiểm tra tính hợp lệ của dữ liệu
                          const isValidProgress = !isNaN(selectedPlan.progressInDay) && selectedPlan.progressInDay !== null && selectedPlan.progressInDay !== undefined;
                          const isValidDuration = !isNaN(selectedPlan.durationInDays) && selectedPlan.durationInDays !== null && selectedPlan.durationInDays !== undefined && selectedPlan.durationInDays >= 0; // Cho phép 0
                          
                          // Tính toán phần trăm hoàn thành với kiểm tra dữ liệu  
                          let completionPercent = 0;
                          
                          if (isValidProgress && isValidDuration) {
                            // Sử dụng dữ liệu từ backend
                            if (selectedPlan.durationInDays > 0) {
                              completionPercent = Math.round((selectedPlan.progressInDay / selectedPlan.durationInDays) * 100);
                            } else {
                              // Nếu duration = 0, hiển thị 0%
                              completionPercent = 0;
                            }
                          } else {
                            // Fallback: tính toán dựa trên ngày tháng
                            completionPercent = calculateProgress(selectedPlan);
                          }
                          
                          // Đảm bảo giá trị phần trăm hợp lệ (0-100)
                          const safeCompletionPercent = isNaN(completionPercent) ? 0 : Math.min(100, Math.max(0, completionPercent));
                          
                          let strokeColor = '';
                          let bgColor = '';
                          // Sử dụng giá trị completionQuality từ backend nếu có
                          let completionLevel = selectedPlan.completionQuality || '';
                          
                          // Xác định màu sắc dựa trên completionQuality hoặc tính toán nếu không có
                          if (selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED') {
                            if (completionLevel === 'xuất sắc' || completionPercent >= 90) {
                              strokeColor = '#52c41a';  // Xanh lá đậm
                              bgColor = '#f6ffed';
                              if (!completionLevel) completionLevel = 'Xuất sắc';
                            } else if (completionLevel === 'tốt' || completionPercent >= 75) {
                              strokeColor = '#73d13d';  // Xanh lá
                              bgColor = '#f6ffed';
                              if (!completionLevel) completionLevel = 'Tốt';
                            } else if (completionLevel === 'khá' || completionPercent >= 50) {
                              strokeColor = '#bae637';  // Xanh vàng
                              bgColor = '#fcffe6';
                              if (!completionLevel) completionLevel = 'Khá';
                            } else {
                              strokeColor = '#faad14';  // Cam
                              bgColor = '#fff7e6';
                              if (!completionLevel) completionLevel = 'Cần cải thiện';
                            }
                          } else if (selectedPlan.quitPlanStatus?.toUpperCase() === 'FAILED') {
                            strokeColor = '#f5222d';  // Đỏ
                            bgColor = '#fff1f0';
                            if (!completionLevel) completionLevel = selectedPlan.completionQuality || 'Thất bại';
                          } else if (selectedPlan.quitPlanStatus?.toUpperCase() === 'REJECTED') {
                            strokeColor = '#f5222d';  // Đỏ
                            bgColor = '#fff1f0';
                            completionLevel = 'Từ chối';
                          } else {
                            strokeColor = '#1890ff';  // Xanh dương
                            bgColor = '#e6f7ff';
                            completionLevel = 'Đang thực hiện';
                          }
                          
                          // Viết hoa chữ cái đầu của completionLevel cho hiển thị
                          completionLevel = completionLevel.charAt(0).toUpperCase() + completionLevel.slice(1);
                          
                          return (
                            <>
                              <Progress 
                                percent={safeCompletionPercent}
                                status={selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED' ? 'success' : 
                                       selectedPlan.quitPlanStatus?.toUpperCase() === 'FAILED' ? 'exception' : 'active'}
                                strokeColor={strokeColor}
                                strokeWidth={18}
                                format={percent => (
                                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    {safeCompletionPercent}%
                                  </div>
                                )}
                              />
                              
                              {/* Hiển thị nhận xét về tiến độ */}
                              <div style={{ 
                                marginTop: '12px', 
                                padding: '12px', 
                                backgroundColor: bgColor,
                                border: `1px solid ${strokeColor}`,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <Text strong style={{ fontSize: '15px', color: strokeColor }}>
                                  {selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED' ? (
                                    <><TrophyOutlined /> Kết quả:</>
                                  ) : selectedPlan.quitPlanStatus?.toUpperCase() === 'FAILED' ? (
                                    <><CloseCircleOutlined /> Kết quả:</>
                                  ) : selectedPlan.quitPlanStatus?.toUpperCase() === 'REJECTED' ? (
                                    <><CloseCircleOutlined /> Kết quả:</>
                                  ) : (
                                    <><ClockCircleOutlined /> Tiến độ hiện tại:</>
                                  )}
                                </Text>
                                <Tag color={strokeColor} style={{ fontSize: '14px', padding: '4px 8px', margin: 0 }}>
                                  {completionLevel}
                                </Tag>
                              </div>
                            </>
                          );
                        })()}
                        </div>
                      </div>
                    )}
                    
                    {/* Thông báo đặc biệt cho plan bị từ chối */}
                    {selectedPlan.quitPlanStatus?.toUpperCase() === 'REJECTED' && (
                      <div style={{ 
                        marginTop: '12px', 
                        marginBottom: '20px', 
                        padding: '16px', 
                        backgroundColor: '#fff1f0', 
                        border: '1px solid #ffccc7',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <CloseCircleOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
                        <div>
                          <Text strong style={{ fontSize: '16px', color: '#f5222d', display: 'block' }}>
                            Kế hoạch đã bị từ chối
                          </Text>
                          <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}>
                            Kế hoạch này không được phê duyệt và không thể thực hiện
                          </Text>
                        </div>
                      </div>
                    )}
                    
                    {/* Đánh giá cuối cùng - Chỉ hiển thị cho plan hoàn thành */}
                    {selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED' && selectedPlan.finalEvaluation && (
                      <div style={{ 
                        marginTop: '12px', 
                        marginBottom: '20px', 
                        padding: '16px', 
                        backgroundColor: '#f6ffed', 
                        border: '1px solid #b7eb8f',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
                      }}>
                        <Row>
                          <Col span={24}>
                            <Text strong style={{ fontSize: '18px', color: '#52c41a', display: 'flex', alignItems: 'center' }}>
                              <TrophyOutlined style={{ marginRight: '8px' }} /> Đánh giá cuối cùng từ huấn luyện viên
                            </Text>
                          </Col>
                        </Row>
                        <Row style={{ marginTop: '12px' }}>
                          <Col span={24}>
                            <Paragraph style={{ 
                              fontSize: '15px', 
                              margin: 0, 
                              fontStyle: 'italic',
                              backgroundColor: 'white',
                              padding: '12px',
                              borderRadius: '6px',
                              borderLeft: '4px solid #52c41a'
                            }}>
                              "{selectedPlan.finalEvaluation}"
                            </Paragraph>
                          </Col>
                        </Row>
                      </div>
                    )}
                  
                    
                    {/* Hiển thị thông báo nếu đã hoàn thành nhưng không có đánh giá */}
                    {selectedPlan.quitPlanStatus?.toUpperCase() === 'COMPLETED' && !selectedPlan.finalEvaluation && (
                      <div style={{ 
                        marginTop: '12px', 
                        marginBottom: '20px', 
                        padding: '12px', 
                        backgroundColor: '#e6f7ff', 
                        border: '1px solid #91d5ff',
                        borderRadius: '6px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          <InfoCircleOutlined style={{ marginRight: '8px' }} />
                          Kế hoạch đã hoàn thành. Huấn luyện viên sẽ sớm thêm đánh giá cuối cùng.
                        </Text>
                      </div>
                    )}
                    
                    <div>
                      <Text strong>Động lực:</Text>
                      <br />
                      <Text>{selectedPlan.motivation}</Text>
                    </div>
                    <div>
                      <Text strong>Kế hoạch phần thưởng:</Text>
                      <br />
                      <Text>{selectedPlan.rewardPlan}</Text>
                    </div>
                    <div>
                      <Text strong>Nguồn lực hỗ trợ:</Text>
                      <br />
                      <Text>{selectedPlan.supportResources}</Text>
                    </div>
                    <div>
                      <Text strong>Ghi chú bổ sung:</Text>
                      <br />
                      <Text>{selectedPlan.additionalNotes}</Text>
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