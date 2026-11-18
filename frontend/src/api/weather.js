import request from '@/utils/request'

export const getWeather = (city) => {
  return request({
    url: '/weather',
    method: 'get',
    params: { city }
  })
}

export const getCurrentWeather = (cityCode) => {
  return request({
    url: '/weather/current',
    method: 'get',
    params: { cityCode }
  })
}

export const getWeatherForecast = (cityCode) => {
  return request({
    url: '/weather/forecast',
    method: 'get',
    params: { cityCode }
  })
}

