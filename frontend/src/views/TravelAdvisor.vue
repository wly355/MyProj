<template>
  <div class="travel-advisor-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🚗 出行参谋</span>
          <el-tag type="info" size="small">基于关注城市天气对比</el-tag>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <div>分析中...</div>
      </div>

      <!-- 无城市 -->
      <div v-else-if="citiesWeather.length === 0" class="empty-state">
        <el-empty description="暂无关注城市，请先添加城市" />
      </div>

      <!-- 主要内容 -->
      <div v-else class="advisor-content">
        
        <!-- ========== 今日推荐 ========== -->
        <div class="recommend-section" v-if="bestCity">
          <div class="section-title">
            <span class="title-icon">🌟</span>
            <span class="title-text">今日推荐出行</span>
            <span class="title-tag">最佳选择</span>
          </div>
          <div class="recommend-card">
            <div class="recommend-city">
              <span class="city-name">{{ bestCity.cityName }}</span>
              <span class="city-badge">推荐</span>
            </div>
            <div class="recommend-weather">
              <img :src="getWeatherIcon(bestCity.current.icon)" class="weather-icon" />
              <span class="weather-text">{{ bestCity.current.text }}</span>
              <span class="weather-temp">{{ convertTemp(bestCity.current.temp) }}°</span>
            </div>
            <div class="recommend-reason">
              <span>📊 综合评分 {{ bestCity.score }}分</span>
              <span>{{ bestCity.reason }}</span>
            </div>
          </div>
        </div>

        <!-- ========== 城市对比表格 ========== -->
        <div class="compare-section">
          <div class="section-title">
            <span class="title-icon">📊</span>
            <span class="title-text">关注城市天气对比</span>
            <span class="title-tag">{{ citiesWeather.length }}个城市</span>
          </div>
          
          <div class="compare-table">
            <table>
              <thead>
                <tr>
                  <th>城市</th>
                  <th>天气</th>
                  <th>温度</th>
                  <th>体感</th>
                  <th>风力</th>
                  <th>湿度</th>
                  <th>出行指数</th>
                  <th>建议</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="city in sortedCities" :key="city.cityCode">
                  <td class="city-cell">
                    <span class="city-name">{{ city.cityName }}</span>
                    <el-tag v-if="city.isPinned" size="small" type="warning" class="pin-tag">置顶</el-tag>
                  </td>
                  <td class="weather-cell">
                    <img :src="getWeatherIcon(city.current.icon)" class="table-icon" />
                    <span>{{ city.current.text }}</span>
                  </td>
                  <td class="temp-cell">{{ convertTemp(city.current.temp) }}°</td>
                  <td>{{ convertTemp(city.current.feelsLike) }}°</td>
                  <td>{{ city.current.windScale }}级</td>
                  <td>{{ city.current.humidity }}%</td>
                  <td class="score-cell">
                    <span :class="getScoreClass(city.score)">{{ city.score }}分</span>
                  </td>
                  <td class="advice-cell">{{ getCityAdvice(city) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========== 出行小贴士 ========== -->
        <div class="tips-section">
          <div class="section-title">
            <span class="title-icon">💡</span>
            <span class="title-text">出行小贴士</span>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <span class="tip-icon">🌂</span>
              <span>雨天出行记得带伞，路面湿滑注意安全</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🧥</span>
              <span>温差较大地区建议"洋葱式"穿衣法，方便随时增减</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🧴</span>
              <span>紫外线强时做好防晒，避免长时间暴晒</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">💨</span>
              <span>大风天气远离广告牌，注意高空坠物</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { getWeatherIcon } from '@/utils/weatherIcons'
import { getCities } from '@/api/user'
import { getCurrentWeather, getWeatherForecast } from '@/api/weather'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(false)
const citiesWeather = ref([])

const convertTemp = (celsius) => {
  if (!celsius && celsius !== 0) return '--'
  if (settingsStore.temperatureUnit === 'fahrenheit') {
    return Math.round(celsius * 9 / 5 + 32)
  }
  return celsius
}

const calculateScore = (weather) => {
  let score = 100
  const temp = weather.temp
  const text = weather.text || ''
  const windScale = weather.windScale
  
  // 温度扣分
  if (temp < 0 || temp > 35) score -= 40
  else if (temp < 5 || temp > 32) score -= 25
  else if (temp < 10 || temp > 30) score -= 15
  else if (temp < 15 || temp > 28) score -= 5
  
  // 天气扣分
  if (text.includes('暴雨') || text.includes('大雪')) score -= 50
  else if (text.includes('大雨') || text.includes('中雪')) score -= 35
  else if (text.includes('中雨') || text.includes('小雪')) score -= 25
  else if (text.includes('小雨') || text.includes('雪')) score -= 15
  else if (text.includes('阴')) score -= 10
  else if (text.includes('多云')) score -= 5
  
  // 风力扣分
  if (windScale >= 6) score -= 30
  else if (windScale >= 4) score -= 15
  else if (windScale >= 3) score -= 5
  
  return Math.max(0, Math.min(100, score))
}
const getScoreClass = (score) => {
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-normal'
  return 'score-bad'
}

const getCityAdvice = (city) => {
  if (!city || !city.current) return '暂无数据'
  const text = city.current.text || ''
  const score = city.score
  
  if (score >= 80) return '✅ 适宜出行'
  if (text.includes('雨')) return '🌂 记得带伞'
  if (text.includes('雪')) return '🧣 注意保暖'
  if (city.current.windScale >= 5) return '💨 风力较大'
  if (city.current.temp <= 5) return '🧥 天气寒冷'
  if (city.current.temp >= 30) return '☀️ 注意防晒'
  return '⚠️ 谨慎出行'
}

const getRecommendReason = (city) => {
  const score = city.score
  const text = city.current?.text || ''
  
  if (score >= 90) return '天气极佳，非常适合出行'
  if (score >= 80) return '天气舒适，适合户外活动'
  if (score >= 70) return '天气不错，可以正常出行'
  if (text.includes('晴')) return '晴天为主，适合出游'
  return '相比其他城市天气更好'
}

const loadCitiesWeather = async () => {
  loading.value = true
  try {
    const { cities } = await getCities()
    console.log('关注城市:', cities)
    
    if (cities.length === 0) {
      citiesWeather.value = []
      return
    }

    const weatherPromises = cities.map(async (city) => {
      try {
        const currentData = await getCurrentWeather(city.city_code)
        console.log(`${city.city_name} 天气数据:`, currentData)
        
        if (!currentData || !currentData.now) {
          return null
        }
        
        const weather = currentData.now
        const score = calculateScore(weather)
        
        return {
          cityCode: city.city_code,
          cityName: city.city_name,
          isPinned: city.is_pinned,
          current: weather,
          score: score,
          reason: getRecommendReason({ score, current: weather })
        }
      } catch (error) {
        console.error(`获取 ${city.city_name} 天气失败:`, error)
        return null
      }
    })

    const results = await Promise.all(weatherPromises)
    console.log('所有结果:', results)
    citiesWeather.value = results.filter(item => item !== null)
    console.log('最终数据:', citiesWeather.value)
  } catch (error) {
    console.error('加载城市天气失败:', error)
  } finally {
    loading.value = false
  }
}

const sortedCities = computed(() => {
  return [...citiesWeather.value].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return (b.score || 0) - (a.score || 0)
  })
})

const bestCity = computed(() => {
  if (sortedCities.value.length === 0) return null
  return sortedCities.value[0]
})

onMounted(async () => {
  await settingsStore.loadSettings()
  await loadCitiesWeather()
})
</script>
<style lang="scss" scoped>
.travel-advisor-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  span {
    font-size: 18px;
    font-weight: 600;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
}

.empty-state {
  padding: 60px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8ecf0;
  
  .title-icon {
    font-size: 22px;
  }
  .title-text {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  .title-tag {
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 20px;
  }
}

// 推荐卡片
.recommend-section {
  margin-bottom: 20px;
}

.recommend-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  color: white;
  
  .recommend-city {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .city-name {
      font-size: 28px;
      font-weight: 700;
    }
    .city-badge {
      background: rgba(255, 255, 255, 0.25);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
  }
  
  .recommend-weather {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    
    .weather-icon {
      width: 48px;
      height: 48px;
    }
    .weather-text {
      font-size: 20px;
      font-weight: 500;
    }
    .weather-temp {
      font-size: 36px;
      font-weight: 300;
    }
  }
  
  .recommend-reason {
    display: flex;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 14px;
  }
}

// 对比表格 - 关键修复
.compare-section {
  margin-bottom: 20px;
  overflow-x: auto;
  
  .compare-table {
    width: 100%;
    overflow-x: auto;
    
    table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      th, td {
        padding: 14px 12px;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
      }
      
      th {
        background: #f8f9fc;
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      td {
        font-size: 14px;
        color: #606266;
      }
      
      tr:hover td {
        background: #f5f7fa;
      }
      
      .city-cell {
        text-align: left;
        font-weight: 600;
        
        .city-name {
          color: #303133;
        }
        .pin-tag {
          margin-left: 8px;
          transform: scale(0.85);
        }
      }
      
      .weather-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        
        .table-icon {
          width: 24px;
          height: 24px;
        }
      }
      
      .temp-cell {
        font-weight: 600;
        color: #409eff;
      }
      
      .score-good {
        color: #67c23a;
        font-weight: 600;
      }
      .score-normal {
        color: #e6a23c;
        font-weight: 500;
      }
      .score-bad {
        color: #f56c6c;
        font-weight: 500;
      }
      
      .advice-cell {
        font-size: 13px;
      }
    }
  }
}

// 出行小贴士
.tips-section {
  margin-top: 20px;
  
  .tips-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .tip-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8f9fc;
      border-radius: 12px;
      
      .tip-icon {
        font-size: 24px;
      }
      span:last-child {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

@media (max-width: 768px) {
  .tips-list {
    grid-template-columns: 1fr !important;
  }
  
  .recommend-card .recommend-city .city-name {
    font-size: 22px;
  }
}
</style>