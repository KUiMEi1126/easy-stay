import React from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const HotelEdit = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('提交的数据:', values);
    // 这里将来写: axios.post('/api/hotels', values)
    message.success('保存成功！');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>录入/编辑酒店信息</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="酒店名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="例如：北京万豪酒店" />
        </Form.Item>

        <Form.Item label="酒店地址" name="address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="基础价格" name="price" rules={[{ required: true }]}>
          <InputNumber prefix="￥" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="星级" name="star">
           <Select>
              <Select.Option value={3}>三星级</Select.Option>
              <Select.Option value={4}>四星级</Select.Option>
              <Select.Option value={5}>五星级</Select.Option>
           </Select>
        </Form.Item>
        
        <Form.Item label="酒店图片">
            <Upload listType="picture-card">
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传</div></div>
            </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">保存并发布</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HotelEdit;