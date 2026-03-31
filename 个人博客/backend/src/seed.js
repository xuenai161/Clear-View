import db from './db.js';
import bcrypt from 'bcryptjs';

const password = bcrypt.hashSync('123456', 10);
db.prepare(`
  INSERT OR IGNORE INTO users (id, username, email, password) VALUES (1, 'admin', 'admin@blog.com', ?)
`).run(password);

const demoArticle = `# 欢迎来到我的博客

这是一篇示例文章，展示 **Markdown** 的渲染效果。

## 代码高亮

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
hello();
\`\`\`

## 列表

- 项目一
- 项目二
- 项目三

## 引用

> 这是一段引用文字。
`;

const exists = db.prepare('SELECT id FROM articles WHERE author_id = 1').get();
if (!exists) {
  db.prepare(`
    INSERT INTO articles (title, slug, content, excerpt, author_id, category, tags)
    VALUES (?, ?, ?, ?, 1, '未分类', '示例,Markdown')
  `).run('欢迎来到我的博客', 'welcome-' + Date.now(), demoArticle, '这是一篇示例文章，展示 Markdown 的渲染效果。');
}

console.log('Seed completed.');
