import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow, CompletedCardRow } from '../../lib/db';
import { toUser } from '../../lib/transform';
import { setCors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const { familyName, userName } = req.body ?? {};
  if (!familyName || !userName) {
    res.status(400).json({ error: 'familyName and userName are required' });
    return;
  }

  const { rows: families } = await sql`SELECT id FROM families WHERE name = ${familyName}`;
  if (!families[0]) { res.status(404).json({ error: 'Family not found' }); return; }

  const { rows: users } = await sql<UserRow>`
    SELECT * FROM users WHERE family_id = ${families[0].id} AND name = ${userName}
  `;
  if (!users[0]) { res.status(404).json({ error: 'User not found' }); return; }

  const { rows: completedCards } = await sql<CompletedCardRow>`
    SELECT * FROM completed_cards WHERE user_id = ${users[0].id} ORDER BY completed_at DESC
  `;

  res.json({ user: toUser(users[0], completedCards) });
}
