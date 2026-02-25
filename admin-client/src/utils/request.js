import axios from 'axios';
import { message } from 'antd';

// 获取 API 地址（从环境变量或使用默认本地地址）
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 创建 axios 实例
const request = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 5000,
});

// 请求拦截器：自动带上用户 ID (模拟鉴权)
request.interceptors.request.use((config) => {
  // 从 localStorage 获取登录信息
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // 后端 merchant.js 需要这个 header 来识别是谁的酒店
    config.headers['x-user-id'] = user.id; 
  }
  return config;
});

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    message.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

export default request;