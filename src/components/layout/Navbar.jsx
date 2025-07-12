import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Badge, Button, Typography, Empty, Tabs, Divider, Spin } from 'antd';
import { DownOutlined, UserOutlined, DashboardOutlined, CalendarOutlined, HeartOutlined, BarChartOutlined, QuestionCircleOutlined, FileTextOutlined, PlusOutlined, HistoryOutlined, AimOutlined, ClockCircleOutlined, EditOutlined, BellOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import * as notificationService from '../../services/notificationService';
import '../../styles/Navbar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unread');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
      // Fetch notifications when user is authenticated
      fetchNotifications();
    } else {
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [location]); // Re-check when location changes

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const [allNotifications, unreadNotifications] = await Promise.all([
        notificationService.getAllNotifications(0, 20),
        notificationService.getUnreadNotifications(0, 20)
      ]);
      
      if (allNotifications.success) {
        setNotifications(allNotifications.data.content || []);
      } else if (allNotifications.content) {
        setNotifications(allNotifications.content);
      }
      
      if (unreadNotifications.success) {
        setUnreadNotifications(unreadNotifications.data.content || []);
        setUnreadCount(unreadNotifications.data.totalElements || 0);
      } else if (unreadNotifications.content) {
        setUnreadNotifications(unreadNotifications.content);
        setUnreadCount(unreadNotifications.totalElements || unreadNotifications.content.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle notification click (mark as read)
  const handleNotificationClick = async (notificationId, isRead) => {
    if (!isRead) {
      try {
        await notificationService.markAsRead(notificationId);
        // Refresh notifications
        fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/');
  };

  // Check if current user is premium member
  const checkIfPremiumMember = () => {
    if (!user) return false;
    
    // Check localStorage user data for isPremium flag
    try {
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        const userData = JSON.parse(userFromStorage);
        return userData.isPremiumMembership === true;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    
    // Fallback to user object
    return user.isPremiumMembership === true;
  };

  // Member-specific dropdown menus
  const memberDropdownMenus = {
    // dashboard: {
    //   label: 'Bảng điều khiển',
    //   icon: <DashboardOutlined />,
    //   items: [
    //     // { key: '/member/dashboard', label: 'Tổng quan', path: '/member/dashboard' }
    //     // Remove quit-progress route as it doesn't exist
    //     // { key: '/member/quit-progress', label: 'Tiến trình của tôi', path: '/member/quit-progress' }
    //   ]
    // },
    quitPlan: {
      label: 'Kế hoạch cai thuốc',
      icon: <FileTextOutlined />,
      items: [
        { key: '/member/quit-plan', label: 'Kế hoạch hiện tại', path: '/member/quit-plan' },
        { key: '/member/quit-plan-flow', label: 'Hành trình cai thuốc', path: '/member/quit-plan-flow' },
        { key: '/member/quit-plan-creation', label: 'Tạo kế hoạch mới', path: '/member/quit-plan-creation' },
        { key: '/member/quit-plan-history', label: 'Lịch sử kế hoạch', path: '/member/quit-plan-history' }
      ]
    },
    tracking: {
      label: 'Theo dõi hàng ngày',
      icon: <HeartOutlined />,
      items: [
        { key: '/member/daily-checkin', label: 'Điểm danh hàng ngày', path: '/member/daily-checkin' },
        { key: '/member/daily-record', label: 'Nhật ký hàng ngày', path: '/member/daily-record' },
        { key: '/member/craving-logger', label: 'Ghi nhận cơn thèm', path: '/member/craving-logger' },
        { key: '/member/smoking-status', label: 'Tình trạng hút thuốc', path: '/member/smoking-status' }
      ]
    },
    progress: {
      label: 'Tiến độ & Thống kê',
      icon: <BarChartOutlined />,
      items: [
        { key: '/member/progress-chart', label: 'Biểu đồ tiến độ', path: '/member/progress-chart' }
      ]
    },
    support: {
      label: 'Hỗ trợ & Huấn luyện',
      icon: <UserOutlined />,
      items: [
        { key: '/member/appointments', label: 'Cuộc hẹn', path: '/member/appointments' },
        { key: '/member/chat', label: 'Tin nhắn', path: '/member/chat' },
        // { key: '/member/coach-selection', label: 'Chọn huấn luyện viên', path: '/member/coach-selection' },
        // { key: '/member/reminders', label: 'Nhắc nhở', path: '/member/reminders' }
      ]
    }
    // Remove phases dropdown since it has no valid routes
    // phases: {
    //   label: 'Phase Management',
    //   icon: <AimOutlined />,
    //   items: [
    //     // Remove this as route requires planId parameter
    //     // { key: '/member/phase-progress', label: 'Phase Progress', path: '/member/phase-progress' }
    //   ]
    // },
    // account: {
    //   label: 'Account & Settings',
    //   icon: <UserOutlined />,
    //   items: [
    //     { key: '/member/membership-status', label: 'Membership', path: '/member/membership-status' },
    //     { key: '/member/account-management', label: 'Settings', path: '/member/account-management' },
    //     { key: '/member/premium-upgrade', label: 'Premium Upgrade', path: '/member/premium-upgrade' },
    //     { key: '/member/user-settings', label: 'User Settings', path: '/member/user-settings' }
    //   ]
    // }
  };

  // Coach-specific dropdown menus
  const coachDropdownMenus = {
    dashboard: {
      label: 'Bảng điều khiển',
      icon: <DashboardOutlined />,
      items: [
        { key: '/coach/dashboard', label: 'Tổng quan', path: '/coach/dashboard' }
      ]
    },
    // schedule: {
    //   label: 'Lịch trình & Cuộc hẹn',
    //   icon: <CalendarOutlined />,
    //   items: [
    //     { key: '/coach/schedule', label: 'Lịch trình của tôi', path: '/coach/schedule' }
    //     // Remove appointments route as it doesn't exist
    //     // { key: '/coach/appointments', label: 'Cuộc hẹn', path: '/coach/appointments' }
    //   ]
    // },
    management: {
      label: 'Quản lý kế hoạch',
      icon: <BarChartOutlined />,
      items: [
        { key: '/coach/create-quit-plan', label: 'Tạo kế hoạch cai thuốc', path: '/coach/create-quit-plan' },
        { key: '/coach/quit-plan-approval', label: 'Phê duyệt kế hoạch', path: '/coach/quit-plan-approval' },
        { key: '/coach/member-management', label: 'Quản lý thành viên', path: '/coach/member-management' }
      ]
    },
    community: {
      label: 'Cộng đồng',
      icon: <QuestionCircleOutlined />,
      items: [
        { key: '/coach/qna', label: 'Trả lời câu hỏi', path: '/coach/qna' },
        { key: '/qa-forum', label: 'Diễn đàn hỏi đáp', path: '/qa-forum' }
      ]
    }
  };

  // Render navigation links based on user role
  const renderNavLinks = () => {
    // Public links available to all users
    const publicLinks = [
      { path: '/', label: 'Trang chủ' },
      // { path: '/blog', label: 'Bài viết' }
      // { path: '/about', label: 'Giới thiệu' },
      // { path: '/contact', label: 'Liên hệ' }
    ];

    // Admin-specific links
    const adminLinks = [
      { path: '/admin/dashboard', label: 'Bảng điều khiển Admin' },
      { path: '/admin/coaches', label: 'Quản lý huấn luyện viên' } // Added Coach Management link
    ];

    // Determine which links to show based on user role
    let links = [...publicLinks];

    if (user) {
      // Add role-specific links
      const userRole = user.role?.toLowerCase();
      if (userRole === 'member') {
        // Add Q&A Forum link for members
        links.push({ path: '/qa-forum', label: 'Diễn đàn hỏi đáp' });
      } else if (userRole === 'coach') {
        // Coaches will use dropdown menus instead of links
        links = [...publicLinks];
      } else if (userRole === 'admin') {
        links = [...adminLinks];
      }
    }

    return links.map((link, index) => (
      <li className="nav-item" key={index}>
        <Link 
          to={link.path} 
          className={`nav-link ${location.pathname === link.path || location.pathname.startsWith(link.path + '/') ? 'active fw-bold' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          {link.label}
        </Link>
      </li>
    ));
  };

  // Create dropdown menu for member dropdowns
  const createDropdownMenu = (dropdown) => {
    const menu = (
      <Menu>
        {dropdown.items.map(item => (
          <Menu.Item key={item.key}>
            <Link to={item.path} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['hover']}>
        <a className="nav-link d-flex align-items-center" onClick={(e) => e.preventDefault()}>
          {dropdown.icon}
          <span className="ms-1">{dropdown.label}</span>
          <DownOutlined className="ms-1" style={{ fontSize: '12px' }} />
        </a>
      </Dropdown>
    );
  };

  // Render member dropdown menus
  const renderMemberDropdowns = () => {
    return Object.values(memberDropdownMenus).map((dropdown, index) => (
      <li className="nav-item nav-link-no-underline" key={index}>
      {createDropdownMenu(dropdown)}
      </li>
    ));
  };

  // Render coach dropdown menus
  const renderCoachDropdowns = () => {
    return Object.values(coachDropdownMenus).map((dropdown, index) => (
      <li className="nav-item nav-link-no-underline" key={index}>
        {createDropdownMenu(dropdown)}
      </li>
    ));
  };

  // Render notification bell dropdown
  const renderNotificationBell = () => {
    if (!user) return null;

    const { Text } = Typography;
    const { TabPane } = Tabs;

    // Render notification item
    const renderNotificationItem = (notification, index) => (
      <div
        key={notification.id || index}
        onClick={() => handleNotificationClick(notification.id, notification.isRead)}
        style={{
          padding: '12px 16px',
          backgroundColor: notification.isRead ? 'transparent' : '#f6ffed',
          borderLeft: notification.isRead ? 'none' : '4px solid #52c41a',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderBottom: '1px solid #f0f0f0'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = notification.isRead ? '#fafafa' : '#f0f9ff';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = notification.isRead ? 'transparent' : '#f6ffed';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, marginRight: '8px' }}>
            <div style={{
              fontWeight: notification.isRead ? 'normal' : '600',
              marginBottom: '4px',
              fontSize: '14px',
              color: notification.isRead ? '#666' : '#262626',
              lineHeight: '1.4'
            }}>
              {notification.title || 'Thông báo mới'}
            </div>
            <div style={{
              color: '#8c8c8c',
              fontSize: '12px',
              marginBottom: '6px',
              lineHeight: '1.4'
            }}>
              {notification.content || notification.message || 'Nội dung thông báo'}
            </div>
            <div style={{
              color: '#bfbfbf',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ClockCircleOutlined />
              {formatNotificationTime(notification.createdAt || notification.timestamp)}
            </div>
          </div>
          {!notification.isRead && (
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              marginTop: '4px'
            }} />
          )}
        </div>
      </div>
    );

    // Notification content component
    const NotificationContent = () => (
      <div style={{ width: 380, maxHeight: 500 }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <Text strong style={{ fontSize: '16px', color: '#262626' }}>
            Thông báo
          </Text>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={fetchNotifications}
            loading={notificationLoading}
            style={{ color: '#1890ff' }}
          >
            Làm mới
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ margin: 0 }}
          tabBarStyle={{ margin: 0, padding: '0 16px', backgroundColor: '#fafafa' }}
        >
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Chưa đọc
                {unreadCount > 0 && (
                  <Badge count={unreadCount} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                )}
              </span>
            }
            key="unread"
          >
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notificationLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Spin />
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Không có thông báo chưa đọc
                      </Text>
                    }
                    style={{ margin: 0 }}
                  />
                </div>
              ) : (
                unreadNotifications.map((notification, index) =>
                  renderNotificationItem(notification, index)
                )
              )}
            </div>
          </TabPane>

          <TabPane tab="Tất cả" key="all">
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notificationLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Spin />
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Không có thông báo nào
                      </Text>
                    }
                    style={{ margin: 0 }}
                  />
                </div>
              ) : (
                notifications.map((notification, index) =>
                  renderNotificationItem(notification, index)
                )
              )}
            </div>
          </TabPane>
        </Tabs>

        {/* Footer */}
        {(notifications.length > 0 || unreadNotifications.length > 0) && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center',
            backgroundColor: '#fafafa'
          }}>
            <Button type="link" size="small" style={{ color: '#1890ff', fontWeight: '500' }}>
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </div>
    );

    return (
      <Dropdown
        overlay={<div />}
        dropdownRender={() => <NotificationContent />}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="notification-dropdown"
        onVisibleChange={(visible) => {
          if (visible && unreadCount > 0) {
            setActiveTab('unread');
          }
        }}
      >
        <Badge count={unreadCount} size="small" offset={[-5, 5]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              color: 'white',
              border: 'none',
              fontSize: '18px',
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            onClick={(e) => e.preventDefault()}
          />
        </Badge>
      </Dropdown>
    );
  };

  // Render authentication section (login/register buttons or user info)
  const renderAuthSection = () => {
    if (user) {
      return (
        <div className="d-flex align-items-center">
          {renderNotificationBell()}
          <span className="me-3 ms-2 text-white">{user.fullName}</span>
          <Link to="/profile" className="btn btn-outline-light me-2">Hồ sơ</Link>
          <button onClick={handleLogout} className="btn btn-outline-danger">Đăng xuất</button>
        </div>
      );
    } else {
      return (
        <div className="d-flex">
          <Link to="/login" className="btn btn-outline-light me-2">Đăng nhập</Link>
          <Link to="/register" className="btn btn-success">Đăng ký</Link>
        </div>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/logo.svg" alt="Logo" height="32" className="me-2" />
          <span>Cai thuốc lá</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isOpen ? "true" : "false"} 
          aria-label="Chuyển đổi điều hướng"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {renderNavLinks()}
            {user && user.role?.toLowerCase() === 'member' && checkIfPremiumMember() && renderMemberDropdowns()}
            {user && user.role?.toLowerCase() === 'coach' && renderCoachDropdowns()}
          </ul>
          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;