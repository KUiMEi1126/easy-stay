import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Card, Descriptions, Button, Tag, Space, Rate, message, Popconfirm, Spin, Divider, Table, Image, Modal, Input} from 'antd';
import { LeftOutlined, CheckCircleOutlined, CloseCircleOutlined, PoweroffOutlined, StarFilled } from '@ant-design/icons';
import request from '../utils/request';

const { TextArea } = Input;//文本域

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  //驳回弹窗
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 1. 获取详情
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await request.get(`/admin/hotels/${id}`);
        setDetail(res);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 2. 通用状态更新函数 (审核/上下线都用这个)
  const updateStatus = async (payload) => {
    try {
      await request.patch(`/admin/hotels/${id}`, payload);
      message.success('操作成功');
      // 刷新最新数据
      const res = await request.get(`/admin/hotels/${id}`);
      setDetail(res);
    } catch (error) {
      console.error(error);
    }
  };

  // 操作逻辑
  const handleApprove = () => updateStatus({ status: 'approved', isOnline: false });
  const handleReject = () => updateStatus({ status: 'rejected' });
  const handleToggleOnline = () => updateStatus({ isOnline: !detail.isOnline });
  // 处理驳回逻辑
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      return message.warning('请输入驳回理由');
    }

    try {
      // 发送请求：状态改为 rejected，并附带理由
      await request.patch(`/admin/hotels/${id}`, { 
        status: 'rejected',
        rejectReason: rejectReason 
      });
      
      message.success('已驳回申请');
      setIsRejectModalOpen(false); // 关闭弹窗
      navigate('/admin/hotels');   // 因为设定上驳回后列表就不显示了，直接跳回列表页即可
    } catch (error) {
      console.error(error);
    }
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
              <Button danger onClick={() => setIsRejectModalOpen(true)} icon={<CloseCircleOutlined />}>
                驳回申请
              </Button>

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

       <Modal
        title="驳回申请"
        open={isRejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }} // 让确认按钮变红，警示作用
      >
        <p>请填写驳回理由，以便商户修改：</p>
        <TextArea 
          rows={4} 
          placeholder="例如：图片不清晰，数据填写存在反常..." 
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default HotelDetail;