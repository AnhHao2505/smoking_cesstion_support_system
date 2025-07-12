import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Button } from 'antd';
import { SettingOutlined, DownOutlined, UserOutlined, DashboardOutlined, CalendarOutlined, HeartOutlined, BarChartOutlined, QuestionCircleOutlined, FileTextOutlined, PlusOutlined, HistoryOutlined, AimOutlined, ClockCircleOutlined, EditOutlined, CrownOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import NotificationBell from '../notifications/NotificationBell';
import PaymentModal from '../payment/PaymentModal';
import '../../styles/Navbar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
  }, [location]); // Re-check when location changes

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

  // Handle upgrade button click
  const handleUpgradeClick = () => {
    setPaymentModalVisible(true);
  };

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    setPaymentModalVisible(false);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    // Refresh user data
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
    }
  };

  // Member-specific dropdown menus
  const memberDropdownMenus = {
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
        { key: '/member/chat', label: 'Tin nhắn', path: '/member/chat' }
      ]
    },
    account: {
      label: 'Tài khoản',
      icon: <SettingOutlined />,
      items: [
        { key: '/member/transactions', label: 'Lịch sử giao dịch', path: '/member/transactions' }
      ]
    }
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
    quitPlans: {
      label: 'Quản lý kế hoạch',
      icon: <FileTextOutlined />,
      items: [
        { key: '/coach/create-quit-plan', label: 'Tạo kế hoạch', path: '/coach/create-quit-plan' },
        { key: '/coach/quit-plan-approval', label: 'Phê duyệt kế hoạch', path: '/coach/quit-plan-approval' },
        { key: '/coach/quit-plan-approval-new', label: 'Phê duyệt - Luồng mới', path: '/coach/quit-plan-approval-new' }
      ]
    },
    support: {
      label: 'Hỗ trợ thành viên',
      icon: <UserOutlined />,
      items: [
        { key: '/coach/schedule', label: 'Quản lý lịch trình', path: '/coach/schedule' },
        { key: '/coach/qna', label: 'Q&A', path: '/coach/qna' }
      ]
    }
  };

  // Admin-specific dropdown menus
  const adminDropdownMenus = {
    dashboard: {
      label: 'Bảng điều khiển',
      icon: <DashboardOutlined />,
      items: [
        { key: '/admin/dashboard', label: 'Tổng quan', path: '/admin/dashboard' }
      ]
    },
    management: {
      label: 'Quản lý',
      icon: <UserOutlined />,
      items: [
        { key: '/admin/coach-management', label: 'Quản lý huấn luyện viên', path: '/admin/coach-management' },
        { key: '/admin/coach-list', label: 'Danh sách huấn luyện viên', path: '/admin/coach-list' },
        { key: '/admin/coach-assignment', label: 'Phân công huấn luyện viên', path: '/admin/coach-assignment' },
        { key: '/admin/coach-performance', label: 'Hiệu suất huấn luyện viên', path: '/admin/coach-performance' },
      ]
    }
  };

  // Create dropdown menu component
  const createDropdownMenu = (dropdown) => {
    const menu = (
      <Menu>
        {dropdown.items.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['hover']}>
        <Link className="nav-link d-flex align-items-center" to="#" onClick={(e) => e.preventDefault()}>
          {dropdown.icon}
          <span className="ms-2">{dropdown.label}</span>
          <DownOutlined className="ms-1" />
        </Link>
      </Dropdown>
    );
  };

  // Render dropdowns based on user role
  const renderRoleSpecificDropdowns = () => {
    if (!user) return null;

    let dropdownMenus = {};
    switch (user.role) {
      case 'MEMBER':
        dropdownMenus = memberDropdownMenus;
        break;
      case 'COACH':
        dropdownMenus = coachDropdownMenus;
        break;
      case 'ADMIN':
        dropdownMenus = adminDropdownMenus;
        break;
      default:
        return null;
    }

    return Object.values(dropdownMenus).map((dropdown, index) => (
      <li key={index} className="nav-item dropdown">
        {createDropdownMenu(dropdown)}
      </li>
    ));
  };

  // Render authentication section (login/register buttons or user info)
  const renderAuthSection = () => {
    if (user) {
      const isPremium = checkIfPremiumMember();
      
      return (
        <div className="d-flex align-items-center">
          
          {/* Upgrade button for non-premium members */}
          {!isPremium && user.role === 'MEMBER' && (
            <Button
              type="primary"
              icon={<CrownOutlined />}
              onClick={handleUpgradeClick}
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                borderColor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                marginRight: '12px',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
              }}
              size="small"
            >
              Nâng cấp Premium
            </Button>
          )}
          <NotificationBell />
          
          {/* Premium badge for premium members */}
          {isPremium && (
            <div
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#000',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CrownOutlined />
              PREMIUM
            </div>
          )}
          
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
          <HeartOutlined className="me-2" style={{ fontSize: '24px' }} />
          <span className="fw-bold">Smoking Cessation Support</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Trang chủ</Link>
            </li>
            
            {user && (
              <li className="nav-item">
                <Link to={`/${user.role.toLowerCase()}/dashboard`} className="nav-link">
                  <DashboardOutlined className="me-1" />
                  Bảng điều khiển
                </Link>
              </li>
            )}

            {renderRoleSpecificDropdowns()}

            <li className="nav-item">
              <Link to="/blog" className="nav-link">Blog</Link>
            </li>
            
            <li className="nav-item">
              <Link to="/qna" className="nav-link">
                <QuestionCircleOutlined className="me-1" />
                Q&A
              </Link>
            </li>
            
            {user && (
              <li className="nav-item">
                <Link to="/demo/notifications" className="nav-link">
                  🔔 Demo
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {renderAuthSection()}
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={handlePaymentModalClose}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </nav>
  );
};

export default NavBar;