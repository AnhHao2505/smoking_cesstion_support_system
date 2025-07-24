import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Table, Tag, Button, Space, 
  Empty, Spin, Alert, Pagination, Tooltip, Row, Col
} from 'antd';
import {
  HistoryOutlined, CreditCardOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getMyTransactions } from '../../services/paymentService';

const { Title, Text } = Typography;

const TransactionHistory = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();

  const fetchTransactions = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await getMyTransactions(page, size);
      
      // Debug: log the API response
      console.log('API Response:', response);
      console.log('Transactions:', response.content);
      
      setTransactions(response.content || []);
      setPagination({
        current: page,
        pageSize: size,
        total: response.totalElements || 0
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTableChange = (pagination) => {
    fetchTransactions(pagination.current, pagination.pageSize);
  };

  const getStatusTag = (status) => {
    // Debug: log the actual status value
    console.log('Transaction status:', JSON.stringify(status), 'Type:', typeof status);
    
    // Normalize the status by trimming whitespace and converting to uppercase
    const normalizedStatus = status ? status.toString().trim().toUpperCase() : '';
    
    const statusConfig = {
      'SUCCESS': { color: 'green', icon: <CheckCircleOutlined />, text: 'Thành công' },
      'PENDING': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
      'EXPIRED': { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã quá hạn' }
    };
    
    const config = statusConfig[normalizedStatus] || statusConfig['PENDING'];
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getPaymentGatewayTag = (gateway) => {
    const gatewayConfig = {
      'VNPAY': { color: 'blue', text: 'VNPay' },
      'MOMO': { color: 'purple', text: 'MoMo' },
      'ZALOPAY': { color: 'cyan', text: 'ZaloPay' }
    };
    
    const config = gatewayConfig[gateway] || { color: 'default', text: gateway };
    
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Ngày giao dịch',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Tooltip title={moment(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
        </Tooltip>
      ),
      sorter: true,
      defaultSortOrder: 'descend',
      width: 120
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatAmount(amount)}
        </Text>
      ),
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 120
    },
    {
      title: 'Cổng thanh toán',
      dataIndex: 'paymentGateway',
      key: 'paymentGateway',
      render: (gateway) => getPaymentGatewayTag(gateway),
      width: 130
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'time',
      render: (date) => moment(date).format('HH:mm'),
      width: 80
    }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>
          Đang tải lịch sử giao dịch...
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            {/* <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/member/account-management')}
            >
              Quay lại
            </Button> */}
            <Title level={2} style={{ margin: 0 }}>
              <HistoryOutlined style={{ marginRight: 8 }} />
              Lịch sử giao dịch
            </Title>
          </Space>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchTransactions(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      <Card 
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {transactions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Bạn chưa có giao dịch nào
                <br />
                <Text type="secondary">
                  Các giao dịch thanh toán sẽ được hiển thị tại đây
                </Text>
              </span>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={transactions}
              pagination={false}
              loading={loading}
              rowKey={(record, index) => record.id || index}
              size="middle"
              style={{ marginBottom: 16 }}
              scroll={{ x: 'max-content' }}
            />
            
            {pagination.total > pagination.pageSize && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page, size) => handleTableChange({ current: page, pageSize: size })}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} giao dịch`
                  }
                  pageSizeOptions={['10', '20', '50']}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Alert
        style={{ marginTop: 16 }}
        message="Thông tin"
        description="Lịch sử giao dịch hiển thị tất cả các giao dịch thanh toán của bạn. Nếu có vấn đề về giao dịch, vui lòng liên hệ hỗ trợ."
        type="info"
        showIcon
        closable
      />
    </div>
  );
};

export default TransactionHistory;
