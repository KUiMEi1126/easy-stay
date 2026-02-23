import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { ShopOutlined, UserOutlined, FileSearchOutlined, TransactionOutlined } from '@ant-design/icons';

const Dashboard = () => {
  // 获取当前用户角色
  const isAdmin = localStorage.getItem('currentUserIdentity') === 'admin';

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>欢迎回来，{localStorage.getItem('lastLoginUsername') || '用户'}</h2>
      
      <Row gutter={16}>
        {/* === 通用卡片 === */}
        <Col span={8}>
          <Card>
            <Statistic
              title="当前日期"
              value={new Date().toLocaleDateString()}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        {/* === 管理员专属统计 === */}
        {isAdmin && (
          <>
            <Col span={8}>
              <Card>
                <Statistic
                  title="待审核酒店"
                  value={12} // 真实项目中这里应该是 API 请求回来的数据
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<FileSearchOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="平台总酒店数"
                  value={108}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
          </>
        )}

        {/* === 商户专属统计 === */}
        {!isAdmin && (
          <>
            <Col span={8}>
              <Card>
                <Statistic
                  title="今日访客"
                  value={88}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="总订单量"
                  value={560} // 模拟数据
                  prefix={<TransactionOutlined />}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* 放一张图表或者通告栏撑满下面 */}
      <Card style={{ marginTop: 24 }} title="系统公告">
        <p>1. 酒店管理系统 1.0 版本上线啦。</p>
        <p>2. 请各位商户及时完善酒店图片信息。</p>
        <p>3. 管理员审核时间为每日 9:00 - 18:00。</p>
      </Card>
    </div>
  );
};

export default Dashboard;