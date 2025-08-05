import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Rate
} from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsOfMember, cancelAppointmentByMember, giveFeedbackForAppointment } from '../../services/appointmentService';
import VideoCallWithProps from '../videos/VideoCallWithProps';
import { AgoraProvider } from '../videos/AgoraContext';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const MemberAppointments = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Feedback modal states
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm] = Form.useForm();

  // Video call states
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [currentCallData, setCurrentCallData] = useState(null);

  useEffect(() => {
    // Check if user is authenticated before fetching appointments
    if (!loading && !currentUser) {
      message.error('Vui lòng đăng nhập để xem cuộc hẹn');
      navigate('/login');
      return;
    }
    
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser, loading, navigate]);

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await getAppointmentsOfMember();
      setAppointments(response || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Không thể tải danh sách cuộc hẹn');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!currentAppointment) return;
    
    try {
      setCancelSubmitting(true);
      const response = await cancelAppointmentByMember(currentAppointment.appointmentId);
      
      if (response.success !== false) {
        message.success('Hủy cuộc hẹn thành công');
        setCancelModalVisible(false);
        fetchAppointments(); // Refresh the appointments list
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
  };

  // Feedback functions
  const showFeedbackModal = (appointment) => {
    setCurrentAppointment(appointment);
    setFeedbackModalVisible(true);
    feedbackForm.resetFields();
  };

  const handleSubmitFeedback = async (values) => {
    if (!currentAppointment?.appointmentId) {
      message.error('Không thể gửi đánh giá - thiếu thông tin cuộc hẹn');
      return;
    }

    try {
      setFeedbackSubmitting(true);
      
      const feedbackData = {
        stars: values.star || 5,
        comment: values.content || ''
      };

      const response = await giveFeedbackForAppointment(currentAppointment.appointmentId, feedbackData);
      
      if (response.success !== false) {
        message.success('Gửi đánh giá thành công');
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
        fetchAppointments(); // Refresh to show updated feedback
      } else {
        message.error(response.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Video call functions
  const initiateVideoCall = async (appointment) => {
    try {
      // Check if user is still authenticated
      if (!currentUser) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      if (!appointment?.appointmentId) {
        message.error('Không thể khởi tạo cuộc gọi - thiếu thông tin cuộc hẹn');
        return;
      }

      if (!currentUser?.userId) {
        message.error('Không thể khởi tạo cuộc gọi - thiếu thông tin người dùng');
        console.error('Current user data:', currentUser);
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
    setIsVideoCallOpen(false);
    setCurrentCallData(null);
    message.info('Đã kết thúc cuộc gọi video');
  };

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
      title: 'Lý do vắng mặt',
      dataIndex: 'absenceReason',
      key: 'absenceReason',
      render: (reason) => reason ? (
        <Text type="secondary" style={{ fontStyle: 'italic' }}>
          {reason}
        </Text>
      ) : <Text type="secondary">-</Text>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        // Check if feedback already exists
        const hasFeedback = record.feedbackStars || record.feedbackComment;
        // Check if appointment is completed (only show rating button for completed appointments)
        const isCompleted = record.status === 'COMPLETED';
        
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
        } else if (record.status === 'COMPLETED') {
          return (
            <Space>
              {isCompleted && !hasFeedback && (
                <Button
                  type="default"
                  size="small"
                  onClick={() => showFeedbackModal(record)}
                >
                  Đánh giá
                </Button>
              )}
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      }
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Show loading spinner if auth is still loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>Đang tải...</Text>
        </div>
      )}
      
      {/* Show content only when user is authenticated */}
      {!loading && currentUser && (
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                <CalendarOutlined /> Cuộc hẹn của tôi
              </Title>
            </Space>
          </div>

        <Card
          title="Danh sách cuộc hẹn"
          extra={
            <Button
              size="small"
              onClick={fetchAppointments}
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
              emptyText: 'Bạn chưa có cuộc hẹn nào'
            }}
          />
        </Card>
        </Card>
      )}

      {/* Modal hủy cuộc hẹn */}
      <Modal
        title="Xác nhận hủy cuộc hẹn"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCancelModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={cancelSubmitting}
            onClick={handleCancelAppointment}
          >
            Xác nhận hủy
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn hủy cuộc hẹn này không?</p>
        {currentAppointment && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <p><strong>Ngày hẹn:</strong> {currentAppointment.date ? new Date(currentAppointment.date).toLocaleDateString('vi-VN') : 'Không xác định'}</p>
            <p><strong>Thời gian:</strong> {
              currentAppointment.startHour !== undefined && currentAppointment.startMinute !== undefined && 
              currentAppointment.endHour !== undefined && currentAppointment.endMinute !== undefined
                ? `${currentAppointment.startHour.toString().padStart(2, '0')}:${currentAppointment.startMinute.toString().padStart(2, '0')} - ${currentAppointment.endHour.toString().padStart(2, '0')}:${currentAppointment.endMinute.toString().padStart(2, '0')}`
                : 'Không xác định'
            }</p>
          </div>
        )}
      </Modal>

      {/* Modal đánh giá huấn luyện viên */}
      <Modal
        title="Đánh giá huấn luyện viên"
        open={feedbackModalVisible}
        onCancel={() => {
          setFeedbackModalVisible(false);
          feedbackForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleSubmitFeedback}
          initialValues={{ star: 5 }}
        >
          {currentAppointment && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <p><strong>Ngày hẹn:</strong> {currentAppointment.date ? new Date(currentAppointment.date).toLocaleDateString('vi-VN') : 'Không xác định'}</p>
              <p><strong>Thời gian:</strong> {
                currentAppointment.startHour !== undefined && currentAppointment.startMinute !== undefined && 
                currentAppointment.endHour !== undefined && currentAppointment.endMinute !== undefined
                  ? `${currentAppointment.startHour.toString().padStart(2, '0')}:${currentAppointment.startMinute.toString().padStart(2, '0')} - ${currentAppointment.endHour.toString().padStart(2, '0')}:${currentAppointment.endMinute.toString().padStart(2, '0')}`
                  : 'Không xác định'
              }</p>
            </div>
          )}

          <Form.Item
            label="Đánh giá sao"
            name="star"
            rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="Nhận xét"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét của bạn' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn với huấn luyện viên..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setFeedbackModalVisible(false);
                  feedbackForm.resetFields();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={feedbackSubmitting}
              >
                Gửi đánh giá
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
    </div>
  );
};

// Export với AgoraProvider wrapper
const MemberAppointmentsWithAgora = () => (
  <AgoraProvider>
    <MemberAppointments />
  </AgoraProvider>
);

export default MemberAppointmentsWithAgora;
