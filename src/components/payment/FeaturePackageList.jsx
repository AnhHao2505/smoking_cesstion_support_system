
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, List, Spin, Alert, Button, message, Modal } from 'antd';
import packageService from '../../services/packageService';
import { createVNPayPayment } from '../../services/paymentService';

const { Title, Text } = Typography;

const FeaturePackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await packageService.getAll();
        setPackages(res.data || []);
      } catch (err) {
        setError('Không thể tải danh sách gói thành viên.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Handle payment for a package
  const handlePayment = async (pkg) => {
    try {
      const response = await createVNPayPayment(pkg.price, 'vn', pkg.id);
      if (!response || !response.data) {
        throw new Error('Không nhận được URL thanh toán từ server');
      }
      const paymentUrl = response.data;
      if (!paymentUrl.includes('vnpay') && !paymentUrl.includes('sandbox.vnpayment.vn')) {
        throw new Error('URL thanh toán không hợp lệ');
      }
      // Save payment session to localStorage for tracking
      localStorage.setItem(
        'vnpay_payment_session',
        JSON.stringify({
          amount: pkg.price,
          packageId: pkg.id,
          timestamp: Date.now(),
        })
      );
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      message.success('Đang chuyển hướng đến trang thanh toán VNPay...');
    } catch (error) {
      Modal.error({
        title: 'Lỗi thanh toán',
        content: error.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.',
      });
    }
  };

  if (loading) return <Spin tip="Đang tải các gói thành viên..." style={{ width: '100%' }} />;
  if (error) return <Alert type="error" message={error} showIcon />;

  // Find the basic/free package
  const basicPackage = packages.find(pkg => {
    const name = (pkg.packageName || '').toLowerCase();
    return (
      pkg.level === 'FREE' ||
      pkg.price === 0 ||
      name.includes('cơ bản') ||
      name.includes('free')
    );
  });

  // Paid/upgrade packages
  const paidPackages = packages.filter(pkg => {
    const name = (pkg.packageName || '').toLowerCase();
    return !(
      pkg.level === 'FREE' ||
      pkg.price === 0 ||
      name.includes('cơ bản') ||
      name.includes('free')
    );
  });

  // Combine all packages for even column layout
  const allPackages = [];
  if (basicPackage) {
    allPackages.push(basicPackage);
  }
  paidPackages.forEach(pkg => allPackages.push(pkg));

  // Responsive column count: 1 on xs, 2 on sm, 3 on md, 4 on lg+
  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>Các gói thành viên</Title>
      <Row gutter={[32, 32]} justify="center" align="stretch">
        {allPackages.length === 0 && (
          <Col span={24}>
            <Alert message="Không có gói thành viên nào khả dụng." type="info" showIcon />
          </Col>
        )}
        {allPackages.map((pkg, idx) => {
          const isInactive = pkg.active === false;
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={pkg.id || idx} style={{ display: 'flex' }}>
              <Card
                title={
                  <span>
                    {pkg.packageName} <Tag color={pkg.level === 'FREE' ? 'blue' : (pkg.level === 'PREMIUM' ? 'gold' : 'blue')}>{pkg.level === 'FREE' ? 'FREE' : pkg.level}</Tag>
                  </span>
                }
                bordered
                style={{
                  minHeight: pkg.level === 'FREE' ? undefined : 340,
                  height: pkg.level === 'FREE' ? 'auto' : undefined,
                  width: '100%',
                  background: pkg.level === 'FREE' ? '#f6faff' : isInactive ? '#f8f8f8' : undefined,
                  borderColor: pkg.level === 'FREE' ? '#b3d8fd' : isInactive ? '#e0e0e0' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isInactive ? 0.6 : 1,
                  filter: isInactive ? 'grayscale(0.2)' : undefined,
                  pointerEvents: isInactive ? 'auto' : undefined,
                  boxShadow: isInactive ? 'none' : undefined,
                }}
                bodyStyle={pkg.level === 'FREE' ? { paddingTop: 8, paddingBottom: 16 } : undefined}
                extra={pkg.level === 'FREE' ? <Tag color="green">Mặc định</Tag> : (pkg.active ? <Tag color="green">Đang mở bán</Tag> : <Tag color="red">Chưa mở bán</Tag>)}
              >
                <div style={{ marginBottom: 12, width: '100%' }}>
                  <Text strong>Giá: </Text>
                  <Text type="danger" style={{ fontSize: 18 }}>
                    {pkg.level === 'FREE' ? '0 VNĐ' : pkg.price.toLocaleString('vi-VN') + ' VNĐ'}
                  </Text>
                </div>
                <div style={{ marginBottom: 8, width: '100%' }}>
                  <Text strong>Thời hạn: </Text>
                  <Text>{pkg.level === 'FREE' ? 'Không giới hạn' : `${pkg.durationInUnit} ${pkg.unitOfDuration === 'DAY' ? 'ngày' : pkg.unitOfDuration === 'WEEK' ? 'tuần' : pkg.unitOfDuration === 'MONTH' ? 'tháng' : 'năm'}`}</Text>
                </div>
                <div style={{ marginBottom: 8, width: '100%' }}>
                  <Text strong>Tính năng:</Text>
                  <List
                    size="small"
                    dataSource={pkg.feature || []}
                    renderItem={item => <List.Item>- {item}</List.Item>}
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div style={{ marginTop: 16, textAlign: 'center', color: pkg.level === 'FREE' ? '#888' : isInactive ? '#aaa' : undefined }}>
                  {pkg.level === 'FREE' ? (
                    <span>Đây là gói mặc định cho tất cả thành viên.</span>
                  ) : isInactive ? (
                    <span style={{ fontStyle: 'italic', fontWeight: 500 }}>
                      Gói này hiện chưa mở bán. Vui lòng quay lại sau!
                    </span>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      disabled={!pkg.active}
                      onClick={() => handlePayment(pkg)}
                      style={{
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        borderColor: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                      }}
                    >
                      Mua ngay
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default FeaturePackageList;
