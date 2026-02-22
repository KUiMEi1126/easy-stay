import React from 'react';
import { Card, Button, Form, Input, Select, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 注册提交逻辑：新增身份存储
  const onFinish = async (values) => {
    const { username, password, confirmPassword, email, identity } = values;

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    try {
      const resp = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, identity })
      });
      const data = await resp.json();
      if (!resp.ok) {
        message.error(data.message || '注册失败');
        return;
      }

      message.success('注册成功！请登录');
      form.resetFields();
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      message.error('注册失败：' + err.message);
    }
  };

  // 返回登录页
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="酒店管理系统注册" style={{ width: 400 }} bordered={false}>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {/* 用户名（仅必填，无长度限制） */}
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          {/* 密码（至少6位） */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>
          

          {/* 邮箱 */}
          {/* <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item> */}

           {/* 新增：身份选择 */}
          <Form.Item
          name="identity"
          label="身份"
          rules={[{ required: true, message: '请选择身份!' }]}
        >
          <Select 
            placeholder="请选择身份" 
            //defaultValue="merchant"
            // 去掉 prefix 属性（v5+ 废弃），如需图标用 renderOption 或 addonBefore
            style={{ width: '100%' }} // 加宽度保证布局美观
          >
            {/* 用 Select.Option 替代单独解构的 Option */}
            <Select.Option value="merchant">商户</Select.Option>
            <Select.Option value="admin">管理员</Select.Option>
          </Select>
        </Form.Item>

          {/* 注册+返回按钮组 */}
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Space direction="horizontal" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                注册
              </Button>
              <Button type="default" onClick={handleBackToLogin} style={{ flex: 1 }}>
                返回登录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;