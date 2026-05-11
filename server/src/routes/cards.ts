import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { Card } from '../models/card.model';

const router = Router();

router.use(authMiddleware);

// GET /api/cards — list all cards for the family
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const cards = await Card.find({ familyId: user.familyId }).sort({ createdAt: 1 });
  res.json(cards.map(c => c.toJSON()));
});

// POST /api/cards — create a new card
router.post('/', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const { title, price, subtasks } = req.body;

  const card = await Card.create({
    familyId: user.familyId,
    title:    title   ?? '',
    price:    price   ?? 10,
    subtasks: (subtasks ?? []).map((t: { text: string }) => ({ text: t.text, done: false })),
    state:    'available',
  });
  res.status(201).json(card.toJSON());
});

// PUT /api/cards/:id — replace title, price and subtasks
router.put('/:id', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const { title, price, subtasks } = req.body;

  const card = await Card.findOneAndUpdate(
    { _id: req.params['id'], familyId: user.familyId },
    {
      title,
      price,
      subtasks: (subtasks ?? []).map((t: { text: string }) => ({ text: t.text, done: false })),
    },
    { new: true }
  );

  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  res.json(card.toJSON());
});

// DELETE /api/cards/:id
router.delete('/:id', requireRole('parent'), async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const card = await Card.findOneAndDelete({ _id: req.params['id'], familyId: user.familyId });
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  res.status(204).send();
});

// PATCH /api/cards/:id/state — (state transitions — to be implemented later)
router.patch('/:id/state', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

// PATCH /api/cards/:id/subtasks/:subtaskId — (subtask toggle — to be implemented later)
router.patch('/:id/subtasks/:subtaskId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
