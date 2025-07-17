import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Badge,
  Tabs,
  Pagination,
  message,
  Tooltip,
  Form,
  Modal,
  Input,
  Select,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StarOutlined,
  RiseOutlined,
  FileTextOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EyeInvisibleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import * as adminDashboardService from "../../services/adminDashboardService";
import * as userService from "../../services/userService";
import * as feedbackService from "../../services/feebackService";
import * as reminderService from "../../services/reminderService";
import "../../styles/Dashboard.css";
import "../../styles/AdminDashboard.css";
import "../../styles/LandingPage.css"; // Import cho tab styling

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({});

  // Users data state
  const [usersData, setUsersData] = useState({
    content: [],
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false,
  });

  // Feedback data state
  const [feedbackData, setFeedbackData] = useState([]);
  const [publishedFeedbacks, setPublishedFeedbacks] = useState([]);
  const [unreviewedFeedbacks, setUnreviewedFeedbacks] = useState([]);

  // Reminder data state
  const [reminderData, setReminderData] = useState([]);
  const [reminderPagination, setReminderPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states for reminder management
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderForm] = Form.useForm();

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const stats = await adminDashboardService.getSystemOverview();
      setDashboardStats(stats || {});
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      message.error("Không thể tải thống kê dashboard");
      setDashboardStats({});
    }
  };

  // Fetch users data
  const fetchUsersData = async (page = 0, size = 10) => {
    try {
      setUsersLoading(true);
      const users = await userService.getAllUsers(page, size);
      setUsersData(
        users || {
          content: [],
          pageNo: 0,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
          last: false,
        }
      );
    } catch (error) {
      console.error("Error fetching users data:", error);
      message.error("Không thể tải dữ liệu người dùng");
      setUsersData({
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false,
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch feedback data
  const fetchFeedbackData = async () => {
    try {
      setFeedbackLoading(true);
      const [unreviewedFeedbacks, publishedFeedbacks] = await Promise.all([
        feedbackService.getUnreviewedFeedbacks(),
        feedbackService.getPublishedFeedbacks(),
      ]);
      setUnreviewedFeedbacks(unreviewedFeedbacks || []);
      setPublishedFeedbacks(publishedFeedbacks || []);
      // Keep the combined feedbackData for backward compatibility and stats
      setFeedbackData([
        ...(unreviewedFeedbacks || []),
        ...(publishedFeedbacks || []),
      ]);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      message.error("Không thể tải dữ liệu phản hồi");
      setUnreviewedFeedbacks([]);
      setPublishedFeedbacks([]);
      setFeedbackData([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fetch reminder data
  const fetchReminderData = async (page = 0, size = 10) => {
    try {
      setReminderLoading(true);
      const response = await reminderService.getAllReminders(page, size);
      console.log("Reminder response:", response); // Debug log

      if (response) {
        // Check if response has success property (from catch block with mock data)
        if (response.success === true && Array.isArray(response.data)) {
          // Mock data format - sort by creation date (newest first)
          const sortedData = response.data.sort((a, b) => {
            const dateA = new Date(a.createAt || a.createdAt || 0);
            const dateB = new Date(b.createAt || b.createdAt || 0);
            return dateB - dateA; // Descending order (newest first)
          });
          setReminderData(sortedData);
          setReminderPagination({
            current: page + 1,
            pageSize: size,
            total: response.data.length,
          });
        } else if (response.content) {
          // Real API data format (after handleApiResponse) - sort by creation date (newest first)
          const sortedContent = (response.content || []).sort((a, b) => {
            const dateA = new Date(a.createAt || a.createdAt || 0);
            const dateB = new Date(b.createAt || b.createdAt || 0);
            return dateB - dateA; // Descending order (newest first)
          });
          setReminderData(sortedContent);
          setReminderPagination({
            current: (response.pageNo || 0) + 1,
            pageSize: response.pageSize || size,
            total: response.totalElements || 0,
          });
        } else {
          // Fallback
          setReminderData([]);
          setReminderPagination({
            current: 1,
            pageSize: size,
            total: 0,
          });
        }
      } else {
        setReminderData([]);
        setReminderPagination({
          current: 1,
          pageSize: size,
          total: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching reminder data:", error);
      message.error("Không thể tải dữ liệu nhắc nhở");
      setReminderData([]);
      setReminderPagination({
        current: 1,
        pageSize: size,
        total: 0,
      });
    } finally {
      setReminderLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchUsersData(0, pageSize),
        fetchFeedbackData(),
        fetchReminderData(0, pageSize),
      ]);
      setLoading(false);
    };

    fetchInitialData();
  }, [pageSize]);

  // Handle pagination change
  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchUsersData(page - 1, size); // API uses 0-based pagination
  };

  // Handle user disable/enable
  const handleUserDisableToggle = async (record) => {
    console.log(record);
    try {
      if (record.role === "ADMIN") {
        message.warning("Không thể vô hiệu hóa tài khoản Admin");
        return;
      }

      const action = record.status ? "vô hiệu hóa" : "kích hoạt";
      const response = await userService.disableUser(record.id);

      if (response.success) {
        message.success(`${action} người dùng thành công`);
        // Refresh users data to show updated status
        fetchUsersData(currentPage - 1, pageSize);
      } else {
        message.error(`Không thể ${action} người dùng`);
      }
    } catch (error) {
      console.error(
        `Error ${record.status ? "disabling" : "enabling"} user:`,
        error
      );
      message.error(
        `Không thể ${record.status ? "vô hiệu hóa" : "kích hoạt"} người dùng`
      );
    }
  };

  // Handle user re-enable
  const handleUserReEnable = async (record) => {
    try {
      if (record.role === "ADMIN") {
        message.warning("Admin users cannot be re-enabled");
        return;
      }

      const response = await userService.reEnableUser(record.id);

      message.success("Người dùng đã được kích hoạt lại thành công");
      // Refresh users data to show updated status
      fetchUsersData(currentPage - 1, pageSize);
    } catch (error) {
      console.error("Error re-enabling user:", error);
      message.error("Failed to re-enable user");
    }
  };

  // Handle feedback approval
  const handleFeedbackApproval = async (feedbackId) => {
    try {
      const response = await feedbackService.approveFeedback(feedbackId);
      if (response.success) {
        message.success("Phản hồi đã được phê duyệt và xuất bản thành công");
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error("Failed to approve feedback");
      }
    } catch (error) {
      console.error("Error approving feedback:", error);
      message.error("Failed to approve feedback");
    }
  };

  // Handle feedback hiding
  const handleFeedbackHide = async (feedbackId) => {
    try {
      const response = await feedbackService.hideFeedback(feedbackId);
      if (response.success) {
        message.success("Phản hồi đã được ẩn thành công");
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error("Failed to hide feedback");
      }
    } catch (error) {
      console.error("Error hiding feedback:", error);
      message.error("Failed to hide feedback");
    }
  };

  // Handle marking feedback as reviewed
  const handleFeedbackReviewed = async (feedbackId) => {
    try {
      const response = await feedbackService.markFeedbackReviewed(feedbackId);
      if (response.success) {
        message.success("Feedback marked as reviewed");
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error("Failed to mark feedback as reviewed");
      }
    } catch (error) {
      console.error("Error marking feedback as reviewed:", error);
      message.error("Failed to mark feedback as reviewed");
    }
  };

  // Create new reminder
  const handleCreateReminder = async (content, category) => {
    try {
      const response = await reminderService.createReminder(content, category);
      if (response.success) {
        message.success("Nhắc nhở đã được tạo thành công");
        // Reset to first page to show newest reminder
        setReminderPagination((prev) => ({
          ...prev,
          current: 1,
        }));
        fetchReminderData(0, reminderPagination.pageSize);
      } else {
        message.error("Failed to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      message.error("Failed to create reminder");
    }
  };

  // Update existing reminder
  const handleUpdateReminder = async (reminderId, content, category) => {
    try {
      const response = await reminderService.updateReminder(
        reminderId,
        content,
        category
      );
      if (response.success) {
        message.success("Nhắc nhở đã được cập nhật thành công");
        fetchReminderData(
          reminderPagination.current - 1,
          reminderPagination.pageSize
        );
      } else {
        message.error("Failed to update reminder");
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      message.error("Failed to update reminder");
    }
  };

  // Disable reminder
  const handleDisableReminder = async (reminderId) => {
    try {
      const response = await reminderService.disableReminder(reminderId);
      if (response.success) {
        message.success("Nhắc nhở đã được vô hiệu hóa thành công");
        fetchReminderData(
          reminderPagination.current - 1,
          reminderPagination.pageSize
        );
      } else {
        message.error("Failed to disable reminder");
      }
    } catch (error) {
      console.error("Error disabling reminder:", error);
      message.error("Failed to disable reminder");
    }
  };

  // Re-enable reminder
  const handleReEnableReminder = async (reminderId) => {
    try {
      const response = await reminderService.reEnableReminder(reminderId);
      if (response.success) {
        message.success("Nhắc nhở đã được kích hoạt lại thành công");
        fetchReminderData(
          reminderPagination.current - 1,
          reminderPagination.pageSize
        );
      } else {
        message.error("Failed to re-enable reminder");
      }
    } catch (error) {
      console.error("Error re-enabling reminder:", error);
      message.error("Failed to re-enable reminder");
    }
  };

  // Handle reminder pagination change
  const handleReminderPaginationChange = (page, size) => {
    setReminderPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: size,
    }));
    fetchReminderData(page - 1, size);
  };

  // Handle edit reminder
  const handleEditReminder = (record) => {
    setEditingReminder(record);
    reminderForm.setFieldsValue({
      content: record.content,
      category: record.category,
    });
    setReminderModalVisible(true);
  };

  // Handle reminder modal submission
  const handleReminderModalSubmit = async () => {
    try {
      const values = await reminderForm.validateFields();

      if (editingReminder) {
        // Update existing reminder
        await handleUpdateReminder(
          editingReminder.id,
          values.content,
          values.category
        );
      } else {
        // Create new reminder
        await handleCreateReminder(values.content, values.category);
      }

      setReminderModalVisible(false);
      setEditingReminder(null);
      reminderForm.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Handle reminder modal cancel
  const handleReminderModalCancel = () => {
    setReminderModalVisible(false);
    setEditingReminder(null);
    reminderForm.resetFields();
  };

  // Table columns for users
  const userColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={
            role === "MEMBER" ? "blue" : role === "COACH" ? "green" : "purple"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status ? "success" : "error"}
          text={status ? "Hoạt động" : "Không hoạt động"}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.role !== "ADMIN" && record.status && (
            <Button
              type="default"
              size="small"
              className="btn-delete"
              icon={<StopOutlined />}
              onClick={() => handleUserDisableToggle(record)}
            >
              Vô hiệu hóa
            </Button>
          )}
          {record.role !== "ADMIN" && !record.status && (
            <>
              <Button
                type="default"
                size="small"
                className="btn-activate"
                icon={<PlayCircleOutlined />}
                onClick={() => handleUserReEnable(record)}
              >
                Kích hoạt
              </Button>
            </>
          )}
          {record.role === "ADMIN" && (
            <Tooltip title="Người dùng quản trị không thể bị vô hiệu hóa">
              <Button
                type="default"
                size="small"
                className="btn-protected"
                icon={<SafetyOutlined />}
                disabled
              >
                Được bảo vệ
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Table columns for unreviewed feedbacks
  const unreviewedFeedbackColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "star",
      key: "star",
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: "#faad14" }} /> {star}/5
        </div>
      ),
    },
    {
      title: "Huấn luyện viên",
      dataIndex: ["coach", "name"],
      key: "coachName",
      render: (name, record) => name || record.coachName || "N/A",
    },
    {
      title: "Thành viên",
      dataIndex: ["member", "name"],
      key: "memberName",
      render: (name, record) => name || record.memberName || "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            className="btn-approve"
            icon={<CheckCircleOutlined />}
            onClick={() => handleFeedbackApproval(record.id)}
          >
            Phê duyệt & Xuất bản
          </Button>
          <Button
            type="default"
            size="small"
            className="btn-hide"
            icon={<EyeInvisibleOutlined />}
            onClick={() => handleFeedbackHide(record.id)}
          >
            Ẩn
          </Button>
        </Space>
      ),
    },
  ];

  // Table columns for published feedbacks
  const publishedFeedbackColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "star",
      key: "star",
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: "#faad14" }} /> {star}/5
        </div>
      ),
    },
    {
      title: "Huấn luyện viên",
      dataIndex: ["coach", "name"],
      key: "coachName",
      render: (name, record) => name || record.coachName || "N/A",
    },
    {
      title: "Thành viên",
      dataIndex: ["member", "name"],
      key: "memberName",
      render: (name, record) => name || record.memberName || "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Ngày xuất bản",
      dataIndex: "publishedAt",
      key: "publishedAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          className="btn-hide"
          icon={<EyeInvisibleOutlined />}
          onClick={() => handleFeedbackHide(record.id)}
        >
          Ẩn
        </Button>
      ),
    },
  ];

  // Table columns for feedbacks (legacy - for backward compatibility)
  const feedbackColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "star",
      key: "star",
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: "#faad14" }} /> {star}/5
        </div>
      ),
    },
    {
      title: "Huấn luyện viên",
      dataIndex: ["coach", "name"],
      key: "coachName",
      render: (name, record) => name || record.coachName || "N/A",
    },
    {
      title: "Thành viên",
      dataIndex: ["member", "name"],
      key: "memberName",
      render: (name, record) => name || record.memberName || "N/A",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isPublished = record.published || record.isPublished;
        const isReviewed = record.reviewed || record.isReviewed;

        if (isPublished) {
          return <Tag color="green">Đã xuất bản</Tag>;
        } else if (isReviewed) {
          return <Tag color="blue">Đã xem xét</Tag>;
        } else {
          return <Tag color="orange">Chưa xem xét</Tag>;
        }
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, record) => {
        const isPublished = record.published || record.isPublished;
        const isReviewed = record.reviewed || record.isReviewed;

        return (
          <Space>
            {!isReviewed && (
              <Button
                type="link"
                size="small"
                onClick={() => handleFeedbackReviewed(record.id)}
              >
                Đánh dấu đã xem xét
              </Button>
            )}
            {!isPublished && isReviewed && (
              <Button
                type="link"
                size="small"
                style={{ color: "#52c41a" }}
                onClick={() => handleFeedbackApproval(record.id)}
              >
                Phê duyệt & Xuất bản
              </Button>
            )}
            {isPublished && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleFeedbackHide(record.id)}
              >
                Ẩn
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // Table columns for reminders
  const reminderColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        const colors = {
          HEALTH_BENEFITS: "green",
          MOTIVATIONAL_QUOTES: "blue",
          TIPS_AND_TRICKS: "orange",
          MILESTONE_CELEBRATIONS: "purple",
          SMOKING_FACTS: "red",
        };
        return (
          <Tag color={colors[category] || "default"}>
            {category?.replace(/_/g, " ") || "Chung"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Badge
          status={active ? "success" : "error"}
          text={active ? "Hoạt động" : "Không hoạt động"}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createAt",
      key: "createAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updateAt",
      key: "updateAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            className="btn-edit"
            icon={<EditOutlined />}
            onClick={() => handleEditReminder(record)}
          >
            Chỉnh sửa
          </Button>
          {record.active ? (
            <Button
              type="default"
              size="small"
              className="btn-delete"
              icon={<StopOutlined />}
              onClick={() => handleDisableReminder(record.id)}
            >
              Vô hiệu hóa
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              className="btn-activate"
              icon={<PlayCircleOutlined />}
              onClick={() => handleReEnableReminder(record.id)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Prepare chart data from dashboard stats
  const prepareUserRoleData = () => {
    const {
      totalMembers = 0,
      totalCoaches = 0,
      totalUsers = 0,
    } = dashboardStats;
    const admins = totalUsers - totalMembers - totalCoaches;

    return [
      { name: "Members", value: totalMembers, color: "#1890ff" },
      { name: "Coaches", value: totalCoaches, color: "#52c41a" },
      { name: "Admins", value: Math.max(0, admins), color: "#722ed1" },
    ].filter((item) => item.value > 0);
  };

  const prepareFeedbackData = () => {
    const {
      totalFeedback = 0,
      reviewedFeedback = 0,
      unreviewedFeedback = 0,
      publishedFeedback = 0,
      unpublishedFeedback = 0,
    } = dashboardStats;

    return [
      { name: "Reviewed", value: reviewedFeedback, color: "#52c41a" },
      { name: "Unreviewed", value: unreviewedFeedback, color: "#faad14" },
      { name: "Published", value: publishedFeedback, color: "#1890ff" },
      { name: "Unpublished", value: unpublishedFeedback, color: "#ff4d4f" },
    ].filter((item) => item.value > 0);
  };

  const prepareQuitPlanData = () => {
    const {
      totalQuitPlans = 0,
      activeQuitPlans = 0,
      completedQuitPlans = 0,
      cancelledQuitPlans = 0,
      rejectedQuitPlans = 0,
    } = dashboardStats;

    return [
      { name: "Active", value: activeQuitPlans, color: "#1890ff" },
      { name: "Completed", value: completedQuitPlans, color: "#52c41a" },
      { name: "Cancelled", value: cancelledQuitPlans, color: "#faad14" },
      { name: "Rejected", value: rejectedQuitPlans, color: "#ff4d4f" },
    ].filter((item) => item.value > 0);
  };

  // Prepare feedback rating distribution
  const prepareFeedbackRatingData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedbackData.forEach((feedback) => {
      const rating = feedback.star || feedback.rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    return [
      { name: "1 Star", value: ratingCounts[1], color: "#ff4d4f" },
      { name: "2 Stars", value: ratingCounts[2], color: "#ff7a45" },
      { name: "3 Stars", value: ratingCounts[3], color: "#faad14" },
      { name: "4 Stars", value: ratingCounts[4], color: "#a0d911" },
      { name: "5 Stars", value: ratingCounts[5], color: "#52c41a" },
    ].filter((item) => item.value > 0);
  };

  // Calculate feedback status statistics
  const getFeedbackStatusStats = () => {
    const totalUnreviewed = unreviewedFeedbacks.length;
    const totalPublished = publishedFeedbacks.length;
    const total = totalUnreviewed + totalPublished;

    return {
      total,
      published: totalPublished,
      reviewed: totalPublished, // Published feedbacks are considered reviewed
      unreviewed: totalUnreviewed,
      publishedRate: total > 0 ? Math.round((totalPublished / total) * 100) : 0,
      reviewedRate: total > 0 ? Math.round((totalPublished / total) * 100) : 0,
    };
  };

  if (loading) {
    return (
      <div className="dashboard loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="container py-4 fade-in-up">
        <Title level={2} className="page-title">
          Bảng điều khiển quản trị
        </Title>

        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng người dùng"
                value={dashboardStats.totalUsers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.totalMembers || 0} Thành viên,{" "}
                  {dashboardStats.totalCoaches || 0} Huấn luyện viên
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Thành viên hoạt động"
                value={dashboardStats.activeMembers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.inactiveMembers || 0} Không hoạt động
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Huấn luyện viên hoạt động"
                value={dashboardStats.activeCoaches || 0}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.coachesWithActiveMembers || 0} có thành viên
                  hoạt động
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng phản hồi"
                value={dashboardStats.totalFeedback || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Trung bình: {dashboardStats.averageStarAll || 0} sao
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Secondary Statistics */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Kế hoạch cai thuốc"
                value={dashboardStats.totalQuitPlans || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Tỷ lệ thành công: {dashboardStats.successRateOfQuitPlans || 0}
                  %
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Nhật ký hàng ngày"
                value={dashboardStats.totalDailyLogs || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.membersWithAnyLog || 0} người ghi nhật ký hoạt
                  động
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Thành viên có huấn luyện viên"
                value={dashboardStats.membersWithAssignedCoach || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
              <div className="stat-footer">
                <Text type="secondary">Tỷ lệ phân công huấn luyện viên</Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab="Quản lý người dùng" key="1">
            <Card
              title={`Tất cả người dùng (Tổng cộng ${
                usersData.totalElements || 0
              })`}
            >
              <Table
                dataSource={usersData.content || []}
                columns={userColumns}
                rowKey="id"
                loading={usersLoading}
                pagination={false}
              />
              <div className="mt-4 text-center">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={usersData.totalElements || 0}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} người dùng`
                  }
                />
              </div>
            </Card>
          </TabPane>

          <TabPane tab="Quản lý phản hồi" key="2.5">
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Tổng phản hồi"
                    value={
                      (unreviewedFeedbacks.length || 0) +
                      (publishedFeedbacks.length || 0)
                    }
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Phản hồi chưa xem xét"
                    value={unreviewedFeedbacks.length || 0}
                    prefix={<BellOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">Cần chú ý</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Phản hồi đã xuất bản"
                    value={publishedFeedbacks.length || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">Hiển thị trên nền tảng</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Đánh giá trung bình"
                    value={dashboardStats.averageStarAll || 0}
                    precision={1}
                    prefix={<StarOutlined />}
                    suffix="/ 5.0"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={12}>
                <Card title="Phân bố đánh giá phản hồi">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareFeedbackRatingData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {prepareFeedbackRatingData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Tổng quan trạng thái phản hồi">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Chưa xem xét"
                        value={getFeedbackStatusStats().unreviewed}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                      <Progress
                        percent={100 - getFeedbackStatusStats().reviewedRate}
                        strokeColor="#ff4d4f"
                        showInfo={false}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Đã xem xét"
                        value={getFeedbackStatusStats().reviewed}
                        valueStyle={{ color: "#52c41a" }}
                      />
                      <Progress
                        percent={getFeedbackStatusStats().reviewedRate}
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Card title={`Quản lý phản hồi`}>
              <Tabs defaultActiveKey="unreviewed">
                <TabPane
                  tab={
                    <span>
                      <BellOutlined />
                      Chưa xem xét ({unreviewedFeedbacks.length || 0})
                    </span>
                  }
                  key="unreviewed"
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Những phản hồi này cần được xem xét và phê duyệt trước khi
                      có thể được xuất bản.
                    </Text>
                  </div>
                  <Table
                    dataSource={unreviewedFeedbacks || []}
                    columns={unreviewedFeedbackColumns}
                    rowKey="id"
                    loading={feedbackLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mục phản hồi chưa xem xét`,
                    }}
                  />
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <CheckCircleOutlined />
                      Đã xuất bản ({publishedFeedbacks.length || 0})
                    </span>
                  }
                  key="published"
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Những phản hồi này đã được phê duyệt và hiển thị công
                      khai.
                    </Text>
                  </div>
                  <Table
                    dataSource={publishedFeedbacks || []}
                    columns={publishedFeedbackColumns}
                    rowKey="id"
                    loading={feedbackLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mục phản hồi đã xuất bản`,
                    }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </TabPane>

          <TabPane tab="Phân tích người dùng" key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bố người dùng theo vai trò">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareUserRoleData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareUserRoleData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Phân bố trạng thái phản hồi">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareFeedbackData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareFeedbackData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Phân tích kế hoạch cai thuốc" key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bố trạng thái kế hoạch cai thuốc">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareQuitPlanData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareQuitPlanData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Thống kê kế hoạch cai thuốc">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic
                        title="Tỷ lệ thành công"
                        value={dashboardStats.successRateOfQuitPlans || 0}
                        suffix="%"
                        valueStyle={{ color: "#52c41a" }}
                      />
                      <Progress
                        percent={dashboardStats.successRateOfQuitPlans || 0}
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Nhắc nhở" key="5">
            <Card
              title={`Tất cả nhắc nhở (Tổng cộng ${reminderPagination.total})`}
              extra={
                <Button
                  type="primary"
                  onClick={() => setReminderModalVisible(true)}
                  icon={<PlusOutlined />}
                  className="btn-create"
                >
                  Tạo nhắc nhở
                </Button>
              }
            >
              <Table
                dataSource={reminderData}
                columns={reminderColumns}
                rowKey="id"
                loading={reminderLoading}
                pagination={false}
              />
              <div className="mt-4 text-center">
                <Pagination
                  current={reminderPagination.current}
                  pageSize={reminderPagination.pageSize}
                  total={reminderPagination.total}
                  onChange={handleReminderPaginationChange}
                  onShowSizeChange={handleReminderPaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} nhắc nhở`
                  }
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>

        {/* Reminder Management Modal */}
        <Modal
          title={editingReminder ? "Chỉnh sửa nhắc nhở" : "Tạo nhắc nhở"}
          visible={reminderModalVisible}
          onCancel={handleReminderModalCancel}
          footer={null}
          destroyOnClose
        >
          <Form
            form={reminderForm}
            layout="vertical"
            onFinish={handleReminderModalSubmit}
          >
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung nhắc nhở" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung nhắc nhở..."
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Danh mục"
              rules={[
                { required: true, message: "Vui lòng chọn danh mục nhắc nhở" },
              ]}
            >
              <Select placeholder="Chọn danh mục">
                <Select.Option value="HEALTH_BENEFITS">
                  Lợi ích sức khỏe
                </Select.Option>
                <Select.Option value="MOTIVATIONAL_QUOTES">
                  Trích dẫn động viên
                </Select.Option>
                <Select.Option value="TIPS_AND_TRICKS">
                  Mẹo và thủ thuật
                </Select.Option>
                <Select.Option value="SMOKING_FACTS">
                  Sự thật về thuốc lá
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={reminderLoading}
                  className="btn-create"
                >
                  {editingReminder ? "Cập nhật nhắc nhở" : "Tạo nhắc nhở"}
                </Button>
                <Button onClick={handleReminderModalCancel}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
