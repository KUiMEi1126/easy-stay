import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Input, Checkbox, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // 记住我勾选状态（解决表单联动问题）
  const [rememberChecked, setRememberChecked] = useState(true);

  // 登录核心逻辑：校验账号+密码+身份，按身份跳转
  const onFinish = (values) => {
    const { username, password, remember } = values;
    console.log('登录输入:', values);

    // 1. 读取localStorage中所有注册用户
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // 2. 校验用户名+密码是否匹配（匹配时会拿到用户的身份信息）
    const matchedUser = registeredUsers.find(
      user => user.username === username && user.password === password
    );

    if (matchedUser) {
      // 3. 登录成功：保存状态 + 记录当前用户身份
      const identityText = matchedUser.identity === 'admin' ? '管理员' : '商户';
      message.success(`登录成功！欢迎${identityText}：${username}`);
      
      // 保存登录态（供后台布局判断身份）
      localStorage.setItem('token', 'real-token-' + username); 
      localStorage.setItem('lastLoginUsername', username);
      localStorage.setItem('currentUserIdentity', matchedUser.identity);

      // 4. 处理“记住我”逻辑（包含身份信息）
      const rememberedUserInfo = JSON.parse(localStorage.getItem('rememberedUserInfo')) || {};
      if (remember) {
        rememberedUserInfo[username] = { 
          password, 
          remember: true, 
          identity: matchedUser.identity 
        };
      } else {
        // 取消记住我：删除该用户的缓存
        if (rememberedUserInfo[username]) {
          delete rememberedUserInfo[username];
        }
      }
      localStorage.setItem('rememberedUserInfo', JSON.stringify(rememberedUserInfo));

      // 5. 按身份跳转（核心：管理员→HotelList，商户→HotelEdit）
      if (matchedUser.identity === 'admin') {
        navigate('/admin/hotels'); // 管理员跳酒店列表（HotelList.jsx）
      } else {
        navigate('/admin/hotel-edit'); // 商户跳酒店编辑（HotelEdit.jsx）
      }
    } else {
      // 6. 登录失败提示
      message.error('用户名或密码错误！');
    }
  };

  // 监听用户名变化：切换账号时自动适配“记住我”状态
  const handleUsernameChange = (username) => {
    if (!username) return;
    const rememberedUserInfo = JSON.parse(localStorage.getItem('rememberedUserInfo')) || {};
    const userRememberInfo = rememberedUserInfo[username];
    
    // 清空密码，避免残留
    form.setFieldsValue({ password: '' });
    
    if (userRememberInfo) {
      // 该账号勾选过记住我：自动填充密码 + 勾选
      form.setFieldsValue({ 
        password: userRememberInfo.password,
        remember: true 
      });
      setRememberChecked(true);
    } else {
      // 未勾选记住我：仅清空密码 + 取消勾选
      form.setFieldsValue({ remember: false });
      setRememberChecked(false);
    }
  };

  // 页面加载时：自动填充上一次登录的账号（含密码/记住我状态）
  useEffect(() => {
    const lastLoginUsername = localStorage.getItem('lastLoginUsername');
    if (lastLoginUsername) {
      // 填充用户名
      form.setFieldsValue({ username: lastLoginUsername });
      
      // 读取该账号的记住我信息
      const rememberedUserInfo = JSON.parse(localStorage.getItem('rememberedUserInfo')) || {};
      const userRememberInfo = rememberedUserInfo[lastLoginUsername];
      
      if (userRememberInfo) {
        // 曾勾选记住我：填充密码 + 勾选
        form.setFieldsValue({ 
          password: userRememberInfo.password,
          remember: true 
        });
        setRememberChecked(true);
      } else {
        // 未勾选记住我：仅填账号，不填密码
        form.setFieldsValue({ 
          password: '',
          remember: false 
        });
        setRememberChecked(false);
      }
    }
  }, []);

  // 跳转到注册页
  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="酒店管理系统登录" style={{ width: 400 }} bordered={false}>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: rememberChecked }}
          onFinish={onFinish}
          // 监听表单值变化，同步状态
          onValuesChange={(changedValues) => {
            if ('remember' in changedValues) {
              setRememberChecked(changedValues.remember);
            }
            if ('username' in changedValues) {
              handleUsernameChange(changedValues.username);
            }
          }}
        >
          {/* 用户名输入框（自动填充上一次登录账号） */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
          </Form.Item>

          {/* 密码输入框（根据记住我状态自动填充） */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码"
            />
          </Form.Item>

          {/* 记住我复选框（同步勾选状态） */}
          <Form.Item>
            <Form.Item 
              name="remember" 
              valuePropName="checked" 
              noStyle
            >
              <Checkbox checked={rememberChecked} onChange={(e) => setRememberChecked(e.target.checked)}>
                记住我
              </Checkbox>
            </Form.Item>
          </Form.Item>

          {/* 登录 + 注册按钮组（布局对称） */}
          <Form.Item>
            <Space direction="horizontal" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                登录
              </Button>
              <Button type="default" onClick={handleRegister} style={{ flex: 1 }}>
                注册
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;