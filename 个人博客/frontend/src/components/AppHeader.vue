<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">个人博客</RouterLink>
      <button class="nav-toggle" aria-label="菜单" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" :class="{ open: mobileMenuOpen }">
        <RouterLink to="/" @click="mobileMenuOpen = false">首页</RouterLink>
        <RouterLink to="/message" @click="mobileMenuOpen = false">留言</RouterLink>
        <template v-if="authStore.isLoggedIn">
          <RouterLink to="/write" @click="mobileMenuOpen = false">写文章</RouterLink>
          <div class="user-menu">
            <RouterLink to="/" class="user-avatar" @click="mobileMenuOpen = false">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user.username" />
              <span v-else>{{ (authStore.user?.username || 'U')[0] }}</span>
            </RouterLink>
            <button class="logout-btn" @click="handleLogout">退出</button>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" @click="mobileMenuOpen = false">登录</RouterLink>
          <RouterLink to="/register" class="btn-primary" @click="mobileMenuOpen = false">注册</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

function handleLogout() {
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.logo:hover {
  color: var(--color-accent);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 0.5rem;
}
.nav-toggle span {
  width: 22px;
  height: 2px;
  background: var(--color-text);
  border-radius: 1px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav a {
  color: var(--color-text-muted);
  font-weight: 500;
}
.nav a:hover, .nav a.router-link-active {
  color: var(--color-accent);
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-bg) !important;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
}
.btn-primary:hover {
  background: var(--color-accent-dim);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-accent);
  font-weight: 600;
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logout-btn {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.logout-btn:hover {
  color: var(--color-error);
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
    gap: 0.5rem;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s;
  }
  .nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
