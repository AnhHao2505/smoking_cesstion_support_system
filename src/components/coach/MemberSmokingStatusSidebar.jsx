import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  Statistic,
  Progress,
  Alert,
  Spin,
  Empty,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  StopOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  HeartOutlined,
  AimOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  FrownOutlined,
  CalendarOutlined,
  BulbOutlined,
  FireOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { getLatestMemberSmokingStatus } from '../../services/memberSmokingStatusService';
import '../../styles/MemberSmokingStatusSidebar.css';

const { Title, Text, Paragraph } = Typography;

const MemberSmokingStatusSidebar = ({ memberId, memberName, onAddictionLevelChange }) => {
  const [smokingStatus, setSmokingStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberId) {
      fetchSmokingStatus();
    } else {
      setSmokingStatus(null);
    }
  }, [memberId]);

  const fetchSmokingStatus = async () => {
    setLoading(true);
    try {
      console.log('Fetching smoking status for member:', memberId);
      const response = await getLatestMemberSmokingStatus(memberId);
      console.log('Smoking status response:', response);
      
      // Handle different response formats
      let statusData = null;
      if (response && response.success && response.data) {
        statusData = response.data;
      } else if (response && typeof response === 'object') {
        statusData = response;
      }
      
      setSmokingStatus(statusData);
      
      // Trigger callback with addiction level if available
      if (statusData && statusData.dailySmoking !== undefined && onAddictionLevelChange) {
        console.log('=== ADDICTION LEVEL CALLBACK DEBUG ===');
        console.log('statusData:', statusData);
        console.log('dailySmoking value:', statusData.dailySmoking);
        console.log('onAddictionLevelChange function available:', !!onAddictionLevelChange);
        
        // Map UI dailySmoking to backend AddictionLevel enum
        let addictionLevel = 'LIGHT'; // default
        const dailySmoking = statusData.dailySmoking;
        
        if (dailySmoking === 0) addictionLevel = 'NONE';
        else if (dailySmoking <= 2) addictionLevel = 'LIGHT';
        else if (dailySmoking === 3) addictionLevel = 'MEDIUM';
        else if (dailySmoking >= 4) addictionLevel = 'SEVERE';
        
        console.log('Mapped addiction level:', addictionLevel);
        console.log('About to trigger callback...');
        console.log('=== END ADDICTION LEVEL DEBUG ===');
        
        onAddictionLevelChange(addictionLevel);
      } else {
        console.log('=== ADDICTION LEVEL CALLBACK SKIPPED ===');
        console.log('statusData available:', !!statusData);
        console.log('dailySmoking defined:', statusData?.dailySmoking !== undefined);
        console.log('callback function available:', !!onAddictionLevelChange);
        console.log('=== END SKIPPED DEBUG ===');
      }
    } catch (error) {
      console.error('Error fetching smoking status:', error);
      setSmokingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions để xử lý các giá trị từ API mới
  const getAddictionLevel = (dailySmoking) => {
    if (dailySmoking === 0) return { level: 'Không hút', color: 'green', severity: 0 };
    if (dailySmoking <= 1) return { level: 'Rất nhẹ', color: 'blue', severity: 1 };
    if (dailySmoking <= 2) return { level: 'Nhẹ', color: 'cyan', severity: 2 };
    if (dailySmoking <= 3) return { level: 'Trung bình', color: 'orange', severity: 3 };
    return { level: 'Nặng', color: 'red', severity: 4 };
  };

  const getDesireLevel = (desire) => {
    const levels = ['Không có', 'Rất thấp', 'Thấp', 'Trung bình', 'Cao'];
    const colors = ['gray', 'green', 'blue', 'orange', 'red'];
    return { level: levels[desire] || 'Không xác định', color: colors[desire] || 'gray' };
  };

  const getHealthRiskLevel = (healthProblems) => {
    const levels = ['Không có', 'Nhẹ', 'Trung bình', 'Nghiêm trọng', 'Rất nghiêm trọng'];
    const colors = ['green', 'blue', 'orange', 'red', 'purple'];
    return { level: levels[healthProblems] || 'Không xác định', color: colors[healthProblems] || 'gray' };
  };

  const getWithdrawalLevel = (withdrawal) => {
    const levels = ['Không có', 'Nhẹ', 'Trung bình', 'Nặng', 'Rất nặng'];
    const colors = ['green', 'blue', 'orange', 'red', 'purple'];
    return { level: levels[withdrawal] || 'Không xác định', color: colors[withdrawal] || 'gray' };
  };

  const getStressLevel = (stress) => {
    const levels = ['Không', 'Ít khi', 'Thỉnh thoảng', 'Thường xuyên', 'Luôn luôn'];
    const colors = ['green', 'blue', 'orange', 'red', 'purple'];
    return { level: levels[stress] || 'Không xác định', color: colors[stress] || 'gray' };
  };

  const getStartAgeLevel = (startAge) => {
    const levels = ['Trên 25 tuổi', '18-25 tuổi', '15-18 tuổi', 'Dưới 15 tuổi'];
    const colors = ['green', 'blue', 'orange', 'red'];
    return { level: levels[startAge] || 'Không xác định', color: colors[startAge] || 'gray' };
  };

  const getYearsSmokingLevel = (years) => {
    const levels = ['Dưới 1 năm', '1-5 năm', '6-10 năm', 'Trên 10 năm'];
    const colors = ['green', 'blue', 'orange', 'red'];
    return { level: levels[years] || 'Không xác định', color: colors[years] || 'gray' };
  };

  const getSmokingTimeText = (smokingTime) => {
    const times = ['Buổi sáng', 'Buổi chiều', 'Cả ngày', 'Tối'];
    return times[smokingTime] || 'Không xác định';
  };

  const getPreviousAttemptsText = (attempts) => {
    const attemptTexts = ['Chưa bao giờ', '1 lần', '2-3 lần', 'Nhiều lần'];
    return attemptTexts[attempts] || 'Không xác định';
  };

  if (!memberId) {
    return (
      <Card
        title={
          <Space>
            <StopOutlined />
            <Text>Tình trạng hút thuốc</Text>
          </Space>
        }
        style={{ 
          position: 'fixed', 
          left: 20, 
          top: 100, 
          width: 350, 
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Empty 
          description="Chọn thành viên để xem tình trạng hút thuốc"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <StopOutlined />
            <Text>Tình trạng hút thuốc</Text>
          </Space>
        }
        style={{ 
          position: 'fixed', 
          left: 20, 
          top: 100, 
          width: 350, 
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải thông tin...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!smokingStatus) {
    return (
      <Card
        title={
          <Space>
            <StopOutlined />
            <Text>Tình trạng hút thuốc</Text>
          </Space>
        }
        style={{ 
          position: 'fixed', 
          left: 20, 
          top: 100, 
          width: 370, 
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Alert
          message="Không có dữ liệu"
          description="Thành viên chưa cung cấp thông tin tình trạng hút thuốc"
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  const addiction = getAddictionLevel(smokingStatus.dailySmoking);
  const desire = getDesireLevel(smokingStatus.desireToQuit);
  const healthRisk = getHealthRiskLevel(smokingStatus.healthProblems);
  const withdrawal = getWithdrawalLevel(smokingStatus.withdrawalSymptoms);
  const stress = getStressLevel(smokingStatus.stressSmoking);
  const startAge = getStartAgeLevel(smokingStatus.startSmokingAge);
  const yearsSmokingLevel = getYearsSmokingLevel(smokingStatus.yearsSmoking);

  return (
    <Card
      title={
        <Space>
          <StopOutlined />
          <Text>Tình trạng hút thuốc</Text>
        </Space>
      }
      extra={memberName && <Text type="secondary" ellipsis>{memberName}</Text>}
      style={{ 
        position: 'fixed', 
        left: 20, 
        top: 100, 
        width: 370, 
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      className="member-smoking-sidebar"
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Thông tin cơ bản */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <CalendarOutlined /> Thông tin cơ bản
          </Title>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Tuổi bắt đầu hút:</Text></Col>
              <Col><Tag color={startAge.color} size="small">{startAge.level}</Tag></Col>
            </Row>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Số năm hút thuốc:</Text></Col>
              <Col><Tag color={yearsSmokingLevel.color} size="small">{yearsSmokingLevel.level}</Tag></Col>
            </Row>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Lần thử bỏ trước:</Text></Col>
              <Col><Tag color="purple" size="small">{getPreviousAttemptsText(smokingStatus.previousAttempts)}</Tag></Col>
            </Row>
          </Space>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        {/* Mức độ nghiện và thói quen hút */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <FireOutlined /> Mức độ nghiện
          </Title>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Statistic
              title="Điếu thuốc/ngày (điểm)"
              value={smokingStatus.dailySmoking}
              valueStyle={{ 
                color: addiction.color === 'green' ? '#52c41a' : 
                       addiction.color === 'blue' ? '#1677ff' :
                       addiction.color === 'cyan' ? '#13c2c2' :
                       addiction.color === 'orange' ? '#fa8c16' : '#ff4d4f',
                fontSize: '20px'
              }}
            />
            <Tag color={addiction.color} style={{ marginTop: 4 }}>
              {addiction.level}
            </Tag>
          </div>
          
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Thời điểm hút:</Text></Col>
              <Col><Tag color="geekblue" size="small">{getSmokingTimeText(smokingStatus.smokingTime)}</Tag></Col>
            </Row>
          </Space>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        {/* Mong muốn và động lực */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <AimOutlined /> Mong muốn bỏ thuốc
          </Title>
          <Row justify="space-between" align="middle">
            <Col><Text style={{ fontSize: '12px' }}>Mức độ mong muốn:</Text></Col>
            <Col><Tag color={desire.color} size="small">{desire.level}</Tag></Col>
          </Row>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        {/* Tình trạng sức khỏe */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <HeartOutlined /> Tình trạng sức khỏe
          </Title>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Vấn đề sức khỏe:</Text></Col>
              <Col><Tag color={healthRisk.color} size="small">{healthRisk.level}</Tag></Col>
            </Row>
            <Row justify="space-between" align="middle">
              <Col><Text style={{ fontSize: '12px' }}>Triệu chứng cai:</Text></Col>
              <Col><Tag color={withdrawal.color} size="small">{withdrawal.level}</Tag></Col>
            </Row>
          </Space>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        {/* Yếu tố tâm lý */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <FrownOutlined /> Yếu tố tâm lý
          </Title>
          <Row justify="space-between" align="middle">
            <Col><Text style={{ fontSize: '12px' }}>Hút khi stress:</Text></Col>
            <Col><Tag color={stress.color} size="small">{stress.level}</Tag></Col>
          </Row>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        {/* Mục tiêu và lý do */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <BulbOutlined /> Mục tiêu & Lý do
          </Title>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {smokingStatus.goal && smokingStatus.goal.trim() !== '' && (
              <div>
                <Text strong style={{ fontSize: '12px' }}>Mục tiêu:</Text>
                <Paragraph 
                  style={{ margin: '2px 0', fontSize: '11px', lineHeight: '1.4' }}
                  ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }}
                >
                  {smokingStatus.goal}
                </Paragraph>
              </div>
            )}
            {smokingStatus.reasonToQuit && smokingStatus.reasonToQuit.trim() !== '' && (
              <div>
                <Text strong style={{ fontSize: '12px' }}>Lý do bỏ thuốc:</Text>
                <Paragraph 
                  style={{ margin: '2px 0', fontSize: '11px', lineHeight: '1.4' }}
                  ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }}
                >
                  {smokingStatus.reasonToQuit}
                </Paragraph>
              </div>
            )}
            {(!smokingStatus.goal || smokingStatus.goal.trim() === '') && 
             (!smokingStatus.reasonToQuit || smokingStatus.reasonToQuit.trim() === '') && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Chưa có mục tiêu và lý do được cung cấp
              </Text>
            )}
          </Space>
        </div>

        {/* Cảnh báo mức độ nghiện */}
        {smokingStatus.dailySmoking >= 3 && (
          <>
            <Divider style={{ margin: '6px 0' }} />
            <Alert
              message="Mức độ nghiện cao"
              description="Thành viên cần sự hỗ trợ đặc biệt trong quá trình cai thuốc"
              type="warning"
              showIcon
              size="small"
            />
          </>
        )}

        {/* Khuyến nghị */}
        <Divider style={{ margin: '6px 0' }} />
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
            <ThunderboltOutlined /> Khuyến nghị
          </Title>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {smokingStatus.desireToQuit >= 3 && (
              <Tag color="green" size="small">✓ Động lực bỏ thuốc tốt</Tag>
            )}
            {smokingStatus.withdrawalSymptoms >= 2 && (
              <Tag color="orange" size="small">⚠ Cần hỗ trợ triệu chứng cai</Tag>
            )}
            {smokingStatus.stressSmoking >= 2 && (
              <Tag color="blue" size="small">💡 Cần quản lý stress</Tag>
            )}
            {smokingStatus.healthProblems >= 1 && (
              <Tag color="red" size="small">🏥 Theo dõi sức khỏe</Tag>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default MemberSmokingStatusSidebar;
