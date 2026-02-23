const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../utils/db');

// 1. 获取所有酒店列表
router.get('/hotels', async (req, res) => {
  const db = await readDb();
  // 真实项目中这里应该做分页，这里直接返回全部
  res.json(db.hotels);
});

// 2. 获取单个酒店详情
router.get('/hotels/:id', async (req, res) => {
  const db = await readDb();
  const hotel = db.hotels.find(h => h.id === parseInt(req.params.id));
  if (hotel) {
    res.json(hotel);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// 3. 更新状态 (审核通过/驳回/上下线)
// 前端请求示例: PATCH /api/admin/hotels/1 { status: 'approved', isOnline: false }
router.patch('/hotels/:id', async (req, res) => {
  const db = await readDb();
  const index = db.hotels.findIndex(h => h.id === parseInt(req.params.id));
  
  if (index !== -1) {
    // 这里的 req.body 包含 { status: '...', isOnline: ... }
    const updatedHotel = { ...db.hotels[index], ...req.body };
    db.hotels[index] = updatedHotel;
    await writeDb(db);
    res.json({ success: true, data: updatedHotel });
  } else {
    res.status(404).json({ success: false, message: 'Hotel not found' });
  }
});

module.exports = router;