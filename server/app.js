const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());

// 注册 API 路由（假设存在 routes/user.js）
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

// 仅在 admin-client 已 build 时静态托管并做 SPA 回退
const distPath = path.join(__dirname, '..', 'admin-client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // 未构建前端时，提供根路径用于快速检测 API 是否可达，避免浏览器误打开后端出现 "Cannot GET /"
  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'API running' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`server run on ${PORT}`));