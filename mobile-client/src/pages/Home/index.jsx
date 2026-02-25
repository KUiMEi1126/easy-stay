import React, { useState, useEffect, useRef } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import zhCN from 'date-fns/locale/zh-CN';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Calendar, ChevronRight } from 'lucide-react';
import { getHotels } from '../../services/api';
// Swiper for carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const UNKNOWN_PROVINCE = 'DEFAULT';
const provincesList = [
  '北京','上海','天津','重庆','河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南',
  '广东','海南','四川','贵州','云南','陕西','甘肃','青海','内蒙古',
  '广西','西藏','宁夏','新疆','香港','澳门','台湾'
];

const Home = () => {
  const navigate = useNavigate();

  const [province, setProvince] = useState(localStorage.getItem('userProvince') || '北京');
  const [banners, setBanners] = useState([]); // 多图轮播
  const [allTags, setAllTags] = useState([]);
  const [displayTags, setDisplayTags] = useState([]);

  const [keyword, setKeyword] = useState('');
  // 初始化 dateRange，优先用 localStorage
  const getInitDateRange = () => {
    const checkin = localStorage.getItem('stayCheckin');
    const checkout = localStorage.getItem('stayCheckout');
    const nights = localStorage.getItem('stayNights');
    if (checkin && checkout && nights) {
      return { checkin, checkout, nights: parseInt(nights) };
    }
    // 默认今天和明天
    const today = new Date();
    const tomorrow = new Date(Date.now()+24*3600*1000);
    return { checkin: today.toISOString().slice(0,10), checkout: tomorrow.toISOString().slice(0,10), nights: 1 };
  };
  const [dateRange, setDateRange] = useState(getInitDateRange());
  const [calendarState, setCalendarState] = useState([{ startDate: new Date(), endDate: new Date(Date.now()+24*3600*1000), key: 'selection' }]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [star, setStar] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPriceError, setMinPriceError] = useState(false);
  const [maxPriceError, setMaxPriceError] = useState(false);

  useEffect(() => {
    getHotels()
      .then(res => {
        const data = res.success ? res.data : res;
        const hotels = Array.isArray(data) ? data : [];

        // 从酒店图片中随机抽取最多 5 张作为轮播图
        const candidates = hotels.filter(h => h.images && h.images.length > 0 && h.isOnline === true);
        if (candidates.length > 0) {
          const shuffledHotels = [...candidates].sort(() => 0.5 - Math.random());
          const picked = shuffledHotels.slice(0, Math.min(5, shuffledHotels.length));
          const bannerItems = picked.map(h => ({ id: h.id, img: h.images[0], title: h.nameCn }));
          setBanners(bannerItems);
        } else {
          setBanners([]);
        }

        const tagSet = new Set();
        hotels.filter(h => h.isOnline === true).forEach(h => { if (Array.isArray(h.tags)) h.tags.forEach(t => tagSet.add(t)); });
        const tagsArr = Array.from(tagSet);
        setAllTags(tagsArr);
        if (tagsArr.length > 0) {
          const count = Math.min(4, Math.max(3, Math.floor(Math.random()*2)+3));
          const shuffled = [...tagsArr].sort(() => 0.5 - Math.random());
          setDisplayTags(shuffled.slice(0, count));
        }
      })
      .catch(() => {
        setBanners([]);
        setAllTags([]);
        setDisplayTags([]);
      });
  }, []);

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    localStorage.setItem('userProvince', e.target.value);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('当前浏览器不支持定位');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetch(`https://restapi.amap.com/v3/geocode/regeo?output=json&location=${pos.coords.longitude},${pos.coords.latitude}&key=7e2e1e2e2e2e2e2e2e2e2e2e2e2e2e2e`)
          .then(r => r.json())
              .then(data => {
                let prov = data?.regeocode?.addressComponent?.province || '';
                if (prov) {
                  // 规范化：去掉常见后缀，如“省”“市”“自治区”“特别行政区”“自治州”
                  prov = prov.replace(/(省|市|自治区|特别行政区|自治州)$/, '');
                  // 如果在已知省份列表中，则设置为该省，否则视为定位失败（显示未知）
                  if (provincesList.includes(prov)) {
                    setProvince(prov);
                    try { localStorage.setItem('userProvince', prov); } catch(e) {}
                  } else {
                    setProvince(UNKNOWN_PROVINCE);
                    try { localStorage.removeItem('userProvince'); } catch(e) {}
                  }
                } else {
                  setProvince(UNKNOWN_PROVINCE);
                  try { localStorage.removeItem('userProvince'); } catch(e) {}
                }
              })
              .catch(() => {
                // 定位失败：标记为未知地点
                setProvince(UNKNOWN_PROVINCE);
                try { localStorage.removeItem('userProvince'); } catch(e) {}
              });
      },
      () => {
        setProvince(UNKNOWN_PROVINCE);
        try { localStorage.removeItem('userProvince'); } catch(e) {}
      }
    );
  };

  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    const nights = Math.max(1, Math.round((endDate - startDate)/(1000*3600*24)));
    setCalendarState([ranges.selection]);
    setDateRange({ checkin: startDate.toISOString().slice(0,10), checkout: endDate.toISOString().slice(0,10), nights });
    // 保存到 localStorage
    try {
      localStorage.setItem('stayCheckin', startDate.toISOString().slice(0,10));
      localStorage.setItem('stayCheckout', endDate.toISOString().slice(0,10));
      localStorage.setItem('stayNights', nights);
    } catch(e) {}
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!showCalendar) return;
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showCalendar]);

  const validatePrice = (val) => {
    if (val === '' || val === null) return true;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0;
  };

  const handleSearch = (tagToUse) => {
    setMinPriceError(false);
    setMaxPriceError(false);
    const validMin = validatePrice(minPrice);
    const validMax = validatePrice(maxPrice);
    if (!validMin) { setMinPriceError(true); return; }
    if (!validMax) { setMaxPriceError(true); return; }
    if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
      setMinPriceError(true);
      setMaxPriceError(true);
      return;
    }

    const finalTag = tagToUse !== undefined ? tagToUse : '';
    const params = new URLSearchParams();
    // 只有 province 有效且不为 UNKNOWN 时才传
    if (province && province !== UNKNOWN_PROVINCE) params.set('province', province);
    // 如果有 tag，不传 keyword；否则传 keyword
    if (finalTag) {
      params.set('tag', finalTag);
    } else if (keyword) {
      params.set('keyword', keyword);
    }
    if (dateRange.checkin) params.set('checkin', dateRange.checkin);
    if (dateRange.checkout) params.set('checkout', dateRange.checkout);
    if (star) params.set('star', star);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    navigate(`/list?${params.toString()}`);
  };

  const inputStyle = {
    padding: '6px', borderRadius: 6, border: '1px solid #eee', outline: 'none'
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* 顶部轮播 */}
      <div style={{ height: 240, marginBottom: 20, position: 'relative' }}>
        {banners && banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            loop={banners.length > 1}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            style={{ height: '100%' }}
          >
            {banners.map(b => (
              <SwiperSlide key={b.id}>
                <div style={{ height: '100%', position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/detail/${b.id}`)}>
                  <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4))' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#fff' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{b.title}</div>
                    <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>点击查看详情</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div style={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 600 }}>EasyStay 酒店预订</div>
          </div>
        )}
      </div>

      {/* 搜索卡片 */}
      <div style={{ margin: '0 16px', background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        {/* 地区选择 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '2px solid #f5f5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <MapPin size={20} color="#667eea" />
            <select value={province} onChange={handleProvinceChange} style={{ fontSize: 18, fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, flex: 1, color: '#333' }}>
              <option value={UNKNOWN_PROVINCE}>📍 选择目的地</option>
              {provincesList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div 
            style={{ color: '#667eea', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '6px 12px', background: '#f0f3ff', borderRadius: 20 }} 
            onClick={handleLocate}
          >
            <MapPin size={14} /> <span style={{ marginLeft: 4 }}>定位</span>
          </div>
        </div>

        {/* 日期选择 */}
        <div style={{ position: 'relative' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px 0', 
              borderBottom: '2px solid #f5f5f5', 
              cursor: 'pointer',
              transition: 'all 0.3s'
            }} 
            onClick={() => setShowCalendar(v => !v)}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              width: 44, 
              height: 44, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={22} color="#fff" />
            </div>
            <div style={{ marginLeft: 14, flex: 1 }}>
              <div style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>入住 - 离店</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginTop: 2 }}>
                {dateRange.checkin ? `${dateRange.checkin} - ${dateRange.checkout}` : '请选择日期' }
                {dateRange.nights ? <span style={{ color: '#667eea', marginLeft: 8, fontSize: 14 }}>({dateRange.nights}晚)</span> : null}
              </div>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>

          {showCalendar && (
            <div ref={calendarRef} style={{ 
              position: 'absolute', 
              left: -20, 
              right: -20, 
              top: 76, 
              zIndex: 9999, 
              background: '#fff', 
              borderRadius: 12, 
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)', 
              padding: 16 
            }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  onClick={() => setShowCalendar(false)} 
                  style={{ 
                    padding: '10px 24px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 关键词搜索 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '2px solid #f5f5f5' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            width: 44, 
            height: 44, 
            borderRadius: 12, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Search size={22} color="#fff" />
          </div>
          <input 
            placeholder="搜索酒店/地标/关键词" 
            value={keyword} 
            onChange={e => setKeyword(e.target.value)} 
            style={{ 
              ...inputStyle, 
              marginLeft: 14, 
              flex: 1, 
              border: 'none', 
              fontSize: 16,
              background: 'transparent'
            }} 
          />
        </div>

        {/* 筛选条件 */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <select 
            value={star} 
            onChange={e => setStar(e.target.value)} 
            style={{ 
              padding: '10px 14px', 
              borderRadius: 10, 
              border: '2px solid #f0f0f0',
              fontSize: 14,
              fontWeight: 500,
              color: star ? '#667eea' : '#666',
              background: star ? '#f0f3ff' : '#fff',
              flex: 1,
              minWidth: 90
            }}
          >
            <option value="">⭐ 星级</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            placeholder="💰 最低价"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setMinPriceError(false); }}
            style={{ 
              ...inputStyle, 
              flex: 1,
              minWidth: 80,
              padding: '10px 14px',
              fontSize: 14,
              borderRadius: 10,
              border: minPriceError ? '2px solid #ff4d4f' : '2px solid #f0f0f0',
              fontWeight: 500
            }}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="💰 最高价"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setMaxPriceError(false); }}
            style={{ 
              ...inputStyle, 
              flex: 1,
              minWidth: 80,
              padding: '10px 14px',
              fontSize: 14,
              borderRadius: 10,
              border: maxPriceError ? '2px solid #ff4d4f' : '2px solid #f0f0f0',
              fontWeight: 500
            }}
          />
        </div>

        {/* 搜索按钮 */}
        <button 
          onClick={() => handleSearch()} 
          style={{ 
            width: '100%',
            marginTop: 18, 
            padding: '14px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🔍 搜索酒店
        </button>
      </div>

      {/* 热门标签 */}
      {displayTags.length > 0 && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <span style={{ background: '#fff', width: 4, height: 16, borderRadius: 2, marginRight: 8 }}></span>
            热门推荐
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {displayTags.map(t => (
              <div 
                key={t} 
                onClick={() => handleSearch(t)} 
                style={{ 
                  cursor: 'pointer', 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
