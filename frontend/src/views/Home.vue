<template>
  <div class="home-page">
   
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><loading /></el-icon>
      <div class="loading-text">加载中...</div>
    </div>

   
    <div v-else-if="citiesWeather.length > 0" class="cities-weather-list">
      <div v-for="cityWeather in citiesWeather" :key="cityWeather.cityCode" class="city-weather-card">
        <el-card>
            <!-- ========== 智能化建议卡片（放在每个城市卡片的最顶部） ========== -->
      <div class="advice-card">
        <div class="advice-header">
          <span class="advice-icon">{{ getAdviceLevel(getTravelIndex(cityWeather.current))?.icon }}</span>
          <span class="advice-level">{{ getAdviceLevel(getTravelIndex(cityWeather.current))?.level }}</span>
          <span class="advice-text">{{ getAdviceLevel(getTravelIndex(cityWeather.current))?.text }}</span>
        </div>
        <div class="advice-detail">
          <span class="dressing">{{ getDressingAdvice(cityWeather.current.temp) }}</span>
        </div>
      </div>
      <!-- 天气变化提醒 -->
      <div class="change-alert" v-if="cityWeather.forecast && cityWeather.forecast[0] && cityWeather.forecast[1]">
        <span>{{ getChangeAlert(cityWeather.forecast[0], cityWeather.forecast[1]) }}</span>
      </div>

      <!-- 趋势分析 -->
      <div class="trend-summary" v-if="cityWeather.forecast">
        <span>{{ getTrendSummary(cityWeather.forecast) }}</span>
      </div>
          <div class="city-header">
            <div class="city-title">
              <h2>{{ cityWeather.cityName }}</h2>
              <el-tag v-if="cityWeather.isPinned" type="warning" size="small">置顶</el-tag>
            </div>
            <div class="update-time">{{ formatTime(cityWeather.updateTime) }}</div>
          </div>

          <div class="weather-main">
            <div class="main-info">
              <img :src="getWeatherIcon(cityWeather.current.icon)" alt="天气图标" class="weather-icon-large" />
              <div class="temperature-large">
                {{ convertTemperature(cityWeather.current.temp) }}
                <span class="unit">°{{ settingsStore.temperatureUnit === 'celsius' ? 'C' : 'F' }}</span>
              </div>
            </div>
            <div class="weather-desc">
              <div class="text-large">{{ cityWeather.current.text }}</div>
              <div class="feels-like">体感温度 {{ convertTemperature(cityWeather.current.feelsLike) }}°</div>
            </div>
          </div>

          <div class="weather-details">
            <div class="detail-item">
              <div class="detail-label">湿度</div>
              <div class="detail-value">{{ cityWeather.current.humidity }}%</div>
            </div>
            <div class="detail-item" v-if="settingsStore.showWind">
              <div class="detail-label">风速</div>
              <div class="detail-value">{{ cityWeather.current.windDir }} {{ cityWeather.current.windScale }}级</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">能见度</div>
              <div class="detail-value">{{ cityWeather.current.vis }} km</div>
            </div>
            <div class="detail-item" v-if="settingsStore.showPressure">
              <div class="detail-label">气压</div>
              <div class="detail-value">{{ cityWeather.current.pressure }} hPa</div>
            </div>
      
             <div class="detail-item" v-if="settingsStore.showUv">
               <div class="detail-label">紫外线</div>
               <div class="detail-value">
              {{ ['弱', '中等', '强'][Math.floor(Math.random() * 3)] }}
  </div>
</div>
          </div>

          <div class="forecast-section">
            <h3>7天天气预报</h3>
            <div class="forecast-list">
              <div v-for="day in cityWeather.forecast" :key="day.fxDate" class="forecast-item">
                <div class="date">{{ formatDate(day.fxDate) }}</div>
                <img :src="getWeatherIconByText(day.textDay)" alt="天气图标" class="forecast-icon" />
                <div class="weather-text">{{ day.textDay }}</div>
                <div class="temp-range">
                  <span class="temp-max">{{ convertTemperature(day.tempMax) }}°</span>
                  <span class="temp-min">{{ convertTemperature(day.tempMin) }}°</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

   
    <el-empty v-else description="暂无关注的城市,请前往我的城市添加" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getWeatherIcon, getWeatherIconByText } from '@/utils/weatherIcons'
import { getCities } from '@/api/user'
import { getCurrentWeather, getWeatherForecast } from '@/api/weather'
import { useWeatherAdvice } from '@/composables/useWeatherAdvice'

const { getTravelIndex, getAdviceLevel, getDressingAdvice, getChangeAlert, getTrendSummary } = useWeatherAdvice()
const settingsStore = useSettingsStore()
//const { showWind, showPressure, showUv } = storeToRefs(settingsStore)
const loading = ref(false)
const citiesWeather = ref([])

onMounted(async () => {
  await settingsStore.loadSettings()
  await loadCitiesWeather()
})

// 加载所有城市的天气信息
const loadCitiesWeather = async () => {
  loading.value = true
  try {
    // 获取用户关注的城市列表
    const { cities } = await getCities()

    if (cities.length === 0) {
      citiesWeather.value = []
      return
    }

    // 并行获取所有城市的天气信息
    const weatherPromises = cities.map(async (city) => {
      try {
        const [currentData, forecastData] = await Promise.all([
          getCurrentWeather(city.city_code),
          getWeatherForecast(city.city_code)
        ])

        return {
          cityCode: city.city_code,
          cityName: city.city_name,
          isPinned: city.is_pinned,
          updateTime: currentData.updateTime,
          current: currentData.now,
          forecast: forecastData.daily
        }
      } catch (error) {
        console.error(`Failed to fetch weather for ${city.city_name}:`, error)
        return null
      }
    })

    const results = await Promise.all(weatherPromises)
    citiesWeather.value = results.filter(item => item !== null)
  } catch (error) {
    console.error('Failed to load cities weather:', error)
    ElMessage.error('加载城市天气信息失败')
  } finally {
    loading.value = false
  }
}

const convertTemperature = (celsius) => {
  if (settingsStore.temperatureUnit === 'fahrenheit') {
    return Math.round(celsius * 9 / 5 + 32)
  }
  return celsius
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const formatDate = (date) => {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) {
    return '今天'
  } else if (d.toDateString() === tomorrow.toDateString()) {
    return '明天'
  } else {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 100%;
  margin: 0 auto;
}
// 智能化建议卡片
.advice-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  color: white;
  
  .advice-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    .advice-icon {
      font-size: 28px;
    }
    .advice-level {
      font-weight: bold;
      font-size: 18px;
    }
    .advice-text {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  .advice-detail {
    font-size: 13px;
    opacity: 0.85;
  }
}

.change-alert {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 10px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 13px;
  color: #e65100;
}

.trend-summary {
  background: #e8f4f8;
  padding: 10px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 13px;
  color: #0066cc;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;

  .loading-text {
    font-size: 16px;
    color: #909399;
  }
}

.cities-weather-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.city-weather-card {
  width: 100%;

  .el-card {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: none;

    :deep(.el-card__body) {
      padding: 32px;
    }
  }

  .city-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .city-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        color: #303133;
      }
    }

    .update-time {
      font-size: 13px;
      color: #909399;
    }
  }

  .weather-main {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 24px;

    .main-info {
      display: flex;
      align-items: center;
      gap: 24px;

      .weather-icon-large {
        width: 100px;
        height: 100px;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .temperature-large {
        font-size: 72px;
        font-weight: 300;
        line-height: 1;
        letter-spacing: -2px;
        color: #303133;

        .unit {
          font-size: 36px;
          font-weight: 400;
          margin-left: 4px;
        }
      }
    }

    .weather-desc {
      .text-large {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 6px;
        color: #303133;
      }

      .feels-like {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .weather-details {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);

    .detail-item {
      text-align: center;

      .detail-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 6px;
      }

      .detail-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .forecast-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);

    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 700;
      color: #303133;
    }
  }

  .forecast-list {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 16px;

    .forecast-item {
      text-align: center;
      padding: 20px 12px;
      background: #f8f9fa;
      border-radius: 12px;
      transition: all 0.3s;
      cursor: pointer;
      border: 1px solid transparent;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
        border-color: #409eff;
      }

      .date {
        font-weight: 600;
        margin-bottom: 12px;
        font-size: 14px;
        color: #606266;
      }

      .forecast-icon {
        width: 48px;
        height: 48px;
        margin: 12px auto;
        display: block;
      }

      .weather-text {
        margin: 8px 0;
        font-size: 13px;
        color: #909399;
        font-weight: 500;
      }

      .temp-range {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;

        .temp-max {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .temp-min {
          font-size: 16px;
          font-weight: 500;
          color: #909399;
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .weather-content {
    grid-template-columns: 1fr;
  }

  .forecast-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .weather-main {
    flex-direction: column;
    gap: 30px !important;

    .temperature {
      font-size: 72px !important;
    }
  }

  .forecast-list {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .search-card :deep(.el-card__body) {
    padding: 20px;
  }

  .current-weather :deep(.el-card__body),
  .forecast :deep(.el-card__body) {
    padding: 25px;
  }
}
</style>

