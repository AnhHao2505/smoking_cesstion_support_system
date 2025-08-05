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
import { getAppointmentsOfMember, cancelAppointmentByMember } from '../../services/appointmentService';

const { Title, Text } = Typography;

const MemberAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

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
        if (record.status === 'BOOKED') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  // TODO: Implement meeting functionality
                  message.info('Chức năng vào meeting sẽ được thêm sau');
                }}
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
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
    </div>
  );
};

export default MemberAppointments;
