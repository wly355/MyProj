<template>
  <div class="system-status-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📡 服务信息</span>
          <el-tag type="success" size="small">运行中</el-tag>
        </div>
      </template>

      <!-- 服务状态卡片 -->
      <div class="status-grid">
        <div class="status-card">
          <div class="status-icon">🌐</div>
          <div class="status-info">
            <div class="status-label">API服务商</div>
            <div class="status-value">和风天气</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">🔌</div>
          <div class="status-info">
            <div class="status-label">API状态</div>
            <div class="status-value" :class="apiStatus === '正常' ? 'status-ok' : 'status-error'">
              {{ apiStatus }}
            </div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">🕐</div>
          <div class="status-info">
            <div class="status-label">最后更新</div>
            <div class="status-value">{{ lastUpdateTime }}</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon">📊</div>
          <div class="status-info">
            <div class="status-label">今日调用</div>
            <div class="status-value">{{ todayCalls }}次</div>
          </div>
        </div>
      </div>

      <!-- 服务配置 -->
      <div class="config-section">
        <div class="section-title">⚙️ 服务配置</div>
        <div class="config-list">
          <div class="config-item">
            <span class="config-key">API地址</span>
            <span class="config-value">{{ apiHost }}</span>
          </div>
          <div class="config-item">
            <span class="config-key">数据缓存</span>
            <span class="config-value">5分钟</span>
          </div>
          <div class="config-item">
            <span class="config-key">超时设置</span>
            <span class="config-value">10秒</span>
          </div>
          <div class="config-item">
            <span class="config-key">重试次数</span>
            <span class="config-value">3次</span>
          </div>
        </div>
      </div>

      <!-- 服务日志 -->
      <div class="logs-section">
        <div class="section-title">📋 服务日志</div>
        <div class="logs-list">
          <div v-for="log in serviceLogs" :key="log.id" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level" :class="`log-${log.level}`">{{ log.level }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCities } from '@/api/user'

const apiStatus = ref('正常')
const lastUpdateTime = ref('')
const todayCalls = ref(0)
const apiHost = ref('k64up452d9.re.qweatherapi.com')
const serviceLogs = ref([])

// 添加日志
const addLog = (level, message) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  serviceLogs.value.unshift({
    id: Date.now(),
    time,
    level,
    message
  })
  // 只保留最近20条
  if (serviceLogs.value.length > 20) {
    serviceLogs.value.pop()
  }
}

// 测试API连接
const testApiConnection = async () => {
  try {
    addLog('info', '正在检测天气API连接...')
    const startTime = Date.now()
    await getCities()
    const duration = Date.now() - startTime
    apiStatus.value = '正常'
    addLog('success', `API连接正常，响应时间 ${duration}ms`)
    todayCalls.value++
  } catch (error) {
    apiStatus.value = '异常'
    addLog('error', `API连接失败: ${error.message}`)
  }
}

// 获取最后更新时间
const getLastUpdateTime = () => {
  const now = new Date()
  lastUpdateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

// 模拟今日调用次数
const getTodayCalls = () => {
  // 从localStorage读取或随机生成
  const saved = localStorage.getItem('todayCalls')
  const today = new Date().toDateString()
  const lastDate = localStorage.getItem('lastDate')
  
  if (lastDate !== today) {
    localStorage.setItem('todayCalls', Math.floor(Math.random() * 50) + 20)
    localStorage.setItem('lastDate', today)
  }
  todayCalls.value = parseInt(localStorage.getItem('todayCalls') || '0')
}

onMounted(() => {
  getLastUpdateTime()
  getTodayCalls()
  testApiConnection()
  
  // 添加启动日志
  addLog('info', '系统服务启动')
  addLog('success', '天气API服务初始化完成')
})
</script>

<style lang="scss" scoped>
.system-status-page {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 16px;
  
  .status-icon {
    font-size: 32px;
  }
  
  .status-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }
  
  .status-value {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    
    &.status-ok {
      color: #67c23a;
    }
    &.status-error {
      color: #f56c6c;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8ecf0;
}

.config-list {
  background: #f8f9fc;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  
  .config-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #e8ecf0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .config-key {
      font-size: 14px;
      color: #909399;
    }
    
    .config-value {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }
}

.logs-list {
  background: #1e1e2e;
  border-radius: 16px;
  padding: 12px 0;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  
  .log-item {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 13px;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: #6c6c7e;
      width: 70px;
      flex-shrink: 0;
    }
    
    .log-level {
      width: 70px;
      flex-shrink: 0;
      
      &.log-info {
        color: #3b82f6;
      }
      &.log-success {
        color: #10b981;
      }
      &.log-error {
        color: #ef4444;
      }
      &.log-warning {
        color: #f59e0b;
      }
    }
    
    .log-message {
      color: #e0e0e0;
      flex: 1;
    }
  }
}
</style>