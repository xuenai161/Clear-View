<template>
  <div class="write-page">
    <h1>写文章</h1>
    <form @submit.prevent="handleSubmit" class="write-form">
      <input v-model="form.title" placeholder="标题" required />
      <input v-model="form.category" placeholder="分类（如：技术）" />
      <input v-model="form.tags" placeholder="标签，逗号分隔（如：Vue,JavaScript）" />
      <textarea v-model="form.content" placeholder="正文（支持 Markdown）" rows="20" required></textarea>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <button type="submit" :disabled="loading">发布</button>
        <RouterLink to="/" class="cancel">取消</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { articles as articlesApi } from '../api'

const router = useRouter()
const form = ref({
  title: '',
  content: '',
  category: '未分类',
  tags: '',
})
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await articlesApi.create(form.value)
    router.push(`/article/${data.slug}`)
  } catch (err) {
    error.value = err.response?.data?.message || '发布失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.write-page h1 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.write-form input,
.write-form textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.write-form textarea {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.actions button {
  padding: 0.6rem 1.5rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-weight: 600;
}
.actions button:disabled {
  opacity: 0.6;
}

.cancel {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-error);
  margin-bottom: 0.5rem;
}
</style>
