const jwt = require('jsonwebtoken');

const JWT_SECRET = 'weather_system_jwt_secret_key_2024';

module.exports = (req, res, next) => {
  console.log('=== Auth中间件被调用 ===');
  console.log('请求路径:', req.path);
  console.log('Authorization header:', req.headers.authorization);
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('提取的token:', token ? token.substring(0, 50) + '...' : '无');
    
    if (!token) {
      console.log('❌ 没有token');
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ 解码成功:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ 验证失败:', error.message);
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};