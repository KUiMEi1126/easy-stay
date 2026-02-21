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
  const [cityInput, setCityInput] = useState(city);
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

    const paramsToSend = { province, city, keyword, checkin, checkout, star: starParam, tag: tagParam, minPrice, maxPrice, page: pageToLoad, pageSize };

    getHotels(paramsToSend)
      .then(res => {
        const data = res && res.success ? res.data : res;
        const totalCount = res && typeof res.total === 'number' ? res.total : (Array.isArray(data) ? data.length : 0);
        const listData = Array.isArray(data) ? data : [];

        setTotal(totalCount);
        setHotels(prev => {
          const merged = replace ? listData : [...prev, ...listData];
          if (pageToLoad === 1) {
            const ids = merged.map(h => h.id);
            loadOtherHotels(ids);
          }
          return merged;
        });
        setHasMore(pageToLoad * pageSize < totalCount);
        setPage(pageToLoad);
      })
      .catch(err => {
        console.error("加载失败:", err);
        if (replace) setHotels([]);
      })
      .finally(() => {
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
  const isSearching = !!(province || cityInput || keyword || filterStar || filterTag || filterMinPrice || filterMaxPrice);

  const provinceCities = {
    '北京': ['北京'],
    '天津': ['天津'],
    '上海': ['上海'],
    '重庆': ['重庆'],
    '河北': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
    '山西': ['太原','大同','阳泉','长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁'],
    '辽宁': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
    '吉林': ['长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
    '黑龙江': ['哈尔滨','齐齐哈尔','牡丹江','佳木斯','大庆','鸡西','双鸭山','伊春','鹤岗','七台河','黑河','绥化'],
    '江苏': ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
    '浙江': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
    '安徽': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','巢湖','六安','亳州','池州','宣城'],
    '福建': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
    '江西': ['南昌','景德镇','九江','上饶','抚州','赣州','吉安','宜春','鹰潭','萍乡','新余'],
    '山东': ['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','莱芜','临沂','德州','聊城','滨州','菏泽'],
    '河南': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店','济源'],
    '湖北': ['武汉','黄石','十堰','荆州','宜昌','襄阳','鄂州','荆门','孝感','黄冈','咸宁','随州','恩施'],
    '湖南': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
    '广东': ['广州','深圳','珠海','汕头','佛山','韶关','湛江','肇庆','江门','茂名','惠州','梅州','汕尾','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
    '广西': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','河池','来宾','崇左'],
    '海南': ['海口','三亚','三沙','儋州'],
    '四川': ['成都','绵阳','自贡','攀枝花','泸州','德阳','遂宁','内江','乐山','南充','眉山','宜宾','广安','达州','雅安','巴中','资阳'],
    '贵州': ['贵阳','六盘水','遵义','安顺','铜仁','毕节','黔东南','黔南','黔西南'],
    '云南': ['昆明','大理','丽江','曲靖','玉溪','昭通','保山','临沧','红河','文山','普洱','德宏','怒江','迪庆','楚雄','西双版纳'],
    '西藏': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
    '陕西': ['西安','咸阳','宝鸡','渭南','汉中','安康','商洛','榆林','铜川'],
    '甘肃': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南'],
    '青海': ['西宁','海东','海北','黄南','海南','果洛','玉树','海西'],
    '宁夏': ['银川','石嘴山','吴忠','固原','中卫'],
    '新疆': ['乌鲁木齐','克拉玛依','石河子','喀什','和田','阿克苏','巴音郭楞','昌吉','吐鲁番','哈密','博尔塔拉','伊犁','克孜勒苏','塔城','阿勒泰'],
    '香港': ['香港'],
    '澳门': ['澳门'],
    '台湾': ['台北','高雄','台中','台南','桃园']
  };

  // 根据定位/选择的地址优先展示
  let finalHotels = sortedHotels;
  const activeKeyword = cityInput || keyword;
  const keywordParts = activeKeyword ? activeKeyword.split(/[-—\s]+/).map(s => s.trim()).filter(Boolean) : [];
  const provinceParts = province ? Array.from(new Set([province, ...(provinceCities[province] || [])])) : [];
  const preferredLocations = Array.from(new Set([...provinceParts, ...keywordParts])).filter(Boolean);

  if (preferredLocations.length > 0) {
    const matched = finalHotels.filter(h => preferredLocations.some(p => (h.address || '').includes(p)));
    const others = finalHotels.filter(h => !preferredLocations.some(p => (h.address || '').includes(p)));
    finalHotels = matched.length > 0 ? [...matched, ...others] : finalHotels;
  }

  const matchByQuery = (hotel) => {
    const addr = (hotel.address || '').toString();
    const matchProvince = provinceParts.length ? provinceParts.some(p => addr.includes(p)) : true;
    const matchKeyword = keywordParts.length ? keywordParts.some(p => {
      const nameCn = (hotel.nameCn || '').toLowerCase();
      const nameEn = (hotel.nameEn || '').toLowerCase();
      const address = (hotel.address || '').toLowerCase();
      const tags = Array.isArray(hotel.tags) ? hotel.tags.map(t => t.toLowerCase()) : [];
      const p_lower = p.toLowerCase();
      return nameCn.includes(p_lower) || nameEn.includes(p_lower) || address.includes(p_lower) || tags.some(t => t.includes(p_lower));
    }) : true;
    return matchProvince && matchKeyword;
  };

  const primaryHotels = isSearching ? finalHotels.filter(matchByQuery) : finalHotels;
  const secondaryFromSearch = isSearching ? finalHotels.filter(h => !matchByQuery(h)) : [];
  const secondaryHotels = isSearching
    ? [...secondaryFromSearch, ...otherHotels].filter((h, idx, arr) => arr.findIndex(x => x.id === h.id) === idx)
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
        {primaryHotels.length === 0 && !loadingMore && (
          <div style={{ textAlign: 'center', color: '#999', padding: '18px 0' }}>
            未找到匹配酒店
          </div>
        )}
        {primaryHotels.map(hotel => (
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
        {isSearching && secondaryHotels.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#999', fontSize: 12, margin: '12px 0' }}>
              <div style={{ height: 1, background: '#eee', flex: 1 }} />
              以下是其他酒店
              <div style={{ height: 1, background: '#eee', flex: 1 }} />
            </div>
            <div style={{ height: 12 }} />

            {secondaryHotels.map(hotel => (
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