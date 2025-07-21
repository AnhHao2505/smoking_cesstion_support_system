import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Avatar,
  Typography,
  Modal,
  Form,
  Input,
  Spin,
  message,
  Badge,
  Progress,
  Row,
  Col,
  Statistic,
  Tooltip,
  Alert,
  Rate,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  MessageOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getAllCoaches,
  chooseCoach,
  getAssignedMembers,
} from "../../services/coachManagementService";
import {
  submitFeedbackToCoach,
  submitFeedbackToAnyCoach,
  submitFeedbackToPlatform,
} from "../../services/feebackService";
import { getCoachProfile } from '../../services/profileService';
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AppointmentManagement = () => {
  const { currentUser } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackCoach, setFeedbackCoach] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [assignedMembersModalVisible, setAssignedMembersModalVisible] =
    useState(false);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [loadingAssignedMembers, setLoadingAssignedMembers] = useState(false);
  const [selectedCoachForMembers, setSelectedCoachForMembers] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0
  });
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [coachProfile, setCoachProfile] = useState(null);
  const [totalCoaches, setTotalCoaches] = useState(0);
  
  const userId = currentUser?.userId;

  useEffect(() => {
    fetchCoaches();
  }, [pagination.current, pagination.pageSize]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await getAllCoaches(
        pagination.current - 1,
        pagination.pageSize
      );

      if (response && response.content) {
        setCoaches(response.content);
        setPagination((prev) => ({
          ...prev,
          total: response.totalElements,
        }));
        setTotalCoaches(response.totalElements);
      } else {
        setCoaches([]);
        message.warning("No coaches found");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error("Failed to load coaches. Please try again later.");
      setCoaches([]);
      setLoading(false);
    }
  };

  const handleChooseCoach = (coach) => {
    setSelectedCoach(coach);
    setConfirmModalVisible(true);
  };

  const confirmChooseCoach = async () => {
    try {
      setSelecting(true);
      const response = await chooseCoach(selectedCoach.coachId);

      if (response.success) {
        message.success(
          response.message || "Chọn huấn luyện viên thành công!"
        );
        setConfirmModalVisible(false);

        // Refresh coaches list to update their current member counts
        fetchCoaches();

        // Optionally redirect to dashboard or appointment booking page
        // navigate('/member/dashboard');
      }else {
        message.error(
          response.message
        );
      }
    } catch (error) {
      console.error("Error choosing coach:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Failed to select coach. Please try again.");
      }
    } finally {
      setSelecting(false);
    }
  };

  const handleShowFeedback = (coach) => {
    setFeedbackCoach(coach);
    setFeedbackModalVisible(true);
    feedbackForm.resetFields();
  };

  const handleSubmitFeedback = async (values) => {
    try {
      setSubmittingFeedback(true);
      const feedbackData = {
        content: values.content,
        star: values.star,
        coachId: feedbackCoach.coachId,
      };

      const response = await submitFeedbackToAnyCoach(feedbackData);

      if (response.success) {
        message.success(
          `Cảm ơn bạn đã gửi phản hồi về huấn luyện viên ${feedbackCoach.name}!`
        );
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
      } else {
        message.error(
          response.message || "Không thể gửi phản hồi. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleViewAssignedMembers = async (coach) => {
    try {
      setSelectedCoachForMembers(coach);
      setAssignedMembersModalVisible(true);
      setLoadingAssignedMembers(true);

      const response = await getAssignedMembers(coach.coachId);

      if (response) {
        setAssignedMembers(response);
      } else {
        setAssignedMembers([]);
        message.info("Huấn luyện viên này chưa có thành viên nào được gán.");
      }
    } catch (error) {
      console.error("Error fetching assigned members:", error);
      message.error("Không thể tải danh sách thành viên. Vui lòng thử lại!");
      setAssignedMembers([]);
    } finally {
      setLoadingAssignedMembers(false);
    }
  };

  // Handler to view coach profile
  const handleViewProfile = async (coach) => {
    setProfileModalVisible(true);
    setProfileLoading(true);
    try {
      const response = await getCoachProfile(coach.coachId);
      setCoachProfile(response.data || response);
    } catch (error) {
      message.error('Không thể tải thông tin huấn luyện viên');
      setCoachProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const renderStarDescription = (value) => {
    const descriptions = {
      1: "Rất không hài lòng",
      2: "Không hài lòng",
      3: "Bình thường",
      4: "Hài lòng",
      5: "Rất hài lòng",
    };
    return descriptions[value] || "";
  };

  const getWorkingHoursDisplay = (workingHours) => {
    if (!workingHours || workingHours.length === 0) {
      return "Không có lịch trình";
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

    const availableSlots = 10 - coach.currentMemberAssignedCount; // Assuming max 20 members per coach
    if (availableSlots > 10) {
      return { color: "green", text: "Có sẵn" };
    } else if (availableSlots > 5) {
      return { color: "orange", text: "Hạn chế" };
    } else {
      return { color: "red", text: "Gần đầy" };
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
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
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    // {
    //   title: 'Liên hệ',
    //   dataIndex: 'contact_number',
    //   key: 'contact_number',
    //   render: (contact) => (
    //     <Text><CalendarOutlined /> {contact}</Text>
    //   )
    // },
    // {
    //   title: 'Chứng chỉ',
    //   dataIndex: 'certificates',
    //   key: 'certificates',
    //   render: (certificates) => (
    //     <Text ellipsis style={{ maxWidth: 200 }}>
    //       {certificates || 'Chưa cập nhật'}
    //     </Text>
    //   ),
    //   ellipsis: true
    // },
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
            <Text type="secondary">Chưa có lịch</Text>
          )}
          {workingHours && workingHours.length > 2 && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              +{workingHours.length - 2} khung giờ khác...
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Thành viên hiện tại",
      dataIndex: "currentMemberAssignedCount",
      key: "currentMemberAssignedCount",
      render: (count, record) => {
        const maxMembers = 10; // Assuming max capacity
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
    },
    {
      title: "Tình trạng",
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
        { text: "Hạn chế", value: "limited" },
        { text: "Đầy", value: "full" },
      ],
      onFilter: (value, record) => {
        const status = getAvailabilityStatus(record);
        return status.text.toLowerCase().includes(value);
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const canSelect =
          !record.full && record.workingHours && record.workingHours.length > 0;

        return (
          <Space size="small" direction="vertical">
            <Space size="small">
              {canSelect ? (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleChooseCoach(record)}
                  size="small"
                >
                  Chọn HLV
                </Button>
              ) : (
                <Tooltip
                  title={
                    record.full
                      ? "Huấn luyện viên đã đầy"
                      : "Không có giờ làm việc"
                  }
                >
                  <Button
                    disabled
                    icon={<ExclamationCircleOutlined />}
                    size="small"
                  >
                    Không có sẵn
                  </Button>
                </Tooltip>
              )}
            </Space>
            <Space size="small" style={{ width: "100%" }}>
              <Button
                type="default"
                icon={<StarOutlined />}
                onClick={() => handleShowFeedback(record)}
                size="small"
                style={{ flex: 1 }}
              >
                Đánh giá
              </Button>
            </Space>
            {/* <Space size="small" style={{ width: "100%" }}>
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => handleViewAssignedMembers(record)}
                size="small"
                style={{ flex: 1 }}
              >
                Xem thành viên
              </Button>
            </Space> */}
            <Space size="small" style={{ width: '100%' }}>
              <Button 
                type="default" 
                icon={<EyeOutlined />}
                onClick={() => handleViewProfile(record)}
                size="small"
                style={{ flex: 1 }}
              >
                Xem profile
              </Button>
            </Space>
          </Space>
        );
      },
      width: 180,
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
    <div className="coach-selection">
      <div className="container py-4">
        <Title level={2}>
          <TeamOutlined /> Chọn Huấn Luyện Viên
        </Title>

        <Paragraph>
          Chọn một huấn luyện viên có trình độ để hướng dẫn bạn trong hành trình
          cai thuốc lá. Mỗi huấn luyện viên có chuyên môn và lịch trình riêng để
          hỗ trợ kế hoạch cai thuốc của bạn.
        </Paragraph>

        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số huấn luyện viên"
                value={totalCoaches}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Huấn luyện viên có sẵn"
                value={availableCoaches}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Huấn luyện viên đã đầy"
                value={fullCoaches}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Trung bình thành viên/HLV"
                value={averageMembers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Danh sách huấn luyện viên">
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
                `${range[0]}-${range[1]} của ${total} huấn luyện viên`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận chọn huấn luyện viên"
          visible={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setConfirmModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={selecting}
              onClick={confirmChooseCoach}
            >
              Xác nhận chọn
            </Button>,
          ]}
        >
          {selectedCoach && (
            <div>
              <Alert
                message="Bạn sắp chọn huấn luyện viên"
                description="Sau khi chọn huấn luyện viên, họ sẽ hướng dẫn bạn trong hành trình cai thuốc lá. Bạn có thể thay đổi huấn luyện viên sau nếu cần."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Card size="small">
                <Space>
                  <Avatar size="large" icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ fontSize: "16px" }}>
                      {selectedCoach.name}
                    </Text>
                    <br />
                    <Text type="secondary">{selectedCoach.email}</Text>
                    <br />
                    <Text type="secondary">
                      Liên hệ: {selectedCoach.contact_number}
                    </Text>
                  </div>
                </Space>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Chứng chỉ:</Text>
                  <br />
                  <Text>{selectedCoach.certificates || "Chưa cập nhật"}</Text>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Giờ làm việc:</Text>
                  <br />
                  {selectedCoach.workingHours &&
                  selectedCoach.workingHours.length > 0 ? (
                    selectedCoach.workingHours.map((schedule, index) => (
                      <div key={index}>
                        <Text>
                          {schedule.dayOfWeek}: {schedule.startTime} -{" "}
                          {schedule.endTime}
                        </Text>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">Không có lịch trình</Text>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Thành viên hiện tại: </Text>
                  <Text>{selectedCoach.currentMemberAssignedCount}/10</Text>
                </div>
              </Card>
            </div>
          )}
        </Modal>

        {/* Feedback Modal */}
        <Modal
          title={
            <Space>
              <StarOutlined />
              <span>Đánh giá huấn luyện viên</span>
            </Space>
          }
          visible={feedbackModalVisible}
          onCancel={() => {
            setFeedbackModalVisible(false);
            feedbackForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          {feedbackCoach && (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space>
                  <Avatar size="large" icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ fontSize: "16px" }}>
                      {feedbackCoach.name}
                    </Text>
                    <br />
                    <Text type="secondary">{feedbackCoach.email}</Text>
                  </div>
                </Space>
              </Card>

              <Form
                form={feedbackForm}
                layout="vertical"
                onFinish={handleSubmitFeedback}
              >
                <Form.Item
                  name="star"
                  label="Đánh giá sao"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn số sao đánh giá!",
                    },
                  ]}
                >
                  <Rate
                    tooltips={[
                      "Rất không hài lòng",
                      "Không hài lòng",
                      "Bình thường",
                      "Hài lòng",
                      "Rất hài lòng",
                    ]}
                    onChange={(value) => {
                      // Optional: Show description below rating
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Nội dung phản hồi"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập nội dung phản hồi!",
                    },
                    {
                      min: 10,
                      message: "Nội dung phản hồi phải có ít nhất 10 ký tự!",
                    },
                    {
                      max: 500,
                      message:
                        "Nội dung phản hồi không được vượt quá 500 ký tự!",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Hãy chia sẻ trải nghiệm của bạn về huấn luyện viên này..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                  <Space>
                    <Button
                      onClick={() => {
                        setFeedbackModalVisible(false);
                        feedbackForm.resetFields();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submittingFeedback}
                      icon={<SendOutlined />}
                    >
                      Gửi đánh giá
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* Assigned Members Modal */}
        <Modal
          title={
            <Space>
              <TeamOutlined />
              <span>Thành viên được gán</span>
              {selectedCoachForMembers && (
                <Text type="secondary">- {selectedCoachForMembers.name}</Text>
              )}
            </Space>
          }
          visible={assignedMembersModalVisible}
          onCancel={() => {
            setAssignedMembersModalVisible(false);
            setSelectedCoachForMembers(null);
            setAssignedMembers([]);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setAssignedMembersModalVisible(false);
                setSelectedCoachForMembers(null);
                setAssignedMembers([]);
              }}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {loadingAssignedMembers ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Đang tải danh sách thành viên...</Text>
              </div>
            </div>
          ) : (
            <div>
              {assignedMembers && assignedMembers.length > 0 ? (
                <div>
                  <Alert
                    message={`Huấn luyện viên này có ${assignedMembers.length} thành viên được gán`}
                    type="info"
                    style={{ marginBottom: 16 }}
                    showIcon
                  />

                  <Table
                    dataSource={assignedMembers}
                    pagination={false}
                    size="small"
                    rowKey={(record) => record.memberId || record.id}
                    columns={[
                      {
                        title: "Tên thành viên",
                        dataIndex: "name",
                        key: "name",
                        render: (text, record) => (
                          <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <div>
                              <Text strong>{text || "Không có tên"}</Text>
                              <br />
                            </div>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <ExclamationCircleOutlined
                    style={{ fontSize: "48px", color: "#ccc" }}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      Huấn luyện viên này chưa có thành viên nào được gán
                    </Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Coach Profile Modal */}
        <Modal
          title={
            <Space>
              <UserOutlined />
              <span>Thông tin huấn luyện viên</span>
            </Space>
          }
          visible={profileModalVisible}
          onCancel={() => {
            setProfileModalVisible(false);
            setCoachProfile(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setProfileModalVisible(false);
              setCoachProfile(null);
            }}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {profileLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : coachProfile ? (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space>
                  <Avatar size="large" src={coachProfile.photo_url} icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>{coachProfile.full_name}</Text>
                    <br />
                    <Text type="secondary">{coachProfile.email}</Text>
                    <br />
                    <Text type="secondary">Liên hệ: {coachProfile.contactNumber || coachProfile.contact_number}</Text>
                  </div>
                </Space>
              </Card>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Chuyên môn:</Text> <Tag color="blue">{coachProfile.specialty}</Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Chứng chỉ:</Text>
                <br />
                {coachProfile.certificates}
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Giờ làm việc:</Text>
                <br />
                {coachProfile.workingHour && coachProfile.workingHour.length > 0
                  ? coachProfile.workingHour.map((schedule, idx) => (
                      <div key={idx}>
                        <Text>{schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}</Text>
                      </div>
                    ))
                  : <Text type="secondary">Không có lịch trình</Text>
                }
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Giới thiệu:</Text>
                <Paragraph>{coachProfile.bio || 'Chưa có thông tin.'}</Paragraph>
              </div>
            </div>
          ) : (
            <Text type="secondary">Không có dữ liệu huấn luyện viên</Text>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentManagement;

// Add some custom styling
const styles = `
  .coach-selection .ant-table-tbody > tr:hover > td {
    background-color: #f5f5f5;
  }
  
  .coach-selection .ant-progress-text {
    font-size: 10px !important;
  }
  
  .coach-selection .ant-statistic-content {
    font-size: 20px;
  }
  
  .coach-selection .ant-card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .coach-selection .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
  }
  
  .coach-selection .ant-table {
    width: 100% !important;
    min-width: 1500px;
  }
  
  .coach-selection .ant-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  
  .coach-selection .ant-card-body {
    padding: 24px;
  }
  
  .coach-selection .container {
    max-width: 100%;
    width: 100%;
    padding: 0 20px;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
