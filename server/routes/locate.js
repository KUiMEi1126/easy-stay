const express = require('express');
const router = express.Router();

const AMAP_KEY = process.env.AMAP_KEY || '95b73d3609ab4438bfacc56383a8ade4';

const provincesList = [
  '北京','上海','天津','重庆','河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南',
  '广东','海南','四川','贵州','云南','陕西','甘肃','青海','内蒙古',
  '广西','西藏','宁夏','新疆','香港','澳门','台湾'
];

const normalizeProvince = (rawName = '') => {
  const source = String(rawName || '').trim();
  if (!source) return '';

  const exactMap = {
    '北京市': '北京', '上海市': '上海', '天津市': '天津', '重庆市': '重庆',
    '内蒙古自治区': '内蒙古', '广西壮族自治区': '广西', '宁夏回族自治区': '宁夏',
    '新疆维吾尔自治区': '新疆', '西藏自治区': '西藏',
    '香港特别行政区': '香港', '澳门特别行政区': '澳门'
  };

  const mapped = exactMap[source];
  if (mapped && provincesList.includes(mapped)) return mapped;

  const normalized = source
    .replace(/特别行政区$/u, '')
    .replace(/维吾尔自治区$/u, '')
    .replace(/壮族自治区$/u, '')
    .replace(/回族自治区$/u, '')
    .replace(/自治区$/u, '')
    .replace(/省$/u, '')
    .replace(/市$/u, '');

  return provincesList.includes(normalized) ? normalized : '';
};

// GET /api/locate  —— IP 定位
router.get('/', async (req, res) => {
  try {
    // 提取客户端真实 IP（兼容反向代理）
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || req.socket?.remoteAddress
      || '';

    console.log('📍 定位请求 - 客户端 IP:', clientIp);

    // 调用高德 IP 定位 API（带 ip 参数，让高德解析指定 IP）
    let url = `https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`;
    // 如果是内网/本地 IP，不传 ip 参数，让高德用服务器出口 IP
    const isPrivateIp = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80)/.test(clientIp);
    if (clientIp && !isPrivateIp) {
      url += `&ip=${clientIp}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log('📍 高德 IP 定位返回:', JSON.stringify(data));

    if (String(data?.status) === '1' && data?.province) {
      const province = normalizeProvince(data.province);
      if (province) {
        return res.json({ success: true, province, city: data.city || '', method: 'ip' });
      }
    }

    // IP 定位失败，返回空
    res.json({ success: false, message: '无法通过 IP 定位到省份' });
  } catch (err) {
    console.error('📍 定位接口异常:', err.message);
    res.status(500).json({ success: false, message: '定位服务异常' });
  }
});

// GET /api/locate/regeo?lng=xxx&lat=xxx  —— 逆地理编码（GPS 坐标 → 省份）
router.get('/regeo', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: '缺少 lng/lat 参数' });
    }

    const url = `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${lng},${lat}&extensions=base&key=${AMAP_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log('📍 高德逆地理编码返回:', JSON.stringify(data));

    if (String(data?.status) === '1') {
      const rawProvince = data?.regeocode?.addressComponent?.province || '';
      const province = normalizeProvince(rawProvince);
      if (province) {
        return res.json({ success: true, province, method: 'gps' });
      }
    }

    res.json({ success: false, message: '逆地理编码未解析到省份' });
  } catch (err) {
    console.error('📍 逆地理编码异常:', err.message);
    res.status(500).json({ success: false, message: '逆地理编码服务异常' });
  }
});

module.exports = router;
