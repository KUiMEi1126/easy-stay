import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Card, Descriptions, Button, Tag, Space, Rate, message, Popconfirm, Spin, Divider, Table, Image} from 'antd';
import { LeftOutlined, CheckCircleOutlined, CloseCircleOutlined, PoweroffOutlined, StarFilled } from '@ant-design/icons';

// 1. 模拟数据
const mockDatabase = [
  {
    id: 1,
    nameCn: "希尔顿大酒店",
    nameEn: "Hilton Hotel",
    address: "北京市朝阳区建国路88号",
    star: 5,
    openedAt: "2010-05-01",
    rating: 4.8,
    tags: ["免费停车", "健身房", "游泳池"],
    rooms: [
      { name: "标准大床房", price: 500, count: 10 },
      { name: "豪华海景房", price: 880, count: 5 },
      { name: "行政套房", price: 1200, count: 2 }
    ],
    images: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3"
    ],
    status: 'approved', // pending | approved | rejected
    isOnline: true      // true | false
  },
  {
    id: 2,
    nameCn: "汉庭快捷酒店",
    nameEn: "Hanting Hotel",
    address: "上海市浦东新区世纪大道1号",
    star: 3,
    openedAt: "2015-08-15",
    rating: 4.2,
    tags: ["免费早餐", "近地铁"],
    rooms: [
      { name: "单人房", price: 200, count: 20 },
      { name: "双床房", price: 280, count: 15 }
    ],
    status: 'pending', 
    isOnline: false    
  }
];

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  // 模拟请求
  useEffect(() => {
    setLoading(true);
    // 实际项目中：axios.get(`/api/hotel/${id}`)
    setTimeout(() => {
      const target = mockDatabase.find(h => h.id === parseInt(id));
      setDetail(target);
      setLoading(false);
    }, 500);
  }, [id]);

  // 操作逻辑保持不变
  const handleApprove = () => {
    message.success('审核已通过！');
    setDetail({ ...detail, status: 'approved', isOnline: false });
  };

  const handleReject = () => {
    message.error('已驳回该申请');
    setDetail({ ...detail, status: 'rejected' });
  };

  const handleToggleOnline = () => {
    const targetStatus = !detail.isOnline;
    message.success(targetStatus ? '上线成功' : '下线成功');
    setDetail({ ...detail, isOnline: targetStatus });
  };

  if (loading) return <Spin style={{ margin: '50px auto', display: 'block' }} />;
  if (!detail) return <div>未找到该酒店信息</div>;

  // 2. 定义房型表格的列 (针对 rooms 数组)
  const roomColumns = [
    { title: '房型名称', dataIndex: 'name', key: 'name' },
    { 
      title: '价格 (元)', 
      dataIndex: 'price', 
      key: 'price',
      render: (text) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>¥ {text}</span>
    },
    { 
      title: '剩余房量', 
      dataIndex: 'count', 
      key: 'count',
      render: (text) => text < 5 ? <span style={{ color: 'red' }}>{text} (紧张)</span> : text
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      
      {/* 顶部导航 */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>返回列表</Button>
      </div>

      <Card 
        // 头部显示中文名和状态
        title={
          <Space>
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>{detail.nameCn}</span>
            <span style={{ fontSize: 14, color: '#888' }}>({detail.nameEn})</span>
          </Space>
        }
        extra={
            <Space>
                {detail.status === 'pending' && <Tag color="orange">待审核</Tag>}
                {detail.status === 'rejected' && <Tag color="red">已驳回</Tag>}
                {detail.status === 'approved' && detail.isOnline && <Tag color="green">营业中</Tag>}
                {detail.status === 'approved' && !detail.isOnline && <Tag color="default">已下线</Tag>}
            </Space>
        }
      >
        {/* 3. 基础信息展示区 */}
        <Descriptions bordered column={2}>
          <Descriptions.Item label="酒店地址" span={2}>{detail.address}</Descriptions.Item>
          
          <Descriptions.Item label="酒店星级">
            <Rate disabled value={detail.star} style={{ fontSize: 16 }} />
          </Descriptions.Item>
          
          <Descriptions.Item label="用户评分">
            <Space>
              <StarFilled style={{ color: '#fadb14' }} />
              <span style={{ fontWeight: 'bold' }}>{detail.rating} 分</span>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="开业时间">{detail.openedAt}</Descriptions.Item>
          
          {/* 标签数组展示 */}
          <Descriptions.Item label="特色标签">
            {detail.tags && detail.tags.map(tag => (
              <Tag color="blue" key={tag}>{tag}</Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>
          {/* ============ 新增：图片展示区域 ============ */}
        <Divider orientation="left">酒店图册</Divider>
        {detail.images && detail.images.length > 0 ? (
          <Image.PreviewGroup>
            <Space size="middle" wrap>
              {detail.images.map((imgUrl, index) => (
                <Image
                  key={index}
                  width={150}
                  height={100}
                  src={imgUrl}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  placeholder={<Spin />} // 加载占位
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          <div style={{ color: '#999' }}>暂无上传图片</div>
        )}
        {/* ========================================= */}
        <Divider orientation="left">房型列表</Divider>

        {/* 4. 房型列表展示区 (Table) */}
        <Table 
          columns={roomColumns} 
          dataSource={detail.rooms} 
          rowKey="name" // 这里假设房型名称不重复，或者你可以用 index
          pagination={false} 
          bordered
          size="small"
        />

        <Divider />

        {/* 5. 底部操作栏 (逻辑不变) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          
          {detail.status === 'pending' && (
            <>
              <Button danger onClick={handleReject} icon={<CloseCircleOutlined />}>驳回申请</Button>
              <Popconfirm title="确认通过审核？" onConfirm={handleApprove}>
                <Button type="primary" icon={<CheckCircleOutlined />}>通过审核</Button>
              </Popconfirm>
            </>
          )}

          {detail.status === 'approved' && (
             <>
               {detail.isOnline ? (
                 <Popconfirm title="确定下线？" onConfirm={handleToggleOnline}>
                    <Button danger icon={<PoweroffOutlined />}>下线酒店</Button>
                 </Popconfirm>
               ) : (
                 <Button type="primary" style={{ backgroundColor: '#52c41a' }} onClick={handleToggleOnline} icon={<PoweroffOutlined />}>
                    立即上线
                 </Button>
               )}
             </>
          )}
        </div>

      </Card>
    </div>
  );
};

export default HotelDetail;