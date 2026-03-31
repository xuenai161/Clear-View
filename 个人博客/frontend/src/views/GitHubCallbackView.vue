<template>
  <div class="callback-page">
    <p v-if="loading">正在登录...</p>
    <p v-else-if="error" class="error">{{ error }} <RouterLink to="/login">返回登录</RouterLink></p>
    <p v-else>登录成功，正在跳转...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { auth as authApi } from '../api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state
  const storedState = localStorage.getItem('github_oauth_state')
  if (!code) {
    error.value = '缺少授权码'
    loading.value = false
    return
  }
  if (!state || !storedState || state !== storedState) {
    error.value = 'OAuth state 校验失败，请重新发起登录'
    loading.value = false
    return
  }
  try {
    const { data } = await authApi.githubCallback(code, state)
    localStorage.removeItem('github_oauth_state')
    authStore.setAuth(data.user, data.token)
    router.replace(route.query.redirect || '/')
  } catch (err) {
    error.value = err.response?.data?.message || 'GitHub 登录失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}
.error {
  color: var(--color-error);
}
</style>
