import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  SettingOutlined,
  CrownOutlined,
  PlusOutlined,
  HeartOutlined,
  BarChartOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MemberLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // In a real app, call logout API and clear auth tokens
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  // Add new menu items
  const items = [
    {
      key: '/member/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/member/dashboard">Dashboard</Link>,
    },
    {
      key: 'quit-plan',
      icon: <FileTextOutlined />,
      label: 'Kế hoạch cai thuốc',
      children: [
        {
          key: '/member/quit-plan',
          label: <Link to="/member/quit-plan">Kế hoạch của tôi</Link>,
        },
        {
          key: '/member/quit-plan-creation',
          label: <Link to="/member/quit-plan-creation">Tạo kế hoạch mới</Link>,
        },
        {
          key: '/member/phase-progress',
          label: <Link to="/member/phase-progress">Tiến độ giai đoạn</Link>,
        }
      ]
    },
    {
      key: 'daily-tracking',
      icon: <FormOutlined />,
      label: 'Theo dõi hàng ngày',
      children: [
        {
          key: '/member/daily-checkin',
          label: <Link to="/member/daily-checkin">Check-in hàng ngày</Link>,
        },
        {
          key: '/member/daily-record',
          label: <Link to="/member/daily-record">Nhật ký</Link>,
        },
        {
          key: '/member/smoking-status',
          label: <Link to="/member/smoking-status">Trạng thái hút thuốc</Link>,
        },
        {
          key: '/member/craving-logger',
          label: <Link to="/member/craving-logger">Ghi chép cơn thèm</Link>,
        }
      ]
    },
    {
      key: 'progress',
      icon: <LineChartOutlined />,
      label: 'Tiến độ & Thống kê',
      children: [
        {
          key: '/member/quit-progress',
          label: <Link to="/member/quit-progress">Tiến độ cai thuốc</Link>,
        },
        {
          key: '/member/phase-progress',
          label: <Link to="/member/phase-progress">Tiến độ giai đoạn</Link>,
        }
      ]
    },
    {
      key: 'reminders',
      icon: <BellOutlined />,
      label: 'Nhắc nhở',
      children: [
        {
          key: '/member/reminders',
          label: <Link to="/member/reminders">Danh sách nhắc nhở</Link>,
        },
        {
          key: '/member/reminders/create',
          label: <Link to="/member/reminders/create">Tạo nhắc nhở</Link>,
        },
        {
          key: '/member/reminders/calendar',
          label: <Link to="/member/reminders/calendar">Lịch nhắc nhở</Link>,
        },
        {
          key: '/member/reminders/settings',
          label: <Link to="/member/reminders/settings">Cài đặt</Link>,
        }
      ]
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Cuộc hẹn',
      children: [
        {
          key: '/member/appointments',
          label: <Link to="/member/appointments">Lịch hẹn</Link>,
        },
        {
          key: '/member/appointment-management',
          label: <Link to="/member/appointment-management">Quản lý cuộc hẹn</Link>,
        }
      ]
    },
    {
      key: 'coach',
      icon: <TeamOutlined />,
      label: 'Coach',
      children: [
        {
          key: '/member/coach-selection',
          label: <Link to="/member/coach-selection">Chọn Coach</Link>,
        }
      ]
    },
    {
      key: 'qa-forum',
      icon: <QuestionCircleOutlined />,
      label: <Link to="/qa-forum">Q&A Forum</Link>,
    },
    {
      key: 'account',
      icon: <UserOutlined />,
      label: 'Tài khoản',
      children: [
        {
          key: '/member/account-management',
          label: <Link to="/member/account-management">Quản lý tài khoản</Link>,
        },
        {
          key: '/member/member-profile',
          label: <Link to="/member/member-profile">Hồ sơ cá nhân</Link>,
        },
        {
          key: '/member/user-settings',
          label: <Link to="/member/user-settings">Cài đặt</Link>,
        },
        {
          key: '/member/membership-status',
          label: <Link to="/member/membership-status">Trạng thái thành viên</Link>,
        },
        {
          key: '/member/premium-upgrade',
          label: <Link to="/member/premium-upgrade">Nâng cấp Premium</Link>,
        }
      ]
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        width={250}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10
        }}
      >
        <div className="logo" style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px',
          overflow: 'hidden'
        }}>
          {collapsed ? (
            <img 
              src="/logo-small.png" 
              alt="Logo" 
              style={{ height: '32px', width: '32px' }} 
            />
          ) : (
            <img 
              src="/logo-full.png" 
              alt="Logo" 
              style={{ height: '32px', maxWidth: '100%' }} 
            />
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['quit-plan', 'daily-tracking', 'progress', 'reminders', 'appointments', 'coach', 'account']}
          items={items}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              style={{ marginRight: 16 }} 
              badge={{ count: 5 }}
            />
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>Nguyễn Văn A</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberLayout;