// 天气智能化建议服务
export function useWeatherAdvice() {
  
  // 1. 出行推荐指数 (0-100分)
  const getTravelIndex = (weather) => {
    if (!weather) return null;
    
    let score = 100;
    
    // 温度评分
    const temp = weather.temp;
    if (temp < 0 || temp > 35) score -= 30;
    else if (temp < 5 || temp > 32) score -= 20;
    else if (temp < 10 || temp > 30) score -= 10;
    
    // 降水评分
    const rain = weather.text;
    if (rain.includes('雨') || rain.includes('雪')) score -= 30;
    else if (rain.includes('阴')) score -= 10;
    
    // 风力评分
    const windScale = weather.windScale;
    if (windScale >= 6) score -= 30;
    else if (windScale >= 4) score -= 15;
    else if (windScale >= 3) score -= 5;
    
    // 紫外线评分 (如果有)
    if (weather.uvIndex && weather.uvIndex >= 6) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };
  
  // 2. 根据指数获取建议等级
  const getAdviceLevel = (index) => {
    if (index === null) return null;
    if (index >= 80) return { level: '极适宜', text: '天气很棒，适合户外活动', icon: '😊' };
    if (index >= 60) return { level: '适宜', text: '天气不错，可以正常出行', icon: '🙂' };
    if (index >= 40) return { level: '一般', text: '天气尚可，建议随身带伞', icon: '😐' };
    if (index >= 20) return { level: '较差', text: '天气较差，减少外出', icon: '😟' };
    return { level: '极差', text: '天气恶劣，不建议出行', icon: '😰' };
  };
  
  // 3. 穿衣推荐
  const getDressingAdvice = (temp) => {
    if (temp === undefined) return null;
    
    if (temp < 0) return '🥶 极寒！羽绒服+围巾+手套+帽子';
    if (temp < 5) return '🧥 很冷，厚羽绒服+围巾+手套';
    if (temp < 10) return '🧥 偏冷，大衣/棉服+毛衣';
    if (temp < 15) return '🧥 微凉，外套+长袖';
    if (temp < 20) return '👕 舒适，长袖或薄外套';
    if (temp < 25) return '👕 温暖，短袖+薄外套';
    if (temp < 30) return '☀️ 较热，短袖+防晒衣';
    return '🥵 炎热！清凉夏装+防晒+多喝水';
  };
  
  // 4. 天气变化提醒（今天 vs 明天）
  const getChangeAlert = (today, tomorrow) => {
    if (!today || !tomorrow) return null;
    
    const tempDiff = tomorrow.tempMax - today.tempMax;
    const todayRain = today.textDay?.includes('雨');
    const tomorrowRain = tomorrow.textDay?.includes('雨');
    
    if (tempDiff > 5) return '📈 明天升温明显，注意减衣';
    if (tempDiff < -5) return '📉 明天明显降温，多穿一件！';
    if (!todayRain && tomorrowRain) return '🌧️ 明天有雨，记得带伞';
    if (todayRain && !tomorrowRain) return '☀️ 明天雨停，适合出门';
    if (Math.abs(tempDiff) >= 3) return `🌡️ 明天温差${Math.abs(tempDiff)}度，注意调整穿搭`;
    
    return null;
  };
  
  // 5. 趋势分析（7天概要）
  const getTrendSummary = (forecast) => {
    if (!forecast || forecast.length === 0) return null;
    
    let rainDays = 0;
    let maxTemp = -100;
    let minTemp = 100;
    
    forecast.forEach(day => {
      if (day.textDay?.includes('雨')) rainDays++;
      maxTemp = Math.max(maxTemp, day.tempMax);
      minTemp = Math.min(minTemp, day.tempMin);
    });
    
    if (rainDays > 3) return `📅 未来${forecast.length}天有${rainDays}天雨，出门记得带伞`;
    if (maxTemp - minTemp > 15) return `📅 周内温差较大，注意及时增减衣物`;
    if (rainDays === 0) return `📅 未来一周无雨，适合安排户外活动`;
    
    return `📅 最高${maxTemp}° / 最低${minTemp}°，注意天气变化`;
  };
  
  return {
    getTravelIndex,
    getAdviceLevel,
    getDressingAdvice,
    getChangeAlert,
    getTrendSummary
  };
}