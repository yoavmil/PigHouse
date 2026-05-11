import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';

const router = Router();

router.use(authMiddleware);

// GET /api/users — list all kids in the family
router.get('/', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const kids = await User.find({ familyId: user.familyId, role: 'kid' }).sort({ name: 1 });
  res.json(kids.map(k => k.toJSON()));
});

// PATCH /api/users/:id/pay — reset a kid's balance to 0
router.patch('/:id/pay', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const kid = await User.findOneAndUpdate(
    { _id: req.params['id'], familyId: user.familyId, role: 'kid' },
    { balance: 0 },
    { new: true }
  );
  if (!kid) { res.status(404).json({ error: 'Kid not found' }); return; }
  res.json(kid.toJSON());
});

export default router;
