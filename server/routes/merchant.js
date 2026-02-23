const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../utils/db');

// 中间件：实际项目中需要验证 token 获取 userId，这里简化，假设 userId 放在 header 里
// 或者你可以写死一个 userId = 2 来测试
const getUserId = (req) => {
  // 简单模拟：前端 header 传 { 'x-user-id': 2 }
  return parseInt(req.headers['x-user-id']) || 2; 
};

// 1. 查看我的酒店
router.get('/my-hotel', async (req, res) => {
  const userId = getUserId(req);
  const db = await readDb();
  
  // 查找 ownerId 匹配的酒店
  const myHotel = db.hotels.find(h => h.ownerId === userId);
  res.json(myHotel || null); // 如果没有则返回 null
});

// 2. 创建或更新酒店信息
router.post('/hotel-edit', async (req, res) => {
  const userId = getUserId(req);
  const formData = req.body;
  const db = await readDb();
  
  const index = db.hotels.findIndex(h => h.ownerId === userId);
  
  if (index !== -1) {
    // --- 更新逻辑 ---
    // 注意：更新时，不能把 status 和 isOnline 覆盖掉，因为那是管理员控制的
    // 如果商户修改了关键信息，通常逻辑是重置为 pending 让管理员重新审核
    // 这里简单处理：保留原有的 status，只更新信息
    const oldData = db.hotels[index];
    db.hotels[index] = {
      ...oldData,
      ...formData,
      status: 'pending', // 每次修改后，重置为待审核
      isOnline: false    // 并且下线
    };
  } else {
    // --- 创建逻辑 ---
    const newHotel = {
      id: Date.now(), // 生成随机ID
      ownerId: userId,
      ...formData,
      status: 'pending',
      isOnline: false,
      rating: 5.0, // 初始评分
      images: formData.images || []
    };
    db.hotels.push(newHotel);
  }
  
  await writeDb(db);
  res.json({ success: true });
});

module.exports = router;