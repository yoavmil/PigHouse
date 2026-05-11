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

// GET /api/cards/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const card = await Card.findOne({ _id: req.params['id'], familyId: user.familyId });
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  res.json(card.toJSON());
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
  const { title, price, state, subtasks } = req.body;

  const card = await Card.findOneAndUpdate(
    { _id: req.params['id'], familyId: user.familyId },
    {
      title,
      price,
      ...(state !== undefined ? { state, ...(state === 'available' ? { takenBy: null } : {}) } : {}),
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

// PATCH /api/cards/:id/state
router.patch('/:id/state', async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const { state } = req.body as { state: string };

  if (state === 'taken') {
    const card = await Card.findOneAndUpdate(
      { _id: req.params['id'], familyId: user.familyId, state: 'available' },
      { state: 'taken', takenBy: user._id },
      { new: true }
    );
    if (!card) { res.status(409).json({ error: 'הכרטיס כבר נלקח' }); return; }
    res.json(card.toJSON());
    return;
  }

  if (state === 'pending') {
    // Kid who holds the card marks it done; parents can also override
    const filter = user.role === 'kid'
      ? { _id: req.params['id'], familyId: user.familyId, state: 'taken', takenBy: user._id }
      : { _id: req.params['id'], familyId: user.familyId };
    const card = await Card.findOneAndUpdate(filter, { state: 'pending' }, { new: true });
    if (!card) { res.status(403).json({ error: 'אין גישה' }); return; }
    res.json(card.toJSON());
    return;
  }

  // Parent-only: suspended / available
  if (!['suspended', 'available'].includes(state)) {
    res.status(400).json({ error: 'Invalid state' });
    return;
  }
  const card = await Card.findOneAndUpdate(
    { _id: req.params['id'], familyId: user.familyId },
    { state, ...(state === 'available' ? { takenBy: null } : {}) },
    { new: true }
  );
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  res.json(card.toJSON());
});

// PATCH /api/cards/:id/subtasks/:subtaskId — toggle done (kid who holds the card only)
router.patch('/:id/subtasks/:subtaskId', async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const { done } = req.body as { done: boolean };

  const card = await Card.findOne({
    _id:      req.params['id'],
    familyId: user.familyId,
    state:    'taken',
    takenBy:  user._id,
  });
  if (!card) { res.status(403).json({ error: 'אין גישה' }); return; }

  const subtask = card.subtasks.find(s => (s as any)._id.toString() === req.params['subtaskId']);
  if (!subtask) { res.status(404).json({ error: 'Subtask not found' }); return; }

  subtask.done = done;
  await card.save();

  res.json({ id: (subtask as any)._id.toString(), text: subtask.text, done: subtask.done });
});

export default router;
