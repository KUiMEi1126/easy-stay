import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message, Rate, Popconfirm, Radio, Card } from 'antd';
import { useNavigate } from 'react-router-dom'; // 1. 引入路由钩子
import request from '../utils/request';

// 1. 修改 Mock 数据
// 增加 isOnline 字段： true 代表上线(营业中), false 代表下线(未上线)
// Mock数据保持不变...
// const mockData = [
//   { id: 1, nameCn: '希尔顿大酒店', nameEn: 'Hilton', status: 'approved', isOnline: true, star: 5, minPrice: 800 },
//   { id: 2, nameCn: '汉庭快捷酒店', nameEn: 'Hanting', status: 'pending', isOnline: false, star: 3, minPrice: 200 },
// ];


const HotelList = () => {
  const [data, setData] = useState([]); // 初始为空数组
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. 获取 navigate 实例
   // 筛选状态 ('all' | 'pending' | 'online' | 'offline')
  const [filterType, setFilterType] = useState('all');

  // 跳转到详情页
  const handleDetail = (id) => {
    navigate(`/admin/hotel/${id}`);
  };
  
const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await request.get('/admin/hotels');
      //过滤掉已驳回的酒店，管理员列表就只显示 "待审核" 和 "已通过" 的
      const validHotels = res.filter(item => item.status !== 'rejected');
      setData(validHotels); // 后端直接返回数组
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHotels();
  }, []);

const handleToggleOnline = async (record) => {
    try {
      // 对应后端 PATCH /api/admin/hotels/:id
      await request.patch(`/admin/hotels/${record.id}`, {
        isOnline: !record.isOnline // 取反状态
      });
      message.success('状态更新成功');
      fetchHotels(); // 重新加载列表
    } catch (error) {
      // 错误处理由拦截器接管
    }
  };
 // 3. 核心逻辑：根据筛选状态计算要显示的数据
const getFilteredData = () => {
  switch (filterType) {
    case 'pending':
      // 筛选：未审核 (待审核)
      return data.filter(item => item.status === 'pending');
    case 'online':
      // 筛选：已上线 (审核通过 且 在线)
      return data.filter(item => item.status === 'approved' && item.isOnline);
    case 'offline':
      // 筛选：未上线 (审核通过 且 不在线)
      return data.filter(item => item.status === 'approved' && !item.isOnline);
    case 'all':
    default:
       // 显示全部
    return data;
  }
};

  // 表格列定义
  const columns = [
    { 
      title: '酒店名称', 
      key: 'name', 
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.nameCn}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.nameEn}</div>
        </div>
      )
    },
    { 
      title: '星级', 
      dataIndex: 'star', 
      key: 'star', 
      render: (star) => <Rate disabled defaultValue={star} style={{ fontSize: 12 }} /> 
    },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { 
      title: '起步价', 
      key: 'minPrice', 
      render: (_, record) => {
        // 获取房型数组，防止为 undefined
        const rooms = record.rooms || [];

        // 如果没有房型，显示提示
        if (rooms.length === 0) {
          return <span style={{ color: '#999', fontSize: 12 }}>暂无房型</span>;
        }

        // 提取所有价格并计算最小值
        // map 把 [{price:500}, {price:800}] 变成 [500, 800]
        const prices = rooms.map(r => Number(r.price)); 
        const minPrice = Math.min(...prices); // 使用 ES6 扩展运算符求最小值

        // 渲染
        return (
          <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
            ￥{minPrice} <span style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>起</span>
          </span>
        );
      }
    },
     {
        title: '状态',
        key: 'status',
        render: (_, record) => {
          if (record.status !== 'approved') return <Tag color="orange">待审核</Tag>;
          return record.isOnline ? <Tag color="green">营业中</Tag> : <Tag color="default">未上线</Tag>;
        },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* 这里只保留“详情”按钮，审核和上下线都去详情页做 */}
          <Button type="primary" size="small" onClick={() => handleDetail(record.id)}>
            管理 / 详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: '#fff' }}>
      <div style={{ marginBottom: 16 }}>
         <h2>酒店信息审核/管理</h2>
      </div>
       {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <span style={{ fontWeight: 'bold' }}>状态筛选：</span>
            <Radio.Group 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">全部酒店</Radio.Button>
              <Radio.Button value="pending">待审核</Radio.Button>
              <Radio.Button value="online">已上线 (营业中)</Radio.Button>
              <Radio.Button value="offline">未上线 (已下线)</Radio.Button>
            </Radio.Group>
          </Space>
          
          {/* 右侧放一个统计数字 */}
          <span style={{ color: '#888' }}>
            共找到 {getFilteredData().length} 家酒店
          </span>
        </div>
      </Card>
       <Table 
        dataSource={getFilteredData()} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
      />
    </div>
  );
};

export default HotelList;