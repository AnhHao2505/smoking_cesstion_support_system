import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Row, Col, Form, Button, message, 
  Statistic, DatePicker, Progress, Tag, Alert, Select, 
  InputNumber, Empty
} from 'antd';
import {
  CalendarOutlined, LineChartOutlined, TrophyOutlined,
  CheckCircleOutlined, WarningOutlined, SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createDailyRecord,
  updateDailyRecord,
  getDailyRecordByDate,
  getRecentDailyRecords,
  getDailyRecordStatistics,
  getCurrentPhaseForRecord,
  validateDailyRecord
} from '../../services/dailyRecordService';

const { Title, Text } = Typography;
const { Option } = Select;

const DailyRecordView = () => {
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [existingRecord, setExistingRecord] = useState(null);

  const userId = currentUser?.userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        // Lấy dữ liệu độc lập cho daily record
        const [stats, phase, records] = await Promise.all([
          getDailyRecordStatistics(userId),
          getCurrentPhaseForRecord(userId),
          getRecentDailyRecords(userId, 7)
        ]);

        setStatistics(stats);
        setCurrentPhase(phase);
        setRecentRecords(records);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching daily record data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Lấy record cho ngày được chọn
  useEffect(() => {
    const fetchRecordForDate = async () => {
      if (!userId || !selectedDate) return;

      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        const record = await getDailyRecordByDate(userId, dateStr);
        setExistingRecord(record);
        
        if (record) {
          // Điền form với dữ liệu existing record
          form.setFieldsValue({
            date: selectedDate,
            cigarettesConsumed: record.cigarettesConsumed,
            morningCravingLevel: record.morningCravingLevel,
            eveningCravingLevel: record.eveningCravingLevel,
            noonEmotion: record.noonEmotion,
            // ... các field khác
          });
        } else {
          // Reset form cho record mới
          form.resetFields();
          form.setFieldValue('date', selectedDate);
        }
      } catch (error) {
        console.error('Error fetching record for date:', error);
        setExistingRecord(null);
      }
    };

    fetchRecordForDate();
  }, [selectedDate, userId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate using service function
      const validation = validateDailyRecord(values);
      if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
          message.error(validation.errors[field]);
        });
        return;
      }

      setLoading(true);

      const recordData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        phaseId: currentPhase?.phaseId,
        phaseName: currentPhase?.phaseName
      };

      let response;
      if (existingRecord) {
        response = await updateDailyRecord(existingRecord.id, recordData);
      } else {
        response = await createDailyRecord(recordData);
      }

      if (response.success) {
        message.success(existingRecord ? 'Cập nhật ghi chép thành công!' : 'Tạo ghi chép mới thành công!');
        
        // Refresh statistics
        const newStats = await getDailyRecordStatistics(userId);
        setStatistics(newStats);
        
        // Refresh recent records
        const newRecords = await getRecentDailyRecords(userId, 7);
        setRecentRecords(newRecords);
      }
    } catch (error) {
      console.error('Error saving daily record:', error);
      message.error('Có lỗi khi lưu ghi chép');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-record-view">
      <div className="container py-4">
        <Title level={2}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Nhật ký cá nhân
        </Title>

        {/* Simplified Statistics Cards - Focus on record keeping */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8} md={8}>
            <Card size="small">
              <Statistic
                title="Ghi chép gần đây"
                value={recentRecords?.length || 0}
                suffix="ngày"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8}>
            <Card size="small">
              <Statistic
                title="Giai đoạn"
                value={currentPhase?.phaseOrder || 0}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8}>
            <Card size="small">
              <Statistic
                title="Trạng thái"
                value={statistics?.smokeFreeStreak || 0}
                suffix="ngày"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Current Phase Info */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Card title="Thông tin giai đoạn hiện tại" size="small">
              <Text strong style={{ fontSize: 16 }}>
                {currentPhase?.phaseName || 'Chưa xác định giai đoạn'}
              </Text>
              <br />
              <Text type="secondary">
                Giai đoạn {currentPhase?.phaseOrder || 0} - 
                Hãy tiếp tục ghi chép để theo dõi tiến trình của bạn
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Date Selection and Form */}
        <Card title="Ghi chép chi tiết">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Chọn ngày:</Text>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  style={{ width: '100%', marginTop: 8 }}
                  disabledDate={(date) => date && date > moment().endOf('day')}
                />
                {existingRecord && (
                  <Alert
                    message="Đã có ghi chép cho ngày này"
                    type="info"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                {/* Form fields for daily record */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="cigarettesConsumed"
                      label="Số điếu thuốc đã hút"
                      rules={[{ required: true, message: 'Vui lòng nhập số điếu thuốc' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="morningCravingLevel"
                      label="Mức độ thèm thuốc buổi sáng"
                      rules={[{ required: true, message: 'Vui lòng chọn mức độ thèm thuốc' }]}
                    >
                      <Select>
                        <Option value="rất thấp">Rất thấp</Option>
                        <Option value="thấp">Thấp</Option>
                        <Option value="trung bình">Trung bình</Option>
                        <Option value="cao">Cao</Option>
                        <Option value="rất cao">Rất cao</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="eveningCravingLevel"
                      label="Mức độ thèm thuốc buổi tối"
                      rules={[{ required: true, message: 'Vui lòng chọn mức độ thèm thuốc' }]}
                    >
                      <Select>
                        <Option value="rất thấp">Rất thấp</Option>
                        <Option value="thấp">Thấp</Option>
                        <Option value="trung bình">Trung bình</Option>
                        <Option value="cao">Cao</Option>
                        <Option value="rất cao">Rất cao</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="noonEmotion"
                      label="Cảm xúc buổi trưa"
                      rules={[{ required: true, message: 'Vui lòng chọn cảm xúc' }]}
                    >
                      <Select>
                        <Option value="rất tốt">Rất tốt</Option>
                        <Option value="tốt">Tốt</Option>
                        <Option value="bình thường">Bình thường</Option>
                        <Option value="không tốt">Không tốt</Option>
                        <Option value="rất không tốt">Rất không tốt</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {existingRecord ? 'Cập nhật ghi chép' : 'Lưu ghi chép'}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>

        {/* Recent Records Summary */}
        <Card title="Ghi chép gần đây" style={{ marginTop: 16 }}>
          <Row gutter={[8, 8]}>
            {recentRecords.map((record, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={record.id || index}>
                <Card size="small" hoverable>
                  <Text strong>{moment(record.date).format('DD/MM')}</Text>
                  <br />
                  <Tag color={record.cigarettesConsumed === 0 ? 'green' : 'red'}>
                    {record.cigarettesConsumed} điếu
                  </Tag>
                  <br />
                  <Text type="secondary">
                    Thèm: {record.avgCravingLevel || 'N/A'}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
          
          {recentRecords.length === 0 && (
            <Empty description="Chưa có ghi chép nào" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default DailyRecordView;
