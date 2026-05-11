import express from 'express';
import cors from 'cors';
import authRouter      from './routes/auth';
import usersRouter     from './routes/users';
import cardsRouter     from './routes/cards';
import approvalsRouter from './routes/approvals';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth',      authRouter);
app.use('/api/users',     usersRouter);
app.use('/api/cards',     cardsRouter);
app.use('/api/approvals', approvalsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
