import React from 'react';
import { Card, Button, Form, Input, Select, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 注册提交逻辑：新增身份存储
  const onFinish = (values) => {
    const { username, password, confirmPassword, email, identity } = values;
    
    // 1. 校验两次密码一致
    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    // 2. 读取已注册的用户（localStorage 中 key 为 "registeredUsers"）
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // 3. 校验用户名是否已存在
    const isUsernameExist = existingUsers.some(user => user.username === username);
    if (isUsernameExist) {
      message.error('用户名已存在！请更换用户名');
      return;
    }

    // 4. 新增用户（包含身份信息）并写入 localStorage
    const newUser = { 
      username, 
      password, 
      email, 
      identity, // 新增：商户/管理员
      createTime: new Date().toLocaleString() 
    };
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // 5. 注册成功提示并跳转登录页
    message.success('注册成功！请登录');
    form.resetFields(); // 清空表单
    setTimeout(() => {
      navigate('/login');
    }, 1500);
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
            defaultValue="merchant"
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