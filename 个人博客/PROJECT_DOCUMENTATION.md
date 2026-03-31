# 个人博客系统项目文档

## 项目概述

个人博客系统是一个全栈Web应用程序，允许用户注册、登录、撰写和管理博客文章，同时支持评论、留言、点赞和GitHub OAuth登录。项目采用前后端分离架构，前端使用Vue 3构建，后端使用Node.js和Express框架，数据库使用SQLite。

**核心功能**：
- 用户注册、登录（含密码和GitHub OAuth）
- 博客文章的创建、编辑、删除、查看
- 文章分类、标签、封面图片
- 评论系统（支持回复）
- 留言板
- 文章点赞功能
- Markdown渲染与代码高亮
- 响应式设计，支持移动端

## 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **HTTP客户端**: Axios
- **Markdown渲染**: Markdown-it
- **代码高亮**: Highlight.js
- **样式**: 原生CSS

### 后端
- **运行时**: Node.js (ES Modules)
- **Web框架**: Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (JSON Web Tokens)
- **密码哈希**: bcryptjs
- **OAuth**: Passport.js + passport-github2
- **Markdown解析**: marked
- **环境变量**: dotenv

### 开发与部署
- **版本控制**: Git
- **包管理**: npm
- **前端代理**: Vite开发服务器代理API请求
- **数据库**: 文件型SQLite，无需额外服务

## 项目结构

```
个人博客/
├── backend/                    # 后端API服务
│   ├── src/
│   │   ├── middleware/        # 中间件（认证等）
│   │   ├── routes/           # API路由
│   │   ├── db.js            # 数据库连接和模式
│   │   ├── index.js         # Express应用入口
│   │   └── seed.js          # 种子数据脚本
│   ├── .env.example          # 环境变量示例
│   └── package.json
├── frontend/                  # Vue 3前端应用
│   ├── src/
│   │   ├── api/             # API请求封装
│   │   ├── components/      # 可复用组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── views/           # 页面组件
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 应用入口
│   ├── .env.example          # 环境变量示例
│   ├── vite.config.js       # Vite配置
│   └── package.json
├── .gitignore
├── README.md                 # 项目快速入门指南
└── PROJECT_DOCUMENTATION.md  # 本文档
```

## 数据库设计

数据库使用SQLite，通过[db.js](file:///c:/前端/个人博客/backend/src/db.js)文件初始化以下表结构：

### users 用户表
- `id`: 主键，自增
- `username`: 用户名，唯一
- `email`: 邮箱，唯一
- `password`: 密码哈希（可为空，用于GitHub登录用户）
- `avatar`: 头像URL
- `github_id`: GitHub用户ID，唯一
- `created_at`: 创建时间

### articles 文章表
- `id`: 主键，自增
- `title`: 文章标题
- `slug`: URL友好标识，唯一
- `content`: Markdown内容
- `excerpt`: 文章摘要
- `cover_image`: 封面图片URL
- `author_id`: 作者ID，外键关联users(id)
- `category`: 分类
- `tags`: 标签（逗号分隔）
- `view_count`: 浏览量
- `like_count`: 点赞数
- `published`: 是否发布（1发布，0草稿）
- `created_at`, `updated_at`: 时间戳

### comments 评论表
- `id`: 主键，自增
- `article_id`: 文章ID，外键（可为空，表示留言板评论）
- `user_id`: 用户ID，外键
- `content`: 评论内容
- `parent_id`: 父评论ID（用于回复）
- `created_at`: 创建时间

### messages 留言表
- `id`: 主键，自增
- `user_id`: 用户ID，外键
- `content`: 留言内容
- `parent_id`: 父留言ID
- `created_at`: 创建时间

### likes 点赞表
- `id`: 主键，自增
- `article_id`: 文章ID，外键
- `user_id`: 用户ID，外键
- `created_at`: 点赞时间
- 唯一约束：`(article_id, user_id)` 防止重复点赞

**索引**：
- `idx_articles_author`: 文章作者索引
- `idx_articles_slug`: 文章slug索引
- `idx_comments_article`: 评论文章索引
- `idx_likes_article`: 点赞文章索引

## API设计

后端提供RESTful API，所有API前缀为`/api`。主要端点：

### 认证相关 (`/api/auth`)
- `POST /register`: 用户注册
- `POST /login`: 用户登录
- `POST /github/callback`: GitHub OAuth回调
- `GET /me`: 获取当前用户信息（需认证）

### 文章相关 (`/api/articles`)
- `GET /`: 获取文章列表（支持分页、分类、标签过滤）
- `GET /:slug`: 获取单篇文章
- `POST /`: 创建文章（需认证）
- `PUT /:id`: 更新文章（需认证，仅作者）
- `DELETE /:id`: 删除文章（需认证，仅作者）
- `POST /:id/like`: 点赞/取消点赞文章（需认证）

### 评论相关 (`/api/comments`)
- `GET /`: 获取评论列表（可按文章过滤）
- `POST /`: 创建评论（需认证）
- `DELETE /:id`: 删除评论（需认证，仅作者）

### 留言相关 (`/api/messages`)
- `GET /`: 获取留言列表
- `POST /`: 创建留言（需认证）
- `DELETE /:id`: 删除留言（需认证，仅作者）

**认证方式**：JWT令牌通过`Authorization: Bearer <token>`请求头传递。

## 前端架构

### 路由与导航
路由配置在[router/index.js](file:///c:/前端/个人博客/frontend/src/router/index.js)中，使用Vue Router 4的history模式。路由守卫检查认证状态：
- `meta.auth: true`：需要登录才能访问（如写文章、编辑）
- `meta.guest: true`：仅未登录用户可访问（如登录、注册页面）

### 状态管理
使用Pinia管理全局状态，主要store：
- [auth store](file:///c:/前端/个人博客/frontend/src/stores/auth.js)：管理用户认证状态，包括用户信息、JWT令牌、登录状态。状态持久化到localStorage。

### API层
[api/index.js](file:///c:/前端/个人博客/frontend/src/api/index.js)创建Axios实例，配置请求/响应拦截器：
- 请求拦截器：自动添加JWT令牌到请求头
- 响应拦截器：处理401未授权错误，自动跳转到登录页

### 组件结构
- **页面组件 (views/)**: 对应路由页面（HomeView, ArticleView, LoginView等）
- **通用组件 (components/)**: 可复用UI组件（AppHeader, AppFooter, MarkdownRenderer等）

### 样式与主题
- 全局样式在[styles/main.css](file:///c:/前端/个人博客/frontend/src/styles/main.css)中定义
- 使用CSS变量实现主题一致性
- 响应式设计，支持移动端

## 认证与授权

### 认证流程
1. **密码登录**: 用户提交邮箱密码 → 后端验证 → 返回JWT令牌
2. **GitHub OAuth**: 前端跳转GitHub授权 → GitHub回调前端 → 前端传递code到后端 → 后端交换access_token → 获取用户信息 → 返回JWT令牌

### JWT实现
- 令牌使用HS256算法签名，密钥来自环境变量`JWT_SECRET`
- 有效期为7天
- 令牌内容包含用户ID：`{ id: userId }`

### 中间件
[auth.js](file:///c:/前端/个人博客/backend/src/middleware/auth.js)提供两个中间件：
- `authMiddleware`: 严格认证，无令牌返回401
- `optionalAuth`: 可选认证，有有效令牌时设置`req.user`，无令牌继续执行

### 授权规则
- **文章操作**: 用户只能编辑/删除自己的文章
- **评论/留言**: 用户只能删除自己的评论/留言
- **点赞**: 用户只能对自己的文章点赞一次（通过唯一约束保证）

## 关键实现细节

### 1. Markdown渲染与代码高亮
前端使用Markdown-it解析Markdown，Highlight.js高亮代码块。`MarkdownRenderer`组件将原始Markdown转换为HTML，并应用样式。

### 2. 文章slug生成
文章创建时自动从标题生成URL友好的slug（如"My Article" → "my-article"），确保唯一性。

### 3. 评论树形结构
评论表使用`parent_id`字段实现树形结构，前端递归渲染形成回复链。

### 4. 点赞优化
点赞操作使用数据库唯一约束防止重复，同时自动更新文章的`like_count`计数器。

### 5. 分页与过滤
文章列表API支持分页参数（`page`, `limit`）和过滤参数（`category`, `tag`, `author`）。

### 6. 错误处理
统一错误处理中间件，返回结构化的错误响应：
```json
{ "message": "错误描述" }
```

### 7. 安全措施
- 密码使用bcryptjs哈希存储（10轮salt）
- JWT令牌防止篡改
- SQL参数化查询防止注入
- CORS配置限制来源

## 部署配置

### 环境变量
**后端 (.env)**:
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FRONTEND_URL=http://localhost:5173
```

**前端 (.env)**:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GITHUB_CLIENT_ID=your-github-client-id  # 仅前端GitHub登录需要
```

### 生产部署建议
1. **后端**:
   - 使用PM2或Docker容器化部署
   - 配置Nginx反向代理
   - 使用PostgreSQL/MySQL替代SQLite（需修改db.js）
   - 设置强密码的JWT_SECRET

2. **前端**:
   - 运行`npm run build`生成静态文件
   - 部署到Nginx/Apache/CDN
   - 配置API代理或直接指向后端域名

3. **数据库**:
   - 定期备份SQLite文件
   - 考虑迁移到客户端-服务器数据库以支持并发

## 运行与开发指南

### 开发环境启动
1. **启动后端**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # 编辑配置
   npm run dev  # 开发服务器: http://localhost:3000
   ```

2. **启动前端**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # 如需GitHub登录
   npm run dev  # 开发服务器: http://localhost:5173
   ```

3. **初始化数据**（可选）:
   ```bash
   cd backend
   npm run seed  # 创建示例用户(admin@blog.com/123456)和文章
   ```

### 测试用户
- 邮箱: `admin@blog.com`
- 密码: `123456`

### GitHub OAuth配置
1. 在GitHub开发者设置中创建OAuth App
2. 回调URL: `http://localhost:5173/github-callback`
3. 将Client ID和Secret分别填入前后端.env文件

## 如何描述该项目

### 简洁描述
"一个全栈个人博客系统，采用Vue 3 + Node.js + SQLite技术栈，支持用户认证、文章管理、评论点赞、GitHub OAuth登录和Markdown渲染。"

### 详细描述
"这是一个前后端分离的个人博客平台，前端使用Vue 3构建，提供响应式用户界面；后端基于Express框架，提供RESTful API。系统实现了完整的用户认证体系（包括密码登录和GitHub OAuth）、博客文章的CRUD操作、树形评论系统、留言板和点赞功能。采用JWT进行无状态认证，SQLite作为数据库，支持Markdown写作和代码高亮。项目结构清晰，代码模块化，便于二次开发和部署。"

### 技术亮点
- **现代化前端**: Vue 3 Composition API + Pinia状态管理
- **完整认证**: JWT + GitHub OAuth双模式
- **Markdown支持**: 实时渲染 + 代码高亮
- **响应式设计**: 移动端友好
- **数据库优化**: 索引 + 外键约束
- **API设计**: RESTful + 统一错误处理

## 深入理解项目的内容

### 架构决策分析
1. **为什么选择SQLite？**
   - 项目规模适合文件型数据库
   - 零配置，便于开发和部署
   - 对于个人博客的读写频率足够
   - 未来可无缝迁移到其他关系数据库

2. **前后端分离的优势**
   - 前端可独立部署和更新
   - 后端API可被多种客户端复用
   - 开发团队可并行工作
   - 技术栈可独立演进

3. **JWT vs Session**
   - JWT无状态，适合RESTful API
   - 无需服务器存储会话
   - 易于横向扩展
   - 令牌可包含用户基本信息

### 代码质量特征
1. **模块化设计**
   - 路由按功能分离
   - 中间件可复用
   - 组件职责单一

2. **错误处理一致性**
   - 所有API返回统一格式的错误响应
   - 前端统一拦截HTTP错误
   - 数据库操作异常被捕获并转换

3. **安全考虑**
   - 密码哈希存储
   - SQL参数化查询
   - CORS配置
   - 输入验证

### 扩展可能性
1. **功能扩展**
   - 文章搜索功能（集成Elasticsearch）
   - 用户关注/订阅系统
   - 文章收藏功能
   - 多语言支持

2. **性能优化**
   - 文章列表分页缓存
   - 图片CDN加速
   - 数据库查询优化
   - 前端组件懒加载

3. **部署增强**
   - Docker容器化
   - CI/CD流水线
   - 监控和日志收集
   - 自动备份策略

### 学习要点
1. **全栈开发流程**
   - 从数据库设计到前端展示的完整链路
   - API设计规范和实践
   - 前后端数据流管理

2. **现代前端技术**
   - Vue 3 Composition API使用
   - Pinia状态管理
   - Vue Router导航守卫
   - 组件化开发思想

3. **后端最佳实践**
   - Express中间件体系
   - JWT认证实现
   - 数据库迁移和种子数据
   - 错误处理和日志

4. **工程化思维**
   - 项目结构组织
   - 环境变量配置
   - 开发/生产环境差异处理
   - 代码版本管理

### 常见问题与解决方案
1. **GitHub OAuth回调失败**
   - 检查前端回调URL与GitHub设置一致
   - 确认环境变量正确设置
   - 查看后端日志获取详细错误信息

2. **数据库锁问题（SQLite并发）**
   - 使用连接池（better-sqlite3默认处理）
   - 避免长时间事务
   - 考虑迁移到PostgreSQL

3. **前端路由刷新404**
   - 配置Nginx/Apache将所有请求重定向到index.html
   - 使用Vue Router的history模式需要服务器支持

4. **JWT令牌过期**
   - 前端拦截401响应，自动跳转登录
   - 可考虑实现refresh token机制

---

*文档最后更新: 2026-03-06*  
*项目版本: 1.0.0*