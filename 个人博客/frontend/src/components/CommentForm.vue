<template>
  <div class="comment-form">
    <textarea v-model="content" :placeholder="placeholder" rows="3"></textarea>
    <button class="submit-btn" :disabled="!content.trim() || submitting" @click="submit">发送</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  onSubmit: { type: Function, required: true },
  placeholder: { type: String, default: '写下你的评论...' },
})

const content = ref('')
const submitting = ref(false)

async function submit() {
  const text = content.value.trim()
  if (!text || submitting.value) return
  submitting.value = true
  try {
    await props.onSubmit(text)
    content.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.comment-form {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-form textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  resize: vertical;
}

.submit-btn {
  align-self: flex-end;
  padding: 0.4rem 1rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
