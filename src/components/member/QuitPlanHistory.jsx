import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Avatar,
  Tooltip,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import {
  HistoryOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getOldPlansOfMember } from "../../services/quitPlanService";
import { getCurrentUser } from "../../services/authService";
import "../../styles/Dashboard.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const QuitPlanHistory = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const user = getCurrentUser();
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchQuitPlanHistory();
    } else {
      setLoading(false);
      message.error("Vui lòng đăng nhập để xem lịch sử kế hoạch cai thuốc");
    }
  }, [pagination.current, pagination.pageSize, userId]);

  useEffect(() => {
    filterPlans();
  }, [searchTerm, statusFilter, dateRange, plans]);

  const fetchQuitPlanHistory = async () => {
    try {
      setLoading(true);
      const response = await getOldPlansOfMember(
        userId,
        pagination.current - 1,
        pagination.pageSize
      );

      // Ensure response is an array
      const plansArray = Array.isArray(response.content)
        ? response.content
        : [];
      setPlans(plansArray);
      console.log(plans);
      setPagination((prev) => ({
        ...prev,
        total: plansArray.length,
      }));
    } catch (error) {
      console.error("Error fetching quit plan history:", error);
      message.error("Không thể tải lịch sử kế hoạch cai thuốc");
      setPlans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    // Ensure plans is an array before filtering
    if (!Array.isArray(plans)) {
      setFilteredPlans([]);
      return;
    }

    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          (plan.coachName &&
            plan.coachName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (plan.copingStrategies &&
            plan.copingStrategies
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (plan.smokingTriggersToAvoid &&
            plan.smokingTriggersToAvoid
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (plan.motivation &&
            plan.motivation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (plan) => plan.quitPlanStatus === statusFilter
      );
    }

    if (dateRange.length === 2) {
      filtered = filtered.filter((plan) => {
        const planDate = moment(plan.startDate);
        return planDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });
    }

    setFilteredPlans(filtered);
  };

  const handleViewDetail = (plan) => {
    setSelectedPlan(plan);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "FAILED":
        return "red";
      case "PENDING":
        return "orange";
      case "ACTIVE":
        return "blue";
      case "REJECTED":
        return "red";
      case "IN_PROGRESS":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined />;
      case "FAILED":
        return <CloseCircleOutlined />;
      case "PENDING":
        return <ClockCircleOutlined />;
      case "ACTIVE":
        return <ClockCircleOutlined />;
      case "REJECTED":
        return <CloseCircleOutlined />;
      case "IN_PROGRESS":
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Hoàn thành";
      case "FAILED":
        return "Thất bại";
      case "PENDING":
        return "Chờ xử lý";
      case "ACTIVE":
        return "Đang hoạt động";
      case "REJECTED":
        return "Bị từ chối";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      default:
        return status;
    }
  };

  const getSmokingStatusText = (status) => {
    switch (status) {
      case "NONE":
        return "Không hút";
      case "LIGHT":
        return "Nhẹ";
      case "MEDIUM":
        return "Trung bình";
      case "HEAVY":
        return "Nặng";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const calculateDuration = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, "days");
  };

  const calculateProgress = (plan) => {
    const now = moment();
    const start = moment(plan.startDate);
    const end = moment(plan.endDate);
    const totalDays = end.diff(start, "days");

    if (plan.quitPlanStatus === "COMPLETED") {
      return 100;
    }

    if (now.isBefore(start)) {
      return 0;
    }

    if (now.isAfter(end)) {
      return 100;
    }

    const daysPassed = now.diff(start, "days");
    return Math.round((daysPassed / totalDays) * 100);
  };

  const columns = [
    {
      title: "Thời gian kế hoạch",
      key: "period",
      render: (_, record) => (
        <div>
          <Text strong>{formatDate(record.startDate)}</Text>
          <br />
          <Text type="secondary">đến {formatDate(record.endDate)}</Text>
          <br />
          <Text type="secondary">
            ({calculateDuration(record.startDate, record.endDate)} ngày)
          </Text>
        </div>
      ),
    },
    {
      title: "Huấn luyện viên",
      key: "coach",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{record.coachName}</Text>
        </Space>
      ),
    },
    {
      title: "Tiến độ",
      key: "progress",
      render: (_, record) => {
        const progress = calculateProgress(record);
        const totalDays = calculateDuration(record.startDate, record.endDate);
        const daysPassed = moment().diff(moment(record.startDate), "days");

        return (
          <div>
            <Progress
              percent={progress}
              size="small"
              strokeColor={getStatusColor(record.quitPlanStatus)}
            />
            <Text type="secondary">
              {Math.max(0, Math.min(daysPassed, totalDays))}/{totalDays} ngày
            </Text>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "quitPlanStatus",
      key: "quitPlanStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Tình trạng hút thuốc",
      dataIndex: "currentSmokingStatus",
      key: "currentSmokingStatus",
      render: (status) => {
        const getSmokingStatusColor = (status) => {
          switch (status) {
            case "NONE":
              return "green";
            case "LIGHT":
              return "orange";
            case "MEDIUM":
              return "red";
            case "HEAVY":
              return "volcano";
            default:
              return "default";
          }
        };

        return (
          <Tag color={getSmokingStatusColor(status)}>
            {getSmokingStatusText(status)}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const overallStats = {
    totalPlans: Array.isArray(plans) ? plans.length : 0,
    completedPlans: Array.isArray(plans)
      ? plans.filter((p) => p.quitPlanStatus === "COMPLETED").length
      : 0,
    activePlans: Array.isArray(plans)
      ? plans.filter((p) => p.quitPlanStatus === "ACTIVE").length
      : 0,
    pendingPlans: Array.isArray(plans)
      ? plans.filter((p) => p.quitPlanStatus === "PENDING").length
      : 0,
  };

  return (
    <div className="quit-plan-history">
      <div className="container py-4">
        <Title level={2}>
          <HistoryOutlined /> Lịch sử kế hoạch cai thuốc
        </Title>

        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tổng số kế hoạch"
                value={overallStats.totalPlans}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Kế hoạch hoàn thành"
                value={overallStats.completedPlans}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Kế hoạch đang hoạt động"
                value={overallStats.activePlans}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Kế hoạch chờ xử lý"
                value={overallStats.pendingPlans}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm kiếm theo huấn luyện viên, chiến lược, kích thích, hoặc động lực..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="FAILED">Thất bại</Option>
                <Option value="PENDING">Chờ xử lý</Option>
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="REJECTED">Bị từ chối</Option>
                <Option value="IN_PROGRESS">Đang thực hiện</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
          </Row>
        </Card>

        {/* Plans Table */}
        <Card>
          <Table
            dataSource={filteredPlans}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong tổng ${total} kế hoạch`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              Chi tiết kế hoạch -{" "}
              {selectedPlan && formatDate(selectedPlan.startDate)}
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedPlan && (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Thông tin kế hoạch">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Thời gian:</Text>
                      <br />
                      <Text>
                        {formatDate(selectedPlan.startDate)} -{" "}
                        {formatDate(selectedPlan.endDate)}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Huấn luyện viên:</Text>
                      <br />
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text>{selectedPlan.coachName}</Text>
                      </Space>
                    </div>
                    <div>
                      <Text strong>Tình trạng hút thuốc hiện tại:</Text>
                      <br />
                      <Tag color="blue">
                        {getSmokingStatusText(
                          selectedPlan.currentSmokingStatus
                        )}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Tác nhân kích thích cần tránh:</Text>
                      <br />
                      <Text>{selectedPlan.smokingTriggersToAvoid}</Text>
                    </div>
                    <div>
                      <Text strong>Chiến lược đối phó:</Text>
                      <br />
                      <Text>{selectedPlan.copingStrategies}</Text>
                    </div>
                    <div>
                      <Text strong>Thuốc sử dụng:</Text>
                      <br />
                      <Text>{selectedPlan.medicationsToUse}</Text>
                    </div>
                    <div>
                      <Text strong>Hướng dẫn sử dụng thuốc:</Text>
                      <br />
                      <Text>{selectedPlan.medicationInstructions}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Kết quả & Động lực">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Trạng thái:</Text>
                      <br />
                      <Tag
                        color={getStatusColor(selectedPlan.quitPlanStatus)}
                        icon={getStatusIcon(selectedPlan.quitPlanStatus)}
                      >
                        {getStatusText(selectedPlan.quitPlanStatus)}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Tiến độ:</Text>
                      <br />
                      <Progress
                        percent={calculateProgress(selectedPlan)}
                        strokeColor={getStatusColor(
                          selectedPlan.quitPlanStatus
                        )}
                      />
                      <Text type="secondary">
                        Tổng cộng{" "}
                        {calculateDuration(
                          selectedPlan.startDate,
                          selectedPlan.endDate
                        )}{" "}
                        ngày
                      </Text>
                    </div>
                    <div>
                      <Text strong>Động lực:</Text>
                      <br />
                      <Text>{selectedPlan.motivation}</Text>
                    </div>
                    <div>
                      <Text strong>Kế hoạch thưởng:</Text>
                      <br />
                      <Text>{selectedPlan.rewardPlan}</Text>
                    </div>
                    <div>
                      <Text strong>Nguồn hỗ trợ:</Text>
                      <br />
                      <Text>{selectedPlan.supportResources}</Text>
                    </div>
                    <div>
                      <Text strong>Ghi chú thêm:</Text>
                      <br />
                      <Text>{selectedPlan.additionalNotes}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default QuitPlanHistory;
