import React from 'react';
import locale from 'antd/locale/zh_CN';
import { Form, Input, Button, DatePicker, Rate, Space, Card, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const HotelEdit = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // values.openedAt 是 moment 对象，需要转成字符串
    const submitData = {
      ...values,
      openedAt: values.openedAt ? values.openedAt.format('YYYY-MM-DD') : '',
    };
    console.log('提交给后端的数据:', submitData);
    message.success('保存成功！请看控制台数据结构');
  };

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <h2>酒店信息录入</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ star: 3 }}>
        
        {/* 1. 基础信息区 */}
        <Card title="基础信息" bordered={false}>
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item label="酒店中文名" 
              name="nameCn" 
              rules={[
                { 
                  required: true, 
                  message: '该项为必填项'
                }
              ]}
            >
              <Input placeholder="例如：希尔顿酒店" style={{ width: 300 }} />
            </Form.Item>
            <Form.Item label="酒店英文名" 
              name="nameEn" 
              rules={[
                { 
                  required: true, 
                  message: '该项为必填项'
                }
              ]}
            >
              <Input placeholder="E.g. Hilton Hotel" style={{ width: 300 }} />
            </Form.Item>
          </Space>

          <Form.Item label="详细地址" 
            name="address" 
            rules={[
                { 
                  required: true, 
                  message: '该项为必填项'
                }
              ]}
            >
            <Input placeholder="例如：北京市朝阳区xx街道xx号" />
          </Form.Item>

          <Space size="large">
            <Form.Item label="星级" name="star">
              <Rate />
            </Form.Item>
            <Form.Item label="开业时间" 
              name="openedAt" 
              rules={[
                  { 
                    required: true, 
                    message: '该项为必填项'
                  }
               ]}
              >
              <DatePicker placeholder="请选择日期" />
            </Form.Item>
          </Space>
        </Card>

        {/* 2. 房型管理区 (动态表单 ) */}
        <Card title="房型与价格管理" bordered={false} style={{ marginTop: 20 }}>
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '输入房型' }]}
                    >
                      <Input placeholder="房型名称 (如: 标准间)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: '输入价格' }]}
                    >
                      <Input prefix="￥" placeholder="价格" type="number" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加一种房型
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item style={{ marginTop: 20 }}>
          <Button type="primary" htmlType="submit" size="large">保存并发布</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HotelEdit;