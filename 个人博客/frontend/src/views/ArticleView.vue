<template>
  <div class="article-page">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else-if="article">
      <article class="article">
        <header class="article-header">
          <h1>{{ article.title }}</h1>
          <div class="meta">
            <span class="author">
              <img v-if="article.author_avatar" :src="article.author_avatar" class="avatar" />
              <span v-else class="avatar-placeholder">{{ (article.author_name || '?')[0] }}</span>
              {{ article.author_name || '匿名' }}
            </span>
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <span class="stats">👁 {{ article.view_count }} · ❤ {{ article.like_count }}</span>
          </div>
        </header>
        <div class="article-body">
          <aside class="toc" v-if="toc.length">
            <h3>目录</h3>
            <nav>
              <a v-for="h in toc" :key="h.id" :href="`#${h.id}`" :class="{ active: activeHeading === h.id }">{{ h.text }}</a>
            </nav>
          </aside>
          <div class="article-content-wrapper" ref="contentRef">
            <MarkdownRenderer :content="article?.content || ''" />
          </div>
        </div>
        <div class="article-actions">
          <button class="like-btn" :class="{ liked: article.liked }" @click="toggleLike">
            ❤ {{ article.like_count }}
          </button>
          <RouterLink v-if="authStore.user?.id === article.author_id" :to="`/edit/${article.id}`" class="edit-btn">编辑</RouterLink>
        </div>
      </article>
      <section class="comments">
        <h2>评论 ({{ commentCount }})</h2>
        <CommentList :comments="comments" :on-submit-reply="addComment" :on-delete="deleteComment" />
        <CommentForm v-if="authStore.isLoggedIn" :on-submit="(content) => addComment(content, 0)" placeholder="写下你的评论..." />
        <p v-else class="login-tip">请 <RouterLink to="/login">登录</RouterLink> 后评论</p>
      </section>
    </template>
    <p v-else class="error">文章不存在</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { articles as articlesApi, comments as commentsApi } from '../api'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import CommentList from '../components/CommentList.vue'
import CommentForm from '../components/CommentForm.vue'

const route = useRoute()
const authStore = useAuthStore()
const article = ref(null)
const loading = ref(true)
const comments = ref([])
const contentRef = ref(null)
const activeHeading = ref('')

const commentCount = computed(() => {
  const count = (arr) => arr.reduce((n, c) => n + 1 + (c.replies ? count(c.replies) : 0), 0)
  return count(comments.value)
})

const toc = computed(() => {
  if (!article.value?.content) return []
  const headings = []
  const regex = /^(#{1,4})\s+(.+)$/gm
  let m
  while ((m = regex.exec(article.value.content)) !== null) {
    const level = m[1].length
    const text = m[2].trim()
    const id = text.replace(/\s/g, '-').toLowerCase()
    headings.push({ id, text, level })
  }
  return headings
})


async function loadArticle() {
  loading.value = true
  try {
    const { data } = await articlesApi.get(route.params.slug)
    article.value = data
    loadComments()
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  if (!article.value) return
  const { data } = await commentsApi.list(article.value.id)
  comments.value = data
}

async function toggleLike() {
  if (!authStore.isLoggedIn) return
  try {
    const { data } = await articlesApi.like(article.value.id)
    article.value.liked = data.liked
    article.value.like_count = data.like_count
  } catch {}
}

async function addComment(content, parentId = 0) {
  await commentsApi.create(article.value.id, { content, parent_id: parentId })
  await loadComments()
}

async function deleteComment(id) {
  await commentsApi.delete(id)
  await loadComments()
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleString('zh-CN')
}

function handleScroll() {
  const wrapper = contentRef.value
  if (!wrapper) return
  const headings = wrapper.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
  if (!headings.length) return
  for (let i = headings.length - 1; i >= 0; i--) {
    const rect = headings[i].getBoundingClientRect()
    if (rect.top <= 120) {
      activeHeading.value = headings[i].id
      return
    }
  }
}

onMounted(() => {
  loadArticle()
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.article-page {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .article-page {
    grid-template-columns: 1fr 240px;
  }
  .article-body {
    grid-column: 1;
  }
  .toc {
    grid-column: 2;
    position: sticky;
    top: 100px;
  }
}

.article {
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  padding: 2rem;
}

.article-header h1 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.avatar, .avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 0.5rem;
}
.avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-accent);
}

.article-body {
  margin-top: 1.5rem;
}

.toc {
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 1rem;
  border: 1px solid var(--color-border);
}
.toc h3 {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-muted);
}
.toc nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.toc a {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.toc a:hover, .toc a.active {
  color: var(--color-accent);
}

.article-content {
  line-height: 1.8;
}

.article-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.like-btn {
  padding: 0.5rem 1rem;
  background: var(--color-surface-hover);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}
.like-btn:hover, .like-btn.liked {
  color: var(--color-error);
}

.edit-btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface-hover);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.edit-btn:hover {
  color: var(--color-accent);
}

.comments {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}
.comments h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.login-tip {
  color: var(--color-text-muted);
  margin-top: 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .article {
    padding: 1rem;
  }
  .toc {
    display: none;
  }
}
</style>
