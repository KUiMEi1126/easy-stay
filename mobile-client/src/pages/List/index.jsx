import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Loader2, Search, Calendar } from 'lucide-react';
import { getHotels } from '../../services/api';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import zhCN from 'date-fns/locale/zh-CN';

const List = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('default');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const [otherHotels, setOtherHotels] = useState([]);

  const location = useLocation();
  // 解析 URL 参数
  const params = new URLSearchParams(location.search);
  const province = params.get('province') || '';
  const city = params.get('city') || '';
  const keyword = params.get('keyword') || '';
  // 优先读取 localStorage 日期
  const checkin = params.get('checkin') || localStorage.getItem('stayCheckin') || '';
  const checkout = params.get('checkout') || localStorage.getItem('stayCheckout') || '';
  const starParam = params.get('star') || '';
  const tagParam = params.get('tag') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';

  // 顶部筛选状态
  const [cityInput, setCityInput] = useState(keyword || city);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarState, setCalendarState] = useState([{ startDate: checkin ? new Date(checkin) : new Date(), endDate: checkout ? new Date(checkout) : new Date(Date.now()+24*3600*1000), key: 'selection' }]);
  const [dateRange, setDateRange] = useState({ checkin: checkin || '', checkout: checkout || '', nights: checkin && checkout ? Math.max(1, Math.round((new Date(checkout)-new Date(checkin))/(1000*3600*24))) : parseInt(localStorage.getItem('stayNights')) || 1 });
  const calendarRef = useRef(null);

  // 详细筛选状态
  const [showFilters, setShowFilters] = useState(false);
  const [filterStar, setFilterStar] = useState(starParam);
  const [filterTag, setFilterTag] = useState(tagParam);
  const [filterMinPrice, setFilterMinPrice] = useState(minPrice);
  const [filterMaxPrice, setFilterMaxPrice] = useState(maxPrice);
  const [allTags, setAllTags] = useState([]);

  const loadHotels = (pageToLoad, replace = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (replace) setLoading(true); else setLoadingMore(true);

    // 如果有搜索条件，增加 pageSize 以确保显示所有匹配结果
    const effectivePageSize = (province || city || keyword) ? 50 : pageSize;
    const paramsToSend = { province, city, keyword, checkin, checkout, star: starParam, tag: tagParam, minPrice, maxPrice, page: pageToLoad, pageSize: effectivePageSize };

    console.log('========== 开始搜索 ==========');
    console.log('发送给后端的参数:', paramsToSend);

    getHotels(paramsToSend)
      .then(res => {
        console.log('✅ Promise resolved - 进入then回调');
        console.log('📦 原始后端响应:', res);
        console.log('📦 res.data类型:', Array.isArray(res?.data) ? 'Array' : typeof res?.data);
        console.log('📦 res.data内容:', res?.data);
        
        const data = res && res.success ? res.data : res;
        const totalCount = res && typeof res.total === 'number' ? res.total : (Array.isArray(data) ? data.length : 0);
        const listData = Array.isArray(data) ? data : [];

        console.log('后端返回的酒店数量:', listData.length);
        console.log('后端返回的总数:', totalCount);
        console.log('URL参数 - province:', province, 'city:', city, 'keyword:', keyword);
        if (listData.length > 0) {
          console.log('前5个酒店:', listData.slice(0, 5).map(h => ({ 
            id: h.id, 
            name: h.nameCn, 
            address: h.address 
          })));
        }

        setTotal(totalCount);
        setHotels(prev => {
          const merged = replace ? listData : [...prev, ...listData];
          console.log('🔄 更新hotels state:', { 
            replace, 
            prev长度: prev.length, 
            listData长度: listData.length, 
            merged长度: merged.length 
          });
          return merged;
        });
        const effectivePageSize = (province || city || keyword) ? 50 : pageSize;
        setHasMore(pageToLoad * effectivePageSize < totalCount);
        setPage(pageToLoad);
        
        // 只在第一页加载其他酒店推荐
        if (pageToLoad === 1 && listData.length < 10) {
          const ids = listData.map(h => h.id);
          loadOtherHotels(ids);
        } else if (pageToLoad === 1) {
          setOtherHotels([]);
        }
      })
      .catch(err => {
        console.error("❌ Promise rejected - 进入catch回调");
        console.error("❌ 加载失败:", err);
        console.error("❌ 错误详情:", { 
          message: err.message, 
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        if (replace) setHotels([]);
      })
      .finally(() => {
        console.log('🏁 Promise finally - 请求结束');
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      });
  };

  function loadOtherHotels(excludeIds = []) {
    getHotels({ page: 1, pageSize: 30 })
      .then(res => {
        const data = res && res.success ? res.data : res;
        const listData = Array.isArray(data) ? data : [];
        const filtered = listData.filter(h => !excludeIds.includes(h.id));
        setOtherHotels(filtered);
      })
      .catch(() => setOtherHotels([]));
  }

  useEffect(() => {
    setHotels([]);
    setTotal(0);
    setHasMore(true);
    setPage(1);
    loadHotels(1, true);
    loadOtherHotels([]);
  }, [location.search]);

  // 获取全部 tags 用于详细筛选展示
  useEffect(() => {
    getHotels().then(res => {
      const data = res.success ? res.data : res;
      const hotelsAll = Array.isArray(data) ? data : [];
      const tagSet = new Set();
      hotelsAll.forEach(h => { if (Array.isArray(h.tags)) h.tags.forEach(t => tagSet.add(t)); });
      setAllTags(Array.from(tagSet));
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!showCalendar) return;
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showCalendar]);

  useEffect(() => {
    const onScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - (scrollTop + windowHeight) < 120) {
        loadHotels(page + 1, false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [page, hasMore, loading, loadingMore]);

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortType === 'price_asc') {
      const minA = Math.min(...a.rooms.map(r => r.price));
      const minB = Math.min(...b.rooms.map(r => r.price));
      return minA - minB;
    }
    if (sortType === 'address_asc') {
      return (a.address || '').localeCompare(b.address || '');
    }
    return 0;
  });
  
  // 后端已经按优先级排序，前端直接使用
  const finalHotels = sortedHotels;
  
  console.log('🔍 调试：hotels state长度:', hotels.length);
  console.log('🔍 调试：sortedHotels长度:', sortedHotels.length);
  console.log('🔍 调试：finalHotels长度:', finalHotels.length);
  
  // 判断是否有搜索条件（province、city、keyword、筛选条件等）
  const isSearching = !!(province || city || keyword || filterStar || filterTag || filterMinPrice || filterMaxPrice);
  
  // 判断哪些酒店匹配搜索条件（用于显示分割线）
  // 注意：星级、标签、价格筛选由后端处理，这里只判断地址和关键词匹配
  const getMatchedHotels = () => {
    if (!isSearching) return finalHotels;
    
    // 如果有标签/星级/价格筛选（后端已处理），所有返回的酒店都算匹配
    if (filterTag || filterStar || filterMinPrice || filterMaxPrice) {
      return finalHotels;
    }
    
    // 如果只有地址或关键词搜索，需要前端进行匹配判断
    if (!province && !city && !keyword) {
      return finalHotels;
    }
    
    return finalHotels.filter(h => {
      const address = (h.address || '').toLowerCase();
      const nameCn = (h.nameCn || '').toLowerCase();
      const nameEn = (h.nameEn || '').toLowerCase();
      const tags = Array.isArray(h.tags) ? h.tags.map(t => t.toLowerCase()) : [];
      
      // 检查省份匹配
      let provinceMatch = false;
      if (province) {
        provinceMatch = address.includes(province.toLowerCase());
      }
      
      // 检查城市匹配
      let cityMatch = false;
      if (city) {
        cityMatch = address.includes(city.toLowerCase());
      }
      
      // 检查关键词匹配
      let keywordMatch = false;
      if (keyword) {
        const kwList = keyword.toLowerCase().split(/[-—、\s]+/).map(s => s.trim()).filter(Boolean);
        keywordMatch = kwList.some(kw =>
          nameCn.includes(kw) ||
          nameEn.includes(kw) ||
          tags.some(t => t.includes(kw))
        );
      }
      
      // OR逻辑：只要省份、城市或关键词任一匹配即可
      return provinceMatch || cityMatch || keywordMatch;
    });
  };
  
  const matchedHotels = getMatchedHotels();
  
  // 调试日志
  console.log('========== 前端匹配逻辑 ==========');
  console.log('总酒店数量:', finalHotels.length);
  console.log('是否在搜索:', isSearching);
  console.log('搜索条件 - province:', province, 'city:', city, 'keyword:', keyword);
  console.log('匹配的酒店数量:', matchedHotels.length);
  if (matchedHotels.length > 0) {
    console.log('匹配的前5个酒店:', matchedHotels.slice(0, 5).map(h => ({ 
      name: h.nameCn, 
      address: h.address 
    })));
  }
  console.log('========================================');
  
  const unmatchedHotels = isSearching 
    ? finalHotels.filter(h => !matchedHotels.includes(h))
    : [];
  
  // 合并其他酒店推荐（去重）
  const allUnmatchedHotels = isSearching
    ? [...unmatchedHotels, ...otherHotels].filter((h, idx, arr) => arr.findIndex(x => x.id === h.id) === idx)
    : otherHotels;

  // 日历选择
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

  // 搜索与筛选
    const handleApplySearch = () => {
      const params = new URLSearchParams();
      if (province) params.set('province', province);
      // 城市/地标输入作为 keyword 搜索
      // 只用 cityInput 作为 keyword，避免覆盖
      if (cityInput) {
        params.set('keyword', cityInput);
      } else if (keyword) {
        params.set('keyword', keyword);
      }
      if (dateRange.checkin) params.set('checkin', dateRange.checkin);
      if (dateRange.checkout) params.set('checkout', dateRange.checkout);
      if (filterStar) params.set('star', filterStar);
      if (filterTag) params.set('tag', filterTag);
      if (filterMinPrice) params.set('minPrice', filterMinPrice);
      if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
      // 搜索时同步保存日期
      try {
        localStorage.setItem('stayCheckin', dateRange.checkin);
        localStorage.setItem('stayCheckout', dateRange.checkout);
        localStorage.setItem('stayNights', dateRange.nights);
      } catch(e) {}
      navigate(`/list?${params.toString()}`);
    };

  const clearFilters = () => {
    setFilterStar(''); setFilterTag(''); setFilterMinPrice(''); setFilterMaxPrice('');
    setShowFilters(false);
  };

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
      {/* 顶部核心条件筛选头 */}
      <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 110, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
          <ArrowLeft onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>{province ? province + ' 酒店列表' : '酒店列表'}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', alignItems: 'center' }}>
          <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="城市/地标" style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #eee' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: 8, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => setShowCalendar(v=>!v)}>
              <Calendar size={16} />
              <div style={{ marginLeft: 8, fontSize: 13 }}>{dateRange.checkin ? `${dateRange.checkin} - ${dateRange.checkout}` : '选择日期'}</div>
            </div>
            <button onClick={handleApplySearch} style={{ background: '#0086F6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8 }}>搜索</button>
          </div>
        </div>

        {showCalendar && (
          <div ref={calendarRef} style={{ padding: 12 }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 12px' }}>
          <div style={{ color: '#666', fontSize: 13 }}>{dateRange.nights ? `共 ${dateRange.nights} 晚` : ''}</div>
          <div>
            <button onClick={() => setShowFilters(v=>!v)} style={{ background: 'transparent', border: 'none', color: '#0086F6' }}>{showFilters ? '收起筛选' : '更多筛选'}</button>
          </div>
        </div>

        {/* 详细筛选区域 */}
        {showFilters && (
          <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={filterStar} onChange={e=>setFilterStar(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
                <option value="">星级不限</option>
                <option value="5">五星</option>
                <option value="4">四星</option>
                <option value="3">三星</option>
                <option value="2">二星</option>
              </select>
              <select value={filterTag} onChange={e=>setFilterTag(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
                <option value="">全部标签</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input placeholder="最低价" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', width: 120 }} />
              <input placeholder="最高价" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', width: 120 }} />
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={clearFilters} style={{ marginRight: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #eee' }}>清空</button>
                <button onClick={handleApplySearch} style={{ padding: '8px 12px', borderRadius: 8, background: '#0086F6', color: '#fff' }}>应用</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 酒店列表 */}
      <div style={{ padding: '12px' }}>
        {matchedHotels.length === 0 && !loadingMore && (
          <div style={{ textAlign: 'center', color: '#999', padding: '18px 0' }}>
            未找到匹配酒店
          </div>
        )}
        {matchedHotels.map(hotel => (
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
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>{hotel.address || '暂无地址'}</div>
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
        {loadingMore && (
          <div style={{ textAlign: 'center', color: '#999', padding: '12px 0' }}>
            正在加载更多酒店...
          </div>
        )}
        {isSearching && allUnmatchedHotels.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#999', fontSize: 12, margin: '12px 0' }}>
              <div style={{ height: 1, background: '#eee', flex: 1 }} />
              以下是其他酒店
              <div style={{ height: 1, background: '#eee', flex: 1 }} />
            </div>
            <div style={{ height: 12 }} />

            {allUnmatchedHotels.map(hotel => (
              <div 
                key={`other-${hotel.id}`} 
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
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>{hotel.address || '暂无地址'}</div>
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
        )}

        {!hasMore && !loadingMore && (
          <div style={{ textAlign: 'center', color: '#999', padding: '12px 0' }}>
            已经到底啦
          </div>
        )}
      </div>
    </div>
  );
};

export default List;