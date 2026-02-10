import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message, Rate } from 'antd';

// 假数据 (Mock Data)，等后端好了再换成 fetch 请求
const mockData = [
  { 
    id: 1, 
    nameCn: '希尔顿大酒店', 
    nameEn: 'Hilton Hotel', 
    address: '北京市朝阳区', 
    star: 5, 
    openedAt: '2010-05-01',
    status: 'approved',
    // 列表页通常不需要展示所有房型，展示一个最低价即可
    minPrice: 800 
  },
];

const HotelList = () => {
  const [data, setData] = useState(mockData);

  // 表格列定义
  const columns = [
    { 
      title: '酒店名称', 
      key: 'name', 
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
    { title: '开业时间', dataIndex: 'openedAt', key: 'openedAt' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true }, // ellipsis 超长省略
    { 
      title: '起步价', 
      dataIndex: 'minPrice', 
      key: 'minPrice', 
      render: (text) => <span style={{ color: 'red', fontWeight: 'bold' }}>￥{text} 起</span> 
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'approved' ? 'green' : 'orange';
        let text = status === 'approved' ? '已发布' : '待审核';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          {record.status === 'pending' && (
             <Button type="primary" size="small" onClick={() => handleApprove(record.id)}>通过审核</Button>
          )}
          <Button type="link" danger onClick={() => handleDelete(record.id)}>下线</Button>
        </Space>
      ),
    },
  ];

  // 模拟操作函数
  const handleApprove = (id) => {
    // 这里将来要写 axios.post(...)
    message.success('审核通过！');
    // 更新本地状态，让页面变化
    setData(data.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认下线吗？',
      onOk: () => {
        setData(data.filter(item => item.id !== id));
        message.success('已下线');
      }
    });
  };
  
  const handleEdit = (record) => {
      message.info(`跳转到编辑页: ${record.name}`);
      // navigate('/admin/hotel-edit') 并带上参数
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
         <h2>酒店信息审核/管理</h2>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default HotelList;