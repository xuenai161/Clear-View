import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const oauthStates = new Map();

function createOauthState() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

// 获取 GitHub OAuth state（防 CSRF）
router.get('/github/state', (req, res) => {
  const state = createOauthState();
  oauthStates.set(state, Date.now() + 10 * 60 * 1000);
  res.json({ state });
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(username, email, hashedPassword);

    const user = db
      .prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    res.status(500).json({ message: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ message: '邮箱或密码错误' });
    if (!user.password) {
      return res.status(401).json({ message: '该账号使用 GitHub 登录，请使用 GitHub 登录' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: '邮箱或密码错误' });

    const { password: _pw, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GitHub OAuth：前端拿到 code 后调用此接口交换 token 并获取用户信息
router.post('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    if (!code) return res.status(400).json({ message: '缺少授权码' });
    if (!state) return res.status(400).json({ message: '缺少 state 参数' });
    const stateExpiresAt = oauthStates.get(state);
    oauthStates.delete(state);
    if (!stateExpiresAt || stateExpiresAt < Date.now()) {
      return res.status(400).json({ message: 'OAuth state 无效或已过期' });
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(400).json({ message: '后端未配置 GitHub OAuth' });
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || 'GitHub 授权失败' });
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userRes.json();
    if (!githubUser?.id) return res.status(400).json({ message: '获取 GitHub 用户信息失败' });

    const githubId = String(githubUser.id);
    let user = db.prepare('SELECT * FROM users WHERE github_id = ?').get(githubId);
    if (!user) {
      const username = githubUser.login;
      const email = githubUser.email || `${githubId}@github.user`;
      const avatar = githubUser.avatar_url;
      db.prepare('INSERT INTO users (username, email, avatar, github_id) VALUES (?, ?, ?, ?)')
        .run(username, email, avatar, githubId);
      user = db.prepare('SELECT * FROM users WHERE github_id = ?').get(githubId);
    }

    const { password: _pw, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const user = db
    .prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json(user);
});

export default router;

