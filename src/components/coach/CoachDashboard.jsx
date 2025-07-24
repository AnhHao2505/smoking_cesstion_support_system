import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Avatar,
  Tag,
  Progress,
  List,
  Button,
  Space,
  Divider,
  Badge,
  Tabs,
  Rate,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Alert,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getAssignedMembers, getCoachProfile } from '../../services/coachManagementService';
import { getFeedbacksForCoach } from '../../services/feebackService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CoachDashboard = () => {
  const { currentUser } = useAuth();
  const [coachProfile, setCoachProfile] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Always use current user's ID as coachId - this dashboard is only for the coach themselves
  const [coachId, setCoachId] = useState(null);

  // Set coachId when component loads
  useEffect(() => {
    if (currentUser?.role === 'COACH' && currentUser?.userId) {
      setCoachId(currentUser.userId);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCoachDashboardData = async () => {
      // Wait for coachId to be determined
      if (!coachId) {
        return; // Don't show error yet, still determining coachId
      }

      try {
        setLoading(true);

        // Fetch coach profile
        console.log('Fetching coach profile for ID:', coachId);
        try {
          const profileResponse = await getCoachProfile(coachId);
          console.log('Coach profile response:', profileResponse);
          if (profileResponse) {
            setCoachProfile({
              full_name: profileResponse.name || 'Coach',
              specialty: profileResponse.specialty || 'Smoking Cessation Specialist',
              bio: profileResponse.bio || 'Dedicated to helping people quit smoking successfully',
              photo_url: null,
              certificates: profileResponse.certificates ? profileResponse.certificates.split(',') : [],
              workingHours: profileResponse.workingHour ? profileResponse.workingHour.join(', ') : 'Monday - Friday, 9:00 AM - 5:00 PM',
              contactNumber: profileResponse.contactNumber || 'Not available'
            });
          } else {
            console.warn('Coach profile API returned unsuccessful response');
          }
        } catch (error) {
          console.error('Error fetching coach profile:', error);
          message.error('Không thể tải hồ sơ huấn luyện viên');
        }

        // Fetch assigned members
        const membersResponse = await getAssignedMembers(coachId);
        const members = membersResponse || [];

        // Transform member data to match table structure based on new API response
        const transformedMembers = members.map((member, index) => {
          return {
            user_id: member.memberId || index,
            full_name: member.name || 'Thành viên không xác định',
            email: member.email,
            photo_url: null,
            planId: member.planId,
            isPlanRequested: Boolean(member.planRequested) || Boolean(member.isPlanRequested) || Boolean(member.hasPlanRequest)
          };
        });

        setAssignedMembers(transformedMembers);

        // Fetch feedback
        const feedbackResponse = await getFeedbacksForCoach(coachId);
        const feedbacks = feedbackResponse;
        if(feedbacks.length > 0) {
          setRecentFeedback(feedbacks.slice(0, 10));
        }

      } catch (error) {
        console.error("Error fetching coach dashboard data:", error);
        if (error.response && error.response.status === 403) {
          message.error('Bạn không có quyền truy cập vào nội dung này');
        } else {
          message.error('Lỗi tải dữ liệu bảng điều khiển: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoachDashboardData();
  }, [coachId]);

  // Show different loading state while determining coachId
  if (!coachId && currentUser?.role === 'COACH') {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary">Loading coach profile...</Text>
        </div>
      </div>
    );
  }

  // Individual refresh functions
  const refreshMembers = async () => {
    if (!coachId) return;

    try {
      setMembersLoading(true);
      const membersResponse = await getAssignedMembers(coachId);
      const members = membersResponse || [];

      // Transform member data based on new API response structure
      const transformedMembers = members.map((member, index) => {
        return {
          user_id: member.memberId || index,
          full_name: member.name || 'Thành viên không xác định',
          photo_url: null, 
          isPlanRequested: Boolean(member.planRequested) || Boolean(member.isPlanRequested) || Boolean(member.hasPlanRequest)
        };
      });

      setAssignedMembers(transformedMembers);
      message.success('Làm mới danh sách thành viên thành công');
    } catch (error) {
      console.error('Error refreshing members:', error);
      message.error('Không thể làm mới danh sách thành viên');
    } finally {
      setMembersLoading(false);
    }
  };

  const refreshFeedback = async () => {
    if (!coachId) return;

    try {
      setFeedbackLoading(true);
      const feedbackResponse = await getFeedbacksForCoach(coachId);
      if (feedbackResponse.success) {
        const feedbacks = Array.isArray(feedbackResponse.data)
          ? feedbackResponse.data
          : feedbackResponse.data?.content || [];
        setRecentFeedback(feedbacks.slice(0, 10));
        message.success('Đã làm mới đánh giá');
      }
    } catch (error) {
      console.error('Error refreshing feedback:', error);
      message.error('Không thể làm mới đánh giá');
    } finally {
      setFeedbackLoading(false);
    }
  };
  
  // Hàm làm mới thông tin hồ sơ huấn luyện viên
  const refreshCoachProfile = async (id) => {
    try {
      const profileResponse = await getCoachProfile(id);
      if (profileResponse) {
        setCoachProfile({
          full_name: profileResponse.name || 'Coach',
          specialty: profileResponse.specialty || 'Chuyên gia cai thuốc lá',
          bio: profileResponse.bio || 'Hỗ trợ mọi người bỏ thuốc lá thành công',
          photo_url: null,
          certificates: profileResponse.certificates ? profileResponse.certificates.split(',') : [],
          workingHours: profileResponse.workingHour ? profileResponse.workingHour.join(', ') : 'Monday - Friday, 9:00 AM - 5:00 PM',
          contactNumber: profileResponse.contactNumber || 'Not available'
        });
        message.success('Đã cập nhật thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      message.error('Không thể cập nhật thông tin hồ sơ');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // Show error if we still can't determine coachId after loading
  if (!coachId && currentUser?.role === 'COACH') {
    return (
      <div className="dashboard loading-container">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="danger">Không thể tải bảng điều khiển huấn luyện viên. Vui lòng thử đăng nhập lại.</Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => window.location.href = '/auth/login'}>
              Đi đến Đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for missing coach profile data
  const profileData = coachProfile || {
    full_name: currentUser?.name || 'Coach',
    specialty: 'Chuyên gia cai thuốc lá',
    bio: 'Cam kết giúp mọi người bỏ thuốc lá thành công',
    rating: 0, // Rating không có trong API profile/coach, lấy từ phần feedback
    photo_url: null,
    certificates: [],
    workingHours: 'Thứ Hai - Thứ Sáu, 9:00 AM - 5:00 PM',
    contactNumber: 'Không có thông tin'
  };

  // Column configuration for member table
  const memberColumns = [
    {
      title: 'Thành viên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar src={record.photo_url} icon={<UserOutlined />} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.memberName}</Text>
        </Space>
      )
    },
    {
      title: 'Yêu cầu kế hoạch',
      dataIndex: 'isPlanRequested',
      key: 'isPlanRequested',
      render: (isPlanRequested) => {
        return isPlanRequested === true ? 
          <Tag color="green">Có yêu cầu</Tag> : 
          <Tag color="default">Không có yêu cầu</Tag>;
      },
      filters: [
        { text: 'Có yêu cầu', value: true },
        { text: 'Không có yêu cầu', value: false }
      ],
      onFilter: (value, record) => record.isPlanRequested === value
    },

    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          {/* Hiển thị nút "Tạo kế hoạch" chỉ khi có yêu cầu và không có kế hoạch */}
          {!record.planId && record.isPlanRequested && (
            <Button
              type="primary"
              size="small"
              danger
              onClick={() => {
                // Navigate to create quit plan
                window.location.href = `/coach/create-quit-plan?memberId=${record.user_id}`;
              }}
              icon={<RiseOutlined />}
            >
              Tạo kế hoạch
            </Button>
          )}
          
          {/* Hiển thị trạng thái khi chưa có yêu cầu và không có kế hoạch */}
          {!record.planId && !record.isPlanRequested && (
            <Button
              disabled
              type="dashed"
              size="small"
              icon={<ClockCircleOutlined />}
            >
              Chờ yêu cầu
            </Button>
          )}
        </Space>
      )
    }
  ];
  
  return (
    <div className="dashboard coach-dashboard">
        {/* Coach Profile Overview */}
        <Card 
          className="mb-4 coach-profile-card"
          title="Hồ sơ huấn luyện viên"
          extra={
            <Button 
              size="small" 
              onClick={() => refreshCoachProfile(coachId)}
            >
              Làm mới hồ sơ
            </Button>
          }
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6}>
              <div className="text-center">
                <Avatar
                  size={120}
                  src={profileData.photo_url}
                  icon={<UserOutlined />}
                />
                <div className="mt-3">
                  <Rate disabled defaultValue={profileData.rating} allowHalf />
                  <div><Text strong>{profileData.rating}</Text> / 5.0</div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2}>{profileData.full_name}</Title>
              <Text type="secondary">{profileData.specialty || 'Chuyên gia cai thuốc lá'}</Text>
              <Paragraph>{profileData.bio || 'Hỗ trợ mọi người bỏ thuốc lá thành công'}</Paragraph>

              {/* Additional coach information */}
              {profileData.certificates && profileData.certificates.length > 0 && (
                <div className="mb-3">
                  <Text strong>Chứng chỉ: </Text>
                  {profileData.certificates.map((cert, index) => (
                    <Tag key={index} color="blue">{cert}</Tag>
                  ))}
                </div>
              )}

              {profileData.workingHours && (
                <div className="mb-3">
                  <Text strong>Giờ làm việc: </Text>
                  <Text>{profileData.workingHours}</Text>
                </div>
              )}

              {/* Coach profile info only - performance metrics removed */}
            </Col>
          </Row>
        </Card>

        {/* Main Dashboard Content */}
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab={<span><TeamOutlined /> Thành viên được phân công</span>} key="1">
            <Card
              title="Tiến độ thành viên"
              extra={
                <Button
                  size="small"
                  onClick={refreshMembers}
                  loading={membersLoading}
                >
                  Làm mới
                </Button>
              }
            >
              <Table
                dataSource={assignedMembers}
                columns={memberColumns}
                rowKey="user_id"
                pagination={{ pageSize: 5 }}
                loading={membersLoading}
              />
            </Card>
          </TabPane>

        <TabPane tab={<span><StarOutlined /> Đánh giá</span>} key="2">
          <Card>
            <Title level={4}>Đánh giá gần đây</Title>
            <Button
              type="primary"
              onClick={refreshFeedback}
              loading={feedbackLoading}
              style={{ marginBottom: 16 }}
            >
              Làm mới đánh giá
            </Button>
            {recentFeedback.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={recentFeedback}
                pagination={{ pageSize: 5 }}
                renderItem={item => (
                  <List.Item key={item.feedbackId || item.id}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<Text strong>{item.memberName || 'Thành viên ẩn danh'}</Text>}
                      description={
                        <Space>
                          <Rate disabled defaultValue={item.rating || item.star} allowHalf />
                          <Text type="secondary">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Gần đây'}
                          </Text>
                        </Space>
                      }
                    />
                    <Paragraph>"{item.content || item.feedbackContent}"</Paragraph>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <Text type="secondary">Chưa nhận được đánh giá nào</Text>
              </div>
            )}
          </Card>
        </TabPane>   
      </Tabs>
    </div>
  );
};

export default CoachDashboard;