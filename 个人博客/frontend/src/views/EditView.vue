<template>
  <div class="edit-page">
    <div v-if="loading">加载中...</div>
    <template v-else-if="article">
      <h1>编辑文章</h1>
      <form @submit.prevent="handleSubmit" class="write-form">
        <input v-model="form.title" placeholder="标题" required />
        <input v-model="form.category" placeholder="分类" />
        <input v-model="form.tags" placeholder="标签，逗号分隔" />
        <textarea v-model="form.content" placeholder="正文" rows="20" required></textarea>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="actions">
          <button type="submit" :disabled="saving">保存</button>
          <RouterLink :to="`/article/${article.slug}`" class="cancel">取消</RouterLink>
        </div>
      </form>
    </template>
    <p v-else class="error">文章不存在</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articles as articlesApi } from '../api'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const form = ref({ title: '', content: '', category: '', tags: '' })

async function loadArticle() {
  const id = route.params.id
  try {
    const { data } = await articlesApi.getById(id)
    article.value = data
    form.value = {
      title: data.title,
      content: data.content,
      category: data.category || '未分类',
      tags: (data.tags || '').toString(),
    }
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await articlesApi.update(article.value.id, form.value)
    router.push(`/article/${article.value.slug}`)
  } catch (err) {
    error.value = err.response?.data?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadArticle)
</script>

<style scoped>
.edit-page h1 {
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
