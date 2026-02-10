import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路由
  const [welcomeRole, setWelcomeRole] = useState('管理员'); // 控制“管理员/商户”
   // 从本地存储获取当前用户身份
  const currentUserIdentity = localStorage.getItem('currentUserIdentity') || 'merchant';

  // 根据身份确定默认选中的菜单项
  const defaultSelectedKey = currentUserIdentity === 'admin' 
    ? '/admin/hotels' 
    : '/admin/hotel-edit';
    
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 监听路由变化，切换欢迎语里的角色
  useEffect(() => {
    if (location.pathname === '/admin/hotels') {
      setWelcomeRole('管理员'); // HotelList 显示管理员
    } else if (location.pathname === '/admin/hotel-edit') {
      setWelcomeRole('商户'); // HotelEdit 显示商户
    }
  }, [location.pathname]);

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
        <Menu theme="dark" defaultSelectedKeys={[defaultSelectedKey]} mode="inline" items={items} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, textAlign: 'right', paddingRight: 20 }}>
          <span>欢迎您，{welcomeRole}</span>
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