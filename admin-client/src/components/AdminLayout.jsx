import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 侧边栏菜单项
  const items = [
    {
      key: '/admin/hotels',
      icon: <ShopOutlined />,
      label: '酒店管理 (列表/审核)',
    },
    {
      key: '/admin/hotel-edit',
      icon: <UserOutlined />,
      label: '发布新酒店',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      navigate('/login');
    } else {
      navigate(e.key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign:'center', color:'white', lineHeight:'32px' }}>
          酒店管理系统
        </div>
        <Menu theme="dark" defaultSelectedKeys={['/admin/hotels']} mode="inline" items={items} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, textAlign: 'right', paddingRight: 20 }}>
          <span>欢迎您，管理员</span>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            {/* Outlet 就是你的子页面显示的地方 */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;