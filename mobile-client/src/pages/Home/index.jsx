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

const UNKNOWN_PROVINCE = 'UNKNOWN';
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
        const candidates = hotels.filter(h => h.images && h.images.length > 0);
        if (candidates.length > 0) {
          const shuffledHotels = [...candidates].sort(() => 0.5 - Math.random());
          const picked = shuffledHotels.slice(0, Math.min(5, shuffledHotels.length));
          const bannerItems = picked.map(h => ({ id: h.id, img: h.images[0], title: h.nameCn }));
          setBanners(bannerItems);
        } else {
          setBanners([]);
        }

        const tagSet = new Set();
        hotels.forEach(h => { if (Array.isArray(h.tags)) h.tags.forEach(t => tagSet.add(t)); });
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
    if (keyword) params.set('keyword', keyword);
    if (dateRange.checkin) params.set('checkin', dateRange.checkin);
    if (dateRange.checkout) params.set('checkout', dateRange.checkout);
    if (star) params.set('star', star);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (finalTag) params.set('tag', finalTag);

    navigate(`/list?${params.toString()}`);
  };

  const inputStyle = {
    padding: '6px', borderRadius: 6, border: '1px solid #eee', outline: 'none'
  };

  return (
    <div style={{ background: '#f5f7f9', minHeight: '100vh' }}>
      <div style={{ height: 200, marginBottom: 18 }}>
        {banners && banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            loop={banners.length > 1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            style={{ height: '100%' }}
          >
            {banners.map(b => (
              <SwiperSlide key={b.id}>
                <div style={{ height: '100%', position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/detail/${b.id}`)}>
                  <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{b.title}</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div style={{ height: '100%', background: '#ddd' }} />
        )}
      </div>

      <div style={{ margin: '0 15px', background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <select value={province} onChange={handleProvinceChange} style={{ fontSize: 16, border: 'none', background: 'transparent', outline: 'none' }}>
              <option value={UNKNOWN_PROVINCE}>未知地点</option>
              {provincesList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ color: '#0086F6', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleLocate}>
            <MapPin size={16} /> <span style={{ marginLeft: 6 }}>自动定位</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => setShowCalendar(v => !v)}>
          <Calendar size={18} color="#999" />
          <div style={{ marginLeft: 12, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#999' }}>入住 - 离店</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{dateRange.checkin ? `${dateRange.checkin} - ${dateRange.checkout}` : '请选择日期' }{dateRange.nights ? <span style={{ color: '#0086F6', marginLeft: 6 }}>共{dateRange.nights}晚</span> : null}</div>
          </div>
            <ChevronRight size={18} color="#ccc" />
          </div>

          {showCalendar && (
            <div ref={calendarRef} style={{ position: 'absolute', left: 10, right: 10, top: 66, zIndex: 9999, background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 12 }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setShowCalendar(false)} style={{ padding: '8px 12px', background: '#0086F6', color: '#fff', border: 'none', borderRadius: 6 }}>确定</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
          <Search size={18} color="#999" />
          <input placeholder="搜索酒店/地标/关键词" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ ...inputStyle, marginLeft: 12, flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <select value={star} onChange={e => setStar(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #eee' }}>
            <option value="">星级不限</option>
            <option value="5">五星</option>
            <option value="4">四星</option>
            <option value="3">三星</option>
            <option value="2">二星</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            placeholder="最低价"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setMinPriceError(false); }}
            style={{ ...inputStyle, width: 90, border: minPriceError ? '1px solid #ff4d4f' : '1px solid #eee' }}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="最高价"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setMaxPriceError(false); }}
            style={{ ...inputStyle, width: 90, border: maxPriceError ? '1px solid #ff4d4f' : '1px solid #eee' }}
          />

          <button onClick={() => handleSearch()} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#0086F6', color: '#fff', border: 'none', borderRadius: 8 }}>搜索酒店</button>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {displayTags.map(t => (
            <div key={t} onClick={() => handleSearch(t)} style={{ cursor: 'pointer', color: '#0086F6' }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
