import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Progress,
  TimePicker,
  Spin
} from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  StarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  getAllCoaches,
  createCoach,
  getCoachSpecialties,
  getCoachProfile
} from '../../services/coachManagementService';
import { reportCoachAbsent } from '../../services/profileService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CoachManagement = () => {
  // Map English day to Vietnamese
  const dayOfWeekVN = {
    Monday: 'Thứ Hai',
    Tuesday: 'Thứ Ba',
    Wednesday: 'Thứ Tư',
    Thursday: 'Thứ Năm',
    Friday: 'Thứ Sáu',
    Saturday: 'Thứ Bảy',
    Sunday: 'Chủ Nhật'
  };

  const getDayVN = (day) => dayOfWeekVN[day] || day;
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [absentReportModalVisible, setAbsentReportModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [reportingAbsent, setReportingAbsent] = useState(false);
  const [form] = Form.useForm();
  const [workingHoursForm] = Form.useForm();
  const [absentReportForm] = Form.useForm();
  const [specialties, setSpecialties] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  useEffect(() => {
    fetchCoaches();
    fetchSpecialties();
  }, [pagination.current, pagination.pageSize]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(pagination.current - 1, pagination.pageSize);
      
      if (response && response.content) {
        setCoaches(response.content);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements,
          pageNo: response.pageNo,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          last: response.last
        }));
      } else {
        setCoaches([]);
        message.warning('No coaches found');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error("Thất bại khi tải danh sách huấn luyện viên.");
      setCoaches([]);
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const specialtiesData = await getCoachSpecialties();
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total
    });
  };

  const showCreateModal = () => {
    // Reset toàn bộ form và clear mọi giá trị
    form.resetFields();
    form.setFieldsValue({
      name: '',
      email: '',
      password: '',
      contact_number: '',
      specialty: undefined,
      certificates: '',
      bio: ''
    });
    workingHoursForm.resetFields();
    setWorkingHours([]);
    setModalVisible(true);
  };

  // Regex cho số điện thoại Việt Nam
  const phoneRegex = /^(0[1-9][0-9]{8,9})$/;

  // const addWorkingHour = () => {
  //   workingHoursForm.validateFields()
  //     .then(values => {
  //       // Kiểm tra đầy đủ thông tin
  //       if (!values.dayOfWeek || !values.startTime || !values.endTime) {
  //         message.error('Vui lòng nhập đầy đủ thông tin lịch làm việc');
  //         return;
  //       }

  //       // Kiểm tra trùng lặp ngày trong tuần
  //       const existingDay = workingHours.find(hour => hour.dayOfWeek === values.dayOfWeek);
  //       if (existingDay) {
  //         message.error(`Ngày ${getDayVN(values.dayOfWeek)} đã có lịch làm việc. Vui lòng chọn ngày khác.`);
  //         return;
  //       }

  //       const startTime = values.startTime.format('HH:mm');
  //       const endTime = values.endTime.format('HH:mm');

  //       // Kiểm tra giờ bắt đầu phải trước giờ kết thúc
  //       if (startTime >= endTime) {
  //         message.error('Giờ bắt đầu phải trước giờ kết thúc');
  //         return;
  //       }

  //       // Kiểm tra thời gian hợp lý (6:00 - 23:00)
  //       const startHour = parseInt(startTime.split(':')[0]);
  //       const endHour = parseInt(endTime.split(':')[0]);
        
  //       if (startHour < 6 || startHour > 23) {
  //         message.error('Giờ bắt đầu phải trong khoảng 06:00 - 23:00');
  //         return;
  //       }
        
  //       if (endHour < 6 || endHour > 23) {
  //         message.error('Giờ kết thúc phải trong khoảng 06:00 - 23:00');
  //         return;
  //       }

  //       // Kiểm tra thời gian làm việc tối thiểu 1 tiếng
  //       const startMinutes = startHour * 60 + parseInt(startTime.split(':')[1]);
  //       const endMinutes = endHour * 60 + parseInt(endTime.split(':')[1]);
  //       const duration = endMinutes - startMinutes;
        
  //       if (duration < 60) {
  //         message.error('Thời gian làm việc phải ít nhất 1 tiếng');
  //         return;
  //       }

  //       // Kiểm tra thời gian làm việc tối đa 8 tiếng
  //       if (duration > 480) {
  //         message.error('Thời gian làm việc không được quá 8 tiếng');
  //         return;
  //       }

  //       const newWorkingHour = {
  //         dayOfWeek: values.dayOfWeek,
  //         startTime: startTime,
  //         endTime: endTime
  //       };
        
  //       setWorkingHours([...workingHours, newWorkingHour]);
  //       workingHoursForm.resetFields();
  //       message.success(`Thêm lịch làm việc ${getDayVN(values.dayOfWeek)} thành công`);
  //     })
  //     .catch(() => {
  //       message.error('Vui lòng nhập đầy đủ thông tin lịch làm việc');
  //     });
  // };

  // const removeWorkingHour = (index) => {
  //   const newWorkingHours = workingHours.filter((_, i) => i !== index);
  //   setWorkingHours(newWorkingHours);
  // };

  const handleSubmit = async () => {
    try {
      setCreating(true);
      const values = await form.validateFields();

      // FE validation
      if (!values.name || values.name.trim().length < 2) {
        message.error('Họ và tên phải có ít nhất 2 ký tự');
        setCreating(false);
        return;
      }
      if (!values.email) {
        message.error('Vui lòng nhập email');
        setCreating(false);
        return;
      }
      // Email format đã được validate bởi Ant Design
      if (!values.password || values.password.length < 6) {
        message.error('Mật khẩu phải có ít nhất 6 ký tự');
        setCreating(false);
        return;
      }
      if (!values.contact_number || !phoneRegex.test(values.contact_number)) {
        message.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ.');
        setCreating(false);
        return;
      }
      if (!values.specialty) {
        message.error('Vui lòng chọn chuyên môn');
        setCreating(false);
        return;
      }
      if (!values.certificates || values.certificates.trim().length < 2) {
        message.error('Chứng chỉ phải có ít nhất 2 ký tự');
        setCreating(false);
        return;
      }
      if (!values.bio || values.bio.trim().length < 10) {
        message.error('Giới thiệu bản thân phải có ít nhất 10 ký tự');
        setCreating(false);
        return;
      }
      // if (!workingHours || workingHours.length === 0) {
      //   message.error('Vui lòng thêm ít nhất một lịch làm việc');
      //   setCreating(false);
      //   return;
      // }

      // Format data
      const formattedData = {
        name: values.name,
        email: values.email,
        password: values.password,
        contact_number: values.contact_number,
        certificates: values.certificates,
        bio: values.bio,
        specialty: values.specialty,
        workingHours: workingHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime,
          endTime: hour.endTime
        }))
      };

      const response = await createCoach(formattedData);
      if (response) {
        message.success('Tạo huấn luyện viên thành công!');
        setModalVisible(false);
        form.resetFields();
        workingHoursForm.resetFields();
        setWorkingHours([]);
        fetchCoaches();
      }
    } catch (error) {
      console.error("Error creating coach:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Tạo huấn luyện viên thất bại. Vui lòng thử lại.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleViewProfile = async (coachId) => {
    try {
      setProfileLoading(true);
      setProfileModalVisible(true);
      
      const response = await getCoachProfile(coachId);
      const profileData = response.data || response; // Handle both response formats
      
      // Map API response to expected format
      const mappedProfile = {
        ...profileData,
        contact_number: profileData.contactNumber || profileData.contact_number,
        workingHours: profileData.workingHour || profileData.workingHours || [],
        currentMemberAssignedCount: profileData.currentMemberAssignedCount || 0,
        full: profileData.full || false
      };
      
      setSelectedCoach(mappedProfile);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      message.error("Failed to load coach profile. Please try again.");
      setProfileModalVisible(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setSelectedCoach(null);
  };

  const showAbsentReportModal = (coach) => {
    setSelectedCoach(coach);
    absentReportForm.resetFields();
    setAbsentReportModalVisible(true);
  };

  const closeAbsentReportModal = () => {
    setAbsentReportModalVisible(false);
    setSelectedCoach(null);
    absentReportForm.resetFields();
  };

  const handleAbsentReport = async () => {
    try {
      setReportingAbsent(true);
      const values = await absentReportForm.validateFields();
      
      const reportData = {
        coachId: selectedCoach.coachId,
        reason: values.reason,
        suggestion: values.suggestion
      };

      await reportCoachAbsent(reportData);
      message.success('Coach absent report submitted successfully!');
      closeAbsentReportModal();
    } catch (error) {
      console.error("Error reporting coach absent:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Failed to submit absent report. Please try again.");
      }
    } finally {
      setReportingAbsent(false);
    }
  };

  const columns = [
    {
      title: 'Huấn luyện viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space align="start">
          <Avatar size={48} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: '16px' }}>{text}</Text>
            <br />
            <Text type="secondary"><MailOutlined /> {record.email}</Text>
            <br />
            <Tag color="blue" style={{ marginTop: 4 }}>{record.specialty}</Tag>
          </div>
        </Space>
      ),
      width: 260
    },
    {
      title: 'Liên hệ',
      dataIndex: 'contact_number',
      key: 'contact_number',
      render: (contact) => (
        <Text><PhoneOutlined /> {contact}</Text>
      ),
      width: 140
    },
    // {
    //   title: 'Lịch làm việc',
    //   dataIndex: 'workingHours',
    //   key: 'workingHours',
    //   render: (workingHours) => (
    //     <div>
    //       {workingHours && workingHours.length > 0 ? (
    //         workingHours.slice(0, 2).map((schedule, index) => (
    //           <div key={index} style={{ fontSize: '12px' }}>
    //             <Text><ClockCircleOutlined /> {getDayVN(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}</Text>
    //           </div>
    //         ))
    //       ) : (
    //         <Text type="secondary">Chưa có lịch</Text>
    //       )}
    //       {workingHours && workingHours.length > 2 && (
    //         <Text type="secondary" style={{ fontSize: '11px' }}>
    //           +{workingHours.length - 2} lịch khác...
    //         </Text>
    //       )}
    //     </div>
    //   ),
    //   width: 200
    // },
    {
      title: 'Thành viên hiện tại',
      dataIndex: 'currentMemberAssignedCount',
      key: 'currentMemberAssignedCount',
      render: (count, record) => {
        const maxMembers = 10;
        const percentage = (count / maxMembers) * 100;
        return (
          <div style={{ minWidth: 90 }}>
            <Progress 
              percent={percentage} 
              size="small" 
              strokeColor={percentage >= 90 ? '#ff4d4f' : percentage >= 70 ? '#faad14' : '#52c41a'}
              showInfo={false}
              style={{ marginBottom: 2 }}
            />
            <Text style={{ fontSize: '12px' }}>{count}/{maxMembers}</Text>
          </div>
        );
      },
      sorter: (a, b) => a.currentMemberAssignedCount - b.currentMemberAssignedCount,
      width: 120
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space direction="horizontal" size="middle">
          <Button 
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record.coachId)}
            style={{ minWidth: 110 }}
          >
            Xem hồ sơ
          </Button>
          <Button 
            type="default"
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => showAbsentReportModal(record)}
            style={{ borderColor: '#faad14', color: '#faad14', minWidth: 110 }}
          >
            Báo vắng mặt
          </Button>
        </Space>
      ),
      width: 240
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Calculate summary statistics
  const totalCoaches = coaches.length;
  const availableCoaches = coaches.filter(coach => !coach.full).length;
  const fullCoaches = coaches.filter(coach => coach.full).length;
  const averageMembers = coaches.length > 0 
    ? (coaches.reduce((sum, coach) => sum + coach.currentMemberAssignedCount, 0) / coaches.length).toFixed(1)
    : 0;

  return (
    <div className="coach-management">
      <div className="container py-4">
        <Title level={2} style={{ marginBottom: 24 }}>
          <TeamOutlined /> Quản lý huấn luyện viên
        </Title>

        {/* Thống kê tổng quan */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số huấn luyện viên"
                value={totalCoaches}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang nhận thành viên"
                value={availableCoaches}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã đủ thành viên"
                value={fullCoaches}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Số thành viên trung bình/HLV"
                value={averageMembers}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="Danh sách huấn luyện viên" 
          extra={
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={showCreateModal}
            >
              Thêm huấn luyện viên
            </Button>
          }
        >
          <Table 
            dataSource={coaches} 
            columns={columns} 
            rowKey="coachId"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} HLV`,
              locale: {
                items_per_page: '/ trang',
                jump_to: 'Đến trang',
                page: ''
              }
            }}
            onChange={handleTableChange}
            scroll={{ x: 1340 }}
          />
        </Card>

        {/* Modal tạo HLV */}
        <Modal
          title="Thêm huấn luyện viên mới"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            workingHoursForm.resetFields();
            setWorkingHours([]);
          }}
          footer={[
            <Button key="back" onClick={() => {
              setModalVisible(false);
              form.resetFields();
              workingHoursForm.resetFields();
              setWorkingHours([]);
            }}>
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={creating}
              onClick={handleSubmit}
            >
              Tạo huấn luyện viên
            </Button>,
          ]}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ email" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact_number"
                  label="Số điện thoại liên hệ"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="specialty"
                  label="Chuyên môn"
                  rules={[{ required: true, message: 'Vui lòng chọn chuyên môn' }]}
                >
                  <Select placeholder="Chọn chuyên môn">
                    {specialties.map(specialty => (
                      <Option key={specialty} value={specialty}>{specialty}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="certificates"
                  label="Chứng chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập chứng chỉ' }]}
                >
                  <Input placeholder="Nhập chứng chỉ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bio"
              label="Giới thiệu bản thân"
              rules={[{ required: true, message: 'Vui lòng nhập giới thiệu' }]}
            >
              <TextArea rows={4} placeholder="Nhập giới thiệu về huấn luyện viên" />
            </Form.Item>

            {/* Lịch làm việc */}
            {/* <div style={{ marginTop: 24 }}>
              <Title level={5}>Lịch làm việc</Title>
              <Form form={workingHoursForm} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item
                  name="dayOfWeek"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <Select placeholder="Chọn ngày" style={{ width: 120 }}>
                    <Option value="Monday">Thứ Hai</Option>
                    <Option value="Tuesday">Thứ Ba</Option>
                    <Option value="Wednesday">Thứ Tư</Option>
                    <Option value="Thursday">Thứ Năm</Option>
                    <Option value="Friday">Thứ Sáu</Option>
                    <Option value="Saturday">Thứ Bảy</Option>
                    <Option value="Sunday">Chủ Nhật</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}
                >
                  <TimePicker format="HH:mm" placeholder="Giờ bắt đầu" />
                </Form.Item>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc' }]}
                >
                  <TimePicker format="HH:mm" placeholder="Giờ kết thúc" />
                </Form.Item>
                <Form.Item>
                  <Button type="dashed" onClick={addWorkingHour} icon={<PlusOutlined />}>
                    Thêm lịch làm việc
                  </Button>
                </Form.Item>
              </Form>

              {workingHours.length > 0 && (
                <div>
                  <Text strong>Lịch đã thêm:</Text>
                  {workingHours.map((hour, index) => (
                    <div key={index} style={{ marginTop: 8, padding: 8, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                      <Space>
                        <CalendarOutlined />
                        <Text>{getDayVN(hour.dayOfWeek)}: {hour.startTime} - {hour.endTime}</Text>
                        <Button 
                          size="small" 
                          type="text" 
                          danger 
                          onClick={() => removeWorkingHour(index)}
                        >
                          Xóa
                        </Button>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </Form>
        </Modal>

        {/* Coach Profile View Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Chi tiết hồ sơ huấn luyện viên
            </div>
          }
          visible={profileModalVisible}
          onCancel={closeProfileModal}
          footer={[
            <Button key="close" onClick={closeProfileModal}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {profileLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : selectedCoach ? (
            <div>
              {/* Coach Header */}
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Avatar size={80} icon={<UserOutlined />} />
                </Col>
                <Col span={18}>
                  <Title level={3} style={{ marginBottom: 8 }}>{selectedCoach.name}</Title>
                  <Space direction="vertical" size={4}>
                    <Text><MailOutlined /> {selectedCoach.email}</Text>
                    <Text><PhoneOutlined /> {selectedCoach.contactNumber || selectedCoach.contact_number}</Text>
                    <Tag color="blue">{selectedCoach.specialty}</Tag>
                  </Space>
                </Col>
              </Row>

              {/* Coach Details */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card size="small" title="Thông tin chuyên môn">
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div>
                        <Text strong>Chứng chỉ:</Text>
                        <br />
                        <Text>{selectedCoach.certificates || 'Chưa cập nhật'}</Text>
                      </div>
                      <div>
                        <Text strong>Chuyên môn:</Text>
                        <br />
                        <Text>{selectedCoach.specialty}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
                {/*<Col span={12}>
                  <Card size="small" title="Lịch làm việc">
                    {selectedCoach.workingHours && selectedCoach.workingHours.length > 0 ? (
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {selectedCoach.workingHours.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {getDayVN(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (selectedCoach.workingHour && selectedCoach.workingHour.length > 0 ? (
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {selectedCoach.workingHour.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {getDayVN(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa có lịch làm việc</Text>
                    ))}
                  </Card>
                </Col>*/}
              </Row>

              {/* Biography */}
              {selectedCoach.bio && (
                <Card size="small" title="Giới thiệu bản thân" style={{ marginTop: 16 }}>
                  <Text>{selectedCoach.bio}</Text>
                </Card>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">Không có dữ liệu hồ sơ huấn luyện viên</Text>
            </div>
          )}
        </Modal>

        {/* Coach Absent Report Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExclamationCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
              Báo cáo HLV vắng mặt
            </div>
          }
          visible={absentReportModalVisible}
          onCancel={closeAbsentReportModal}
          footer={[
            <Button key="cancel" onClick={closeAbsentReportModal}>
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={reportingAbsent}
              onClick={handleAbsentReport}
              style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
            >
              Nộp Report
            </Button>,
          ]}
          width={600}
        >
          {selectedCoach && (
            <div>
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
                <Text strong>HLV: </Text>
                <Text>{selectedCoach.name}</Text>
                <br />
                <Text strong>Email: </Text>
                <Text>{selectedCoach.email}</Text>
              </div>
              
              <Form
                form={absentReportForm}
                layout="vertical"
              >
                <Form.Item
                  name="reason"
                  label="Lý do vắng mặt"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do vắng mặt' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Vui lòng mô tả lý do tại sao HLV này bị báo cáo vắng mặt..."
                  />
                </Form.Item>

                <Form.Item
                  name="suggestion"
                  label="Gợi ý cho thành viên"
                  rules={[{ required: true, message: 'Vui lòng nhập đề xuất cho các thành viên bị ảnh hưởng' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Vui lòng cung cấp gợi ý hoặc giải pháp thay thế cho các thành viên được phân công cho HLV này..."
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CoachManagement;