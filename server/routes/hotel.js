const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 封装一个读取 db.json 的助手函数
const getDbData = () => {
    const data = fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8');
    return JSON.parse(data);
};

// 1. 获取酒店列表接口 (GET /api/hotel)
router.get('/', (req, res) => {
    try {
        const db = getDbData();
        let list = [...db.hotels]; // 假设 db.json 里有一个 hotels 数组

        // --- 排序逻辑 ---
        const { sort, star } = req.query;
        
        // 按星级筛选
        if (star) {
            list = list.filter(h => h.star === parseInt(star));
        }

        // 按价格排序 (房型中的最低价)
        if (sort === 'price_asc') {
            list.sort((a, b) => a.rooms[0].price - b.rooms[0].price);
        } else if (sort === 'rating_desc') {
            list.sort((a, b) => b.rating - a.rating);
        }

        // --- 分页逻辑 (长列表优化的后端支持) ---
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const total = list.length;
        const pagedList = list.slice((page - 1) * pageSize, page * pageSize);

        res.json({
            success: true,
            data: pagedList,
            total: total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

// 2. 获取酒店详情接口 (GET /api/hotel/:id)
router.get('/:id', (req, res) => {
    const db = getDbData();
    const hotel = db.hotels.find(h => h.id === parseInt(req.params.id));
    if (hotel) {
        res.json({ success: true, data: hotel });
    } else {
        res.status(404).json({ success: false, message: "酒店不存在" });
    }
});

module.exports = router;