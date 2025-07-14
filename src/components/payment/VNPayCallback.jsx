import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Result } from 'antd';
import axios from 'axios';
import { handleVNPayReturn } from '../../services/paymentService';
import * as authService from '../../services/authService';

const VNPayCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Parse query params
  const getParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const params = {};
    for (let [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  };

  useEffect(() => {
    const processVNPayReturn = async () => {
      setLoading(true);
      try {
        const params = getParams();
        const response = await handleVNPayReturn(params);
        if (response) {
          // Cập nhật user premium
          const user = authService.getCurrentUser();
          localStorage.setItem('user', JSON.stringify({
            email: user.email,
            userId: user.userId,
            role: user.role,
            isPremiumMembership: true
          }));
          setResult({ status: 'success', message: response });
          setTimeout(() => navigate('/'), 2000); // Chờ 2s rồi chuyển trang
        } else {
          setResult({ status: 'error', message: 'Thanh toán thất bại!' });
        }
      } catch (err) {
        setResult({ status: 'error', message: 'Có lỗi xảy ra!' });
      } finally {
        setLoading(false);
      }
    };
    processVNPayReturn();
    // eslint-disable-next-line
  }, [location.search]);

  if (loading) return <Spin tip="Đang xác nhận thanh toán..." />;

  return (
    <Result
      status={result?.status}
      title={result?.message}
      extra={
        <a onClick={() => navigate('/')}>Quay về trang chủ</a>
      }
    />
  );
};

export default VNPayCallback;