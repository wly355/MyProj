<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>👤 个人中心</span>
          <el-tag type="info" size="small">个人资料</el-tag>
        </div>
      </template>
<div class="security-item" @click="showApplyDialog = true" v-if="authStore.user?.role !== 'admin'">
  <div class="security-left">
    <div class="security-icon">👑</div>
    <div class="security-info">
      <div class="security-title">申请管理员</div>
      <div class="security-desc">申请成为管理员，可访问后台管理功能</div>
    </div>
  </div>
  <el-icon><ArrowRight /></el-icon>
</div>
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <el-avatar :size="80" icon="UserFilled" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ userInfo.username }}</div>
          <div class="user-role">
            <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'" size="small">
              {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </div>
          <div class="user-time">注册于 {{ userInfo.registerTime }}</div>
        </div>
      </div>

      <!-- 数据统计卡片（4个） -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🏙️</div>
          <div class="stat-number">{{ stats.cityCount }}</div>
          <div class="stat-label">关注城市</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">☁️</div>
          <div class="stat-number">{{ stats.queryCount }}</div>
          <div class="stat-label">累计查询</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">💬</div>
          <div class="stat-number">{{ stats.feedbackCount }}</div>
          <div class="stat-label">反馈数量</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⭐</div>
          <div class="stat-number">{{ stats.favCount }}</div>
          <div class="stat-label">收藏城市</div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="activity-section">
        <div class="section-title">
          <span>📋 最近活动</span>
          <el-button link type="primary" @click="goToCities">查看全部</el-button>
        </div>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
          <div v-if="recentActivities.length === 0" class="empty-tip">
            暂无活动记录
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="actions-section">
        <div class="section-title">⚡ 快捷操作</div>
        <div class="actions-grid">
          <div class="action-item" @click="goToCities">
            <div class="action-icon">🏙️</div>
            <div class="action-text">我的城市</div>
          </div>
          <div class="action-item" @click="goToWeatherAlert">
            <div class="action-icon">⚠️</div>
            <div class="action-text">天气预警</div>
          </div>
          <div class="action-item" @click="goToTravelAdvisor">
            <div class="action-icon">🚗</div>
            <div class="action-text">出行参谋</div>
          </div>
          <div class="action-item" @click="goToFeedback">
            <div class="action-icon">💬</div>
            <div class="action-text">意见反馈</div>
          </div>
        </div>
      </div>

      <!-- 账号安全 -->
      <div class="security-section">
        <div class="section-title">🔐 账号安全</div>
        <div class="security-item" @click="showDialog = true">
          <div class="security-left">
            <div class="security-icon">🔑</div>
            <div class="security-info">
              <div class="security-title">修改密码</div>
              <div class="security-desc">定期更换密码，保障账号安全</div>
            </div>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </el-card>
    <el-dialog v-model="showApplyDialog" title="申请管理员" width="400px">
  <el-form :model="applyForm" :rules="applyRules" ref="applyFormRef">
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="applyForm.email" placeholder="请输入联系邮箱" />
    </el-form-item>
    <el-form-item label="申请理由" prop="reason">
      <el-input v-model="applyForm.reason" type="textarea" :rows="5" placeholder="请说明申请成为管理员的理由" />
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="showApplyDialog = false">取消</el-button>
    <el-button type="primary" @click="handleApply" :loading="applying">提交申请</el-button>
  </template>
</el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="formRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changing">确定修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getCities, getMyFeedbacks } from '@/api/user'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import axios from 'axios'
import { applyForAdmin } from '@/api/adminApplication'
const router = useRouter()
const authStore = useAuthStore()

const userInfo = ref({ username: '', role: 'user', registerTime: '' })
const stats = ref({ cityCount: 0, queryCount: 0, feedbackCount: 0, favCount: 0 })
const recentActivities = ref([])
const showDialog = ref(false)
const changing = ref(false)
const formRef = ref(null)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const loadUserInfo = () => {
  const user = authStore.user
  if (user) {
    userInfo.value.username = user.username || '用户'
    userInfo.value.role = user.role || 'user'
    userInfo.value.registerTime = user.registerTime || '2024-01-01'
  }
}
// 申请管理员相关
const showApplyDialog = ref(false)
const applying = ref(false)
const applyFormRef = ref(null)
const applyForm = ref({
  email: '',
  reason: ''
})
const applyRules = {
  reason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
  ]
}

const handleApply = async () => {
  await applyFormRef.value.validate(async (valid) => {
    if (!valid) return
    applying.value = true
    try {
      await applyForAdmin(applyForm.value)
      ElMessage.success('申请已提交，等待管理员审核')
      showApplyDialog.value = false
      applyForm.value = { email: '', reason: '' }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '申请失败')
    } finally {
      applying.value = false
    }
  })
}

// 1. 加载统计数据
const loadStats = async () => {
  const { cities } = await getCities()           // 获取关注城市列表
  stats.value.cityCount = cities.length          // 关注城市数量
  stats.value.favCount = cities.filter(c => c.is_pinned).length  // 收藏（置顶）城市数量
  
  const { feedbacks } = await getMyFeedbacks()   // 获取反馈列表
  stats.value.feedbackCount = feedbacks.length   // 反馈数量
}
    // 模拟查询次数（实际可以从后端获取）
//     stats.value.queryCount = Math.floor(Math.random() * 50) + 10
//   } catch (error) {
//     console.error('加载统计数据失败:', error)
//   }
// }

const loadRecentActivities = () => {
  // 模拟最近活动（实际可以从后端获取）
  const activities = []
  const now = new Date()
  
  if (stats.value.cityCount > 0) {
    activities.push({
      id: 1,
      icon: '🏙️',
      text: `添加了 ${stats.value.cityCount} 个关注城市`,
      time: '最近'
    })
  }
  if (stats.value.feedbackCount > 0) {
    activities.push({
      id: 2,
      icon: '💬',
      text: `提交了 ${stats.value.feedbackCount} 条反馈`,
      time: '最近'
    })
  }
  
  recentActivities.value = activities
}

const handleChangePassword = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    changing.value = true
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/user/password', {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      ElMessage.success('密码修改成功，请重新登录')
      showDialog.value = false
      authStore.logout()
      router.push('/login')
    } catch (error) {
      const message = error.response?.data?.message || '修改失败'
      ElMessage.error(message)
    } finally {
      changing.value = false
    }
  })
}

const goToCities = () => router.push('/cities')
const goToFeedback = () => router.push('/feedback')
const goToWeatherAlert = () => router.push('/weather-alert')
const goToTravelAdvisor = () => router.push('/travel-advisor')

onMounted(() => {
  loadUserInfo()
  loadStats()
  loadRecentActivities()
})
</script>

<style lang="css" scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);
  border-radius: 20px;
  margin-bottom: 24px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.user-time {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 16px;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 区块标题 */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8ecf0;
}

/* 活动列表 */
.activity-list {
  background: #f8f9fc;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 24px;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.empty-tip {
  padding: 32px;
  text-align: center;
  color: #909399;
}

/* 快捷操作网格 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.action-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #e8f4f8;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 13px;
  color: #606266;
}

/* 账号安全 */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.security-item:hover {
  background: #e8f4f8;
}

.security-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.security-icon {
  font-size: 24px;
}

.security-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 12px;
  color: #909399;
}
</style>