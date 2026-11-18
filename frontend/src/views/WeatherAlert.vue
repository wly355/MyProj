<template>
  <div class="weather-alert-page">
    <!-- 城市选择栏 -->
    <div class="city-bar">
      <div class="city-info">
        <span class="city-name">{{ currentCityName }}</span>
        <span class="update-time">实时监测中</span>
      </div>
      <el-select v-model="selectedCity" @change="onCityChange" placeholder="切换城市" size="small">
        <el-option
          v-for="city in citiesList"
          :key="city.cityCode"
          :label="city.cityName"
          :value="city.cityCode"
        />
      </el-select>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>分析天气数据...</p>
    </div>

    <!-- 无预警时的展示 -->
    <div v-else-if="!hasAnyAlert" class="safe-container">
      <div class="safe-card">
        <div class="safe-icon">🌤️</div>
        <div class="safe-title">暂无天气预警</div>
        <div class="safe-desc">当前天气状况良好，无异常天气</div>
        <div class="current-temp">{{ currentWeather?.temp }}°C</div>
        <div class="current-text">{{ currentWeather?.text }}</div>
      </div>
    </div>

    <!-- 有预警时的展示 -->
    <div v-else class="alerts-container">
      
      <!-- 红色预警 - 最严重 -->
      <div v-if="redAlerts.length > 0" class="alert-card red">
        <div class="alert-header">
          <div class="alert-icon">🔴</div>
          <div class="alert-title">红色预警</div>
          <div class="alert-level">严重</div>
        </div>
        <div class="alert-content">
          <div v-for="alert in redAlerts" :key="alert.id" class="alert-item">
            <div class="alert-msg">{{ alert.message }}</div>
            <div class="alert-action">{{ alert.action }}</div>
          </div>
        </div>
      </div>

      <!-- 橙色预警 -->
      <div v-if="orangeAlerts.length > 0" class="alert-card orange">
        <div class="alert-header">
          <div class="alert-icon">🟠</div>
          <div class="alert-title">橙色预警</div>
          <div class="alert-level">较重</div>
        </div>
        <div class="alert-content">
          <div v-for="alert in orangeAlerts" :key="alert.id" class="alert-item">
            <div class="alert-msg">{{ alert.message }}</div>
            <div class="alert-action">{{ alert.action }}</div>
          </div>
        </div>
      </div>

      <!-- 黄色预警 -->
      <div v-if="yellowAlerts.length > 0" class="alert-card yellow">
        <div class="alert-header">
          <div class="alert-icon">🟡</div>
          <div class="alert-title">黄色预警</div>
          <div class="alert-level">注意</div>
        </div>
        <div class="alert-content">
          <div v-for="alert in yellowAlerts" :key="alert.id" class="alert-item">
            <div class="alert-msg">{{ alert.message }}</div>
            <div class="alert-action">{{ alert.action }}</div>
          </div>
        </div>
      </div>

      <!-- 蓝色提醒 -->
      <div v-if="blueAlerts.length > 0" class="alert-card blue">
        <div class="alert-header">
          <div class="alert-icon">🔵</div>
          <div class="alert-title">出行提醒</div>
          <div class="alert-level">提示</div>
        </div>
        <div class="alert-content">
          <div v-for="alert in blueAlerts" :key="alert.id" class="alert-item">
            <div class="alert-msg">{{ alert.message }}</div>
          </div>
        </div>
      </div>

      <!-- 实时天气卡片 -->
      <div class="weather-card">
        <div class="weather-main">
          <div class="weather-temp">{{ convertTemp(currentWeather?.temp) }}°</div>
          <div class="weather-status">{{ currentWeather?.text }}</div>
          <div class="weather-feels">体感 {{ convertTemp(currentWeather?.feelsLike) }}°</div>
        </div>
        <div class="weather-metrics">
          <div class="metric"><span>💧 湿度</span><strong>{{ currentWeather?.humidity }}%</strong></div>
          <div class="metric"><span>💨 风力</span><strong>{{ currentWeather?.windScale }}级</strong></div>
          <div class="metric"><span>🌬️ 风向</span><strong>{{ currentWeather?.windDir }}</strong></div>
          <div class="metric"><span>📊 气压</span><strong>{{ currentWeather?.pressure }}hPa</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { getCities } from '@/api/user'
import { getCurrentWeather, getWeatherForecast } from '@/api/weather'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const citiesList = ref([])
const selectedCity = ref('')
const currentCityName = ref('')
const currentWeather = ref(null)
const forecastData = ref(null)
const loading = ref(false)

// 预警数据
const redAlerts = ref([])
const orangeAlerts = ref([])
const yellowAlerts = ref([])
const blueAlerts = ref([])

// 是否有任何预警
const hasAnyAlert = computed(() => {
  return redAlerts.value.length > 0 || orangeAlerts.value.length > 0 || 
         yellowAlerts.value.length > 0 || blueAlerts.value.length > 0
})

const convertTemp = (celsius) => {
  if (!celsius) return '--'
  if (settingsStore.temperatureUnit === 'fahrenheit') {
    return Math.round(celsius * 9 / 5 + 32)
  }
  return celsius
}

// 生成预警（真实数据驱动）
const generateAlerts = (current, forecast) => {
  const red = []
  const orange = []
  const yellow = []
  const blue = []
  
  const temp = current.temp
  const windScale = current.windScale
  const text = current.text
  const humidity = current.humidity
  const tomorrow = forecast[1]
  
  // ========== 红色预警 ==========
  if (temp >= 40) {
    red.push({ id: 1, message: '高温红色预警：气温已达40℃以上', action: '请避免户外活动，注意防暑降温' })
  }
  if (temp <= -10) {
    red.push({ id: 2, message: '严寒红色预警：气温已降至-10℃以下', action: '请减少外出，注意保暖防冻' })
  }
  if (windScale >= 8) {
    red.push({ id: 3, message: '大风红色预警：风力已达8级以上', action: '请勿外出，远离广告牌等危险物' })
  }
  if (text.includes('特大暴雨')) {
    red.push({ id: 4, message: '暴雨红色预警：特大暴雨即将来袭', action: '避免外出，注意人身安全' })
  }
  
  // ========== 橙色预警 ==========
  if (temp >= 35 && temp < 40) {
    orange.push({ id: 5, message: `高温橙色预警：气温${temp}℃，持续高温`, action: '减少户外活动，多补充水分' })
  }
  if (temp <= -5 && temp > -10) {
    orange.push({ id: 6, message: `低温橙色预警：气温${temp}℃，寒冷持续`, action: '注意保暖，谨防感冒' })
  }
  if (windScale >= 6 && windScale < 8) {
    orange.push({ id: 7, message: `大风橙色预警：风力${windScale}级`, action: '注意防风，关好门窗' })
  }
  if (text.includes('大暴雨')) {
    orange.push({ id: 8, message: '暴雨橙色预警：大暴雨即将到来', action: '减少外出，注意积水' })
  }
  if (text.includes('暴雪')) {
    orange.push({ id: 9, message: '暴雪橙色预警：强降雪天气', action: '减少出行，注意防滑' })
  }
  
  // ========== 黄色预警 ==========
  if (temp >= 30 && temp < 35) {
    yellow.push({ id: 10, message: `高温黄色预警：气温${temp}℃`, action: '注意防晒，适当补水' })
  }
  if (temp <= 0 && temp > -5) {
    yellow.push({ id: 11, message: `低温黄色预警：气温${temp}℃`, action: '出门多穿一件，注意保暖' })
  }
  if (windScale >= 4 && windScale < 6) {
    yellow.push({ id: 12, message: `大风黄色预警：风力${windScale}级`, action: '注意防风保暖' })
  }
  if (text.includes('大雨')) {
    yellow.push({ id: 13, message: '大雨黄色预警：较强降雨', action: '出门带伞，注意路滑' })
  }
  if (text.includes('中雪')) {
    yellow.push({ id: 14, message: '中雪黄色预警：有明显降雪', action: '路面湿滑，注意安全' })
  }
  if (humidity >= 90) {
    yellow.push({ id: 15, message: `湿度黄色预警：湿度${humidity}%，非常潮湿`, action: '注意除湿，衣物难干' })
  }
  
  // ========== 蓝色提醒 ==========
  if (temp >= 25 && temp < 30) {
    blue.push({ id: 16, message: `温度适中：${temp}℃，天气舒适`, action: '适合出行' })
  }
  if (temp >= 10 && temp < 15) {
    blue.push({ id: 17, message: `天气偏凉：${temp}℃`, action: '建议加一件薄外套' })
  }
  if (text.includes('小雨')) {
    blue.push({ id: 18, message: '小雨天气', action: '出门记得带伞' })
  }
  if (text.includes('雾')) {
    blue.push({ id: 19, message: '有雾天气，能见度较低', action: '注意交通安全' })
  }
  if (text.includes('霾')) {
    blue.push({ id: 20, message: '轻度霾，空气质量一般', action: '建议佩戴口罩' })
  }
  if (tomorrow && tomorrow.tempMax - temp > 5) {
    blue.push({ id: 21, message: `明天升温${tomorrow.tempMax - temp}℃`, action: '注意调整穿搭' })
  }
  if (tomorrow && temp - tomorrow.tempMax > 5) {
    blue.push({ id: 22, message: `明天降温${temp - tomorrow.tempMax}℃`, action: '多穿一件，别着凉' })
  }
  
  return { red, orange, yellow, blue }
}

const loadCities = async () => {
  try {
    const { cities } = await getCities()
    citiesList.value = cities.map(city => ({
      cityCode: city.city_code,
      cityName: city.city_name
    }))
    if (citiesList.value.length > 0) {
      selectedCity.value = citiesList.value[0].cityCode
      currentCityName.value = citiesList.value[0].cityName
      await loadAlertData()
    }
  } catch (error) {
    console.error('加载城市列表失败:', error)
  }
}

const loadAlertData = async () => {
  if (!selectedCity.value) return
  
  loading.value = true
  try {
    const [currentData, forecast] = await Promise.all([
      getCurrentWeather(selectedCity.value),
      getWeatherForecast(selectedCity.value)
    ])
    currentWeather.value = currentData.now
    forecastData.value = forecast.daily
    
    const alerts = generateAlerts(currentData.now, forecast.daily)
    redAlerts.value = alerts.red
    orangeAlerts.value = alerts.orange
    yellowAlerts.value = alerts.yellow
    blueAlerts.value = alerts.blue
  } catch (error) {
    console.error('加载预警数据失败:', error)
  } finally {
    loading.value = false
  }
}

const onCityChange = () => {
  const city = citiesList.value.find(c => c.cityCode === selectedCity.value)
  currentCityName.value = city?.cityName || ''
  loadAlertData()
}

onMounted(() => {
  loadCities()
})
</script>

<style lang="scss" scoped>
.weather-alert-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

// 城市栏
.city-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .city-name {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
  }
  
  .update-time {
    margin-left: 12px;
    font-size: 13px;
    color: #909399;
  }
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
}

// 安全状态
.safe-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .safe-card {
    text-align: center;
    padding: 60px 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    
    .safe-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    .safe-title {
      font-size: 24px;
      font-weight: 600;
      color: #67c23a;
      margin-bottom: 12px;
    }
    .safe-desc {
      font-size: 14px;
      color: #606266;
      margin-bottom: 20px;
    }
    .current-temp {
      font-size: 48px;
      font-weight: 300;
      color: #409eff;
    }
    .current-text {
      font-size: 16px;
      color: #909399;
    }
  }
}

// 预警卡片通用样式
.alert-card {
  border-radius: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .alert-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    
    .alert-icon {
      font-size: 28px;
    }
    .alert-title {
      font-size: 20px;
      font-weight: 700;
      flex: 1;
    }
    .alert-level {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.15);
    }
  }
  
  .alert-content {
    padding: 0 24px 20px 24px;
  }
  
  .alert-item {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 10px;
    
    .alert-msg {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .alert-action {
      font-size: 13px;
      opacity: 0.85;
    }
  }
  
  // 颜色主题
  &.red {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    border-left: 6px solid #ff6b6b;
  }
  &.orange {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    border-left: 6px solid #ffb347;
  }
  &.yellow {
    background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
    color: #422800;
    border-left: 6px solid #fde047;
  }
  &.blue {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-left: 6px solid #60a5fa;
  }
}

// 实时天气卡片
.weather-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  .weather-main {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #e8ecf0;
    
    .weather-temp {
      font-size: 64px;
      font-weight: 300;
      color: #409eff;
    }
    .weather-status {
      font-size: 18px;
      color: #606266;
      margin: 8px 0;
    }
    .weather-feels {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .weather-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding-top: 20px;
    text-align: center;
    
    .metric {
      span {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
      }
      strong {
        font-size: 18px;
        color: #303133;
      }
    }
  }
}

@media (max-width: 768px) {
  .weather-metrics {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .city-bar {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>