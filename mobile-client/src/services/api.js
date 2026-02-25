import axios from 'axios';

// 获取 API 地址（从环境变量或使用默认本地地址）
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 1. 创建 axios 实例，配置基础路径
const request = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 5000, // 超过5秒没响应就报错
});

// 2. 响应拦截器（可选）：帮你直接过滤掉不需要的数据层级
request.interceptors.response.use(
  response => response.data, 
  error => Promise.reject(error)
);

/**
 * 移动端接口
 */

// 获取酒店列表：支持传入 { star: 5, sort: 'price_asc' } 等筛选参数
export const getHotels = (params) => request.get('/hotel', { params });

// 获取单个酒店详情：传入 id
export const getHotelById = (id) => request.get(`/hotel/${id}`);

/**
 * PC管理端接口 (你可以把这些也写在这里，或者在 admin-client 里另建一个)
 */
export const addHotel = (data) => request.post('/admin/hotel', data);