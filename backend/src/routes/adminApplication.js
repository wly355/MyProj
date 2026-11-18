const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// 用户申请成为管理员
router.post('/apply', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const username = req.user.username;
    const { email, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: '请填写申请理由' });
    }

    // 检查是否已经申请过
    const [existing] = await db.query(
      'SELECT id, status FROM admin_applications WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'pending') {
        return res.status(400).json({ message: '您已提交过申请，请耐心等待审核' });
      }
      if (existing[0].status === 'approved') {
        return res.status(400).json({ message: '您已经是管理员了' });
      }
    }

    // 插入申请记录
    await db.query(
      'INSERT INTO admin_applications (user_id, username, email, reason) VALUES (?, ?, ?, ?)',
      [userId, username, email || null, reason]
    );

    res.json({ message: '申请已提交，等待管理员审核' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取申请列表（管理员）
router.get('/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const [applications] = await db.query(`
      SELECT a.*, u.role as current_role 
      FROM admin_applications a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 审核申请（管理员）
router.put('/applications/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const { id } = req.params;
    const { status, review_remark } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '无效的审核状态' });
    }

    // 获取申请信息
    const [apps] = await db.query('SELECT user_id FROM admin_applications WHERE id = ?', [id]);
    if (apps.length === 0) {
      return res.status(404).json({ message: '申请不存在' });
    }

    const userId = apps[0].user_id;

    // 更新申请状态
    await db.query(
      'UPDATE admin_applications SET status = ?, reviewed_by = ?, review_remark = ? WHERE id = ?',
      [status, req.user.userId, review_remark || null, id]
    );

    // 如果通过，更新用户角色为管理员
    if (status === 'approved') {
      await db.query('UPDATE users SET role = "admin" WHERE id = ?', [userId]);
    }

    res.json({ message: status === 'approved' ? '已通过，用户已成为管理员' : '已拒绝申请' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;