// import React, { useState, useEffect } from 'react';
// import {
//   Layout,
//   Typography,
//   Table,
//   Tag,
//   Space,
//   Button,
//   Avatar,
//   Rate,
//   Progress,
//   Input,
//   Select,
//   Card,
//   Row,
//   Col,
//   Statistic,
//   Badge,
//   Tooltip,
//   message,
//   Spin
// } from 'antd';
// import {
//   UserOutlined,
//   StarOutlined,
//   TeamOutlined,
//   CheckCircleOutlined,
//   SearchOutlined,
//   FilterOutlined,
//   EyeOutlined,
//   EditOutlined,
//   BarChartOutlined
// } from '@ant-design/icons';
// import { getAllCoaches } from '../../services/coachManagementService';
// import '../../styles/Dashboard.css';

// const { Title, Text } = Typography;
// const { Search } = Input;
// const { Option } = Select;

// const CoachList = ({ onCoachSelect, onCoachEdit, onViewPerformance, showActions = true }) => {
//   const [coaches, setCoaches] = useState([]);
//   const [filteredCoaches, setFilteredCoaches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     specialty: 'all',
//     rating: 'all'
//   });
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     fetchCoaches();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [coaches, filters, searchTerm]);

//   const fetchCoaches = async () => {
//     try {
//       setLoading(true);
//       const response = await getAllCoaches();
//       setCoaches(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching coaches:', error);
//       message.error('Failed to load coaches');
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...coaches];

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(coach =>
//         coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         coach.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         coach.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Status filter
//     if (filters.status !== 'all') {
//       filtered = filtered.filter(coach => coach.status === filters.status);
//     }

//     // Specialty filter
//     if (filters.specialty !== 'all') {
//       filtered = filtered.filter(coach => coach.specialty === filters.specialty);
//     }

//     // Rating filter
//     if (filters.rating !== 'all') {
//       const minRating = parseFloat(filters.rating);
//       filtered = filtered.filter(coach => coach.rating >= minRating);
//     }

//     setFilteredCoaches(filtered);
//   };

//   const getSpecialtyColor = (specialty) => {
//     const colors = {
//       'Behavioral Therapy': 'blue',
//       'Medical Support': 'green',
//       'Nutritional Counseling': 'orange',
//       'Stress Management': 'purple',
//       'General Support': 'cyan'
//     };
//     return colors[specialty] || 'default';
//   };

//   const getStatusBadge = (status) => {
//     return status === 'Active' ? 
//       <Badge status="success" text="Active" /> : 
//       <Badge status="default" text="Inactive" />;
//   };

//   const getAvailabilityStatus = (activeMembersCount) => {
//     if (activeMembersCount < 10) return { color: 'success', text: 'Available' };
//     if (activeMembersCount < 18) return { color: 'warning', text: 'Limited' };
//     return { color: 'error', text: 'Full' };
//   };

//   const columns = [
//     {
//       title: 'Coach',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text, record) => (
//         <Space>
//           <Avatar src={record.photo_url} icon={<UserOutlined />} />
//           <div>
//             <Text strong>{text}</Text>
//             <br />
//             <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
//           </div>
//         </Space>
//       ),
//       width: 250
//     },
//     {
//       title: 'Specialty',
//       dataIndex: 'specialty',
//       key: 'specialty',
//       render: specialty => <Tag color={getSpecialtyColor(specialty)}>{specialty}</Tag>
//     },
//     {
//       title: 'Rating',
//       dataIndex: 'rating',
//       key: 'rating',
//       render: rating => (
//         <Space>
//           <Rate disabled value={rating} allowHalf style={{ fontSize: '12px' }} />
//           <Text>{rating}</Text>
//         </Space>
//       ),
//       sorter: (a, b) => a.rating - b.rating
//     },
//     {
//       title: 'Members',
//       dataIndex: 'active_members',
//       key: 'active_members',
//       render: (count, record) => {
//         const availability = getAvailabilityStatus(count);
//         return (
//           <div>
//             <Text strong>{count}</Text>
//             <br />
//             <Tag color={availability.color} style={{ fontSize: '10px' }}>
//               {availability.text}
//             </Tag>
//           </div>
//         );
//       },
//       sorter: (a, b) => a.active_members - b.active_members
//     },
//     {
//       title: 'Success Rate',
//       dataIndex: 'success_rate',
//       key: 'success_rate',
//       render: rate => (
//         <div>
//           <Progress 
//             percent={rate} 
//             size="small" 
//             strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f'}
//           />
//           <Text style={{ fontSize: '12px' }}>{rate}%</Text>
//         </div>
//       ),
//       sorter: (a, b) => a.success_rate - b.success_rate
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: status => getStatusBadge(status),
//       filters: [
//         { text: 'Active', value: 'Active' },
//         { text: 'Inactive', value: 'Inactive' }
//       ],
//       onFilter: (value, record) => record.status === value
//     },
//     {
//       title: 'Joined',
//       dataIndex: 'joined',
//       key: 'joined',
//       render: date => new Date(date).toLocaleDateString('vi-VN')
//     }
//   ];

//   // Add actions column if showActions is true
//   if (showActions) {
//     columns.push({
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space size="small">
//           <Tooltip title="View Details">
//             <Button
//               icon={<EyeOutlined />}
//               size="small"
//               onClick={() => onCoachSelect && onCoachSelect(record)}
//             />
//           </Tooltip>
          
//           <Tooltip title="View Performance">
//             <Button
//               icon={<BarChartOutlined />}
//               size="small"
//               onClick={() => onViewPerformance && onViewPerformance(record)}
//             />
//           </Tooltip>

//           <Tooltip title="Edit">
//             <Button
//               icon={<EditOutlined />}
//               size="small"
//               onClick={() => onCoachEdit && onCoachEdit(record)}
//             />
//           </Tooltip>
//         </Space>
//       ),
//       width: 120
//     });
//   }

//   // Calculate statistics
//   const stats = {
//     total: coaches.length,
//     active: coaches.filter(c => c.status === 'Active').length,
//     averageRating: coaches.length ? 
//       (coaches.reduce((sum, c) => sum + c.rating, 0) / coaches.length).toFixed(1) : 0,
//     totalMembers: coaches.reduce((sum, c) => sum + c.active_members, 0)
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '50px' }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div className="coach-list">
//       {/* Statistics Cards */}
//       <Row gutter={[16, 16]} className="mb-4">
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Total Coaches"
//               value={stats.total}
//               prefix={<UserOutlined />}
//               valueStyle={{ color: '#722ed1' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Active Coaches"
//               value={stats.active}
//               prefix={<CheckCircleOutlined />}
//               valueStyle={{ color: '#52c41a' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Average Rating"
//               value={stats.averageRating}
//               prefix={<StarOutlined />}
//               valueStyle={{ color: '#faad14' }}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} sm={6}>
//           <Card>
//             <Statistic
//               title="Total Members"
//               value={stats.totalMembers}
//               prefix={<TeamOutlined />}
//               valueStyle={{ color: '#1890ff' }}
//             />
//           </Card>
//         </Col>
//       </Row>

//       {/* Filters */}
//       <Card className="mb-4">
//         <Row gutter={[16, 16]} align="middle">
//           <Col xs={24} md={8}>
//             <Search
//               placeholder="Search by name, specialty, email..."
//               allowClear
//               enterButton={<SearchOutlined />}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </Col>
//           <Col xs={24} md={5}>
//             <Select
//               placeholder="Status"
//               style={{ width: '100%' }}
//               value={filters.status}
//               onChange={(value) => setFilters({ ...filters, status: value })}
//             >
//               <Option value="all">All Status</Option>
//               <Option value="Active">Active</Option>
//               <Option value="Inactive">Inactive</Option>
//             </Select>
//           </Col>
//           <Col xs={24} md={5}>
//             <Select
//               placeholder="Specialty"
//               style={{ width: '100%' }}
//               value={filters.specialty}
//               onChange={(value) => setFilters({ ...filters, specialty: value })}
//             >
//               <Option value="all">All Specialties</Option>
//               <Option value="Behavioral Therapy">Behavioral Therapy</Option>
//               <Option value="Medical Support">Medical Support</Option>
//               <Option value="Nutritional Counseling">Nutritional Counseling</Option>
//               <Option value="Stress Management">Stress Management</Option>
//             </Select>
//           </Col>
//           <Col xs={24} md={6}>
//             <Select
//               placeholder="Rating"
//               style={{ width: '100%' }}
//               value={filters.rating}
//               onChange={(value) => setFilters({ ...filters, rating: value })}
//             >
//               <Option value="all">All Ratings</Option>
//               <Option value="4.5">4.5+ Stars</Option>
//               <Option value="4.0">4.0+ Stars</Option>
//               <Option value="3.5">3.5+ Stars</Option>
//             </Select>
//           </Col>
//         </Row>
//       </Card>

//       {/* Coaches Table */}
//       <Card>
//         <Table
//           dataSource={filteredCoaches}
//           columns={columns}
//           rowKey="id"
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total) => `Total ${total} coaches`
//           }}
//           scroll={{ x: 800 }}
//         />
//       </Card>
//     </div>
//   );
// };

// export default CoachList;