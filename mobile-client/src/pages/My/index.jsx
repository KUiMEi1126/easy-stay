import React from 'react';
import { User, Heart, Clock, Settings, HelpCircle, LogOut, ChevronRight, Star, MapPin, CreditCard } from 'lucide-react';

const My = () => {
  // 这里可以根据登录状态展示用户信息、订单等
  const userName = localStorage.getItem('userName') || '游客';
  
  const menuItems = [
    {
      icon: <Clock size={20} />,
      title: '我的订单',
      desc: '查看预订记录',
      color: '#667eea',
      bgColor: '#f0f3ff'
    },
    {
      icon: <Heart size={20} />,
      title: '我的收藏',
      desc: '收藏的酒店',
      color: '#ff6b9d',
      bgColor: '#fff0f6'
    },
    {
      icon: <Star size={20} />,
      title: '我的评价',
      desc: '已评价的酒店',
      color: '#ffa940',
      bgColor: '#fff7e6'
    },
    {
      icon: <CreditCard size={20} />,
      title: '优惠券',
      desc: '我的优惠券',
      color: '#52c41a',
      bgColor: '#f6ffed'
    }
  ];

  const settingsItems = [
    {
      icon: <Settings size={20} />,
      title: '设置',
      color: '#8c8c8c'
    },
    {
      icon: <HelpCircle size={20} />,
      title: '帮助中心',
      color: '#8c8c8c'
    },
    {
      icon: <LogOut size={20} />,
      title: '退出登录',
      color: '#ff4d4f'
    }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* 用户信息卡片 */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: 20, 
          padding: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: 70, 
              height: 70, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ marginLeft: 16, flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>{userName}</div>
              <div style={{ fontSize: 13, color: '#999', marginTop: 4, display: 'flex', alignItems: 'center' }}>
                <MapPin size={14} />
                <span style={{ marginLeft: 4 }}>普通会员</span>
              </div>
            </div>
            <ChevronRight size={24} color="#ccc" />
          </div>

          {/* 统计信息 */}
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            marginTop: 24, 
            paddingTop: 20, 
            borderTop: '2px solid #f5f5f5' 
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>0</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>待付款</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }}></div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>0</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>待入住</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }}></div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>0</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>已完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: 16,
          padding: '12px 0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {menuItems.map((item, index) => (
            <div key={index}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12,
                  background: item.bgColor,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <div style={{ marginLeft: 14, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.desc}</div>
                </div>
                <ChevronRight size={20} color="#ccc" />
              </div>
              {index < menuItems.length - 1 && (
                <div style={{ height: 1, background: '#f5f5f5', marginLeft: 74 }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 设置菜单 */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: 16,
          padding: '4px 0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {settingsItems.map((item, index) => (
            <div key={index}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '14px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ color: item.color }}>
                  {item.icon}
                </div>
                <div style={{ 
                  marginLeft: 12, 
                  flex: 1, 
                  fontSize: 15, 
                  fontWeight: 500, 
                  color: item.title === '退出登录' ? '#ff4d4f' : '#333' 
                }}>
                  {item.title}
                </div>
                <ChevronRight size={20} color="#ccc" />
              </div>
              {index < settingsItems.length - 1 && (
                <div style={{ height: 1, background: '#f5f5f5', marginLeft: 52 }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 版本信息 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '24px 0', 
        color: 'rgba(255, 255, 255, 0.7)', 
        fontSize: 13 
      }}>
        EasyStay v1.0.0
      </div>
    </div>
  );
};

export default My;
