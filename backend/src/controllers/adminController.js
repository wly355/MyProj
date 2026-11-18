const db = require('../config/db');

// 获取所有用户列表
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// 修改用户状态
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    
    // 不能禁用自己
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: '不能修改自己的状态' });
    }
    
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '状态更新成功' });
  } catch (error) {
    next(error);
  }
};

// 获取系统监控统计信息
exports.getStats = async (req, res, next) => {
  try {
    // 获取总用户数
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // 获取活跃用户数
    const [activeUserCount] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'active'"
    );
    
    // 获取最近24小时API调用统计
    const [apiStats] = await db.query(
      `SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls,
        AVG(response_time) as avg_response_time
      FROM api_logs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );
    
    const stats = apiStats[0];
    const successRate = stats.total_calls > 0 
      ? ((stats.success_calls / stats.total_calls) * 100).toFixed(2) 
      : '0.00';
    
    res.json({
      totalUsers: userCount[0].count,
      activeUsers: activeUserCount[0].count,
      apiCalls24h: stats.total_calls || 0,
      successRate: `${successRate}%`,
      avgResponseTime: stats.avg_response_time ? `${Math.round(stats.avg_response_time)}ms` : 'N/A'
    });
  } catch (error) {
    next(error);
  }
};

// 获取系统配置
exports.getConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const [config] = await db.query(
      'SELECT config_value FROM system_config WHERE config_key = ?',
      [key]
    );
    
    if (config.length === 0) {
      return res.status(404).json({ message: '配置项不存在' });
    }
    
    res.json({ 
      key,
      value: config[0].config_value 
    });
  } catch (error) {
    next(error);
  }
};

// 更新系统配置
exports.updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const [result] = await db.query(
      'UPDATE system_config SET config_value = ? WHERE config_key = ?',
      [value, key]
    );
    
    if (result.affectedRows === 0) {
      // 如果不存在，则插入
      await db.query(
        'INSERT INTO system_config (config_key, config_value) VALUES (?, ?)',
        [key, value]
      );
    }
    
    res.json({ message: '配置更新成功' });
  } catch (error) {
    next(error);
  }
};

// 获取所有反馈
exports.getFeedbacks = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT f.id, f.content, f.status, f.admin_reply, f.created_at, f.updated_at,
             u.username
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE f.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const [feedbacks] = await db.query(query, params);
    
    res.json({ feedbacks });
  } catch (error) {
    next(error);
  }
};

// 处理反馈
exports.updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;
    
    const updates = [];
    const values = [];
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (adminReply !== undefined) {
      updates.push('admin_reply = ?');
      values.push(adminReply);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的内容' });
    }
    
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE feedbacks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '反馈不存在' });
    }
    
    res.json({ message: '反馈处理成功' });
  } catch (error) {
    next(error);
  }
};

