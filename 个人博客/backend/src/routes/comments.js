import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取文章评论
router.get('/article/:articleId', (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.articleId);

  const buildTree = (items, parentId = 0) => {
    return items
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        ...c,
        replies: buildTree(items, c.id),
      }));
  };

  res.json(buildTree(comments));
});

// 添加文章评论
router.post('/article/:articleId', authMiddleware, (req, res) => {
  const { content, parent_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: '评论内容不能为空' });

  const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.articleId);
  if (!article) return res.status(404).json({ message: '文章不存在' });

  const result = db.prepare(`
    INSERT INTO comments (article_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)
  `).run(req.params.articleId, req.user.id, content.trim(), parent_id || 0);

  const comment = db.prepare(`
    SELECT c.*, u.username, u.avatar FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(comment);
});

// 删除评论
router.delete('/:id', authMiddleware, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ message: '评论不存在' });
  if (comment.user_id !== req.user.id) return res.status(403).json({ message: '无权限' });

  db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').run(req.params.id, req.params.id);
  res.json({ message: '删除成功' });
});

export default router;
