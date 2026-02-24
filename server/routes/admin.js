const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../utils/db');

// 获取所有酒店列表
router.get('/hotels', async (req, res) => {
  const db = await readDb();
  // 这里为了方便直接返回全部
  res.json(db.hotels);
});

// 获取单个酒店详情
router.get('/hotels/:id', async (req, res) => {
  const db = await readDb();
  const hotel = db.hotels.find(h => h.id === parseInt(req.params.id));
  if (hotel) {
    res.json(hotel);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// 更新状态 (审核通过/驳回/上下线)
// 前端请求示例: PATCH /api/admin/hotels/1 { status: 'approved', isOnline: false }
router.patch('/hotels/:id', async (req, res) => {
  const db = await readDb();
  const index = db.hotels.findIndex(h => h.id === parseInt(req.params.id));
  
  if (index !== -1) {
    // 获取前端传来的 status, isOnline, rejectReason
    const { status, isOnline, rejectReason } = req.body;

    const updatedHotel = { 
        ...db.hotels[index], 
        status: status !== undefined ? status : db.hotels[index].status,
        isOnline: isOnline !== undefined ? isOnline : db.hotels[index].isOnline,
        // 如果有驳回理由则更新，没有则保持原样或清空。这里简单处理为更新
        rejectReason: rejectReason || db.hotels[index].rejectReason 
    };

    db.hotels[index] = updatedHotel;
    await writeDb(db);
    res.json({ success: true, data: updatedHotel });
  } else {
    res.status(404).json({ success: false, message: 'Hotel not found' });
  }
});

module.exports = router;