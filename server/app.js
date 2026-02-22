const express = require('express');
const cors = require('cors');
const app = express();
const hotelRouter = require('./routes/hotel');

app.use(cors()); // 允许前端访问
app.use(express.json()); // 解析 JSON 请求体

// 挂载路由
app.use('/api/hotel', hotelRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`后端服务已启动: http://localhost:${PORT}`);
});