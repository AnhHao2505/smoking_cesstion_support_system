import React, { useState, useEffect } from 'react';
import { 
  Card, Avatar, Typography, Row, Col, Statistic, Badge, 
  List, Tag, Divider, Form, Input, Button, message, Modal
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  TrophyOutlined, EditOutlined, SaveOutlined
} from '@ant-design/icons';
import { getMemberDetails, updateMemberProfile } from '../../services/memberProfileService';

const { Title, Text, Paragraph } = Typography;

const MemberProfile = () => {
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  
  // In a real app, this would come from authentication context
  const userId = 101;

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        const profile = getMemberDetails(userId);
        setMemberProfile(profile);
        setLoading(false);
        // Initialize form with profile data
        form.setFieldsValue({
          full_name: profile.full_name,
          email_address: profile.email_address,
          phone_number: profile.phone_number
        });
      } catch (error) {
        console.error("Error fetching member profile:", error);
        setLoading(false);
      }
    };

    fetchMemberProfile();
  }, [userId, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await updateMemberProfile(userId, values);
      
      if (response.success) {
        message.success(response.message);
        setMemberProfile({
          ...memberProfile,
          ...values
        });
        setIsEditing(false);
      } else {
        message.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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
                    src={memberProfile.photo_url} 
                    icon={<UserOutlined />} 
                  />
                </div>
                <div className="profile-info">
                  {isEditing ? (
                    <Form form={form} layout="vertical">
                      <Form.Item 
                        name="full_name" 
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                      </Form.Item>
                      <Form.Item 
                        name="email_address" 
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                      </Form.Item>
                      <Form.Item 
                        name="phone_number" 
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
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
                        <Title level={2}>{memberProfile.full_name}</Title>
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />} 
                          onClick={handleEdit}
                        >
                          Edit Profile
                        </Button>
                      </div>
                      <Text type="secondary">
                        <MailOutlined /> {memberProfile.email_address}
                      </Text>
                      <br />
                      <Text type="secondary">
                        <PhoneOutlined /> {memberProfile.phone_number}
                      </Text>
                      <div className="profile-badges">
                        <Tag color="blue">{memberProfile.membership_status} Member</Tag>
                        <Text type="secondary">
                          Member since {formatDate(memberProfile.joined_date)}
                        </Text>
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
                      title="Membership Valid Until" 
                      value={formatDate(memberProfile.membership.end_date)}
                    />
                    <Text type="secondary">
                      Auto-renew: {memberProfile.membership.auto_renew ? 'Enabled' : 'Disabled'}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="detail-card">
                    <Statistic 
                      title="Payment Method" 
                      value={memberProfile.membership.payment_method}
                    />
                    <Button size="small" type="link">Update payment method</Button>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Earned Badges">
              <List
                itemLayout="horizontal"
                dataSource={memberProfile.earned_badges}
                renderItem={badge => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                      title={badge.badge_name}
                      description={
                        <>
                          <Text>{badge.badge_description}</Text>
                          <br />
                          <Text type="secondary">Earned on {formatDate(badge.earned_date)}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MemberProfile;