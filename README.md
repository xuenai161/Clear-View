# 个人博客系统

基于 Vue 3 + Vite 的前后端分离个人博客，支持用户注册登录、GitHub OAuth、文章管理、点赞评论、留言、代码高亮与目录导航，具备移动端适配。

## 技术栈

- **前端**: Vue 3、Vue Router 4、Pinia、Vite、Markdown-it、Highlight.js
- **后端**: Node.js、Express、SQLite (better-sqlite3)、JWT、bcrypt

## 快速开始

### 1. 后端

```bash
cd backend
npm install
cp .env.example .env   # 编辑 .env 配置 JWT_SECRET、GITHUB_CLIENT_ID 等
npm run seed          # 初始化示例数据（可选，admin@blog.com / 123456）
npm run dev           # 启动开发服务器 http://localhost:3000
```

### 2. 前端

```bash
cd frontend
npm install
cp .env.example .env   # 如需 GitHub 登录，配置 VITE_GITHUB_CLIENT_ID
npm run dev           # 启动开发服务器 http://localhost:5173
```

### 3. GitHub OAuth 配置

1. 打开 [GitHub Developer Settings](https://github.com/settings/developers)
2. 新建 OAuth App，Authorization callback URL 填写：`http://localhost:5173/github-callback`
3. 将 Client ID 填入前端 `.env` 的 `VITE_GITHUB_CLIENT_ID`
4. 将 Client ID 和 Client Secret 填入后端 `.env` 的 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`

## 功能特性

- ✅ 用户注册 / 登录
- ✅ GitHub OAuth 登录
- ✅ 文章列表、详情、创建、编辑、删除
- ✅ 文章点赞
- ✅ 评论（支持回复）
- ✅ 留言板
- ✅ Markdown 渲染 + 代码高亮
- ✅ 文章目录导航
- ✅ 移动端响应式布局

## 项目结构

```
个人博客/
├── backend/           # 后端 API
│   ├── src/
│   │   ├── routes/    # 路由
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── index.js
│   └── package.json
├── frontend/          # Vue 3 前端
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── api/
│   │   ├── stores/
│   │   └── router/
│   └── package.json
└── README.md
```
