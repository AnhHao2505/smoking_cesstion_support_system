import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
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
  AimOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/LandingPage.css"; // Import CSS cho Member Layout styles

const { Header, Sider, Content } = Layout;

const MemberLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, call logout API and clear auth tokens
    localStorage.removeItem("token");
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  // Add new menu items
  const items = [
    {
      key: "/member/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/member/dashboard">Dashboard</Link>,
    },
    {
      key: "quit-plan",
      icon: <FileTextOutlined />,
      label: "Kế hoạch cai thuốc",
      children: [
        {
          key: "/member/quit-plan",
          label: <Link to="/member/quit-plan">Kế hoạch của tôi</Link>,
        },
        {
          key: "/member/quit-plan-creation",
          label: <Link to="/member/quit-plan-creation">Tạo kế hoạch mới</Link>,
        },
        {
          key: "/member/phase-progress",
          label: <Link to="/member/phase-progress">Tiến độ giai đoạn</Link>,
        },
      ],
    },
    {
      key: "daily-tracking",
      icon: <FormOutlined />,
      label: "Theo dõi hàng ngày",
      children: [
        {
          key: "/member/daily-checkin",
          label: <Link to="/member/daily-checkin">Check-in hàng ngày</Link>,
        },
        {
          key: "/member/daily-record",
          label: <Link to="/member/daily-record">Nhật ký</Link>,
        },
        {
          key: "/member/smoking-status",
          label: <Link to="/member/smoking-status">Trạng thái hút thuốc</Link>,
        },
        {
          key: "/member/craving-logger",
          label: <Link to="/member/craving-logger">Ghi chép cơn thèm</Link>,
        },
      ],
    },
    {
      key: "progress",
      icon: <LineChartOutlined />,
      label: "Tiến độ & Thống kê",
      children: [
        {
          key: "/member/quit-progress",
          label: <Link to="/member/quit-progress">Tiến độ cai thuốc</Link>,
        },
        {
          key: "/member/phase-progress",
          label: <Link to="/member/phase-progress">Tiến độ giai đoạn</Link>,
        },
      ],
    },
    {
      key: "reminders",
      icon: <BellOutlined />,
      label: "Nhắc nhở",
      children: [
        {
          key: "/member/reminders",
          label: <Link to="/member/reminders">Danh sách nhắc nhở</Link>,
        },
        {
          key: "/member/reminders/create",
          label: <Link to="/member/reminders/create">Tạo nhắc nhở</Link>,
        },
        {
          key: "/member/reminders/calendar",
          label: <Link to="/member/reminders/calendar">Lịch nhắc nhở</Link>,
        },
        {
          key: "/member/reminders/settings",
          label: <Link to="/member/reminders/settings">Cài đặt</Link>,
        },
      ],
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Cuộc hẹn",
      children: [
        {
          key: "/member/appointments",
          label: <Link to="/member/appointments">Lịch hẹn</Link>,
        },
        {
          key: "/member/appointment-management",
          label: (
            <Link to="/member/appointment-management">Quản lý cuộc hẹn</Link>
          ),
        },
      ],
    },
    {
      key: "coach",
      icon: <TeamOutlined />,
      label: "Huấn luyện viên",
      children: [
        {
          key: "/member/coach-selection",
          label: <Link to="/member/coach-selection">Chọn huấn luyện viên</Link>,
        },
        {
          key: "/member/chat",
          label: <Link to="/member/chat">Chat với Coach</Link>,
        },
      ],
    },
    {
      key: "qa-forum",
      icon: <QuestionCircleOutlined />,
      label: <Link to="/qa-forum">Diễn đàn Q&A</Link>,
    },
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Tài khoản",
      children: [
        {
          key: "/member/account-management",
          label: <Link to="/member/account-management">Quản lý tài khoản</Link>,
        },
        {
          key: "/member/member-profile",
          label: <Link to="/member/member-profile">Hồ sơ cá nhân</Link>,
        },
        {
          key: "/member/user-settings",
          label: <Link to="/member/user-settings">Cài đặt</Link>,
        },
        {
          key: "/member/membership-status",
          label: (
            <Link to="/member/membership-status">Trạng thái thành viên</Link>
          ),
        },
        {
          key: "/member/premium-upgrade",
          label: <Link to="/member/premium-upgrade">Nâng cấp Premium</Link>,
        },
        {
          key: "/member/transaction-history",
          label: (
            <Link to="/member/transaction-history">Lịch sử giao dịch</Link>
          ),
        },
      ],
    },
  ];

  return (
    <Layout className="member-layout" style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={250}
        style={{
          backgroundColor: "#f0f9ff", // nhẹ nhàng hơn
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          zIndex: 10,
        }}
      >
        <div
          className="logo"
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 16px",
            overflow: "hidden",
          }}
        >
          {collapsed ? (
            <img
              src="/logo-small.png"
              alt="Logo"
              style={{ height: "32px", width: "32px" }}
            />
          ) : (
            <img
              src="/logo-full.png"
              alt="Logo"
              style={{ height: "32px", maxWidth: "100%" }}
            />
          )}
        </div>

        <Menu
          mode="inline"
          defaultOpenKeys={[
            "quit-plan",
            "daily-tracking",
            "progress",
            "reminders",
            "appointments",
            "coach",
            "account",
          ]}
          items={items}
          style={{
            backgroundColor: "transparent",
            fontSize: "15px",
          }}
          theme="light"
        />
      </Sider>

      <Layout>
        <Header
          className="header-blue"
          style={{
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ color: "#fff" }} />
              ) : (
                <MenuFoldOutlined style={{ color: "#fff" }} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={<BellOutlined style={{ color: "#fff", fontSize: 18 }} />}
              style={{ marginRight: 20 }}
              badge={{ count: 5 }}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#fff", color: "#1890ff" }}
                />
                <span className="user-name">Nguyễn Văn A</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="content-panel">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberLayout;
