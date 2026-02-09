import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout'; // 稍后创建
import HotelList from './pages/HotelList'; // 稍后创建
import HotelEdit from './pages/HotelEdit'; // 稍后创建

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 登录页 */}
        <Route path="/login" element={<Login />} />

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
  );
}

export default App;