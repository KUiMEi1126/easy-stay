import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, List as ListIcon, User } from 'lucide-react'; // 图标库

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: '首页', icon: <Home size={20}/>, path: '/' },
    { name: '列表', icon: <ListIcon size={20}/>, path: '/list' },
    { name: '我的', icon: <User size={20}/>, path: '/user' }
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, width: '100%', maxWidth: '500px',
      display: 'flex', justifyContent: 'space-around', padding: '10px 0',
      background: 'white', borderTop: '1px solid #eee'
    }}>
      {menuItems.map(item => (
        <div 
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{ 
            textAlign: 'center', 
            color: location.pathname === item.path ? '#0086F6' : '#666',
            fontSize: '12px'
          }}
        >
          {item.icon}
          <div>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default NavBar;