import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET    /api/cards
// POST   /api/cards
// PUT    /api/cards/:id
// DELETE /api/cards/:id
// PATCH  /api/cards/:id/state
// PATCH  /api/cards/:id/subtasks/:subtaskId

router.get('/',    (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/',   (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.put('/:id', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.delete('/:id', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.patch('/:id/state', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.patch('/:id/subtasks/:subtaskId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
