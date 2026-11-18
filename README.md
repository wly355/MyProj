# 基于 Vue.js 的实时天气预报系统（本科毕业设计）

一个前后端分离的实时天气查询系统：用户端可以查天气、管城市、看预警和出行建议、提交反馈；管理端可以做用户管理、反馈处理、配置和统计看板。

**个人独立完成**（毕业设计），前端 Vue 3 + 后端 Node.js + MySQL。

## 功能

### 用户端
| 页面 | 功能 |
| --- | --- |
| 首页 Home | 按城市查询实时天气、多日预报，图表展示温度走势 |
| 我的城市 Cities | 城市收藏、增删、切换默认城市 |
| 天气预警 WeatherAlert | 展示当前城市的气象预警信息 |
| 出行建议 TravelAdvisor | 根据天气给出出行 / 穿衣建议 |
| 反馈 Feedback | 提交问题与建议 |
| 个人中心 | 资料修改、偏好设置、系统状态查看 |
| 登录 / 注册 | 账号注册、登录、JWT 鉴权 |

### 管理端（admin）
| 页面 | 功能 |
| --- | --- |
| Dashboard | 用户数、反馈数等统计看板 |
| Users | 用户列表、状态管理 |
| Feedbacks | 反馈处理与回复 |
| AdminApplications | 管理员申请审批 |
| Config | 系统参数配置 |

## 技术栈

**前端**：Vue 3 · Vite · Vue Router · Pinia · Element Plus · ECharts · Axios · Sass
**后端**：Node.js · Express · MySQL（mysql2）· JWT · bcryptjs · axios
**数据**：`backend/database/init.sql`（建表与初始化数据）
**第三方**：和风天气 API（`src/services/qweatherService.js`）

## 目录结构

```
├── backend/                 # Node.js 后端
│   ├── src/
│   │   ├── server.js        # 入口
│   │   ├── config/          # 数据库、天气 API 配置
│   │   ├── controllers/     # auth / user / weather / admin
│   │   ├── middleware/      # auth、adminAuth、错误处理
│   │   ├── routes/          # 路由定义（含管理员申请）
│   │   └── services/        # 和风天气服务封装
│   └── database/init.sql    # 建表脚本
└── frontend/                # Vue 3 前端
    └── src/
        ├── views/           # 用户端页面
        ├── views/admin/     # 管理端页面
        ├── layouts/         # MainLayout / AdminLayout
        └── router、store    # 路由与状态管理
```

## 本地运行

**后端**
```bash
cd backend
npm install
cp .env.example .env        # 填数据库与和风天气 Key
# 导入 backend/database/init.sql 到 MySQL
npm run dev                 # 默认 http://localhost:3000
```

**前端**
```bash
cd frontend
npm install
npm run dev                 # 默认 http://localhost:5173
```

## 测试视角（这个项目里可验证的点）

做测试的人看自己的项目，重点在这些地方：

- **鉴权**：未登录访问受限页是否跳转；普通用户直接调管理端接口是否被 `adminAuth` 拦下
- **越权**：A 用户能否改 B 用户的资料 / 删 B 的城市
- **接口异常**：天气 API 超时或返回异常数据时，页面是否有兜底而不是白屏
- **输入边界**：城市名为空、超长、特殊字符；反馈内容超长提交
- **数据一致性**：管理端改了配置后，用户端是否实时生效
- **分页与排序**：用户列表、反馈列表翻页与总数是否对得上
- **重复提交**：注册同一账号、重复提交反馈的处理
