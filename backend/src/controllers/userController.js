const db = require('../config/db');

// 获取用户关注的城市列表
exports.getCities = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [cities] = await db.query(
      'SELECT id, city_name, city_code, sort_order, is_pinned, created_at FROM user_cities WHERE user_id = ? ORDER BY is_pinned DESC, sort_order ASC, created_at ASC',
      [userId]
    );

    res.json({ cities });
  } catch (error) {
    next(error);
  }
};

// 添加关注城市
exports.addCity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cityName, cityCode } = req.body;

    if (!cityName || !cityCode) {
      return res.status(400).json({ message: '城市名称和城市代码不能为空' });
    }

    // 检查是否已存在
    const [existing] = await db.query(
      'SELECT id FROM user_cities WHERE user_id = ? AND city_code = ?',
      [userId, cityCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '该城市已在关注列表中' });
    }

    // 获取当前最大排序值
    const [maxSort] = await db.query(
      'SELECT MAX(sort_order) as maxSort FROM user_cities WHERE user_id = ?',
      [userId]
    );

    const sortOrder = (maxSort[0].maxSort || 0) + 1;

    await db.query(
      'INSERT INTO user_cities (user_id, city_name, city_code, sort_order) VALUES (?, ?, ?, ?)',
      [userId, cityName, cityCode, sortOrder]
    );

    res.status(201).json({ message: '添加成功' });
  } catch (error) {
    next(error);
  }
};

// 删除关注城市
exports.deleteCity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cityId } = req.params;

    const [result] = await db.query(
      'DELETE FROM user_cities WHERE id = ? AND user_id = ?',
      [cityId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '城市不存在或无权删除' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
};

// 置顶/取消置顶城市
exports.togglePinCity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cityId } = req.params;

    // 检查城市是否属于当前用户
    const [city] = await db.query(
      'SELECT is_pinned FROM user_cities WHERE id = ? AND user_id = ?',
      [cityId, userId]
    );

    if (city.length === 0) {
      return res.status(404).json({ message: '城市不存在或无权操作' });
    }

    const newPinnedStatus = !city[0].is_pinned;

    // 如果要置顶,先取消其他城市的置顶状态(只允许一个置顶)
    if (newPinnedStatus) {
      await db.query(
        'UPDATE user_cities SET is_pinned = FALSE WHERE user_id = ? AND is_pinned = TRUE',
        [userId]
      );
    }

    // 更新当前城市的置顶状态
    await db.query(
      'UPDATE user_cities SET is_pinned = ? WHERE id = ? AND user_id = ?',
      [newPinnedStatus, cityId, userId]
    );

    res.json({
      message: newPinnedStatus ? '置顶成功' : '取消置顶成功',
      isPinned: newPinnedStatus
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户设置
exports.getSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [settings] = await db.query(
      'SELECT temperature_unit, theme,show_wind, show_pressure, show_uv, language FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      // 如果不存在，创建默认设置
      await db.query(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [userId]
      );
      return res.json({
        temperatureUnit: 'celsius',
        theme: 'light',
        language: 'zh-CN',
        showWind: true,
        showPressure: true,
        showUv: true
      });
    }

    res.json({
      temperatureUnit: settings[0].temperature_unit,
      theme: settings[0].theme,
      language: settings[0].language,
      showWind: !!settings[0].show_wind,
      showPressure: !!settings[0].show_pressure,
      showUv: !!settings[0].show_uv
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户设置
exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { temperatureUnit, theme, language } = req.body;

    const updates = [];
    const values = [];

    if (temperatureUnit) {
      updates.push('temperature_unit = ?');
      values.push(temperatureUnit);
    }
    if (theme) {
      updates.push('theme = ?');
      values.push(theme);
    }
    if (language) {
      updates.push('language = ?');
      values.push(language);
    }
    if (req.body.showWind !== undefined) {
      updates.push('show_wind = ?');
      values.push(req.body.showWind);
    }
    if (req.body.showPressure !== undefined) {
      updates.push('show_pressure = ?');
      values.push(req.body.showPressure);
    }
    if (req.body.showUv !== undefined) {
      updates.push('show_uv = ?');
      values.push(req.body.showUv);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: '没有要更新的设置' });
    }

    values.push(userId);

    await db.query(
      `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    res.json({ message: '设置更新成功' });
  } catch (error) {
    next(error);
  }
};

// 提交反馈
exports.submitFeedback = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '反馈内容不能为空' });
    }

    await db.query(
      'INSERT INTO feedbacks (user_id, content) VALUES (?, ?)',
      [userId, content]
    );

    res.status(201).json({ message: '反馈提交成功' });
  } catch (error) {
    next(error);
  }
};

// 获取用户自己的反馈列表
exports.getMyFeedbacks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [feedbacks] = await db.query(
      'SELECT id, content, status, admin_reply, created_at, updated_at FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ feedbacks });
  } catch (error) {
    next(error);
  }
};

