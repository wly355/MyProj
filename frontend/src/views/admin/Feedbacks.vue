<template>
  <div class="feedbacks-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>反馈管理</span>
          <el-radio-group v-model="filterStatus" @change="loadFeedbacks">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待处理</el-radio-button>
            <el-radio-button label="processing">处理中</el-radio-button>
            <el-radio-button label="resolved">已解决</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="feedbacks" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="content" label="反馈内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" plain @click="handleReply(row)">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="处理反馈"
      width="650px"
      :close-on-click-modal="false"
      class="feedback-dialog"
    >
      <div class="feedback-detail">
        <div class="detail-section">
          <div class="section-title">用户信息</div>
          <div class="section-content">
            <span class="username">{{ currentFeedback?.username }}</span>
            <span class="submit-time">提交于 {{ formatTime(currentFeedback?.created_at) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">反馈内容</div>
          <div class="section-content feedback-content">
            {{ currentFeedback?.content }}
          </div>
        </div>

        <div class="detail-section" v-if="currentFeedback?.admin_reply">
          <div class="section-title">历史回复</div>
          <div class="section-content history-reply">
            {{ currentFeedback?.admin_reply }}
          </div>
        </div>

        <el-form :model="replyForm" label-width="80px" class="reply-form">
          <el-form-item label="状态">
            <el-select v-model="replyForm.status" placeholder="请选择状态">
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已解决" value="resolved" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
          <el-form-item label="回复内容">
            <el-input
              v-model="replyForm.adminReply"
              type="textarea"
              :rows="5"
              placeholder="请输入回复内容..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" plain>取消</el-button>
          <el-button type="primary" @click="handleSubmitReply" :loading="submitLoading" plain>
            提交回复
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFeedbacks, updateFeedback } from '@/api/admin'
import { ElMessage } from 'element-plus'

const feedbacks = ref([])
const loading = ref(false)
const filterStatus = ref('')
const dialogVisible = ref(false)
const submitLoading = ref(false)
const currentFeedback = ref(null)

const replyForm = ref({
  status: 'pending',
  adminReply: ''
})

const loadFeedbacks = async () => {
  loading.value = true
  try {
    const params = filterStatus.value ? { status: filterStatus.value } : {}
    const data = await getFeedbacks(params)
    feedbacks.value = data.feedbacks
  } catch (error) {
    console.error('Failed to load feedbacks:', error)
  } finally {
    loading.value = false
  }
}

const handleReply = (row) => {
  currentFeedback.value = row
  replyForm.value = {
    status: row.status,
    adminReply: row.admin_reply || ''
  }
  dialogVisible.value = true
}

const handleSubmitReply = async () => {
  submitLoading.value = true
  try {
    await updateFeedback(currentFeedback.value.id, replyForm.value)
    ElMessage.success('处理成功')
    dialogVisible.value = false
    loadFeedbacks()
  } catch (error) {
    console.error('Failed to update feedback:', error)
  } finally {
    submitLoading.value = false
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    processing: 'warning',
    resolved: 'success',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return texts[status] || status
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadFeedbacks()
})
</script>

<style lang="scss" scoped>
.feedbacks-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.feedback-detail {
  .detail-section {
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(64, 158, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(64, 158, 255, 0.1);

    &:last-of-type {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(64, 158, 255, 0.15);
    }

    .section-content {
      font-size: 14px;
      line-height: 1.8;
      color: #606266;

      &.feedback-content {
        padding: 12px;
        background: white;
        border-radius: 6px;
        min-height: 80px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      &.history-reply {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
        border-left: 3px solid #409eff;
        font-style: italic;
        color: #909399;
      }

      .username {
        font-weight: 600;
        color: #303133;
        margin-right: 12px;
      }

      .submit-time {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .reply-form {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px dashed rgba(64, 158, 255, 0.15);

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
    }

    :deep(.el-select) {
      width: 100%;
    }

    :deep(.el-textarea__inner) {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.8;
      border-radius: 6px;
      padding: 12px;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.feedback-dialog) {
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #e4e7ed;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>

