<template>
  <div class="home">
    <div class="hero">
      <h1>欢迎来到我的博客</h1>
      <p>记录技术、分享思考</p>
    </div>
    <div class="filters" v-if="categories.length || tags.length">
      <select v-model="filterCategory" @change="loadArticles">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterTag" @change="loadArticles">
        <option value="">全部标签</option>
        <option v-for="t in tags" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
    <div class="article-list" v-if="!loading">
      <article v-for="a in articles" :key="a.id" class="article-card">
        <RouterLink :to="`/article/${a.slug}`" class="article-link">
          <h2>{{ a.title }}</h2>
          <p class="excerpt">{{ a.excerpt || a.content?.slice(0, 120) + '...' }}</p>
          <div class="meta">
            <span class="author">
              <img v-if="a.author_avatar" :src="a.author_avatar" class="avatar" />
              <span v-else class="avatar-placeholder">{{ (a.author_name || '?')[0] }}</span>
              {{ a.author_name || '匿名' }}
            </span>
            <span class="date">{{ formatDate(a.created_at) }}</span>
            <span class="stats">👁 {{ a.view_count }} · ❤ {{ a.like_count }}</span>
          </div>
        </RouterLink>
      </article>
      <p v-if="!articles.length" class="empty">暂无文章</p>
    </div>
    <div v-else class="loading">加载中...</div>
    <div class="pagination" v-if="total > limit">
      <button :disabled="page <= 1" @click="page--; loadArticles()">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total / limit) }}</span>
      <button :disabled="page >= Math.ceil(total / limit)" @click="page++; loadArticles()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articles as articlesApi } from '../api'

const articles = ref([])
const loading = ref(true)
const page = ref(1)
const limit = 10
const total = ref(0)
const categories = ref([])
const tags = ref([])
const filterCategory = ref('')
const filterTag = ref('')

async function loadArticles() {
  loading.value = true
  try {
    const { data } = await articlesApi.list({
      page: page.value,
      limit,
      category: filterCategory.value || undefined,
      tag: filterTag.value || undefined,
    })
    articles.value = data.articles
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function loadMeta() {
  try {
    const [catRes, tagRes] = await Promise.all([
      articlesApi.categories(),
      articlesApi.tags(),
    ])
    categories.value = catRes.data
    tags.value = tagRes.data
  } catch {}
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadArticles()
  loadMeta()
})
</script>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 2.5rem;
}
.hero h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.hero p {
  color: var(--color-text-muted);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.filters select {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: border-color 0.2s;
}
.article-card:hover {
  border-color: var(--color-accent);
}

.article-link {
  display: block;
  padding: 1.25rem;
  color: inherit;
}

.article-link h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
.article-link:hover h2 {
  color: var(--color-accent);
}

.excerpt {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.avatar, .avatar-placeholder {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 0.25rem;
}
.avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-accent);
  font-size: 0.75rem;
}

.empty, .loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.pagination button {
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 1.5rem;
  }
  .filters {
    flex-direction: column;
  }
}
</style>
