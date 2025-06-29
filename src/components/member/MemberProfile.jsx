import React, { useState, useEffect } from 'react';
import { 
  Card, Avatar, Typography, Row, Col, Statistic, Badge, 
  List, Tag, Divider, Form, Input, Button, message, Modal
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  TrophyOutlined, EditOutlined, SaveOutlined, CrownOutlined
} from '@ant-design/icons';
import { getMemberProfile, updateMemberProfile } from '../../services/memberProfileService';
import { getCurrentUser } from '../../services/authService';

const { Title, Text, Paragraph } = Typography;

const MemberProfile = () => {
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  
  // In a real app, this would come from authentication context
  const getMemberId = () => {
    const user = getCurrentUser();
    return user?.userId || null;
  };

  const memberId = getMemberId();

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMemberProfile(memberId);
        
        if (profile) {
          setMemberProfile(profile);
          
          // Initialize form with profile data - Updated field names
          form.setFieldsValue({
            name: profile.name,
            email: profile.email,
            contactNumber: profile.contactNumber
          });
        }
      } catch (error) {
        console.error("Error fetching member profile:", error);
        message.error("Failed to load profile data");
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
      const response = await updateMemberProfile(memberId, values);
      console.log(response)
      // Updated to handle response with data object
      if (response) {
        message.success("Profile updated successfully");
        setMemberProfile(response);
        setIsEditing(false);
      } else {
        message.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("An error occurred while saving your profile");
    }
  };

  if (loading || !memberProfile) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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
                  />
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
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                      </Form.Item>
                      <Form.Item 
                        name="email" 
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                      </Form.Item>
                      <Form.Item 
                        name="contactNumber" 
                        rules={[{ required: true, message: 'Please enter your contact number' }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Contact Number" />
                      </Form.Item>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
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
                          Edit Profile
                        </Button>
                      </div>
                      <Text type="secondary">
                        <MailOutlined /> {memberProfile.email}
                      </Text>
                      <br />
                      <Text type="secondary">
                        <PhoneOutlined /> {memberProfile.contactNumber}
                      </Text>
                      <div className="profile-badges">
                        <Tag color={memberProfile.premiumMembership ? "gold" : "blue"}>
                          {memberProfile.premiumMembership ? 'Premium' : 'Basic'} Member
                        </Tag>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              <Title level={4}>Membership Details</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card className="detail-card">
                    <Statistic 
                      title="Current Plan" 
                      value={memberProfile.planName}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="detail-card">
                    <Statistic 
                      title="Membership Expires" 
                      value={formatDate(memberProfile.membershipExpiryDate)}
                    />
                    <Tag color={memberProfile.premiumMembership ? "gold" : "blue"}>
                      {memberProfile.premiumMembership ? 'Premium' : 'Basic'}
                    </Tag>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Membership Status">
              <div className="text-center">
                {memberProfile.premiumMembership ? (
                  <>
                    <CrownOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                    <Title level={3}>Premium Member</Title>
                    <Paragraph>
                      You have access to all premium features including personalized coaching,
                      advanced analytics, and priority support.
                    </Paragraph>
                  </>
                ) : (
                  <>
                    <UserOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Title level={3}>Basic Member</Title>
                    <Paragraph>
                      Upgrade to Premium to unlock advanced features and get the most
                      out of your quit smoking journey.
                    </Paragraph>
                    <Button type="primary" size="large">
                      Upgrade to Premium
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MemberProfile;