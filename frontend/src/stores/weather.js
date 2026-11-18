import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWeather as getWeatherApi } from '@/api/weather'

export const useWeatherStore = defineStore('weather', () => {
  const currentWeather = ref(null)
  const loading = ref(false)
  
  const fetchWeather = async (city) => {
    loading.value = true
    try {
      const data = await getWeatherApi(city)
      currentWeather.value = data
      return data
    } finally {
      loading.value = false
    }
  }
  
  return {
    currentWeather,
    loading,
    fetchWeather
  }
})

