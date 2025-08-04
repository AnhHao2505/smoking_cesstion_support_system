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
import { createQuitPlan, createQuitPlanByMember, getNewestQuitPlan } from '../../services/quitPlanService';
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
  const isCoach = user?.role === 'COACH';
  const isMember = user?.role === 'MEMBER';

  // Set member ID from URL on component mount and fetch assigned members (only for coach)
  useEffect(() => {
    if (isCoach) {
      if (memberIdFromUrl) {
        setSelectedMemberId(memberIdFromUrl);
        form.setFieldsValue({ memberId: memberIdFromUrl });
      }
      fetchAssignedMembers();
    } else if (isMember) {
      // For members, set their own userId as selectedMemberId
      setSelectedMemberId(user?.userId || '');
    }
  }, [memberIdFromUrl, coachId, form, isCoach, isMember, user?.userId]);

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
    // Only fetch assigned members for coaches
    if (!coachId || !isCoach) return;
    
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
    // VALIDATION GUARD: All validation must pass before ANY processing
    let hasValidationErrors = false;
    
    // CRITICAL: Check plan ID first - stop immediately if missing
    if (!createdPlanId) {
      hasValidationErrors = true;
      message.error('❌ Không tìm thấy ID kế hoạch. Không thể tạo giai đoạn.');
      return; // STOP EXECUTION immediately
    }

    // Enhanced phase validation
    const validationErrors = [];
    const phaseValidationDetails = [];

    // CRITICAL: Check if we have any phases at all
    if (!defaultPhases || defaultPhases.length === 0) {
      hasValidationErrors = true;
      message.error('❌ Không có giai đoạn nào để tạo. Vui lòng tải lại trang.');
      return; // STOP EXECUTION immediately
    }

    // Validate each phase - strict validation
    defaultPhases.forEach((phase, phaseIndex) => {
      const phaseErrors = [];
      
      // Check phase basic info
      if (!phase.name || phase.name.trim() === '') {
        phaseErrors.push('Tên giai đoạn không được để trống');
      }
      
      if (!phase.duration || phase.duration.trim() === '') {
        phaseErrors.push('Thời gian giai đoạn không được để trống');
      }

      // Validate goals for this phase
      const goals = phaseGoals[phaseIndex]?.filter(goal => goal && goal.trim() !== '') || [];
      
      if (goals.length === 0) {
        phaseErrors.push('Cần có ít nhất một mục tiêu');
      } else {
        // Validate each goal strictly
        goals.forEach((goal, goalIndex) => {
          if (goal.length > 500) {
            phaseErrors.push(`Mục tiêu ${goalIndex + 1} không được vượt quá 500 ký tự`);
          }
          if (goal.length < 5) {
            phaseErrors.push(`Mục tiêu ${goalIndex + 1} quá ngắn (tối thiểu 5 ký tự)`);
          }
        });

        // Check for duplicate goals
        const uniqueGoals = [...new Set(goals.map(g => g.trim().toLowerCase()))];
        if (uniqueGoals.length !== goals.length) {
          phaseErrors.push('Có mục tiêu trùng lặp trong giai đoạn này');
        }
      }

      if (phaseErrors.length > 0) {
        phaseValidationDetails.push({
          phaseIndex: phaseIndex + 1,
          phaseName: phase.name || `Giai đoạn ${phaseIndex + 1}`,
          errors: phaseErrors
        });
      }
    });

    // CRITICAL: Stop immediately if detailed phase validation fails
    if (phaseValidationDetails.length > 0) {
      hasValidationErrors = true;
      const errorContent = (
        <div>
          <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
            ❌ Vui lòng kiểm tra lại các giai đoạn:
          </div>
          {phaseValidationDetails.map((phaseDetail, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                {phaseDetail.phaseName}:
              </div>
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                {phaseDetail.errors.map((error, errorIndex) => (
                  <li key={errorIndex} style={{ fontSize: '13px' }}>{error}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

      message.error({
        content: errorContent,
        duration: 8,
        style: { maxWidth: '500px' }
      });
      return; // STOP EXECUTION - Do not proceed further
    }

    // CRITICAL: Stop immediately if general validation errors exist
    if (validationErrors.length > 0) {
      hasValidationErrors = true;
      message.error({
        content: (
          <div>
            <div style={{ marginBottom: 8 }}>❌ Lỗi tạo giai đoạn:</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 5
      });
      return; // STOP EXECUTION - Do not proceed further
    }

    // FINAL VALIDATION GUARD: Absolutely no processing if any validation failed
    if (hasValidationErrors) {
      console.error('❌ PHASE VALIDATION FAILED - Stopping all execution');
      return; // FINAL STOP - No processing whatsoever
    }

    // ONLY proceed with phase creation if ALL validations pass
    console.log('✅ All phase validations passed - proceeding with creation');
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
    
    // VALIDATION GUARD: All validation must pass before ANY processing
    let hasValidationErrors = false;
    
    // Enhanced form validation - ALL FIELDS REQUIRED
    const validationErrors = [];
    
    // Get memberId from form values or state - different logic for coach vs member
    const memberId = isCoach ? (values.memberId || selectedMemberId) : (user?.userId);
    console.log('Final memberId to use:', memberId);
    console.log('User role:', user?.role);

    // Different validation for coach vs member
    if (isCoach && !memberId) {
      console.log('ERROR: Coach - No member ID found');
      validationErrors.push('Vui lòng chọn thành viên');
    } else if (isMember && !memberId) {
      console.log('ERROR: Member - No user ID found');
      validationErrors.push('Lỗi hệ thống: Không tìm thấy thông tin người dùng');
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
        formData,
        userRole: user?.role
      });

      // Use different API calls based on user role
      let response;
      if (isCoach) {
        console.log('Using COACH service: createQuitPlan');
        response = await createQuitPlan(memberId, formData);
      } else if (isMember) {
        console.log('Using MEMBER service: createQuitPlanByMember');
        response = await createQuitPlanByMember(formData);
      } else {
        throw new Error('Unauthorized role: ' + user?.role);
      }
      
      console.log('Quit plan creation response:', response);

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
        // Different success messages and flows for coach vs member
        if (isCoach) {
          message.success('🎉 Tạo kế hoạch cai thuốc thành công!');
          
          // Extract plan ID from QuitPlanCreationResponse format
          const planId = response.planId;
          console.log('=== PLAN ID EXTRACTION ===');
          console.log('Extracted planId:', planId);
          console.log('Type of planId:', typeof planId);
          console.log('=== END EXTRACTION ===');
          
          console.log('Extracted plan ID:', planId);
              
          if (planId) {
            // setCreatedPlanId(planId);
            // setShowPhaseCreation(false);
            
            // // According to the flow: Plan created → Show member sidebar to get AddictionLevel → Get default phases
            // console.log('Plan created successfully with ID:', planId);
            // console.log('Now need to get member addiction level to determine phase template...');
            
            // // Note: We need member's AddictionLevel (from MemberSmokingStatusSidebar) 
            // // to call getDefaultPhases(AddictionLevel), not currentSmokingStatus from form
            // message.info('✅ Kế hoạch đã tạo! Hệ thống đang tự động tải template phases dựa trên mức độ nghiện của thành viên...');
            
            // // If we already have addiction level, fetch phases immediately
            // if (memberAddictionLevel) {
            //   console.log('Already have addiction level, fetching phases immediately:', memberAddictionLevel);
            //   fetchDefaultPhases(memberAddictionLevel);
            // }
          } else {
            // If no plan ID found, skip phase creation and navigate back
            message.warning('⚠️ Kế hoạch đã được tạo nhưng không thể tạo phases chi tiết. Bạn có thể tạo phases sau.');
            // TEMPORARILY COMMENTED OUT FOR DEBUGGING
            // setTimeout(() => {
            //   navigate(-1);
            // }, 2000);
            console.log('=== WOULD NAVIGATE BACK DUE TO NO PLAN ID ===');
          }
        } else if (isMember) {
          // Member created their own plan - different flow
          message.success('🎉 Tạo kế hoạch cai thuốc thành công! Kế hoạch của bạn đã được lưu.');
          
          const planId = response.planId;
          if (planId) {
            // // For members, we can also show phase creation if they want to customize
            // setCreatedPlanId(planId);
            // setShowPhaseCreation(true);
            
            // // Members can customize their own plan phases
            // message.info('✅ Bạn có thể tùy chỉnh các giai đoạn cho kế hoạch của mình...');
            
            // // Use member's form addiction level for phase creation
            // const memberFormAddictionLevel = values.currentSmokingStatus || 'NONE';
            // console.log('Member form addiction level:', memberFormAddictionLevel);
            // setMemberAddictionLevel(memberFormAddictionLevel);
            // fetchDefaultPhases(memberFormAddictionLevel);
          } else {
            // Navigate to member dashboard to view their plan
            message.info('Chuyển đến dashboard để xem kế hoạch của bạn...');
            setTimeout(() => {
              navigate('/member/dashboard');
            }, 2000);
          }
        }
      } else {
        // Handle error response from QuitPlanCreationResponse
        const errorMessage = response?.message || 'Có lỗi xảy ra khi tạo kế hoạch';
        
        if (isCoach) {
          // Coach-specific error messages
          if (errorMessage.includes('chưa nhận được yêu cầu từ thành viên')) {
            message.error('❌ Thành viên chưa gửi yêu cầu tạo kế hoạch. Vui lòng yêu cầu thành viên gửi request trước.');
            message.info('💡 Thành viên cần vào dashboard và nhấn "Yêu cầu tạo kế hoạch" trước khi coach có thể tạo.');
          } else if (errorMessage.includes('Không tồn tại mối liên hệ')) {
            message.error('❌ Không có mối liên hệ coach-member. Vui lòng kiểm tra lại.');
          } else {
            message.error(`❌ ${errorMessage}`);
          }
        } else if (isMember) {
          // Member-specific error messages
          message.error(`❌ Không thể tạo kế hoạch: ${errorMessage}`);
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
      {/* Smoking Status Sidebar - Only show for coaches */}
      {isCoach && (
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
      )}
      
      <Content style={{ padding: '24px', marginLeft: isCoach ? '390px' : '0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <Card className="header-card" style={{ marginBottom: 24, textAlign: 'center' }}>
            <Space direction="vertical" size="middle">
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                ✨ {isCoach ? 'Tạo Kế Hoạch Cai Thuốc' : 'Tạo Kế Hoạch Cai Thuốc Của Tôi'}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 16 }}>
                {isCoach 
                  ? 'Tạo kế hoạch cai thuốc cá nhân hóa và khoa học cho thành viên của bạn'
                  : 'Tạo kế hoạch cai thuốc cá nhân hóa và khoa học cho chính bạn'
                }
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
            <>
              {/* Form Guidelines */}
              <Alert
                message="📋 Yêu cầu điền form - TẤT CẢ TRƯỜNG ĐỀU BẮT BUỘC"
                description={
                  <div>
                    <p><strong>⚠️ Lưu ý quan trọng:</strong> Tất cả các trường thông tin đều phải được điền đầy đủ</p>
                    <p><strong>📝 Bắt buộc điền:</strong> {isCoach ? 'Thành viên, t' : 'T'}ình trạng hút thuốc, thời lượng, thuốc, hướng dẫn, trigger, chiến lược, phòng ngừa, hỗ trợ, động lực, thưởng, ghi chú</p>
                    <p><strong>🚫 Không thể tạo kế hoạch:</strong> Nếu bỏ trống bất kỳ trường nào</p>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
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
              {/* Member Selection - Only show for coaches */}
              {isCoach && (
                <Card type="inner" style={{ marginBottom: 24 }}>
                  <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                    <UserOutlined /> Chọn Thành Viên
                  </Title>
                  
                  <Form.Item
                    label="Thành viên"
                    name="memberId"
                    rules={isCoach ? [{ required: true, message: 'Vui lòng chọn thành viên' }] : []}
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
              )}

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
                    placeholder={isCoach 
                      ? "Kế hoạch xử lý khi có nguy cơ tái nghiện: nhận biết dấu hiệu sớm, liên hệ coach, sử dụng kỹ thuật khẩn cấp..."
                      : "Kế hoạch xử lý khi có nguy cơ tái nghiện: nhận biết dấu hiệu sớm, tìm sự hỗ trợ, sử dụng kỹ thuật khẩn cấp..."
                    }
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
                    placeholder={isCoach 
                      ? "Ghi chú thêm về tình trạng sức khỏe, tiền sử bệnh, mối quan tâm đặc biệt của thành viên..."
                      : "Ghi chú thêm về tình trạng sức khỏe, tiền sử bệnh, mối quan tâm đặc biệt của bạn..."
                    }
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
                    {loading ? 'Đang tạo...' : (isCoach ? '🚀 Tạo Kế Hoạch' : '🚀 Tạo Kế Hoạch Của Tôi')}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
          </>
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
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 500) {
                                          handlePhaseGoalChange(phaseIndex, goalIndex, value);
                                        }
                                      }}
                                      placeholder={`Mục tiêu ${goalIndex + 1}... (tối thiểu 5 ký tự, tối đa 500 ký tự)`}
                                      maxLength={500}
                                      showCount={goal && goal.length > 0}
                                      status={goal && goal.trim().length > 0 && goal.trim().length < 5 ? 'error' : ''}
                                    />
                                    {goal && goal.trim().length > 0 && goal.trim().length < 5 && (
                                      <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                                        Mục tiêu quá ngắn (tối thiểu 5 ký tự)
                                      </div>
                                    )}
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
