import React, { useState } from 'react';
import { Form, Button, DatePicker, TimePicker, Space, message, Card } from 'antd';
import { createCoachSchedule } from '../../services/appointmentService';
import moment from 'moment';

const CreateCoachSchedule = () => {
    const [schedules, setSchedules] = useState([
        { date: null, startTime: null, endTime: null }
    ]);
    const [loading, setLoading] = useState(false);

    const addSchedule = () => {
        setSchedules([...schedules, { date: null, startTime: null, endTime: null }]);
    };

    const removeSchedule = (index) => {
        if (schedules.length === 1) return;
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    const validateSchedule = (schedule, index) => {
        if (!schedule.date || !schedule.startTime || !schedule.endTime) {
            message.error(`Lịch ${index + 1}: Vui lòng nhập đầy đủ thông tin!`);
            return false;
        }


        return true;
    };

    const handleSubmit = async () => {
        // Validate tất cả schedules
        for (let i = 0; i < schedules.length; i++) {
            if (!validateSchedule(schedules[i], i)) {
                return;
            }
        }

        try {
            setLoading(true);
            
            // Gửi từng schedule lên API theo format đúng
            for (const [index, schedule] of schedules.entries()) {
                const requestData = {
                    date: schedule.date.format('YYYY-MM-DD'),
                    startHour: schedule.startTime.hour(),
                    startMinute: schedule.startTime.minute(),
                    endHour: schedule.endTime.hour(),
                    endMinute: schedule.endTime.minute()
                };

                const response = await createCoachSchedule(requestData);
                
                if (response.success) {
                    message.success(`Tạo lịch ${index + 1} thành công!`);
                } else {
                    message.error(`Lịch ${index + 1}: ${response.message || 'Tạo lịch thất bại'}`);
                }
            }
            
            // Reset form sau khi thành công
            setSchedules([{ date: null, startTime: null, endTime: null }]);
            
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi tạo lịch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Tạo lịch làm việc cho Coach</h2>
            
            {schedules.map((schedule, index) => (
                <Card 
                    key={index} 
                    title={`Lịch ${index + 1}`}
                    style={{ marginBottom: '16px' }}
                    extra={
                        schedules.length > 1 && (
                            <Button 
                                danger 
                                size="small"
                                onClick={() => removeSchedule(index)}
                            >
                                Xóa
                            </Button>
                        )
                    }
                >
                    <Space size="large" wrap>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Ngày *
                            </label>
                            <DatePicker
                                value={schedule.date}
                                onChange={(date) => handleChange(index, 'date', date)}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                                disabledDate={(current) => current && current < moment().startOf('day')}
                                style={{ width: '150px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Giờ bắt đầu *
                            </label>
                            <TimePicker
                                value={schedule.startTime}
                                onChange={(time) => handleChange(index, 'startTime', time)}
                                format="HH:mm"
                                placeholder="Chọn giờ"
                                style={{ width: '120px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Giờ kết thúc *
                            </label>
                            <TimePicker
                                value={schedule.endTime}
                                onChange={(time) => handleChange(index, 'endTime', time)}
                                format="HH:mm"
                                placeholder="Chọn giờ"
                                style={{ width: '120px' }}
                            />
                        </div>
                    </Space>
                </Card>
            ))}

            <div style={{ marginBottom: '20px' }}>
                <Button 
                    type="dashed" 
                    onClick={addSchedule} 
                    style={{ width: '100%' }}
                    icon="+"
                >
                    Thêm lịch mới
                </Button>
            </div>

            <Button 
                type="primary" 
                onClick={handleSubmit} 
                loading={loading} 
                block
                size="large"
                style={{ height: '50px', fontSize: '16px' }}
            >
                Tạo tất cả lịch làm việc
            </Button>
        </div>
    );
};

export default CreateCoachSchedule;
