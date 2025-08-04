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
  Divider
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getAllCoaches } from '../../services/coachManagementService';
import { 
  getAvailableSchedulesOfCoach, 
  generateTimeSlots, 
  groupSlotsByPeriod,
  getAppointmentsOfMember
} from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BookingModal = ({ visible, onCancel, onSuccess }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  
  // Step data
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState({});
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  
  // Data
  const [coaches, setCoaches] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  useEffect(() => {
    if (visible) {
      fetchCoaches();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedDate && coaches.length > 0) {
      generateAvailableSlots();
    }
  }, [selectedDate, coaches]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(0, 50); // Get more coaches
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

  // Lấy schedule khả dụng của coach từ API, sau đó sinh slot
  const generateAvailableSlots = async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      let slots = [];
      // Lấy available schedules cho từng coach
      for (const coach of coaches) {
        try {
          const schedules = await getAvailableSchedulesOfCoach(coach.coachId);
          if (Array.isArray(schedules)) {
            // Chỉ lấy schedule đúng ngày
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const filtered = schedules.filter(sch => sch.date === dateStr);
            // Sinh slot từ schedule
            filtered.forEach(sch => {
              slots.push({
                startTime: sch.startTime,
                endTime: sch.endTime,
                coachId: coach.coachId,
                coachName: coach.name,
                scheduleId: sch.scheduleId,
                isBooked: false,
                displayTime: `${sch.startTime} - ${sch.endTime}`
              });
            });
          }
        } catch (e) {
          // Bỏ qua lỗi từng coach
        }
      }
      setAvailableSlots(slots);
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
    setSelectedSlot(null);
    setCurrentStep(1);
  };

  const handleSlotSelect = (slot) => {
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
    setSelectedSlot(null);
    setAppointmentInfo({});
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const disabledDate = (current) => {
    // Disable past dates and dates more than 30 days in future
    return current && (
      current < moment().startOf('day') || 
      current > moment().add(30, 'days')
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDateSelection();
      case 1:
        return renderTimeSelection();
      case 2:
        return renderInfoForm();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderDateSelection = () => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <Title level={3} style={{ color: '#1890ff', marginBottom: 24 }}>
        <CalendarOutlined /> Chọn ngày hẹn
      </Title>
      <DatePicker
        size="large"
        placeholder="Chọn ngày"
        disabledDate={disabledDate}
        onChange={handleDateSelect}
        value={selectedDate}
        style={{ width: 300 }}
        format="DD/MM/YYYY"
      />
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          Vui lòng chọn ngày bạn muốn đặt lịch hẹn với huấn luyện viên
        </Text>
      </div>
    </div>
  );

  const renderTimeSelection = () => {
    const groupedSlots = groupSlotsByPeriod(availableSlots);
    
    // Get working hours for selected day to display
    const selectedDayOfWeek = selectedDate?.format('dddd');
    const allWorkingHours = [];
    
    coaches.forEach(coach => {
      if (coach.workingHours && coach.workingHours.length > 0) {
        const coachDaySchedule = coach.workingHours.find(
          schedule => schedule.dayOfWeek === selectedDayOfWeek
        );
        
        if (coachDaySchedule) {
          allWorkingHours.push({
            ...coachDaySchedule,
            coachId: coach.coachId,
            coachName: coach.name,
            coachEmail: coach.email
          });
        }
      }
    });
    
    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff' }}>
            <ClockCircleOutlined /> Chọn thời gian
          </Title>
          <Text strong>
            Ngày đã chọn: {selectedDate?.format('DD/MM/YYYY')}
          </Text>
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
                  <Title level={4} style={{ color: '#fa8c16', marginBottom: 0 }}>
                    🌅 Buổi sáng
                  </Title>
                </div>
                <Row gutter={[12, 12]}>
                  {groupedSlots.morning.map((slot, index) => (
                    <Col xs={12} sm={8} md={6} key={index}>
                      <Button
                        block
                        type={selectedSlot?.startTime === slot.startTime ? 'primary' : 'default'}
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
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            {slot.coachName}
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
                  <Title level={4} style={{ color: '#722ed1', marginBottom: 0 }}>
                    🌆 Buổi chiều
                  </Title>
                </div>
                <Row gutter={[12, 12]}>
                  {groupedSlots.afternoon.map((slot, index) => (
                    <Col xs={12} sm={8} md={6} key={index}>
                      <Button
                        block
                        type={selectedSlot?.startTime === slot.startTime ? 'primary' : 'default'}
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
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            {slot.coachName}
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
                  Không có khung giờ trống cho ngày này
                </Text>
              </div>
            )}
          </>
        )}

        <Divider />
        
        {/* Coach working hours info for selected day */}
        <div>
          <Title level={5}>
            Lịch làm việc các huấn luyện viên cho ngày {selectedDate?.format('dddd, DD/MM/YYYY')}:
          </Title>
          
          {allWorkingHours.length > 0 ? (
            <Row gutter={[16, 8]}>
              {allWorkingHours.map((schedule, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card size="small" className="booking-coach-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <Text strong style={{ marginLeft: 8, fontSize: '13px' }}>
                        {schedule.coachName}
                      </Text>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert
              message="Không có huấn luyện viên nào làm việc trong ngày này"
              description="Vui lòng chọn ngày khác để xem lịch trống"
              type="warning"
              showIcon
            />
          )}
        </div>
        
        {/* Display working hours for selected day */}
        {allWorkingHours.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4>Lịch làm việc trong ngày:</h4>
            {allWorkingHours.map((hours) => (
              <div key={hours.coachId} style={{ padding: '8px 12px', background: '#f0f0f0', marginBottom: 8, borderRadius: 4 }}>
                <strong>{hours.coachName}</strong>: {hours.startTime} - {hours.endTime}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInfoForm = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#1890ff' }}>
          <UserOutlined /> Thông tin đặt lịch
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleInfoSubmit}
      >
        <Form.Item
          name="reason"
          label="Lý do đặt lịch"
          rules={[{ required: true, message: 'Vui lòng nhập lý do đặt lịch!' }]}
        >
          <Input 
            placeholder="Ví dụ: Tư vấn kế hoạch cai thuốc, hỗ trợ tâm lý..."
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú thêm (tùy chọn)"
        >
          <TextArea 
            rows={4}
            placeholder="Mô tả chi tiết vấn đề bạn muốn tư vấn..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handlePrevStep}>
              Quay lại
            </Button>
            <Button type="primary" htmlType="submit" icon={<ArrowRightOutlined />}>
              Tiếp tục
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const renderConfirmation = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#1890ff' }}>
          <CheckCircleOutlined /> Xác nhận đặt lịch
        </Title>
      </div>

      <Card>
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
            <Paragraph style={{ marginTop: 4, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
              {appointmentInfo.notes}
            </Paragraph>
          </div>
        )}
      </Card>

      <Alert
        message="Lưu ý"
        description="Sau khi đặt lịch thành công, bạn sẽ được chuyển đến phòng chat để có thể trò chuyện với huấn luyện viên."
        type="info"
        showIcon
        style={{ margin: '16px 0' }}
      />

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handlePrevStep}>
            Quay lại
          </Button>
          <Button 
            type="primary" 
            loading={booking}
            onClick={handleConfirmBooking}
            icon={<CheckCircleOutlined />}
          >
            Xác nhận đặt lịch
          </Button>
        </Space>
      </div>
    </div>
  );

  const getModalTitle = () => {
    const titles = [
      'Đặt lịch hẹn tư vấn - Chọn ngày',
      'Đặt lịch hẹn tư vấn - Chọn giờ', 
      'Đặt lịch hẹn tư vấn - Thông tin',
      'Đặt lịch hẹn tư vấn - Xác nhận'
    ];
    return titles[currentStep] || 'Đặt lịch hẹn tư vấn';
  };

  return (
    <Modal
      title={getModalTitle()}
      visible={visible}
      onCancel={handleModalClose}
      footer={null}
      width={800}
      destroyOnClose
      className="booking-modal"
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Chọn ngày" icon={<CalendarOutlined />} />
        <Step title="Chọn giờ" icon={<ClockCircleOutlined />} />
        <Step title="Thông tin" icon={<UserOutlined />} />
        <Step title="Xác nhận" icon={<CheckCircleOutlined />} />
      </Steps>

      {renderStepContent()}
    </Modal>
  );
};

export default BookingModal;
