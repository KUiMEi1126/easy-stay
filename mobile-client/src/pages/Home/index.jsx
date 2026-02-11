import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Calendar, ChevronRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('北京');
  
  // 模拟 Banner 数据
  const banners = [
    { id: 3, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', title: '宝格丽奢华体验' }
  ];

  return (
    <div style={{ background: '#f5f7f9', minHeight: '100vh' }}>
      {/* 1. 顶部 Banner - 点击跳转详情 */}
      <div style={{ height: '200px', position: 'relative' }} onClick={() => navigate(`/detail/${banners[0].id}`)}>
        <img src={banners[0].img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="ad" />
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          <h3 style={{ margin: 0 }}>{banners[0].title}</h3>
          <span style={{ fontSize: '12px' }}>立即预订 &gt;</span>
        </div>
      </div>

      {/* 2. 核心查询区域 */}
      <div style={{ margin: '-30px 15px 0', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>
        {/* 地点与定位 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{city}</div>
          <div style={{ color: '#0086F6', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
            <MapPin size={16} /> <span style={{ marginLeft: '4px' }}>我的位置</span>
          </div>
        </div>

        {/* 日期选择 (评分项: 日历组件逻辑) */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
          <Calendar size={18} color="#999" />
          <div style={{ marginLeft: '12px', flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#999' }}>入住 - 离店</div>
            <div style={{ fontSize: '15px', fontWeight: '500' }}>2月11日 - 2月12日 <span style={{ color: '#0086F6', marginLeft: '5px' }}>共1晚</span></div>
          </div>
          <ChevronRight size={18} color="#ccc" />
        </div>

        {/* 关键字搜索 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0' }}>
          <Search size={18} color="#999" />
          <input 
            placeholder="搜索酒店/地标/关键词" 
            style={{ border: 'none', marginLeft: '12px', flex: 1, outline: 'none', fontSize: '15px' }}
          />
        </div>

        {/* 查询按钮 */}
        <button 
          onClick={() => navigate('/list')}
          style={{ width: '100%', background: 'linear-gradient(90deg, #4facfe 0%, #0086f6 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '25px', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}
        >
          搜索酒店
        </button>
      </div>

      {/* 3. 快捷标签 (评分项: 用户体验) */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px 15px' }}>
        {['亲子乐园', '豪华酒店', '免费停车', '近地铁'].map(tag => (
          <div key={tag} style={{ textAlign: 'center' }}>
            <div style={{ width: '45px', height: '45px', background: '#eef6fe', borderRadius: '50%', marginBottom: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ width: '20px', height: '20px', background: '#0086F6', borderRadius: '4px' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;