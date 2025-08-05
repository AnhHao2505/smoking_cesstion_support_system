
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  DatePicker,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Form,
  Input,
  message,
  Spin,
  Alert,
  Tag,
  Avatar,
  Divider,
  Calendar,
  Badge
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getAllCoaches } from '../../services/coachManagementService';
import { 
  getAvailableSchedulesOfCoach, 
  generateTimeSlots, 
  groupSlotsByPeriod,
  getAppointmentsOfMember,
  bookAppointmentBySchedule
} from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BookingSteps = ({ visible, onCancel, onSuccess, selectedCoach: selectedCoachProp }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  
  // Step data
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(selectedCoachProp || null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState({});
  
  // Data states
  const [coaches, setCoaches] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Steps definition
  const steps = [
    {
      title: 'Chọn ngày',
      icon: <CalendarOutlined />,
      description: 'Chọn ngày hẹn'
    },
    {
      title: 'Chọn giờ',
      icon: <ClockCircleOutlined />,
      description: 'Chọn khung giờ'
    },
    {
      title: 'Thông tin',
      icon: <UserOutlined />,
      description: 'Nhập thông tin'
    },
    {
      title: 'Xác nhận',
      icon: <CheckCircleOutlined />,
      description: 'Xác nhận đặt lịch'
    }
  ];
  

  // Đặt lịch hẹn bằng scheduleId
  const handleConfirmBooking = async () => {
    try {
      setBooking(true);
      console.log('Attempting to book appointment with selectedSlot:', selectedSlot);
      let mockScheduleId = 1; // Mặc định nếu không có scheduleId
      if (!selectedSlot?.scheduleId) {
        setBooking(false);
      }else {
        mockScheduleId = selectedSlot.scheduleId;
      }
      console.log('Booking appointment with scheduleId:', mockScheduleId);
      const response = await bookAppointmentBySchedule(mockScheduleId);
      console.log('Booking response:', response);
      if (response) {
        message.success('Đã đặt lịch thành công!');
        setTimeout(() => {
          window.location.href = '/member/chat';
        }, 1500);
        if (onSuccess) {
          onSuccess(response);
        }
        handleModalClose();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Không thể đặt lịch hẹn. Vui lòng thử lại!');
      }
    } finally {
      setBooking(false);
    }
  };



  useEffect(() => {
      console.log(selectedCoachProp);
    if (visible) {
      fetchCoaches();
      // Nếu có selectedCoachProp truyền vào thì set lại khi mở modal
      setSelectedCoach(selectedCoachProp || null);
    }
  }, [visible, selectedCoachProp]);

  // Khi chọn coach hoặc ngày, load slot cho coach đó
  useEffect(() => {
    if (selectedDate && selectedCoach) {
      generateAvailableSlotsForCoach(selectedCoach);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedCoach]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(0, 50);
      if (response && response.content) {
        setCoaches(response.content);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
      message.error('Không thể tải danh sách huấn luyện viên');
    } finally {
      setLoading(false);
    }
  };

  // Lấy schedule khả dụng của coach được chọn
  const generateAvailableSlotsForCoach = async (coach) => {
    if (!selectedDate || !coach) return;
    try {
      setLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const schedules = await getAvailableSchedulesOfCoach(coach.coachId);
      // Filter schedules by exact date match
      const daySchedules = (Array.isArray(schedules) ? schedules : []).filter(sch => sch.date === dateStr && sch.active);
      const coachSlots = daySchedules.map(sch => ({
        scheduleId: sch.scheduleId,
        coachId: sch.coachId,
        coachName: coach.name,
        startTime: `${sch.startHour.toString().padStart(2, '0')}:${sch.startMinute.toString().padStart(2, '0')}`,
        endTime: `${sch.endHour.toString().padStart(2, '0')}:${sch.endMinute.toString().padStart(2, '0')}`,
        displayTime: `${sch.startHour.toString().padStart(2, '0')}:${sch.startMinute.toString().padStart(2, '0')} - ${sch.endHour.toString().padStart(2, '0')}:${sch.endMinute.toString().padStart(2, '0')}`,
        isBooked: sch.booked,
        active: sch.active
      }));
      setAvailableSlots(coachSlots);
    } catch (error) {
      console.error('Error generating available slots:', error);
      message.error('Không thể tải lịch trống. Vui lòng thử lại!');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Nếu có selectedCoachProp thì auto chọn coach và load slot luôn
    if (selectedCoachProp) {
      setSelectedCoach(selectedCoachProp);
      setSelectedSlot(null);
      setCurrentStep(1);
      // Gọi generateAvailableSlotsForCoach ngay khi chọn ngày
      setTimeout(() => {
        generateAvailableSlotsForCoach(selectedCoachProp);
      }, 0);
    } else {
      setSelectedCoach(null);
      setSelectedSlot(null);
      setCurrentStep(1);
    }
  };

  const handleSlotSelect = (slot) => {
    // Chỉ cho phép chọn slot chưa được book
    if (slot.isBooked) {
      message.warning('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.');
      return;
    }
    console.log('Selected slot:', slot);
    setSelectedSlot(slot);
    setCurrentStep(2);
  };

  const handleInfoSubmit = (values) => {
    setAppointmentInfo(values);
    setCurrentStep(3);
  };

  // Không đặt lịch ở đây, chỉ lấy schedule khả dụng

  const handleModalClose = () => {
    setCurrentStep(0);
    setSelectedDate(null);
    setSelectedCoach(null);
    setSelectedSlot(null);
    setAppointmentInfo({});
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  // Render Step 1: Date Selection
  const renderDateSelection = () => (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <Title level={3} style={{ color: '#1890ff', marginBottom: 24 }}>
        <CalendarOutlined /> Chọn ngày hẹn
      </Title>
      <Calendar
        fullscreen={false}
        disabledDate={disabledDate}
        onSelect={handleDateSelect}
        value={selectedDate}
        style={{ 
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
          border: '1px solid #d9d9d9',
          borderRadius: '8px'
        }}
      />
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          Vui lòng chọn ngày bạn muốn đặt lịch hẹn với huấn luyện viên
        </Text>
      </div>
    </div>
  );

  // Render Step 2: Coach & Time Selection
  const renderTimeSelection = () => {
    const selectedDayOfWeek = selectedDate?.format('dddd');
    const groupedSlots = groupSlotsByPeriod(availableSlots);

    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <ClockCircleOutlined /> Chọn huấn luyện viên & thời gian
          </Title>
          <Text strong>
            Ngày đã chọn: {selectedDate?.format('DD/MM/YYYY')}
          </Text>
        </div>

        {/* Coach selection */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 8 }}>Chọn huấn luyện viên:</Title>
          <Row gutter={[16, 8]}>
            {coaches.length === 0 && (
              <Col span={24}>
                <Alert
                  message="Không có huấn luyện viên nào"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </Col>
            )}
            {coaches.map(coach => {
              // Tìm lịch làm việc hôm nay nếu có
              const todaySchedule = coach.workingHours?.find(
                schedule => schedule.dayOfWeek === selectedDayOfWeek
              );
              return (
                <Col xs={24} sm={12} md={8} key={coach.coachId}>
                  <Card
                    size="small"
                    style={{
                      marginBottom: 8,
                      border: selectedCoach?.coachId === coach.coachId ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      background: selectedCoach?.coachId === coach.coachId ? '#e6f7ff' : '#fff',
                      transition: 'border 0.2s'
                    }}
                    onClick={() => {
                      setSelectedCoach(coach);
                      setSelectedSlot(null);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                      <div style={{ marginLeft: 8 }}>
                        <Text strong style={{ fontSize: '14px', display: 'block' }}>
                          {coach.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {coach.email}
                        </Text>
                      </div>
                    </div>
                    {todaySchedule && (
                      <div style={{
                        padding: '6px 10px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        <Text strong style={{ color: '#1890ff', fontSize: '13px' }}>
                          {todaySchedule.startTime} - {todaySchedule.endTime}
                        </Text>
                      </div>
                    )}
                    {coach.certificates && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color="green" style={{ fontSize: '10px', marginBottom: 0 }}>
                          {coach.certificates}
                        </Tag>
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Slot selection for selected coach */}
        {selectedCoach && (
          <>
            <Divider />
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ color: '#fa8c16', marginBottom: 0 }}>
                Chọn khung giờ với {selectedCoach.name}
              </Title>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>Đang tải lịch trình...</Text>
                </div>
              </div>
            ) : (
              <>
                {/* Morning Slots */}
                {groupedSlots.morning.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div className="booking-period-title">
                      <Title level={5} style={{ color: '#fa8c16', marginBottom: 0 }}>
                        � Buổi sáng
                      </Title>
                    </div>
                    <Row gutter={[12, 12]}>
                      {groupedSlots.morning.map((slot, index) => (
                        <Col xs={12} sm={8} md={6} key={index}>
                          <Button
                            block
                            type={selectedSlot?.scheduleId === slot.scheduleId ? 'primary' : 'default'}
                            disabled={slot.isBooked}
                            onClick={() => handleSlotSelect(slot)}
                            className="booking-time-slot"
                            style={{
                              height: 'auto',
                              padding: '8px',
                              borderRadius: '8px'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                {slot.displayTime}
                              </div>
                            </div>
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Afternoon Slots */}
                {groupedSlots.afternoon.length > 0 && (
                  <div>
                    <div className="booking-period-title">
                      <Title level={5} style={{ color: '#722ed1', marginBottom: 0 }}>
                        🌆 Buổi chiều
                      </Title>
                    </div>
                    <Row gutter={[12, 12]}>
                      {groupedSlots.afternoon.map((slot, index) => (
                        <Col xs={12} sm={8} md={6} key={index}>
                          <Button
                            block
                            type={selectedSlot?.scheduleId === slot.scheduleId ? 'primary' : 'default'}
                            disabled={slot.isBooked}
                            onClick={() => handleSlotSelect(slot)}
                            className="booking-time-slot"
                            style={{
                              height: 'auto',
                              padding: '8px',
                              borderRadius: '8px'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                {slot.displayTime}
                              </div>
                            </div>
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {availableSlots.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">
                      Không có khung giờ trống cho huấn luyện viên này trong ngày này
                    </Text>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Render Step 3: Information Input
  const renderInformationInput = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#1890ff' }}>
          <UserOutlined /> Thông tin cuộc hẹn
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleInfoSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reason"
              label="Lý do đặt lịch"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do đặt lịch!' }
              ]}
              initialValue="Tư vấn cai thuốc lá"
            >
              <Input placeholder="Tư vấn cai thuốc lá" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Ngày đã chọn:</Text>
              <br />
              <Text style={{ fontSize: '16px' }}>
                {selectedDate?.format('DD/MM/YYYY')}
              </Text>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Thời gian:</Text>
              <br />
              <Text style={{ fontSize: '16px' }}>
                {selectedSlot?.displayTime}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Huấn luyện viên:</Text>
              <br />
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text style={{ marginLeft: 8, fontSize: '16px' }}>
                  {selectedSlot?.coachName}
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Ghi chú (tùy chọn)"
        >
          <TextArea
            rows={4}
            placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
          <Space>
            <Button onClick={handleStepBack}>
              <ArrowLeftOutlined /> Quay lại
            </Button>
            <Button type="primary" htmlType="submit">
              Tiếp tục <ArrowRightOutlined />
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  // Render Step 4: Confirmation
  const renderConfirmation = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#52c41a' }}>
          <CheckCircleOutlined /> Xác nhận đặt lịch
        </Title>
      </div>

      <Card className="booking-confirmation-card" style={{ marginBottom: 24 }}>
        <Alert
          message="Xác nhận thông tin đặt lịch"
          description="Vui lòng kiểm tra lại thông tin trước khi xác nhận đặt lịch hẹn"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Ngày hẹn:</Text>
              <br />
              <Text style={{ fontSize: '16px' }}>
                {selectedDate?.format('dddd, DD/MM/YYYY')}
              </Text>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Thời gian:</Text>
              <br />
              <Text style={{ fontSize: '16px' }}>
                {selectedSlot?.displayTime}
              </Text>
            </div>
          </Col>
          
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Huấn luyện viên:</Text>
              <br />
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text style={{ marginLeft: 8, fontSize: '16px' }}>
                  {selectedSlot?.coachName}
                </Text>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Lý do:</Text>
              <br />
              <Text>{appointmentInfo.reason}</Text>
            </div>
          </Col>
        </Row>
        
        {appointmentInfo.notes && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Ghi chú:</Text>
            <br />
            <Text>{appointmentInfo.notes}</Text>
          </div>
        )}
      </Card>

      <div style={{ textAlign: 'center' }}>
        <Space size="large">
          <Button size="large" onClick={handleStepBack}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button 
            type="primary" 
            size="large" 
            loading={booking}
            onClick={handleConfirmBooking}
          >
            <CheckCircleOutlined /> Xác nhận đặt lịch
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDateSelection();
      case 1:
        return renderTimeSelection();
      case 2:
        return renderInformationInput();
      case 3:
        return renderConfirmation();
      default:
        return renderDateSelection();
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined />
          <span>Đặt lịch hẹn tư vấn</span>
        </div>
      }
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      destroyOnClose
      closeIcon={<CloseOutlined />}
    >
      {/* Steps */}
      <div style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          size="small"
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={step.icon}
              description={step.description}
            />
          ))}
        </Steps>
      </div>

      {/* Step Content */}
      <div style={{ minHeight: 400 }}>
        {renderStepContent()}
      </div>
    </Modal>
  );
};

export default BookingSteps;
