import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, SubtaskRow } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';
import { setCors } from '../../../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'PATCH') { res.status(405).end(); return; }

  await withAuth(req, res, async (user) => {
    const { id, subtaskId } = req.query as { id: string; subtaskId: string };
    const { done } = req.body ?? {};

    const { rows: cards } = await sql`
      SELECT id FROM cards
      WHERE id = ${id} AND family_id = ${user.family_id} AND state = 'taken' AND taken_by = ${user.id}
    `;
    if (!cards[0]) { res.status(403).json({ error: 'אין גישה' }); return; }

    const { rows } = await sql<SubtaskRow>`
      UPDATE subtasks SET done = ${done}
      WHERE id = ${subtaskId} AND card_id = ${id}
      RETURNING *
    `;
    if (!rows[0]) { res.status(404).json({ error: 'Subtask not found' }); return; }

    res.json({ id: rows[0].id, text: rows[0].text, done: rows[0].done });
  });
}
