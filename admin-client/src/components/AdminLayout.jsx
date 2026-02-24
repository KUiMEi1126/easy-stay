import React from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  FormOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 获取用户信息
  const role = localStorage.getItem('currentUserIdentity');
  console.log('当前用户角色:', role);

  // 2. 退出登录逻辑
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 3. 定义菜单配置 (包含权限字段)
  // roles: 允许访问的角色数组。如果不写 roles，代表通用。
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台',
      roles: ['admin', 'merchant'] // 通用
    },
    {
      key: '/admin/hotels',
      icon: <ShopOutlined />,
      label: '酒店管理 (列表)',
      roles: ['admin'] // 仅管理员可见
    },
    {
      key: '/admin/my-hotel',
      icon: <ShopOutlined />,
      label: '我的酒店',
      roles: ['merchant'] // 仅商户可见
    },
    {
      key: '/admin/hotel-edit',
      icon: <FormOutlined />,
      label: '发布/编辑酒店',
      roles: ['merchant'] // 仅商户可见
    },
    // 增加一个设置页来填充菜单
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      roles: ['admin', 'merchant']
    },
  ];

  // 4. 根据当前角色过滤菜单
  const filteredItems = menuItems.filter(item => {
    if (!item.roles) return true; // 没有定义 roles 则所有人可见
    return item.roles.includes(role);
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px' }}>
          
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          // 点击菜单跳转
          onClick={({ key }) => navigate(key)}
          items={filteredItems} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>易宿酒店管理系统</div>
          <Dropdown
            menu={{
              items: [
                { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout }
              ]
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
              <span>{localStorage.getItem('lastLoginUsername') || '用户'} ({role === 'admin' ? '管理员' : '商户'})</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;