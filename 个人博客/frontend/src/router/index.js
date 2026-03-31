import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue'), meta: { title: '首页' } },
  { path: '/article/:slug', name: 'Article', component: () => import('../views/ArticleView.vue'), meta: { title: '文章' } },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { title: '登录', guest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue'), meta: { title: '注册', guest: true } },
  { path: '/write', name: 'Write', component: () => import('../views/WriteView.vue'), meta: { title: '写文章', auth: true } },
  { path: '/edit/:id', name: 'Edit', component: () => import('../views/EditView.vue'), meta: { title: '编辑文章', auth: true } },
  { path: '/message', name: 'Message', component: () => import('../views/MessageView.vue'), meta: { title: '留言板' } },
  { path: '/github-callback', name: 'GitHubCallback', component: () => import('../views/GitHubCallbackView.vue'), meta: { title: '登录中' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'
  const authStore = useAuthStore()
  if (to.meta.auth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
