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

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  // Member-specific dropdown menus
  const memberDropdownMenus = {
    dashboard: {
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      items: [
        { key: '/member/dashboard', label: 'Overview', path: '/member/dashboard' },
        { key: '/member/quit-progress', label: 'My Progress', path: '/member/quit-progress' }
      ]
    },
    quitPlan: {
      label: 'Quit Plan',
      icon: <FileTextOutlined />,
      items: [
        { key: '/member/quit-plan', label: 'Current Plan', path: '/member/quit-plan' },
        { key: '/member/quit-plan-flow', label: 'Quit Journey', path: '/member/quit-plan-flow' },
        { key: '/member/quit-plan-creation', label: 'Create New Plan', path: '/member/quit-plan-creation' },
        { key: '/member/quit-plan-history', label: 'Plan History', path: '/member/quit-plan-history' }
      ]
    },
    tracking: {
      label: 'Daily Tracking',
      icon: <HeartOutlined />,
      items: [
        { key: '/member/daily-checkin', label: 'Daily Check-in', path: '/member/daily-checkin' },
        { key: '/member/daily-record', label: 'Daily Log', path: '/member/daily-record' },
        { key: '/member/craving-logger', label: 'Craving Logger', path: '/member/craving-logger' },
        { key: '/member/smoking-status', label: 'Smoking Status', path: '/member/smoking-status' }
      ]
    },
    progress: {
      label: 'Progress & Analytics',
      icon: <BarChartOutlined />,
      items: [
        { key: '/member/progress-chart', label: 'Progress Charts', path: '/member/progress-chart' }
      ]
    },
    support: {
      label: 'Support & Coaching',
      icon: <UserOutlined />,
      items: [
        { key: '/member/appointments', label: 'Appointments', path: '/member/appointments' },
        { key: '/member/coach-selection', label: 'Coach Selection', path: '/member/coach-selection' },
        { key: '/member/reminders', label: 'Reminders', path: '/member/reminders' }
      ]
    },
    phases: {
      label: 'Phase Management',
      icon: <AimOutlined />,
      items: [
        { key: '/member/phase-progress', label: 'Phase Progress', path: '/member/phase-progress' }
      ]
    },
    account: {
      label: 'Account & Settings',
      icon: <UserOutlined />,
      items: [
        { key: '/member/membership-status', label: 'Membership', path: '/member/membership-status' },
        { key: '/member/account-management', label: 'Settings', path: '/member/account-management' },
        { key: '/member/premium-upgrade', label: 'Premium Upgrade', path: '/member/premium-upgrade' },
        { key: '/member/user-settings', label: 'User Settings', path: '/member/user-settings' }
      ]
    }
  };

  // Coach-specific dropdown menus
  const coachDropdownMenus = {
    dashboard: {
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      items: [
        { key: '/coach/dashboard', label: 'Overview', path: '/coach/dashboard' }
      ]
    },
    schedule: {
      label: 'Schedule & Appointments',
      icon: <CalendarOutlined />,
      items: [
        { key: '/coach/schedule', label: 'My Schedule', path: '/coach/schedule' },
        { key: '/coach/appointments', label: 'Appointments', path: '/coach/appointments' }
      ]
    },
    management: {
      label: 'Plan Management',
      icon: <BarChartOutlined />,
      items: [
        { key: '/coach/quit-plan-approval', label: 'Plan Approvals', path: '/coach/quit-plan-approval' },
        { key: '/coach/member-management', label: 'Member Management', path: '/coach/member-management' }
      ]
    },
    community: {
      label: 'Community',
      icon: <QuestionCircleOutlined />,
      items: [
        { key: '/qa-forum', label: 'Q&A Forum', path: '/qa-forum' }
      ]
    }
  };

  // Render navigation links based on user role
  const renderNavLinks = () => {
    // Public links available to all users
    const publicLinks = [
      { path: '/', label: 'Home' },
      { path: '/blog', label: 'Articles' }
      // { path: '/about', label: 'About' },
      // { path: '/contact', label: 'Contact' }
    ];

    // Admin-specific links
    const adminLinks = [
      { path: '/admin/dashboard', label: 'Admin Panel' },
      { path: '/admin/coaches', label: 'Coach Management' } // Added Coach Management link
    ];

    // Determine which links to show based on user role
    let links = [...publicLinks];

    if (user) {
      // Add role-specific links
      const userRole = user.role?.toLowerCase();
      if (userRole === 'member') {
        // Add Q&A Forum link for members
        links.push({ path: '/qa-forum', label: 'Q&A Forum' });
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
          <Link to="/profile" className="btn btn-outline-light me-2">Profile</Link>
          <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        </div>
      );
    } else {
      return (
        <div className="d-flex">
          <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
          <Link to="/register" className="btn btn-success">Register</Link>
        </div>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/logo.svg" alt="Logo" height="32" className="me-2" />
          <span>Smoking Cessation</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {renderNavLinks()}
            {user && user.role?.toLowerCase() === 'member' && renderMemberDropdowns()}
            {user && user.role?.toLowerCase() === 'coach' && renderCoachDropdowns()}
          </ul>
          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;