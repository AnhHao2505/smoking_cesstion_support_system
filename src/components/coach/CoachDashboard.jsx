import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
  Descriptions,
  Empty,
  DatePicker,
  TimePicker,
  Select
} from 'antd';
import VideoCallWithProps from '../videos/VideoCallWithProps';
import { AgoraProvider } from '../videos/AgoraContext';
import {
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getAssignedMembers, getCoachProfile } from '../../services/coachManagementService';
import { getFeedbacksForCoach } from '../../services/feebackService';
import { viewMemberNewestPlan, addFinalEvaluation } from '../../services/quitPlanService';
import { createCoachSchedule, getAvailableSchedulesOfCoach, getAppointmentsOfCoach, cancelAppointmentByCoach, completeAppointmentByCoach } from '../../services/appointmentService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CoachDashboard = () => {
  const { currentUser } = useAuth();
  const [coachProfile, setCoachProfile] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [coachRating, setCoachRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // State variables for plan view modal
  const [planViewModalVisible, setPlanViewModalVisible] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [evaluationForm] = Form.useForm();
  const [evaluationSubmitting, setEvaluationSubmitting] = useState(false);

  // State variables for schedule management
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [createScheduleModalVisible, setCreateScheduleModalVisible] = useState(false);
  const [scheduleForm] = Form.useForm();
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // State variables for appointments
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [cancelForm] = Form.useForm();
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Video call states
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [currentCallData, setCurrentCallData] = useState(null);
  const [endMeetingModalVisible, setEndMeetingModalVisible] = useState(false);

  // Always use current user's ID as coachId - this dashboard is only for the coach themselves
  const [coachId, setCoachId] = useState(null);

  // Set coachId when component loads
  useEffect(() => {
    if (currentUser?.role === 'COACH' && currentUser?.userId) {
      setCoachId(currentUser.userId);
    }
  }, [currentUser]);

  // Load schedules when coachId is available - moved before early returns
  useEffect(() => {
    if (coachId) {
      refreshSchedules();
      refreshAppointments();
    }
  }, [coachId]);

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
              workingHours: profileResponse.workingHour ? 
                Array.isArray(profileResponse.workingHour) ? 
                profileResponse.workingHour.map(hour => {
                  // Translate day names to Vietnamese
                  const dayInVietnamese = {
                    'Monday': 'Thứ Hai',
                    'Tuesday': 'Thứ Ba',
                    'Wednesday': 'Thứ Tư',
                    'Thursday': 'Thứ Năm',
                    'Friday': 'Thứ Sáu',
                    'Saturday': 'Thứ Bảy',
                    'Sunday': 'Chủ Nhật'
                  };
                  const day = dayInVietnamese[hour.dayOfWeek] || hour.dayOfWeek;
                  return `${day}: ${hour.startTime} - ${hour.endTime}`;
                }).join(', ') 
                : 'Thứ Hai - Thứ Sáu, 9:00 - 17:00' 
                : 'Thứ Hai - Thứ Sáu, 9:00 - 17:00',
              // Store the array separately for vertical display
              workingHoursArray: profileResponse.workingHour && Array.isArray(profileResponse.workingHour) ? 
                profileResponse.workingHour.map(hour => {
                  const dayInVietnamese = {
                    'Monday': 'Thứ Hai',
                    'Tuesday': 'Thứ Ba',
                    'Wednesday': 'Thứ Tư',
                    'Thursday': 'Thứ Năm',
                    'Friday': 'Thứ Sáu',
                    'Saturday': 'Thứ Bảy',
                    'Sunday': 'Chủ Nhật'
                  };
                  const day = dayInVietnamese[hour.dayOfWeek] || hour.dayOfWeek;
                  return `${day}: ${hour.startTime} - ${hour.endTime}`;
                }) 
                : null,
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
            isPlanRequested: Boolean(member.planRequested) || Boolean(member.isPlanRequested) || Boolean(member.hasPlanRequest),
            needFinalEvaluation: Boolean(member.needFinalEvaluation) || Boolean(member.hasFinalEvaluation),
          };
        });

        setAssignedMembers(transformedMembers);

        // Fetch feedback
        const feedbackResponse = await getFeedbacksForCoach(coachId);
        const feedbacks = feedbackResponse;
        if (feedbacks.length > 0) {
          setRecentFeedback(feedbacks.slice(0, 10));
          // Calculate average rating
          const ratings = feedbacks.map(fb => fb.rating ?? fb.star).filter(r => typeof r === 'number');
          if (ratings.length > 0) {
            const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            setCoachRating(Number(avg.toFixed(2)));
          } else {
            setCoachRating(0);
          }
        } else {
          setCoachRating(0);
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
          <Text type="secondary">Đang tải hồ sơ huấn luyện viên...</Text>
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
          workingHours: profileResponse.workingHour ? 
            Array.isArray(profileResponse.workingHour) ? 
            profileResponse.workingHour.map(hour => {
              // Translate day names to Vietnamese
              const dayInVietnamese = {
                'Monday': 'Thứ Hai',
                'Tuesday': 'Thứ Ba',
                'Wednesday': 'Thứ Tư',
                'Thursday': 'Thứ Năm',
                'Friday': 'Thứ Sáu',
                'Saturday': 'Thứ Bảy',
                'Sunday': 'Chủ Nhật'
              };
              const day = dayInVietnamese[hour.dayOfWeek] || hour.dayOfWeek;
              return `${day}: ${hour.startTime} - ${hour.endTime}`;
            }).join(', ') 
            : 'Thứ Hai - Thứ Sáu, 9:00 - 17:00' 
            : 'Thứ Hai - Thứ Sáu, 9:00 - 17:00',
          // Store the array separately for vertical display
          workingHoursArray: profileResponse.workingHour && Array.isArray(profileResponse.workingHour) ? 
            profileResponse.workingHour.map(hour => {
              const dayInVietnamese = {
                'Monday': 'Thứ Hai',
                'Tuesday': 'Thứ Ba',
                'Wednesday': 'Thứ Tư',
                'Thursday': 'Thứ Năm',
                'Friday': 'Thứ Sáu',
                'Saturday': 'Thứ Bảy',
                'Sunday': 'Chủ Nhật'
              };
              const day = dayInVietnamese[hour.dayOfWeek] || hour.dayOfWeek;
              return `${day}: ${hour.startTime} - ${hour.endTime}`;
            }) 
            : null,
          contactNumber: profileResponse.contactNumber || 'Not available'
        });
        message.success('Đã cập nhật thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      message.error('Không thể cập nhật thông tin hồ sơ');
    }
  };
  
  // Handler to view a member's current plan
  const handleViewMemberPlan = async (member) => {
    try {
      setPlanLoading(true);
      setCurrentMember(member);
      setPlanViewModalVisible(true);
      setCurrentPlan(null); // Reset current plan first
      
      const response = await viewMemberNewestPlan(member.user_id);
      console.log('Plan response:', response);
      
      // Debug log for field names - helps us identify what fields are available
      if (response && typeof response === 'object') {
        console.log('Plan fields available:', Object.keys(response));
        console.log('Progress data:', {
          progressInDay: response.progressInDay,
          durationInDays: response.durationInDays
        });
      }
      
      if (response && response.id) {
        // Use fields exactly as they are named in the API response
        const processedPlan = {
          ...response
        };
        
        setCurrentPlan(processedPlan);
        // Reset the evaluation form
        evaluationForm.resetFields();
      }
    } catch (error) {
      console.error('Error viewing member plan:', error);
    } finally {
      setPlanLoading(false);
    }
  };
  
  // Handler to submit final evaluation
  const handleSubmitEvaluation = async (values) => {
    if (!currentPlan || !currentPlan.id) {
      message.error('Không tìm thấy kế hoạch để đánh giá');
      return;
    }
    
    try {
      setEvaluationSubmitting(true);
      
      const result = await addFinalEvaluation(
        currentPlan.id, 
        values.finalEvaluation
      );
      
      if (result && result.success !== false) {
        message.success('Đã gửi đánh giá cuối cùng thành công');
        
        // Update the current plan with the evaluation
        setCurrentPlan({
          ...currentPlan,
          finalEvaluation: values.finalEvaluation
        });
        
        // Refresh the plan data to get the updated information
        handleViewMemberPlan(currentMember);
      } else {
        message.error('Không thể gửi đánh giá: ' + (result?.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      message.error('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setEvaluationSubmitting(false);
    }
  };

  // Schedule management functions
  const refreshSchedules = async () => {
    if (!coachId) return;
    
    try {
      setSchedulesLoading(true);
      const response = await getAvailableSchedulesOfCoach(coachId);
      setSchedules(response || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleCreateSchedule = async (values) => {
    try {
      setScheduleSubmitting(true);
      
      const startTime = values.startTime;
      const endTime = values.endTime;
      const selectedDate = values.date.format('YYYY-MM-DD');
      
      // Frontend validation 1: Validate time range - end time must be after start time
      if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
        message.error('Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
      }
      
      // Frontend validation 2: Validate at least 1 hour gap
      const durationInMinutes = endTime.diff(startTime, 'minutes');
      if (durationInMinutes < 60) {
        message.error('Khung giờ phải cách nhau ít nhất 1 tiếng!');
        return;
      }
      
      // Frontend validation 3: Check for duplicate/overlapping schedules
      const startHour = startTime.hour();
      const startMinute = startTime.minute();
      const endHour = endTime.hour();
      const endMinute = endTime.minute();
      
      const overlap = schedules.some(schedule => {
        // Only check active schedules on the same date
        if (!schedule.active || schedule.date !== selectedDate) {
          return false;
        }
        
        // Check if times exactly match existing schedule
        return (schedule.startHour === startHour && 
                schedule.startMinute === startMinute &&
                schedule.endHour === endHour && 
                schedule.endMinute === endMinute);
      });
      
      if (overlap) {
        message.error('Khung giờ này đã bị trùng với lịch hẹn khác!');
        return;
      }
      
      const scheduleData = {
        date: selectedDate,
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute
      };

      const response = await createCoachSchedule(scheduleData);
      
      if (response.success) {
        message.success('Tạo lịch hẹn thành công');
        setCreateScheduleModalVisible(false);
        scheduleForm.resetFields();
        refreshSchedules();
      } else {
        message.error(response.message || 'Không thể tạo lịch hẹn');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      message.error('Đã xảy ra lỗi khi tạo lịch hẹn');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Appointments management functions
  const refreshAppointments = async () => {
    if (!coachId) return;
    
    try {
      setAppointmentsLoading(true);
      const response = await getAppointmentsOfCoach();
      setAppointments(response || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Không thể tải danh sách cuộc hẹn');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleCancelAppointment = async (values) => {
    if (!currentAppointment) return;
    
    try {
      setCancelSubmitting(true);
      const response = await cancelAppointmentByCoach(currentAppointment.appointmentId, values.absenceReason);
      
      if (response.success !== false) {
        message.success('Hủy cuộc hẹn thành công');
        setCancelModalVisible(false);
        cancelForm.resetFields();
        refreshAppointments(); // Refresh the appointments list
      } else {
        message.error(response.message || 'Không thể hủy cuộc hẹn');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('Đã xảy ra lỗi khi hủy cuộc hẹn');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const showCancelModal = (appointment) => {
    setCurrentAppointment(appointment);
    setCancelModalVisible(true);
    cancelForm.resetFields();
  };

  // Video call functions
  const initiateVideoCall = async (appointment) => {
    try {
      if (!appointment?.appointmentId) {
        message.error('Không thể khởi tạo cuộc gọi - thiếu thông tin cuộc hẹn');
        return;
      }
      
      // Chuẩn bị data cho video call
      const callData = {
        channelName: `appointment-${appointment.appointmentId}`,
        userId: currentUser.userId,
        appointmentId: appointment.appointmentId,
        appointmentInfo: appointment
      };
      
      setCurrentCallData(callData);
      setIsVideoCallOpen(true);
      
      message.info('Đang khởi tạo cuộc gọi video...');
    } catch (error) {
      console.error('Error initiating video call:', error);
      message.error('Không thể khởi tạo cuộc gọi video');
    }
  };

  // Xử lý khi join video call thành công
  const handleVideoCallJoinSuccess = (credentials) => {
    console.log('Video call joined successfully:', credentials);
    message.success('Đã tham gia cuộc gọi video thành công');
  };

  // Xử lý khi join video call thất bại
  const handleVideoCallJoinError = (error) => {
    console.error('Video call join failed:', error);
    message.error(`Không thể tham gia cuộc gọi: ${error.message}`);
    setIsVideoCallOpen(false);
    setCurrentCallData(null);
  };

  // Xử lý khi rời khỏi video call
  const handleVideoCallLeave = async () => {
    console.log('Left video call');
    setEndMeetingModalVisible(true);
  };

  // Xử lý tạm dừng meeting (không call API)
  const handlePauseMeeting = () => {
    setEndMeetingModalVisible(false);
    setIsVideoCallOpen(false);
    setCurrentCallData(null);
    message.info('Đã tạm dừng cuộc gọi video');
  };

  // Xử lý kết thúc meeting (call API complete)
  const handleCompleteMeeting = async () => {
    try {
      // Nếu có thông tin cuộc hẹn, gọi API để hoàn thành cuộc hẹn
      if (currentCallData?.appointmentId) {
        console.log('Completing appointment:', currentCallData.appointmentId);
        
        const response = await completeAppointmentByCoach(currentCallData.appointmentId);
        
        if (response && response.success !== false) {
          message.success('Cuộc hẹn đã được đánh dấu hoàn thành');
          // Refresh appointments list to show updated status
          refreshAppointments();
        } else {
          message.warning('Không thể cập nhật trạng thái cuộc hẹn: ' + (response?.message || 'Lỗi không xác định'));
        }
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      message.error('Lỗi khi cập nhật trạng thái cuộc hẹn');
    }
    
    setEndMeetingModalVisible(false);
    setIsVideoCallOpen(false);
    setCurrentCallData(null);
    message.success('Đã kết thúc và hoàn thành cuộc hẹn');
  };

  // Show different loading state while determining coachId
  if (!coachId && currentUser?.role === 'COACH') {
    return (
      <div className="dashboard loading-container">
        <Spin size="large" />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary">Đang tải hồ sơ huấn luyện viên...</Text>
        </div>
      </div>
    );
  }

  // Fallback for missing coach profile data
  const profileData = coachProfile || {
    full_name: currentUser?.name || 'Coach',
    specialty: 'Chuyên gia cai thuốc lá',
    bio: 'Cam kết giúp mọi người bỏ thuốc lá thành công',
    rating: coachRating,
    photo_url: null,
    certificates: [],
    workingHours: 'Thứ Hai - Thứ Sáu, 9:00 - 17:00',
    workingHoursArray: ['Thứ Hai: 9:00 - 17:00', 'Thứ Ba: 9:00 - 17:00', 'Thứ Tư: 9:00 - 17:00', 'Thứ Năm: 9:00 - 17:00', 'Thứ Sáu: 9:00 - 17:00'],
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
          {/* Đã xóa nút "Theo dõi kế hoạch hiện tại" theo yêu cầu */}
        </Space>
      )
    }
  ];

  // Column configuration for schedule table
  const scheduleColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thời gian bắt đầu',
      key: 'startTime',
      render: (_, record) => `${record.startHour.toString().padStart(2, '0')}:${record.startMinute.toString().padStart(2, '0')}`
    },
    {
      title: 'Thời gian kết thúc',
      key: 'endTime', 
      render: (_, record) => `${record.endHour.toString().padStart(2, '0')}:${record.endMinute.toString().padStart(2, '0')}`
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.booked) {
          return <Tag color="red">Đã đặt</Tag>;
        } else if (record.active) {
          return <Tag color="green">Đang chờ</Tag>;
        }
      }
    }
  ];

  // Column configuration for appointments table
  const appointmentColumns = [
    {
      title: 'Ngày hẹn',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Không xác định'
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => {
        if (record.startHour !== undefined && record.startMinute !== undefined && 
            record.endHour !== undefined && record.endMinute !== undefined) {
          const startTime = `${record.startHour.toString().padStart(2, '0')}:${record.startMinute.toString().padStart(2, '0')}`;
          const endTime = `${record.endHour.toString().padStart(2, '0')}:${record.endMinute.toString().padStart(2, '0')}`;
          return `${startTime} - ${endTime}`;
        }
        return 'Không xác định';
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'appointmentStatus',
      render: (status) => {
        let color = 'default';
        let text = status || 'Không xác định';
        
        switch (status) {
          case 'BOOKED':
            color = 'blue';
            text = 'Đã lên lịch';
            break;
          case 'COMPLETED':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'CANCELLED':
            color = 'red';
            text = 'Đã hủy';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Đánh giá',
      key: 'feedback',
      render: (_, record) => {
        if (record.feedbackStars || record.feedbackComment) {
          return (
            <Space direction="vertical" size="small">
              {record.feedbackStars && (
                <Rate disabled value={record.feedbackStars} style={{ fontSize: '14px' }} />
              )}
              {record.feedbackComment && (
                <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                  "{record.feedbackComment}"
                </Text>
              )}
            </Space>
          );
        }
        return <Text type="secondary">Chưa có đánh giá</Text>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'BOOKED') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => initiateVideoCall(record)}
              >
                Vào meetings
              </Button>
              <Button
                danger
                size="small"
                onClick={() => showCancelModal(record)}
              >
                Hủy cuộc hẹn
              </Button>
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      }
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
          <Rate disabled value={coachRating} allowHalf />
          <div><Text strong>{coachRating}</Text> / 5.0</div>
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

              {/* {profileData.workingHours && (
                <div className="mb-3">
                  <Text strong>Giờ làm việc: </Text>
                  <div style={{ marginTop: 8, background: '#f9f9f9', padding: '8px 12px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                    {Array.isArray(profileData.workingHoursArray) ? 
                      profileData.workingHoursArray.map((hour, index) => (
                        <div key={index} style={{ marginBottom: 4, display: 'flex' }}>
                          <ClockCircleOutlined style={{ marginRight: 8, marginTop: 4 }} />
                          <Text>{hour}</Text>
                        </div>
                      ))
                    : 
                      <div style={{ display: 'flex' }}>
                        <ClockCircleOutlined style={{ marginRight: 8, marginTop: 4 }} />
                        <Text>{profileData.workingHours}</Text>
                      </div>
                    }
                  </div>
                </div>
              )} */}

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

        <TabPane tab={<span><CalendarOutlined /> Quản lý lịch hẹn</span>} key="3">
          <Card
            title="Schedule của tôi"
            extra={
              <Space>
                <Button
                  size="small"
                  onClick={refreshSchedules}
                  loading={schedulesLoading}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateScheduleModalVisible(true)}
                >
                  Tạo schedule
                </Button> 
              </Space>
            }
          >
            <Table
              dataSource={schedules}
              columns={scheduleColumns}
              rowKey="scheduleId"
              pagination={{ pageSize: 10 }}
              loading={schedulesLoading}
              locale={{
                emptyText: 'Chưa có lịch hẹn nào'
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ClockCircleOutlined /> Cuộc hẹn</span>} key="4">
          <Card
            title="Danh sách cuộc hẹn"
            extra={
              <Button
                size="small"
                onClick={refreshAppointments}
                loading={appointmentsLoading}
              >
                Làm mới
              </Button>
            }
          >
            <Table
              dataSource={appointments}
              columns={appointmentColumns}
              rowKey="appointmentId"
              pagination={{ pageSize: 10 }}
              loading={appointmentsLoading}
              locale={{
                emptyText: 'Chưa có cuộc hẹn nào'
              }}
            />
          </Card>
        </TabPane>   
      </Tabs>
      
      {/* Modal hiển thị kế hoạch hiện tại của thành viên */}
      <Modal
        title={
          <div>
            <span>Kế hoạch cai thuốc của </span>
            <span style={{ fontWeight: 'bold' }}>{currentMember?.full_name || 'Thành viên'}</span>
          </div>
        }
        open={planViewModalVisible}
        onCancel={() => setPlanViewModalVisible(false)}
        width={800}
        footer={null}
      >
        {planLoading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>Đang tải kế hoạch...</div>
          </div>
        ) : !currentPlan ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Empty 
              description={<span>Không có kế hoạch</span>} 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
            <div style={{ marginTop: '20px', maxWidth: '450px', margin: '0 auto' }}>
              <Alert
                message="Không tìm thấy kế hoạch"
                description="Thành viên này hiện chưa có kế hoạch cai thuốc nào. Bạn có thể tạo kế hoạch mới cho họ."
                type="info"
                showIcon
              />
            </div>
          </div>
        ) : (
          <div className="plan-details">
            <Descriptions title="Thông tin kế hoạch" bordered column={2}>
              <Descriptions.Item label="ID kế hoạch" span={1}>
                {currentPlan.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  currentPlan.quitPlanStatus === 'COMPLETED' ? 'green' :
                  currentPlan.quitPlanStatus === 'IN_PROGRESS' ? 'blue' :
                  currentPlan.quitPlanStatus === 'PENDING' ? 'orange' :
                  currentPlan.quitPlanStatus === 'FAILED' ? 'red' : 'default'
                }>
                  {currentPlan.quitPlanStatus === 'COMPLETED' ? 'Hoàn thành' :
                   currentPlan.quitPlanStatus === 'IN_PROGRESS' ? 'Đang tiến hành' :
                   currentPlan.quitPlanStatus === 'PENDING' ? 'Đang chờ' :
                   currentPlan.quitPlanStatus === 'FAILED' ? 'Thất bại' : 
                   currentPlan.quitPlanStatus || 'Không xác định'}
                </Tag>
              </Descriptions.Item>
              
              
              <Descriptions.Item label="Tiến độ thực hiện" span={2}>
                <div style={{ marginBottom: 5 }}>
                  <Text>{currentPlan.progressInDay || 0} / {currentPlan.durationInDays || 30} ngày</Text>
                </div>
                <Progress 
                  percent={Math.min(100, Math.round(((currentPlan.progressInDay || 0) / (currentPlan.durationInDays || 30)) * 100))} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  status={currentPlan.quitPlanStatus === 'COMPLETED' ? 'success' : 'active'}
                />
              </Descriptions.Item>       
              
              {currentPlan.completionQuality && (
                <Descriptions.Item label="Mức độ hoàn thành" span={2}>
                  <Tag color={
                    currentPlan.completionQuality.toLowerCase().includes('xuất sắc') ? '#52c41a' :
                    currentPlan.completionQuality.toLowerCase().includes('tốt') ? '#73d13d' :
                    currentPlan.completionQuality.toLowerCase().includes('khá') ? '#bae637' :
                    '#faad14'
                  }>
                    {currentPlan.completionQuality}
                  </Tag>
                </Descriptions.Item>
              )}
              
              {currentPlan.finalEvaluation && (
                <Descriptions.Item label="Đánh giá cuối cùng" span={2}>
                  <div style={{ 
                    whiteSpace: 'pre-line',
                    padding: '8px 12px',
                    background: '#f9f9f9',
                    border: '1px solid #e8e8e8',
                    borderRadius: '4px',
                    fontStyle: 'italic'
                  }}>
                    {currentPlan.finalEvaluation}
                  </div>
                </Descriptions.Item>
              )}
            
              <Descriptions.Item label="Tình trạng hút thuốc ban đầu">
                <Tag color={
                  currentPlan.currentSmokingStatus === 'NONE' ? 'green' :
                  currentPlan.currentSmokingStatus === 'LIGHT' ? 'cyan' :
                  currentPlan.currentSmokingStatus === 'MODERATE' ? 'orange' :
                  currentPlan.currentSmokingStatus === 'SEVERE' ? 'red' : 'default'
                }>
                  {currentPlan.currentSmokingStatus === 'NONE' ? 'Không hút thuốc' :
                   currentPlan.currentSmokingStatus === 'LIGHT' ? 'Nhẹ' :
                   currentPlan.currentSmokingStatus === 'MODERATE' ? 'Trung bình' :
                   currentPlan.currentSmokingStatus === 'SEVERE' ? 'Nặng' : 
                   currentPlan.currentSmokingStatus || 'Không xác định'}
                </Tag>
              </Descriptions.Item>  

              <Descriptions.Item label="Thời gian kế hoạch" span={2}>
                {currentPlan.durationInDays || 30} ngày
              </Descriptions.Item>  

              <Descriptions.Item label="Ngày bắt đầu">
                {currentPlan.startDate || currentPlan.start_date ? new Date(currentPlan.startDate || currentPlan.start_date).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc dự kiến">
                {currentPlan.endDate || currentPlan.end_date ? new Date(currentPlan.endDate || currentPlan.end_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
              </Descriptions.Item>

            </Descriptions>
            
            <Divider orientation="left">Chi tiết kế hoạch</Divider>
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mục tiêu cai thuốc" span={2}>
                {currentPlan.goal || currentPlan.motivation || 'Không có mục tiêu cụ thể'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Mô tả" span={2}>
                {currentPlan.description || 'Không có mô tả'}
              </Descriptions.Item>
                      
              <Descriptions.Item label="Chiến lược đối phó" span={2}>
                {currentPlan.copingStrategies || 'Không có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Yếu tố kích thích cần tránh" span={2}>
                {currentPlan.smokingTriggersToAvoid || 'Không có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Chiến lược phòng ngừa tái phát" span={2}>
                {currentPlan.relapsePreventionStrategies || 'Không có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Kế hoạch thưởng" span={2}>
                {currentPlan.rewardPlan || 'Không có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Thuốc men sử dụng" span={1}>
                {currentPlan.medicationsToUse || 'Không có'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Hướng dẫn sử dụng thuốc" span={1}>
                {currentPlan.medicationInstructions || 'Không có'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Nguồn hỗ trợ" span={2}>
                {currentPlan.supportResources || 'Không có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ghi chú bổ sung" span={2}>
                {currentPlan.additionalNotes || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>
            
            {currentPlan.quitPlanStatus === 'COMPLETED' && !currentPlan.finalEvaluation && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                <Title level={4} style={{ marginBottom: '16px' }}>
                  <FileTextOutlined /> Thêm đánh giá cuối cùng
                </Title>
                <Form form={evaluationForm} onFinish={handleSubmitEvaluation} layout="vertical">
                  <Form.Item
                    name="finalEvaluation"
                    label="Đánh giá cuối cùng của huấn luyện viên"
                    rules={[{ required: true, message: 'Vui lòng nhập đánh giá của bạn' }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Nhập đánh giá cuối cùng của bạn về tiến trình và kết quả của kế hoạch cai thuốc này..."
                      style={{
                        background: '#f9f9f9',
                        border: '1px solid #e8e8e8',
                        borderRadius: '4px'
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<CheckCircleOutlined />}
                      loading={evaluationSubmitting}
                    >
                      Gửi đánh giá
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
            
            {currentPlan.quitPlanStatus !== 'COMPLETED' && (
              <Alert
                style={{ marginTop: '20px' }}
                message="Lưu ý"
                description="Bạn chỉ có thể thêm đánh giá cuối cùng khi kế hoạch đã hoàn thành."
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Modal tạo lịch hẹn */}
      <Modal
        title="Tạo lịch hẹn mới"
        open={createScheduleModalVisible}
        onCancel={() => {
          setCreateScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={handleCreateSchedule}
        >
          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Thời gian bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Chọn giờ bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Thời gian kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Chọn giờ kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={scheduleSubmitting}
                icon={<PlusOutlined />}
              >
                Tạo lịch hẹn
              </Button>
              <Button
                onClick={() => {
                  setCreateScheduleModalVisible(false);
                  scheduleForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Video Call Modal */}
      {isVideoCallOpen && currentCallData && (
        <Modal
          title={`Video Call - Appointment ${currentCallData.appointmentId}`}
          open={isVideoCallOpen}
          onCancel={handleVideoCallLeave}
          footer={null}
          width="90%"
          style={{ top: 20 }}
          bodyStyle={{ padding: 0, height: '80vh' }}
          destroyOnClose={true}
        >
          <VideoCallWithProps
            channelName={currentCallData.channelName}
            userId={currentCallData.userId}
            appointmentId={currentCallData.appointmentId}
            onJoinSuccess={handleVideoCallJoinSuccess}
            onJoinError={handleVideoCallJoinError}
            onLeave={handleVideoCallLeave}
          />
        </Modal>
      )}

      {/* End Meeting Confirmation Modal */}
      <Modal
        title="Xác nhận kết thúc cuộc họp"
        open={endMeetingModalVisible}
        onCancel={() => setEndMeetingModalVisible(false)}
        footer={[
          <Button key="pause" onClick={handlePauseMeeting}>
            Tạm dừng meeting
          </Button>,
          <Button key="complete" type="primary" onClick={handleCompleteMeeting}>
            Kết thúc
          </Button>
        ]}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text>Khi kết thúc sẽ hoàn thành meeting</Text>
        </div>
      </Modal>
    </div>
  );
};

// Export với AgoraProvider wrapper
const CoachDashboardWithAgora = () => (
  <AgoraProvider>
    <CoachDashboard />
  </AgoraProvider>
);

export default CoachDashboardWithAgora;