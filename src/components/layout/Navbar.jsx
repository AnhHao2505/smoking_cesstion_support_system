import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Menu } from 'antd';
import { DownOutlined, UserOutlined, DashboardOutlined, CalendarOutlined, HeartOutlined, BarChartOutlined, QuestionCircleOutlined, FileTextOutlined, PlusOutlined, HistoryOutlined, AimOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import * as authService from '../../services/authService';
import '../../styles/Navbar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
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

  // Render authentication section (login/register buttons or user info)
  const renderAuthSection = () => {
    if (user) {
      return (
        <div className="d-flex align-items-center">
          <span className="me-3 text-white">{user.fullName}</span>
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