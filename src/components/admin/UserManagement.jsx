// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Layout, 
//   Typography, 
//   Table, 
//   Tag, 
//   Space, 
//   Button, 
//   Card, 
//   Input, 
//   Select, 
//   Form, 
//   Modal, 
//   message, 
//   Avatar, 
//   Popconfirm, 
//   Badge,
//   Tabs,
//   Tooltip,
//   Row,
//   Col,
//   Divider,
//   Progress, Switch, Statistic
// } from 'antd';
// import {
//   UserOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   LockOutlined,
//   UnlockOutlined,
//   SearchOutlined,
//   PlusOutlined,
//   TeamOutlined,
//   MedicineBoxOutlined,
//   UserSwitchOutlined
// } from '@ant-design/icons';
// import { 
//   getAllUsers, 
//   createUser, 
//   updateUser, 
//   deleteUser, 
//   getRoles 
// } from '../../services/userManagementService';

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { TabPane } = Tabs;

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [coaches, setCoaches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [form] = Form.useForm();
//   const [searchParams, setSearchParams] = useState({
//     search: '',
//     role: 'All',
//     status: 'All'
//   });
//   const [roles, setRoles] = useState([]);
  
//   // Fetch user data
//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data } = await getAllUsers(searchParams);
//       setUsers(data);
//       setCoaches(data.filter(user => user.role === 'Coach'));
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       message.error("Failed to load users");
//       setLoading(false);
//     }
//   }, [searchParams]);
  
//   // Fetch roles
//   const fetchRoles = async () => {
//     try {
//       const rolesData = await getRoles();
//       setRoles(rolesData);
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//     }
//   };
  
//   useEffect(() => {
//     fetchUsers();
//     fetchRoles();
//   }, [fetchUsers]);
  
//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setSearchParams({
//       ...searchParams,
//       search: e.target.value
//     });
//   };
  
//   // Handle role filter change
//   const handleRoleFilterChange = (value) => {
//     setSearchParams({
//       ...searchParams,
//       role: value
//     });
//   };
  
//   // Handle status filter change
//   const handleStatusFilterChange = (value) => {
//     setSearchParams({
//       ...searchParams,
//       status: value
//     });
//   };
  
//   // Show modal for creating a new user
//   const showCreateModal = () => {
//     setEditingUser(null);
//     form.resetFields();
//     setModalVisible(true);
//   };
  
//   // Show modal for editing a user
//   const showEditModal = (record) => {
//     setEditingUser(record);
//     form.setFieldsValue({
//       name: record.name,
//       email: record.email,
//       phone: record.phone,
//       role: record.role,
//       status: record.status
//     });
//     setModalVisible(true);
//   };
  
//   // Handle form submission
//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields();
      
//       if (editingUser) {
//         // Update existing user
//         const response = await updateUser(editingUser.id, values);
//         if (response.success) {
//           message.success(response.message);
//           setModalVisible(false);
//           fetchUsers();
//         }
//       } else {
//         // Create new user
//         const response = await createUser(values);
//         if (response.success) {
//           message.success(response.message);
//           setModalVisible(false);
//           fetchUsers();
//         }
//       }
//     } catch (error) {
//       console.error("Form submission error:", error);
//     }
//   };
  
//   // Handle user deletion
//   const handleDelete = async (userId) => {
//     try {
//       const response = await deleteUser(userId);
//       if (response.success) {
//         message.success(response.message);
//         fetchUsers();
//       }
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       message.error("Failed to delete user");
//     }
//   };
  
//   // Handle toggling user status
//   const handleToggleStatus = async (record) => {
//     try {
//       const newStatus = record.status === 'Active' ? 'Inactive' : 'Active';
//       const response = await updateUser(record.id, { ...record, status: newStatus });
//       if (response.success) {
//         message.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
//         fetchUsers();
//       }
//     } catch (error) {
//       console.error("Error toggling user status:", error);
//       message.error("Failed to update user status");
//     }
//   };
  
//   // User table columns definition
//   const userColumns = [
//     {
//       title: 'ID',
//       dataIndex: 'id',
//       key: 'id',
//       sorter: (a, b) => a.id - b.id,
//     },
//     {
//       title: 'Name',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text, record) => (
//         <Space>
//           <Avatar icon={<UserOutlined />} />
//           <Text strong>{text}</Text>
//         </Space>
//       ),
//       sorter: (a, b) => a.name.localeCompare(b.name),
//     },
//     {
//       title: 'Email',
//       dataIndex: 'email',
//       key: 'email',
//     },
//     {
//       title: 'Phone',
//       dataIndex: 'phone',
//       key: 'phone',
//     },
//     {
//       title: 'Role',
//       dataIndex: 'role',
//       key: 'role',
//       render: (role) => (
//         <Tag color={role === 'Member' ? 'blue' : role === 'Coach' ? 'green' : 'purple'}>
//           {role}
//         </Tag>
//       ),
//       filters: [
//         { text: 'Member', value: 'Member' },
//         { text: 'Coach', value: 'Coach' },
//         { text: 'Admin', value: 'Admin' },
//       ],
//       onFilter: (value, record) => record.role === value,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => (
//         <Badge status={status === 'Active' ? 'success' : 'default'} text={status} />
//       ),
//       filters: [
//         { text: 'Active', value: 'Active' },
//         { text: 'Inactive', value: 'Inactive' },
//       ],
//       onFilter: (value, record) => record.status === value,
//     },
//     {
//       title: 'Joined',
//       dataIndex: 'joined',
//       key: 'joined',
//       sorter: (a, b) => new Date(a.joined) - new Date(b.joined),
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space>
//           <Tooltip title="Edit">
//             <Button 
//               icon={<EditOutlined />} 
//               size="small"
//               onClick={() => showEditModal(record)}
//             />
//           </Tooltip>
          
//           <Tooltip title={record.status === 'Active' ? "Deactivate" : "Activate"}>
//             <Button 
//               icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />} 
//               size="small" 
//               type={record.status === 'Active' ? 'default' : 'primary'}
//               onClick={() => handleToggleStatus(record)}
//             />
//           </Tooltip>
          
//           <Tooltip title="Delete">
//             <Popconfirm
//               title="Are you sure you want to delete this user?"
//               onConfirm={() => handleDelete(record.id)}
//               okText="Yes"
//               cancelText="No"
//             >
//               <Button 
//                 icon={<DeleteOutlined />} 
//                 size="small" 
//                 danger
//               />
//             </Popconfirm>
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];
  
//   return (
//     <div className="user-management">
//       <div className="container py-4">
//         <Title level={2}>
//           <TeamOutlined /> User Management
//         </Title>
        
//         {/* User Statistics */}
//         <Row gutter={[16, 16]} className="mb-4">
//           <Col xs={24} sm={8} md={6}>
//             <Card>
//               <Statistic
//                 title="Active Users"
//                 value={users.filter(u => u.status === 'Active').length}
//                 prefix={<UserOutlined />}
//                 valueStyle={{ color: '#52c41a' }}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={8} md={6}>
//             <Card>
//               <Statistic
//                 title="Coaches"
//                 value={coaches.length}
//                 prefix={<MedicineBoxOutlined />}
//                 valueStyle={{ color: '#722ed1' }}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={8} md={6}>
//             <Card>
//               <Statistic
//                 title="Admins"
//                 value={users.filter(u => u.role === 'Admin').length}
//                 prefix={<UserSwitchOutlined />}
//                 valueStyle={{ color: '#eb2f96' }}
//               />
//             </Card>
//           </Col>
//         </Row>
        
//         <Tabs defaultActiveKey="1">
//           <TabPane tab={<span><TeamOutlined /> All Users</span>} key="1">
//             {/* Search and Filters */}
//             <div className="table-toolbar mb-3">
//               <Row gutter={[16, 16]} align="middle">
//                 <Col xs={24} sm={12} md={8}>
//                   <Input.Search
//                     placeholder="Search by name, email or phone"
//                     allowClear
//                     value={searchParams.search}
//                     onChange={handleSearchChange}
//                     onSearch={fetchUsers}
//                   />
//                 </Col>
//                 <Col xs={12} sm={6} md={4}>
//                   <Select
//                     placeholder="Filter by role"
//                     style={{ width: '100%' }}
//                     value={searchParams.role}
//                     onChange={handleRoleFilterChange}
//                     onSelect={fetchUsers}
//                   >
//                     <Option value="All">All Roles</Option>
//                     <Option value="Admin">Admin</Option>
//                     <Option value="Coach">Coach</Option>
//                     <Option value="Member">Member</Option>
//                   </Select>
//                 </Col>
//                 <Col xs={12} sm={6} md={4}>
//                   <Select
//                     placeholder="Filter by status"
//                     style={{ width: '100%' }}
//                     value={searchParams.status}
//                     onChange={handleStatusFilterChange}
//                     onSelect={fetchUsers}
//                   >
//                     <Option value="All">All Status</Option>
//                     <Option value="Active">Active</Option>
//                     <Option value="Inactive">Inactive</Option>
//                   </Select>
//                 </Col>
//                 <Col xs={24} sm={24} md={8} className="text-right">
//                   <Button 
//                     type="primary" 
//                     icon={<UserOutlined />}
//                     onClick={showCreateModal}
//                   >
//                     Add User
//                   </Button>
//                 </Col>
//               </Row>
//             </div>
            
//             {/* Users Table */}
//             <Table
//               loading={loading}
//               dataSource={users}
//               columns={userColumns}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//             />
//           </TabPane>
          
//           {/* Additional tabs if needed */}
//         </Tabs>
        
//         {/* User Create/Edit Modal */}
//         <Modal
//           title={editingUser ? "Edit User" : "Create New User"}
//           visible={modalVisible}
//           onCancel={() => setModalVisible(false)}
//           footer={[
//             <Button key="cancel" onClick={() => setModalVisible(false)}>
//               Cancel
//             </Button>,
//             <Button key="submit" type="primary" onClick={handleSubmit}>
//               {editingUser ? "Update" : "Create"}
//             </Button>
//           ]}
//         >
//           <Form
//             form={form}
//             layout="vertical"
//           >
//             <Form.Item
//               name="name"
//               label="Full Name"
//               rules={[{ required: true, message: 'Please enter the full name' }]}
//             >
//               <Input placeholder="Enter full name" />
//             </Form.Item>
            
//             <Form.Item
//               name="email"
//               label="Email"
//               rules={[
//                 { required: true, message: 'Please enter the email' },
//                 { type: 'email', message: 'Please enter a valid email' }
//               ]}
//             >
//               <Input placeholder="Enter email address" />
//             </Form.Item>
            
//             <Form.Item
//               name="phone"
//               label="Phone Number"
//               rules={[{ required: true, message: 'Please enter the phone number' }]}
//             >
//               <Input placeholder="Enter phone number" />
//             </Form.Item>
            
//             <Form.Item
//               name="role"
//               label="Role"
//               rules={[{ required: true, message: 'Please select a role' }]}
//             >
//               <Select placeholder="Select a role">
//                 {roles.map(role => (
//                   <Option key={role.id} value={role.name}>{role.name}</Option>
//                 ))}
//               </Select>
//             </Form.Item>
            
//             {editingUser && (
//               <Form.Item
//                 name="status"
//                 label="Status"
//                 rules={[{ required: true, message: 'Please select a status' }]}
//               >
//                 <Select placeholder="Select status">
//                   <Option value="Active">Active</Option>
//                   <Option value="Inactive">Inactive</Option>
//                 </Select>
//               </Form.Item>
//             )}
            
//             {!editingUser && (
//               <Form.Item
//                 name="password"
//                 label="Password"
//                 rules={[{ required: true, message: 'Please enter a password' }]}
//               >
//                 <Input.Password placeholder="Enter password" />
//               </Form.Item>
//             )}
//           </Form>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default UserManagement;