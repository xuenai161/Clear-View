<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>注册</h1>
      <form @submit.prevent="handleRegister" class="auth-form">
        <input v-model="username" type="text" placeholder="用户名" required />
        <input v-model="email" type="email" placeholder="邮箱" required />
        <input v-model="password" type="password" placeholder="密码（至少6位）" required minlength="6" />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">注册</button>
      </form>
      <p class="tip">已有账号？<RouterLink to="/login">登录</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { auth as authApi } from '../api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await authApi.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    authStore.setAuth(data.user, data.token)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || '注册失败'
  } finally {
    loading.value = false
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

.tip {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
</style>
