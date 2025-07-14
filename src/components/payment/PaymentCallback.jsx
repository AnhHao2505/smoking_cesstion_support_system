import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Card, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { handleVNPayReturn } from '../../services/paymentService';
import { upgradeToPremium } from '../../services/userService';
import * as authService from '../../services/authService';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        setLoading(true);
        
        // Get all query parameters from URL
        const params = {};
        for (let [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log('VNPay callback received with params:', params);

        // Handle VNPay return
        const result = await handleVNPayReturn(params);
        
        console.log('VNPay verification result:', result);
        
        if (result) {
          // Payment successful, upgrade user to premium
          try {
            console.log('Upgrading user to premium...');
            await upgradeToPremium();
            
            // Update user data in localStorage and context
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                isPremiumMembership: true,
                premiumMembership: true
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('User upgraded to premium successfully');
            }
            
            setPaymentResult({
              success: true,
              message: 'Thanh toán thành công! Tài khoản của bạn đã được nâng cấp lên Premium.',
              transactionId: result.transactionId || params.vnp_TxnRef,
              amount: result.amount || params.vnp_Amount
            });
            
            // Save result to localStorage for other tabs
            localStorage.setItem('vnpay_payment_result', JSON.stringify({
              success: true,
              message: 'Thanh toán thành công! Tài khoản của bạn đã được nâng cấp lên Premium.'
            }));
          } catch (upgradeError) {
            console.error('Error upgrading to premium:', upgradeError);
            setPaymentResult({
              success: true,
              message: 'Thanh toán thành công! Tuy nhiên có lỗi khi nâng cấp tài khoản. Vui lòng liên hệ hỗ trợ.',
              transactionId: result.transactionId || params.vnp_TxnRef,
              amount: result.amount || params.vnp_Amount,
              warning: true
            });
          }
        } else {
          setPaymentResult({
            success: false,
            message: result.message || 'Thanh toán thất bại. Vui lòng thử lại.',
            transactionId: params.vnp_TxnRef
          });
          
          // Save result to localStorage for other tabs
          localStorage.setItem('vnpay_payment_result', JSON.stringify({
            success: false,
            message: result.message || 'Thanh toán thất bại. Vui lòng thử lại.'
          }));
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setError(error.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán');
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
          transactionId: searchParams.get('vnp_TxnRef')
        });
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.size > 0) {
      processPaymentCallback();
    } else {
      setLoading(false);
      setError('Không tìm thấy thông tin thanh toán');
    }
  }, [searchParams]);

  const formatAmount = (amount) => {
    if (!amount) return '';
    
    // VNPay amount is in cents, so divide by 100
    const actualAmount = parseInt(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(actualAmount);
  };

  const handleGoToDashboard = () => {
    const user = authService.getCurrentUser();
    if (user) {
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } else {
      navigate('/');
    }
  };

  const handleGoToPremiumFeatures = () => {
    navigate('/member/premium-features');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', fontSize: '16px' }}>
          Đang xử lý kết quả thanh toán...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <Result
          status="error"
          title="Lỗi xử lý thanh toán"
          subTitle={error}
          extra={[
            <Button type="primary" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
            <Button onClick={() => window.history.back()}>
              Quay lại
            </Button>
          ]}
        />
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <Result
          status="warning"
          title="Không tìm thấy thông tin thanh toán"
          extra={[
            <Button type="primary" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <Result
          status={paymentResult.success ? 'success' : 'error'}
          icon={paymentResult.success ? 
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          }
          title={paymentResult.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          subTitle={paymentResult.message}
          extra={[
            paymentResult.success && (
              <Button
                type="primary"
                icon={<CrownOutlined />}
                onClick={handleGoToPremiumFeatures}
                key="premium"
              >
                Khám phá tính năng Premium
              </Button>
            ),
            <Button
              type={paymentResult.success ? 'default' : 'primary'}
              onClick={handleGoToDashboard}
              key="dashboard"
            >
              Về Dashboard
            </Button>,
            !paymentResult.success && (
              <Button
                onClick={() => navigate('/member/premium-upgrade')}
                key="retry"
              >
                Thử lại
              </Button>
            )
          ]}
        />

        {paymentResult.warning && (
          <Alert
            message="Cảnh báo"
            description="Thanh toán đã thành công nhưng có lỗi khi nâng cấp tài khoản. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp."
            type="warning"
            showIcon
            style={{ marginTop: '20px' }}
          />
        )}

        {(paymentResult.transactionId || paymentResult.amount) && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px' 
          }}>
            <h4>Thông tin giao dịch:</h4>
            {paymentResult.transactionId && (
              <p><strong>Mã giao dịch:</strong> {paymentResult.transactionId}</p>
            )}
            {paymentResult.amount && (
              <p><strong>Số tiền:</strong> {formatAmount(paymentResult.amount)}</p>
            )}
            <p><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentCallback;
