import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';

const router = Router();

router.use(authMiddleware);

// POST /api/approvals/:id/approve
router.post('/:id/approve', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;

  const card = await Card.findOne({ _id: req.params['id'], familyId: user.familyId, state: 'pending' });
  if (!card) { res.status(404).json({ error: 'Card not found or not pending' }); return; }

  const kid = await User.findById(card.takenBy);
  if (!kid) { res.status(404).json({ error: 'Kid not found' }); return; }

  kid.balance += card.price;
  (kid.completedCards as any[]).push({
    cardId:      card._id,
    cardTitle:   card.title,
    amount:      card.price,
    completedAt: new Date(),
  });
  await kid.save();

  (card.completionHistory as any[]).push({
    kidId:       kid._id,
    kidName:     kid.name,
    price:       card.price,
    completedAt: new Date(),
  });
  card.state   = 'suspended';
  card.takenBy = null;
  card.subtasks.forEach(s => { s.done = false; });
  await card.save();

  res.json({ card: card.toJSON(), updatedUser: kid.toJSON() });
});

export default router;
