import { Router, Request, Response } from 'express';
import { Family } from '../models/family.model';
import { User } from '../models/user.model';

const router = Router();

// POST /api/auth/register — create a new family + first parent account
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { familyName, parentName } = req.body;

  if (!familyName || !parentName) {
    res.status(400).json({ error: 'familyName and parentName are required' });
    return;
  }

  const existing = await Family.findOne({ name: familyName });
  if (existing) {
    res.status(409).json({ error: 'Family already exists' });
    return;
  }

  const family = await Family.create({ name: familyName });
  const user   = await User.create({ familyId: family._id, name: parentName, role: 'parent' });

  res.status(201).json({ user: user.toJSON() });
});

// POST /api/auth/login — look up a family member by name
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { familyName, userName } = req.body;

  if (!familyName || !userName) {
    res.status(400).json({ error: 'familyName and userName are required' });
    return;
  }

  const family = await Family.findOne({ name: familyName });
  if (!family) {
    res.status(404).json({ error: 'Family not found' });
    return;
  }

  const user = await User.findOne({ familyId: family._id, name: userName });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: user.toJSON() });
});

export default router;
