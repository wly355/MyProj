const express = require('express');// 导入 Express 框架，用于构建 Web 服务器
const cors = require('cors');// 导入 cors 中间件，用于处理跨域请求
require('dotenv').config();// 导入 dotenv 模块，用于加载环境变量（从.env 文件中）

const authRoutes = require('./routes/auth');// 导入路由模块：认证相关路由（登录、注册等）
const weatherRoutes = require('./routes/weather');// 导入天气相关路由（获取天气数据等）
const userRoutes = require('./routes/user');// 导入用户相关路由（用户信息管理等）
const adminRoutes = require('./routes/admin');// 导入管理员相关路由（后台管理功能等）
const errorHandler = require('./middleware/errorHandler');// 导入错误处理中间件，用于统一处理服务器错误
const adminApplicationRoutes = require('./routes/adminApplication');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-applications', adminApplicationRoutes);
// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 添加根路由 - 解决 "Cannot GET /" 问题
app.get('/', (req, res) => {
  res.json({
    message: '天气预报系统后端服务',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      weather: '/api/weather', 
      user: '/api/user',
      admin: '/api/admin',
      health: '/health'
    },
    documentation: '请访问具体API端点获取数据'
  });
});

// 统一错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
});