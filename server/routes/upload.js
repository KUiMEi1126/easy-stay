const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 上传接口
// 前端 Upload 组件默认发送 multipart/form-data，字段名为 'file'
router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: '请上传文件' });
  }

  // 生成访问 URL
  // 注意：这里硬编码了 localhost:3000，生产环境应该是域名
  const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
  
  // 这里对应前端 Upload 组件的 response
  // 前端 customRequest 会用到这个 fileUrl
  res.json(fileUrl); // 直接返回字符串，或者对象 { url: fileUrl } 都可以，看前端怎么接
});

module.exports = router;