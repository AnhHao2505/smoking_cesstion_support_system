import React, { useState, useEffect } from 'react';
import { 
  Card, Avatar, Typography, Row, Col, Statistic, Badge, 
  List, Tag, Divider, Form, Input, Button, message, Modal, Spin,
  Upload, Tooltip
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  TrophyOutlined, EditOutlined, SaveOutlined, CrownOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { getMyProfile, updateMemberProfile } from '../../services/memberProfileService';
import { getCurrentUser } from '../../services/authService';
import PaymentModal from '../payment/PaymentModal';
import { getProfileImage, uploadProfileImage, cancelMyPremium, doesHaveCoach, cancelCurrentCoach } from '../../services/profileService';

const { Title, Text, Paragraph } = Typography;

const MemberProfile = () => {
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hasCoach, setHasCoach] = useState(false);
  
  // Get member ID from current user
  const getMemberId = () => {
    const user = getCurrentUser();
    return user?.userId || null;
  };

  const memberId = getMemberId();

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        if (profile) {
          setMemberProfile(profile);
          form.setFieldsValue({
            name: profile.name
          });
        }
        // Gọi API kiểm tra có coach không
        const hasCoachRes = await doesHaveCoach();
        setHasCoach(!!hasCoachRes);
      } catch (error) {
        console.error("Error fetching member profile:", error);
        message.error("Không thể tải dữ liệu hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    if (memberId) {
      fetchMemberProfile();
    }
  }, [memberId, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Only update name as per API specification
      const response = await updateMemberProfile(values.name);
      
      if (response) {
        // Update local state with new name
        setMemberProfile(prev => ({
          ...prev,
          name: values.name
        }));
        
        message.success("Cập nhật hồ sơ thành công");
        setIsEditing(false);
      } else {
        message.error("Không thể cập nhật hồ sơ");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Đã xảy ra lỗi khi lưu hồ sơ của bạn");
    }
  };

  const handleUpgradeToPremium = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentModalClose = () => {
    setPaymentModalVisible(false);
  };

  const handlePaymentSuccess = async () => {
    try {
      setPaymentModalVisible(false);
      setUpgradeLoading(true);
      
      const isRenewal = memberProfile.premiumMembership;
      
      // Just update the UI state directly
      if (isRenewal) {
        message.success("Gia hạn gói Cao cấp thành công!");
        
        // Update local state - add 30 days to membership expiry
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 30); // Add 30 days
        
        setMemberProfile(prev => ({
          ...prev,
          premiumMembership: true,
          planName: 'CAO CẤP',
          membershipExpiryDate: newExpiryDate.toISOString().split('T')[0],
          membershipDaysLeft: 30
        }));
      } else {
        message.success("Nâng cấp lên Thành viên Cao cấp thành công!");
        
        // Update local state
        setMemberProfile(prev => ({
          ...prev,
          premiumMembership: true,
          planName: 'CAO CẤP',
          membershipExpiryDate: (() => {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date.toISOString().split('T')[0];
          })(),
          membershipDaysLeft: 30
        }));
      }
      
      // Update user data in localStorage if needed
      const user = getCurrentUser();
      if (user) {
        const updatedUser = { ...user, isPremiumMembership: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
    } catch (error) {
      console.error("Error with payment:", error);
      message.error("Không thể hoàn tất thanh toán. Vui lòng thử lại.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    form.setFieldsValue({
      name: memberProfile.name
    });
    setIsEditing(false);
  };

  const handleCancelPremium = async () => {
    Modal.confirm({
      title: 'Xác nhận hủy Premium',
      content: 'Bạn có chắc chắn muốn hủy gói thành viên Cao cấp? Bạn sẽ mất quyền truy cập các tính năng nâng cao.',
      okText: 'Hủy Premium',
      okType: 'danger',
      cancelText: 'Giữ lại',
      onOk: async () => {
        try {
          await cancelMyPremium();
          // Cập nhật local state và localStorage
          setMemberProfile(prev => ({
            ...prev,
            premiumMembership: false,
            planName: 'GÓI CƠ BẢN',
            membershipExpiryDate: null,
            membershipDaysLeft: null
          }));
          // Update localStorage user
          const user = getCurrentUser();
          if (user) {
            const updatedUser = { ...user, isPremiumMembership: false };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          message.success('Đã hủy thành viên Cao cấp thành công!');
        } catch (error) {
          message.error('Không thể hủy Premium. Vui lòng thử lại.');
        }
      }
    });
  };

  const handleCancelCoach = async () => {
    Modal.confirm({
      title: 'Xác nhận hủy huấn luyện viên',
      content: 'Bạn có chắc chắn muốn hủy tư vấn với huấn luyện viên hiện tại?',
      okText: 'Hủy huấn luyện viên',
      okType: 'danger',
      cancelText: 'Giữ lại',
      onOk: async () => {
        try {
          await cancelCurrentCoach();
          setHasCoach(false);
          message.success('Đã hủy huấn luyện viên thành công!');
        } catch (error) {
          message.error('Không thể hủy huấn luyện viên. Vui lòng thử lại.');
        }
      }
    });
  };

  // Function to check if membership is about to expire (7 days or less)
  const isMembershipExpiringSoon = () => {
    if (!memberProfile || memberProfile.membershipDaysLeft === null || memberProfile.membershipDaysLeft === undefined) return false;
    return memberProfile.membershipDaysLeft <= 7 && memberProfile.premiumMembership;
  };
  
  // Function to check if membership has expired
  const isMembershipExpired = () => {
    if (!memberProfile || !memberProfile.premiumMembership) return false;
    return memberProfile.membershipDaysLeft !== null && memberProfile.membershipDaysLeft <= 0;
  };

  if (loading || !memberProfile) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải hồ sơ...</div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Không xác định';
    }
  };

  const membershipStatusStyle = {
    textCenter: { textAlign: 'center' },
    warningText: { color: '#faad14', fontWeight: 'bold' },
    dangerText: { color: '#ff4d4f', fontWeight: 'bold' },
    expiryCard: { boxShadow: isMembershipExpiringSoon() || isMembershipExpired() ? '0 0 10px rgba(255, 77, 79, 0.3)' : 'none' },
    premiumBadge: { backgroundColor: '#faad14', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }
  };

  return (
    <div className="member-profile">
      <div className="container py-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <div className="profile-header">
                <div className="profile-avatar">
                  <Avatar 
                    size={120} 
                    icon={<UserOutlined />} 
                    src={avatarUrl}
                  />
                  {/* Upload avatar button */}
                  <div style={{ marginTop: 12 }}>
                    <Upload
                      showUploadList={false}
                      accept="image/*"
                      customRequest={({ file, onSuccess, onError }) => {
                        // Tích hợp với antd Upload
                        uploadProfileImage(getMemberId(), file)
                          .then(() => {
                            onSuccess("ok");
                          })
                          .catch(onError);
                      }}
                      onChange={async (info) => {
                        if (info.file.status === 'done') {
                          const imgRes = await getProfileImage(getMemberId());
                          setAvatarUrl(imgRes);
                          message.success('Cập nhật ảnh đại diện thành công');
                        } else if (info.file.status === 'error') {
                          message.error('Không thể tải lên ảnh đại diện');
                        }
                      }}
                      disabled={uploading}
                    >
                      <Tooltip title="Đổi ảnh đại diện">
                        <Button icon={<UploadOutlined />} loading={uploading} size="small">
                          Đổi ảnh đại diện
                        </Button>
                      </Tooltip>
                    </Upload>
                  </div>
                  {memberProfile.premiumMembership && (
                    <Badge 
                      count={<CrownOutlined style={{ color: '#faad14' }} />} 
                      offset={[-10, 10]}
                    />
                  )}
                </div>
                <div className="profile-info">
                  {isEditing ? (
                    <Form form={form} layout="vertical">
                      <Form.Item 
                        name="name" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên của bạn' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                      </Form.Item>
                      <div>
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />} 
                          onClick={handleSave}
                          style={{ marginRight: 8 }}
                        >
                          Lưu thay đổi
                        </Button>
                        <Button onClick={handleCancel}>
                          Hủy bỏ
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <div className="profile-name-row">
                        <Title level={2}>{memberProfile.name}</Title>
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />} 
                          onClick={handleEdit}
                        >
                          Chỉnh sửa hồ sơ
                        </Button>
                      </div>
                      <Text type="secondary">
                        <MailOutlined /> {memberProfile.email}
                      </Text>
                      <div className="profile-badges">
                        <Tag color={memberProfile.premiumMembership ? "gold" : "blue"}>
                          Thành viên {memberProfile.premiumMembership ? 'Cao cấp' : 'Cơ bản'}
                        </Tag>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              <Title level={4}>Thông tin thành viên</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card className="detail-card">
                    <Statistic 
                      title="Gói hiện tại" 
                      value={memberProfile.planName || 'Gói cơ bản'}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  {memberProfile.premiumMembership && (
                    <Card 
                      className="detail-card" 
                      style={isMembershipExpiringSoon() || isMembershipExpired() ? membershipStatusStyle.expiryCard : {}}
                      bordered={true}
                    >
                      <Statistic 
                        title={<span style={isMembershipExpired() ? membershipStatusStyle.dangerText : null}>Gói hết hạn vào</span>} 
                        value={`${formatDate(memberProfile.membershipExpiryDate)}${memberProfile.membershipDaysLeft !== null ? ` - ${memberProfile.membershipDaysLeft} ngày còn lại` : ''}`}
                        valueStyle={{ 
                          color: isMembershipExpired() ? '#ff4d4f' : (isMembershipExpiringSoon() ? '#faad14' : 'inherit'),
                          fontWeight: isMembershipExpiringSoon() || isMembershipExpired() ? 'bold' : 'normal'
                        }}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                        <Tag color="gold">Cao cấp</Tag>
                        {isMembershipExpired() && <Tag color="red">Đã hết hạn</Tag>}
                      </div>
                      
                      {(isMembershipExpiringSoon() || isMembershipExpired()) && (
                        <Button 
                          type="primary"
                          danger={isMembershipExpired()}
                          style={{ marginTop: '16px', width: '100%' }}
                          onClick={handleUpgradeToPremium}
                          icon={<CrownOutlined />}
                        >
                          {isMembershipExpired() ? 'Gói đã hết hạn - Gia hạn ngay' : 'Gia hạn gói cao cấp'}
                        </Button>
                      )}
                    </Card>
                  )}
                  {!memberProfile.premiumMembership && (
                    <Card className="detail-card">
                      <Statistic 
                        title="Loại thành viên" 
                        value="Cơ bản"
                      />
                      <Tag color="blue">Cơ bản</Tag>
                    </Card>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Trạng thái thành viên">
              <div className="text-center">
                {memberProfile.premiumMembership ? (
                  <>
                    <CrownOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                    <Title level={3}>Thành viên Cao cấp</Title>
                    <Paragraph>
                      Bạn có quyền truy cập vào tất cả các tính năng cao cấp bao gồm huấn luyện cá nhân,
                      phân tích nâng cao và hỗ trợ ưu tiên.
                    </Paragraph>
                    {isMembershipExpiringSoon() && !isMembershipExpired() && (
                      <div style={{ marginTop: '16px' }}>
                        <Paragraph type="warning" style={{ fontWeight: 'bold' }}>
                          Gói thành viên của bạn sắp hết hạn! Còn {memberProfile.membershipDaysLeft} ngày.
                        </Paragraph>
                        <Button 
                          type="primary" 
                          size="large"
                          loading={upgradeLoading}
                          onClick={handleUpgradeToPremium}
                        >
                          Gia hạn gói Cao cấp
                        </Button>
                      </div>
                    )}
                    {isMembershipExpired() && (
                      <div style={{ marginTop: '16px' }}>
                        <Paragraph type="danger" style={{ fontWeight: 'bold' }}>
                          Gói thành viên của bạn đã hết hạn!
                        </Paragraph>
                        <Button 
                          type="primary" 
                          danger
                          size="large"
                          loading={upgradeLoading}
                          onClick={handleUpgradeToPremium}
                        >
                          Gia hạn gói Cao cấp ngay
                        </Button>
                      </div>
                    )}
                    
                    <div style={{ 
                      marginTop: '24px', 
                      padding: '12px', 
                      backgroundColor: '#fff2f0',
                      borderRadius: '6px',
                      border: '1px solid #ffccc7'
                    }}>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                        Không hài lòng với gói Premium?
                      </Text>
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={handleCancelPremium}
                        loading={upgradeLoading}
                        style={{
                          padding: 0,
                          height: 'auto',
                          fontSize: '12px',
                          textDecoration: 'underline'
                        }}
                      >
                        Hủy gói Premium
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <UserOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Title level={3}>Thành viên Cơ bản</Title>
                    <Paragraph>
                      Nâng cấp lên Cao cấp để mở khóa các tính năng nâng cao và tận dụng tối đa
                      hành trình cai thuốc lá của bạn.
                    </Paragraph>
                    <Button 
                      type="primary" 
                      size="large"
                      loading={upgradeLoading}
                      onClick={handleUpgradeToPremium}
                    >
                      Nâng cấp lên Cao cấp
                    </Button>
                  </>
                )}
              </div>
              <Divider />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Tag color={hasCoach ? "green" : "red"}>
                  {hasCoach ? "Đã có huấn luyện viên" : "Chưa có huấn luyện viên"}
                </Tag>
                {hasCoach && (
                  <Button 
                    danger 
                    size="small" 
                    style={{ marginLeft: 8 }}
                    onClick={handleCancelCoach}
                  >
                    Hủy huấn luyện viên
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={handlePaymentModalClose}
        onPaymentSuccess={handlePaymentSuccess}
        isRenewal={memberProfile?.premiumMembership}
        daysLeft={memberProfile?.membershipDaysLeft}
      />
    </div>
  );
};

export default MemberProfile;