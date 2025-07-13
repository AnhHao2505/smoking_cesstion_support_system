import React, { useEffect, useState } from 'react';
import { Modal, Button, Result } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const PaymentStatusNotification = () => {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Listen for focus events when user returns to the tab
    const handleFocus = () => {
      // Check if there's a payment session in localStorage
      const paymentSession = localStorage.getItem('vnpay_payment_session');
      if (paymentSession) {
        const sessionData = JSON.parse(paymentSession);
        
        // Show notification asking user to check payment status
        setStatus('pending');
        setVisible(true);
        
        // Clear the session
        localStorage.removeItem('vnpay_payment_session');
      }
    };

    // Listen for storage events from callback page
    const handleStorageChange = (e) => {
      if (e.key === 'vnpay_payment_result') {
        const result = JSON.parse(e.newValue);
        setStatus(result.success ? 'success' : 'error');
        setVisible(true);
        
        // Clear the result
        localStorage.removeItem('vnpay_payment_result');
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCheckStatus = () => {
    // Redirect to a page where user can check their payment status
    window.location.href = '/payment/callback';
  };

  const handleClose = () => {
    setVisible(false);
    setStatus(null);
  };

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Thanh toán thành công!"
            subTitle="Tài khoản của bạn đã được nâng cấp lên Premium."
            extra={[
              <Button type="primary" onClick={handleClose} key="ok">
                Tuyệt vời!
              </Button>
            ]}
          />
        );
      
      case 'error':
        return (
          <Result
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Thanh toán thất bại"
            subTitle="Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
            extra={[
              <Button type="primary" onClick={handleClose} key="ok">
                Đóng
              </Button>
            ]}
          />
        );
      
      case 'pending':
      default:
        return (
          <Result
            icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            title="Kiểm tra trạng thái thanh toán"
            subTitle="Bạn vừa quay lại từ trang thanh toán VNPay. Vui lòng kiểm tra trạng thái thanh toán."
            extra={[
              <Button type="primary" onClick={handleCheckStatus} key="check">
                Kiểm tra ngay
              </Button>,
              <Button onClick={handleClose} key="later">
                Để sau
              </Button>
            ]}
          />
        );
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
    >
      {renderContent()}
    </Modal>
  );
};

export default PaymentStatusNotification;
