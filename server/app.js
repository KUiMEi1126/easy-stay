// server/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// 允许跨域 (让前端3001端口能访问后端3000端口)
app.use(cors());
// 解析 JSON 数据
app.use(bodyParser.json());

// 测试接口
app.get('/', (req, res) => {
  res.send('Hello Hotel System Backend!');
});

// 引入路由 (建议后期拆分，前期可以直接写在这里)
// const hotelRoutes = require('./routes/hotel');
// app.use('/api/hotels', hotelRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});