<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>

      <el-table :data="users" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="warning"
              size="small"
              plain
              @click="handleUpdateStatus(row, 'disabled')"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              plain
              @click="handleUpdateStatus(row, 'active')"
            >
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, updateUserStatus } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    const data = await getUsers()
    // 按id升序排序
    users.value = data.users.sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdateStatus = async (row, status) => {
  try {
    const action = status === 'disabled' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}用户 ${row.username} 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await updateUserStatus(row.id, { status })
    ElMessage.success(`${action}成功`)
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to update user status:', error)
    }
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
  // Styles
}
</style>

