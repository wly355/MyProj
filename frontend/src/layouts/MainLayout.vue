<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h1>天气预报查询系统</h1>
        </div>
        
        <!-- 全局搜索框 -->
        <div class="header-center">
          <div class="global-search">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索城市天气..."
              size="default"
              clearable
              @keyup.enter="handleGlobalSearch"
              @clear="handleClearSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleGlobalSearch" :loading="searching">
                  搜索
                </el-button>
              </template>
            </el-input>
            <!-- 搜索下拉建议 -->
            <div v-if="searchResults.length > 0 && searchKeyword" class="search-dropdown">
              <div
                v-for="city in searchResults"
                :key="city.code"
                class="search-item"
                @click="selectCity(city)"
              >
                <span class="city-name">{{ city.name }}</span>
                <span class="city-code">{{ city.code }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="header-right">
          <el-menu mode="horizontal" :default-active="activeMenu" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/cities">我的城市</el-menu-item>
            <el-menu-item index="/travel-advisor">出行参谋</el-menu-item>
            <el-menu-item index="/weather-alert">天气预警</el-menu-item>
            <el-menu-item index="/settings">设置</el-menu-item>
            <el-menu-item index="/feedback">反馈</el-menu-item>
            <el-menu-item index="/system-status">服务信息</el-menu-item>
            <el-menu-item index="/Profile">个人信息</el-menu-item>
            <el-menu-item index="/about">关于</el-menu-item>
            <el-menu-item v-if="authStore.user?.role === 'admin'" index="/admin">管理后台</el-menu-item>
          </el-menu>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ authStore.user?.username }}
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 搜索结果弹窗 -->
    <el-dialog v-model="resultDialogVisible" :title="`${searchCityName} 天气`" width="500px" destroy-on-close>
      <div v-if="resultLoading" class="result-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="searchResult" class="result-content">
        <div class="result-current">
          <div class="result-temp">{{ convertTemp(searchResult.current.temp) }}°</div>
          <div class="result-text">{{ searchResult.current.text }}</div>
          <div class="result-feels">体感 {{ convertTemp(searchResult.current.feelsLike) }}°</div>
        </div>
        <div class="result-details">
          <div class="detail-item">
            <span>💧 湿度</span>
            <strong>{{ searchResult.current.humidity }}%</strong>
          </div>
          <div class="detail-item">
            <span>💨 风速</span>
            <strong>{{ searchResult.current.windScale }}级</strong>
          </div>
          <div class="detail-item">
            <span>🌬️ 风向</span>
            <strong>{{ searchResult.current.windDir }}</strong>
          </div>
          <div class="detail-item">
            <span>📊 气压</span>
            <strong>{{ searchResult.current.pressure }}hPa</strong>
          </div>
        </div>
        <div class="result-action">
          <el-button type="primary" plain size="small" @click="addToCities">
            + 添加到我的城市
          </el-button>
        </div>
      </div>
      <div v-else class="result-error">
        <el-empty description="未找到该城市" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { Search, ArrowDown, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getWeather, getCurrentWeather, getWeatherForecast } from '@/api/weather'
import { getCities, addCity } from '@/api/user'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const activeMenu = computed(() => route.path)

// 搜索相关
const searchKeyword = ref('')
const searching = ref(false)
const searchResults = ref([])
const resultDialogVisible = ref(false)
const resultLoading = ref(false)
const searchResult = ref(null)
const searchCityName = ref('')

// 热门城市列表
const popularCities = [
  { name: '北京', code: '101010100' },
  { name: '上海', code: '101020100' },
  { name: '广州', code: '101280101' },
  { name: '深圳', code: '101280601' },
  { name: '成都', code: '101270101' },
  { name: '杭州', code: '101210101' },
  { name: '武汉', code: '101200101' },
  { name: '西安', code: '101110101' },
  { name: '重庆', code: '101040100' },
  { name: '南京', code: '101190101' },
  { name: '天津', code: '101030100' },
  { name: '苏州', code: '101190401' }
]

// 温度转换
const convertTemp = (celsius) => {
  if (!celsius) return '--'
  if (settingsStore.temperatureUnit === 'fahrenheit') {
    return Math.round(celsius * 9 / 5 + 32)
  }
  return celsius
}

// 搜索城市
const handleGlobalSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入城市名称')
    return
  }

  const matched = popularCities.filter(city => 
    city.name.includes(searchKeyword.value) || 
    searchKeyword.value.includes(city.name)
  )
  
  if (matched.length > 0) {
    searchResults.value = matched.slice(0, 5)
    if (matched.length === 1) {
      await fetchWeatherByCity(matched[0])
    }
  } else {
    searchResults.value = []
    searching.value = true
    try {
      const weatherData = await getWeather(searchKeyword.value)
      if (weatherData && weatherData.cityCode) {
        const city = { name: searchKeyword.value, code: weatherData.cityCode }
        searchResults.value = [city]
        await fetchWeatherByCity(city)
      }
    } catch (error) {
      ElMessage.error('未找到该城市')
    } finally {
      searching.value = false
    }
  }
}

// 获取城市天气
const fetchWeatherByCity = async (city) => {
  resultDialogVisible.value = true
  searchCityName.value = city.name
  resultLoading.value = true
  searchResult.value = null
  
  try {
    const [currentData, forecastData] = await Promise.all([
      getCurrentWeather(city.code),
      getWeatherForecast(city.code)
    ])
    searchResult.value = {
      cityCode: city.code,
      cityName: city.name,
      current: currentData.now,
      forecast: forecastData.daily
    }
  } catch (error) {
    console.error('获取天气失败:', error)
    ElMessage.error('获取天气信息失败')
  } finally {
    resultLoading.value = false
  }
}

// 选择建议城市
const selectCity = (city) => {
  searchKeyword.value = city.name
  searchResults.value = []
  fetchWeatherByCity(city)
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

// 添加到我的城市
const addToCities = async () => {
  if (!searchResult.value) return
  
  try {
    const { cities } = await getCities()
    const exists = cities.some(c => c.city_code === searchResult.value.cityCode)
    
    if (exists) {
      ElMessage.info('该城市已在我的城市中')
    } else {
      await addCity({
        cityName: searchResult.value.cityName,
        cityCode: searchResult.value.cityCode
      })
      ElMessage.success('添加成功')
    }
  } catch (error) {
    console.error('添加失败:', error)
    ElMessage.error('添加失败')
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  background: transparent;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.95));
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  height: 64px;
  gap: 32px;

  .header-left {
    flex-shrink: 0;
    h1 {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      white-space: nowrap;
    }
  }

  .header-center {
    flex: 1;
    max-width: 400px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;

    .el-menu {
      border-bottom: none;
      background: transparent;
      
      .el-menu-item {
        font-size: 14px;
        
        &.is-active {
          color: #409eff;
          border-bottom-color: #409eff;
        }
      }
    }

    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(64, 158, 255, 0.2);
      color: #409eff;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &:hover {
        background: rgba(64, 158, 255, 0.08);
        border-color: #409eff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.global-search {
  position: relative;
  width: 100%;
  
  .search-input {
    width: 100%;
    
    :deep(.el-input__wrapper) {
      border-radius: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      
      &:hover, &.is-focus {
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      }
    }
    
    :deep(.el-button) {
      border-radius: 0 24px 24px 0;
    }
  }
  
  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 8px;
    overflow: hidden;
    
    .search-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      
      &:hover {
        background: #f5f7fa;
      }
      
      .city-name {
        font-weight: 500;
        color: #303133;
      }
      
      .city-code {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.main-content {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

// 弹窗样式
.result-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 40px;
}

.result-content {
  .result-current {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);
    border-radius: 16px;
    margin-bottom: 20px;
    
    .result-temp {
      font-size: 56px;
      font-weight: 300;
      color: #409eff;
    }
    .result-text {
      font-size: 18px;
      font-weight: 500;
      margin: 8px 0;
    }
    .result-feels {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .result-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    
    .detail-item {
      text-align: center;
      padding: 10px;
      background: #f8f9fc;
      border-radius: 12px;
      
      span {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      strong {
        font-size: 16px;
        color: #303133;
      }
    }
  }
  
  .result-action {
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid #e8ecf0;
  }
}

.result-error {
  padding: 30px 0;
}

@media (max-width: 1200px) {
  .header {
    gap: 16px;
    padding: 0 16px;
  }
  .header-center {
    max-width: 280px;
  }
}

@media (max-width: 992px) {
  .header-center {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
    height: 56px;
  }
  .header-left h1 {
    font-size: 16px !important;
  }
  .main-content {
    padding: 16px;
  }
}
</style>