const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.get('/cities', auth, userController.getCities);
router.post('/cities', auth, userController.addCity);
router.delete('/cities/:cityId', auth, userController.deleteCity);
router.put('/cities/:cityId/pin', auth, userController.togglePinCity);

router.get('/settings', auth, userController.getSettings);
router.put('/settings', auth, userController.updateSettings);

router.post('/feedback', auth, userController.submitFeedback);
router.get('/feedbacks', auth, userController.getMyFeedbacks);

// 修改密码
router.put('/password', auth, async (req, res) => {
  console.log('收到修改密码请求, userId:', req.user?.userId); 
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }

    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const isValid = await bcrypt.compare(oldPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ message: '原密码错误' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;