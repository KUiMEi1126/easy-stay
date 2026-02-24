import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, List, Tag, Spin } from 'antd'; // 引入 List, Tag
import { 
  ShopOutlined, 
  UserOutlined, 
  FileSearchOutlined, 
  TransactionOutlined,
  NotificationOutlined,
  SoundOutlined
} from '@ant-design/icons';
import request from '../utils/request';

const Dashboard = () => {
  // 获取当前用户角色
  const isAdmin = localStorage.getItem('currentUserIdentity') === 'admin';
  // 定义状态
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHotels: 0,
    pendingHotels: 0,
    merchantVisitors: 88, // 商户数据暂时模拟
    merchantOrders: 560   // 商户数据暂时模拟
  });

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // 管理员：获取真实酒店数据
          // 调用之前的获取列表接口
          const res = await request.get('/admin/hotels');
          // 前端计算
          const total = res.length;
          const pending = res.filter(h => h.status === 'pending').length;
          
          setStats(prev => ({ ...prev, totalHotels: total, pendingHotels: pending }));
        } else {
          // 商户：获取商户特定数据
          // 这里暂时保持模拟数据，或者你可以请求 /merchant/my-hotel 来获取一些真实信息
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // 定义不同角色的公告数据
  const adminNotices = [
    { title: '关于本周日即将进行的系统维护通知', type: 'urgent', date: '2023-11-10' },
    { title: '关于加强酒店资质审核的最新规定', type: 'normal', date: '2023-11-08' },
    { title: '待处理的投诉工单 (3)', type: 'warning', date: '2023-11-05' },
  ];

  const merchantNotices = [
    { title: '双十一大促活动报名即将截止', type: 'urgent', date: '2023-11-09' },
    { title: '如何提升酒店在首页的曝光率？', type: 'normal', date: '2023-11-07' },
    { title: '请及时更新房态信息以免造成超售', type: 'warning', date: '2023-11-01' },
  ];

   // 渲染公告列表的辅助函数
  const renderNoticeList = (data) => (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={item.type === 'urgent' ? <SoundOutlined style={{ color: 'red' }} /> : <NotificationOutlined style={{ color: '#1890ff' }} />}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.title}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>{item.date}</span>
                </div>
            }
            description={
                item.type === 'urgent' ? <Tag color="red">紧急</Tag> : 
                item.type === 'warning' ? <Tag color="orange">提醒</Tag> : <Tag color="blue">通知</Tag>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>
        早安，{localStorage.getItem('currentUserIdentity')} 
        <span style={{ fontSize: 14, color: '#999', marginLeft: 10 }}>
            ({isAdmin ? '管理员' : '酒店商户'})
        </span>
      </h2>
      
      {loading ? <Spin size="large" /> : (
        <>
          {/* === 顶部统计卡片 === */}
          <Row gutter={16}>
            <Col span={8}>
              <Card hoverable>
                <Statistic
                  title="当前日期"
                  value={new Date().toLocaleDateString()}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>

            {/* 根据角色渲染不同的统计 */}
            {isAdmin ? (
              <>
                <Col span={8}>
                  <Card hoverable>
                    <Statistic
                      title="待审核酒店"
                      value={stats.pendingHotels} // 真实数据
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<FileSearchOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card hoverable>
                    <Statistic
                      title="平台总酒店数"
                      value={stats.totalHotels} // 真实数据
                      prefix={<ShopOutlined />}
                    />
                  </Card>
                </Col>
              </>
            ) : (
              <>
                <Col span={8}>
                  <Card hoverable>
                    <Statistic
                      title="今日访客 (模拟)"
                      value={stats.merchantVisitors}
                      prefix={<UserOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card hoverable>
                    <Statistic
                      title="总订单量 (模拟)"
                      value={stats.merchantOrders}
                      prefix={<TransactionOutlined />}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {/* === 底部公告栏 (区分角色) === */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={16}>
               <Card title={isAdmin ? "管理中心公告" : "商户消息中心"} extra={<a href="#">查看更多</a>}>
                  {isAdmin ? renderNoticeList(adminNotices) : renderNoticeList(merchantNotices)}
               </Card>
            </Col>
            
            <Col span={8}>
                <Card title="快速入口">
                    {isAdmin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="/admin/hotels">审核新入驻酒店 &gt;</a>
                            <a href="/admin/settings">系统参数设置 &gt;</a>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="/admin/hotel-edit">发布新房型 &gt;</a>
                            <a href="/admin/my-hotel">查看经营数据 &gt;</a>
                        </div>
                    )}
                </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
export default Dashboard;