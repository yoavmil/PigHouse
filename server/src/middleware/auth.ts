import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

export interface AuthRequest extends Request {
  user: InstanceType<typeof User>;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  (req as AuthRequest).user = user;
  next();
}

export function requireRole(role: 'parent' | 'kid') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
