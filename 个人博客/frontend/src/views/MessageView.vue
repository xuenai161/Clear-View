<template>
  <div class="message-page">
    <h1>留言板</h1>
    <p class="desc">在这里留下你的想法</p>
    <CommentForm v-if="authStore.isLoggedIn" :on-submit="addMessage" placeholder="写下你的留言..." />
    <p v-else class="login-tip">请 <RouterLink to="/login">登录</RouterLink> 后留言</p>
    <div class="message-list">
      <div v-for="m in messages" :key="m.id" class="message">
        <div class="message-header">
          <img v-if="m.avatar" :src="m.avatar" class="avatar" />
          <span v-else class="avatar-placeholder">{{ (m.username || '?')[0] }}</span>
          <span class="username">{{ m.username || '匿名' }}</span>
          <span class="date">{{ formatDate(m.created_at) }}</span>
          <button v-if="authStore.user?.id === m.user_id" class="delete-btn" @click="deleteMessage(m.id)">删除</button>
        </div>
        <p class="content">{{ m.content }}</p>
        <div v-if="m.replies?.length" class="replies">
          <div v-for="r in m.replies" :key="r.id" class="reply">
            <div class="message-header">
              <img v-if="r.avatar" :src="r.avatar" class="avatar" />
              <span v-else class="avatar-placeholder">{{ (r.username || '?')[0] }}</span>
              <span class="username">{{ r.username }}</span>
              <span class="date">{{ formatDate(r.created_at) }}</span>
              <button v-if="authStore.user?.id === r.user_id" class="delete-btn" @click="deleteMessage(r.id)">删除</button>
            </div>
            <p class="content">{{ r.content }}</p>
          </div>
        </div>
      </div>
      <p v-if="!messages.length && !loading" class="empty">暂无留言</p>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { messages as messagesApi } from '../api'
import CommentForm from '../components/CommentForm.vue'

const authStore = useAuthStore()
const messages = ref([])
const loading = ref(true)

async function loadMessages() {
  try {
    const { data } = await messagesApi.list()
    messages.value = data
  } finally {
    loading.value = false
  }
}

async function addMessage(content) {
  await messagesApi.create({ content })
  await loadMessages()
}

async function deleteMessage(id) {
  await messagesApi.delete(id)
  await loadMessages()
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleString('zh-CN')
}

onMounted(loadMessages)
</script>

<style scoped>
.message-page h1 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.desc {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.login-tip {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.message {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.avatar, .avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-accent);
  font-size: 1rem;
}

.username {
  font-weight: 500;
}
.date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-left: auto;
}

.delete-btn {
  font-size: 0.8rem;
  color: var(--color-error);
}

.content {
  line-height: 1.6;
  margin: 0.5rem 0;
}

.replies {
  margin-top: 0.75rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
}

.reply {
  margin-bottom: 0.5rem;
}

.empty, .loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
}
</style>
