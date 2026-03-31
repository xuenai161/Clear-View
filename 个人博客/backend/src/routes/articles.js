import express from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 生成 slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// 获取文章列表
router.get('/', optionalAuth, (req, res) => {
  const { page = 1, limit = 10, category, tag } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE published = 1';
  const params = [];
  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (tag) {
    where += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  const articles = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM articles ${where}`).get(...params);
  res.json({ articles, total: total.count });
});

// 根据 ID 获取文章（用于编辑，需登录）
router.get('/by-id/:id', authMiddleware, (req, res) => {
  const article = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!article) return res.status(404).json({ message: '文章不存在' });
  if (article.author_id !== req.user.id) return res.status(403).json({ message: '无权限' });

  const like = db.prepare('SELECT id FROM likes WHERE article_id = ? AND user_id = ?').get(article.id, req.user.id);
  res.json({ ...article, liked: !!like });
});

// 获取单篇文章
router.get('/:slug', optionalAuth, (req, res) => {
  const article = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.slug = ? AND a.published = 1
  `).get(req.params.slug);

  if (!article) return res.status(404).json({ message: '文章不存在' });

  // 增加阅读量
  db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(article.id);

  let liked = false;
  if (req.user) {
    const like = db.prepare('SELECT id FROM likes WHERE article_id = ? AND user_id = ?').get(article.id, req.user.id);
    liked = !!like;
  }

  res.json({ ...article, view_count: article.view_count + 1, liked });
});

// 创建文章
router.post('/', authMiddleware, (req, res) => {
  const { title, content, excerpt, cover_image, category, tags } = req.body;
  if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });

  const slug = slugify(title) + '-' + Date.now();
  db.prepare(`
    INSERT INTO articles (title, slug, content, excerpt, cover_image, author_id, category, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, slug, content, excerpt || '', cover_image || '', req.user.id, category || '未分类', tags || '');

  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug);
  res.status(201).json(article);
});

// 更新文章
router.put('/:id', authMiddleware, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ message: '文章不存在' });
  if (article.author_id !== req.user.id) return res.status(403).json({ message: '无权限' });

  const { title, content, excerpt, cover_image, category, tags, published } = req.body;
  db.prepare(`
    UPDATE articles SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      excerpt = COALESCE(?, excerpt),
      cover_image = COALESCE(?, cover_image),
      category = COALESCE(?, category),
      tags = COALESCE(?, tags),
      published = COALESCE(?, published),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content, excerpt, cover_image, category, tags, published, req.params.id);

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// 删除文章
router.delete('/:id', authMiddleware, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ message: '文章不存在' });
  if (article.author_id !== req.user.id) return res.status(403).json({ message: '无权限' });

  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM comments WHERE article_id = ?').run(req.params.id);
  db.prepare('DELETE FROM likes WHERE article_id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

// 点赞
router.post('/:id/like', authMiddleware, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ message: '文章不存在' });

  try {
    db.prepare('INSERT INTO likes (article_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
    db.prepare('UPDATE articles SET like_count = like_count + 1 WHERE id = ?').run(req.params.id);
    const updated = db.prepare('SELECT like_count FROM articles WHERE id = ?').get(req.params.id);
    res.json({ liked: true, like_count: updated.like_count });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      db.prepare('DELETE FROM likes WHERE article_id = ? AND user_id = ?').run(req.params.id, req.user.id);
      db.prepare('UPDATE articles SET like_count = like_count - 1 WHERE id = ?').run(req.params.id);
      const updated = db.prepare('SELECT like_count FROM articles WHERE id = ?').get(req.params.id);
      return res.json({ liked: false, like_count: updated.like_count });
    }
    throw err;
  }
});

// 获取分类列表
router.get('/meta/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM articles WHERE published = 1').all();
  res.json(rows.map(r => r.category));
});

// 获取标签列表
router.get('/meta/tags', (req, res) => {
  const rows = db.prepare("SELECT tags FROM articles WHERE published = 1 AND tags != ''").all();
  const tags = new Set();
  rows.forEach(r => (r.tags || '').split(',').forEach(t => t.trim() && tags.add(t.trim())));
  res.json([...tags]);
});

export default router;
