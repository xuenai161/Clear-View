<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>登录</h1>
      <form @submit.prevent="handleLogin" class="auth-form">
        <input v-model="email" type="email" placeholder="邮箱" required />
        <input v-model="password" type="password" placeholder="密码" required />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">登录</button>
      </form>
      <div class="divider">或</div>
      <a :href="githubAuthUrl" class="github-btn" @click.prevent="startGithubLogin">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        使用 GitHub 登录
      </a>
      <p class="tip">还没有账号？<RouterLink to="/register">注册</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { auth as authApi } from '../api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const githubAuthUrl = computed(() => {
  if (!GITHUB_CLIENT_ID) return '#'
  const redirect = `${window.location.origin}/github-callback`
  const state = localStorage.getItem('github_oauth_state') || ''
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=user:email&state=${encodeURIComponent(state)}`
})

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await authApi.login({ email: email.value, password: password.value })
    authStore.setAuth(data.user, data.token)
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function startGithubLogin() {
  if (!GITHUB_CLIENT_ID) {
    error.value = '未配置 GitHub Client ID'
    return
  }
  try {
    const { data } = await authApi.githubState()
    localStorage.setItem('github_oauth_state', data.state)
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/github-callback`)}&scope=user:email&state=${encodeURIComponent(data.state)}`
  } catch {
    error.value = '获取 GitHub 登录状态失败，请稍后再试'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  padding: 2rem;
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.auth-form input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
}

.auth-form button {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-weight: 600;
}
.auth-form button:disabled {
  opacity: 0.6;
}

.error {
  color: var(--color-error);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.divider {
  text-align: center;
  color: var(--color-text-muted);
  margin: 1rem 0;
  font-size: 0.9rem;
}

.github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}
.github-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tip {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
</style>
