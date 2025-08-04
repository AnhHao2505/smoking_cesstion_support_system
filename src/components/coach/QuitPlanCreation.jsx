import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Row,
  Col,
  Divider,
  Space,
  Spin,
  message,
  List,
  Tag,
  Steps
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
import { createQuitPlan, getNewestQuitPlan } from '../../services/quitPlanService';
import { getAssignedMembers } from '../../services/coachManagementService';
import { getCurrentUser } from '../../services/authService';
import { getDefaultPhases, createGoalsOfPhases } from '../../services/quitPhaseService';
import MemberSmokingStatusSidebar from './MemberSmokingStatusSidebar';
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
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [memberAddictionLevel, setMemberAddictionLevel] = useState(null);
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

  // Set member name when members are loaded and there's a selected member ID
  useEffect(() => {
    if (selectedMemberId && members.length > 0) {
      const selectedMember = members.find(member => member.memberId === selectedMemberId);
      setSelectedMemberName(selectedMember ? selectedMember.name : '');
    }
  }, [selectedMemberId, members]);
  // Fetch assigned members when coachId changes
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
    console.log('=== HANDLE FINISH CALLED ===');
    console.log('Form values received:', values);
    console.log('selectedMemberId state:', selectedMemberId);
    console.log('memberIdFromUrl:', memberIdFromUrl);
    
    // VALIDATION GUARD: All validation must pass before ANY processing
    let hasValidationErrors = false;
    
    // Enhanced form validation - ALL FIELDS REQUIRED
    const validationErrors = [];
    
    // Get memberId from form values or state
    const memberId = values.memberId || selectedMemberId;
    console.log('Final memberId to use:', memberId);

    if (!memberId) {
      console.log('ERROR: No member ID found');
      validationErrors.push('Vui lòng chọn thành viên');
    }

    // Validate duration with enhanced checks
    const duration = parseInt(values.durationInDays);
    if (!values.durationInDays || values.durationInDays === '') {
      validationErrors.push('Vui lòng nhập thời lượng kế hoạch');
    } else if (isNaN(duration) || duration < 1 || duration > 365) {
      validationErrors.push('Thời lượng kế hoạch phải từ 1-365 ngày');
    }

    // Validate smoking status
    if (!values.currentSmokingStatus) {
      validationErrors.push('Vui lòng chọn tình trạng hút thuốc hiện tại');
    }

    // MANDATORY: All medication fields are now required
    if (!values.medicationsToUse || values.medicationsToUse.trim() === '') {
      validationErrors.push('Vui lòng nhập thuốc sử dụng');
    }

    if (!values.medicationInstructions || values.medicationInstructions.trim() === '') {
      validationErrors.push('Vui lòng nhập hướng dẫn sử dụng thuốc');
    }

    // MANDATORY: All strategy fields are now required
    if (!values.smokingTriggersToAvoid || values.smokingTriggersToAvoid.trim() === '') {
      validationErrors.push('Vui lòng nhập các tác nhân kích thích cần tránh');
    }

    if (!values.copingStrategies || values.copingStrategies.trim() === '') {
      validationErrors.push('Vui lòng nhập chiến lược đối phó');
    }

    if (!values.relapsePreventionStrategies || values.relapsePreventionStrategies.trim() === '') {
      validationErrors.push('Vui lòng nhập chiến lược phòng ngừa tái nghiện');
    }

    // MANDATORY: All support and motivation fields are now required
    if (!values.supportResources || values.supportResources.trim() === '') {
      validationErrors.push('Vui lòng nhập nguồn hỗ trợ');
    }

    if (!values.motivation || values.motivation.trim() === '') {
      validationErrors.push('Vui lòng nhập động lực cai thuốc');
    }

    if (!values.rewardPlan || values.rewardPlan.trim() === '') {
      validationErrors.push('Vui lòng nhập kế hoạch thưởng');
    }

    // MANDATORY: Additional notes are now required
    if (!values.additionalNotes || values.additionalNotes.trim() === '') {
      validationErrors.push('Vui lòng nhập ghi chú bổ sung');
    }

    // CRITICAL: Stop here if ANY required field is missing
    if (validationErrors.length > 0) {
      hasValidationErrors = true;
      message.error({
        content: (
          <div>
            <div style={{ marginBottom: 8 }}>❌ Vui lòng điền đầy đủ tất cả thông tin bắt buộc:</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 6
      });
      return; // STOP EXECUTION - Do not proceed further
    }

    // Field format validation (still required for proper format)
    const formatErrors = [];
    
    // Validate field lengths and format - all fields already validated as non-empty above
    if (values.medicationInstructions && values.medicationInstructions.length > 1000) {
      formatErrors.push('Hướng dẫn dùng thuốc không được vượt quá 1000 ký tự');
    }
    if (values.medicationInstructions && values.medicationInstructions.trim().length < 20) {
      formatErrors.push('Hướng dẫn sử dụng thuốc phải có ít nhất 20 ký tự');
    }

    if (values.medicationsToUse && values.medicationsToUse.length > 500) {
      formatErrors.push('Danh sách thuốc sử dụng không được vượt quá 500 ký tự');
    }
    if (values.medicationsToUse && values.medicationsToUse.trim().length < 10) {
      formatErrors.push('Danh sách thuốc sử dụng phải có ít nhất 10 ký tự');
    }

    if (values.smokingTriggersToAvoid && values.smokingTriggersToAvoid.length > 1000) {
      formatErrors.push('Danh sách trigger tránh không được vượt quá 1000 ký tự');
    }
    if (values.smokingTriggersToAvoid && values.smokingTriggersToAvoid.trim().length < 15) {
      formatErrors.push('Danh sách tác nhân kích thích phải có ít nhất 15 ký tự');
    }

    if (values.copingStrategies && values.copingStrategies.length > 1000) {
      formatErrors.push('Chiến lược đối phó không được vượt quá 1000 ký tự');
    }
    if (values.copingStrategies && values.copingStrategies.trim().length < 20) {
      formatErrors.push('Chiến lược đối phó phải có ít nhất 20 ký tự');
    }

    if (values.relapsePreventionStrategies && values.relapsePreventionStrategies.length > 1000) {
      formatErrors.push('Chiến lược phòng ngừa tái phát không được vượt quá 1000 ký tự');
    }
    if (values.relapsePreventionStrategies && values.relapsePreventionStrategies.trim().length < 20) {
      formatErrors.push('Chiến lược phòng ngừa tái nghiện phải có ít nhất 20 ký tự');
    }

    if (values.supportResources && values.supportResources.length > 1000) {
      formatErrors.push('Nguồn hỗ trợ không được vượt quá 1000 ký tự');
    }
    if (values.supportResources && values.supportResources.trim().length < 10) {
      formatErrors.push('Nguồn hỗ trợ phải có ít nhất 10 ký tự');
    }

    if (values.motivation && values.motivation.length > 500) {
      formatErrors.push('Động lực không được vượt quá 500 ký tự');
    }
    if (values.motivation && values.motivation.trim().length < 10) {
      formatErrors.push('Động lực cai thuốc phải có ít nhất 10 ký tự');
    }

    if (values.rewardPlan && values.rewardPlan.length > 500) {
      formatErrors.push('Kế hoạch thưởng không được vượt quá 500 ký tự');
    }
    if (values.rewardPlan && values.rewardPlan.trim().length < 15) {
      formatErrors.push('Kế hoạch thưởng phải có ít nhất 15 ký tự');
    }

    if (values.additionalNotes && values.additionalNotes.length > 1500) {
      formatErrors.push('Ghi chú bổ sung không được vượt quá 1500 ký tự');
    }
    if (values.additionalNotes && values.additionalNotes.trim().length < 10) {
      formatErrors.push('Ghi chú bổ sung phải có ít nhất 10 ký tự');
    }

    // CRITICAL: Stop here if format validation fails
    if (formatErrors.length > 0) {
      hasValidationErrors = true;
      message.error({
        content: (
          <div>
            <div style={{ marginBottom: 8 }}>❌ Lỗi định dạng thông tin:</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {formatErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 6
      });
      return; // STOP EXECUTION - Do not proceed further
    }

    // FINAL VALIDATION GUARD: Absolutely no processing if any validation failed
    if (hasValidationErrors) {
      console.error('❌ VALIDATION FAILED - Stopping all execution');
      return; // FINAL STOP - No processing whatsoever
    }

    // VALIDATION PASSED: Now safe to proceed with processing
    console.log('✅ All validations passed - proceeding with plan creation');
    
    console.log('Starting to create quit plan...');
    setLoading(true);

    try {
      // Log the duration value for debugging
      console.log('Duration validated:', duration);
      console.log('Duration type:', typeof duration);

    // Log the duration value for debugging
    console.log('Duration to send:', duration);
    console.log('Original form values:', values);

      // Đảm bảo durationInDays là primitive number
    const durationNumber = Number(duration);
    console.log('Duration after Number conversion:', durationNumber);
    console.log('Type of durationNumber:', typeof durationNumber);
    
    // Use memberAddictionLevel from smoking status analysis, not form selection
    const actualAddictionLevel = memberAddictionLevel || values.currentSmokingStatus || 'NONE';
    console.log('Using addiction level for plan:', actualAddictionLevel);
    console.log('Source - memberAddictionLevel:', memberAddictionLevel);
    console.log('Source - form currentSmokingStatus:', values.currentSmokingStatus);
    
    const formData = {
        currentSmokingStatus: actualAddictionLevel, // Use actual addiction level from sidebar analysis
        durationInDays: durationNumber, // Primitive number
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
      
      // Log để kiểm tra dữ liệu JSON sẽ được gửi đi
      console.log('JSON to be sent:', JSON.stringify(formData));
      console.log('Creating quit plan with data:', formData);
      console.log('For member ID:', memberId);
      console.log('Final currentSmokingStatus (AddictionLevel) value:', actualAddictionLevel);
      console.log('Expected AddictionLevel enum values: NONE, LIGHT, MEDIUM, SEVERE');

      // Log the final data being sent to API
      console.log('Sending to API:', {
        memberId,
        formData
      });

      const response = await createQuitPlan(memberId, formData);
      console.log('createQuitPlan response:', response);

      // Log detailed response for debugging
      if (response && typeof response === 'object') {
        console.log('=== PLAN CREATION RESPONSE DEBUG ===');
        console.log('Response structure:', {
          success: response.success,
          message: response.message,
          planId: response.planId,
          fullResponse: response
        });
        console.log('=== END DEBUG ===');
      }
    
      // Check if the response indicates success
      const hasSuccess = response && response.success === true;
      console.log('Plan creation success status:', hasSuccess);
      
      if (hasSuccess) {
        message.success('🎉 Tạo kế hoạch cai thuốc thành công!');
      } else {
        // Handle error response from QuitPlanCreationResponse
        const errorMessage = response?.message || 'Có lỗi xảy ra khi tạo kế hoạch';
        
        if (errorMessage.includes('chưa nhận được yêu cầu từ thành viên')) {
          message.error('❌ Thành viên chưa gửi yêu cầu tạo kế hoạch. Vui lòng yêu cầu thành viên gửi request trước.');
          message.info('💡 Thành viên cần vào dashboard và nhấn "Yêu cầu tạo kế hoạch" trước khi coach có thể tạo.');
        } else if (errorMessage.includes('Không tồn tại mối liên hệ')) {
          message.error('❌ Không có mối liên hệ coach-member. Vui lòng kiểm tra lại.');
        } else {
          message.error(`❌ ${errorMessage}`);
        }
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
      {/* Smoking Status Sidebar - Fixed on left */}
      <MemberSmokingStatusSidebar 
        memberId={selectedMemberId} 
        memberName={selectedMemberName}
        onAddictionLevelChange={(addictionLevel) => {
          setMemberAddictionLevel(addictionLevel);
        }}
      />
      <Content style={{ padding: '24px', marginLeft: '390px' }}>
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
                durationInDays: Number(30)
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
                    onChange={(value) => {
                      setSelectedMemberId(value);
                      const selectedMember = members.find(member => member.memberId === value);
                      setSelectedMemberName(selectedMember ? selectedMember.name : '');
                      form.setFieldsValue({ memberId: value });
                    }}
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
                      label="⏰ Thời lượng kế hoạch (ngày)"
                      name="durationInDays"
                      rules={[
                        { required: true, message: 'Vui lòng nhập thời lượng kế hoạch' },
                        { 
                          validator: async (_, value) => {
                            if (!value) return;
                            const numValue = parseInt(value);
                            if (isNaN(numValue)) {
                              throw new Error('Thời lượng phải là số');
                            }
                            if (numValue < 1 || numValue > 365) {
                              throw new Error('Thời lượng phải từ 1-365 ngày');
                            }
                          }
                        }
                      ]}
                    >
                      <Input
                        type="number"
                        size="large"
                        min={1}
                        max={365}
                        placeholder="Ví dụ: 30, 60, 90..."
                        addonAfter="ngày"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const numValue = Number(value);
                            form.setFieldsValue({ durationInDays: numValue });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              {/* Medication Section */}
              <Card type="inner" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <MedicineBoxOutlined /> Thuốc và Hướng Dẫn
                </Title>
                <Form.Item
                  label="💉 Thuốc sử dụng"
                  name="medicationsToUse"
                  rules={[
                    { required: true, message: 'Vui lòng nhập thuốc sử dụng' },
                    { min: 10, message: 'Danh sách thuốc phải có ít nhất 10 ký tự' },
                    { max: 500, message: 'Danh sách thuốc không được vượt quá 500 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Ví dụ: Miếng dán nicotine 21mg, kẹo cao su nicotine 2mg, thuốc Varenicline..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
                <Form.Item
                  label="📝 Hướng dẫn sử dụng thuốc"
                  name="medicationInstructions"
                  rules={[
                    { required: true, message: 'Vui lòng nhập hướng dẫn sử dụng thuốc' },
                    { min: 20, message: 'Hướng dẫn sử dụng thuốc phải có ít nhất 20 ký tự' },
                    { max: 1000, message: 'Hướng dẫn sử dụng thuốc không được vượt quá 1000 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Hướng dẫn chi tiết: thời gian sử dụng, liều lượng, cách dùng, tác dụng phụ cần lưu ý..."
                    showCount
                    maxLength={1000}
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
                  rules={[
                    { required: true, message: 'Vui lòng nhập các tác nhân kích thích cần tránh' },
                    { min: 15, message: 'Danh sách tác nhân kích thích phải có ít nhất 15 ký tự' },
                    { max: 1000, message: 'Danh sách tác nhân kích thích không được vượt quá 1000 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Ví dụ: Stress công việc, rượu bia, cà phê buổi sáng, hoạt động xã hội, lái xe..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
                <Form.Item
                  label="💪 Chiến lược đối phó"
                  name="copingStrategies"
                  rules={[
                    { required: true, message: 'Vui lòng nhập chiến lược đối phó' },
                    { min: 20, message: 'Chiến lược đối phó phải có ít nhất 20 ký tự' },
                    { max: 1000, message: 'Chiến lược đối phó không được vượt quá 1000 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Ví dụ: Tập thể dục 30 phút/ngày, thiền chánh niệm, thở sâu, nhai kẹo cao su, uống nước..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
                <Form.Item
                  label="🛡️ Chiến lược phòng ngừa tái nghiện"
                  name="relapsePreventionStrategies"
                  rules={[
                    { required: true, message: 'Vui lòng nhập chiến lược phòng ngừa tái nghiện' },
                    { min: 20, message: 'Chiến lược phòng ngừa tái nghiện phải có ít nhất 20 ký tự' },
                    { max: 1000, message: 'Chiến lược phòng ngừa tái nghiện không được vượt quá 1000 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Kế hoạch xử lý khi có nguy cơ tái nghiện: nhận biết dấu hiệu sớm, liên hệ coach, sử dụng kỹ thuật khẩn cấp..."
                    showCount
                    maxLength={1000}
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
                  rules={[
                    { required: true, message: 'Vui lòng nhập nguồn hỗ trợ' },
                    { min: 10, message: 'Nguồn hỗ trợ phải có ít nhất 10 ký tự' },
                    { max: 1000, message: 'Nguồn hỗ trợ không được vượt quá 1000 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Gia đình, bạn bè, nhóm hỗ trợ cai thuốc, hotline tư vấn, cộng đồng online..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
                <Form.Item
                  label="🔥 Động lực cai thuốc"
                  name="motivation"
                  rules={[
                    { required: true, message: 'Vui lòng nhập động lực cai thuốc' },
                    { min: 10, message: 'Động lực cai thuốc phải có ít nhất 10 ký tự' },
                    { max: 500, message: 'Động lực cai thuốc không được vượt quá 500 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Lý do cai thuốc: sức khỏe gia đình, tiết kiệm tiền, cải thiện sức khỏe, làm gương cho con..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
                <Form.Item
                  label="🎁 Kế hoạch thưởng"
                  name="rewardPlan"
                  rules={[
                    { required: true, message: 'Vui lòng nhập kế hoạch thưởng' },
                    { min: 15, message: 'Kế hoạch thưởng phải có ít nhất 15 ký tự' },
                    { max: 500, message: 'Kế hoạch thưởng không được vượt quá 500 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Phần thưởng: 1 tuần - xem phim, 1 tháng - ăn nhà hàng, 3 tháng - du lịch..."
                    showCount
                    maxLength={500}
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
                  rules={[
                    { required: true, message: 'Vui lòng nhập ghi chú bổ sung' },
                    { min: 10, message: 'Ghi chú bổ sung phải có ít nhất 10 ký tự' },
                    { max: 1500, message: 'Ghi chú bổ sung không được vượt quá 1500 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Ghi chú thêm về tình trạng sức khỏe, tiền sử bệnh, mối quan tâm đặc biệt của thành viên..."
                    showCount
                    maxLength={1500}
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
