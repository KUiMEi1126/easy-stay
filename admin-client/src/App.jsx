import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register.jsx'; // 新增注册页路由
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AdminLayout from './components/AdminLayout';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail'; 
import MerchantHotelView from './pages/MerchantHotelView';
import MerchantHotelEdit from './pages/MerchantHotelEdit';

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
            
            <Route path="hotels" element={<HotelList />} />
            <Route path="hotel/:id" element={<HotelDetail />} />
            {/* --- 新增：商户端路由 --- */}
    
            {/* 1. 查看我的酒店 */}
            <Route path="my-hotel" element={<MerchantHotelView />} />
            
            {/* 2. 编辑/录入酒店 (这里复用一个路由即可，新建和编辑都在这) */}
            <Route path="hotel-edit" element={<MerchantHotelEdit />} />
          </Route>

          {/* 3. 默认重定向到登录 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;