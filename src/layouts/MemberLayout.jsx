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
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'quit-plan',
      icon: <FileTextOutlined />,
      label: <Link to="/quit-plan">Quit Plan</Link>,
    },
    {
      key: 'daily-record',
      icon: <FormOutlined />,
      label: <Link to="/daily-record">Daily Record</Link>,
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: <Link to="/appointments">Appointments</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: 'account',
      icon: <UserOutlined />,
      label: 'Tài khoản',
      children: [
        {
          key: '/member/account-management',
          label: 'Quản lý tài khoản',
          onClick: () => navigate('/member/account-management')
        },
        {
          key: '/member/user-settings',
          label: 'Cài đặt',
          onClick: () => navigate('/member/user-settings')
        },
        {
          key: '/member/membership-status',
          label: 'Trạng thái thành viên',
          onClick: () => navigate('/member/membership-status')
        },
        {
          key: '/member/premium-upgrade',
          label: 'Nâng cấp Premium',
          onClick: () => navigate('/member/premium-upgrade')
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
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname.replace('/', '')]}
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