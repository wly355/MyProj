-- 创建数据库
CREATE DATABASE IF NOT EXISTS weather_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE weather_system;

-- 1. users 表 - 用户信息表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID,主键自增',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名,唯一且不能为空',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值,使用bcrypt加密',
  role ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色: user-普通用户, admin-管理员',
  status ENUM('active', 'disabled') DEFAULT 'active' COMMENT '账号状态: active-正常, disabled-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username) COMMENT '用户名索引,用于登录查询',
  INDEX idx_status (status) COMMENT '状态索引,用于筛选正常/禁用用户'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 2. user_cities 表 - 用户关注城市表
CREATE TABLE IF NOT EXISTS user_cities (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID,主键自增',
  user_id INT NOT NULL COMMENT '用户ID,外键关联users表',
  city_name VARCHAR(100) NOT NULL COMMENT '城市名称,如"北京"',
  city_code VARCHAR(50) NOT NULL COMMENT '和风天气城市ID,用于API查询',
  sort_order INT DEFAULT 0 COMMENT '排序顺序,数字越小越靠前',
  is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶,置顶城市显示在最前面',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '外键约束,用户删除时级联删除关注城市',
  INDEX idx_user_id (user_id) COMMENT '用户ID索引,用于查询用户的所有关注城市',
  INDEX idx_pinned (user_id, is_pinned) COMMENT '置顶索引,用于快速查询置顶城市',
  UNIQUE KEY unique_user_city (user_id, city_code) COMMENT '唯一约束,同一用户不能重复添加同一城市'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关注城市表';

-- 3. user_settings 表 - 用户个性化设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '设置ID,主键自增',
  user_id INT UNIQUE NOT NULL COMMENT '用户ID,外键关联users表,唯一约束保证一个用户只有一条设置记录',
  temperature_unit ENUM('celsius', 'fahrenheit') DEFAULT 'celsius' COMMENT '温度单位: celsius-摄氏度, fahrenheit-华氏度',
  theme ENUM('light', 'dark') DEFAULT 'light' COMMENT '主题模式: light-浅色模式, dark-深色模式',
  language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言设置,如zh-CN(简体中文), en-US(英语)',
  show_wind BOOLEAN DEFAULT TRUE COMMENT '是否显示风速',
  show_pressure BOOLEAN DEFAULT TRUE COMMENT '是否显示气压',
  show_uv BOOLEAN DEFAULT TRUE COMMENT '是否显示紫外线',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '外键约束,用户删除时级联删除设置'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户个性化设置表';

-- 4. feedbacks 表 - 用户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '反馈ID,主键自增',
  user_id INT NOT NULL COMMENT '用户ID,外键关联users表',
  content TEXT NOT NULL COMMENT '反馈内容,用户提交的问题或建议',
  status ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending' COMMENT '处理状态: pending-待处理, processing-处理中, resolved-已解决, closed-已关闭',
  admin_reply TEXT COMMENT '管理员回复内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '外键约束,用户删除时级联删除反馈',
  INDEX idx_user_id (user_id) COMMENT '用户ID索引,用于查询用户的所有反馈',
  INDEX idx_status (status) COMMENT '状态索引,用于筛选不同状态的反馈'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户反馈表';

-- 5. system_config 表 - 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID,主键自增',
  config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键名,唯一标识,如system_name、about_us_content',
  config_value TEXT COMMENT '配置值,存储配置的具体内容',
  description VARCHAR(255) COMMENT '配置描述,说明该配置的用途',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_config_key (config_key) COMMENT '配置键索引,用于快速查询配置'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 6. api_logs 表 - API调用日志表
CREATE TABLE IF NOT EXISTS api_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID,主键自增',
  api_name VARCHAR(100) NOT NULL COMMENT 'API名称,如getCityWeather、searchCity',
  request_params TEXT COMMENT '请求参数,JSON格式存储',
  response_status VARCHAR(10) COMMENT '响应状态码,如200、404、500',
  success BOOLEAN DEFAULT TRUE COMMENT '是否成功: true-成功, false-失败',
  error_message TEXT COMMENT '错误信息,失败时记录错误详情',
  response_time INT COMMENT '响应时间,单位毫秒(ms)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
  INDEX idx_api_name (api_name) COMMENT 'API名称索引,用于统计某个API的调用情况',
  INDEX idx_created_at (created_at) COMMENT '时间索引,用于按时间范围查询日志',
  INDEX idx_success (success) COMMENT '成功状态索引,用于筛选成功/失败的调用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API调用日志表';

-- 7. admin_applications 表 - 管理员申请表
CREATE TABLE IF NOT EXISTS admin_applications (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '申请ID,主键自增',
  user_id INT NOT NULL COMMENT '用户ID,外键关联users表',
  username VARCHAR(50) NOT NULL COMMENT '用户名,冗余存储便于查询',
  email VARCHAR(100) COMMENT '联系邮箱',
  reason TEXT NOT NULL COMMENT '申请理由',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态: pending-待审核, approved-已通过, rejected-已拒绝',
  reviewed_by INT COMMENT '审核人ID',
  review_remark TEXT COMMENT '审核备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '外键约束,用户删除时级联删除申请',
  INDEX idx_user_id (user_id) COMMENT '用户ID索引',
  INDEX idx_status (status) COMMENT '状态索引,用于筛选待审核申请'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员申请表';

-- 插入默认管理员账号 (用户名: admin, 密码: admin123)
-- 密码哈希值是 admin123 经过 bcrypt 加密后的结果
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$0z1SEHkJu3hyOBhZy/qz9.32NoRkVt3Uhbj9Abrm8WVF0Ikish/fW', 'admin')
ON DUPLICATE KEY UPDATE username=username;
