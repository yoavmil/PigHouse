import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow } from './db';

export async function withAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: (user: UserRow) => Promise<void>
): Promise<void> {
  const userId = req.headers['x-user-id'] as string | undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { rows } = await sql<UserRow>`SELECT * FROM users WHERE id = ${userId}`;
  if (!rows[0]) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  await handler(rows[0]);
}

export async function withParent(
  req: VercelRequest,
  res: VercelResponse,
  handler: (user: UserRow) => Promise<void>
): Promise<void> {
  await withAuth(req, res, async (user) => {
    if (user.role !== 'parent') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await handler(user);
  });
}
