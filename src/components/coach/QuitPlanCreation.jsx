import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Alert,
  Row,
  Col,
  Divider,
  Space,
  Spin,
  message
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BulbOutlined,
  HeartOutlined,
  FileTextOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { createQuitPlan } from '../../services/quitPlanService';
import { getAssignedMembers } from '../../services/coachManagementService';
import { getCurrentUser } from '../../services/authService';
import moment from 'moment';
import '../../styles/QuitPlanCreation.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Content } = Layout;

const QuitPlanCreation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const memberIdFromUrl = searchParams.get('memberId');
  
  const [form] = Form.useForm();
  const [selectedMemberId, setSelectedMemberId] = useState(memberIdFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const user = getCurrentUser();
  const coachId = user?.userId;

  // Set member ID from URL on component mount and fetch assigned members
  useEffect(() => {
    if (memberIdFromUrl) {
      setSelectedMemberId(memberIdFromUrl);
      form.setFieldsValue({ memberId: memberIdFromUrl });
    }
    fetchAssignedMembers();
  }, [memberIdFromUrl, coachId, form]);

  const fetchAssignedMembers = async () => {
    if (!coachId) return;
    
    setLoadingMembers(true);
    try {
      console.log('Fetching assigned members for coach:', coachId);
      const response = await getAssignedMembers(coachId);
      console.log('getAssignedMembers response:', response);
      
      setMembers(response);
    } catch (error) {
      console.error('Error fetching assigned members:', error);
      message.error('Không thể tải danh sách thành viên');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const smokingStatusOptions = [
    { value: 'NONE', label: 'Không hút thuốc' },
    { value: 'LIGHT', label: 'Hút ít (1-10 điếu/ngày)' },
    { value: 'MEDIUM', label: 'Hút vừa (11-20 điếu/ngày)' },
    { value: 'SEVERE', label: 'Hút nhiều (>20 điếu/ngày)' }
  ];

  const handleFinish = async (values) => {
    if (!selectedMemberId) {
      message.error('Vui lòng chọn thành viên');
      return;
    }

    // Validate dates
    if (values.endDate && values.startDate && moment(values.endDate).isBefore(moment(values.startDate))) {
      message.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    setLoading(true);

    try {
      const formData = {
        currentSmokingStatus: values.currentSmokingStatus,
        startDate: moment(values.startDate).format('YYYY-MM-DD'),
        endDate: moment(values.endDate).format('YYYY-MM-DD'),
        medicationInstructions: values.medicationInstructions || '',
        medicationsToUse: values.medicationsToUse || '',
        smokingTriggersToAvoid: values.smokingTriggersToAvoid || '',
        copingStrategies: values.copingStrategies || '',
        relapsePreventionStrategies: values.relapsePreventionStrategies || '',
        supportResources: values.supportResources || '',
        motivation: values.motivation || '',
        rewardPlan: values.rewardPlan || '',
        additionalNotes: values.additionalNotes || ''
      };

      console.log('Creating quit plan with data:', formData);
      console.log('For member ID:', selectedMemberId);
      console.log('currentSmokingStatus value:', values.currentSmokingStatus);
      console.log('Expected enum values: NONE, LIGHT, MEDIUM, SEVERE');

      const response = await createQuitPlan(selectedMemberId, formData);
      console.log('createQuitPlan response:', response);
      
      if (response.success) {
        message.success('🎉 Tạo kế hoạch cai thuốc thành công! Thành viên sẽ được thông báo về kế hoạch mới.');
        
        // Reset form after successful submission
        form.resetFields();
        
        // Only reset member selection if it wasn't from URL
        if (!memberIdFromUrl) {
          setSelectedMemberId('');
        }
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        message.error('❌ Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại.');
        console.error('API error:', response);
      }
    } catch (error) {
      console.error('Error creating quit plan:', error);
      message.error('❌ Có lỗi xảy ra khi tạo kế hoạch: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Layout className="quit-plan-creation">
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <Card className="header-card" style={{ marginBottom: 24, textAlign: 'center' }}>
            <Space direction="vertical" size="middle">
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                ✨ Tạo Kế Hoạch Cai Thuốc
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 16 }}>
                Tạo kế hoạch cai thuốc cá nhân hóa và khoa học cho thành viên của bạn
              </Paragraph>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={goBack}
                style={{ alignSelf: 'flex-start' }}
              >
                Quay lại
              </Button>
            </Space>
          </Card>

          {/* Main Form */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                currentSmokingStatus: 'NONE',
                startDate: moment(),
                endDate: moment().add(1, 'month')
              }}
            >
              {/* Member Selection */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <UserOutlined /> Chọn Thành Viên
                </Title>
                
                <Form.Item
                  label="Thành viên"
                  name="memberId"
                  rules={[{ required: true, message: 'Vui lòng chọn thành viên' }]}
                >
                  <Select
                    placeholder={loadingMembers ? "🔄 Đang tải..." : "-- Chọn thành viên --"}
                    value={selectedMemberId}
                    onChange={setSelectedMemberId}
                    disabled={!!memberIdFromUrl || loadingMembers}
                    loading={loadingMembers}
                    size="large"
                  >
                    {members.map(member => (
                      <Option key={member.memberId} value={member.memberId}>
                        👤 {member.name} ({member.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {memberIdFromUrl && (
                  <Alert
                    message="✅ Thành viên đã được chọn từ dashboard"
                    type="info"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </Card>

              {/* Basic Information */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <CalendarOutlined /> Thông Tin Cơ Bản
                </Title>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="🚬 Tình trạng hút thuốc hiện tại"
                      name="currentSmokingStatus"
                      rules={[{ required: true, message: 'Vui lòng chọn tình trạng hút thuốc' }]}
                    >
                      <Select size="large">
                        {smokingStatusOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="📅 Ngày bắt đầu"
                      name="startDate"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                    >
                      <DatePicker size="large" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  label="🏁 Ngày kết thúc"
                  name="endDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                >
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Card>

              {/* Medication Section */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <MedicineBoxOutlined /> Thuốc và Hướng Dẫn
                </Title>
                
                <Form.Item
                  label="💉 Thuốc sử dụng"
                  name="medicationsToUse"
                >
                  <TextArea
                    rows={3}
                    placeholder="Ví dụ: Miếng dán nicotine 21mg, kẹo cao su nicotine 2mg, thuốc Varenicline..."
                  />
                </Form.Item>
                
                <Form.Item
                  label="📝 Hướng dẫn sử dụng thuốc"
                  name="medicationInstructions"
                >
                  <TextArea
                    rows={4}
                    placeholder="Hướng dẫn chi tiết: thời gian sử dụng, liều lượng, cách dùng, tác dụng phụ cần lưu ý..."
                  />
                </Form.Item>
              </Card>

              {/* Strategies Section */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <BulbOutlined /> Chiến Lược và Phương Pháp
                </Title>
                
                <Form.Item
                  label="⚠️ Tránh các tác nhân kích thích"
                  name="smokingTriggersToAvoid"
                >
                  <TextArea
                    rows={3}
                    placeholder="Ví dụ: Stress công việc, rượu bia, cà phê buổi sáng, hoạt động xã hội, lái xe..."
                  />
                </Form.Item>
                
                <Form.Item
                  label="💪 Chiến lược đối phó"
                  name="copingStrategies"
                >
                  <TextArea
                    rows={4}
                    placeholder="Ví dụ: Tập thể dục 30 phút/ngày, thiền chánh niệm, thở sâu, nhai kẹo cao su, uống nước..."
                  />
                </Form.Item>
                
                <Form.Item
                  label="🛡️ Chiến lược phòng ngừa tái nghiện"
                  name="relapsePreventionStrategies"
                >
                  <TextArea
                    rows={4}
                    placeholder="Kế hoạch xử lý khi có nguy cơ tái nghiện: nhận biết dấu hiệu sớm, liên hệ coach, sử dụng kỹ thuật khẩn cấp..."
                  />
                </Form.Item>
              </Card>

              {/* Support and Motivation */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <HeartOutlined /> Hỗ Trợ và Động Lực
                </Title>
                
                <Form.Item
                  label="📞 Nguồn hỗ trợ"
                  name="supportResources"
                >
                  <TextArea
                    rows={3}
                    placeholder="Gia đình, bạn bè, nhóm hỗ trợ cai thuốc, hotline tư vấn, cộng đồng online..."
                  />
                </Form.Item>
                
                <Form.Item
                  label="🔥 Động lực cai thuốc"
                  name="motivation"
                >
                  <TextArea
                    rows={3}
                    placeholder="Lý do cai thuốc: sức khỏe gia đình, tiết kiệm tiền, cải thiện sức khỏe, làm gương cho con..."
                  />
                </Form.Item>
                
                <Form.Item
                  label="🎁 Kế hoạch thưởng"
                  name="rewardPlan"
                >
                  <TextArea
                    rows={3}
                    placeholder="Phần thưởng: 1 tuần - xem phim, 1 tháng - ăn nhà hàng, 3 tháng - du lịch..."
                  />
                </Form.Item>
              </Card>

              {/* Additional Notes */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <FileTextOutlined /> Ghi Chú Bổ Sung
                </Title>
                
                <Form.Item
                  label="💭 Ghi chú"
                  name="additionalNotes"
                >
                  <TextArea
                    rows={4}
                    placeholder="Ghi chú thêm về tình trạng sức khỏe, tiền sử bệnh, mối quan tâm đặc biệt của thành viên..."
                  />
                </Form.Item>
              </Card>

              {/* Submit Actions */}
              <Divider />
              <div style={{ textAlign: 'center' }}>
                <Space size="large">
                  <Button 
                    type="default" 
                    size="large"
                    onClick={goBack}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                    icon={<SaveOutlined />}
                  >
                    {loading ? 'Đang tạo...' : '🚀 Tạo Kế Hoạch'}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default QuitPlanCreation;
