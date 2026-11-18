// MSN天气图标映射
const MSN_ICON_BASE = 'https://assets.msn.cn/weathermapdata/1/static/weather/Icons/taskbar_v10/Condition_Card'

// 和风天气图标代码到MSN图标的映射
const iconMap = {
  // 晴天
  '100': 'SunnyDayV3.svg',           // 晴(白天)
  '150': 'ClearNightV3.svg',         // 晴(夜间)
  
  // 多云
  '101': 'MostlySunnyDay.svg',       // 多云(白天)
  '102': 'D200PartlySunnyV2.svg',    // 少云(白天)
  '103': 'MostlyCloudyDayV2.svg',    // 晴间多云(白天)
  '151': 'MostlyClearNight.svg',     // 多云(夜间)
  '152': 'PartlyCloudyNightV2.svg',  // 少云(夜间)
  '153': 'MostlyCloudyNightV2.svg',  // 晴间多云(夜间)
  
  // 阴天
  '104': 'CloudyV3.svg',             // 阴
  
  // 雨
  '300': 'ShowersDay.svg',           // 阵雨(白天)
  '301': 'RainShowersDay.svg',       // 强阵雨(白天)
  '302': 'ThunderstormsDay.svg',     // 雷阵雨(白天)
  '303': 'ThunderstormsDay.svg',     // 强雷阵雨(白天)
  '304': 'RainShowersDay.svg',       // 雷阵雨伴有冰雹(白天)
  '305': 'LightRainV2.svg',          // 小雨
  '306': 'ModerateRainV2.svg',       // 中雨
  '307': 'HeavyRainV2.svg',          // 大雨
  '308': 'HeavyRainV2.svg',          // 极端降雨
  '309': 'DrizzleV2.svg',            // 毛毛雨/细雨
  '310': 'HeavyRainV2.svg',          // 暴雨
  '311': 'HeavyRainV2.svg',          // 大暴雨
  '312': 'HeavyRainV2.svg',          // 特大暴雨
  '313': 'FreezingRainV2.svg',       // 冻雨
  '314': 'LightRainV2.svg',          // 小到中雨
  '315': 'ModerateRainV2.svg',       // 中到大雨
  '316': 'HeavyRainV2.svg',          // 大到暴雨
  '317': 'HeavyRainV2.svg',          // 暴雨到大暴雨
  '318': 'HeavyRainV2.svg',          // 大暴雨到特大暴雨
  '350': 'ShowersNight.svg',         // 阵雨(夜间)
  '351': 'RainShowersNight.svg',     // 强阵雨(夜间)
  
  // 雪
  '400': 'SnowShowersDay.svg',       // 阵雪(白天)
  '401': 'SnowShowersDay.svg',       // 强阵雪(白天)
  '402': 'RainAndSnow.svg',          // 雨夹雪
  '403': 'RainAndSnow.svg',          // 强雨夹雪
  '404': 'RainAndSnow.svg',          // 雨雪天气
  '405': 'LightSnowV2.svg',          // 小雪
  '406': 'ModerateSnowV2.svg',       // 中雪
  '407': 'HeavySnowV2.svg',          // 大雪
  '408': 'HeavySnowV2.svg',          // 暴雪
  '409': 'LightSnowV2.svg',          // 小到中雪
  '410': 'ModerateSnowV2.svg',       // 中到大雪
  '456': 'SnowShowersNight.svg',     // 阵雪(夜间)
  '457': 'SnowShowersNight.svg',     // 强阵雪(夜间)
  
  // 雾霾
  '500': 'FogV2.svg',                // 薄雾
  '501': 'FogV2.svg',                // 雾
  '502': 'HazeV3.svg',               // 霾
  '503': 'DustV2.svg',               // 扬沙
  '504': 'DustV2.svg',               // 浮尘
  '507': 'DustV2.svg',               // 沙尘暴
  '508': 'DustV2.svg',               // 强沙尘暴
  '509': 'FogV2.svg',                // 浓雾
  '510': 'FogV2.svg',                // 强浓雾
  '511': 'HazeV3.svg',               // 中度霾
  '512': 'HazeV3.svg',               // 重度霾
  '513': 'HazeV3.svg',               // 严重霾
  '514': 'FogV2.svg',                // 大雾
  '515': 'FogV2.svg',                // 特强浓雾
}

/**
 * 根据和风天气图标代码获取MSN天气图标URL
 * @param {string} iconCode - 和风天气图标代码
 * @returns {string} MSN天气图标URL
 */
export function getWeatherIcon(iconCode) {
  const iconFile = iconMap[iconCode] || 'CloudyV3.svg' // 默认使用阴天图标
  return `${MSN_ICON_BASE}/${iconFile}`
}

/**
 * 根据天气文本描述获取图标
 * @param {string} text - 天气文本描述
 * @returns {string} MSN天气图标URL
 */
export function getWeatherIconByText(text) {
  if (!text) return `${MSN_ICON_BASE}/CloudyV3.svg`
  
  // 简单的文本匹配
  if (text.includes('晴')) {
    return `${MSN_ICON_BASE}/SunnyDayV3.svg`
  } else if (text.includes('云')) {
    return `${MSN_ICON_BASE}/MostlyCloudyDayV2.svg`
  } else if (text.includes('雨')) {
    return `${MSN_ICON_BASE}/ModerateRainV2.svg`
  } else if (text.includes('雪')) {
    return `${MSN_ICON_BASE}/ModerateSnowV2.svg`
  } else if (text.includes('雾') || text.includes('霾')) {
    return `${MSN_ICON_BASE}/FogV2.svg`
  } else if (text.includes('阴')) {
    return `${MSN_ICON_BASE}/CloudyV3.svg`
  }
  
  return `${MSN_ICON_BASE}/CloudyV3.svg`
}

/**
 * 判断是否为白天
 * @returns {boolean}
 */
export function isDaytime() {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18
}

