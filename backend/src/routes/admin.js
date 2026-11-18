const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// 所有管理员路由都需要认证和管理员权限
router.use(auth);
router.use(adminAuth);

// 用户管理
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// 数据统计
router.get('/stats', adminController.getStats);

// 系统配置
router.get('/config/:key', adminController.getConfig);
router.put('/config/:key', adminController.updateConfig);

// 反馈管理
router.get('/feedbacks', adminController.getFeedbacks);
router.put('/feedbacks/:id', adminController.updateFeedback);

module.exports = router;