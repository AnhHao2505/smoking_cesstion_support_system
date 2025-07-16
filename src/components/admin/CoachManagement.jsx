import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getAllCoaches,
  createCoach,
  getCoachSpecialties,
  getCoachProfile,
} from "../../services/coachManagementService";
import { reportCoachAbsent } from "../../services/profileService";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [absentReportModalVisible, setAbsentReportModalVisible] =
    useState(false);
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
    total: 0,
  });

  useEffect(() => {
    fetchCoaches();
    fetchSpecialties();
  }, [pagination.current, pagination.pageSize]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(
        pagination.current - 1,
        pagination.pageSize
      );

      if (response && response.content) {
        // Ensure each coach has the expected structure from API:
        // coachId, name, email, certificates, contact_number, workingHours, currentMemberAssignedCount, full
        setCoaches(response.content);
        setPagination((prev) => ({
          ...prev,
          total: response.totalElements,
          pageNo: response.pageNo,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          last: response.last,
        }));
      } else {
        setCoaches([]);
        message.warning("Không tìm thấy huấn luyện viên nào");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error(
        "Không thể tải danh sách huấn luyện viên. Vui lòng thử lại sau."
      );
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
      total: pagination.total,
    });
  };

  const showCreateModal = () => {
    form.resetFields();
    workingHoursForm.resetFields();
    setWorkingHours([]);
    setModalVisible(true);
  };

  const showProfileModal = (coach) => {
    setSelectedCoach(coach);
    setProfileModalVisible(true);
  };

  const addWorkingHour = () => {
    workingHoursForm
      .validateFields()
      .then((values) => {
        const newWorkingHour = {
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime.format("HH:mm"),
          endTime: values.endTime.format("HH:mm"),
        };

        setWorkingHours([...workingHours, newWorkingHour]);
        workingHoursForm.resetFields();
        message.success("Thêm giờ làm việc thành công");
      })
      .catch((error) => {
        console.error("Working hours validation failed:", error);
      });
  };

  const removeWorkingHour = (index) => {
    const newWorkingHours = workingHours.filter((_, i) => i !== index);
    setWorkingHours(newWorkingHours);
  };

  const handleSubmit = async () => {
    try {
      setCreating(true);
      const values = await form.validateFields();

      // Format data according to API spec for POST /coach/create
      // Expected format: { name, email, password, contact_number, certificates, bio, specialty, workingHours }
      const formattedData = {
        name: values.name,
        email: values.email,
        password: values.password,
        contact_number: values.contact_number,
        certificates: values.certificates,
        bio: values.bio,
        specialty: values.specialty,
        workingHours: workingHours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime,
          endTime: hour.endTime,
        })),
      };

      const response = await createCoach(formattedData);

      if (response) {
        message.success("Tạo huấn luyện viên mới thành công!");
        setModalVisible(false);
        form.resetFields();
        workingHoursForm.resetFields();
        setWorkingHours([]);

        // Refresh coaches list
        fetchCoaches();
      }
    } catch (error) {
      console.error("Error creating coach:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Không thể tạo huấn luyện viên. Vui lòng thử lại.");
      }
    } finally {
      setCreating(false);
    }
  };

  const fetchCoachProfile = async (coachId) => {
    try {
      setProfileLoading(true);
      const response = await getCoachProfile(coachId);
      const profileData = response.data || response; // Handle both response formats

      // Populate the form with coach profile data
      form.setFieldsValue({
        name: profileData.name,
        email: profileData.email,
        contact_number: profileData.contactNumber || profileData.contact_number,
        certificates: profileData.certificates,
        bio: profileData.bio,
        specialty: profileData.specialty,
      });

      setWorkingHours(
        profileData.workingHour || profileData.workingHours || []
      );
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      message.error(
        "Không thể tải thông tin huấn luyện viên. Vui lòng thử lại sau."
      );
    } finally {
      setProfileLoading(false);
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
        full: profileData.full || false,
      };

      setSelectedCoach(mappedProfile);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      message.error(
        "Không thể tải thông tin huấn luyện viên. Vui lòng thử lại."
      );
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
        suggestion: values.suggestion,
      };

      await reportCoachAbsent(reportData);
      message.success(
        "Báo cáo vắng mặt huấn luyện viên đã được gửi thành công!"
      );
      closeAbsentReportModal();
    } catch (error) {
      console.error("Error reporting coach absent:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Không thể gửi báo cáo vắng mặt. Vui lòng thử lại.");
      }
    } finally {
      setReportingAbsent(false);
    }
  };

  const getWorkingHoursDisplay = (workingHours) => {
    if (!workingHours || workingHours.length === 0) {
      return "Không có lịch làm việc";
    }

    return workingHours
      .map(
        (schedule) =>
          `${schedule.dayOfWeek}: ${schedule.startTime} - ${schedule.endTime}`
      )
      .join(", ");
  };

  const getAvailabilityStatus = (coach) => {
    if (coach.full) {
      return { color: "red", text: "Đầy" };
    }

    const availableSlots = 10 - coach.currentMemberAssignedCount;
    if (availableSlots > 10) {
      return { color: "green", text: "Có sẵn" };
    } else if (availableSlots > 5) {
      return { color: "orange", text: "Giới hạn" };
    } else {
      return { color: "red", text: "Gần đầy" };
    }
  };

  const columns = [
    {
      title: "Huấn luyện viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: "16px" }}>
              {text}
            </Text>
            <br />
            <Text type="secondary">
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
      width: "22%",
    },
    {
      title: "Liên hệ",
      dataIndex: "contact_number",
      key: "contact_number",
      render: (contact) => (
        <Text>
          <PhoneOutlined /> {contact}
        </Text>
      ),
      width: "12%",
    },
    {
      title: "Chứng chỉ",
      dataIndex: "certificates",
      key: "certificates",
      render: (certificates) => (
        <Text ellipsis style={{ maxWidth: 150 }}>
          {certificates || "Chưa xác định"}
        </Text>
      ),
      ellipsis: true,
      width: "13%",
    },
    {
      title: "Giờ làm việc",
      dataIndex: "workingHours",
      key: "workingHours",
      render: (workingHours) => (
        <div>
          {workingHours && workingHours.length > 0 ? (
            workingHours.slice(0, 2).map((schedule, index) => (
              <div key={index} style={{ fontSize: "12px" }}>
                <Text>
                  <ClockCircleOutlined /> {schedule.dayOfWeek}:{" "}
                  {schedule.startTime} - {schedule.endTime}
                </Text>
              </div>
            ))
          ) : (
            <Text type="secondary">Không có lịch</Text>
          )}
          {workingHours && workingHours.length > 2 && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              +{workingHours.length - 2} lịch khác...
            </Text>
          )}
        </div>
      ),
      width: "16%",
    },
    {
      title: "Thành viên hiện tại",
      dataIndex: "currentMemberAssignedCount",
      key: "currentMemberAssignedCount",
      render: (count, record) => {
        const maxMembers = 10;
        const percentage = (count / maxMembers) * 100;
        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              strokeColor={
                percentage >= 90
                  ? "#ff4d4f"
                  : percentage >= 70
                  ? "#faad14"
                  : "#52c41a"
              }
              showInfo={false}
            />
            <Text style={{ fontSize: "12px" }}>
              {count}/{maxMembers}
            </Text>
          </div>
        );
      },
      sorter: (a, b) =>
        a.currentMemberAssignedCount - b.currentMemberAssignedCount,
      width: "12%",
    },
    {
      title: "Trạng thái",
      key: "availability",
      render: (_, record) => {
        const status = getAvailabilityStatus(record);
        return (
          <Badge
            status={
              status.color === "green"
                ? "success"
                : status.color === "orange"
                ? "warning"
                : "error"
            }
            text={status.text}
          />
        );
      },
      filters: [
        { text: "Có sẵn", value: "available" },
        { text: "Giới hạn", value: "limited" },
        { text: "Đầy", value: "full" },
      ],
      onFilter: (value, record) => {
        const status = getAvailabilityStatus(record);
        return status.text.toLowerCase().includes(value);
      },
      width: "10%",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record.coachId)}
          >
            Xem hồ sơ
          </Button>
          <Button
            type="default"
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => showAbsentReportModal(record)}
            style={{ borderColor: "#faad14", color: "#faad14" }}
          >
            Báo cáo vắng mặt
          </Button>
        </Space>
      ),
      width: "16%",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Calculate summary statistics
  const totalCoaches = pagination.total || 0; // Use total from pagination instead of current page
  const availableCoaches = coaches.filter((coach) => !coach.full).length;
  const fullCoaches = coaches.filter((coach) => coach.full).length;
  const averageMembers =
    coaches.length > 0
      ? (
          coaches.reduce(
            (sum, coach) => sum + coach.currentMemberAssignedCount,
            0
          ) / coaches.length
        ).toFixed(1)
      : 0;

  return (
    <div className="coach-management">
      <div className="container py-4">
        <Title level={2}>
          <TeamOutlined /> Quản lý Huấn luyện viên
        </Title>

        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số Huấn luyện viên"
                value={totalCoaches}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Huấn luyện viên Có sẵn"
                value={availableCoaches}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Huấn luyện viên Đầy"
                value={fullCoaches}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="TB Thành viên/Huấn luyện viên"
                value={averageMembers}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Tất cả Huấn luyện viên"
          extra={
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={showCreateModal}
            >
              Tạo Huấn luyện viên Mới
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
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong tổng số ${total} huấn luyện viên`,
            }}
            onChange={handleTableChange}
          />
        </Card>

        {/* Create Coach Modal */}
        <Modal
          title="Tạo Huấn luyện viên Mới"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={creating}
              onClick={handleSubmit}
            >
              Tạo Huấn luyện viên
            </Button>,
          ]}
          width={800}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Vui lòng nhập email hợp lệ" },
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
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact_number"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
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
                  rules={[
                    { required: true, message: "Vui lòng chọn chuyên môn" },
                  ]}
                >
                  <Select placeholder="Chọn chuyên môn">
                    {specialties.map((specialty) => (
                      <Option key={specialty} value={specialty}>
                        {specialty}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="certificates"
                  label="Chứng chỉ"
                  rules={[
                    { required: true, message: "Vui lòng nhập chứng chỉ" },
                  ]}
                >
                  <Input placeholder="Nhập chứng chỉ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bio"
              label="Tiểu sử"
              rules={[{ required: true, message: "Vui lòng nhập tiểu sử" }]}
            >
              <TextArea rows={4} placeholder="Nhập tiểu sử huấn luyện viên" />
            </Form.Item>

            {/* Working Hours Section */}
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Giờ làm việc</Title>

              <Form
                form={workingHoursForm}
                layout="inline"
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  name="dayOfWeek"
                  rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
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
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                  ]}
                >
                  <TimePicker format="HH:mm" placeholder="Giờ bắt đầu" />
                </Form.Item>

                <Form.Item
                  name="endTime"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ kết thúc" },
                  ]}
                >
                  <TimePicker format="HH:mm" placeholder="Giờ kết thúc" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={addWorkingHour}
                    icon={<PlusOutlined />}
                  >
                    Thêm Giờ làm việc
                  </Button>
                </Form.Item>
              </Form>

              {/* Display Added Working Hours */}
              {workingHours.length > 0 && (
                <div>
                  <Text strong>Giờ làm việc đã thêm:</Text>
                  {workingHours.map((hour, index) => (
                    <div
                      key={index}
                      style={{
                        marginTop: 8,
                        padding: 8,
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                      }}
                    >
                      <Space>
                        <CalendarOutlined />
                        <Text>
                          {hour.dayOfWeek}: {hour.startTime} - {hour.endTime}
                        </Text>
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
            </div>
          </Form>
        </Modal>

        {/* Coach Profile View Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <InfoCircleOutlined
                style={{ marginRight: 8, color: "#1890ff" }}
              />
              Chi tiết Hồ sơ Huấn luyện viên
            </div>
          }
          visible={profileModalVisible}
          onCancel={closeProfileModal}
          footer={[
            <Button key="close" onClick={closeProfileModal}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {profileLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
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
                  <Title level={3} style={{ marginBottom: 8 }}>
                    {selectedCoach.name}
                  </Title>
                  <Space direction="vertical" size={4}>
                    <Text>
                      <MailOutlined /> {selectedCoach.email}
                    </Text>
                    <Text>
                      <PhoneOutlined />{" "}
                      {selectedCoach.contactNumber ||
                        selectedCoach.contact_number}
                    </Text>
                    <Tag color="blue">{selectedCoach.specialty}</Tag>
                  </Space>
                </Col>
              </Row>

              {/* Coach Details */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card size="small" title="Thông tin Chuyên môn">
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text strong>Chứng chỉ:</Text>
                        <br />
                        <Text>
                          {selectedCoach.certificates || "Chưa xác định"}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Chuyên môn:</Text>
                        <br />
                        <Text>{selectedCoach.specialty}</Text>
                      </div>
                      <div>
                        <Text strong>Thành viên hiện tại:</Text>
                        <br />
                        <Text>
                          {selectedCoach.currentMemberAssignedCount || 0}/10
                        </Text>
                      </div>
                      <div>
                        <Text strong>Trạng thái:</Text>
                        <br />
                        <Badge
                          status={selectedCoach.full ? "error" : "success"}
                          text={selectedCoach.full ? "Đã đầy" : "Có sẵn"}
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Giờ làm việc">
                    {selectedCoach.workingHours &&
                    selectedCoach.workingHours.length > 0 ? (
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        {selectedCoach.workingHours.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {schedule.dayOfWeek}: {schedule.startTime} -{" "}
                              {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : selectedCoach.workingHour &&
                      selectedCoach.workingHour.length > 0 ? (
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        {selectedCoach.workingHour.map((schedule, index) => (
                          <div key={index}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            <Text>
                              {schedule.dayOfWeek}: {schedule.startTime} -{" "}
                              {schedule.endTime}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa xác định giờ làm việc</Text>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Biography */}
              {selectedCoach.bio && (
                <Card size="small" title="Tiểu sử" style={{ marginTop: 16 }}>
                  <Text>{selectedCoach.bio}</Text>
                </Card>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="secondary">
                Không có dữ liệu hồ sơ huấn luyện viên
              </Text>
            </div>
          )}
        </Modal>

        {/* Coach Absent Report Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <ExclamationCircleOutlined
                style={{ marginRight: 8, color: "#faad14" }}
              />
              Báo cáo Huấn luyện viên Vắng mặt
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
              style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
            >
              Gửi Báo cáo
            </Button>,
          ]}
          width={600}
        >
          {selectedCoach && (
            <div>
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: "#fafafa",
                  borderRadius: 6,
                }}
              >
                <Text strong>Huấn luyện viên: </Text>
                <Text>{selectedCoach.name}</Text>
                <br />
                <Text strong>Email: </Text>
                <Text>{selectedCoach.email}</Text>
              </div>

              <Form form={absentReportForm} layout="vertical">
                <Form.Item
                  name="reason"
                  label="Lý do vắng mặt"
                  rules={[
                    { required: true, message: "Vui lòng nhập lý do vắng mặt" },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Vui lòng mô tả lý do tại sao huấn luyện viên này được báo cáo vắng mặt..."
                  />
                </Form.Item>

                <Form.Item
                  name="suggestion"
                  label="Đề xuất cho Thành viên"
                  rules={[
                    {
                      required: true,
                      message:
                        "Vui lòng nhập đề xuất cho các thành viên bị ảnh hưởng",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Vui lòng đưa ra đề xuất hoặc giải pháp thay thế cho các thành viên được phân công cho huấn luyện viên này..."
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
