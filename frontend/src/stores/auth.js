import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    const data = await loginApi(credentials)
    console.log('登录返回数据:', data)
    console.log('token值:', data.token)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    const savedToken = localStorage.getItem('token')
    console.log('保存后的token:', savedToken)
    router.push('/')
  }

  const register = async (credentials) => {
    await registerApi(credentials)
    router.push('/login')
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout
  }
})

