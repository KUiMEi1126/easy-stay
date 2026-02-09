import React from 'react';
import { Card, Button, Form, Input, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); // 路由跳转钩子

  const onFinish = (values) => {
    console.log('用户输入:', values);
    
    // 模拟登录逻辑
    // 1. 假设账号密码是对的
    if (values.username === 'admin' || values.username === 'user') {
        message.success('登录成功！');
        
        // 2. 模拟保存 Token (以后这里存真的 Token)
        localStorage.setItem('token', 'fake-token-123456');

        // 3. 跳转到后台首页
        navigate('/admin'); 
    } else {
        // 如果想演示登录失败
        // message.error('账号或密码错误');
        // 为了方便调试，我们这里暂时强制跳转：
        navigate('/admin');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5' // 浅灰色背景
    }}>
      <Card title="酒店管理系统登录" style={{ width: 400 }} bordered={false}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名 (随便填)" />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码 (随便填)" />
          </Form.Item>

          {/* 记住我 */}
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;