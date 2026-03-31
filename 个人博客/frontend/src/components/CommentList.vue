<template>
  <div class="comment-list">
    <div v-for="c in comments" :key="c.id" class="comment">
      <div class="comment-header">
        <img v-if="c.avatar" :src="c.avatar" class="avatar" />
        <span v-else class="avatar-placeholder">{{ (c.username || '?')[0] }}</span>
        <span class="username">{{ c.username || '匿名' }}</span>
        <span class="date">{{ formatDate(c.created_at) }}</span>
        <button v-if="authStore.user?.id === c.user_id" class="delete-btn" @click="onDelete(c.id)">删除</button>
      </div>
      <p class="content">{{ c.content }}</p>
      <button v-if="authStore.isLoggedIn" class="reply-btn" @click="replyingTo = replyingTo === c.id ? null : c.id">回复</button>
      <CommentForm v-if="replyingTo === c.id" :on-submit="(content) => { onSubmitReply(content, c.id); replyingTo = null }" placeholder="回复..." />
      <div v-if="c.replies?.length" class="replies">
        <CommentList :comments="c.replies" :on-submit-reply="onSubmitReply" :on-delete="onDelete" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import CommentForm from './CommentForm.vue'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  onSubmitReply: { type: Function },
  onDelete: { type: Function },
})

const authStore = useAuthStore()
const replyingTo = ref(null)

function onSubmitReply(content, parentId) {
  props.onSubmitReply?.(content, parentId)
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleString('zh-CN')
}
</script>

<style scoped>
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.avatar, .avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-accent);
  font-size: 0.9rem;
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
  margin: 0.5rem 0;
  line-height: 1.6;
}

.reply-btn {
  font-size: 0.85rem;
  color: var(--color-accent);
}

.replies {
  margin-top: 0.75rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
}
</style>
