import React, { useState, useEffect } from 'react';import {   Row,   Col,   Card,   Statistic,   Progress,   Table,   Divider,   List,   Avatar,   Typography,  Badge} from 'antd';import {   UserOutlined,   CheckCircleOutlined,   ClockCircleOutlined,   DollarOutlined,  HeartOutlined,  TrophyOutlined,  RiseOutlined,  TeamOutlined} from '@ant-design/icons';import * as dashboardService from '../../services/dashboardService';const { Title, Paragraph, Text } = Typography;const Dashboard = () => {  const [statistics, setStatistics] = useState(null);  const [recentQuitters, setRecentQuitters] = useState([]);  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = () => {
      try {
        const statsData = dashboardService.getDashboardStatistics();
        const quittersData = dashboardService.getRecentSuccessfulQuitters();
        
        setStatistics(statsData);
        setRecentQuitters(quittersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Column configuration for the success rates by age table
  const successRateColumns = [
    {
      title: 'Age Group',
      dataIndex: 'ageGroup',
      key: 'ageGroup',
    },
    {
      title: 'Success Rate (%)',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate) => <Progress percent={rate} size="small" />
    },
  ];

  // Column configuration for the recent quitters table
  const recentQuittersColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quit Date',
      dataIndex: 'quitDate',
      key: 'quitDate',
    },
    {
      title: 'Cigarettes Avoided',
      dataIndex: 'cigarettesAvoided',
      key: 'cigarettesAvoided',
    },
    {
      title: 'Money Saved ($)',
      dataIndex: 'moneySaved',
      key: 'moneySaved',
    },
    {
      title: 'Badges',
      dataIndex: 'badgesEarned',
      key: 'badgesEarned',
      render: (badges) => (
        <>
          {badges.map((badge, index) => (
            <Badge key={index} count={badge} style={{ backgroundColor: '#52c41a', marginRight: '5px' }} />
          ))}
        </>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <div className="container my-5">
        <Title level={2} className="mb-4">Dashboard</Title>
        
        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Members"
                value={statistics.totalMembers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Successful Quits"
                value={statistics.successfulQuits}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ongoing Quitters"
                value={statistics.ongoingQuitters}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Average Quit Time (days)"
                value={statistics.averageQuitTime}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Health Improvements */}
        <Card className="mb-4">
          <Title level={4}>Health Improvements Reported</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Improved Breathing"
                value={statistics.healthImprovements.improvedBreathing}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
              <Progress percent={statistics.healthImprovements.improvedBreathing} status="active" />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Better Sleep"
                value={statistics.healthImprovements.betterSleep}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
              <Progress percent={statistics.healthImprovements.betterSleep} status="active" />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Reduced Cravings"
                value={statistics.healthImprovements.reducedCravings}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
              <Progress percent={statistics.healthImprovements.reducedCravings} status="active" />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Improved Taste"
                value={statistics.healthImprovements.improvedTaste}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
              <Progress percent={statistics.healthImprovements.improvedTaste} status="active" />
            </Col>
          </Row>
        </Card>
        
        <Row gutter={[16, 16]} className="mb-4">
          {/* Success Rate by Age */}
          <Col xs={24} md={12}>
            <Card>
              <Title level={4}>Success Rate by Age Group</Title>
              <Table 
                dataSource={statistics.successRateByAge} 
                columns={successRateColumns} 
                pagination={false}
                rowKey="ageGroup"
              />
            </Card>
          </Col>
          
          {/* Top Challenges */}
          <Col xs={24} md={12}>
            <Card>
              <Title level={4}>Top Challenges Reported</Title>
              <List
                itemLayout="horizontal"
                dataSource={statistics.topChallenges}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.challenge}
                      description={<Progress percent={item.percentage} />}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Recent Successful Quitters */}
        <Card className="mb-4">
          <Title level={4}>Recent Successful Quitters</Title>
          <Table 
            dataSource={recentQuitters} 
            columns={recentQuittersColumns} 
            rowKey="id"
          />
        </Card>
        
        {/* Success Stories */}
        <Card className="mb-4">
          <Title level={4}>Success Stories</Title>
          <List
            itemLayout="horizontal"
            dataSource={statistics.recentSuccessStories}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={<span>{item.name} <Text type="secondary">({item.quitDuration})</Text></span>}
                  description={item.story}
                />
              </List.Item>
            )}
          />
        </Card>
        
        {/* Badges Awarded */}
        <Card className="mb-4">
          <Title level={4}>Badges Awarded</Title>
          <Row gutter={[16, 16]}>
            {Object.entries(statistics.badgesAwarded).map(([badge, count]) => (
              <Col xs={24} sm={12} md={8} lg={6} key={badge}>
                <Card size="small">
                  <Statistic
                    title={badge}
                    value={count}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
        
        {/* Monthly Cessation Trend */}
        <Card>
          <Title level={4}>Monthly Cessation Trend</Title>
          <div style={{ height: '300px' }}>
            <Row gutter={[8, 8]}>
              {statistics.monthlyCessationTrend.map((item) => (
                <Col span={2} key={item.month}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: `${item.count * 3}px`, width: '20px', background: '#1890ff', marginBottom: '8px' }}></div>
                    <Text>{item.month}</Text>
                    <Text type="secondary">{item.count}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;