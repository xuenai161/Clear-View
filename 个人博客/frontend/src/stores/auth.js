import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth as authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(userData, tokenData) {
    user.value = userData
    token.value = tokenData
    if (tokenData) {
      localStorage.setItem('token', tokenData)
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const { data } = await authApi.me()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch {
      setAuth(null, '')
    }
  }

  function logout() {
    setAuth(null, '')
  }

  return { user, token, isLoggedIn, setAuth, fetchMe, logout }
})
