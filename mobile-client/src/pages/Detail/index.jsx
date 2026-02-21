import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MapPin, Star, Calendar } from 'lucide-react';
import { getHotelById } from '../../services/api';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import zhCN from 'date-fns/locale/zh-CN';

// 引入 Swiper 组件和样式
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarState, setCalendarState] = useState([
    { 
      startDate: new Date(), 
      endDate: new Date(Date.now() + 24 * 3600 * 1000), 
      key: 'selection' 
    }
  ]);
  const [dateRange, setDateRange] = useState({
    checkin: new Date().toISOString().slice(0, 10),
    checkout: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10),
    nights: 1
  });

  // 1. 获取后端数据
  useEffect(() => {
    getHotelById(id)
      .then(res => {
        const hotelData = res.success ? res.data : res;
        setHotel(hotelData);
      })
      .catch(err => console.error("获取详情失败:", err));
  }, [id]);

  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    const nights = Math.max(1, Math.round((endDate - startDate) / (1000 * 3600 * 24)));
    setCalendarState([ranges.selection]);
    setDateRange({
      checkin: startDate.toISOString().slice(0, 10),
      checkout: endDate.toISOString().slice(0, 10),
      nights
    });
  };

  if (!hotel) return <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>加载详情中...</div>;

  // 2. 处理图片：优先使用后端 images 数组，如果没有则使用占位图
  const sliderImages = hotel.images && hotel.images.length > 0 
    ? hotel.images 
    : [`https://picsum.photos/seed/${id}/800/400`];

  // 3. 房型按价格升序排列
  const sortedRooms = hotel.rooms ? [...hotel.rooms].sort((a, b) => a.price - b.price) : [];

  return (
    <div style={{ background: '#f5f7f9', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* --- Swiper 触控轮播区域 --- */}
      <div style={{ position: 'relative', height: '280px', background: '#eef2f6' }}>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={sliderImages.length > 1}
          style={{ height: '100%', '--swiper-pagination-color': '#0086F6' }}
        >
          {sliderImages.map((imgUrl, index) => (
            <SwiperSlide key={index}>
              <img 
                src={imgUrl} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt={`hotel-view-${index}`}
                // 图片加载失败时的处理
                onError={(e) => { e.target.src = 'https://picsum.photos/800/400?text=Image+Error'; }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* 顶部悬浮按钮层 */}
        <div style={{ position: 'absolute', top: '20px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <div onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '8px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <ArrowLeft color="white" size={20} />
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '8px', backdropFilter: 'blur(4px)' }}>
            <Share2 color="white" size={20} />
          </div>
        </div>
      </div>

      {/* --- 酒店标题信息卡片 --- */}
      <div style={{ 
        padding: '20px 15px', 
        background: 'white', 
        marginTop: '-15px', 
        borderRadius: '15px 15px 0 0', 
        position: 'relative',
        zIndex: 5,
        boxShadow: '0 -5px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#333', flex: 1 }}>{hotel.nameCn}</h2>
          <div style={{ background: '#f0f7ff', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ color: '#0086F6', fontWeight: 'bold', fontSize: '18px' }}>{hotel.rating}</div>
            <div style={{ color: '#0086F6', fontSize: '10px' }}>超赞</div>
          </div>
        </div>
        
        <p style={{ color: '#666', fontSize: '14px', margin: '8px 0', display: 'flex', alignItems: 'center' }}>
          <MapPin size={14} style={{ marginRight: '4px' }} /> {hotel.address}
        </p>
        
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          {Array.from({ length: hotel.star || 5 }).map((_, i) => (
            <Star key={i} size={14} fill="#ffb400" color="#ffb400" />
          ))}
        </div>
      </div>

      {/* --- 日期选择 Banner --- */}
      <div style={{ margin: '10px 15px', background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowCalendar(!showCalendar)}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>入住日期</div>
            <div style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>{dateRange.checkin} - {dateRange.checkout}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#0086F6', fontWeight: 'bold' }}>{dateRange.nights} 晚</div>
            <Calendar size={20} color="#0086F6" />
          </div>
        </div>

        {showCalendar && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <DateRange
              editableDateInputs={true}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
              ranges={calendarState}
              months={1}
              direction="horizontal"
              minDate={new Date()}
              locale={zhCN}
            />
          </div>
        )}
      </div>

      {/* --- 房型列表区域 --- */}
      <div style={{ padding: '15px', marginTop: '10px', background: 'white' }}>
        <h3 style={{ 
          fontSize: '16px', 
          borderLeft: '4px solid #0086F6', 
          paddingLeft: '10px',
          marginBottom: '15px'
        }}>
          预订房型
        </h3>

        {sortedRooms.map((room, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '18px 0', 
            borderBottom: index === sortedRooms.length - 1 ? 'none' : '1px solid #f2f2f2' 
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px', color: '#333' }}>{room.name}</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#ff8a05', background: '#fff5e6', padding: '2px 6px', borderRadius: '4px' }}>
                  仅剩 {room.count} 间
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>含早餐 | 免费取消</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', marginRight: '12px' }}>
                <div style={{ color: '#ff5a5f' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>￥</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{room.price}</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`正在为您跳转预订：${room.name}`)}
                style={{ 
                  background: 'linear-gradient(90deg, #4facfe 0%, #0086f6 100%)',
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,134,246,0.2)'
                }}
              >
                预订
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Detail;