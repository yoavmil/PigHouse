import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET  /api/approvals
// POST /api/approvals/:id/approve
// POST /api/approvals/:id/reject

router.get('/',                  (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/approve',      (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/reject',       (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
