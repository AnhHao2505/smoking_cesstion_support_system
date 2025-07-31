import React, { useState, useEffect } from 'react';
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
  Select
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  FileTextOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import * as adminDashboardService from '../../services/adminDashboardService';
import * as userService from '../../services/userService';
import * as feedbackService from '../../services/feebackService';
import * as reminderService from '../../services/reminderService';
import '../../styles/Dashboard.css';

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
    last: false
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
    total: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // User filter states
  const [userFilters, setUserFilters] = useState({
    email: '',
    name: '',
    status: 'all', // all, active, inactive
    role: 'all' // all, MEMBER, COACH, ADMIN
  });

  // Filtered users pagination
  const [filteredPage, setFilteredPage] = useState(1);
  const [filteredPageSize, setFilteredPageSize] = useState(10);

  // Feedback filter states
  const [feedbackFilters, setFeedbackFilters] = useState({
    star: 'all', // all, 1, 2, 3, 4, 5
    status: 'all' // all, published, unreviewed
  });

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
      message.error("Failed to load dashboard statistics");
      setDashboardStats({});
    }
  };

  // Fetch users data
  const fetchUsersData = async (page = 0, size = 10) => {
    try {
      setUsersLoading(true);
      const users = await userService.getAllUsers(page, size);
      setUsersData(users || {
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false
      });
    } catch (error) {
      console.error("Error fetching users data:", error);
      message.error("Failed to load users data");
      setUsersData({
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false
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
        feedbackService.getPublishedFeedbacks()
      ]);
      setUnreviewedFeedbacks(unreviewedFeedbacks || []);
      setPublishedFeedbacks(publishedFeedbacks || []);
      // Keep the combined feedbackData for backward compatibility and stats
      setFeedbackData([...(unreviewedFeedbacks || []), ...(publishedFeedbacks || [])]);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      message.error("Failed to load feedback data");
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
      console.log('Reminder response:', response); // Debug log
      
      if (response) {
        // Check if response has success property (from catch block with mock data)
        if (response.success === true && Array.isArray(response.data)) {
          // Mock data format
          setReminderData(response.data);
          setReminderPagination({
            current: page + 1,
            pageSize: size,
            total: response.data.length
          });
        } else if (response.content) {
          // Real API data format (after handleApiResponse)
          setReminderData(response.content || []);
          setReminderPagination({
            current: (response.pageNo || 0) + 1,
            pageSize: response.pageSize || size,
            total: response.totalElements || 0
          });
        } else {
          // Fallback
          setReminderData([]);
          setReminderPagination({
            current: 1,
            pageSize: size,
            total: 0
          });
        }
      } else {
        setReminderData([]);
        setReminderPagination({
          current: 1,
          pageSize: size,
          total: 0
        });
      }
    } catch (error) {
      console.error("Error fetching reminder data:", error);
      message.error("Failed to load reminder data");
      setReminderData([]);
      setReminderPagination({
        current: 1,
        pageSize: size,
        total: 0
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
        fetchReminderData(0, pageSize)
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

  // Check if any filter is active
  const hasActiveFilter = () => {
    return userFilters.email !== '' || 
           userFilters.name !== '' || 
           userFilters.status !== 'all' || 
           userFilters.role !== 'all';
  };

  // Get all filtered users (without pagination)
  const getAllFilteredUsers = () => {
    if (!usersData.content) return [];
    
    return usersData.content.filter(user => {
      // Email filter
      const emailMatch = !userFilters.email || 
        user.email.toLowerCase().includes(userFilters.email.toLowerCase());
      
      // Name filter
      const nameMatch = !userFilters.name || 
        user.name.toLowerCase().includes(userFilters.name.toLowerCase());
      
      // Status filter
      const statusMatch = userFilters.status === 'all' || 
        (userFilters.status === 'active' && user.status) ||
        (userFilters.status === 'inactive' && !user.status);
      
      // Role filter
      const roleMatch = userFilters.role === 'all' || 
        user.role === userFilters.role;
      
      return emailMatch && nameMatch && statusMatch && roleMatch;
    });
  };

  // Filter users data based on filter criteria
  const getFilteredUsersData = () => {
    if (!hasActiveFilter()) {
      // No filter active, return server data as-is
      return usersData.content || [];
    }

    const filtered = getAllFilteredUsers();

    // Apply pagination to filtered results
    const startIndex = (filteredPage - 1) * filteredPageSize;
    const endIndex = startIndex + filteredPageSize;
    return filtered.slice(startIndex, endIndex);
  };

  // Get total count of filtered users
  const getFilteredUsersCount = () => {
    if (!hasActiveFilter()) {
      // No filter active, return server total
      return usersData.totalElements || 0;
    }
    
    return getAllFilteredUsers().length;
  };

  // Fetch all users for filtering (when filter is applied)
  const fetchAllUsersForFiltering = async () => {
    try {
      setUsersLoading(true);
      // Fetch with a large page size to get all users for client-side filtering
      const allUsers = await userService.getAllUsers(0, 1000); // Assume 1000 is enough
      setUsersData(allUsers || {
        content: [],
        pageNo: 0,
        pageSize: 1000,
        totalElements: 0,
        totalPages: 0,
        last: false
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      message.error("Failed to load all users for filtering");
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = async (filterType, value) => {
    const newFilters = {
      ...userFilters,
      [filterType]: value
    };
    
    // Check if this is the first filter being applied
    const wasFilterEmpty = !hasActiveFilter();
    const willHaveFilter = newFilters.email !== '' || 
                          newFilters.name !== '' || 
                          newFilters.status !== 'all' || 
                          newFilters.role !== 'all';
    
    setUserFilters(newFilters);
    setFilteredPage(1);
    
    // If transitioning from no filter to having filter, fetch all users
    if (wasFilterEmpty && willHaveFilter) {
      await fetchAllUsersForFiltering();
    }
    // If removing all filters, go back to server pagination
    else if (!wasFilterEmpty && !willHaveFilter) {
      setCurrentPage(1);
      fetchUsersData(0, pageSize);
    }
  };

  // Handle filtered data pagination
  const handleFilteredPaginationChange = (page, size) => {
    if (hasActiveFilter()) {
      // Client-side pagination for filtered data
      setFilteredPage(page);
      setFilteredPageSize(size || filteredPageSize);
    } else {
      // Server-side pagination for non-filtered data
      setCurrentPage(page);
      setPageSize(size || pageSize);
      fetchUsersData(page - 1, size || pageSize);
    }
  };

  // Get current pagination settings
  const getCurrentPagination = () => {
    if (hasActiveFilter()) {
      return {
        current: filteredPage,
        pageSize: filteredPageSize,
        total: getFilteredUsersCount()
      };
    } else {
      return {
        current: currentPage,
        pageSize: pageSize,
        total: usersData.totalElements || 0
      };
    }
  };

  // Reset filters
  const resetFilters = () => {
    setUserFilters({
      email: '',
      name: '',
      status: 'all',
      role: 'all'
    });
    setFilteredPage(1);
    // Reset to server pagination
    setCurrentPage(1);
    fetchUsersData(0, pageSize);
  };

  // Filter feedback data based on filter criteria
  const getFilteredFeedbacks = (feedbacks) => {
    if (!feedbacks) return [];
    
    return feedbacks.filter(feedback => {
      // Star filter
      const starMatch = feedbackFilters.star === 'all' || 
        (feedback.star && feedback.star.toString() === feedbackFilters.star);
      
      return starMatch;
    });
  };

  // Handle feedback filter change
  const handleFeedbackFilterChange = (filterType, value) => {
    setFeedbackFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset feedback filters
  const resetFeedbackFilters = () => {
    setFeedbackFilters({
      star: 'all',
      status: 'all'
    });
  };

  // Handle user disable/enable
  const handleUserDisableToggle = async (record) => {
    console.log(record)
    try {
      if (record.role === 'ADMIN') {
        message.warning('Người dùng quản trị viên không thể bị vô hiệu hóa');
        return;
      }

      if (record.role === 'COACH') {
        message.warning('Tài khoản huấn luyện viên được bảo vệ và không thể bị vô hiệu hóa');
        return;
      }

      const action = record.status ? 'vô hiệu hóa' : 'kích hoạt lại';
      const response = await userService.disableUser(record.id);
      
      if (response.success) {
        message.success(`Người dùng ${action} thành công`);
        // Refresh users data to show updated status
        fetchUsersData(currentPage - 1, pageSize);
      } else {
        message.error(`Thất bại khi ${action} người dùng`);
      }
    } catch (error) {
      console.error(`Error ${record.status ? 'disabling' : 'enabling'} user:`, error);
      message.error(`Thất bại khi ${record.status ? 'vô hiệu hóa' : 'kích hoạt lại'} người dùng`);
    }
  };

  // Handle user re-enable
  const handleUserReEnable = async (record) => {
    try {
      if (record.role === 'ADMIN') {
        message.warning('Người dùng quản trị viên không thể được kích hoạt lại');
        return;
      }

      if (record.role === 'COACH') {
        message.warning('Tài khoản huấn luyện viên được bảo vệ và không cần kích hoạt lại');
        return;
      }

      const response = await userService.reEnableUser(record.id);

      if (response.success) {
        message.success('Kích hoạt người dùng thành công');
        // Refresh users data to show updated status
        fetchUsersData(currentPage - 1, pageSize);
      }
    } catch (error) {
      console.error('Error re-enabling user:', error);
      message.error('Thất bại khi kích hoạt lại người dùng');
    }
  };

  // Handle feedback approval
  const handleFeedbackApproval = async (feedbackId) => {
    try {
      const response = await feedbackService.approveFeedback(feedbackId);
      if (response.success) {
        message.success('Feedback approved and published successfully');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Thất bại khi phê duyệt phản hồi');
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      message.error('Thất bại khi phê duyệt phản hồi');
    }
  };

  // Handle feedback hiding
  const handleFeedbackHide = async (feedbackId) => {
    try {
      const response = await feedbackService.hideFeedback(feedbackId);
      if (response.success) {
        message.success('Phản hồi đã được ẩn thành công');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Thất bại khi ẩn phản hồi');
      }
    } catch (error) {
      console.error('Error hiding feedback:', error);
      message.error('Thất bại khi ẩn phản hồi');
    }
  };

  // Handle marking feedback as reviewed
  const handleFeedbackReviewed = async (feedbackId) => {
    try {
      const response = await feedbackService.markFeedbackReviewed(feedbackId);
      if (response.success) {
        message.success('Feedback marked as reviewed');
        fetchFeedbackData(); // Refresh feedback data
      } else {
        message.error('Thất bại khi đánh dấu phản hồi là đã xem');
      }
    } catch (error) {
      console.error('Error marking feedback as reviewed:', error);
      message.error('Thất bại khi đánh dấu phản hồi là đã xem');
    }
  };

  // Create new reminder
  const handleCreateReminder = async (content, category) => {
    try {
      const response = await reminderService.createReminder(content, category);
      if (response.success) {
        message.success('Tạo nhắc nhở thành công');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Thất bại khi tạo nhắc nhở');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      message.error('Thất bại khi tạo nhắc nhở');
    }
  };

  // Update existing reminder
  const handleUpdateReminder = async (reminderId, content, category) => {
    try {
      const response = await reminderService.updateReminder(reminderId, content, category);
      if (response.success) {
        message.success('Cập nhật nhắc nhở thành công');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Thất bại khi cập nhật nhắc nhở');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      message.error('Thất bại khi cập nhật nhắc nhở');
    }
  };

  // Disable reminder
  const handleDisableReminder = async (reminderId) => {
    try {
      const response = await reminderService.disableReminder(reminderId);
      if (response.success) {
        message.success('Đã vô hiệu hóa nhắc nhở');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Thất bại khi vô hiệu hóa nhắc nhở');
      }
    } catch (error) {
      console.error('Error disabling reminder:', error);
      message.error('Thất bại khi vô hiệu hóa nhắc nhở');
    }
  };

  // Re-enable reminder
  const handleReEnableReminder = async (reminderId) => {
    try {
      const response = await reminderService.reEnableReminder(reminderId);
      if (response.success) {
        message.success('Đã kích hoạt lại nhắc nhở');
        fetchReminderData(reminderPagination.current - 1, reminderPagination.pageSize);
      } else {
        message.error('Thất bại khi kích hoạt lại nhắc nhở');
      }
    } catch (error) {
      console.error('Error re-enabling reminder:', error);
      message.error('Thất bại khi kích hoạt lại nhắc nhở');
    }
  };

  // Handle reminder pagination change
  const handleReminderPaginationChange = (page, size) => {
    setReminderPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }));
    fetchReminderData(page - 1, size);
  };

  // Handle edit reminder
  const handleEditReminder = (record) => {
    setEditingReminder(record);
    reminderForm.setFieldsValue({
      content: record.content,
      category: record.category
    });
    setReminderModalVisible(true);
  };

  // Handle reminder modal submission
  const handleReminderModalSubmit = async () => {
    try {
      const values = await reminderForm.validateFields();
      
      if (editingReminder) {
        // Update existing reminder
        await handleUpdateReminder(editingReminder.id, values.content, values.category);
      } else {
        // Create new reminder
        await handleCreateReminder(values.content, values.category);
      }
      
      setReminderModalVisible(false);
      setEditingReminder(null);
      reminderForm.resetFields();
    } catch (error) {
      console.error('Xác thực biểu mẫu thất bại:', error);
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'MEMBER' ? 'blue' : role === 'COACH' ? 'green' : 'purple'}>
          {role === 'MEMBER' ? 'Thành viên' : role === 'COACH' ? 'Huấn luyện viên' : 'Quản trị viên'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status ? 'success' : 'error'} 
          text={status ? 'Hoạt động' : 'Không hoạt động'} 
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.role === 'MEMBER' && record.status && (
            <Button 
              type="link" 
              size="small" 
              danger
              onClick={() => handleUserDisableToggle(record)}
            >
              Vô hiệu hóa
            </Button>
          )}
          {record.role === 'MEMBER' && !record.status && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleUserReEnable(record)}
            >
              Kích hoạt lại
            </Button>
          )}
          {(record.role === 'ADMIN' || record.role === 'COACH') && (
            <Tooltip title={`Tài khoản ${record.role === 'ADMIN' ? 'quản trị viên' : 'huấn luyện viên'} được bảo vệ`}>
              <Button type="link" size="small" disabled>
                Bảo vệ
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Table columns for unreviewed feedbacks
  const unreviewedFeedbackColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Số sao',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: '#faad14' }} /> {star}/5
        </div>
      )
    },
    {
      title: 'Tới',
      dataIndex: ['coach', 'name'],
      key: 'coachName',
      render: (name, record) => {
        // Sử dụng field 'to' từ API response để phân biệt coach và nền tảng
        const recipient = record.to || name || record.coachName;
        
        if (recipient === 'Nền tảng') {
          return <Tag color="blue">Nền tảng</Tag>;
        } else if (recipient) {
          return <Tag color="green">{recipient}</Tag>;
        } else {
          return <Tag color="default">Không xác định</Tag>;
        }
      }
    },
    {
      title: 'Thành viên',
      dataIndex: ['member', 'name'],
      key: 'memberName',
      render: (name, record) => name || record.memberName || 'Không xác định'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleFeedbackApproval(record.id)}
          >
            Duyệt & Đăng
          </Button>
          <Button 
            type="default" 
            size="small"
            danger
            onClick={() => handleFeedbackHide(record.id)}
          >
            Từ chối đăng
          </Button>
        </Space>
      )
    }
  ];

  // Table columns for published feedbacks
  const publishedFeedbackColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Số sao',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: '#faad14' }} /> {star}/5
        </div>
      )
    },
    {
      title: 'Huấn luyện viên',
      dataIndex: ['coach', 'name'],
      key: 'coachName',
      render: (name, record) => {
        // Sử dụng field 'to' từ API response để phân biệt coach và nền tảng
        const recipient = record.to || name || record.coachName;
        
        if (recipient === 'Nền tảng') {
          return <Tag color="blue">Nền tảng</Tag>;
        } else if (recipient) {
          return <Tag color="green">{recipient}</Tag>;
        } else {
          return <Tag color="default">Không xác định</Tag>;
        }
      }
    },
    {
      title: 'Thành viên',
      dataIndex: ['member', 'name'],
      key: 'memberName',
      render: (name, record) => name || record.memberName || 'Không xác định'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="default" 
          size="small"
          danger
          onClick={() => handleFeedbackHide(record.id)}
        >
          Ẩn
        </Button>
      )
    }
  ];

  // Table columns for feedbacks (legacy - for backward compatibility)
  const feedbackColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Số sao',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (star) => (
        <div>
          <StarOutlined style={{ color: '#faad14' }} /> {star}/5
        </div>
      )
    },
    {
      title: 'Huấn luyện viên',
      dataIndex: ['coach', 'name'],
      key: 'coachName',
      render: (name, record) => {
        // Sử dụng field 'to' từ API response để phân biệt coach và nền tảng
        const recipient = record.to || name || record.coachName;
        
        if (recipient === 'Nền tảng') {
          return <Tag color="blue">Nền tảng</Tag>;
        } else if (recipient) {
          return <Tag color="green">{recipient}</Tag>;
        } else {
          return <Tag color="default">Không xác định</Tag>;
        }
      }
    },
    {
      title: 'Thành viên',
      dataIndex: ['member', 'name'],
      key: 'memberName',
      render: (name, record) => name || record.memberName || 'Không xác định'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const isPublished = record.published || record.isPublished;
        const isReviewed = record.reviewed || record.isReviewed;
        
        if (isPublished) {
          return <Tag color="green">Đã đăng</Tag>;
        } else if (isReviewed) {
          return <Tag color="blue">Đã duyệt</Tag>;
        } else {
          return <Tag color="orange">Chưa duyệt</Tag>;
        }
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Thao tác',
      key: 'actions',
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
                Đánh dấu đã duyệt
              </Button>
            )}
            {!isPublished && isReviewed && (
              <Button 
                type="link" 
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleFeedbackApproval(record.id)}
              >
                Duyệt & Đăng
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
      }
    }
  ];

  // Table columns for reminders
  const reminderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <span>{content}</span>
        </Tooltip>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const colors = {
          'HEALTH_BENEFITS': 'green',
          'MOTIVATIONAL_QUOTES': 'blue',
          'TIPS_AND_TRICKS': 'orange',
          'MILESTONE_CELEBRATIONS': 'purple',
          'SMOKING_FACTS': 'red'
        };
        const viMap = {
          'HEALTH_BENEFITS': 'Lợi ích sức khỏe',
          'MOTIVATIONAL_QUOTES': 'Câu nói truyền cảm hứng',
          'TIPS_AND_TRICKS': 'Mẹo và thủ thuật',
          'MILESTONE_CELEBRATIONS': 'Kỷ niệm thành tích',
          'SMOKING_FACTS': 'Sự thật về thuốc lá'
        };
        return (
          <Tag color={colors[category] || 'default'}>
            {viMap[category] || 'Chung'}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Hoạt động' : 'Không hoạt động'} 
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updateAt',
      key: 'updateAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Không xác định'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleEditReminder(record)}
          >
            Chỉnh sửa
          </Button>
          {record.active ? (
            <Button 
              type="link" 
              size="small"
              danger
              onClick={() => handleDisableReminder(record.id)}
            >
              Vô hiệu hóa
            </Button>
          ) : (
            <Button 
              type="link" 
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleReEnableReminder(record.id)}
            >
              Kích hoạt lại
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Prepare chart data from dashboard stats
  const prepareUserRoleData = () => {
    const { totalMembers = 0, totalCoaches = 0, totalUsers = 0 } = dashboardStats;
    const admins = totalUsers - totalMembers - totalCoaches;
    
    return [
      { name: 'Thành viên', value: totalMembers, color: '#1890ff' },
      { name: 'Huấn luyện viên', value: totalCoaches, color: '#52c41a' },
      { name: 'Quản trị viên', value: Math.max(0, admins), color: '#722ed1' }
    ].filter(item => item.value > 0);
  };

  const prepareFeedbackData = () => {
    const { 
      totalFeedback = 0, 
      reviewedFeedback = 0, 
      unreviewedFeedback = 0, 
      publishedFeedback = 0, 
      unpublishedFeedback = 0 
    } = dashboardStats;
    
    return [
      { name: 'Đã duyệt', value: publishedFeedback, color: '#1890ff' },
      { name: 'Chưa duyệt', value: unpublishedFeedback, color: '#ff4d4f' }
    ].filter(item => item.value > 0);
  };

  const prepareQuitPlanData = () => {
    const { 
      totalQuitPlans = 0,
      activeQuitPlans = 0, 
      completedQuitPlans = 0, 
      cancelledQuitPlans = 0, 
      rejectedQuitPlans = 0 
    } = dashboardStats;
    
    return [
      { name: 'Đang tiến hành', value: activeQuitPlans, color: '#1890ff' },
      { name: 'Đã hoàn thành', value: completedQuitPlans, color: '#52c41a' },
      { name: 'Thất bại', value: cancelledQuitPlans, color: '#faad14' },
      { name: 'Bị từ chối', value: rejectedQuitPlans, color: '#ff4d4f' }
    ].filter(item => item.value > 0);
  };

  // Prepare feedback rating distribution
  const prepareFeedbackRatingData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    feedbackData.forEach(feedback => {
      const rating = feedback.star || feedback.rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    return [
      { name: '1 Sao', value: ratingCounts[1], color: '#ff4d4f' },
      { name: '2 Sao', value: ratingCounts[2], color: '#ff7a45' },
      { name: '3 Sao', value: ratingCounts[3], color: '#faad14' },
      { name: '4 Sao', value: ratingCounts[4], color: '#a0d911' },
      { name: '5 Sao', value: ratingCounts[5], color: '#52c41a' }
    ].filter(item => item.value > 0);
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
      reviewedRate: total > 0 ? Math.round((totalPublished / total) * 100) : 0
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
      <div className="container py-4">
        <Title level={2} className="page-title">Bảng điều khiển quản trị viên</Title>
        
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Tổng số người dùng"
                value={dashboardStats.totalUsers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.totalMembers || 0} thành viên, {dashboardStats.totalCoaches || 0} huấn luyện viên
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Thành viên đang hoạt động"
                value={dashboardStats.activeMembers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.inactiveMembers || 0} không hoạt động
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Huấn luyện viên đang hoạt động"
                value={dashboardStats.activeCoaches || 0}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.coachesWithActiveMembers || 0} có thành viên hoạt động
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Tổng số đánh giá"
                value={dashboardStats.totalFeedback || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Trung bình: {dashboardStats.averageStarAll || 0} sao
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Thống kê phụ */}
        <Row gutter={[16, 16]} className="stats-overview mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic 
                title="Kế hoạch cai thuốc"
                value={dashboardStats.totalQuitPlans || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Tỉ lệ thành công: {dashboardStats.successRateOfQuitPlans || 0}%
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
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  {dashboardStats.membersWithAnyLog || 0} thành viên ghi nhật ký
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
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Text type="secondary">
                  Tỉ lệ phân công huấn luyện viên
                </Text>
              </div>
            </Card>
          </Col>
          
        </Row>
        
        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <TabPane tab="Quản lý người dùng" key="1">
            <Card title={`Tổng người dùng (${usersData.totalElements || 0} người)`}>
              {/* Filter Section */}
              <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>Lọc theo email:</Text>
                      <Input
                        placeholder="Nhập email..."
                        value={userFilters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                        allowClear
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>Lọc theo tên:</Text>
                      <Input
                        placeholder="Nhập tên..."
                        value={userFilters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        allowClear
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>Trạng thái:</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={userFilters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                      >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Không hoạt động</Select.Option>
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>Vai trò:</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={userFilters.role}
                        onChange={(value) => handleFilterChange('role', value)}
                      >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="MEMBER">Thành viên</Select.Option>
                        <Select.Option value="COACH">Huấn luyện viên</Select.Option>
                        <Select.Option value="ADMIN">Quản trị viên</Select.Option>
                      </Select>
                    </div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                  <Col>
                    <Button onClick={resetFilters} type="default">
                      Xóa bộ lọc
                    </Button>
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      Hiển thị {getFilteredUsersCount()} / {usersData.totalElements || 0} người dùng
                    </Text>
                  </Col>
                </Row>
              </div>
              
              <Table 
                dataSource={getFilteredUsersData()} 
                columns={userColumns} 
                rowKey="id"
                loading={usersLoading}
                pagination={false}
              />
              <div className="mt-4 text-center">
                <Pagination
                  current={getCurrentPagination().current}
                  pageSize={getCurrentPagination().pageSize}
                  total={getCurrentPagination().total}
                  onChange={handleFilteredPaginationChange}
                  onShowSizeChange={handleFilteredPaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => {
                    if (hasActiveFilter()) {
                      return `${range[0]}-${range[1]} trong ${total} người dùng (đã lọc từ ${usersData.totalElements || 0} tổng)`;
                    } else {
                      return `${range[0]}-${range[1]} trong tổng số ${total} người dùng`;
                    }
                  }}
                />
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="Quản lý đánh giá" key="2.5">
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Tổng số đánh giá"
                    value={feedbackFilters.star === 'all' 
                      ? (unreviewedFeedbacks.length || 0) + (publishedFeedbacks.length || 0)
                      : getFilteredFeedbacks(unreviewedFeedbacks).length + getFilteredFeedbacks(publishedFeedbacks).length
                    }
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  {feedbackFilters.star !== 'all' && (
                    <div className="stat-footer">
                      <Text type="secondary">
                        Lọc theo {feedbackFilters.star} sao
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Đánh giá chưa duyệt"
                    value={feedbackFilters.star === 'all' 
                      ? unreviewedFeedbacks.length || 0
                      : getFilteredFeedbacks(unreviewedFeedbacks).length
                    }
                    prefix={<BellOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">
                      {feedbackFilters.star !== 'all' ? `Lọc theo ${feedbackFilters.star} sao` : 'Cần xử lý'}
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="stat-card">
                  <Statistic 
                    title="Đánh giá đã đăng"
                    value={feedbackFilters.star === 'all' 
                      ? publishedFeedbacks.length || 0
                      : getFilteredFeedbacks(publishedFeedbacks).length
                    }
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <div className="stat-footer">
                    <Text type="secondary">
                      {feedbackFilters.star !== 'all' 
                        ? `Lọc theo ${feedbackFilters.star} sao` 
                        : 'Đang hiển thị trên hệ thống'
                      }
                    </Text>
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
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={12}>
                <Card title="Phân bố đánh giá theo số sao">
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
                <Card title="Tổng quan trạng thái đánh giá">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="Chưa duyệt"
                        value={getFeedbackStatusStats().unreviewed}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                      <Progress 
                        percent={100 - getFeedbackStatusStats().reviewedRate} 
                        strokeColor="#ff4d4f"
                        showInfo={false}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Đã duyệt"
                        value={getFeedbackStatusStats().reviewed}
                        valueStyle={{ color: '#52c41a' }}
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

            <Card title={`Quản lý đánh giá`}>
              {/* Feedback Filter Section */}
              <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <Text strong style={{ marginBottom: 8, display: 'block' }}>Lọc theo số sao:</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={feedbackFilters.star}
                        onChange={(value) => handleFeedbackFilterChange('star', value)}
                      >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="1">1 Sao</Select.Option>
                        <Select.Option value="2">2 Sao</Select.Option>
                        <Select.Option value="3">3 Sao</Select.Option>
                        <Select.Option value="4">4 Sao</Select.Option>
                        <Select.Option value="5">5 Sao</Select.Option>
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ marginTop: 24 }}>
                      <Button onClick={resetFeedbackFilters} type="default">
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

              <Tabs defaultActiveKey="unreviewed">
                <TabPane 
                  tab={
                    <span>
                      <BellOutlined />
                      Chưa duyệt ({getFilteredFeedbacks(unreviewedFeedbacks).length || 0})
                    </span>
                  } 
                  key="unreviewed"
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Những đánh giá này cần được duyệt và phê duyệt trước khi đăng lên hệ thống.
                    </Text>
                  </div>
                  <Table 
                    dataSource={getFilteredFeedbacks(unreviewedFeedbacks)} 
                    columns={unreviewedFeedbackColumns} 
                    rowKey="id"
                    loading={feedbackLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} trong tổng số ${total} đánh giá chưa duyệt${feedbackFilters.star !== 'all' ? ` (đã lọc theo ${feedbackFilters.star} sao)` : ''}`
                    }}
                  />
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <CheckCircleOutlined />
                      Đã đăng ({getFilteredFeedbacks(publishedFeedbacks).length || 0})
                    </span>
                  } 
                  key="published"
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Những đánh giá này đã được duyệt và đang hiển thị công khai trên hệ thống.
                    </Text>
                  </div>
                  <Table 
                    dataSource={getFilteredFeedbacks(publishedFeedbacks)} 
                    columns={publishedFeedbackColumns} 
                    rowKey="id"
                    loading={feedbackLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} trong tổng số ${total} đánh giá đã đăng${feedbackFilters.star !== 'all' ? ` (đã lọc theo ${feedbackFilters.star} sao)` : ''}`
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
                      <RechartsTooltip formatter={(value, name) => [`${value}`, name]} labelFormatter={(label) => label} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Phân bố trạng thái đánh giá">
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
                      <RechartsTooltip formatter={(value, name) => [`${value}`, name]} labelFormatter={(label) => label} />
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
                        title="Tỉ lệ thành công"
                        value={dashboardStats.successRateOfQuitPlans || 0}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
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
              title={`Tất cả nhắc nhở (${reminderPagination.total} tổng)`}
              extra={
                <Button 
                  type="primary" 
                  onClick={() => setReminderModalVisible(true)}
                  icon={<PlusOutlined />}
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
                    `${range[0]}-${range[1]} trong tổng số ${total} nhắc nhở`
                  }
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>

        {/* Reminder Management Modal */}
        <Modal
          title={editingReminder ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở'}
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
                { required: true, message: 'Vui lòng nhập nội dung nhắc nhở' }
              ]}
            >
              <Input.TextArea rows={4} placeholder="Nhập nội dung nhắc nhở..." />
            </Form.Item>
            
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[
                { required: true, message: 'Vui lòng chọn danh mục nhắc nhở' }
              ]}
            >
              <Select placeholder="Chọn danh mục">
                <Select.Option value="HEALTH_BENEFITS">Lợi ích sức khỏe</Select.Option>
                <Select.Option value="MOTIVATIONAL_QUOTES">Câu nói truyền cảm hứng</Select.Option>
                <Select.Option value="TIPS_AND_TRICKS">Mẹo và thủ thuật</Select.Option>
                <Select.Option value="SMOKING_FACTS">Sự thật về thuốc lá</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={reminderLoading}>
                  {editingReminder ? 'Cập nhật nhắc nhở' : 'Tạo nhắc nhở'}
                </Button>
                <Button onClick={handleReminderModalCancel}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
