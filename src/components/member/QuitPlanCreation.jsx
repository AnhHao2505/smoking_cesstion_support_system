import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  Radio, 
  Card, 
  Row, 
  Col, 
  Steps, 
  Divider, 
  message, 
  Avatar, 
  Space, 
  Rate, 
  Tag,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  SolutionOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import * as quitPlanService from '../../services/quitPlanService';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/authService';
import locale from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

moment.locale('vi');

const QuitPlanCreation = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [coaches, setCoaches] = useState([]);
  const [defaultPhases, setDefaultPhases] = useState([]);
  const [circumstances, setCircumstances] = useState([]);
  const [suggestedStrategies, setSuggestedStrategies] = useState([]);
  const [suggestedMedications, setSuggestedMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const coachesData = quitPlanService.getAvailableCoaches();
        const phasesData = quitPlanService.getDefaultQuitPhases();
        const circumstancesData = quitPlanService.getSmokingCircumstances();
        const strategiesData = quitPlanService.getSuggestedStrategies();
        const medicationsData = quitPlanService.getSuggestedMedications();

        setCoaches(coachesData);
        setDefaultPhases(phasesData);
        setCircumstances(circumstancesData);
        setSuggestedStrategies(strategiesData);
        setSuggestedMedications(medicationsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data for quit plan creation:", error);
        message.error("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCoachChange = (coachId) => {
    const coach = coaches.find(c => c.coach_id === coachId);
    setSelectedCoach(coach);
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <div className="step-content">
          <Paragraph>
            Hãy cung cấp thông tin cơ bản về kế hoạch cai thuốc của bạn.
          </Paragraph>
          
          <Form.Item 
            name="start_date" 
            label="Ngày bắt đầu cai thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker 
              locale={locale}
              format="DD/MM/YYYY" 
              disabledDate={(current) => current && current < moment().startOf('day')} 
              placeholder="Chọn ngày"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item 
            name="circumstance_id" 
            label="Hoàn cảnh hút thuốc chính"
            rules={[{ required: true, message: 'Vui lòng chọn hoàn cảnh' }]}
          >
            <Select placeholder="Chọn hoàn cảnh hút thuốc phổ biến nhất">
              {circumstances.map(item => (
                <Option key={item.id} value={item.id}>{item.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="cigarettes_per_day" 
            label="Số điếu thuốc mỗi ngày"
            rules={[{ required: true, message: 'Vui lòng nhập số điếu thuốc' }]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>
          
          <Form.Item 
            name="quit_reason" 
            label="Lý do bạn muốn cai thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập lý do cai thuốc' }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do bạn muốn cai thuốc..." />
          </Form.Item>
          
          <Form.Item 
            name="previous_attempts" 
            label="Số lần đã cố gắng cai thuốc trước đây"
            initialValue={0}
          >
            <Input type="number" min={0} max={20} />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Chọn chuyên gia',
      content: (
        <div className="step-content">
          <Paragraph>
            Chọn một chuyên gia sẽ đồng hành cùng bạn trong hành trình cai thuốc lá.
          </Paragraph>
          
          <Form.Item 
            name="coach_id" 
            label="Chuyên gia hỗ trợ"
            rules={[{ required: true, message: 'Vui lòng chọn một chuyên gia' }]}
          >
            <Select 
              placeholder="Chọn chuyên gia" 
              onChange={handleCoachChange}
              optionLabelProp="label"
            >
              {coaches.map(coach => (
                <Option 
                  key={coach.coach_id} 
                  value={coach.coach_id}
                  label={coach.full_name}
                >
                  <div className="coach-option">
                    <Avatar src={coach.photo_url} icon={<UserOutlined />} />
                    <span className="coach-name">{coach.full_name}</span>
                    <Rate disabled defaultValue={coach.rating} allowHalf style={{ fontSize: '12px' }} />
                    <Tag color="blue">{coach.specialty}</Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {selectedCoach && (
            <Card className="selected-coach-card">
              <div className="coach-info">
                <Avatar size={64} src={selectedCoach.photo_url} icon={<UserOutlined />} />
                <div className="coach-details">
                  <Title level={4}>{selectedCoach.full_name}</Title>
                  <Space>
                    <Rate disabled defaultValue={selectedCoach.rating} allowHalf />
                    <Text>{selectedCoach.rating}/5</Text>
                  </Space>
                  <Tag color="blue">{selectedCoach.specialty}</Tag>
                  <Paragraph>{selectedCoach.bio}</Paragraph>
                  <Text type="secondary">Chuyên môn: {selectedCoach.qualification}</Text>
                </div>
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      title: 'Chiến lược & Thuốc',
      content: (
        <div className="step-content">
          <Paragraph>
            Chọn các chiến lược và thuốc bạn muốn sử dụng trong quá trình cai thuốc.
          </Paragraph>
          
          <Form.Item 
            name="strategies" 
            label="Chiến lược cai thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một chiến lược' }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[16, 8]}>
                {suggestedStrategies.map((strategy, index) => (
                  <Col span={12} key={index}>
                    <Checkbox value={strategy}>{strategy}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item 
            name="other_strategies" 
            label="Chiến lược khác"
          >
            <TextArea rows={2} placeholder="Nhập các chiến lược khác nếu có..." />
          </Form.Item>
          
          <Form.Item 
            name="use_medication" 
            label="Bạn có muốn sử dụng thuốc hỗ trợ cai thuốc không?"
            initialValue="no"
          >
            <Radio.Group>
              <Radio value="yes">Có</Radio>
              <Radio value="no">Không</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => prevValues.use_medication !== currentValues.use_medication}
          >
            {({ getFieldValue }) => 
              getFieldValue('use_medication') === 'yes' ? (
                <Form.Item 
                  name="medications" 
                  label="Thuốc hỗ trợ"
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Row gutter={[16, 8]}>
                      {suggestedMedications.map((medication, index) => (
                        <Col span={12} key={index}>
                          <Checkbox value={medication}>{medication}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              ) : null
            }
          </Form.Item>
          
          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => prevValues.use_medication !== currentValues.use_medication}
          >
            {({ getFieldValue }) => 
              getFieldValue('use_medication') === 'yes' ? (
                <Form.Item 
                  name="medication_instructions" 
                  label="Hướng dẫn sử dụng thuốc"
                >
                  <TextArea rows={3} placeholder="Nhập hướng dẫn sử dụng thuốc nếu có..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Kế hoạch chi tiết',
      content: (
        <div className="step-content">
          <Paragraph>
            Thiết lập các bước chuẩn bị và thời gian cho kế hoạch cai thuốc của bạn.
          </Paragraph>
          
          <Form.Item 
            name="preparation_steps" 
            label="Các bước chuẩn bị"
            rules={[{ required: true, message: 'Vui lòng nhập các bước chuẩn bị' }]}
          >
            <TextArea rows={4} placeholder="Nhập các bước chuẩn bị cho quá trình cai thuốc..." />
          </Form.Item>
          
          <Form.Item 
            name="end_date" 
            label="Ngày dự kiến hoàn thành"
            rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến hoàn thành' }]}
          >
            <DatePicker 
              locale={locale}
              format="DD/MM/YYYY" 
              disabledDate={(current) => {
                const startDate = form.getFieldValue('start_date');
                return current && (current < moment().startOf('day') || 
                  (startDate && current < moment(startDate).add(30, 'days')));
              }} 
              placeholder="Chọn ngày"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Divider>Các giai đoạn cai thuốc</Divider>
          
          <div className="phases-preview">
            <Steps direction="vertical" current={0}>
              {defaultPhases.map((phase, index) => (
                <Step 
                  key={index}
                  title={phase.phase_name}
                  description={phase.objective}
                />
              ))}
            </Steps>
          </div>
          
          <Form.Item 
            name="note" 
            label="Ghi chú bổ sung"
          >
            <TextArea rows={3} placeholder="Nhập ghi chú bổ sung nếu có..." />
          </Form.Item>
        </div>
      )
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // Process the form values to match the API format
      const strategies = [...(values.strategies || [])];
      if (values.other_strategies) {
        strategies.push(values.other_strategies);
      }
      
      const medications = values.use_medication === 'yes' ? values.medications || [] : [];
      
      // Get current user ID from auth context
      const userId = currentUser?.userId || getCurrentUser()?.userId;
      if (!userId) {
        message.error('Please log in to create a quit plan');
        setSubmitting(false);
        return;
      }
      
      const quitPlanData = {
        user_id: userId,
        coach_id: values.coach_id,
        circumstance_id: values.circumstance_id,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
        strategies_to_use: strategies.join(', '),
        medications_to_use: medications.join(', '),
        medication_instructions: values.medication_instructions || '',
        preparation_steps: values.preparation_steps,
        note: values.note || '',
        status: true,
        quit_phases: defaultPhases.map((phase, index) => ({
          ...phase,
          start_date: moment(values.start_date).add(index * 15, 'days').format('YYYY-MM-DD'),
          is_completed: false
        }))
      };
      
      // Submit the data
      const response = await quitPlanService.createQuitPlan(quitPlanData);
      
      if (response.success) {
        message.success(response.message);
        // Redirect to dashboard or the newly created quit plan
        navigate('/member/dashboard');
      } else {
        message.error(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra khi tạo kế hoạch cai thuốc. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
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
    <Layout className="quit-plan-creation">
      <div className="container py-4">
        <Card className="form-card">
          <Title level={2} className="text-center mb-4">Tạo kế hoạch cai thuốc</Title>
          
          <Steps current={currentStep} className="mb-4">
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            initialValues={{
              use_medication: 'no',
              previous_attempts: 0
            }}
          >
            <div className="steps-content">
              {steps[currentStep].content}
            </div>
            
            <div className="steps-action mt-4">
              {currentStep > 0 && (
                <Button 
                  style={{ marginRight: 8 }} 
                  onClick={prev}
                  disabled={submitting}
                >
                  Quay lại
                </Button>
              )}
              
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={next} disabled={submitting}>
                  Tiếp theo
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={submitting}
                  icon={<CheckCircleOutlined />}
                >
                  Tạo kế hoạch
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default QuitPlanCreation;