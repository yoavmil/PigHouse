import express from 'express';
import cors from 'cors';
import authRouter      from './routes/auth';
import usersRouter     from './routes/users';
import cardsRouter     from './routes/cards';
import approvalsRouter from './routes/approvals';

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yoavmil.github.io']
  : ['http://localhost:4200'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth',      authRouter);
app.use('/api/users',     usersRouter);
app.use('/api/cards',     cardsRouter);
app.use('/api/approvals', approvalsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
