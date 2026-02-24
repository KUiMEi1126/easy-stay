import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Rate,
  Empty,
  Spin,
  Alert,
  Table,
  Divider,
  Image,
} from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

// 商户查看自己的酒店信息
const MerchantHotelView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 请求后端，header 里会自动带上 x-user-id
        const res = await request.get('/merchant/my-hotel');
        setHotel(res); // 如果后端返回 null，这里就是 null
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 跳转去编辑/创建页
  const handleEdit = () => {
    navigate('/admin/hotel-edit');
  };

  if (loading)
    return <Spin style={{ margin: '50px auto', display: 'block' }} />;

  // 场景A：没有数据 -> 显示空状态
  if (!hotel) {
    return (
      <Card style={{ marginTop: 20 }}>
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 60 }}
          description={
            <span>您还没有录入酒店信息，无法营业。</span>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleEdit}
          >
            立即录入酒店信息
          </Button>
        </Empty>
      </Card>
    );
  }

  // 场景B：有数据 -> 显示详情
  return (
    <div style={{ padding: 24 }}>
      {/* 顶部状态提示栏 */}
      <div style={{ marginBottom: 16 }}>
        {hotel.status === 'pending' && (
          <Alert
            message="审核中"
            description="您的酒店信息正在审核中，审核通过后方可上线。"
            type="warning"
            showIcon
          />
        )}
        {hotel.status === 'rejected' && (
          <Alert
            message="审核未通过"
            description={
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  驳回原因：{hotel.rejectReason || '无详细理由'}
                </div>
                <div style={{ marginTop: 8 }}>
                  请点击右侧“修改信息”按钮，完善信息后重新提交。
                </div>
              </div>
            }
            type="error"
            showIcon
          />
        )}
        {hotel.status === 'approved' && hotel.isOnline && (
          <Alert
            message="营业中"
            description="您的酒店正在正常营业。"
            type="success"
            showIcon
          />
        )}
        {hotel.status === 'approved' && !hotel.isOnline && (
          <Alert
            message="已下线"
            description="酒店已下线，如需上线请联系管理员。"
            type="info"
            showIcon
          />
        )}
      </div>

      <Card
        title="我的酒店信息"
        // 商户点击修改信息后，进入 Edit 页，重新提交会自动把 status 改回 pending
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/admin/hotel-edit')}
          >
            修改信息
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="中文名称">
            {hotel.nameCn}
          </Descriptions.Item>
          <Descriptions.Item label="英文名称">
            {hotel.nameEn}
          </Descriptions.Item>
          <Descriptions.Item label="星级">
            <Rate disabled value={hotel.star} />
          </Descriptions.Item>
          <Descriptions.Item label="开业时间">
            {hotel.openedAt}
          </Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {hotel.address}
          </Descriptions.Item>
          <Descriptions.Item label="标签" span={2}>
            {hotel.tags &&
              hotel.tags.map((t) => (
                <Tag key={t} color="blue">
                  {t}
                </Tag>
              ))}
          </Descriptions.Item>
        </Descriptions>

        {/* 图片展示区域 */}
        <Divider orientation="left">酒店图册</Divider>

        {hotel.images && hotel.images.length > 0 ? (
          <Image.PreviewGroup>
            <Space size="middle" wrap>
              {hotel.images.map((url, index) => (
                <Image
                  key={index}
                  width={120}
                  height={90}
                  src={url}
                  style={{
                    objectFit: 'cover',
                    borderRadius: 4,
                    border: '1px solid #f0f0f0',
                  }}
                  placeholder={<Spin />} // 加载占位
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          <div
            style={{ color: '#999', paddingLeft: 12 }}
          >
            暂无上传图片，请点击右上角“修改信息”进行上传。
          </div>
        )}

        {/* 房型列表区域 */}
        <h3 style={{ marginTop: 20 }}>房型列表</h3>
        <Table
          dataSource={hotel.rooms}
          rowKey="name"
          pagination={false}
          columns={[
            { title: '房型', dataIndex: 'name' },
            {
              title: '价格',
              dataIndex: 'price',
              render: (t) => `¥${t}`,
            },
            { title: '数量', dataIndex: 'count' },
          ]}
        />
      </Card>
    </div>
  );
};

export default MerchantHotelView;