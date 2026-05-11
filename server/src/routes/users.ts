import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET  /api/users
// POST /api/users
// GET  /api/users/:id/history

router.get('/',    (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/',   (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/:id/history', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
