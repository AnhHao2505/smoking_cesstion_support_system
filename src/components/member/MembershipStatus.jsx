import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Button,
  Space,
  Tag,
  Alert,
  Descriptions,
  Timeline,
  Statistic,
  Spin
} from 'antd';
import {
  CrownOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;

const MembershipStatus = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Mock membership data
        const mockMembershipData = {
          isPremium: user?.premiumMembership || false,
          planName: user?.planName || 'Gói miễn phí',
          startDate: user?.membershipStartDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
          expiryDate: user?.membershipExpiryDate || moment().add(30, 'days').format('YYYY-MM-DD'),
          daysRemaining: user?.premiumMembership ? 
            moment(user.membershipExpiryDate).diff(moment(), 'days') : 0,
          features: user?.premiumMembership ? [
            'Tư vấn 1-1 với Coach',
            'Kế hoạch cá nhân hóa',
            'Theo dõi tiến trình chi tiết',
            'Hỗ trợ ưu tiên',
            'Tài liệu độc quyền'
          ] : [
            'Theo dõi cơ bản',
            'Kế hoạch mẫu',
            'Cộng đồng hỗ trợ'
          ],
          usageStats: {
            coachSessions: 8,
            maxCoachSessions: user?.premiumMembership ? 'Không giới hạn' : '0',
            reportsGenerated: 15,
            maxReports: user?.premiumMembership ? 'Không giới hạn' : '2',
            remindersSent: 45,
            maxReminders: user?.premiumMembership ? 'Không giới hạn' : '10'
          }
        };
        
        setMembershipData(mockMembershipData);
      } catch (error) {
        console.error('Error fetching membership data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

  const getMembershipStatusColor = (isPremium) => {
    return isPremium ? 'gold' : 'blue';
  };

  const getMembershipStatusText = (isPremium) => {
    return isPremium ? 'Premium' : 'Miễn phí';
  };

  const renderMembershipOverview = () => (
    <Card title="Tổng quan thành viên">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <div className="text-center">
            <div className="membership-badge">
              <CrownOutlined 
                style={{ 
                  fontSize: '64px', 
                  color: membershipData?.isPremium ? '#faad14' : '#d9d9d9' 
                }} 
              />
            </div>
            <Title level={3}>
              <Tag 
                color={getMembershipStatusColor(membershipData?.isPremium)} 
                icon={<CrownOutlined />}
              >
                {getMembershipStatusText(membershipData?.isPremium)}
              </Tag>
            </Title>
            <Paragraph>{membershipData?.planName}</Paragraph>
          </div>
        </Col>
        
        <Col xs={24} md={16}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Trạng thái">
              <Tag color={membershipData?.isPremium ? 'success' : 'default'}>
                {membershipData?.isPremium ? 'Đang hoạt động' : 'Cơ bản'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {moment(membershipData?.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            {membershipData?.isPremium && (
              <>
                <Descriptions.Item label="Ngày hết hạn">
                  {moment(membershipData?.expiryDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian còn lại">
                  <Text strong style={{ color: membershipData?.daysRemaining < 7 ? '#ff4d4f' : '#52c41a' }}>
                    {membershipData?.daysRemaining} ngày
                  </Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Col>
      </Row>
      
      {membershipData?.isPremium && membershipData?.daysRemaining < 7 && (
        <Alert
          message="Thành viên Premium sắp hết hạn"
          description={`Thành viên Premium của bạn sẽ hết hạn trong ${membershipData?.daysRemaining} ngày. Gia hạn ngay để tiếp tục sử dụng tất cả tính năng cao cấp.`}
          type="warning"
          showIcon
          action={
            <Button type="primary" size="small">
              Gia hạn ngay
            </Button>
          }
          className="mt-3"
        />
      )}
    </Card>
  );

  const renderFeaturesList = () => (
    <Card title="Tính năng của gói">
      <Timeline>
        {membershipData?.features.map((feature, index) => (
          <Timeline.Item 
            key={index}
            dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          >
            {feature}
          </Timeline.Item>
        ))}
      </Timeline>
      
      {!membershipData?.isPremium && (
        <div className="text-center mt-4">
          <Button 
            type="primary" 
            size="large"
            icon={<CrownOutlined />}
            onClick={() => navigate('/member/premium-upgrade')}
          >
            Nâng cấp Premium
          </Button>
        </div>
      )}
    </Card>
  );

  const renderUsageStatistics = () => (
    <Card title="Thống kê sử dụng">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="usage-stat-card">
            <Statistic
              title="Buổi tư vấn với Coach"
              value={membershipData?.usageStats.coachSessions}
              suffix={`/ ${membershipData?.usageStats.maxCoachSessions}`}
              prefix={<UserOutlined />}
            />
            <Progress 
              percent={membershipData?.isPremium ? 
                (membershipData?.usageStats.coachSessions / 10) * 100 : 100
              }
              status={membershipData?.isPremium ? 'active' : 'exception'}
              showInfo={false}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="usage-stat-card">
            <Statistic
              title="Báo cáo đã tạo"
              value={membershipData?.usageStats.reportsGenerated}
              suffix={`/ ${membershipData?.usageStats.maxReports}`}
              prefix={<TrophyOutlined />}
            />
            <Progress 
              percent={membershipData?.isPremium ? 
                (membershipData?.usageStats.reportsGenerated / 20) * 100 : 100
              }
              status={membershipData?.isPremium ? 'active' : 'exception'}
              showInfo={false}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="usage-stat-card">
            <Statistic
              title="Nhắc nhở đã gửi"
              value={membershipData?.usageStats.remindersSent}
              suffix={`/ ${membershipData?.usageStats.maxReminders}`}
              prefix={<CalendarOutlined />}
            />
            <Progress 
              percent={membershipData?.isPremium ? 
                (membershipData?.usageStats.remindersSent / 100) * 100 : 100
              }
              status={membershipData?.isPremium ? 'active' : 'exception'}
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderMembershipHistory = () => (
    <Card title="Lịch sử thành viên">
      <Timeline>
        <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
          <div>
            <Text strong>Tạo tài khoản</Text>
            <br />
            <Text type="secondary">
              {moment(membershipData?.startDate).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </Timeline.Item>
        
        {membershipData?.isPremium && (
          <Timeline.Item dot={<CrownOutlined style={{ color: '#faad14' }} />}>
            <div>
              <Text strong>Nâng cấp Premium</Text>
              <br />
              <Text type="secondary">
                {moment(membershipData?.startDate).add(15, 'days').format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
          </Timeline.Item>
        )}
        
        <Timeline.Item dot={<ClockCircleOutlined style={{ color: '#1890ff' }} />}>
          <div>
            <Text strong>Đăng nhập gần nhất</Text>
            <br />
            <Text type="secondary">
              {moment().subtract(2, 'hours').format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </Timeline.Item>
      </Timeline>
    </Card>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="membership-status">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Title level={2}>
              <CrownOutlined className="me-2" />
              Trạng thái thành viên
            </Title>
            <Paragraph>
              Xem thông tin chi tiết về gói thành viên và cách sử dụng của bạn
            </Paragraph>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {renderMembershipOverview()}
            
            <div className="mt-4">
              {renderUsageStatistics()}
            </div>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {renderFeaturesList()}
            
            <div className="mt-4">
              {renderMembershipHistory()}
            </div>
            
            {/* Quick Actions */}
            <Card title="Hành động nhanh" className="mt-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                {!membershipData?.isPremium ? (
                  <Button 
                    type="primary" 
                    block
                    icon={<CrownOutlined />}
                    onClick={() => navigate('/member/premium-upgrade')}
                  >
                    Nâng cấp Premium
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    block
                    icon={<GiftOutlined />}
                  >
                    Gia hạn thành viên
                  </Button>
                )}
                
                <Button 
                  block
                  icon={<UserOutlined />}
                  onClick={() => navigate('/member/account-management')}
                >
                  Quản lý tài khoản
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MembershipStatus;