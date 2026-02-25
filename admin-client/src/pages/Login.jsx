import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Input, Checkbox, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // 记住我勾选状态（解决表单联动问题）
  const [rememberChecked, setRememberChecked] = useState(true);

  // 登录核心逻辑：校验账号+密码+身份，按身份跳转
  const onFinish = async (values) => {
    const { username, password, remember } = values;

    try {
      const resp = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        message.error(data.message || '用户名或密码错误！');
        return;
      }

      const matchedUser = data.user;
      const identityText = matchedUser.identity === 'admin' ? '管理员' : '商户';
      message.success(`登录成功！欢迎${identityText}：${username}`);

      localStorage.setItem('token', 'real-token-' + username);
      localStorage.setItem('lastLoginUsername', username);
      localStorage.setItem('currentUserIdentity', matchedUser.identity);

      if (matchedUser.id != null) {
        localStorage.setItem('userId', matchedUser.id);
      }

      // 新增：将完整用户对象序列化保存在 localStorage.user
      // 这样 request 拦截器就可以读取并把 user.id 放在请求头中
      localStorage.setItem('user', JSON.stringify(matchedUser));

      // 记住我逻辑（仍保存在 localStorage，但用户数据来自服务端）
      const rememberedUserInfo = JSON.parse(localStorage.getItem('rememberedUserInfo')) || {};
      if (remember) {
        rememberedUserInfo[username] = {
          password,
          remember: true,
          identity: matchedUser.identity
        };
      } else {
        if (rememberedUserInfo[username]) delete rememberedUserInfo[username];
      }
      localStorage.setItem('rememberedUserInfo', JSON.stringify(rememberedUserInfo));

      navigate('/admin/dashboard');

      // if (matchedUser.identity === 'admin') {
      //   navigate('/admin/hotels');
      // } else {
      //   navigate('/admin/my-hotel');
      // }
    } catch (err) {
      message.error('登录失败：' + err.message);
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
    <div className="login-page">
      <div className="login-card-wrapper">
        <div className="login-top-image">
          <img
            src="/login-title.png"
            alt="title"
            className="login-top-img"
            onLoad={(e) => { const fb = e.currentTarget.nextSibling; if (fb) fb.style.display = 'none'; }}
            onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextSibling; if (fb) fb.style.display = 'flex'; }}
          />
          <div className="login-fallback" style={{ display: 'none' }}>🏨</div>
        </div>
        <Card title="登录" className="login-card" bordered={false}>
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
    </div>
  );
};

export default Login;