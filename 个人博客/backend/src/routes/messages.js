import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取留言列表
router.get('/', (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.username, u.avatar
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
  `).all();

  const buildTree = (items, parentId = 0) => {
    return items
      .filter(m => m.parent_id === parentId)
      .map(m => ({
        ...m,
        replies: buildTree(items, m.id),
      }));
  };

  res.json(buildTree(messages));
});

// 添加留言
router.post('/', authMiddleware, (req, res) => {
  const { content, parent_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: '留言内容不能为空' });

  const result = db.prepare('INSERT INTO messages (user_id, content, parent_id) VALUES (?, ?, ?)').run(req.user.id, content.trim(), parent_id || 0);

  const message = db.prepare(`
    SELECT m.*, u.username, u.avatar FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(message);
});

// 删除留言
router.delete('/:id', authMiddleware, (req, res) => {
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!message) return res.status(404).json({ message: '留言不存在' });
  if (message.user_id !== req.user.id) return res.status(403).json({ message: '无权限' });

  db.prepare('DELETE FROM messages WHERE id = ? OR parent_id = ?').run(req.params.id, req.params.id);
  res.json({ message: '删除成功' });
});

export default router;
