<template>
  <div class="dashboard-page">
    <h2>数据统计</h2>

    
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: rgba(64, 158, 255, 0.15);">
            <el-icon size="32" color="#409eff"><user /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: rgba(103, 194, 58, 0.15);">
            <el-icon size="32" color="#67c23a"><check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: rgba(230, 162, 60, 0.15);">
            <el-icon size="32" color="#e6a23c"><data-line /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.apiCalls24h }}</div>
            <div class="stat-label">24小时API调用</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: rgba(245, 108, 108, 0.15);">
            <el-icon size="32" color="#f56c6c"><timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgResponseTime }}</div>
            <div class="stat-label">平均响应时间</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行: 系统信息占14列，快捷操作占10列 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="14">
        <el-card class="info-card">
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="API成功率">{{ stats.successRate }}</el-descriptions-item>
            <el-descriptions-item label="系统版本">1.0.0</el-descriptions-item>
            <el-descriptions-item label="数据库">MySQL</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card class="actions-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" plain @click="$router.push('/admin/users')">
              <el-icon><user /></el-icon>用户管理
            </el-button>
            <el-button type="success" plain @click="$router.push('/admin/feedbacks')">
              <el-icon><chat-line-round /></el-icon>反馈管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '@/api/admin'
import { User, Check, DataLine, Timer, ChatLineRound, Setting } from '@element-plus/icons-vue'

const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  apiCalls24h: 0,
  successRate: '0%',
  avgResponseTime: 'N/A'
})

const loadStats = async () => {
  loading.value = true
  try {
    const data = await getStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  h2 {
    margin-bottom: 24px;
    font-size: 28px;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: none;
    background: white;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.el-card__header) {
    background: #f5f7fa;
    color: #333;
    padding: 16px 20px;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
    font-size: 16px;
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.stat-card {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 20px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #303133;
    }

    .stat-label {
      color: #909399;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.info-card {
  height: 100%;

  :deep(.el-descriptions) {
    .el-descriptions__label {
      font-weight: 600;
      color: #606266;
    }

    .el-descriptions__content {
      color: #303133;
    }
  }
}

.actions-card {
  height: 100%;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.el-button) {
    width: 100%;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s;
    margin: 0 !important;  // 重置Element Plus的默认margin

    &:hover {
      transform: translateY(-2px);
    }

    span {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;

  th {
    background: #f5f7fa;
    color: #333;
    font-weight: 600;
  }

  td {
    font-size: 14px;
  }
}
</style>

