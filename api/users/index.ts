import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow, CompletedCardRow } from '../../lib/db';
import { toUser } from '../../lib/transform';
import { withParent } from '../../lib/auth';
import { setCors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'GET') { res.status(405).end(); return; }

  await withParent(req, res, async (authUser) => {
    const { rows: kids } = await sql<UserRow>`
      SELECT * FROM users
      WHERE family_id = ${authUser.family_id} AND role = 'kid'
      ORDER BY name
    `;

    const result = await Promise.all(kids.map(async (kid: UserRow) => {
      const { rows: completedCards } = await sql<CompletedCardRow>`
        SELECT * FROM completed_cards WHERE user_id = ${kid.id} ORDER BY completed_at DESC
      `;
      return toUser(kid, completedCards);
    }));

    res.json(result);
  });
}
