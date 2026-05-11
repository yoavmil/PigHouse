import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow, CompletedCardRow } from '../../../lib/db';
import { withParent } from '../../../lib/auth';
import { toCard, toUser } from '../../../lib/transform';
import { fetchCard } from '../../../lib/queries';
import { setCors } from '../../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).end(); return; }

  await withParent(req, res, async (authUser) => {
    const { id } = req.query as { id: string };

    const { rows: cards } = await sql`
      SELECT * FROM cards
      WHERE id = ${id} AND family_id = ${authUser.family_id} AND state = 'pending'
    `;
    if (!cards[0]) { res.status(404).json({ error: 'Card not found or not pending' }); return; }

    const card = cards[0];
    if (!card.taken_by) { res.status(400).json({ error: 'No kid assigned to card' }); return; }

    const { rows: kids } = await sql<UserRow>`
      UPDATE users SET balance = balance + ${card.price}
      WHERE id = ${card.taken_by}
      RETURNING *
    `;
    if (!kids[0]) { res.status(404).json({ error: 'Kid not found' }); return; }

    await sql`
      INSERT INTO completed_cards (user_id, card_id, card_title, amount)
      VALUES (${card.taken_by}, ${id}, ${card.title}, ${card.price})
    `;

    await sql`UPDATE cards SET state = 'suspended', taken_by = NULL WHERE id = ${id}`;
    await sql`UPDATE subtasks SET done = FALSE WHERE card_id = ${id}`;

    const updatedCard = await fetchCard(id, authUser.family_id);
    const { rows: completedCards } = await sql<CompletedCardRow>`
      SELECT * FROM completed_cards WHERE user_id = ${card.taken_by} ORDER BY completed_at DESC
    `;

    res.json({ card: toCard(updatedCard!), updatedUser: toUser(kids[0], completedCards) });
  });
}
