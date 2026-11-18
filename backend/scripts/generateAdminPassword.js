const bcrypt = require('bcryptjs');

// 生成管理员密码哈希
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('管理员密码哈希值:');
console.log(hash);
console.log('\n请将此哈希值复制到 database/init.sql 文件中的管理员账号插入语句中');

