import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSettings, updateSettings as updateSettingsApi } from '@/api/user'

export const useSettingsStore = defineStore('settings', () => {
  const temperatureUnit = ref('celsius')
  const theme = ref('light')
  const language = ref('zh-CN')
  const showWind = ref(true)
  const showPressure = ref(true)
  const showUv = ref(true)
  const loadSettings = async () => {
    try {
      const data = await getSettings()
      temperatureUnit.value = data.temperatureUnit
      theme.value = data.theme
      language.value = data.language
      if (data.showWind !== undefined) showWind.value = data.showWind
      if (data.showPressure !== undefined) showPressure.value = data.showPressure
      if (data.showUv !== undefined) showUv.value = data.showUv
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  
  const updateSettings = async (settings) => {
    await updateSettingsApi(settings)
    if (settings.temperatureUnit) temperatureUnit.value = settings.temperatureUnit
    if (settings.theme) theme.value = settings.theme
    if (settings.language) language.value = settings.language
    if (settings.showWind !== undefined) showWind.value = settings.showWind
    if (settings.showPressure !== undefined) showPressure.value = settings.showPressure
    if (settings.showUv !== undefined) showUv.value = settings.showUv
  }
  
  return {
    temperatureUnit,
    theme,
    language,
    showWind,       // 【新增】
    showPressure,   // 【新增】
    showUv,         // 【新增】
    loadSettings,
    updateSettings
  }
})

