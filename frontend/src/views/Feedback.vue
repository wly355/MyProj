<template>
  <div class="feedback-page">
  
    <el-row :gutter="20">
     
      <el-col :span="8">
        <el-card class="submit-card">
          <template #header>
            <div class="card-header">
              <span>提交新反馈</span>
            </div>
          </template>
       
          <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="10"
                placeholder="如果对系统有问题，请附带上服务信息截图发送给管理员..."
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="card-footer">
              <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
                提交反馈
              </el-button>
            </div>
          </template>
        </el-card>
      </el-col>

  
      <el-col :span="16">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>我的反馈</span>
            </div>
          </template>
      
          <div v-loading="loading" class="feedback-list-container">
          
            <el-empty v-if="feedbacks.length === 0" description="暂无反馈记录" />
            <div v-else class="feedback-list">
            
              <el-card v-for="item in feedbacks" :key="item.id" class="feedback-item-card">
                <template #header>
                  <div class="item-header">
                 
                    <el-tag :type="getStatusType(item.status)" size="small">
                      {{ getStatusText(item.status) }}
                    </el-tag>
                    <span class="time">{{ formatTime(item.created_at) }}</span>
                  </div>
                </template>
              
                <div class="feedback-content">{{ item.content }}</div>
              
                <el-divider v-if="item.admin_reply" />
                <div v-if="item.admin_reply" class="admin-reply">
                  <div class="reply-label">管理员回复</div>
                  <div class="reply-content">{{ item.admin_reply }}</div>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { submitFeedback, getMyFeedbacks } from '@/api/user'
import { ElMessage } from 'element-plus'

// 响应式数据
const formRef = ref(null) // 表单引用
const submitLoading = ref(false) // 提交加载状态
const loading = ref(false) // 列表加载状态
const feedbacks = ref([]) // 反馈列表数据

// 表单数据
const form = ref({
  content: ''
})

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
  ]
}

// 加载反馈列表
const loadFeedbacks = async () => {
  loading.value = true
  try {
    const data = await getMyFeedbacks()
    feedbacks.value = data.feedbacks
  } catch (error) {
    console.error('Failed to load feedbacks:', error)
  } finally {
    loading.value = false
  }
}

// 处理提交反馈
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await submitFeedback({ content: form.value.content })
        ElMessage.success('反馈提交成功')
        form.value.content = '' // 清空表单
        formRef.value.resetFields() // 重置表单验证状态
        loadFeedbacks() // 重新加载反馈列表
      } catch (error) {
        console.error('Failed to submit feedback:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const types = {
    pending: 'info',      // 待处理 - 信息色
    processing: 'warning', // 处理中 - 警告色
    resolved: 'success',   // 已解决 - 成功色
    closed: 'info'        // 已关闭 - 信息色
  }
  return types[status] || 'info'
}

// 获取状态对应的中文文本
const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return texts[status] || status
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 组件挂载时加载反馈列表
onMounted(() => {
  loadFeedbacks()
})
</script>

<style lang="scss" scoped>
.feedback-page {
  max-width: 1600px;
  margin: 0 auto;

  // 卡片通用样式
  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  // 提交反馈卡片样式
  .submit-card {
    :deep(.el-card__footer) {
      background: #fafafa;
      padding: 16px 20px;
      border-top: 1px solid #e4e7ed;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
    }
  }

  // 反馈列表卡片样式
  .list-card {
    .feedback-list-container {
      min-height: 400px; // 最小高度
    }

    .feedback-list {
      max-height: 600px;
      overflow-y: auto; // 垂直滚动
      padding-right: 8px;

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 3px;

        &:hover {
          background: #c0c4cc;
        }
      }
    }

    // 反馈项卡片样式
    .feedback-item-card {
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 悬停阴影效果
      }

      // 反馈项头部
      :deep(.el-card__header) {
        background: transparent;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }

      // 管理员回复样式
      .admin-reply {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 6px;
        border-left: 3px solid #409eff; // 左侧蓝色边框

        .reply-label {
          font-size: 12px;
          color: #409eff;
          font-weight: 600;
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>