<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-form :model="form" ref="formRef" label-width="120px">
        <el-form-item label="温度单位">
          <el-radio-group v-model="form.temperatureUnit">
            <el-radio label="celsius">摄氏度 (°C)</el-radio>
            <el-radio label="fahrenheit">华氏度 (°F)</el-radio>
          </el-radio-group>
        </el-form-item>
<el-form-item label="天气详情">
  <el-checkbox v-model="form.showWind">显示风速</el-checkbox>
  <el-checkbox v-model="form.showPressure">显示气压</el-checkbox>
  <el-checkbox v-model="form.showUv">显示紫外线</el-checkbox>
</el-form-item>
        <el-form-item label="主题设置">
          <el-radio-group v-model="form.theme">
            <el-radio label="light">浅色主题</el-radio>
            <el-radio label="dark">深色主题</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

     

      <div class="action-buttons">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage } from 'element-plus'

const settingsStore = useSettingsStore()
const formRef = ref(null)
const saving = ref(false)

const form = reactive({
  temperatureUnit: 'celsius',
  theme: 'light',
  showWind: true,      // 新增：风速
  showPressure: true,  // 新增：气压
  showUv: true         // 新增：紫外线
})

onMounted(async () => {
  await settingsStore.loadSettings()
  // Pinia Store 会自动包含新字段，Object.assign 会把 store 里的值覆盖到 form 上
 // Object.assign(form, settingsStore.settings)
  form.temperatureUnit = settingsStore.temperatureUnit
  form.theme = settingsStore.theme
  form.showWind = settingsStore.showWind
  form.showPressure = settingsStore.showPressure
  form.showUv = settingsStore.showUv
})

const handleSave = async () => {
  saving.value = true
  try {
    await settingsStore.updateSettings(form)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  Object.assign(form, {
    temperatureUnit: 'celsius',
    theme: 'light',
    showWind: true,
    showPressure: true,
    showUv: true
  })
  ElMessage.info('设置已重置')
}
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;

  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: none;

    .el-card__header {
      background: #f5f7fa;
      padding: 16px 24px;
      border-bottom: 1px solid #e4e7ed;

      span {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-card__body {
      padding: 32px 24px;
    }
  }

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .el-form-item__label {
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;

    .el-button {
      min-width: 100px;
      border-radius: 6px;
    }
  }
}
</style>