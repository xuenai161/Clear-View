import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  githubState: () => api.get('/auth/github/state'),
  githubCallback: (code, state) => api.post('/auth/github/callback', { code, state }),
  me: () => api.get('/auth/me'),
}

export const articles = {
  list: (params) => api.get('/articles', { params }),
  get: (slug) => api.get(`/articles/${slug}`),
  getById: (id) => api.get(`/articles/by-id/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`),
  like: (id) => api.post(`/articles/${id}/like`),
  categories: () => api.get('/articles/meta/categories'),
  tags: () => api.get('/articles/meta/tags'),
}

export const comments = {
  list: (articleId) => api.get(`/comments/article/${articleId}`),
  create: (articleId, data) => api.post(`/comments/article/${articleId}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
}

export const messages = {
  list: () => api.get('/messages'),
  create: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`),
}

export default api
