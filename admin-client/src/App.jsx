import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register.jsx'; // 新增注册页路由
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AdminLayout from './components/AdminLayout';
import HotelList from './pages/HotelList';
import HotelEdit from './pages/HotelEdit';


// 封装私有路由组件：未登录则跳登录页
const PrivateRoute = ({ children }) => {
  const isLogin = !!localStorage.getItem('token');
  return isLogin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>{/* 全页中文化 */}
      <BrowserRouter>
        <Routes>
          {/* 1. 登录/注册页 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

          {/* 2. 管理后台 (包含侧边栏的公共布局) */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* 默认跳转到酒店列表 */}
            <Route index element={<Navigate to="/admin/hotels" />} />
            
            {/* 酒店列表 (审核/下线) */}
            <Route path="hotels" element={<HotelList />} />
            
            {/* 酒店录入 (发布/修改) */}
            <Route path="hotel-edit" element={<HotelEdit />} />
          </Route>

          {/* 3. 默认重定向到登录 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;