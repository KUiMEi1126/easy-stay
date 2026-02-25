🏨 Easy Stay 酒店管理系统
一个集管理员后台、商户管理端与移动端展示于一体的全栈酒店管理解决方案。

📖 项目概述
Easy Stay 是专为酒店行业设计的数字化管理平台。项目模拟了真实的 OTA（在线旅游）业务流程，涵盖了从商户入驻、酒店信息审核到移动端展示的完整链路。

📱 三端架构
管理后台 (admin-client)：供管理员与商户使用。管理员负责全站审核与上下线控制，商户负责自身酒店信息的维护。
移动端展示 (mobile-client)：为最终用户提供流畅的酒店浏览与信息查询体验。
服务端 (server)：基于 Express 的 RESTful API，提供鉴权、数据持久化及静态资源托管。

✨ 核心特性与实现
多角色权限系统：基于 localStorage 动态鉴权，区分管理员（Admin）与商户（Merchant）视角。
自动化资源管理：集成 Multer 实现图片上传，支持酒店门面图的云端/本地化存储与托管。
响应式 UI 设计：
后台使用 Ant Design，强调高效的表格数据处理与表单校验。
移动端使用 antd-mobile，优化触屏交互体验。
SPA 部署优化：后端 server 具备静态托管能力，并完美支持前端单页路由的回退（Fallback）机制。

🛠️ 技术栈
层次	        技术选型
前端框架	    React 18 + Vite
UI 组件库	    Ant Design (PC) / antd-mobile (H5)
后端运行环境	 Node.js + Express
数据存储	    本地 JSON 数据库
路由/状态	    React Router 6
🚀 快速启动
1. 克隆与环境配置
确保已安装 Node.js (推荐 v16.x 或以上版本)。

2. 启动后端 API
Bash
cd server
npm install
node app.js
# 默认端口: 3000
3. 启动前端（管理后台 & 移动端）
管理后台：

Bash
cd admin-client
npm install
npm run dev
移动端演示：

Bash
cd mobile-client
npm install
npm run dev
📂 核心逻辑说明
🔐 身份验证流程
文件路径：admin-client/src/pages/Login.jsx & Register.jsx

实现逻辑：

前端进行表单原子级校验（非空、格式、密码一致性）。
调用 /api/user/login 接口，后端验证后返回 Session Token。
前端通过 localStorage 持久化存储用户信息，并由 App.jsx 中的 Private Route 拦截器实现登录守卫。

📂 目录结构
Plaintext
Easy-Stay/
├── admin-client/    # React + AntD (管理端)
├── mobile-client/   # React + antd-mobile (用户端)
├── server/          # Express 入口及 API 路由
│   ├── routes/      # 模块化路由 (User/Hotel/Upload)
│   ├── public/      # 静态资源 (酒店图片等)
│   └── db.json      # 模拟数据库
└── doc/             # 实训报告与接口文档
👥 团队分工
成员	职责描述	核心交付物
[王宇航]    PC站点管理员、商户端的完整实现
            编写 POST /api/admin/hotel (新增/修改)和 PATCH /api/admin/hotel/status（审核状态）接口
            设计数据库中的 Hotel 和Room表
[李颜铭]    酒店列表页面的完整实现，酒店详情页面的完整实现
            编写GET/api/hotels接口（支持分页查询、筛选参数）
            编写GET /api/hotels/:id 接口(获取详情）
            服务器的搭建
[樊昱天]	PC端的登录/注册页面
            编写 POST /api/login 和 POST /api/register 接口 设计数据库中的User 表
⚠️ 开发注意事项
安全性：本项目为教学实训性质，Token 存储于 localStorage。在生产环境下建议切换为 HttpOnly Cookie。

文件权限：在部署环境需确保 server/public/uploads 目录具有写权限，否则图片上传会失败。