import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow, CompletedCardRow } from '../../../lib/db';
import { toUser } from '../../../lib/transform';
import { withParent } from '../../../lib/auth';
import { setCors } from '../../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'PATCH') { res.status(405).end(); return; }

  await withParent(req, res, async (authUser) => {
    const { id } = req.query as { id: string };

    const { rows } = await sql<UserRow>`
      UPDATE users SET balance = 0
      WHERE id = ${id} AND family_id = ${authUser.family_id} AND role = 'kid'
      RETURNING *
    `;
    if (!rows[0]) { res.status(404).json({ error: 'Kid not found' }); return; }

    const { rows: completedCards } = await sql<CompletedCardRow>`
      SELECT * FROM completed_cards WHERE user_id = ${id} ORDER BY completed_at DESC
    `;

    res.json(toUser(rows[0], completedCards));
  });
}
