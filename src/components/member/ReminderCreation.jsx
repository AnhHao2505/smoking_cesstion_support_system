import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  TimePicker,
  DatePicker,
  Switch,
  Checkbox,
  Radio,
  Steps,
  message,
  Alert,
  Divider,
  Tag,
  Avatar,
  Tooltip,
  InputNumber,
  List
} from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  TrophyOutlined,
  BulbOutlined,
  NotificationOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  createReminder,
  REMINDER_CATEGORIES 
} from '../../services/reminderService';
import { getCurrentUser } from '../../services/authService';
import '../../styles/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { RangePicker } = DatePicker;

// Component for frequency step content
const FrequencyStepContent = ({ form, frequency }) => {
  return (
    <div>
      <Form.Item
        name="frequency"
        label="Tần suất nhắc nhở"
        rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
      >
        <Select 
          placeholder="Chọn tần suất" 
          onChange={(value) => {
            form.setFieldsValue({ frequency: value });
            // Reset time fields when frequency changes
            form.setFieldsValue({ time: undefined, times: undefined });
          }}
        >
          <Option value="once">Một lần</Option>
          <Option value="daily">Hàng ngày</Option>
          <Option value="weekly">Hàng tuần</Option>
          <Option value="monthly">Hàng tháng</Option>
          <Option value="multiple_daily">Nhiều lần trong ngày</Option>
          <Option value="hourly">Theo giờ</Option>
          <Option value="custom">Tùy chỉnh</Option>
        </Select>
      </Form.Item>

      {/* Time selection based on frequency */}
      {['daily', 'weekly', 'monthly'].includes(frequency) && (
        <Form.Item
          name="time"
          label="Thời gian nhắc nhở"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <TimePicker 
            format="HH:mm" 
            placeholder="Chọn giờ"
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}

      {/* Multiple times for multiple_daily */}
      {frequency === 'multiple_daily' && (
        <Form.Item
          name="times"
          label="Các thời điểm trong ngày"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thời điểm' }]}
        >
          <div>
            <Button 
              type="dashed" 
              onClick={() => {
                const currentTimes = form.getFieldValue('times') || [];
                form.setFieldsValue({ 
                  times: [...currentTimes, moment().hour(9).minute(0)] 
                });
              }}
              className="mb-2"
            >
              + Thêm thời điểm
            </Button>
            <Form.List name="times">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                      >
                        <TimePicker format="HH:mm" />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  ))}
                </div>
              )}
            </Form.List>
          </div>
        </Form.Item>
      )}

      {/* Hour range for hourly */}
      {frequency === 'hourly' && (
        <>
          <Form.Item
            name="hourRange"
            label="Khoảng thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
          >
            <TimePicker.RangePicker 
              format="HH:mm" 
              placeholder={['Từ', 'Đến']}
            />
          </Form.Item>
          <Form.Item
            name="hourInterval"
            label="Nhắc nhở mỗi (giờ)"
            initialValue={1}
          >
            <InputNumber min={1} max={6} />
          </Form.Item>
        </>
      )}

      {/* Weekly specific options */}
      {frequency === 'weekly' && (
        <Form.Item
          name="weekdays"
          label="Chọn ngày trong tuần"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một ngày' }]}
        >
          <Checkbox.Group
            options={[
              { label: 'Thứ hai', value: 1 },
              { label: 'Thứ ba', value: 2 },
              { label: 'Thứ tư', value: 3 },
              { label: 'Thứ năm', value: 4 },
              { label: 'Thứ sáu', value: 5 },
              { label: 'Thứ bảy', value: 6 },
              { label: 'Chủ nhật', value: 0 },
            ]}
          />
        </Form.Item>
      )}

      {/* Monthly specific options */}
      {frequency === 'monthly' && (
        <Form.Item
          name="monthDay"
          label="Ngày trong tháng"
          initialValue={1}
        >
          <InputNumber min={1} max={31} />
        </Form.Item>
      )}

      {/* Date range for once or limited time */}
      {['once', 'custom'].includes(frequency) && (
        <Form.Item
          name="dateRange"
          label="Khoảng thời gian áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
        >
          <RangePicker 
            style={{ width: '100%' }}
            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          />
        </Form.Item>
      )}

      <Form.Item
        name="enabled"
        label="Kích hoạt ngay"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </div>
  );
};

const ReminderCreation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reminderType, setReminderType] = useState('custom');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState({});
  
  // Watch frequency value for conditional rendering
  const frequency = Form.useWatch('frequency', form);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const reminderTemplates = [
    {
      id: 'daily_checkin',
      title: 'Cập nhật tiến trình hàng ngày',
      description: 'Nhắc nhở ghi lại tình trạng và cảm xúc mỗi ngày',
      category: 'HEALTH_BENEFITS',
      frequency: 'daily',
      icon: <CalendarOutlined />,
      color: '#1890ff',
      defaultTime: '09:00',
      popular: true
    },
    {
      id: 'medication',
      title: 'Uống thuốc hỗ trợ',
      description: 'Nhắc nhở uống thuốc cai thuốc theo đúng giờ',
      category: 'HEALTH_BENEFITS',
      frequency: 'multiple_daily',
      icon: <MedicineBoxOutlined />,
      color: '#52c41a',
      defaultTimes: ['08:00', '20:00'],
      popular: true
    },
    {
      id: 'motivation',
      title: 'Tin nhắn động lực',
      description: 'Câu nói truyền cảm hứng để duy trì động lực',
      category: 'MOTIVATIONAL_QUOTES',
      frequency: 'daily',
      icon: <TrophyOutlined />,
      color: '#faad14',
      defaultTime: '19:00',
      popular: true
    },
    {
      id: 'breathing',
      title: 'Luyện tập thở sâu',
      description: 'Nhắc nhở thực hiện kỹ thuật thở sâu',
      category: 'TIPS_AND_TRICKS',
      frequency: 'multiple_daily',
      icon: <BulbOutlined />,
      color: '#722ed1',
      defaultTimes: ['10:00', '15:00', '21:00']
    },
    {
      id: 'water',
      title: 'Uống nước',
      description: 'Nhắc nhở uống nước thường xuyên',
      category: 'HEALTH_BENEFITS',
      frequency: 'hourly',
      icon: <HeartOutlined />,
      color: '#13c2c2'
    },
    {
      id: 'exercise',
      title: 'Tập thể dục',
      description: 'Nhắc nhở thực hiện bài tập thể dục',
      category: 'HEALTH_BENEFITS',
      frequency: 'daily',
      icon: <HeartOutlined />,
      color: '#f5222d',
      defaultTime: '06:30'
    }
  ];

  const steps = [
    {
      title: 'Chọn loại nhắc nhở',
      description: 'Chọn từ mẫu có sẵn hoặc tạo tùy chỉnh'
    },
    {
      title: 'Thiết lập nội dung',
      description: 'Nhập tiêu đề và mô tả nhắc nhở'
    },
    {
      title: 'Cài đặt thời gian',
      description: 'Thiết lập lịch trình và tần suất'
    },
    {
      title: 'Xác nhận và tạo',
      description: 'Kiểm tra và hoàn tất tạo nhắc nhở'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setReminderType('template');
    
    // Pre-fill form with template data
    form.setFieldsValue({
      title: template.title,
      description: template.description,
      category: template.category,
      frequency: template.frequency,
      ...(template.defaultTime && { time: moment(template.defaultTime, 'HH:mm') }),
      ...(template.defaultTimes && { times: template.defaultTimes.map(t => moment(t, 'HH:mm')) })
    });
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        // Validate type selection
        if (!reminderType) {
          message.error('Vui lòng chọn loại nhắc nhở');
          return;
        }
        if (reminderType === 'template' && !selectedTemplate) {
          message.error('Vui lòng chọn một mẫu nhắc nhở');
          return;
        }
      } else {
        // Validate current step fields
        const fieldsToValidate = getFieldsForStep(currentStep);
        await form.validateFields(fieldsToValidate);
      }
      
      // Update preview data
      if (currentStep === 2) {
        const values = await form.getFieldsValue();
        setPreviewData(values);
      }
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['title', 'description', 'category'];
      case 2:
        return ['frequency'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // Process form data
      const reminderData = {
        ...values,
        type: reminderType,
        templateId: selectedTemplate?.id,
        createdBy: currentUser?.user_id,
        enabled: true,
        // Process time fields
        ...(values.time && { scheduledTime: values.time.format('HH:mm') }),
        ...(values.times && { scheduledTimes: values.times.map(t => t.format('HH:mm')) }),
        ...(values.startDate && { startDate: values.startDate.format('YYYY-MM-DD') }),
        ...(values.endDate && { endDate: values.endDate.format('YYYY-MM-DD') }),
        ...(values.dateRange && { 
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD')
        })
      };
      
      const response = await createReminder(reminderData.description, reminderData.category);
      
      if (response.success) {
        message.success('Tạo nhắc nhở thành công!');
        navigate('/member/reminders');
      } else {
        message.error('Không thể tạo nhắc nhở. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      message.error('Đã có lỗi xảy ra khi tạo nhắc nhở');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HEALTH_BENEFITS': return <HeartOutlined />;
      case 'MOTIVATIONAL_QUOTES': return <TrophyOutlined />;
      case 'TIPS_AND_TRICKS': return <BulbOutlined />;
      case 'MILESTONE_CELEBRATIONS': return <TrophyOutlined />;
      case 'SMOKING_FACTS': return <NotificationOutlined />;
      default: return <BellOutlined />;
    }
  };

  const getCategoryName = (category) => {
    const names = {
      'HEALTH_BENEFITS': 'Lợi ích sức khỏe',
      'MOTIVATIONAL_QUOTES': 'Động lực',
      'TIPS_AND_TRICKS': 'Mẹo và thủ thuật',
      'MILESTONE_CELEBRATIONS': 'Kỷ niệm cột mốc',
      'SMOKING_FACTS': 'Thông tin về thuốc lá'
    };
    return names[category] || category;
  };

  const getFrequencyText = (frequency) => {
    const texts = {
      'once': 'Một lần',
      'daily': 'Hàng ngày',
      'weekly': 'Hàng tuần',
      'monthly': 'Hàng tháng',
      'multiple_daily': 'Nhiều lần trong ngày',
      'hourly': 'Mỗi giờ',
      'custom': 'Tùy chỉnh'
    };
    return texts[frequency] || frequency;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <Alert
              message="Chọn loại nhắc nhở"
              description="Bạn có thể chọn từ các mẫu có sẵn hoặc tạo nhắc nhở tùy chỉnh"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Radio.Group
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              style={{ width: '100%' }}
              className="mb-4"
            >
              <Radio value="template">Chọn từ mẫu có sẵn</Radio>
              <Radio value="custom">Tạo tùy chỉnh</Radio>
            </Radio.Group>
            
            {reminderType === 'template' && (
              <div>
                <Title level={4}>Mẫu nhắc nhở phổ biến</Title>
                <Row gutter={[16, 16]}>
                  {reminderTemplates.filter(t => t.popular).map(template => (
                    <Col xs={24} md={12} key={template.id}>
                      <Card
                        hoverable
                        className={selectedTemplate?.id === template.id ? 'selected-template' : ''}
                        onClick={() => handleTemplateSelect(template)}
                        style={{
                          border: selectedTemplate?.id === template.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                      >
                        <Space>
                          <Avatar 
                            style={{ backgroundColor: template.color }}
                            icon={template.icon}
                          />
                          <div>
                            <Text strong>{template.title}</Text>
                            <br />
                            <Text type="secondary">{template.description}</Text>
                            <br />
                            <Tag color={template.color} size="small">
                              {getFrequencyText(template.frequency)}
                            </Tag>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                <Divider />
                
                <Title level={4}>Tất cả mẫu nhắc nhở</Title>
                <Row gutter={[16, 16]}>
                  {reminderTemplates.map(template => (
                    <Col xs={24} md={8} key={template.id}>
                      <Card
                        size="small"
                        hoverable
                        className={selectedTemplate?.id === template.id ? 'selected-template' : ''}
                        onClick={() => handleTemplateSelect(template)}
                        style={{
                          border: selectedTemplate?.id === template.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                      >
                        <Space>
                          <Avatar 
                            size="small"
                            style={{ backgroundColor: template.color }}
                            icon={template.icon}
                          />
                          <Text>{template.title}</Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {reminderType === 'custom' && (
              <Alert
                message="Tạo nhắc nhở tùy chỉnh"
                description="Bạn sẽ thiết lập nội dung và lịch trình cho nhắc nhở của riêng mình"
                type="success"
                showIcon
              />
            )}
          </div>
        );
        
      case 1:
        return (
          <div>
            <Form.Item
              name="title"
              label="Tiêu đề nhắc nhở"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề' },
                { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
                { max: 100, message: 'Tiêu đề không được quá 100 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tiêu đề ngắn gọn và rõ ràng" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Mô tả chi tiết"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả chi tiết về nhắc nhở này"
                showCount
                maxLength={200}
              />
            </Form.Item>
            
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục phù hợp">
                {Object.values(REMINDER_CATEGORIES).map(category => (
                  <Option key={category} value={category}>
                    <Space>
                      {getCategoryIcon(category)}
                      {getCategoryName(category)}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              initialValue="medium"
            >
              <Radio.Group>
                <Radio value="low">
                  <Space>
                    <Tag color="green">Thấp</Tag>
                    <Text type="secondary">Nhắc nhở nhẹ nhàng</Text>
                  </Space>
                </Radio>
                <Radio value="medium">
                  <Space>
                    <Tag color="orange">Trung bình</Tag>
                    <Text type="secondary">Nhắc nhở bình thường</Text>
                  </Space>
                </Radio>
                <Radio value="high">
                  <Space>
                    <Tag color="red">Cao</Tag>
                    <Text type="secondary">Nhắc nhở quan trọng</Text>
                  </Space>
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        );
        
      case 2:
        return (
          <div>
            <FrequencyStepContent form={form} frequency={frequency} />
          </div>
        );
        
      case 3:
        return (
          <div>
            <Alert
              message="Xác nhận thông tin nhắc nhở"
              description="Vui lòng kiểm tra lại thông tin trước khi tạo nhắc nhở"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Card title="Thông tin nhắc nhở">
              <List>
                <List.Item>
                  <List.Item.Meta
                    title="Tiêu đề"
                    description={previewData.title || form.getFieldValue('title')}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Mô tả"
                    description={previewData.description || form.getFieldValue('description')}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Danh mục"
                    description={
                      <Space>
                        {getCategoryIcon(previewData.category || form.getFieldValue('category'))}
                        {getCategoryName(previewData.category || form.getFieldValue('category'))}
                      </Space>
                    }
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Tần suất"
                    description={getFrequencyText(previewData.frequency || form.getFieldValue('frequency'))}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Độ ưu tiên"
                    description={
                      <Tag color={
                        (previewData.priority || form.getFieldValue('priority')) === 'high' ? 'red' :
                        (previewData.priority || form.getFieldValue('priority')) === 'medium' ? 'orange' : 'green'
                      }>
                        {(previewData.priority || form.getFieldValue('priority')) === 'high' ? 'Cao' :
                         (previewData.priority || form.getFieldValue('priority')) === 'medium' ? 'Trung bình' : 'Thấp'}
                      </Tag>
                    }
                  />
                </List.Item>
                {selectedTemplate && (
                  <List.Item>
                    <List.Item.Meta
                      title="Mẫu được chọn"
                      description={selectedTemplate.title}
                    />
                  </List.Item>
                )}
              </List>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="reminder-creation">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <BellOutlined /> Tạo nhắc nhở mới
          </Title>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/member/reminders')}
          >
            Quay lại
          </Button>
        </div>

        <Card>
          <Steps current={currentStep} className="mb-4">
            {steps.map(item => (
              <Step key={item.title} title={item.title} description={item.description} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="steps-content mb-4">
              {renderStepContent(currentStep)}
            </div>

            <div className="steps-action">
              <Space>
                {currentStep > 0 && (
                  <Button onClick={prev}>
                    Quay lại
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={next}>
                    Tiếp theo
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    icon={<CheckCircleOutlined />}
                  >
                    Tạo nhắc nhở
                  </Button>
                )}
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ReminderCreation;