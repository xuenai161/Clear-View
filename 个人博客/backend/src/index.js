import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import commentRoutes from './routes/comments.js';
import messageRoutes from './routes/messages.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '请求过于频繁，请稍后再试' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`博客 API 运行在 http://localhost:${PORT}`);
});
