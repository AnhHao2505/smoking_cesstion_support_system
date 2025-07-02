import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Switch,
  Select,
  Button,
  Space,
  Row,
  Col,
  TimePicker,
  Checkbox,
  Divider,
  Alert,
  message,
  InputNumber,
  Radio,
  Tag
} from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  ClockCircleOutlined,
  SoundOutlined,
  PhoneOutlined,
  MailOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getReminderSettings,
  updateReminderSettings 
} from '../../services/reminderService';
import { getCurrentUser } from '../../services/authService';

const { Title, Text } = Typography;
const { Option } = Select;

const ReminderSettings = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        setCurrentUser(user);

        const response = await getReminderSettings(user.user_id);
        if (response.success) {
          const settingsData = response.data;
          setSettings(settingsData);
          
          // Pre-fill form with current settings
          form.setFieldsValue({
            ...settingsData,
            quietHours: settingsData.quietHours ? [
              moment(settingsData.quietHours.start, 'HH:mm'),
              moment(settingsData.quietHours.end, 'HH:mm')
            ] : undefined
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        message.error('Không thể tải cài đặt nhắc nhở');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const settingsData = {
        ...values,
        quietHours: values.quietHours ? {
          start: values.quietHours[0].format('HH:mm'),
          end: values.quietHours[1].format('HH:mm')
        } : null,
        userId: currentUser.user_id
      };

      const response = await updateReminderSettings(currentUser.user_id, settingsData);
      
      if (response.success) {
        setSettings(settingsData);
        message.success('Cập nhật cài đặt thành công');
      } else {
        message.error('Không thể cập nhật cài đặt');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="reminder-settings">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>
            <SettingOutlined /> Cài đặt nhắc nhở
          </Title>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/member/reminders')}
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                {/* General Settings */}
                <Card type="inner" title={<><BellOutlined /> Cài đặt chung</>} className="mb-4">
                  <Form.Item
                    name="enabled"
                    label="Bật nhắc nhở"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="defaultReminderTime"
                    label="Thời gian nhắc nhở mặc định"
                    initialValue={moment('09:00', 'HH:mm')}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="snoozeMinutes"
                    label="Thời gian báo lại (phút)"
                    initialValue={5}
                  >
                    <InputNumber min={1} max={60} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="maxSnoozeCount"
                    label="Số lần báo lại tối đa"
                    initialValue={3}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Card>

                {/* Notification Methods */}
                <Card type="inner" title={<><SoundOutlined /> Phương thức thông báo</>} className="mb-4">
                  <Form.Item
                    name="notificationMethods"
                    label="Chọn các phương thức thông báo"
                    initialValue={['push', 'sound']}
                  >
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row>
                        <Col span={24}>
                          <Checkbox value="push">
                            <Space>
                              <BellOutlined />
                              <span>Thông báo đẩy (Push notification)</span>
                            </Space>
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <Checkbox value="sound">
                            <Space>
                              <SoundOutlined />
                              <span>Âm thanh thông báo</span>
                            </Space>
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <Checkbox value="email">
                            <Space>
                              <MailOutlined />
                              <span>Email</span>
                            </Space>
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <Checkbox value="sms">
                            <Space>
                              <PhoneOutlined />
                              <span>SMS</span>
                            </Space>
                          </Checkbox>
                        </Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>

                  <Form.Item
                    name="soundType"
                    label="Loại âm thanh"
                    initialValue="default"
                  >
                    <Select>
                      <Option value="default">Mặc định</Option>
                      <Option value="gentle">Nhẹ nhàng</Option>
                      <Option value="energetic">Năng động</Option>
                      <Option value="meditation">Thiền định</Option>
                      <Option value="nature">Âm thanh thiên nhiên</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="vibration"
                    label="Rung"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Card>

                {/* Quiet Hours */}
                <Card type="inner" title={<><ClockCircleOutlined /> Giờ yên tĩnh</>} className="mb-4">
                  <Form.Item
                    name="enableQuietHours"
                    label="Bật giờ yên tĩnh"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="quietHours"
                    label="Khoảng thời gian yên tĩnh"
                    tooltip="Trong khoảng thời gian này, nhắc nhở sẽ được tắt hoặc giảm âm lượng"
                  >
                    <TimePicker.RangePicker 
                      format="HH:mm" 
                      placeholder={['Từ', 'Đến']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="quietHoursBehavior"
                    label="Hành vi trong giờ yên tĩnh"
                    initialValue="silent"
                  >
                    <Radio.Group>
                      <Radio value="silent">Tắt hoàn toàn</Radio>
                      <Radio value="vibration">Chỉ rung</Radio>
                      <Radio value="low_volume">Âm lượng thấp</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Card>

                {/* Category Settings */}
                <Card type="inner" title="Cài đặt theo danh mục" className="mb-4">
                  <Alert
                    message="Tùy chỉnh cài đặt cho từng loại nhắc nhở"
                    type="info"
                    className="mb-3"
                  />

                  <Form.Item
                    name="categorySettings"
                    label="Cài đặt ưu tiên"
                  >
                    <div>
                      {[
                        { key: 'HEALTH_BENEFITS', name: 'Lợi ích sức khỏe', color: 'green' },
                        { key: 'MOTIVATIONAL_QUOTES', name: 'Động lực', color: 'blue' },
                        { key: 'TIPS_AND_TRICKS', name: 'Mẹo và thủ thuật', color: 'orange' },
                        { key: 'MILESTONE_CELEBRATIONS', name: 'Kỷ niệm cột mốc', color: 'purple' },
                        { key: 'SMOKING_FACTS', name: 'Thông tin về thuốc lá', color: 'red' }
                      ].map(category => (
                        <Row key={category.key} align="middle" className="mb-2">
                          <Col span={8}>
                            <Tag color={category.color}>{category.name}</Tag>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={['categorySettings', category.key, 'enabled']}
                              valuePropName="checked"
                              initialValue={true}
                              style={{ margin: 0 }}
                            >
                              <Switch size="small" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={['categorySettings', category.key, 'priority']}
                              initialValue="medium"
                              style={{ margin: 0 }}
                            >
                              <Select size="small" style={{ width: '100%' }}>
                                <Option value="low">Thấp</Option>
                                <Option value="medium">Trung bình</Option>
                                <Option value="high">Cao</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </Form.Item>
                </Card>

                {/* Advanced Settings */}
                <Card type="inner" title="Cài đặt nâng cao" className="mb-4">
                  <Form.Item
                    name="adaptiveReminders"
                    label="Nhắc nhở thông minh"
                    tooltip="Hệ thống sẽ tự động điều chỉnh tần suất nhắc nhở dựa trên hành vi của bạn"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="contextAware"
                    label="Nhận biết ngữ cảnh"
                    tooltip="Điều chỉnh nhắc nhở dựa trên vị trí và hoạt động hiện tại"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="batchNotifications"
                    label="Gộp thông báo"
                    tooltip="Gộp nhiều nhắc nhở cùng lúc để tránh làm phiền"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="autoMarkComplete"
                    label="Tự động đánh dấu hoàn thành"
                    tooltip="Tự động đánh dấu hoàn thành sau khoảng thời gian nhất định"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>
                </Card>

                <div className="text-center">
                  <Space>
                    <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                      Lưu cài đặt
                    </Button>
                    <Button onClick={() => form.resetFields()}>
                      Đặt lại
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Hướng dẫn">
              <div className="help-content">
                <Title level={5}>💡 Mẹo sử dụng</Title>
                <ul>
                  <li>Bật "Giờ yên tĩnh" để tránh bị làm phiền vào ban đêm</li>
                  <li>Sử dụng "Nhắc nhở thông minh" để có trải nghiệm cá nhân hóa</li>
                  <li>Điều chỉnh độ ưu tiên cho từng loại nhắc nhở</li>
                  <li>Thử các loại âm thanh khác nhau để tìm ra phù hợp nhất</li>
                </ul>

                <Divider />

                <Title level={5}>🔔 Loại thông báo</Title>
                <ul>
                  <li><strong>Push:</strong> Thông báo trên màn hình</li>
                  <li><strong>Email:</strong> Gửi qua email (cho nhắc nhở quan trọng)</li>
                  <li><strong>SMS:</strong> Tin nhắn điện thoại (phí có thể phát sinh)</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ReminderSettings;