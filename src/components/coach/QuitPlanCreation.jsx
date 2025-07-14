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
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [showPhaseCreation, setShowPhaseCreation] = useState(false);
  const [defaultPhases, setDefaultPhases] = useState([]);
  const [phaseGoals, setPhaseGoals] = useState({});
  const [loadingPhases, setLoadingPhases] = useState(false);

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

  const fetchDefaultPhases = async (addictionLevel) => {
    setLoadingPhases(true);
    try {
      console.log('Fetching default phases for addiction level:', addictionLevel);
      const response = await getDefaultPhases(addictionLevel);
      console.log('getDefaultPhases response:', response);
      
      // Check if response is in the expected format based on user requirements
      let phasesData = [];
      
      if (response && Array.isArray(response)) {
        // Direct array response
        phasesData = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        // Wrapped in success object
        phasesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Wrapped in data object
        phasesData = response.data;
      }
      
      // If no valid response data, create default phases
      if (!phasesData || phasesData.length === 0) {
        console.log('No default phases found or invalid response, creating default phases');
        phasesData = [
          {
            "id": null,
            "name": "Chuẩn bị bỏ thuốc",
            "duration": "Ngày 1–5",
            "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
            "goal": null,
            "phaseOrder": 1
          },
          {
            "id": null,
            "name": "Bắt đầu bỏ thuốc",
            "duration": "Ngày 6–20",
            "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
            "goal": null,
            "phaseOrder": 2
          },
          {
            "id": null,
            "name": "Duy trì",
            "duration": "Ngày 21–90",
            "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
            "goal": null,
            "phaseOrder": 3
          }
        ];
      }
      
      console.log('Using phases data:', phasesData);
      setDefaultPhases(phasesData);
      
      // Initialize phase goals with recommend goals or empty goals
      const initialGoals = {};
      phasesData.forEach((phase, index) => {
        if (phase.recommendGoal && phase.recommendGoal.trim() !== '') {
          // Use recommend goal as first goal
          initialGoals[index] = [phase.recommendGoal, ''];
        } else {
          // Add at least 2 empty goals for each phase so inputs appear
          initialGoals[index] = ['', ''];
        }
      });
      setPhaseGoals(initialGoals);
      
    } catch (error) {
      console.error('Error fetching default phases:', error);
      message.error('Không thể tải phases mặc định, tạo phases trống');
      
      // Fallback: create default phases based on user's format
      const defaultPhasesData = [
        {
          "id": null,
          "name": "Chuẩn bị bỏ thuốc",
          "duration": "Ngày 1–5",
          "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
          "goal": null,
          "phaseOrder": 1
        },
        {
          "id": null,
          "name": "Bắt đầu bỏ thuốc",
          "duration": "Ngày 6–20",
          "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
          "goal": null,
          "phaseOrder": 2
        },
        {
          "id": null,
          "name": "Duy trì",
          "duration": "Ngày 21–90",
          "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
          "goal": null,
          "phaseOrder": 3
        }
      ];
      
      setDefaultPhases(defaultPhasesData);
      
      // Initialize with default goals for each phase
      const initialGoals = {};
      defaultPhasesData.forEach((phase, index) => {
        initialGoals[index] = [phase.recommendGoal || '', ''];
      });
      setPhaseGoals(initialGoals);
    } finally {
      setLoadingPhases(false);
    }
  };

  const createBlankPhases = () => {
    return [
      {
        "id": null,
        "name": "Chuẩn bị bỏ thuốc",
        "duration": "Ngày 1–5",
        "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
        "goal": null,
        "phaseOrder": 1
      },
      {
        "id": null,
        "name": "Bắt đầu bỏ thuốc",
        "duration": "Ngày 6–20",
        "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
        "goal": null,
        "phaseOrder": 2
      },
      {
        "id": null,
        "name": "Duy trì",
        "duration": "Ngày 21–90",
        "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
        "goal": null,
        "phaseOrder": 3
      }
    ];
  };

  const handlePhaseGoalChange = (phaseIndex, goalIndex, value) => {
    setPhaseGoals(prev => ({
      ...prev,
      [phaseIndex]: prev[phaseIndex]?.map((goal, idx) => 
        idx === goalIndex ? value : goal
      ) || []
    }));
  };

  const addPhaseGoal = (phaseIndex) => {
    setPhaseGoals(prev => ({
      ...prev,
      [phaseIndex]: [...(prev[phaseIndex] || []), '']
    }));
  };

  const removePhaseGoal = (phaseIndex, goalIndex) => {
    setPhaseGoals(prev => ({
      ...prev,
      [phaseIndex]: prev[phaseIndex]?.filter((_, idx) => idx !== goalIndex) || []
    }));
  };

  const handleCreatePhases = async () => {
    if (!createdPlanId) {
      message.error('Không tìm thấy ID kế hoạch');
      return;
    }

    // Validate that each phase has at least one goal
    const hasEmptyPhases = Object.keys(phaseGoals).some(phaseIndex => {
      const goals = phaseGoals[phaseIndex]?.filter(goal => goal.trim() !== '') || [];
      return goals.length === 0;
    });

    if (hasEmptyPhases) {
      message.warning('⚠️ Mỗi giai đoạn cần có ít nhất một mục tiêu');
      return;
    }

    setLoadingPhases(true);
    try {
      // Prepare phases data with goals using the correct format based on API response
      const phasesData = defaultPhases.map((phase, index) => {
        const goals = phaseGoals[index]?.filter(goal => goal.trim() !== '') || [];
        return {
          ...phase,
          goals: goals
        };
      });

      console.log('Creating phase goals with data:', phasesData);
      console.log('Using planId:', createdPlanId);
      
      const response = await createGoalsOfPhases(createdPlanId, phasesData);
      console.log('createGoalsOfPhases response:', response);

      // Check for success in various response formats
      const isSuccess = response && (
        response.success === true || 
        response === 'Goals created successfully' ||
        typeof response === 'string' ||
        response.message === 'Success'
      );

      if (isSuccess) {
        message.success('🎉 Tạo phases thành công! Kế hoạch đã được hoàn thiện.');
        
        // Navigate back after short delay
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        throw new Error(response?.message || 'Unexpected response format');
      }

    } catch (error) {
      console.error('Error creating phases:', error);
      
      // Check if it's a plan ID not found error
      if (error.message && error.message.includes('quitPlanId not found')) {
        message.error('❌ ID kế hoạch không hợp lệ. Kế hoạch đã được tạo nhưng không thể thêm phases chi tiết.');
        message.info('💡 Bạn có thể quay lại dashboard và chỉnh sửa kế hoạch để thêm phases sau.');
      } else {
        message.error('❌ Có lỗi xảy ra khi tạo phases: ' + (error.message || 'Lỗi không xác định'));
      }
      
      // Still navigate back after error to avoid getting stuck
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } finally {
      setLoadingPhases(false);
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
    
    // Get memberId from form values or state
    const memberId = values.memberId || selectedMemberId;
    console.log('Final memberId to use:', memberId);

    if (!memberId) {
      console.log('ERROR: No member ID found');
      message.error('Vui lòng chọn thành viên');
      return;
    }

    // Validate dates
    if (values.endDate && values.startDate && moment(values.endDate).isBefore(moment(values.startDate))) {
      message.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    console.log('Starting to create quit plan...');
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
      console.log('For member ID:', memberId);
      console.log('currentSmokingStatus value:', values.currentSmokingStatus);
      console.log('Expected enum values: NONE, LIGHT, MEDIUM, SEVERE');

      const response = await createQuitPlan(memberId, formData);
      console.log('createQuitPlan response:', response);
      
      if (response && (response.success || response.data || response.id)) {
        message.success('🎉 Tạo kế hoạch cai thuốc thành công!');
        
        // Extract plan ID from various possible response formats
        let planId = null;
        if (response.success && response.data) {
          planId = response.data.id || response.data.planId || response.data.quitPlanId;
        } else if (response.id) {
          planId = response.id;
        } else if (response.planId) {
          planId = response.planId;
        } else if (response.data) {
          planId = response.data;
        }
        
        console.log('Extracted plan ID:', planId);
        
        // If no plan ID found in response, try to get the newest plan for the member
        if (!planId) {
          try {
            console.log('No plan ID in response, fetching newest plan for member:', memberId);
            const newestPlanResponse = await getNewestQuitPlan(memberId);
            console.log('Newest plan response:', newestPlanResponse);
            
            if (newestPlanResponse && newestPlanResponse.success && newestPlanResponse.data) {
              planId = newestPlanResponse.data.id || newestPlanResponse.data.planId || newestPlanResponse.data.quitPlanId;
              console.log('Got plan ID from newest plan:', planId);
            } else if (newestPlanResponse && newestPlanResponse.id) {
              planId = newestPlanResponse.id;
              console.log('Got plan ID directly from newest plan response:', planId);
            }
          } catch (newestPlanError) {
            console.warn('Could not fetch newest plan:', newestPlanError);
          }
        }
        
        if (planId) {
          setCreatedPlanId(planId);
          setShowPhaseCreation(true);
          
          // Fetch default phases based on smoking status
          await fetchDefaultPhases(values.currentSmokingStatus);
        } else {
          // If no plan ID found, skip phase creation and navigate back
          message.warning('⚠️ Kế hoạch đã được tạo nhưng không thể tạo phases chi tiết. Bạn có thể tạo phases sau.');
          setTimeout(() => {
            navigate(-1);
          }, 2000);
        }
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
      {/* Smoking Status Sidebar - Fixed on left */}
      <MemberSmokingStatusSidebar 
        memberId={selectedMemberId} 
        memberName={selectedMemberName}
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
          {!showPhaseCreation && (
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
                    onChange={(value) => {
                      console.log('Member selected:', value);
                      setSelectedMemberId(value);
                      
                      // Find and set member name
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
          )}

          {/* Phase Creation Section */}
          {showPhaseCreation && (
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ color: '#1890ff' }}>
                  🔄 Tạo Các Giai Đoạn Cai Thuốc
                </Title>
                <Paragraph>
                  Tùy chỉnh các mục tiêu cho từng giai đoạn trong kế hoạch cai thuốc
                </Paragraph>
                
                {/* Add button to create blank phases if needed */}
                {defaultPhases.length === 0 && (                <Button 
                  type="dashed" 
                  onClick={() => {
                    const blankPhases = createBlankPhases();
                    setDefaultPhases(blankPhases);
                    
                    // Initialize with recommend goals as first goal
                    const initialGoals = {};
                    blankPhases.forEach((phase, index) => {
                      if (phase.recommendGoal && phase.recommendGoal.trim() !== '') {
                        initialGoals[index] = [phase.recommendGoal, ''];
                      } else {
                        initialGoals[index] = ['', ''];
                      }
                    });
                    setPhaseGoals(initialGoals);
                    
                    message.info('Đã tạo 3 giai đoạn mặc định');
                  }}
                  style={{ marginBottom: 16 }}
                >
                  ➕ Tạo giai đoạn mặc định
                </Button>
                )}
              </div>

              {loadingPhases ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Đang tải phases mặc định...</p>
                </div>
              ) : (
                <div>
                  {defaultPhases.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                      <Text type="secondary" style={{ fontSize: 16 }}>
                        � Chưa có phases nào được tải.
                      </Text>
                      <br />
                      <Text type="secondary">
                        Hãy nhấn nút "Tạo giai đoạn mặc định" ở trên để bắt đầu tạo phases cho kế hoạch.
                      </Text>
                    </div>
                  ) : (
                    <>
                      <Steps 
                        current={-1} 
                        direction="vertical"
                        style={{ marginBottom: 24 }}
                      >
                        {defaultPhases.map((phase, index) => (
                          <Steps.Step
                            key={index}
                            title={`${phase.name} (${phase.duration || 'Không xác định'})`}
                            description={phase.recommendGoal}
                          />
                        ))}
                      </Steps>

                      <Divider orientation="left">Tùy chỉnh mục tiêu cho từng giai đoạn</Divider>

                      {defaultPhases.map((phase, phaseIndex) => (
                        <Card 
                          key={phaseIndex}
                          type="inner" 
                          style={{ marginBottom: 16 }}
                          title={
                            <Space>
                              <Tag color="blue">{phase.phaseOrder}</Tag>
                              <span>{phase.name}</span>
                              <Text type="secondary">({phase.duration || 'Không xác định'})</Text>
                            </Space>
                          }
                        >
                          <div style={{ marginBottom: 12 }}>
                            <Text strong>Mục tiêu đề xuất: </Text>
                            <Text>{phase.recommendGoal}</Text>
                          </div>

                          <div>
                            <Text strong>Các mục tiêu cụ thể:</Text>
                            
                            {/* Show message if no goals */}
                            {(!phaseGoals[phaseIndex] || phaseGoals[phaseIndex].length === 0) ? (
                              <div style={{ marginTop: 8, marginBottom: 8 }}>
                                <Text type="secondary">Chưa có mục tiêu nào. Nhấn nút bên dưới để thêm.</Text>
                              </div>
                            ) : (
                              <List
                                size="small"
                                style={{ marginTop: 8 }}
                                dataSource={phaseGoals[phaseIndex] || []}
                                renderItem={(goal, goalIndex) => (
                                  <List.Item
                                    actions={[
                                      <Button 
                                        type="text" 
                                        danger 
                                        size="small"
                                        onClick={() => removePhaseGoal(phaseIndex, goalIndex)}
                                      >
                                        Xóa
                                      </Button>
                                    ]}
                                  >
                                    <Input
                                      value={goal}
                                      onChange={(e) => handlePhaseGoalChange(phaseIndex, goalIndex, e.target.value)}
                                      placeholder={`Mục tiêu ${goalIndex + 1}...`}
                                    />
                                  </List.Item>
                                )}
                              />
                            )}
                            
                            <Button 
                              type="dashed" 
                              onClick={() => addPhaseGoal(phaseIndex)}
                              style={{ width: '100%', marginTop: 8 }}
                            >
                              + Thêm mục tiêu
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}

                  {/* Phase Creation Actions */}
                  <Divider />
                  <div style={{ textAlign: 'center' }}>
                    <Space size="large">
                      <Button 
                        type="default" 
                        size="large"
                        onClick={() => setShowPhaseCreation(false)}
                      >
                        Quay lại chỉnh sửa kế hoạch
                      </Button>
                      {/* <Button 
                        size="large"
                        onClick={() => {
                          message.success('✅ Kế hoạch đã được tạo thành công!');
                          setTimeout(() => navigate(-1), 1500);
                        }}
                      >
                        ⏭️ Bỏ qua tạo phases chi tiết
                      </Button> */}
                      {defaultPhases.length > 0 && (
                        <Button 
                          type="primary" 
                          size="large"
                          loading={loadingPhases}
                          onClick={handleCreatePhases}
                          icon={<SaveOutlined />}
                        >
                          {loadingPhases ? 'Đang tạo phases...' : '🎯 Hoàn tất tạo phases'}
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default QuitPlanCreation;
