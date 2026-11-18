const qweatherService = require('../services/qweatherService');

exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: '请提供城市名称' });
    }

    // 查询城市信息
    const cityInfo = await qweatherService.searchCity(city);

    // 并行获取实时天气和预报
    const [currentWeather, forecast] = await Promise.all([
      qweatherService.getCurrentWeather(cityInfo.id),
      qweatherService.getForecast(cityInfo.id)
    ]);

    const weatherData = {
      city: cityInfo.name,
      cityCode: cityInfo.id,
      current: currentWeather,
      forecast: forecast,
      updateTime: new Date().toISOString()
    };

    res.json(weatherData);
  } catch (error) {
    next(error);
  }
};

// 获取实时天气(通过城市代码)
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const { cityCode } = req.query;

    if (!cityCode) {
      return res.status(400).json({ message: '请提供城市代码' });
    }

    const currentWeather = await qweatherService.getCurrentWeather(cityCode);

    res.json({
      now: currentWeather,
      updateTime: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// 获取天气预报(通过城市代码)
exports.getWeatherForecast = async (req, res, next) => {
  try {
    const { cityCode } = req.query;

    if (!cityCode) {
      return res.status(400).json({ message: '请提供城市代码' });
    }

    const forecast = await qweatherService.getForecast(cityCode);

    res.json({
      daily: forecast
    });
  } catch (error) {
    next(error);
  }
};

