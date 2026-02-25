const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();

const dbPath = path.join(__dirname, '..', 'db.json');

function readDB() {
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// 注册
router.post('/register', (req, res) => {
  const { username, password, email, identity } = req.body;
  if (!username || !password || !identity) {
    return res.status(400).json({ success: false, message: '缺少必须字段' });
  }

  const db = readDB();
  db.users = db.users || [];

  if (db.users.some(u => u.username === username)) {
    return res.status(409).json({ success: false, message: '用户名已存在' });
  }

  // 对密码进行哈希后保存
  const hashed = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    username,
    password: hashed,
    identity,
    createTime: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  return res.json({ success: true, user: { username: newUser.username, identity: newUser.identity } });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '缺少必须字段' });
  }

  const db = readDB();
  db.users = db.users || [];

  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  // 使用 bcrypt 比较哈希
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  return res.json({ success: true, user: { username: user.username, identity: user.identity } });
});

module.exports = router;
