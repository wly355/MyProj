const axios = require('axios');
const { API_HOST, API_KEY } = require('../config/qweather');
const db = require('../config/db');

// 记录API调用日志
async function logApiCall(apiName, params, status, success, errorMessage, responseTime) {
  try {
    await db.query(
      'INSERT INTO api_logs (api_name, request_params, response_status, success, error_message, response_time) VALUES (?, ?, ?, ?, ?, ?)',
      [apiName, JSON.stringify(params), status, success, errorMessage, responseTime]
    );
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
}

// 查询城市信息
exports.searchCity = async (cityName) => {
  const startTime = Date.now();
  try {
    const url = `${API_HOST}/geo/v2/city/lookup`;
    const response = await axios.get(url, {
      params: {
        location: cityName,
        key: API_KEY
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.data.code !== '200' || !response.data.location || response.data.location.length === 0) {
      await logApiCall('city_lookup', { cityName }, response.data.code, false, '未找到城市', responseTime);
      throw new Error(`未能找到城市: ${cityName}`);
    }

    await logApiCall('city_lookup', { cityName }, response.data.code, true, null, responseTime);
    return response.data.location[0];
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiCall('city_lookup', { cityName }, 'error', false, error.message, responseTime);
    throw error;
  }
};

// 获取实时天气
exports.getCurrentWeather = async (locationId) => {
  const startTime = Date.now();
  try {
    const url = `${API_HOST}/v7/weather/now`;
    const response = await axios.get(url, {
      params: {
        location: locationId,
        key: API_KEY
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.data.code !== '200') {
      await logApiCall('weather_now', { locationId }, response.data.code, false, '获取实时天气失败', responseTime);
      throw new Error('获取实时天气失败');
    }
    
    await logApiCall('weather_now', { locationId }, response.data.code, true, null, responseTime);
    return response.data.now;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiCall('weather_now', { locationId }, 'error', false, error.message, responseTime);
    throw error;
  }
};

// 获取7天天气预报
exports.getForecast = async (locationId) => {
  const startTime = Date.now();
  try {
    const url = `${API_HOST}/v7/weather/7d`;
    const response = await axios.get(url, {
      params: {
        location: locationId,
        key: API_KEY
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.data.code !== '200') {
      await logApiCall('weather_7d', { locationId }, response.data.code, false, '获取天气预报失败', responseTime);
      throw new Error('获取天气预报失败');
    }
    
    await logApiCall('weather_7d', { locationId }, response.data.code, true, null, responseTime);
    return response.data.daily;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiCall('weather_7d', { locationId }, 'error', false, error.message, responseTime);
    throw error;
  }
};

