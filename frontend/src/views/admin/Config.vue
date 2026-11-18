<template>
  <div class="config-page">
    <el-card>
      <template #header>
        <span>系统配置</span>
      </template>

      <el-form :model="form" label-width="150px" style="max-width: 800px">
        <el-form-item label="关于我们内容">
          <el-input
            v-model="form.about_us_content"
            type="textarea"
            :rows="6"
            placeholder="请输入关于我们页面的内容..."
          />
        </el-form-item>

        <el-form-item label="系统公告">
          <el-input
            v-model="form.system_notice"
            type="textarea"
            :rows="4"
            placeholder="请输入系统公告内容..."
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="loading">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getConfig, updateConfig } from '@/api/admin'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const form = ref({
  about_us_content: '',
  system_notice: ''
})

const loadConfig = async () => {
  try {
    const [aboutData, noticeData] = await Promise.all([
      getConfig('about_us_content').catch(() => ({ value: '' })),
      getConfig('system_notice').catch(() => ({ value: '' }))
    ])
    
    form.value.about_us_content = aboutData.value || ''
    form.value.system_notice = noticeData.value || ''
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    await Promise.all([
      updateConfig('about_us_content', { value: form.value.about_us_content }),
      updateConfig('system_notice', { value: form.value.system_notice })
    ])
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('Failed to save config:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.config-page {
  // Styles
}
</style>

