<template>
  <div class="admin-applications">
    <el-card>
      <template #header>
        <span>👑 管理员申请审核</span>
      </template>

      <el-table :data="applications" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="申请人" width="120" />
        <el-table-column prop="email" label="邮箱" width="150" />
        <el-table-column prop="reason" label="申请理由" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160" />
        <el-table-column label="操作" width="180" v-if="showActions">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="success" size="small" @click="handleReview(row, 'approved')">
              通过
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleReview(row, 'rejected')">
              拒绝
            </el-button>
            <span v-else>{{ row.status === 'approved' ? '已通过' : '已拒绝' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核备注弹窗 -->
    <el-dialog v-model="dialogVisible" :title="`${dialogTitle}申请`" width="400px">
      <el-input v-model="reviewRemark" type="textarea" :rows="3" placeholder="请输入审核备注（可选）" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getApplications, reviewApplication } from '@/api/adminApplication'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const applications = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentApplication = ref(null)
const reviewRemark = ref('')
const action = ref('')

const showActions = computed(() => true)

const getStatusType = (status) => {
  const types = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return texts[status] || status
}

const loadApplications = async () => {
  loading.value = true
  try {
    const { applications: data } = await getApplications()
    applications.value = data
  } catch (error) {
    console.error('加载申请列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReview = (row, type) => {
  currentApplication.value = row
  action.value = type
  dialogTitle.value = type === 'approved' ? '通过' : '拒绝'
  reviewRemark.value = ''
  dialogVisible.value = true
}

const confirmReview = async () => {
  try {
    await reviewApplication(currentApplication.value.id, {
      status: action.value,
      review_remark: reviewRemark.value
    })
    ElMessage.success(action.value === 'approved' ? '已通过申请' : '已拒绝申请')
    dialogVisible.value = false
    loadApplications()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

onMounted(() => {
  loadApplications()
})
</script>