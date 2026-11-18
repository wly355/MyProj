<template>
  <div class="cities-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的城市</span>
       
          <el-button type="primary" @click="dialogVisible = true">
            <el-icon><plus /></el-icon>
            添加城市
          </el-button>
        </div>
      </template>

     
      <el-table :data="cities" v-loading="loading">
       
        <el-table-column prop="city_name" label="城市名称">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>{{ row.city_name }}</span>
             
              <el-tag v-if="row.is_pinned" type="warning" size="small">置顶</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="city_code" label="城市代码" />
        
        <el-table-column prop="created_at" label="添加时间">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      
        <el-table-column label="操作" width="320" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
            
              <el-button
                :type="row.is_pinned ? 'warning' : 'info'"
                size="small"
                plain
                @click="handleTogglePin(row)"
                class="action-btn"
              >
                {{ row.is_pinned ? '取消置顶' : '置顶' }}
              </el-button>
            
              <el-button type="primary" size="small" plain @click="viewWeather(row)" class="action-btn">查看天气</el-button>
            
              <el-button type="danger" size="small" plain @click="handleDelete(row)" class="action-btn">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

   
    <el-dialog v-model="dialogVisible" title="添加城市" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="城市名称" prop="cityName">
         
          <el-input v-model="form.cityName" placeholder="请输入城市名称" @blur="searchCityCode" />
        </el-form-item>
        <el-form-item label="城市代码" prop="cityCode">
          <el-input v-model="form.cityCode" placeholder="城市代码将自动获取" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" plain>取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="addLoading" plain>确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="weatherDialogVisible" :title="`${selectedCity?.city_name} 天气详情`" width="800px">
     
      <div v-if="weatherLoading" class="weather-loading">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <div>加载中...</div>
      </div>
     
      <div v-else-if="weatherData" class="weather-detail">
     
        <div class="weather-header">
          <div class="weather-main">
            <img :src="getWeatherIcon(weatherData.current.icon)" alt="天气图标" class="weather-icon-large" />
            <div class="temperature-large">{{ weatherData.current.temp }} °C</div>
          </div>
          <div class="weather-desc">
            <div class="weather-text">{{ weatherData.current.text }}</div>
            <div class="feels-like">体感温度 {{ weatherData.current.feelsLike }}°</div>
          </div>
        </div>

    
        <div class="weather-metrics">
          <div class="metric-item">
            <div class="metric-label">湿度</div>
            <div class="metric-value">{{ weatherData.current.humidity }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">风速</div>
            <div class="metric-value">{{ weatherData.current.windDir }} {{ weatherData.current.windScale }}级</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">能见度</div>
            <div class="metric-value">{{ weatherData.current.vis }} km</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">气压</div>
            <div class="metric-value">{{ weatherData.current.pressure }} hPa</div>
          </div>
        </div>

      
        <div class="forecast-section">
          <h3>7天天气预报</h3>
          <div class="forecast-list">
       
            <div v-for="(day, index) in weatherData.forecast" :key="index" class="forecast-day">
              <div class="day-name">{{ index === 0 ? '今天' : index === 1 ? '明天' : day.fxDate.slice(5) }}</div>
              <img :src="getWeatherIcon(day.iconDay)" alt="天气图标" class="forecast-icon" />
              <div class="day-weather">{{ day.textDay }}</div>
              <div class="day-temp">
                <span class="temp-high">{{ day.tempMax }}°</span>
                <span class="temp-low">{{ day.tempMin }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="weatherDialogVisible = false" plain>关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 导入 API 函数
import { getCities, addCity, deleteCity, togglePinCity } from '@/api/user'
import { getWeather, getCurrentWeather, getWeatherForecast } from '@/api/weather'
// 导入 Element Plus 组件
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
// 导入工具函数
import { getWeatherIcon } from '@/utils/weatherIcons'

// 响应式数据定义
const cities = ref([]) // 城市列表数据
const loading = ref(false) // 表格加载状态
const dialogVisible = ref(false) // 添加城市弹窗显示状态
const addLoading = ref(false) // 添加城市按钮加载状态
const formRef = ref(null) // 表单引用

// 天气详情相关状态
const weatherDialogVisible = ref(false) // 天气弹窗显示状态
const weatherLoading = ref(false) // 天气数据加载状态
const weatherData = ref(null) // 天气数据
const selectedCity = ref(null) // 选中的城市

// 表单数据
const form = ref({
  cityName: '',
  cityCode: ''
})

// 表单验证规则
const rules = {
  cityName: [
    { required: true, message: '请输入城市名称', trigger: 'blur' }
  ],
  cityCode: [
    { required: true, message: '城市代码不能为空', trigger: 'blur' }
  ]
}

// 加载城市列表
const loadCities = async () => {
  loading.value = true
  try {
    const data = await getCities()
    cities.value = data.cities
  } catch (error) {
    console.error('Failed to load cities:', error)
  } finally {
    loading.value = false
  }
}

// 搜索城市代码
const searchCityCode = async () => {
  if (!form.value.cityName.trim()) return
  
  try {
    // 根据城市名称获取天气数据，从中提取城市代码
    const data = await getWeather(form.value.cityName)
    form.value.cityCode = data.cityCode
  } catch (error) {
    ElMessage.error('未找到该城市,请检查城市名称')
    form.value.cityCode = ''
  }
}

// 处理添加城市
const handleAdd = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      addLoading.value = true
      try {
        await addCity({
          cityName: form.value.cityName,
          cityCode: form.value.cityCode
        })
        ElMessage.success('添加成功')
        dialogVisible.value = false
        form.value = { cityName: '', cityCode: '' } // 重置表单
        loadCities() // 重新加载城市列表
      } catch (error) {
        console.error('Failed to add city:', error)
      } finally {
        addLoading.value = false
      }
    }
  })
}

// 切换置顶状态
const handleTogglePin = async (row) => {
  try {
    const { message } = await togglePinCity(row.id)
    ElMessage.success(message)
    loadCities()
  } catch (error) {
    console.error('Failed to toggle pin city:', error)
    ElMessage.error('操作失败')
  }
}

// 处理删除城市
const handleDelete = async (row) => {
  try {
    // 确认删除对话框
    await ElMessageBox.confirm('确定要删除该城市吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCity(row.id)
    ElMessage.success('删除成功')
    loadCities()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete city:', error)
    }
  }
}

// 查看天气详情
const viewWeather = async (row) => {
  selectedCity.value = row
  weatherDialogVisible.value = true
  weatherLoading.value = true
  weatherData.value = null

  try {
    // 并行获取当前天气和天气预报数据
    const [currentData, forecastData] = await Promise.all([
      getCurrentWeather(row.city_code),
      getWeatherForecast(row.city_code)
    ])

    weatherData.value = {
      current: currentData.now,
      forecast: forecastData.daily
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    ElMessage.error('获取天气信息失败')
    weatherDialogVisible.value = false
  } finally {
    weatherLoading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 组件挂载时加载城市列表
onMounted(() => {
  loadCities()
})
</script>

<style lang="scss" scoped>
.cities-page {
  max-width: 100%;
  margin: 0 auto;

  // 卡片样式
  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: none;
    background: white;
  }

  // 表格样式
  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;

    th {
      background: #f5f7fa;
      color: #303133;
      font-weight: 600;
      font-size: 14px;
    }

    tr:hover {
      background: #f5f7fa; // 行悬停效果
    }
  }
}

// 卡片头部样式
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 600;
  }
}

// 操作按钮容器
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;

  .action-btn {
    min-width: 80px;
    border-radius: 6px;
    font-weight: 500;
  }
}

// 天气加载状态样式
.weather-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

// 天气详情样式
.weather-detail {
  .weather-header {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%); // 渐变背景
    border-radius: 12px;
    margin-bottom: 24px;
  }

  // 天气指标网格布局
  .weather-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  // 天气预报区域
  .forecast-section {
    .forecast-list {
      display: grid;
      grid-template-columns: repeat(7, 1fr); // 7列网格
      gap: 12px;

      .forecast-day {
        padding: 16px 8px;
        background: #f5f7fa;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s; // 过渡动画

        &:hover {
          background: #e8f4f8;
          transform: translateY(-2px); // 悬停上浮效果
        }
      }
    }
  }
}
</style>