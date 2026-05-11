import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';
import { toCard } from '../../../lib/transform';
import { fetchCard } from '../../../lib/queries';
import { setCors } from '../../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'PATCH') { res.status(405).end(); return; }

  await withAuth(req, res, async (user) => {
    const { id } = req.query as { id: string };
    const { state } = req.body ?? {};

    if (state === 'taken') {
      const { rowCount } = await sql`
        UPDATE cards SET state = 'taken', taken_by = ${user.id}
        WHERE id = ${id} AND family_id = ${user.family_id} AND state = 'available'
      `;
      if (!rowCount) { res.status(409).json({ error: 'הכרטיס כבר נלקח' }); return; }
      res.json(toCard((await fetchCard(id, user.family_id))!));
      return;
    }

    if (state === 'pending') {
      let rowCount: number | null;
      if (user.role === 'kid') {
        ({ rowCount } = await sql`
          UPDATE cards SET state = 'pending'
          WHERE id = ${id} AND family_id = ${user.family_id} AND state = 'taken' AND taken_by = ${user.id}
        `);
      } else {
        ({ rowCount } = await sql`
          UPDATE cards SET state = 'pending'
          WHERE id = ${id} AND family_id = ${user.family_id}
        `);
      }
      if (!rowCount) { res.status(403).json({ error: 'אין גישה' }); return; }
      res.json(toCard((await fetchCard(id, user.family_id))!));
      return;
    }

    if (state === 'available') {
      if (user.role === 'kid') {
        const { rowCount } = await sql`
          UPDATE cards SET state = 'available', taken_by = NULL
          WHERE id = ${id} AND family_id = ${user.family_id} AND state = 'taken' AND taken_by = ${user.id}
        `;
        if (!rowCount) { res.status(403).json({ error: 'אין גישה' }); return; }
      } else {
        const { rowCount } = await sql`
          UPDATE cards SET state = 'available', taken_by = NULL
          WHERE id = ${id} AND family_id = ${user.family_id}
        `;
        if (!rowCount) { res.status(404).json({ error: 'Card not found' }); return; }
      }
      await sql`UPDATE subtasks SET done = FALSE WHERE card_id = ${id}`;
      res.json(toCard((await fetchCard(id, user.family_id))!));
      return;
    }

    if (state === 'suspended') {
      if (user.role !== 'parent') { res.status(403).json({ error: 'אין גישה' }); return; }
      const { rowCount } = await sql`
        UPDATE cards SET state = 'suspended'
        WHERE id = ${id} AND family_id = ${user.family_id}
      `;
      if (!rowCount) { res.status(404).json({ error: 'Card not found' }); return; }
      res.json(toCard((await fetchCard(id, user.family_id))!));
      return;
    }

    res.status(400).json({ error: 'Invalid state' });
  });
}
