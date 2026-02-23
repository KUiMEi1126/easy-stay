import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message, Rate, Popconfirm } from 'antd';
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
      dataIndex: 'minPrice', 
      key: 'minPrice', 
      render: (text) => <span style={{ color: 'red', fontWeight: 'bold' }}>￥{text} 起</span> 
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
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
};

export default HotelList;