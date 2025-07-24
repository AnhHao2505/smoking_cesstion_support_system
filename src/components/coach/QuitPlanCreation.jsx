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

  // Auto-fetch phases when we have created plan and addiction level
  useEffect(() => {
    console.log('=== USEEFFECT AUTO-FETCH TRIGGER ===');
    console.log('useEffect dependencies changed:', {
      createdPlanId: createdPlanId,
      showPhaseCreation: showPhaseCreation,
      memberAddictionLevel: memberAddictionLevel
    });
    
    if (createdPlanId && showPhaseCreation && memberAddictionLevel) {
      console.log('=== USEEFFECT: FETCHING PHASES ===');
      console.log('Auto-fetching default phases for plan:', createdPlanId, 'addiction level:', memberAddictionLevel);
      fetchDefaultPhases(memberAddictionLevel);
    } else {
      console.log('=== USEEFFECT: CONDITIONS NOT MET ===');
      console.log('Missing conditions:', {
        createdPlanId: !createdPlanId ? 'MISSING' : 'OK',
        showPhaseCreation: !showPhaseCreation ? 'MISSING' : 'OK',
        memberAddictionLevel: !memberAddictionLevel ? 'MISSING' : 'OK'
      });
    }
    console.log('=== END USEEFFECT ===');
  }, [createdPlanId, showPhaseCreation, memberAddictionLevel]);

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
      
      // Backend returns List<QuitPhaseDTO> directly
      let phasesData = [];
      
      if (response && Array.isArray(response)) {
        phasesData = response;
      } else {
        console.warn('Unexpected response format:', response);
        phasesData = [];
      }
      
      // If no valid response data, create default phases
      if (!phasesData || phasesData.length === 0) {
        console.log('No default phases found, creating fallback phases');
        phasesData = [
          {
            "id": null,
            "name": "Chuẩn bị bỏ thuốc",
            "duration": "Ngày 1–5",
            "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
            "goals": [],
            "phaseOrder": 1
          },
          {
            "phaseOrder": 1
          },
          {
            "id": null,
            "name": "Bắt đầu bỏ thuốc",
            "duration": "Ngày 6–20",
            "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
            "goals": [],
            "phaseOrder": 2
          },
          {
            "id": null,
            "name": "Duy trì",
            "duration": "Ngày 21–90",
            "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
            "goals": [],
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
      
      // Fallback: create default phases
      const defaultPhasesData = [
        {
          "id": null,
          "name": "Chuẩn bị bỏ thuốc",
          "duration": "Ngày 1–5",
          "recommendGoal": "Xác định lý do, chọn ngày bỏ thuốc, loại bỏ vật dụng liên quan",
          "goals": [],
          "phaseOrder": 1
        },
        {
          "id": null,
          "name": "Bắt đầu bỏ thuốc",
          "duration": "Ngày 6–20",
          "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
          "goals": [],
          "phaseOrder": 2
        },
        {
          "id": null,
          "name": "Duy trì",
          "duration": "Ngày 21–90",
          "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
          "goals": [],
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
        "goals": [],
        "phaseOrder": 1
      },
      {
        "id": null,
        "name": "Bắt đầu bỏ thuốc",
        "duration": "Ngày 6–20",
        "recommendGoal": "Không hút thuốc, ghi nhận cơn thèm, thay thế bằng hoạt động tích cực",
        "goals": [],
        "phaseOrder": 2
      },
      {
        "id": null,
        "name": "Duy trì",
        "duration": "Ngày 21–90",
        "recommendGoal": "Kiểm soát trigger, theo dõi thành quả, giữ vững quyết tâm",
        "goals": [],
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

      // Backend returns ApiMessageResponse with {success: boolean, message: string}
      if (response && response.success === true) {
        message.success(`🎉 ${response.message || 'Tạo phases thành công! Kế hoạch đã được hoàn thiện.'}`);
        
        // Navigate back after short delay
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        const errorMessage = response?.message || 'Có lỗi xảy ra khi tạo phases';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error creating phases:', error);
      
      // Handle API error response
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo phases';
      
      if (errorMessage.includes('Không tìm thấy kế hoạch bỏ thuốc tương ứng')) {
        message.error('❌ ID kế hoạch không hợp lệ. Kế hoạch đã được tạo nhưng không thể thêm phases chi tiết.');
        message.info('💡 Bạn có thể quay lại dashboard và chỉnh sửa kế hoạch để thêm phases sau.');
      } else {
        message.error(`❌ ${errorMessage}`);
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

    // Validate duration
    const duration = parseInt(values.durationInDays);
    if (isNaN(duration) || duration < 1 || duration > 365) {
      message.error('Thời lượng kế hoạch phải từ 1-365 ngày');
      return;
    }

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
        
        // Extract plan ID from QuitPlanCreationResponse format
        const planId = response.planId;
        console.log('=== PLAN ID EXTRACTION ===');
        console.log('Extracted planId:', planId);
        console.log('Type of planId:', typeof planId);
        console.log('=== END EXTRACTION ===');
        
        console.log('Extracted plan ID:', planId);
            
        if (planId) {
          setCreatedPlanId(planId);
          setShowPhaseCreation(true);
          
          // According to the flow: Plan created → Show member sidebar to get AddictionLevel → Get default phases
          console.log('Plan created successfully with ID:', planId);
          console.log('Now need to get member addiction level to determine phase template...');
          
          // Note: We need member's AddictionLevel (from MemberSmokingStatusSidebar) 
          // to call getDefaultPhases(AddictionLevel), not currentSmokingStatus from form
          message.info('✅ Kế hoạch đã tạo! Hệ thống đang tự động tải template phases dựa trên mức độ nghiện của thành viên...');
          
          // If we already have addiction level, fetch phases immediately
          if (memberAddictionLevel) {
            console.log('Already have addiction level, fetching phases immediately:', memberAddictionLevel);
            fetchDefaultPhases(memberAddictionLevel);
          }
        } else {
          // If no plan ID found, skip phase creation and navigate back
          message.warning('⚠️ Kế hoạch đã được tạo nhưng không thể tạo phases chi tiết. Bạn có thể tạo phases sau.');
          // TEMPORARILY COMMENTED OUT FOR DEBUGGING
          // setTimeout(() => {
          //   navigate(-1);
          // }, 2000);
          console.log('=== WOULD NAVIGATE BACK DUE TO NO PLAN ID ===');
        }
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
          console.log('=== ONADDICTIONLEVELCHANGE CALLED ===');
          console.log('Received addiction level:', addictionLevel);
          console.log('Current state - createdPlanId:', createdPlanId);
          console.log('Current state - showPhaseCreation:', showPhaseCreation);
          console.log('=== END ONADDICTIONLEVELCHANGE ===');
          
          setMemberAddictionLevel(addictionLevel);
          
          // Only auto-fetch phases if we have a created plan and are in phase creation mode
          if (createdPlanId && showPhaseCreation && addictionLevel) {
            console.log('=== AUTO-FETCHING PHASES ===');
            console.log('Conditions met for auto-fetch:', {
              createdPlanId: !!createdPlanId,
              showPhaseCreation: showPhaseCreation,
              addictionLevel: addictionLevel
            });
            fetchDefaultPhases(addictionLevel);
          } else {
            console.log('=== AUTO-FETCH SKIPPED ===');
            console.log('Conditions not met:', {
              createdPlanId: !!createdPlanId,
              showPhaseCreation: showPhaseCreation, 
              addictionLevel: !!addictionLevel
            });
          }
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
          {!showPhaseCreation && (
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                  currentSmokingStatus: 'NONE',
                  durationInDays: Number(30) // Đảm bảo là primitive number
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
                            // Parse to number immediately
                            const numValue = Number(value);
                            console.log('Input changed to:', numValue, 'Type:', typeof numValue);
                            form.setFieldsValue({ 
                              durationInDays: numValue 
                            });
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
