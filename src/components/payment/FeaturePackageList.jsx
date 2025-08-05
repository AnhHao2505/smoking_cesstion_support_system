
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
    <div style={{ padding: 5, minHeight: '80vh', background: 'linear-gradient(135deg, #f8fbff 0%, #f6faff 100%)' }}>
      <Title level={2} style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>Các gói thành viên</Title>
      <Row gutter={[40, 40]} justify="center" align="stretch">
        {allPackages.length === 0 && (
          <Col span={24}>
            <Alert message="Không có gói thành viên nào khả dụng." type="info" showIcon />
          </Col>
        )}
        {allPackages.map((pkg, idx) => {
          const isInactive = pkg.active === false;
          return (
            <Col xs={24} sm={16} md={10} lg={8} xl={6} key={pkg.id || idx} style={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                title={
                  <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>
                    {pkg.packageName} <Tag style={{ fontSize: 13, fontWeight: 500 }} color={pkg.level === 'FREE' ? 'blue' : (pkg.level === 'PREMIUM' ? 'gold' : 'blue')}>{pkg.level === 'FREE' ? 'FREE' : pkg.level}</Tag>
                  </span>
                }
                bordered
                style={{
                  minHeight: 420,
                  width: '100%',
                  maxWidth: 400,
                  background: pkg.level === 'FREE' ? '#f6faff' : isInactive ? '#f8f8f8' : '#fffbe7',
                  borderColor: pkg.level === 'FREE' ? '#b3d8fd' : isInactive ? '#e0e0e0' : '#ffe58f',
                  opacity: isInactive ? 0.7 : 1,
                  filter: isInactive ? 'grayscale(0.2)' : undefined,
                  pointerEvents: isInactive ? 'auto' : undefined,
                  boxShadow: isInactive ? 'none' : '0 4px 24px 0 rgba(24, 144, 255, 0.08)',
                  borderRadius: 18,
                  transition: 'box-shadow 0.2s',
                  margin: '0 auto',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '24px 24px 18px 24px' }}
                extra={pkg.level === 'FREE' ? <Tag color="green" style={{ fontWeight: 500 }}>Mặc định</Tag> : (pkg.active ? <Tag color="green" style={{ fontWeight: 500 }}>Đang mở bán</Tag> : <Tag color="red" style={{ fontWeight: 500 }}>Chưa mở bán</Tag>)}
                hoverable
              >
                <div style={{ marginBottom: 18, width: '100%' }}>
                  <Text strong style={{ fontSize: 16 }}>Giá:&nbsp;</Text>
                  <Text type="danger" style={{ fontSize: 22, fontWeight: 700 }}>
                    {pkg.level === 'FREE' ? '0 VNĐ' : pkg.price.toLocaleString('vi-VN') + ' VNĐ'}
                  </Text>
                </div>
                <div style={{ marginBottom: 14, width: '100%' }}>
                  <Text strong style={{ fontSize: 16 }}>Thời hạn:&nbsp;</Text>
                  <Text style={{ fontSize: 16 }}>{pkg.level === 'FREE' ? 'Không giới hạn' : `${pkg.durationInUnit} ${pkg.unitOfDuration === 'DAY' ? 'ngày' : pkg.unitOfDuration === 'WEEK' ? 'tuần' : pkg.unitOfDuration === 'MONTH' ? 'tháng' : 'năm'}`}</Text>
                </div>
                <div style={{ marginBottom: 14, width: '100%' }}>
                  <Text strong style={{ fontSize: 16 }}>Tính năng:</Text>
                  <List
                    size="small"
                    dataSource={pkg.feature || []}
                    renderItem={item => <List.Item style={{ border: 'none', padding: '2px 0', fontSize: 15, color: '#333' }}>- {item}</List.Item>}
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', color: pkg.level === 'FREE' ? '#888' : isInactive ? '#aaa' : '#d48806', fontSize: 15 }}>
                  {pkg.level === 'FREE' ? (
                    <span>Đây là gói <b>mặc định</b> cho tất cả thành viên.</span>
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
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                        borderColor: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 12px rgba(255, 215, 0, 0.18)',
                        borderRadius: 8,
                        padding: '10px 32px',
                        fontSize: 18,
                        marginTop: 4,
                        transition: 'all 0.2s',
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
