const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
// 在文件最开头（require 之后，exports 之前）
const JWT_SECRET = 'weather_system_jwt_secret_key_2024';
// 用户注册
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少为6位' });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入用户
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    // 创建默认设置
    await db.query(
      'INSERT INTO user_settings (user_id) VALUES (?)',
      [result.insertId]
    );

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    next(error);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查询用户
    const [users] = await db.query(
      'SELECT id, username, password_hash, role, status FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = users[0];

    // 检查账号状态
    if (user.status === 'disabled') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      // process.env.JWT_SECRET,

      // { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        userId: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

