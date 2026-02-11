import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { getHotels } from '../../services/api';

const List = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('default');

  useEffect(() => {
    getHotels()
      .then(res => {
        const data = res.success ? res.data : res;
        setHotels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("加载失败:", err);
        setLoading(false);
      });
  }, []);

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortType === 'price_asc') {
      const minA = Math.min(...a.rooms.map(r => r.price));
      const minB = Math.min(...b.rooms.map(r => r.price));
      return minA - minB;
    }
    return 0;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0086F6' }}>
        <Loader2 className="animate-spin" style={{ marginRight: '8px' }} />
        正在为您寻找心仪酒店...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f7f9', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 15px' }}>
          <ArrowLeft onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '17px' }}>北京酒店列表</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0', fontSize: '14px', color: '#666', borderTop: '1px solid #f0f0f0' }}>
          <div 
            onClick={() => setSortType(sortType === 'price_asc' ? 'default' : 'price_asc')} 
            style={{ color: sortType === 'price_asc' ? '#0086F6' : '#666', display: 'flex', alignItems: 'center', fontWeight: sortType === 'price_asc' ? 'bold' : 'normal' }}
          >
            价格最低 <ChevronDown size={14} />
          </div>
          <div>星级筛选 <ChevronDown size={14} /></div>
        </div>
      </div>

      <div style={{ padding: '12px' }}>
        {sortedHotels.map(hotel => (
          <div 
            key={hotel.id} 
            onClick={() => navigate(`/detail/${hotel.id}`)}
            style={{ display: 'flex', background: 'white', borderRadius: '12px', marginBottom: '12px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
          >
            <div style={{ width: '110px', height: '110px', marginRight: '12px', flexShrink: 0 }}>
              <img 
                src={hotel.images?.[0] || `https://picsum.photos/seed/${hotel.id}/200/200`} 
                style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} 
                alt={hotel.nameCn} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{hotel.nameCn}</div>
                <div style={{ color: '#0086F6', fontSize: '12px', margin: '4px 0' }}>{hotel.rating}分 · {hotel.star}星级</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {hotel.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '10px', background: '#f0f7ff', color: '#0086F6', padding: '2px 4px', borderRadius: '4px' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#ff5a5f', fontWeight: 'bold' }}>￥</span>
                <span style={{ fontSize: '20px', color: '#ff5a5f', fontWeight: 'bold' }}>
                  {hotel.rooms?.length > 0 ? Math.min(...hotel.rooms.map(r => r.price)) : '---'}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>起</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;