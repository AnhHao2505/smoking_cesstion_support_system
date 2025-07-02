import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Row,
  Col,
  List,
  Checkbox,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Dropdown,
  Menu,
  Badge,
  Avatar,
  Tooltip,
  Progress,
  Divider,
  Alert,
  Tabs,
  Calendar,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  BellOutlined,
  UserOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FlagOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getPhasesOfPlan 
} from '../../services/phaseService';
import { 
  getQuitPlanByPlanId 
} from '../../services/quitPlanService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const PhaseTaskManager = () => {
  const { phaseId, planId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);

        // Get phase details
        const phasesResponse = await getPhasesOfPlan(planId);
        if (phasesResponse.success) {
          const currentPhase = phasesResponse.data.phases?.find(p => 
            p.quit_phase_id?.toString() === phaseId || 
            p.phase_id?.toString() === phaseId
          );
          setPhase(currentPhase);
          
          // Generate mock tasks for this phase
          const phaseTasks = generatePhaseTasks(currentPhase);
          setTasks(phaseTasks);
          setFilteredTasks(phaseTasks);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching task data:", error);
        message.error("Không thể tải dữ liệu nhiệm vụ");
        setLoading(false);
      }
    };

    if (phaseId && planId) {
      fetchTaskData();
    }
  }, [phaseId, planId]);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, filter, sortBy]);

  // Generate tasks based on phase
  const generatePhaseTasks = (phase) => {
    const baseTasks = {
      'Chuẩn bị': [
        {
          id: 1,
          title: 'Xác định ngày bỏ thuốc',
          description: 'Chọn một ngày cụ thể trong tuần tới để bắt đầu cai thuốc',
          status: 'completed',
          priority: 'high',
          dueDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
          estimatedTime: 30,
          category: 'planning',
          tags: ['quan trọng', 'lập kế hoạch']
        },
        {
          id: 2,
          title: 'Loại bỏ thuốc lá khỏi nhà',
          description: 'Vứt bỏ tất cả thuốc lá, bật lửa và gạt tàn trong nhà',
          status: 'in-progress',
          priority: 'high',
          dueDate: moment().format('YYYY-MM-DD'),
          estimatedTime: 60,
          category: 'action',
          tags: ['dọn dẹp', 'chuẩn bị']
        },
        {
          id: 3,
          title: 'Thông báo cho gia đình và bạn bè',
          description: 'Chia sẻ kế hoạch cai thuốc với những người thân để nhận được sự hỗ trợ',
          status: 'pending',
          priority: 'medium',
          dueDate: moment().add(1, 'days').format('YYYY-MM-DD'),
          estimatedTime: 45,
          category: 'communication',
          tags: ['gia đình', 'hỗ trợ']
        },
        {
          id: 4,
          title: 'Chuẩn bị các hoạt động thay thế',
          description: 'Lên danh sách các hoạt động để làm khi có cơn thèm thuốc',
          status: 'pending',
          priority: 'medium',
          dueDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          estimatedTime: 90,
          category: 'planning',
          tags: ['thay thế', 'cơn thèm']
        }
      ],
      'Hành động': [
        {
          id: 5,
          title: 'Ghi nhật ký cơn thèm hàng ngày',
          description: 'Theo dõi và ghi lại cường độ cơn thèm thuốc mỗi ngày',
          status: 'in-progress',
          priority: 'high',
          dueDate: moment().format('YYYY-MM-DD'),
          estimatedTime: 15,
          category: 'tracking',
          tags: ['hàng ngày', 'theo dõi'],
          recurring: 'daily'
        },
        {
          id: 6,
          title: 'Thực hành kỹ thuật thở sâu',
          description: 'Luyện tập kỹ thuật thở sâu 3 lần mỗi ngày để giảm căng thẳng',
          status: 'pending',
          priority: 'medium',
          dueDate: moment().format('YYYY-MM-DD'),
          estimatedTime: 20,
          category: 'exercise',
          tags: ['thở', 'thư giãn'],
          recurring: 'daily'
        }
      ],
      'Duy trì': [
        {
          id: 7,
          title: 'Kiểm tra sức khỏe định kỳ',
          description: 'Đặt lịch khám sức khỏe để theo dõi cải thiện sau khi cai thuốc',
          status: 'pending',
          priority: 'medium',
          dueDate: moment().add(7, 'days').format('YYYY-MM-DD'),
          estimatedTime: 120,
          category: 'health',
          tags: ['sức khỏe', 'kiểm tra']
        }
      ]
    };
    
    return baseTasks[phase?.phase_name] || [];
  };

  const filterAndSortTasks = () => {
    let filtered = [...tasks];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return moment(a.dueDate).diff(moment(b.dueDate));
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    setFilteredTasks(filtered);
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    message.success('Cập nhật trạng thái thành công');
  };

  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setTaskModalVisible(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: moment(task.dueDate),
      tags: task.tags
    });
    setTaskModalVisible(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    message.success('Xóa nhiệm vụ thành công');
  };

  const handleSaveTask = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTask) {
        // Update existing task
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id 
            ? { ...task, ...values, dueDate: values.dueDate.format('YYYY-MM-DD') }
            : task
        ));
        message.success('Cập nhật nhiệm vụ thành công');
      } else {
        // Add new task
        const newTask = {
          id: Date.now(),
          ...values,
          dueDate: values.dueDate.format('YYYY-MM-DD'),
          status: 'pending'
        };
        setTasks(prev => [...prev, newTask]);
        message.success('Thêm nhiệm vụ thành công');
      }
      
      setTaskModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'pending': return 'default';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      case 'pending': return 'Chờ thực hiện';
      case 'overdue': return 'Quá hạn';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getTaskProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => t.status === 'overdue').length
    };
  };

  const taskStats = getTaskStats();

  const taskActionMenu = (task) => (
    <Menu>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => handleEditTask(task)}
      >
        Chỉnh sửa
      </Menu.Item>
      <Menu.Item 
        key="complete" 
        icon={<CheckOutlined />}
        onClick={() => handleTaskStatusChange(task.id, 'completed')}
        disabled={task.status === 'completed'}
      >
        Đánh dấu hoàn thành
      </Menu.Item>
      <Menu.Item 
        key="start" 
        icon={<PlayCircleOutlined />}
        onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
        disabled={task.status === 'completed' || task.status === 'in-progress'}
      >
        Bắt đầu thực hiện
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteTask(task.id)}
        danger
      >
        Xóa nhiệm vụ
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-task-manager">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            Quản lý nhiệm vụ - {phase?.phase_name}
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddTask}
            >
              Thêm nhiệm vụ
            </Button>
            <Button onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Space>
        </div>

        {/* Task Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tổng nhiệm vụ"
                value={taskStats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={taskStats.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={taskStats.inProgress}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tiến độ"
                value={getTaskProgress()}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
              <Progress percent={getTaskProgress()} showInfo={false} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Left Column - Task List */}
          <Col xs={24} lg={16}>
            <Card>
              {/* Filters and Controls */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Space>
                  <Select
                    value={filter}
                    onChange={setFilter}
                    style={{ width: 150 }}
                    prefix={<FilterOutlined />}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="pending">Chờ thực hiện</Option>
                    <Option value="in-progress">Đang thực hiện</Option>
                    <Option value="completed">Hoàn thành</Option>
                    <Option value="overdue">Quá hạn</Option>
                  </Select>
                  
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 150 }}
                    prefix={<SortAscendingOutlined />}
                  >
                    <Option value="dueDate">Hạn thực hiện</Option>
                    <Option value="priority">Độ ưu tiên</Option>
                    <Option value="status">Trạng thái</Option>
                  </Select>
                </Space>
                
                <Text type="secondary">
                  {filteredTasks.length} / {tasks.length} nhiệm vụ
                </Text>
              </div>

              {/* Task Tabs */}
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Danh sách" key="list">
                  <List
                    dataSource={filteredTasks}
                    renderItem={task => (
                      <List.Item
                        actions={[
                          <Checkbox
                            checked={task.status === 'completed'}
                            onChange={(e) => handleTaskStatusChange(
                              task.id, 
                              e.target.checked ? 'completed' : 'pending'
                            )}
                          />,
                          <Dropdown overlay={taskActionMenu(task)} trigger={['click']}>
                            <Button type="text" icon={<MoreOutlined />} />
                          </Dropdown>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ 
                                backgroundColor: getStatusColor(task.status) === 'success' ? '#52c41a' : 
                                               getStatusColor(task.status) === 'processing' ? '#1890ff' : '#d9d9d9'
                              }}
                              icon={
                                task.status === 'completed' ? <CheckCircleOutlined /> :
                                task.status === 'in-progress' ? <PlayCircleOutlined /> :
                                <ClockCircleOutlined />
                              }
                            />
                          }
                          title={
                            <div>
                              <Text 
                                delete={task.status === 'completed'}
                                strong={task.priority === 'high'}
                              >
                                {task.title}
                              </Text>
                              <div className="mt-1">
                                <Space size="small">
                                  <Tag color={getStatusColor(task.status)}>
                                    {getStatusText(task.status)}
                                  </Tag>
                                  <Tag color={getPriorityColor(task.priority)}>
                                    {task.priority === 'high' ? 'Cao' : 
                                     task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                  </Tag>
                                  {task.tags?.map(tag => (
                                    <Tag key={tag} size="small">{tag}</Tag>
                                  ))}
                                </Space>
                              </div>
                            </div>
                          }
                          description={
                            <div>
                              <Paragraph ellipsis={{ rows: 2 }}>
                                {task.description}
                              </Paragraph>
                              <Space size="small" className="text-muted">
                                <CalendarOutlined />
                                <Text type="secondary">
                                  {moment(task.dueDate).format('DD/MM/YYYY')}
                                </Text>
                                <ClockCircleOutlined />
                                <Text type="secondary">
                                  {task.estimatedTime} phút
                                </Text>
                                {task.recurring && (
                                  <>
                                    <BellOutlined />
                                    <Text type="secondary">Hàng ngày</Text>
                                  </>
                                )}
                              </Space>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
                
                <TabPane tab="Lịch" key="calendar">
                  <Calendar
                    dateCellRender={(date) => {
                      const dayTasks = tasks.filter(task => 
                        moment(task.dueDate).isSame(date, 'day')
                      );
                      return (
                        <ul className="task-calendar-list">
                          {dayTasks.map(task => (
                            <li key={task.id}>
                              <Badge 
                                color={getStatusColor(task.status)} 
                                text={task.title}
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Right Column - Quick Actions & Summary */}
          <Col xs={24} lg={8}>
            {/* Today's Tasks */}
            <Card title="Nhiệm vụ hôm nay" className="mb-4">
              {tasks.filter(task => 
                moment(task.dueDate).isSame(moment(), 'day')
              ).map(task => (
                <div key={task.id} className="task-quick-item mb-2">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onChange={(e) => handleTaskStatusChange(
                      task.id, 
                      e.target.checked ? 'completed' : 'pending'
                    )}
                  >
                    <Text delete={task.status === 'completed'}>
                      {task.title}
                    </Text>
                  </Checkbox>
                </div>
              ))}
              {tasks.filter(task => 
                moment(task.dueDate).isSame(moment(), 'day')
              ).length === 0 && (
                <Text type="secondary">Không có nhiệm vụ nào hôm nay</Text>
              )}
            </Card>

            {/* Task Categories */}
            <Card title="Phân loại nhiệm vụ" className="mb-4">
              <Row gutter={[8, 8]}>
                {['planning', 'action', 'tracking', 'health'].map(category => {
                  const count = tasks.filter(t => t.category === category).length;
                  return count > 0 ? (
                    <Col span={12} key={category}>
                      <Tag color="blue">{category}: {count}</Tag>
                    </Col>
                  ) : null;
                })}
              </Row>
            </Card>

            {/* Quick Actions */}
            <Card title="Hành động nhanh">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block 
                  icon={<PlusOutlined />}
                  onClick={handleAddTask}
                >
                  Thêm nhiệm vụ mới
                </Button>
                <Button 
                  block 
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    tasks.filter(t => t.status === 'pending').forEach(task => {
                      handleTaskStatusChange(task.id, 'completed');
                    });
                  }}
                >
                  Hoàn thành tất cả
                </Button>
                <Button 
                  block 
                  icon={<CalendarOutlined />}
                  onClick={() => setActiveTab('calendar')}
                >
                  Xem lịch nhiệm vụ
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Task Modal */}
        <Modal
          title={editingTask ? 'Chỉnh sửa nhiệm vụ' : 'Thêm nhiệm vụ mới'}
          open={taskModalVisible}
          onCancel={() => setTaskModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setTaskModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveTask}>
              {editingTask ? 'Cập nhật' : 'Thêm'}
            </Button>
          ]}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề nhiệm vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề nhiệm vụ" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Độ ưu tiên"
                  rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                >
                  <Select placeholder="Chọn độ ưu tiên">
                    <Option value="high">Cao</Option>
                    <Option value="medium">Trung bình</Option>
                    <Option value="low">Thấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select placeholder="Chọn danh mục">
                    <Option value="planning">Lập kế hoạch</Option>
                    <Option value="action">Hành động</Option>
                    <Option value="tracking">Theo dõi</Option>
                    <Option value="health">Sức khỏe</Option>
                    <Option value="communication">Giao tiếp</Option>
                    <Option value="exercise">Luyện tập</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Hạn thực hiện"
                  rules={[{ required: true, message: 'Vui lòng chọn hạn thực hiện' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="estimatedTime"
                  label="Thời gian dự kiến (phút)"
                >
                  <Input type="number" placeholder="60" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="tags"
              label="Thẻ tag"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Nhập các thẻ tag"
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PhaseTaskManager;