import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../../lib/db';
import { withAuth, withParent } from '../../../lib/auth';
import { toCard } from '../../../lib/transform';
import { fetchCard } from '../../../lib/queries';
import { setCors } from '../../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    await withAuth(req, res, async (user) => {
      const card = await fetchCard(id, user.family_id);
      if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
      res.json(toCard(card));
    });
    return;
  }

  if (req.method === 'PUT') {
    await withParent(req, res, async (user) => {
      const { title, price, state, subtasks } = req.body ?? {};

      const existing = await fetchCard(id, user.family_id);
      if (!existing) { res.status(404).json({ error: 'Card not found' }); return; }

      await sql`UPDATE cards SET title = ${title}, price = ${price} WHERE id = ${id}`;

      if (state === 'available') {
        await sql`UPDATE cards SET state = 'available', taken_by = NULL WHERE id = ${id}`;
      } else if (state !== undefined) {
        await sql`UPDATE cards SET state = ${state} WHERE id = ${id}`;
      }

      await sql`DELETE FROM subtasks WHERE card_id = ${id}`;
      const tasks: { text: string }[] = subtasks ?? [];
      for (let i = 0; i < tasks.length; i++) {
        await sql`INSERT INTO subtasks (card_id, text, position) VALUES (${id}, ${tasks[i].text}, ${i})`;
      }

      const card = await fetchCard(id, user.family_id);
      res.json(toCard(card!));
    });
    return;
  }

  if (req.method === 'DELETE') {
    await withParent(req, res, async (user) => {
      const { rowCount } = await sql`
        DELETE FROM cards WHERE id = ${id} AND family_id = ${user.family_id}
      `;
      if (!rowCount) { res.status(404).json({ error: 'Card not found' }); return; }
      res.status(204).end();
    });
    return;
  }

  res.status(405).end();
}
