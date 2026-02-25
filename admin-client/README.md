# 管理端 (admin-client)

本目录为 Easy Stay 项目的管理后台前端，基于 React + Vite + Ant Design 实现，包含管理员与商户端的管理视图、登录/注册页与酒店管理相关页面。

## 快速启动
1. 安装依赖：

```bash
cd admin-client
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 打包构建：

```bash
npm run build
```

构建生成的 `dist` 目录可拷贝到后端 `server` 下（`server` 会在启动时静态托管该目录），以实现单体部署。

## 主要脚本
- `dev`：使用 Vite 启动开发服务器（支持热更新）
- `build`：构建生产包到 `dist`
- `preview`：本地预览构建产物

## 关键页面与文件
- 登录页：`src/pages/Login.jsx`（实现登录表单、记住我、会话存储与跳转）
- 注册页：`src/pages/Register.jsx`（实现注册表单、密码确认及身份选择）
- 路由配置：`src/App.jsx`（路由与简单的私有路由守卫，决定未登录时跳转到 `/login`）
- 主布局：`src/components/AdminLayout.jsx`（侧边栏、顶部导航与路由出口）

## 注意事项与建议
- 当前登录示例将最小会话信息（示例 token、身份）保存在 `localStorage`，仅用于演示与本地开发。生产环境请使用更安全的认证方案（如后端签发的 JWT 且通过 HttpOnly cookie 存储）。
- 请避免在持久化存储中保存明文密码；“记住我”功能在当前实现中演示了前端保存密码的做法，但建议改为仅保存用户名并使用令牌登录或托管凭证。

## 贡献与调试
- 开发时可通过浏览器控制台查看前端请求日志，所用后端接口在 `server/routes/` 中定义（如 `user.js`、`hotel.js` 等）。
- 若需对接真实后端或更改 API 路径，请同步修改 `src/utils/request.js` 或相应的 fetch/axios 调用。

如需我将 README 内容同步到英文版或加入更详细的 API 文档、Dockerfile 与部署脚本，告诉我下一步的优先项。
